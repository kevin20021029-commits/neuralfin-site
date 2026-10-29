// Shared time + formatting helpers for the /backend console. Every number on
// the page is bucketed by Asia/Shanghai natural days, same as the NBTI board.

export const RANGES = ["1", "7", "30", "all"] as const;
export type RangeKey = (typeof RANGES)[number];

export const RANGE_LABEL: Record<RangeKey, string> = {
  "1": "今日",
  "7": "近 7 天",
  "30": "近 30 天",
  all: "全部",
};

export const DAY_MS = 86_400_000;
export const SHANGHAI_OFFSET_MS = 8 * 3600_000;

export function startOfShanghaiDay(now: number): number {
  const shifted = now + SHANGHAI_OFFSET_MS;
  return Math.floor(shifted / DAY_MS) * DAY_MS - SHANGHAI_OFFSET_MS;
}

export function shanghaiDay(input: string | number): string {
  const ms = typeof input === "number" ? input : new Date(input).getTime();
  return new Date(ms + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
}

export function rangeStart(range: RangeKey, now = Date.now()): Date | null {
  if (range === "all") return null;
  return new Date(startOfShanghaiDay(now) - (Number(range) - 1) * DAY_MS);
}

export function rangeDays(range: RangeKey): number | null {
  return range === "all" ? null : Number(range);
}

/** Continuous axis so gaps render as zero instead of disappearing. */
export function dayAxis(range: RangeKey, now = Date.now()): string[] {
  const today = startOfShanghaiDay(now);
  const days = range === "all" ? 30 : Number(range);
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) out.push(shanghaiDay(today - i * DAY_MS));
  return out;
}

/** NBTI API timestamps are `YYYY-MM-DD HH:mm` already in Asia/Shanghai. */
export function parseShanghai(ts: string): number {
  const normalised = ts.includes("T") ? ts : ts.replace(" ", "T");
  const withZone = /[zZ]|[+-]\d\d:?\d\d$/.test(normalised) ? normalised : `${normalised}+08:00`;
  return new Date(withZone).getTime();
}

export function deviceOf(ua: string | null | undefined): string {
  const s = (ua ?? "").toLowerCase();
  if (!s) return "未知";
  if (s.includes("micromessenger")) return "微信";
  if (s.includes("iphone") || s.includes("ipad") || s.includes("ipod")) return "iOS";
  if (s.includes("android")) return "Android";
  if (s.includes("mobile")) return "移动端";
  return "桌面";
}

export function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
}

export function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export const LANG_LABEL: Record<string, string> = {
  "zh-Hans": "简体",
  "zh-Hant": "繁體",
  zh: "简体",
  hk: "繁體",
  en: "English",
};
