// Normalised shape every data source is mapped into. The console renders one
// component tree for all of them, so anything source-specific belongs in
// `notes`/`extra`, not in a new field read by one tab.

import type { RangeKey } from "./time";

export const SOURCES = ["onepage", "nbti", "bazi", "arti"] as const;
export type SourceKey = (typeof SOURCES)[number];

export const SOURCE_META: Record<SourceKey, { label: string; sub: string; url: string }> = {
  onepage: { label: "12/one 战役页", sub: "neuralfin.ai/12/one", url: "https://www.neuralfin.ai/12/one" },
  nbti: { label: "NBTI 人格测试", sub: "nbti.neuralfin.ai", url: "https://nbti.neuralfin.ai" },
  bazi: { label: "八字财格", sub: "nbti.neuralfin.ai/bazi", url: "https://nbti.neuralfin.ai/bazi" },
  arti: { label: "ARTi 投研", sub: "neuralfin.ai/arti", url: "https://neuralfin.ai/arti" },
};

export type FunnelStep = { key: string; label: string; value: number; pct: number };

export type DayPoint = { day: string; visitors: number; events: number; core: number; login: number };

export type DurationBucket = { label: string; count: number };

export type DurationStage = { label: string; n: number; p50: number; p95: number };

export type Duration = {
  n: number;
  avg: number;
  p50: number;
  p90: number;
  /** Seconds; empty when the source only reports stage percentiles. */
  buckets: DurationBucket[];
  /** Optional extra percentile tables (NBTI 流程耗时). */
  stages: DurationStage[];
};

export type UsageRow = {
  ts: string;
  event: string;
  detail: string;
  session: string;
  country: string;
  device: string;
  lang: string;
};

export type UserRow = {
  id: string;
  label: string;
  firstTs: string | null;
  lastTs: string | null;
  durationS: number;
  events: number;
  country: string;
  device: string;
  lang: string;
  identity: string;
  extra: string;
};

export type Breakdown = { key: string; label: string; count: number };

/** Traffic that arrived from the 12/one campaign (utm_source=12one). */
export type Attribution = {
  label: string;
  param: string;
  visitors: number;
  events: number;
  note: string;
};

export type Kpi = {
  visitors: number;
  events: number;
  core: number;
  logins: number;
  conversion: number;
  durationP50: number;
};

export type SourcePayload = {
  src: SourceKey;
  ok: true;
  range: RangeKey;
  rangeLabel: string;
  generatedAt: string;
  kpi: Kpi;
  funnel: FunnelStep[];
  daily: DayPoint[];
  duration: Duration;
  usage: UsageRow[];
  users: UserRow[];
  breakdowns: {
    lang: Breakdown[];
    country: Breakdown[];
    device: Breakdown[];
    extra?: { title: string; items: Breakdown[] };
  };
  health: { lastTs: string | null; ageSec: number | null; todayEvents: number; stale: boolean };
  /** True when the source has no telemetry yet — render an honest empty state. */
  instrumented: boolean;
  /** Present when the source can attribute arrivals from /12/one. */
  attribution?: Attribution;
  notes: string[];
};

export type OverviewCard = {
  src: SourceKey;
  label: string;
  sub: string;
  visitors: number;
  events: number;
  core: number;
  logins: number;
  conversion: number;
  lastTs: string | null;
  ageSec: number | null;
  spark: number[];
  instrumented: boolean;
};

export type OverviewPayload = {
  ok: true;
  kind: "overview";
  range: RangeKey;
  rangeLabel: string;
  generatedAt: string;
  totals: { visitors: number; events: number; core: number; logins: number };
  cards: OverviewCard[];
  daily: { day: string; visitors: number; events: number }[];
  notes: string[];
};

export type StatsResponse = SourcePayload | OverviewPayload;
