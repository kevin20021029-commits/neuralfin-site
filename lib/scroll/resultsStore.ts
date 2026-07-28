import { SCROLL_BENCHMARK, SCROLL_COMMUNITY_THRESHOLD, SCROLL_REGIONS, type ScrollRegion, normalPercentile } from "./campaign";
import type { ParseOutcome, ScreenTimeLayout } from "./ocrSanitizer";

export type ScrollResult = {
  hours: number;
  region: ScrollRegion;
  ts: number;
};

type GlobalScrollStore = {
  results: ScrollResult[];
  rateLimits: Map<string, number[]>;
  telemetry: Map<string, number>;
};

const globalStore = globalThis as typeof globalThis & {
  __neuralfinScrollStore?: GlobalScrollStore;
};

export const scrollStore =
  globalStore.__neuralfinScrollStore ??
  (globalStore.__neuralfinScrollStore = {
    results: [],
    rateLimits: new Map<string, number[]>(),
    telemetry: new Map<string, number>(),
  });
scrollStore.telemetry ??= new Map<string, number>();

const HOUR_MS = 60 * 60 * 1000;
const MAX_RESULTS = 5000;

export function checkRateLimit(key: string, now = Date.now()) {
  const recent = (scrollStore.rateLimits.get(key) ?? []).filter((ts) => now - ts < HOUR_MS);
  if (recent.length >= 60) {
    scrollStore.rateLimits.set(key, recent);
    return false;
  }
  recent.push(now);
  scrollStore.rateLimits.set(key, recent);
  return true;
}

export function addScrollResult(result: ScrollResult) {
  scrollStore.results.push(result);
  if (scrollStore.results.length > MAX_RESULTS) {
    scrollStore.results.splice(0, scrollStore.results.length - MAX_RESULTS);
  }
}

// Aggregate-only layout telemetry: one counter per {layout, outcome} enum
// pair. No timestamps, no IPs, no rows — nothing that could identify a user.
export function recordScrollTelemetry(layout: ScreenTimeLayout, outcome: ParseOutcome) {
  const key = `${layout}:${outcome}`;
  scrollStore.telemetry.set(key, (scrollStore.telemetry.get(key) ?? 0) + 1);
}

export function buildScrollTelemetrySummary() {
  return Object.fromEntries(scrollStore.telemetry);
}

function percentileFromDistribution(hours: number, distribution: ScrollResult[]) {
  if (distribution.length === 0) {
    return normalPercentile(hours);
  }
  const atOrBelow = distribution.filter((result) => result.hours <= hours).length;
  return Math.round((atOrBelow / distribution.length) * 100);
}

export function buildScrollSummary() {
  const results = scrollStore.results;
  const useCommunity = results.length >= SCROLL_COMMUNITY_THRESHOLD;
  const percentiles = Object.fromEntries(
    SCROLL_REGIONS.map((region) => {
      const distribution = results.filter((result) => region === "ww" || result.region === region);
      return [
        region,
        {
          source: useCommunity && distribution.length > 0 ? "community" : "benchmark",
          label: useCommunity && distribution.length > 0 ? SCROLL_BENCHMARK.communityLabel : SCROLL_BENCHMARK.label,
          p50: useCommunity && distribution.length > 0 ? percentileFromDistribution(4.2, distribution) : 50,
          p75: useCommunity && distribution.length > 0 ? percentileFromDistribution(5.6, distribution) : normalPercentile(5.6),
          p90: useCommunity && distribution.length > 0 ? percentileFromDistribution(7.0, distribution) : normalPercentile(7.0),
        },
      ];
    }),
  );

  return {
    count: results.length,
    threshold: SCROLL_COMMUNITY_THRESHOLD,
    percentiles,
    recent: results
      .slice(-12)
      .reverse()
      .map((result) => ({
        hours: result.hours,
        region: result.region,
        ts: result.ts,
      })),
  };
}
