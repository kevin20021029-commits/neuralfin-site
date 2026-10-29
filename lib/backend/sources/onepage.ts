// Source: the 12/one campaign page (nf2027_* events in Supabase `events`).

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
import type { Breakdown, DayPoint, DurationBucket, SourcePayload, UsageRow, UserRow } from "../types";
import { RANGE_LABEL } from "../time";

type Row = {
  ts: string;
  event_name: string;
  lang: string | null;
  country: string | null;
  ua: string | null;
  params: Record<string, string> | null;
};

const EVENT_LIMIT = 20000;

const ROOM_LABEL: Record<string, string> = { arti: "AI 智能投研", play: "趣玩投资", up: "系统升级" };
const TARGET_LABEL: Record<string, string> = {
  arti: "ARTi",
  bazi: "五行财格",
  nbti: "NBTI 测试",
  download: "下载 App",
  home: "官网首页",
  other: "其他外链",
};

const EVENT_LABEL: Record<string, string> = {
  nf2027_view: "浏览页面",
  nf2027_room_open: "打开板块",
  nf2027_cta_click: "外链点击",
};

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

function shortId(sid: string): string {
  return sid.length > 10 ? `${sid.slice(0, 4)}…${sid.slice(-4)}` : sid || "—";
}

export async function loadOnepage(range: RangeKey, now = Date.now()): Promise<SourcePayload> {
  const from = rangeStart(range, now);
  const params: Record<string, string> = {
    select: "ts,event_name,lang,country,ua,params",
    event_name: "like.nf2027_*",
    order: "ts.desc",
  };
  if (from) params.ts = `gte.${from.toISOString()}`;
  const { rows, truncated } = await sbSelect<Row>("events", params, EVENT_LIMIT);

  type Session = {
    id: string;
    first: number;
    last: number;
    events: number;
    lang: string;
    country: string;
    device: string;
    rooms: Set<string>;
    targets: Set<string>;
    lastAction: string;
  };

  const sessions = new Map<string, Session>();
  const perDay = new Map<string, { visitors: Set<string>; events: number; core: Set<string>; login: Set<string> }>();
  const langCount = new Map<string, number>();
  const countryCount = new Map<string, number>();
  const deviceCount = new Map<string, number>();
  const roomCount = new Map<string, number>();
  const targetCount = new Map<string, number>();
  const usage: UsageRow[] = [];

  for (const row of rows) {
    const sid = row.params?.session_id || `anon-${row.ts}`;
    const at = new Date(row.ts).getTime();
    const lang = LANG_LABEL[row.lang ?? ""] ?? row.lang ?? "未知";
    const device = deviceOf(row.ua);
    const country = row.country || "未知";

    let session = sessions.get(sid);
    if (!session) {
      session = {
        id: sid,
        first: at,
        last: at,
        events: 0,
        lang,
        country,
        device,
        rooms: new Set(),
        targets: new Set(),
        lastAction: "—",
      };
      sessions.set(sid, session);
    }
    session.first = Math.min(session.first, at);
    session.last = Math.max(session.last, at);
    session.events += 1;

    if (row.event_name === "nf2027_room_open" && row.params?.room) {
      session.rooms.add(row.params.room);
      roomCount.set(row.params.room, (roomCount.get(row.params.room) ?? 0) + 1);
      session.lastAction = `板块 · ${ROOM_LABEL[row.params.room] ?? row.params.room}`;
    }
    if (row.event_name === "nf2027_cta_click" && row.params?.target) {
      session.targets.add(row.params.target);
      targetCount.set(row.params.target, (targetCount.get(row.params.target) ?? 0) + 1);
      session.lastAction = `去向 · ${TARGET_LABEL[row.params.target] ?? row.params.target}`;
    }

    langCount.set(lang, (langCount.get(lang) ?? 0) + 1);
    countryCount.set(country, (countryCount.get(country) ?? 0) + 1);
    deviceCount.set(device, (deviceCount.get(device) ?? 0) + 1);

    const day = shanghaiDay(row.ts);
    const bucket = perDay.get(day) ?? { visitors: new Set<string>(), events: 0, core: new Set<string>(), login: new Set<string>() };
    bucket.events += 1;
    bucket.visitors.add(sid);
    if (session.rooms.size || session.targets.size) bucket.core.add(sid);
    perDay.set(day, bucket);

    if (usage.length < 80) {
      usage.push({
        ts: row.ts,
        event: EVENT_LABEL[row.event_name] ?? row.event_name,
        detail:
          row.params?.room != null
            ? ROOM_LABEL[row.params.room] ?? row.params.room
            : row.params?.target != null
              ? TARGET_LABEL[row.params.target] ?? row.params.target
              : "—",
        session: shortId(sid),
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

  const coreSessions = all.filter((s) => s.rooms.size > 0 || s.targets.size > 0).length;
  const ctaSessions = all.filter((s) => s.targets.size > 0).length;
  const roomSessions = all.filter((s) => s.rooms.size > 0).length;

  const days = dayAxis(range, now);
  const daily: DayPoint[] = days.map((day) => {
    const b = perDay.get(day);
    return {
      day,
      visitors: b?.visitors.size ?? 0,
      events: b?.events ?? 0,
      core: b?.core.size ?? 0,
      login: 0,
    };
  });

  const users: UserRow[] = all
    .sort((a, b) => b.last - a.last)
    .slice(0, 300)
    .map((s) => ({
      id: shortId(s.id),
      label: s.id.startsWith("anon-") ? "无会话 ID" : "会话",
      firstTs: new Date(s.first).toISOString(),
      lastTs: new Date(s.last).toISOString(),
      durationS: Math.max(0, Math.round((s.last - s.first) / 1000)),
      events: s.events,
      country: s.country,
      device: s.device,
      lang: s.lang,
      identity: "匿名",
      extra: s.lastAction,
    }));

  const lastTs = rows.length ? rows[0].ts : null;
  const ageSec = lastTs ? Math.max(0, Math.round((now - new Date(lastTs).getTime()) / 1000)) : null;
  const today = shanghaiDay(now);

  return {
    src: "onepage",
    ok: true,
    range,
    rangeLabel: RANGE_LABEL[range],
    generatedAt: new Date(now).toISOString(),
    kpi: {
      visitors: sessions.size,
      events: rows.length,
      core: coreSessions,
      logins: 0,
      conversion: pct(ctaSessions, sessions.size),
      durationP50: median(durations),
    },
    funnel: [
      { key: "visit", label: "访问 /12/one", value: sessions.size, pct: 100 },
      { key: "room", label: "打开任一板块", value: roomSessions, pct: pct(roomSessions, sessions.size) },
      { key: "cta", label: "点击外链 / 下载", value: ctaSessions, pct: pct(ctaSessions, sessions.size) },
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
        title: "板块 / 去向",
        items: top(new Map([...roomCount, ...targetCount]), 8).map((x) => ({
          ...x,
          label: ROOM_LABEL[x.key] ?? TARGET_LABEL[x.key] ?? x.key,
        })),
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
      "注册/登录无法归属到本页（外链跳转后身份分离），转化以「点击外链」为准",
    ].filter(Boolean),
  };
}
