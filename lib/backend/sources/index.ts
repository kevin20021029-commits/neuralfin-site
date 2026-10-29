// Dispatch + overview roll-up.

import type { RangeKey } from "../time";
import { RANGE_LABEL } from "../time";
import type { OverviewCard, OverviewPayload, SourceKey, SourcePayload } from "../types";
import { SOURCE_META } from "../types";
import { loadArti } from "./arti";
import { loadBazi } from "./bazi";
import { loadNbti } from "./nbti";
import { loadOnepage } from "./onepage";

export async function loadSource(src: SourceKey, range: RangeKey, now = Date.now()): Promise<SourcePayload> {
  switch (src) {
    case "onepage":
      return loadOnepage(range, now);
    case "nbti":
      return loadNbti(range, now);
    case "bazi":
      return loadBazi(range, now);
    case "arti":
      return loadArti(range, now);
  }
}

function fallback(src: SourceKey, error: unknown): SourcePayload {
  const meta = SOURCE_META[src];
  const message = error instanceof Error ? error.message : String(error);
  return {
    src,
    ok: true,
    range: "7",
    rangeLabel: "",
    generatedAt: new Date().toISOString(),
    kpi: { visitors: 0, events: 0, core: 0, logins: 0, conversion: 0, durationP50: 0 },
    funnel: [],
    daily: [],
    duration: { n: 0, avg: 0, p50: 0, p90: 0, buckets: [], stages: [] },
    usage: [],
    users: [],
    breakdowns: { lang: [], country: [], device: [] },
    health: { lastTs: null, ageSec: null, todayEvents: 0, stale: true },
    instrumented: false,
    notes: [`${meta.label} 读取失败：${message}`],
  };
}

export async function loadOverview(range: RangeKey, now = Date.now()): Promise<OverviewPayload> {
  const keys: SourceKey[] = ["onepage", "nbti", "bazi", "arti"];
  const settled = await Promise.allSettled(keys.map((key) => loadSource(key, range, now)));

  const payloads = settled.map((result, i) => (result.status === "fulfilled" ? result.value : fallback(keys[i], result.reason)));
  const failed = settled
    .map((result, i) => (result.status === "rejected" ? SOURCE_META[keys[i]].label : ""))
    .filter(Boolean);

  const cards: OverviewCard[] = payloads.map((payload) => ({
    src: payload.src,
    label: SOURCE_META[payload.src].label,
    sub: SOURCE_META[payload.src].sub,
    visitors: payload.kpi.visitors,
    events: payload.kpi.events,
    core: payload.kpi.core,
    logins: payload.kpi.logins,
    conversion: payload.kpi.conversion,
    lastTs: payload.health.lastTs,
    ageSec: payload.health.ageSec,
    spark: payload.daily.map((d) => d.visitors),
    instrumented: payload.instrumented,
  }));

  const totals = payloads.reduce(
    (acc, p) => ({
      visitors: acc.visitors + p.kpi.visitors,
      events: acc.events + p.kpi.events,
      core: acc.core + p.kpi.core,
      logins: acc.logins + p.kpi.logins,
    }),
    { visitors: 0, events: 0, core: 0, logins: 0 },
  );

  const days = payloads[0]?.daily.map((d) => d.day) ?? [];
  const daily = days.map((day, i) => {
    let visitors = 0;
    let events = 0;
    for (const p of payloads) {
      visitors += p.daily[i]?.visitors ?? 0;
      events += p.daily[i]?.events ?? 0;
    }
    return { day, visitors, events };
  });

  return {
    ok: true,
    kind: "overview",
    range,
    rangeLabel: RANGE_LABEL[range],
    generatedAt: new Date(now).toISOString(),
    totals,
    cards,
    daily,
    notes: [
      failed.length ? `未取到：${failed.join("、")}` : "",
      "总览把四个产品的访客直接相加，不做跨产品去重",
    ].filter(Boolean),
  };
}
