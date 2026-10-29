// Source: 八字财格 page. The page ships no telemetry today (it only talks to
// /api/auth), so this reads the rows it will produce once instrumented and
// renders an honest empty state until then.

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
  ts: string;
  event_name: string;
  lang: string | null;
  country: string | null;
  ua: string | null;
  params: Record<string, string> | null;
};

const EVENT_LABEL: Record<string, string> = {
  bazi_view: "浏览页面",
  bazi_chart_generated: "生成命盘",
  bazi_export: "导出 / 分享",
  bazi_auth_login: "登录成功",
  auth_login_success: "登录成功",
  auth_code_sent: "获取验证码",
};

const NON_USAGE = new Set(["bazi_view", "bazi_auth_login", "auth_login_success", "auth_code_sent"]);

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

function shortId(sid: string | undefined): string {
  if (!sid) return "—";
  return sid.length > 10 ? `${sid.slice(0, 4)}…${sid.slice(-4)}` : sid;
}

export async function loadBazi(range: RangeKey, now = Date.now()): Promise<SourcePayload> {
  const from = rangeStart(range, now);
  const params: Record<string, string> = {
    select: "ts,event_name,lang,country,ua,params",
    or: "(page.eq.bazi,event_name.like.bazi_*)",
    order: "ts.desc",
  };
  if (from) params.ts = `gte.${from.toISOString()}`;
  const { rows } = await sbSelect<Row>("events", params, 20000);

  const notes = [
    "数据来自 bazi/index.html 内联埋点：bazi_view / bazi_chart_generated / bazi_auth_login",
    "登录成功按 /api/auth/login 返回 code=200 计数，与会话内去重",
  ];

  if (!rows.length) {
    return {
      src: "bazi",
      ok: true,
      range,
      rangeLabel: RANGE_LABEL[range],
      generatedAt: new Date(now).toISOString(),
      kpi: { visitors: 0, events: 0, core: 0, logins: 0, conversion: 0, durationP50: 0 },
      funnel: [
        { key: "visit", label: "访问八字页", value: 0, pct: 0 },
        { key: "chart", label: "生成命盘", value: 0, pct: 0 },
        { key: "login", label: "注册 / 登录", value: 0, pct: 0 },
      ],
      daily: dayAxis(range, now).map((day) => ({ day, visitors: 0, events: 0, core: 0, login: 0 })),
      duration: { n: 0, avg: 0, p50: 0, p90: 0, buckets: BUCKETS.map((b) => ({ label: b.label, count: 0 })), stages: [] },
      usage: [],
      users: [],
      breakdowns: { lang: [], country: [], device: [] },
      health: { lastTs: null, ageSec: null, todayEvents: 0, stale: true },
      instrumented: false,
      notes: [
        "八字页已接入埋点，但窗口内还没有收到 bazi_* 事件",
        "第一次打开 /bazi 就会产生 bazi_view；生成命盘与登录成功会自动补齐漏斗",
      ],
    };
  }

  type Session = {
    key: string;
    first: number;
    last: number;
    events: number;
    used: boolean;
    loggedIn: boolean;
    country: string;
    device: string;
    lang: string;
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
    const key = row.params?.session_id || `anon-${row.ts}`;
    const at = new Date(row.ts).getTime();
    const lang = LANG_LABEL[row.lang ?? ""] ?? row.lang ?? "未知";
    const device = deviceOf(row.ua);
    const country = row.country || "未知";

    let session = sessions.get(key);
    if (!session) {
      session = { key, first: at, last: at, events: 0, used: false, loggedIn: false, country, device, lang, lastAction: "—" };
      sessions.set(key, session);
    }
    session.first = Math.min(session.first, at);
    session.last = Math.max(session.last, at);
    session.events += 1;
    if (!NON_USAGE.has(row.event_name)) session.used = true;
    if (row.event_name === "bazi_auth_login" || row.event_name === "auth_login_success") session.loggedIn = true;
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
        detail: row.params?.chart ? "命盘" : "—",
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
  const chartSessions = new Set(
    rows
      .filter((r) => r.event_name === "bazi_chart_generated")
      .map((r) => r.params?.session_id || `anon-${r.ts}`),
  ).size;

  const daily: DayPoint[] = dayAxis(range, now).map((day) => {
    const b = perDay.get(day);
    return { day, visitors: b?.visitors.size ?? 0, events: b?.events ?? 0, core: b?.core.size ?? 0, login: b?.login.size ?? 0 };
  });

  const users: UserRow[] = all
    .sort((a, b) => b.last - a.last)
    .slice(0, 300)
    .map((s) => ({
      id: shortId(s.key),
      label: "匿名会话",
      firstTs: new Date(s.first).toISOString(),
      lastTs: new Date(s.last).toISOString(),
      durationS: Math.max(0, Math.round((s.last - s.first) / 1000)),
      events: s.events,
      country: s.country,
      device: s.device,
      lang: s.lang,
      identity: s.loggedIn ? "已登录" : "匿名",
      extra: s.lastAction,
    }));

  const lastTs = rows[0]?.ts ?? null;
  const ageSec = lastTs ? Math.max(0, Math.round((now - new Date(lastTs).getTime()) / 1000)) : null;
  const today = shanghaiDay(now);

  return {
    src: "bazi",
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
      { key: "visit", label: "访问八字页", value: sessions.size, pct: 100 },
      { key: "chart", label: "生成命盘", value: chartSessions, pct: pct(chartSessions, sessions.size) },
      { key: "login", label: "注册 / 登录", value: loginSessions, pct: pct(loginSessions, sessions.size) },
    ],
    daily,
    duration: { n: durations.length, avg: average(durations), p50: median(durations), p90: percentile(durations, 90), buckets, stages: [] },
    usage,
    users,
    breakdowns: {
      lang: top(langCount, 5),
      country: top(countryCount, 6),
      device: top(deviceCount, 5),
      extra: { title: "事件分布", items: top(eventCount, 8).map((x) => ({ ...x, label: EVENT_LABEL[x.key] ?? x.key })) },
    },
    health: { lastTs, ageSec, todayEvents: perDay.get(today)?.events ?? 0, stale: ageSec === null ? true : ageSec > 6 * 3600 },
    instrumented: true,
    notes,
  };
}
