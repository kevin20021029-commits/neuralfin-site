import { PERCENTILE_MAX, PERCENTILE_MIN, type ScrollLocale } from "./campaign";

export type RankLang = ScrollLocale;

// ONE rank convention for the whole page (tile, card, tape): the percentile
// of people you out-scroll. It rises monotonically with hours in a single
// vocabulary, so the number never has to be read against a second metric.
//
// The previous framing swapped metric at the median — "Lighter than 51%"
// below it, "Top 46% scroller" above — so crossing 4.2 h inverted both the
// number and its polarity, and the aspirational green tape row (low hours)
// carried the worst-looking figure on the board ("Top 85%"). Under this
// convention low hours simply read low.
// lastReviewed: 2026-07-30 (en); zh REVIEWED 2026-07-30
const RANK_COPY = {
  en: {
    title: (percent: number, regionName: string) => `You scroll more than ${percent}% · ${regionName}`,
    light: "nice — your feed doesn't own you 🌱",
    heavy: "that's a heavy position to carry",
  },
  // REVIEWED-BY-MIRROR (source: reviewed zh-Hans)
  "zh-Hant": {
    title: (percent: number, regionName: string) => `你滑得比 ${percent}% 的人多 · ${regionName}`,
    light: "挺好，你沒被信息流「控制」",
    heavy: "這個倉位有點重",
  },
  "zh-Hans": {
    title: (percent: number, regionName: string) => `你滑得比 ${percent}% 的人多 · ${regionName}`,
    light: "挺好，你没被信息流“控制”",
    heavy: "这个仓位有点重",
  },
  th: {
    title: (percent: number, regionName: string) => `คุณเลื่อนมากกว่า ${percent}% · ${regionName}`,
    light: "ดีมาก — ฟีดยังไม่ได้เป็นเจ้าของคุณ 🌱",
    heavy: "สถานะนี้หนักอยู่นะ",
  },
} as const;

export function getRankFrame(percentile: number, regionName: string, lang: RankLang) {
  const safe = Number.isFinite(percentile) ? Math.round(percentile) : 50;
  const p = Math.max(PERCENTILE_MIN, Math.min(PERCENTILE_MAX, safe));
  const copy = RANK_COPY[lang];

  return {
    title: copy.title(p, regionName),
    subtitle: p < 50 ? copy.light : copy.heavy,
    displayPercent: `P${p}`,
  };
}
