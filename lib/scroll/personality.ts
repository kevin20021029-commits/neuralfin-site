import type { ScrollLocale } from "./campaign";

export type ScrollPersonalityLang = ScrollLocale;
export type ArchetypeId = "saint" | "casual" | "certified" | "favorite" | "grass";
export type ScanStage = "reading" | "auditing" | "success" | "fail";

const PUBLIC_SCROLL_LABEL = "www.neuralfin.ai/scroll";

export const ARCHETYPES = [
  {
    id: "saint",
    maxHours: 1.5,
    lastReviewed: "2026-07-30",
    en: { title: "The Saint", subtitle: "suspicious. nobody's this disciplined" },
    "zh-Hant": { title: "聖人", subtitle: "可疑啊，這自律程度不像人類" },
    "zh-Hans": { title: "圣人", subtitle: "可疑啊，这自律程度不像人类" },
    // DRAFT — native review required
    th: { title: "นักบุญ", subtitle: "สะอาดเกินไป น่าสงสัยว่ายังไม่เปิดพอร์ต" },
  },
  {
    id: "casual",
    maxHours: 3,
    lastReviewed: "2026-07-30",
    en: { title: "Casual Scroller", subtitle: "dabbling. respectable" },
    "zh-Hant": { title: "輕度滑友", subtitle: "入門水平，勉強及格" },
    "zh-Hans": { title: "轻度滑友", subtitle: "入门水平，勉强及格" },
    // DRAFT — native review required
    th: { title: "สายเลื่อนชิลล์ ๆ", subtitle: "เล่นพอเพลิน ยังดูดีอยู่" },
  },
  {
    id: "certified",
    maxHours: 5,
    lastReviewed: "2026-07-30",
    en: { title: "Certified Scroller", subtitle: "mid, and that's okay" },
    "zh-Hant": { title: "認證滑屏員", subtitle: "不上不下，但挺好" },
    "zh-Hans": { title: "认证滑屏员", subtitle: "不上不下，但挺好" },
    // DRAFT — native review required
    th: { title: "นักเลื่อนตัวจริง", subtitle: "ถือสถานะกลาง ๆ ยังไม่หลุดมือ" },
  },
  {
    id: "favorite",
    maxHours: 8,
    lastReviewed: "2026-07-30",
    en: { title: "The Algorithm's Favorite", subtitle: "the feed knows your name" },
    "zh-Hant": { title: "算法的最愛", subtitle: "你的名字，算法早就記住了" },
    "zh-Hans": { title: "算法的最爱", subtitle: "你的名字，算法早就记住了" },
    // DRAFT — native review required
    th: { title: "ลูกรักอัลกอริทึม", subtitle: "ฟีดจำชื่อคุณได้แล้ว" },
  },
  {
    id: "grass",
    maxHours: Number.POSITIVE_INFINITY,
    lastReviewed: "2026-07-30",
    en: { title: "Touch Grass Candidate", subtitle: "the algorithm sends its regards" },
    "zh-Hant": { title: "摸草候選人", subtitle: "算法向你問好" },
    "zh-Hans": { title: "摸草候选人", subtitle: "算法向你问好" },
    // DRAFT — native review required
    th: { title: "ผู้สมัครไปสัมผัสหญ้า", subtitle: "อัลกอริทึมฝากความคิดถึง" },
  },
] as const;

export const TAPE_NOTE_CONFIG = {
  lastReviewed: "2026-07-30",
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
  "zh-Hant": {
    red: ["認證滑屏員", "算法贏了", "該摸摸草了", "已老實", "躺平持倉", "腦袋清倉，只剩 feed", "組合：全憑感覺"],
    green: ["已翻綠 ✓", "守住紀律了 ✓"],
  },
  "zh-Hans": {
    red: ["认证滑屏员", "算法赢了", "该摸摸草了", "已老实", "躺平持仓", "脑袋清仓，只剩 feed", "组合：全凭感觉"],
    green: ["已翻绿 ✓", "守住纪律了 ✓"],
  },
  // DRAFT — native review required
  th: {
    red: ["นักเลื่อนตัวจริง", "อัลกอริทึมชนะ", "ไปสัมผัสหญ้าบ้างนะ", "ดอยแล้ว", "ถือยาวแบบไม่ได้ตั้งใจ", "สมองว่าง เหลือแต่ฟีด", "พอร์ต: ใช้ความรู้สึกล้วน ๆ"],
    green: ["พลิกเขียวแล้ว ✓", "คุมวินัยอยู่ ✓"],
  },
} as const;

export const SCAN_STAGE_CONFIG = {
  lastReviewed: "2026-07-30",
  en: {
    reading: "Reading on your device...",
    auditing: "Auditing the damage...",
    success: "Marking to market...",
    fail: "It's not looking good chief...",
  },
  "zh-Hant": {
    reading: "設備本地讀取中...",
    auditing: "正在盤點損益...",
    success: "正在逐日入賬...",
    fail: "兄弟，這個盤面不太妙...",
  },
  "zh-Hans": {
    reading: "设备本地读取中...",
    auditing: "正在盘点损益...",
    success: "正在逐日入账...",
    fail: "兄弟，这个盘面不太妙...",
  },
  // DRAFT — native review required
  th: {
    reading: "กำลังอ่านบนเครื่องของคุณ...",
    auditing: "กำลังตรวจความเสียหาย...",
    success: "กำลังตีราคาตลาด...",
    fail: "กระดานนี้ดูไม่ค่อยดีแฮะ...",
  },
} as const;

export const SHARE_TEXT_VARIANTS = {
  lastReviewed: "2026-07-30",
  en: [
    (loss: string, rank: string, url: string) => `I'm down ${loss} this year. ${rank} — are you down more? ${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `I'm down ${loss} this year and the market is me. ${rank}. ${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `My most shorted stock is my attention span. ${loss}. ${rank}. ${url} #ScrollAudit`,
  ],
  "zh-Hant": [
    (loss: string, rank: string, url: string) => `我今年已經虧了 ${loss}。${rank}——你虧得比我多嗎？${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `我今年注意力賬面虧損 ${loss}，市場就是我本人。${rank}。${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `我做空最重的倉位是注意力。${loss}。${rank}。${url} #ScrollAudit`,
  ],
  "zh-Hans": [
    (loss: string, rank: string, url: string) => `我今年已经亏了 ${loss}。${rank}——你亏得比我多吗？${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `我今年注意力账面亏损 ${loss}，市场就是我本人。${rank}。${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `我做空最重的仓位是注意力。${loss}。${rank}。${url} #ScrollAudit`,
  ],
  // DRAFT — native review required
  th: [
    (loss: string, rank: string, url: string) => `ปีนี้เราติดลบไป ${loss} แล้ว ${rank} — คุณลบหนักกว่านี้ไหม? ${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `ปีนี้ขาดทุนสมาธิไป ${loss} ตลาดก็คือเราเอง ${rank} ${url} #ScrollAudit`,
    (loss: string, rank: string, url: string) => `หุ้นที่เราช็อตหนักสุดคือสมาธิของตัวเอง ${loss} ${rank} ${url} #ScrollAudit`,
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
