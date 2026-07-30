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

export const SCROLL_LOCALES = ["en", "zh-Hant", "zh-Hans", "th"] as const;

export type ScrollLocale = (typeof SCROLL_LOCALES)[number];

// Accepts URL params and stored preferences; legacy "zh" (the pre-Hans
// two-locale era) maps to zh-Hant, which is what it displayed.
export function normalizeScrollLocale(value: unknown): ScrollLocale | null {
  if (typeof value !== "string") return null;
  const tag = value.toLowerCase();
  if (tag === "en") return "en";
  if (tag === "zh" || tag === "zh-hant" || tag === "zhhant") return "zh-Hant";
  if (tag === "zh-hans" || tag === "zhhans") return "zh-Hans";
  if (tag === "th" || tag.startsWith("th-")) return "th";
  return null;
}

// Default locale from browser languages + detected region.
// RULE (confirmed): language beats region. Region only ever selects WHICH
// variant wins for a language the browser actually expresses (bare "zh" →
// HK Hant / SG Hans) or fills in when the browser expresses no recognized
// preference at all (Thailand → th). It never overrides an explicit
// browser language — an en-HK or en-TH browser stays English. The manual
// toggle always wins and persists.
export function detectScrollLocale(languages: readonly string[], region: ScrollRegion): ScrollLocale {
  let sawEnglish = false;
  for (const raw of languages) {
    const tag = raw.toLowerCase();
    if (tag === "th" || tag.startsWith("th-")) return "th";
    if (tag.startsWith("en")) {
      sawEnglish = true;
      continue;
    }
    if (!tag.startsWith("zh")) continue;
    if (/hant|-tw|-hk|-mo/.test(tag)) return "zh-Hant";
    if (/hans|-cn|-sg|-my/.test(tag)) return "zh-Hans";
    return region === "hk" ? "zh-Hant" : "zh-Hans";
  }
  if (!sawEnglish && region === "th") return "th";
  return "en";
}

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

// Displayed percentiles are clamped: "0%" and "100%" are never true of a
// living distribution and read as broken.
export const PERCENTILE_MIN = 1;
export const PERCENTILE_MAX = 99;

// Screen time is a strictly positive, right-skewed duration. The previous
// normal N(4.2, 2.1) put ~2% of people below zero hours and hit P100 from
// 9.7 h up, leaving the top fifth of the slider dead. A lognormal is
// supported on (0, ∞) and keeps a live right tail across the whole range.
// Spread is carried as the benchmark's coefficient of variation so a market
// with a higher mean keeps the same relative shape.
// Note: for a right-skewed distribution the mean sits ABOVE the median, so
// a user exactly at their market average lands near P59, not P50. That is a
// property of the distribution, not an off-by-one.
const BENCHMARK_CV = SCROLL_BENCHMARK.standardDeviation / SCROLL_BENCHMARK.meanHoursPerDay;
const LOGNORMAL_SIGMA = Math.sqrt(Math.log(1 + BENCHMARK_CV * BENCHMARK_CV));

// Abramowitz–Stegun 26.2.17 standard normal CDF.
function standardNormalCdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function getRegionAverageHours(region: ScrollRegion) {
  return SCROLL_STANDINGS.find((item) => item.region === region)?.averageHours ?? SCROLL_BENCHMARK.meanHoursPerDay;
}

// The single percentile function for the whole page — tile, card and tape.
// Region-aware by construction: selecting a market changes the comparison,
// which is what the rank tile has always claimed to do.
export function scrollPercentile(hours: number, region: ScrollRegion = "ww") {
  if (!Number.isFinite(hours) || hours <= 0) return PERCENTILE_MIN;
  const mu = Math.log(getRegionAverageHours(region)) - (LOGNORMAL_SIGMA * LOGNORMAL_SIGMA) / 2;
  const percent = standardNormalCdf((Math.log(hours) - mu) / LOGNORMAL_SIGMA) * 100;
  return Math.min(PERCENTILE_MAX, Math.max(PERCENTILE_MIN, Math.round(percent)));
}
