// Source: ARTi. Read straight from Supabase `arti_events` — the product's own
// ops API sits behind a separate password we don't hold, and the raw table has
// more detail anyway.

import { sbSelect } from "../supabase";
import {
  average,
  dayAxis,
  deviceOf,
  LANG_LABEL,
  median,
  pct,
  percentile,
  rangeStart,
  shanghaiDay,
  type RangeKey,
} from "../time";
import { RANGE_LABEL } from "../time";
import type { Breakdown, DayPoint, DurationBucket, SourcePayload, UsageRow, UserRow } from "../types";

type Row = {
  id: number;
  ts: string;
  event_name: string;
  user_id: string | null;
  session_id: string | null;
  page: string | null;
  lang: string | null;
  country: string | null;
  city: string | null;
  ua: string | null;
  params: Record<string, unknown> | null;
};

const EVENT_LIMIT = 20000;

const EVENT_LABEL: Record<string, string> = {
  page_view: "浏览页面",
  mode_switch: "切换模式",
  quick_request: "发起提问",
  chat_request: "对话请求",
  auth_code_sent: "获取验证码",
  auth_login_success: "登录成功",
  auth_register_success: "注册成功",
  backend_login_success: "后台登录",
  backend_login_failed: "后台登录失败",
};

// Ops + auth steps are not product usage; everything else counts as "used".
const NON_USAGE = new Set([
  "page_view",
  "auth_code_sent",
  "auth_login_success",
  "auth_register_success",
  "backend_login_success",
  "backend_login_failed",
]);

const BUCKETS: { label: string; max: number }[] = [
  { label: "<10s", max: 10 },
  { label: "10–30s", max: 30 },
  { label: "30–60s", max: 60 },
  { label: "1–3m", max: 180 },
  { label: "3–10m", max: 600 },
  { label: ">10m", max: Infinity },
];

function top(map: Map<string, number>, n: number): Breakdown[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, label: key, count }));
}

function shortId(value: string | null): string {
  if (!value) return "—";
  return value.length > 10 ? `${value.slice(0, 4)}…${value.slice(-4)}` : value;
}

function detailOf(row: Row): string {
  const params = row.params ?? {};
  for (const key of ["mode", "question", "conversation_id", "target", "path"]) {
    const value = params[key];
    if (typeof value === "string" && value) return value.slice(0, 48);
  }
  return row.page ?? "—";
}

export async function loadArti(range: RangeKey, now = Date.now()): Promise<SourcePayload> {
  const from = rangeStart(range, now);
  const params: Record<string, string> = {
    select: "id,ts,event_name,user_id,session_id,page,lang,country,city,ua,params",
    order: "ts.desc",
  };
  if (from) params.ts = `gte.${from.toISOString()}`;
  const { rows, truncated } = await sbSelect<Row>("arti_events", params, EVENT_LIMIT);

  type Session = {
    key: string;
    userId: string | null;
    first: number;
    last: number;
    events: number;
    used: boolean;
    loggedIn: boolean;
    lang: string;
    country: string;
    device: string;
    lastAction: string;
  };

  const sessions = new Map<string, Session>();
  const perDay = new Map<string, { visitors: Set<string>; events: number; core: Set<string>; login: Set<string> }>();
  const langCount = new Map<string, number>();
  const countryCount = new Map<string, number>();
  const deviceCount = new Map<string, number>();
  const eventCount = new Map<string, number>();
  const usage: UsageRow[] = [];

  for (const row of rows) {
    const key = row.session_id || row.user_id || `row-${row.id}`;
    const at = new Date(row.ts).getTime();
    const lang = LANG_LABEL[row.lang ?? ""] ?? row.lang ?? "未知";
    const device = deviceOf(row.ua);
    const country = row.country || "未知";

    let session = sessions.get(key);
    if (!session) {
      session = {
        key,
        userId: row.user_id,
        first: at,
        last: at,
        events: 0,
        used: false,
        loggedIn: false,
        lang,
        country,
        device,
        lastAction: "—",
      };
      sessions.set(key, session);
    }
    session.first = Math.min(session.first, at);
    session.last = Math.max(session.last, at);
    session.events += 1;
    if (row.user_id && !session.userId) session.userId = row.user_id;
    if (!NON_USAGE.has(row.event_name)) session.used = true;
    if (row.event_name === "auth_login_success" || row.event_name === "auth_register_success") session.loggedIn = true;
    session.lastAction = EVENT_LABEL[row.event_name] ?? row.event_name;

    eventCount.set(row.event_name, (eventCount.get(row.event_name) ?? 0) + 1);
    langCount.set(lang, (langCount.get(lang) ?? 0) + 1);
    countryCount.set(country, (countryCount.get(country) ?? 0) + 1);
    deviceCount.set(device, (deviceCount.get(device) ?? 0) + 1);

    const day = shanghaiDay(row.ts);
    const bucket = perDay.get(day) ?? { visitors: new Set<string>(), events: 0, core: new Set<string>(), login: new Set<string>() };
    bucket.events += 1;
    bucket.visitors.add(key);
    if (session.used) bucket.core.add(key);
    if (session.loggedIn) bucket.login.add(key);
    perDay.set(day, bucket);

    if (usage.length < 80) {
      usage.push({
        ts: row.ts,
        event: EVENT_LABEL[row.event_name] ?? row.event_name,
        detail: detailOf(row),
        session: shortId(key),
        country,
        device,
        lang,
      });
    }
  }

  const all = [...sessions.values()];
  const durations = all.map((s) => Math.max(0, Math.round((s.last - s.first) / 1000)));
  const buckets: DurationBucket[] = BUCKETS.map((b) => ({ label: b.label, count: 0 }));
  for (const d of durations) {
    const idx = BUCKETS.findIndex((b) => d < b.max);
    buckets[idx === -1 ? BUCKETS.length - 1 : idx].count += 1;
  }

  const usedSessions = all.filter((s) => s.used).length;
  const loginSessions = all.filter((s) => s.loggedIn).length;

  const axis = dayAxis(range, now);
  const daily: DayPoint[] = axis.map((day) => {
    const b = perDay.get(day);
    return {
      day,
      visitors: b?.visitors.size ?? 0,
      events: b?.events ?? 0,
      core: b?.core.size ?? 0,
      login: b?.login.size ?? 0,
    };
  });

  const users: UserRow[] = all
    .sort((a, b) => b.last - a.last)
    .slice(0, 300)
    .map((s) => ({
      id: shortId(s.key),
      label: s.userId ? shortId(s.userId) : "匿名会话",
      firstTs: new Date(s.first).toISOString(),
      lastTs: new Date(s.last).toISOString(),
      durationS: Math.max(0, Math.round((s.last - s.first) / 1000)),
      events: s.events,
      country: s.country,
      device: s.device,
      lang: s.lang,
      identity: s.userId ? "已登录" : "匿名",
      extra: s.lastAction,
    }));

  const lastTs = rows.length ? rows[0].ts : null;
  const ageSec = lastTs ? Math.max(0, Math.round((now - new Date(lastTs).getTime()) / 1000)) : null;
  const today = shanghaiDay(now);

  return {
    src: "arti",
    ok: true,
    range,
    rangeLabel: RANGE_LABEL[range],
    generatedAt: new Date(now).toISOString(),
    kpi: {
      visitors: sessions.size,
      events: rows.length,
      core: usedSessions,
      logins: loginSessions,
      conversion: pct(loginSessions, sessions.size),
      durationP50: median(durations),
    },
    funnel: [
      { key: "visit", label: "访问 ARTi", value: sessions.size, pct: 100 },
      { key: "use", label: "发起使用（提问 / 切模式）", value: usedSessions, pct: pct(usedSessions, sessions.size) },
      { key: "login", label: "注册 / 登录", value: loginSessions, pct: pct(loginSessions, sessions.size) },
    ],
    daily,
    duration: {
      n: durations.length,
      avg: average(durations),
      p50: median(durations),
      p90: percentile(durations, 90),
      buckets,
      stages: [],
    },
    usage,
    users,
    breakdowns: {
      lang: top(langCount, 5),
      country: top(countryCount, 6),
      device: top(deviceCount, 5),
      extra: {
        title: "事件分布",
        items: top(eventCount, 8).map((x) => ({ ...x, label: EVENT_LABEL[x.key] ?? x.key })),
      },
    },
    health: {
      lastTs,
      ageSec,
      todayEvents: perDay.get(today)?.events ?? 0,
      stale: ageSec === null ? true : ageSec > 6 * 3600,
    },
    instrumented: rows.length > 0,
    notes: [
      truncated ? "事件量触顶 2 万行，数字已截断" : "",
      "ARTi 埋点自 2026-10-29 起才有数据，历史口径为空",
      "ARTi 不记录 utm 参数，来源归因暂不可用（12/one 侧的点击仍可统计）",
    ].filter(Boolean),
  };
}
