// Source: NBTI. Proxied through the product's own /api/stats so the console
// inherits the official 口径 (pure / real-human filtering) instead of
// reimplementing it against raw events.

import { dayAxis, deviceOf, LANG_LABEL, parseShanghai, pct, rangeDays, rangeStart, shanghaiDay, type RangeKey } from "../time";
import { RANGE_LABEL } from "../time";
import { sbSelect } from "../supabase";
import type { Breakdown, DayPoint, DurationStage, SourcePayload, UsageRow, UserRow } from "../types";

const BASE = (process.env.NBTI_BASE ?? "https://nbti.neuralfin.ai").replace(/\/+$/, "");

let cachedToken: { token: string; exp: number } | null = null;

async function dashToken(): Promise<string> {
  if (cachedToken && cachedToken.exp - 60_000 > Date.now()) return cachedToken.token;
  const password = process.env.DASH_PASSWORD ?? "";
  if (!password) throw new Error("dash_password_missing");
  const res = await fetch(`${BASE}/api/dash-login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`nbti_login_${res.status}`);
  const body = (await res.json()) as { token?: string; exp?: number };
  if (!body.token || !body.exp) throw new Error("nbti_login_bad_payload");
  cachedToken = { token: body.token, exp: body.exp };
  return body.token;
}

async function dash<T>(mode: string | null, days: number): Promise<T> {
  const token = await dashToken();
  const qs = new URLSearchParams({ days: String(days) });
  if (mode) qs.set("mode", mode);
  const res = await fetch(`${BASE}/api/stats?${qs.toString()}`, {
    headers: { "X-Dash-Token": token },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (res.status === 401) {
    cachedToken = null;
    throw new Error("nbti_token_rejected");
  }
  if (!res.ok) throw new Error(`nbti_stats_${mode ?? "default"}_${res.status}`);
  return (await res.json()) as T;
}

type StatsShape = {
  daily: { day: string; users: number; events: number }[];
  funnel: Record<string, number>;
  persona: Record<string, number>;
  versions: Record<string, number>;
  countries: Record<string, number>;
  active_users: number;
  total_events: number;
};

type TimesShape = {
  stages: Record<string, { n: number; p50: number; p95: number }>;
  total_ms: Record<string, { n: number; p25: number; p50: number; p75: number; p95: number }>;
};

type AuthShape = {
  kpi: { registered: number; today_new: number; logins: number; unlocked: number; unlock_rate: number; bot_registered: number };
  rows: {
    user_name: string;
    acct_id: string;
    region: string;
    account_type: string;
    persona: string;
    is_new: boolean;
    first_ts: string;
    last_ts: string;
    logins: number;
  }[];
};

type RecentShape = {
  rows: {
    ts: string;
    event_name: string;
    url: string | null;
    lang: string | null;
    country: string | null;
    city: string | null;
    ua: string | null;
    ip: string | null;
    test_version: string | null;
    persona_result: string | null;
  }[];
};

const STAGE_LABEL: Record<string, string> = {
  landing_to_start: "落地 → 开始作答",
  complete_to_card: "答完 → 生成卡片",
};

const EVENT_LABEL: Record<string, string> = {
  page_view: "浏览页面",
  test_start: "开始测试",
  test_progress: "作答中",
  test_completed: "完成测试",
  auth_code_sent: "获取验证码",
  auth_login_success: "登录成功",
  auth_unlock: "解锁报告",
  landing_sharecard_view: "分享卡落地",
  store_click: "商店点击",
  lang_switch: "切换语言",
  ref_landing: "回流落地",
  ref_convert: "回流转化",
  qr_panel_view: "二维码面板",
  app_new_users: "App 新用户",
  rejected_event: "无效事件",
};

function breakdown(record: Record<string, number>, n: number): Breakdown[] {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, label: key, count }));
}

type CampaignRow = {
  ts: string;
  event_name: string;
  url: string | null;
  user_id: string | null;
  ip: string | null;
};

async function loadCampaignArrivals(range: RangeKey, now: number): Promise<CampaignRow[]> {
  const from = rangeStart(range, now);
  const params: Record<string, string> = {
    select: "ts,event_name,url,user_id,ip",
    url: "like.*utm_source=12one*",
    order: "ts.desc",
  };
  if (from) params.ts = `gte.${from.toISOString()}`;
  try {
    const { rows } = await sbSelect<CampaignRow>("events", params, 20000);
    return rows;
  } catch {
    // Attribution is a nice-to-have: never take the whole tab down for it.
    return [];
  }
}

export async function loadNbti(range: RangeKey, now = Date.now()): Promise<SourcePayload> {
  const days = rangeDays(range) ?? 180;
  const [stats, auth, times, recent, campaignRows] = await Promise.all([
    dash<StatsShape>(null, days),
    dash<AuthShape>("auth", days),
    dash<TimesShape>("times", days),
    dash<RecentShape>("recent", days),
    loadCampaignArrivals(range, now),
  ]);

  // Arrivals that still carry utm_source=12one in the URL, split away from the
  // bazi page (same host, counted by its own source).
  const arrivals = campaignRows.filter((row) => {
    if (!row.url) return false;
    try {
      const url = new URL(row.url);
      return /(^|\.)nbti\.neuralfin\.ai$/.test(url.hostname) && !url.pathname.startsWith("/bazi");
    } catch {
      return false;
    }
  });
  const arrivalKeys = new Set(arrivals.map((row) => row.user_id || (row.ip ? `ip:${row.ip}` : "")).filter(Boolean));
  const attribution = {
    label: "来自 12/one",
    param: "utm_source=12one",
    visitors: arrivalKeys.size,
    events: arrivals.length,
    note: "按 user_id / IP 去重；只算带 utm 的 NBTI 页面事件",
  };

  const funnel = stats.funnel ?? {};
  const pageViews = funnel.page_view ?? 0;
  const starts = funnel.test_start ?? 0;
  const completed = funnel.test_completed ?? 0;
  const logins = auth.kpi?.logins ?? 0;

  const funnelSteps = [
    { key: "visit", label: "访问（页面浏览）", value: pageViews, pct: pct(pageViews, pageViews) },
    { key: "start", label: "开始测试", value: starts, pct: pct(starts, pageViews) },
    { key: "complete", label: "完成测试", value: completed, pct: pct(completed, pageViews) },
    { key: "login", label: "注册 / 登录", value: logins, pct: pct(logins, pageViews) },
  ];

  const axis = dayAxis(range, now);
  const byDay = new Map((stats.daily ?? []).map((d) => [d.day.slice(0, 10), d]));
  const daily: DayPoint[] = axis.map((day) => {
    const d = byDay.get(day);
    return { day, visitors: d?.users ?? 0, events: d?.events ?? 0, core: 0, login: 0 };
  });

  // Duration: NBTI reports per-version percentiles rather than raw sessions.
  const versions = Object.entries(times.total_ms ?? {}).sort((a, b) => b[1].n - a[1].n);
  const main = versions[0]?.[1];
  const stages: DurationStage[] = Object.entries(times.stages ?? {}).map(([key, v]) => ({
    label: STAGE_LABEL[key] ?? key,
    n: v.n,
    p50: v.p50,
    p95: v.p95,
  }));
  const duration = {
    n: main?.n ?? 0,
    avg: 0,
    p50: Math.round((main?.p50 ?? 0) / 1000),
    p90: Math.round((main?.p75 ?? 0) / 1000),
    buckets: [],
    stages,
  };

  const recentRows = recent.rows ?? [];
  const usage: UsageRow[] = recentRows.slice(0, 80).map((row) => ({
    ts: new Date(parseShanghai(row.ts)).toISOString(),
    event: EVENT_LABEL[row.event_name] ?? row.event_name,
    detail: row.persona_result ?? row.test_version ?? (row.url ? row.url.replace(/^https?:\/\/[^/]+/, "") || "/" : "—"),
    session: "—",
    country: row.country ?? "—",
    device: deviceOf(row.ua),
    lang: LANG_LABEL[row.lang ?? ""] ?? row.lang ?? "—",
  }));

  const users: UserRow[] = (auth.rows ?? []).slice(0, 300).map((row) => ({
    id: row.acct_id,
    label: row.user_name || "—",
    firstTs: row.first_ts ? new Date(parseShanghai(row.first_ts)).toISOString() : null,
    lastTs: row.last_ts ? new Date(parseShanghai(row.last_ts)).toISOString() : null,
    durationS: 0,
    events: row.logins,
    country: row.region || "—",
    device: row.account_type,
    lang: row.persona || "—",
    identity: row.is_new ? "新注册" : "老用户",
    extra: `${row.account_type} · ${row.region || "—"}`,
  }));

  const langCount = new Map<string, number>();
  const deviceCount = new Map<string, number>();
  for (const row of recentRows) {
    const lang = LANG_LABEL[row.lang ?? ""] ?? row.lang ?? "未知";
    langCount.set(lang, (langCount.get(lang) ?? 0) + 1);
    const device = deviceOf(row.ua);
    deviceCount.set(device, (deviceCount.get(device) ?? 0) + 1);
  }

  const lastTs = recentRows[0]?.ts ? new Date(parseShanghai(recentRows[0].ts)).toISOString() : null;
  const ageSec = lastTs ? Math.max(0, Math.round((now - new Date(lastTs).getTime()) / 1000)) : null;
  const today = shanghaiDay(now);
  const todayEvents = (stats.daily ?? []).find((d) => d.day.slice(0, 10) === today)?.events ?? 0;

  return {
    src: "nbti",
    ok: true,
    range,
    rangeLabel: RANGE_LABEL[range],
    generatedAt: new Date(now).toISOString(),
    kpi: {
      visitors: stats.active_users ?? 0,
      events: stats.total_events ?? 0,
      core: starts,
      logins,
      conversion: pct(logins, pageViews),
      durationP50: Math.round((main?.p50 ?? 0) / 1000),
    },
    funnel: funnelSteps,
    daily,
    duration,
    usage,
    users,
    breakdowns: {
      lang: [...langCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => ({ key, label: key, count })),
      country: breakdown(stats.countries ?? {}, 6),
      device: [...deviceCount.entries()].sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, label: key, count })),
      extra: { title: "人格分布", items: breakdown(stats.persona ?? {}, 6) },
    },
    health: {
      lastTs,
      ageSec,
      todayEvents,
      stale: ageSec === null ? true : ageSec > 6 * 3600,
    },
    instrumented: true,
    attribution,
    notes: [
      "数据来自 NBTI 官方 /api/stats，口径与 nbti 看板一致（纯净 / 完全真人）",
      `统计窗口 ${days} 天 · 注册 ${auth.kpi?.registered ?? 0} 人（含造号机 ${auth.kpi?.bot_registered ?? 0}）`,
      "完成时长取主版本分位数，非逐会话时长",
      "来源归因只认 URL 里的 utm_source=12one，直接输域名进来不计",
    ],
  };
}
