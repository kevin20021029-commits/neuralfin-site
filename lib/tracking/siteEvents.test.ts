import assert from "node:assert/strict";
import test from "node:test";
import {
  dwellSeconds,
  newVisitId,
  readRefParams,
  sessionStore,
  startSiteTracking,
  STORAGE_KEYS,
  type KeyValueStore,
  type SitePayload,
  type TrackerEnv,
} from "./siteEvents";

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)";

function harness(options: { search?: string; href?: string; store?: KeyValueStore; now?: number } = {}) {
  const sent: SitePayload[] = [];
  let now = options.now ?? 1_700_000_000_000;
  const env: TrackerEnv = {
    store: options.store ?? sessionStore(undefined),
    href: () => options.href ?? `https://www.neuralfin.ai/${options.search ?? ""}`,
    userAgent: UA,
    search: options.search ?? "",
    now: () => now,
    transport: (body) => sent.push(JSON.parse(body)),
  };
  return { env, sent, advance: (ms: number) => (now += ms) };
}

test("page view fires once per session with the exact contract shape", () => {
  const { env, sent } = harness();
  startSiteTracking("en", env);
  startSiteTracking("en", env); // refresh / strict-mode double effect
  startSiteTracking("zh", env); // "/" → "/zh" in the same tab

  assert.equal(sent.length, 1);
  const [pv] = sent;
  assert.deepEqual(Object.keys(pv).sort(), ["event_name", "lang", "page", "params", "ua", "url"]);
  assert.equal(pv.event_name, "website_page_view");
  assert.equal(pv.lang, "en");
  assert.equal(pv.page, "website-home");
  assert.equal(pv.ua, UA);
  assert.deepEqual(Object.keys(pv.params), ["session_id"]);
  assert.match(pv.params.session_id, /^[0-9a-f-]{36}$/);
});

test("a fresh session (new tab) fires its own page view with a new session id", () => {
  const first = harness();
  const second = harness();
  startSiteTracking("en", first.env);
  startSiteTracking("zh", second.env);
  assert.equal(second.sent[0].lang, "zh");
  assert.notEqual(first.sent[0].params.session_id, second.sent[0].params.session_id);
});

test("store clicks: lowercase platform, literal placement, no duration, one record per click", () => {
  const { env, sent } = harness();
  const tracker = startSiteTracking("en", env);
  tracker.trackStoreClick("appstore");
  tracker.trackStoreClick("play");
  tracker.trackStoreClick("appstore");

  const clicks = sent.filter((p) => p.event_name === "website_click_store");
  assert.deepEqual(clicks.map((c) => c.params.platform), ["appstore", "play", "appstore"]);
  for (const click of clicks) {
    assert.equal(click.params.placement, "website");
    assert.equal(click.params.session_id, sent[0].params.session_id);
    assert.equal("duration_s" in click.params, false);
    assert.equal("ref" in click.params, false, "ref is omitted when there are no ad params");
  }
});

test("leave fires exactly once, with integer duration and no platform", () => {
  const { env, sent, advance } = harness();
  const tracker = startSiteTracking("en", env);
  advance(42_400);
  tracker.trackLeave(); // visibilitychange → hidden
  tracker.trackLeave(); // pagehide right after
  advance(60_000);
  startSiteTracking("en", env).trackLeave(); // back to tab, refresh, leave again

  const leaves = sent.filter((p) => p.event_name === "website_session_leave");
  assert.equal(leaves.length, 1);
  assert.equal(leaves[0].params.duration_s, 42);
  assert.equal("platform" in leaves[0].params, false);
  assert.equal("placement" in leaves[0].params, false);
  assert.equal(leaves[0].params.session_id, sent[0].params.session_id);
});

test("dwell is clamped to [1, 1800] integer seconds and never NaN", () => {
  assert.equal(dwellSeconds(1000, 1000), 1);
  assert.equal(dwellSeconds(1000, 1400), 1);
  assert.equal(dwellSeconds(5000, 1000), 1, "a clock step backwards still yields 1");
  assert.equal(dwellSeconds(0, 1000), undefined);
  assert.equal(dwellSeconds(1000, 1000 + 1800_000), 1800);
  assert.equal(dwellSeconds(1000, 1000 + 7 * 3600_000), 1800);
  assert.equal(dwellSeconds(Number.NaN, 1000), undefined);
  assert.equal(dwellSeconds(1000, Number.POSITIVE_INFINITY), undefined);
  for (let ms = 0; ms < 3_000_000; ms += 7919) {
    assert.match(String(dwellSeconds(1, 1 + ms)), /^[1-9][0-9]*$/);
  }
});

test("a missing or corrupt entry timestamp sends the leave without duration_s", () => {
  for (const bad of [null, "", "abc", "0"]) {
    const store = sessionStore(undefined);
    store.set(STORAGE_KEYS.visitId, "v1");
    store.set(STORAGE_KEYS.pageViewSent, "1");
    if (bad !== null) store.set(STORAGE_KEYS.entryTs, bad);
    const { env, sent } = harness({ store });
    startSiteTracking("en", env).trackLeave();
    assert.equal(sent.length, 1);
    assert.equal("duration_s" in sent[0].params, false, `entry ts ${JSON.stringify(bad)}`);
    assert.doesNotMatch(JSON.stringify(sent[0]), /null|NaN/);
  }
});

test("ad params: allowlisted keys only, merged into ref on click and leave but not page view", () => {
  const search = "?utm_source=test&pid=abc123&fbclid=nope&placement=feed_top&email=a%40b.c";
  const { env, sent } = harness({ search });
  const tracker = startSiteTracking("en", env);
  tracker.trackStoreClick("play");
  tracker.trackLeave();

  const [pv, click, leave] = sent;
  assert.equal("ref" in pv.params, false);
  const expected = { utm_source: "test", pid: "abc123", placement: "feed_top" };
  assert.deepEqual(click.params.ref, expected);
  assert.deepEqual(leave.params.ref, expected);
  assert.equal(click.params.placement, "website", "ad placement never overwrites params.placement");
});

test("ad params persist for the session and a later ad landing replaces them", () => {
  const store = sessionStore(undefined);
  startSiteTracking("en", harness({ store, search: "?utm_source=first" }).env);

  const plain = harness({ store });
  startSiteTracking("en", plain.env).trackStoreClick("appstore");
  assert.deepEqual(plain.sent[0].params.ref, { utm_source: "first" });

  const second = harness({ store, search: "?src=second" });
  startSiteTracking("en", second.env).trackStoreClick("appstore");
  assert.deepEqual(second.sent[0].params.ref, { src: "second" });
});

test("ref values carrying U+FFFD or control characters are cleaned or dropped", () => {
  assert.deepEqual(readRefParams("?utm_source=%FF%FE&pid=ok"), { pid: "ok" });
  assert.deepEqual(readRefParams("?utm_term=a%00b%0Ac"), { utm_term: "abc" });
  assert.deepEqual(readRefParams(`?creative=${"x".repeat(900)}`), { creative: "x".repeat(200) });
  assert.equal(readRefParams("?utm_source=&pid=%20"), undefined);

  const store = sessionStore(undefined);
  store.set(STORAGE_KEYS.ref, JSON.stringify({ utm_source: "ok", pid: String.fromCharCode(0xfffd), evil: "x", ad: 5 }));
  const { env, sent } = harness({ store });
  startSiteTracking("en", env).trackStoreClick("play");
  assert.deepEqual(sent[1].params.ref, { utm_source: "ok" });
});

test("url and ua are truncated to the contract limits", () => {
  const { env, sent } = harness({ href: `https://www.neuralfin.ai/?${"q".repeat(900)}` });
  env.userAgent = "U".repeat(700);
  startSiteTracking("en", env);
  assert.equal(sent[0].url.length, 500);
  assert.equal(sent[0].ua.length, 300);
});

test("blocked sessionStorage degrades to per-page memory, and transport failures never throw", () => {
  const throwing = {
    getItem() {
      throw new Error("SecurityError");
    },
    setItem() {
      throw new Error("QuotaExceeded");
    },
  } as unknown as Storage;
  const store = sessionStore(throwing);
  const { env, sent } = harness({ store });
  const tracker = startSiteTracking("en", env);
  tracker.trackLeave();
  tracker.trackLeave();
  assert.deepEqual(sent.map((p) => p.event_name), ["website_page_view", "website_session_leave"]);

  const broken = harness();
  broken.env.transport = () => {
    throw new Error("offline");
  };
  assert.doesNotThrow(() => {
    const t = startSiteTracking("en", broken.env);
    t.trackStoreClick("appstore");
    t.trackLeave();
  });
});

test("fetch transport: credentials omitted, keepalive, one retry at most", async () => {
  const { fetchTransport, TRACK_ENDPOINT } = await import("./siteEvents");
  const calls: RequestInit[] = [];
  const original = globalThis.fetch;
  try {
    globalThis.fetch = ((url: string, init: RequestInit) => {
      assert.equal(url, TRACK_ENDPOINT);
      calls.push(init);
      return Promise.reject(new TypeError("Failed to fetch"));
    }) as typeof fetch;
    fetchTransport('{"a":1}');
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(calls.length, 2, "one original + one retry");
    for (const init of calls) {
      assert.equal(init.credentials, "omit");
      assert.equal(init.keepalive, true);
      assert.equal(init.method, "POST");
      assert.deepEqual(init.headers, { "Content-Type": "application/json" });
    }

    calls.length = 0;
    globalThis.fetch = ((_url: string, init: RequestInit) => {
      calls.push(init);
      return Promise.resolve(new Response(null, { status: 400 }));
    }) as typeof fetch;
    fetchTransport("{}");
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(calls.length, 1, "a 4xx is a rejected payload, not worth retrying");
  } finally {
    globalThis.fetch = original;
  }
});

test("visit ids are v4 UUIDs, including the pre-randomUUID fallback", () => {
  const v4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  assert.match(newVisitId(), v4);
  const original = crypto.randomUUID;
  try {
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
    for (let i = 0; i < 50; i += 1) assert.match(newVisitId(), v4);
  } finally {
    Object.defineProperty(crypto, "randomUUID", { value: original, configurable: true });
  }
});
