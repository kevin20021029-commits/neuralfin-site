// Homepage behavioural tracking for the nbti dashboard's "Download" panel.
//
// Three events, all POSTed to the nbti backend: one page view per browser
// session, one record per App Store / Google Play click, and one dwell-time
// sample when the session first leaves. Mounted from the homepage only ("/"
// and "/zh") — never from /scroll, whose results are promised anonymous.
//
// Event names, payload keys and value formats are a contract with the
// backend: event names outside the allowlist return 400, platform values
// other than exact lowercase are dropped by the dashboard, and duration_s
// must match ^[1-9][0-9]*$ or the sample is silently discarded.

export const TRACK_ENDPOINT = "https://nbti.neuralfin.ai/api/event";

export const SITE_EVENTS = {
  pageView: "website_page_view",
  clickStore: "website_click_store",
  sessionLeave: "website_session_leave",
} as const;

export type SiteEventName = (typeof SITE_EVENTS)[keyof typeof SITE_EVENTS];
export type SiteLang = "en" | "zh";
export type StorePlatform = "appstore" | "play";

// Ad-attribution params copied from the landing URL into params.ref under
// their original names. "placement" is kept here, inside ref only; it never
// touches params.placement, which is always the literal "website".
export const REF_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ad",
  "adset",
  "src",
  "pid",
  "creative",
  "placement",
] as const;

export const MAX_DWELL_SECONDS = 1800;
const MAX_URL_LENGTH = 500;
const MAX_UA_LENGTH = 300;
const MAX_REF_VALUE_LENGTH = 200;
const PAGE = "website-home";
const PLACEMENT = "website";

export const STORAGE_KEYS = {
  visitId: "nf_track_visit_id",
  pageViewSent: "nf_track_pv_sent",
  entryTs: "nf_track_entry_ts",
  leaveSent: "nf_track_leave_sent",
  ref: "nf_track_ref",
} as const;

export type RefParams = Partial<Record<(typeof REF_PARAM_KEYS)[number], string>>;

export type SitePayload = {
  event_name: SiteEventName;
  lang: SiteLang;
  page: typeof PAGE;
  url: string;
  ua: string;
  params: {
    session_id: string;
    platform?: StorePlatform;
    placement?: typeof PLACEMENT;
    duration_s?: number;
    ref?: RefParams;
  };
};

export type KeyValueStore = {
  get(key: string): string | null;
  set(key: string, value: string): void;
};

/** sessionStorage, or a per-page in-memory map when storage is blocked. */
export function sessionStore(storage: Storage | undefined): KeyValueStore {
  const memory = new Map<string, string>();
  return {
    get(key) {
      try {
        if (storage) return storage.getItem(key);
      } catch {}
      return memory.get(key) ?? null;
    },
    set(key, value) {
      memory.set(key, value);
      try {
        storage?.setItem(key, value);
      } catch {}
    },
  };
}

export function newVisitId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // Safari < 15.4 has getRandomValues but not randomUUID.
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
  );
}

/**
 * Integer seconds in [1, 1800], or undefined when either timestamp is
 * unusable — the caller then omits duration_s rather than sending NaN/null.
 */
export function dwellSeconds(entryTs: number, leaveTs: number): number | undefined {
  if (!Number.isFinite(entryTs) || !Number.isFinite(leaveTs) || entryTs <= 0) return undefined;
  return Math.min(MAX_DWELL_SECONDS, Math.max(1, Math.round((leaveTs - entryTs) / 1000)));
}

const REPLACEMENT_CHAR = String.fromCharCode(0xfffd);

function isControlChar(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code <= 0x1f || code === 0x7f;
}

function cleanRefValue(value: string): string | undefined {
  // The backend drops any event with U+FFFD in params; URLSearchParams
  // produces it from malformed percent-encoding.
  if (value.includes(REPLACEMENT_CHAR)) return undefined;
  const cleaned = Array.from(value)
    .filter((ch) => !isControlChar(ch))
    .join("")
    .trim()
    .slice(0, MAX_REF_VALUE_LENGTH);
  return cleaned || undefined;
}

export function readRefParams(search: string): RefParams | undefined {
  const query = new URLSearchParams(search);
  const ref: RefParams = {};
  for (const key of REF_PARAM_KEYS) {
    const raw = query.get(key);
    const value = raw === null ? undefined : cleanRefValue(raw);
    if (value !== undefined) ref[key] = value;
  }
  return Object.keys(ref).length > 0 ? ref : undefined;
}

function storedRef(store: KeyValueStore): RefParams | undefined {
  const raw = store.get(STORAGE_KEYS.ref);
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return undefined;
    // Re-validate: sessionStorage is writable by anything on the origin.
    const ref: RefParams = {};
    for (const key of REF_PARAM_KEYS) {
      const value = (parsed as Record<string, unknown>)[key];
      const cleaned = typeof value === "string" ? cleanRefValue(value) : undefined;
      if (cleaned !== undefined) ref[key] = cleaned;
    }
    return Object.keys(ref).length > 0 ? ref : undefined;
  } catch {
    return undefined;
  }
}

export type Transport = (body: string) => void;

/**
 * keepalive fetch, credentials omitted, one silent retry on network failure
 * or 5xx. Not sendBeacon: a beacon is always credentialed, and the endpoint
 * answers the application/json preflight with a wildcard
 * Access-Control-Allow-Origin, which the browser rejects for credentialed
 * requests — sendBeacon then reports success while the POST is never sent,
 * and logs a CORS error. keepalive keeps the request alive through pagehide.
 */
export const fetchTransport: Transport = (body) => {
  const attempt = (retriesLeft: number): void => {
    try {
      fetch(TRACK_ENDPOINT, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body,
      })
        .then((response) => {
          if (response.status >= 500 && retriesLeft > 0) attempt(retriesLeft - 1);
        })
        .catch(() => {
          if (retriesLeft > 0) attempt(retriesLeft - 1);
        });
    } catch {}
  };
  attempt(1);
};

export type TrackerEnv = {
  store: KeyValueStore;
  href: () => string;
  userAgent: string;
  search: string;
  now: () => number;
  transport: Transport;
};

export type SiteTracker = {
  trackStoreClick(platform: StorePlatform): void;
  trackLeave(): void;
};

/**
 * Establishes the session, captures ad params, and fires the page view if
 * this session hasn't sent one. Safe to call more than once per page.
 */
export function startSiteTracking(lang: SiteLang, env: TrackerEnv): SiteTracker {
  const { store } = env;

  let visitId = store.get(STORAGE_KEYS.visitId);
  if (!visitId) {
    visitId = newVisitId();
    store.set(STORAGE_KEYS.visitId, visitId);
  }
  const sessionId = visitId;

  // A later ad landing in the same tab replaces the earlier attribution.
  const landingRef = readRefParams(env.search);
  if (landingRef) store.set(STORAGE_KEYS.ref, JSON.stringify(landingRef));

  const send = (event_name: SiteEventName, params: SitePayload["params"]) => {
    try {
      const payload: SitePayload = {
        event_name,
        lang,
        page: PAGE,
        url: env.href().slice(0, MAX_URL_LENGTH),
        ua: env.userAgent.slice(0, MAX_UA_LENGTH),
        params,
      };
      env.transport(JSON.stringify(payload));
    } catch {}
  };

  if (store.get(STORAGE_KEYS.pageViewSent) !== "1") {
    store.set(STORAGE_KEYS.pageViewSent, "1");
    store.set(STORAGE_KEYS.entryTs, String(env.now()));
    send(SITE_EVENTS.pageView, { session_id: sessionId });
  }

  return {
    trackStoreClick(platform) {
      const ref = storedRef(store);
      send(SITE_EVENTS.clickStore, {
        session_id: sessionId,
        platform,
        placement: PLACEMENT,
        ...(ref ? { ref } : {}),
      });
    },
    trackLeave() {
      if (store.get(STORAGE_KEYS.leaveSent) === "1") return;
      store.set(STORAGE_KEYS.leaveSent, "1");
      const rawEntry = store.get(STORAGE_KEYS.entryTs);
      const duration = dwellSeconds(rawEntry ? Number(rawEntry) : Number.NaN, env.now());
      const ref = storedRef(store);
      send(SITE_EVENTS.sessionLeave, {
        session_id: sessionId,
        ...(duration !== undefined ? { duration_s: duration } : {}),
        ...(ref ? { ref } : {}),
      });
    },
  };
}
