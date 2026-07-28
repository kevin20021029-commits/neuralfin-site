export const SCROLL_CAMPAIGN_UTM = {
  utm_source: "scroll-calculator",
  utm_medium: "web",
  utm_campaign: "scroll-audit",
} as const;

export const SCROLL_DEEP_LINK_PARAMS = {
  hours: "sc_hours",
  region: "sc_region",
  verified: "sc_verified",
  lang: "sc_lang",
} as const;

export const SCROLL_REGIONS = ["ww", "hk", "sg", "th"] as const;

export type ScrollRegion = (typeof SCROLL_REGIONS)[number];

export const SCROLL_COMMUNITY_THRESHOLD = 500;

export const SCROLL_BENCHMARK = {
  meanHoursPerDay: 4.2,
  standardDeviation: 2.1,
  label: "vs. published screen-time benchmarks",
  communityLabel: "vs. NeuralFin community",
} as const;

export const SCROLL_STANDINGS = [
  { region: "sg", averageHours: 4.1, flippedPercent: 18 },
  { region: "hk", averageHours: 4.6, flippedPercent: 14 },
  { region: "th", averageHours: 5.2, flippedPercent: 11 },
  { region: "ww", averageHours: 4.4, flippedPercent: 12 },
] as const satisfies ReadonlyArray<{
  region: ScrollRegion;
  averageHours: number;
  flippedPercent: number;
}>;

export function isScrollRegion(value: unknown): value is ScrollRegion {
  return typeof value === "string" && SCROLL_REGIONS.includes(value as ScrollRegion);
}

export function normalPercentile(hours: number) {
  const z = (hours - SCROLL_BENCHMARK.meanHoursPerDay) / SCROLL_BENCHMARK.standardDeviation;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  p = z > 0 ? 1 - p : p;
  return Math.round(p * 100);
}
