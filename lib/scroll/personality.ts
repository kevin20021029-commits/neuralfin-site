import type { ScrollLocale } from "./campaign";

export type ScrollPersonalityLang = ScrollLocale;
export type ArchetypeId = "saint" | "casual" | "certified" | "favorite" | "grass";
export type ScanStage = "reading" | "auditing" | "success" | "fail";

const PUBLIC_SCROLL_LABEL = "www.neuralfin.ai/scroll";

export const ARCHETYPES = [
  {
    id: "saint",
    maxHours: 1.5,
    lastReviewed: "2026-07-28",
    en: { title: "The Saint", subtitle: "suspicious. nobody's this disciplined" },
    // DRAFT — native review required
    "zh-Hant": { title: "聖人", subtitle: "太乾淨，像還沒開倉" },
    // DRAFT — native review required
    "zh-Hans": { title: "圣人", subtitle: "太干净，像还没开仓" },
  },
  {
    id: "casual",
    maxHours: 3,
    lastReviewed: "2026-07-28",
    en: { title: "Casual Scroller", subtitle: "dabbling. respectable" },
    // DRAFT — native review required
    "zh-Hant": { title: "輕度滑友", subtitle: "小注怡情，尚算體面" },
    // DRAFT — native review required
    "zh-Hans": { title: "轻度滑友", subtitle: "小赌怡情，还算体面" },
  },
  {
    id: "certified",
    maxHours: 5,
    lastReviewed: "2026-07-28",
    en: { title: "Certified Scroller", subtitle: "mid, and that's okay" },
    // DRAFT — native review required
    "zh-Hant": { title: "認證滑屏員", subtitle: "中段持倉，不算失控" },
    // DRAFT — native review required
    "zh-Hans": { title: "认证滑屏员", subtitle: "中段持仓，不算失控" },
  },
  {
    id: "favorite",
    maxHours: 8,
    lastReviewed: "2026-07-28",
    en: { title: "The Algorithm's Favorite", subtitle: "the feed knows your name" },
    // DRAFT — native review required
    "zh-Hant": { title: "演算法的最愛", subtitle: "feed 已經認得你個名" },
    // DRAFT — native review required
    "zh-Hans": { title: "算法的最爱", subtitle: "feed 已经认得你的名字" },
  },
  {
    id: "grass",
    maxHours: Number.POSITIVE_INFINITY,
    lastReviewed: "2026-07-28",
    en: { title: "Touch Grass Candidate", subtitle: "the algorithm sends its regards" },
    // DRAFT — native review required
    "zh-Hant": { title: "摸草候選人", subtitle: "演算法代你問好" },
    // DRAFT — native review required
    "zh-Hans": { title: "摸草候选人", subtitle: "算法代你问好" },
  },
] as const;

export const TAPE_NOTE_CONFIG = {
  lastReviewed: "2026-07-28",
  en: {
    red: [
      "certified scroller",
      "the algorithm won",
      "touch grass",
      "down bad (literally)",
      "cooked",
      "no thoughts, just feed",
      "portfolio: vibes",
    ],
    green: ["flipped ✓", "locked in ✓"],
  },
  // DRAFT — native review required
  "zh-Hant": {
    red: ["認證滑屏員", "演算法贏了", "該摸摸草了", "已老實", "躺平持倉", "腦袋清倉，只剩 feed", "組合：感覺派"],
    green: ["已翻綠 ✓", "有在守紀律 ✓"],
  },
  // DRAFT — native review required
  "zh-Hans": {
    red: ["认证滑屏员", "算法赢了", "该摸摸草了", "已老实", "躺平持仓", "脑袋清仓，只剩 feed", "组合：全凭感觉"],
    green: ["已翻绿 ✓", "守住纪律了 ✓"],
  },
} as const;

export const SCAN_STAGE_CONFIG = {
  lastReviewed: "2026-07-28",
  en: {
    reading: "Reading on your device...",
    auditing: "Auditing the damage...",
    success: "Marking to market...",
    fail: "It's not looking good chief...",
  },
  // DRAFT — native review required
  "zh-Hant": {
    reading: "裝置本機讀取中...",
    auditing: "正在盤點損益...",
    success: "正在逐日入帳...",
    fail: "這張盤面不太妙...",
  },
  // DRAFT — native review required
  "zh-Hans": {
    reading: "设备本地读取中...",
    auditing: "正在盘点损益...",
    success: "正在逐日入账...",
    fail: "这个盘面不太妙...",
  },
} as const;

export const SHARE_TEXT_VARIANTS = {
  lastReviewed: "2026-07-28",
  en: [
    (loss: string, rank: string, url: string) => `I'm down ${loss} this year. ${rank} — are you down more? ${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `I'm down ${loss} this year and the market is me. ${rank}. ${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `My most shorted stock is my attention span. ${loss}. ${rank}. ${url} #ScrollAudit`,
  ],
  // DRAFT — native review required
  "zh-Hant": [
    (loss: string, rank: string, url: string) => `我今年已經虧了 ${loss}。${rank}——你虧得比我多嗎？${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `我今年注意力帳面虧損 ${loss}，市場就是我本人。${rank}。${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `我最重倉沽空的是注意力。${loss}。${rank}。${url} #ScrollAudit`,
  ],
  // DRAFT — native review required
  "zh-Hans": [
    (loss: string, rank: string, url: string) => `我今年已经亏了 ${loss}。${rank}——你亏得比我多吗？${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `我今年注意力账面亏损 ${loss}，市场就是我本人。${rank}。${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `我做空最重的仓位是注意力。${loss}。${rank}。${url} #ScrollAudit`,
  ],
} as const;

export function getArchetype(hours: number) {
  const safeHours = Number.isFinite(hours) ? hours : 0;
  return ARCHETYPES.find((item) => safeHours < item.maxHours) ?? ARCHETYPES[ARCHETYPES.length - 1];
}

export function getArchetypeCopy(hours: number, lang: ScrollPersonalityLang) {
  return getArchetype(hours)[lang];
}

export function getTapeNote(lang: ScrollPersonalityLang, flipped: boolean, index: number) {
  const pool = flipped ? TAPE_NOTE_CONFIG[lang].green : TAPE_NOTE_CONFIG[lang].red;
  return pool[Math.abs(index) % pool.length] ?? pool[0];
}

export function getScanStageMessage(lang: ScrollPersonalityLang, stage: ScanStage) {
  return SCAN_STAGE_CONFIG[lang][stage];
}

export function getShareCaptionVariant(
  lang: ScrollPersonalityLang,
  loss: string,
  rank: string,
  random = Math.random,
  url = PUBLIC_SCROLL_LABEL,
) {
  const variants = SHARE_TEXT_VARIANTS[lang];
  const index = Math.min(variants.length - 1, Math.floor(random() * variants.length));
  return variants[index](loss, rank, url);
}
