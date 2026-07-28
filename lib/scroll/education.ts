import type { ScrollLocale } from "./campaign";

export type ScrollEducationLang = ScrollLocale;

// TODO(product): Replace track names/counts and confirm average lesson length before launch.
export const LESSON_MINUTES = 5;
export const FLIP_MINUTES_PER_DAY = 10;

// zh strings: DRAFT — native review required (both scripts)
export const TRACKS = [
  { id: "foundations", en: "Investing Foundations", "zh-Hant": "投資基礎", "zh-Hans": "投资基础", th: "พื้นฐานการลงทุน", lessons: 40 },
  { id: "markets", en: "How Markets Move", "zh-Hant": "市場如何運作", "zh-Hans": "市场如何运作", th: "ตลาดขยับยังไง", lessons: 32 },
  { id: "statements", en: "Reading the Numbers", "zh-Hant": "看懂財務數字", "zh-Hans": "看懂财务数字", th: "อ่านตัวเลขให้เป็น", lessons: 28 },
  { id: "psychology", en: "The Investor's Mind", "zh-Hant": "投資者心理學", "zh-Hans": "投资者心理学", th: "จิตวิทยานักลงทุน", lessons: 24 },
  { id: "first-trade", en: "Your First Trade, Done Right", "zh-Hant": "第一筆交易做對", "zh-Hans": "第一笔交易做对", th: "เทรดแรกให้ถูกทาง", lessons: 20 },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];

export const LADDER_TRACKS: TrackId[] = ["foundations", "statements", "first-trade"];

export const MICRO_TAKEAWAYS = {
  en: [
    "An ETF is a basket of stocks you buy in one trade.",
    "A stock is a small ownership slice of a real company.",
    "An index tracks a whole market so you can see it move as one number.",
    "Diversification means one bad bet can't sink you.",
    "Compounding means your gains start earning their own gains.",
  ],
  // DRAFT — native review required
  "zh-Hant": [
    "ETF 是一籃子股票，讓你用一筆交易買入。",
    "股票代表你持有一家真實公司的一小部分。",
    "指數追蹤整個市場，讓你用一個數字看它的變化。",
    "分散配置的意思是，一個錯誤押注不會拖垮全部。",
    "複利的意思是，你的收益開始產生自己的收益。",
  ],
  // DRAFT — native review required
  "zh-Hans": [
    "ETF 是一篮子股票，让你用一笔交易买入。",
    "股票代表你持有一家真实公司的一小部分。",
    "指数追踪整个市场，让你用一个数字看它的变化。",
    "分散配置的意思是，一个错误押注不会拖垮全部。",
    "复利的意思是，你的收益开始产生自己的收益。",
  ],
  // DRAFT — native review required
  th: [
    "ETF คือตะกร้าหุ้นที่ซื้อได้ในเทรดเดียว",
    "หุ้นคือความเป็นเจ้าของชิ้นเล็ก ๆ ของบริษัทจริง",
    "ดัชนีติดตามทั้งตลาด ให้คุณดูการขยับเป็นตัวเลขเดียว",
    "การกระจายพอร์ตแปลว่าพลาดตัวเดียวไม่ทำให้จมทั้งลำ",
    "ดอกเบี้ยทบต้นแปลว่ากำไรของคุณเริ่มสร้างกำไรของมันเอง",
  ],
} as const;

export function getTrack(id: TrackId) {
  return TRACKS.find((track) => track.id === id) ?? TRACKS[0];
}

export function getTrackName(id: TrackId, lang: ScrollEducationLang) {
  return getTrack(id)[lang];
}

export function getLessonsPerDay(hours: number) {
  const safeHours = Number.isFinite(hours) && hours > 0 ? hours : 0;
  return Math.max(1, Math.floor((safeHours * 60) / LESSON_MINUTES));
}

export function getDaysToFinishTrack(hours: number, trackId: TrackId = "foundations") {
  const safeHours = Number.isFinite(hours) && hours > 0 ? hours : 0;
  const dailyMinutes = safeHours * 60;
  if (dailyMinutes <= 0) return 1;
  return Math.max(1, Math.ceil((getTrack(trackId).lessons * LESSON_MINUTES) / dailyMinutes));
}

export function formatDaysToFinish(days: number, lang: ScrollEducationLang) {
  const safeDays = Math.max(1, Math.ceil(Number.isFinite(days) ? days : 1));
  if (safeDays <= 7) {
    if (lang === "zh-Hant") return "一週內";
    if (lang === "zh-Hans") return "一周内";
    if (lang === "th") return "ภายในหนึ่งสัปดาห์";
    return "in under a week";
  }
  if (lang === "zh-Hant") return `${safeDays} 天內`;
  if (lang === "zh-Hans") return `${safeDays} 天内`;
  if (lang === "th") return `ภายใน ${safeDays} วัน`;
  return `in ${safeDays} days`;
}

export function getMilestoneDate(from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + 365);
  return date;
}

export function formatMilestoneDate(date: Date, lang: ScrollEducationLang) {
  if (lang === "zh-Hant" || lang === "zh-Hans") return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  // th-TH renders Buddhist-era years (2027 CE → 2570) — the native convention.
  if (lang === "th") return new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric" }).format(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function getDailyMicroTakeaway(lang: ScrollEducationLang, date = new Date()) {
  const facts = MICRO_TAKEAWAYS[lang];
  return facts[getDayOfYear(date) % facts.length] ?? facts[0];
}

export function getEducationOutput(hours: number, lang: ScrollEducationLang, date = new Date()) {
  const lessonsPerDay = getLessonsPerDay(hours);
  const daysToFinish = getDaysToFinishTrack(hours, "foundations");
  const milestoneDate = getMilestoneDate(date);
  const milestoneLabel = formatMilestoneDate(milestoneDate, lang);

  return {
    lessonsPerDay,
    daysToFinish,
    finishPhrase: formatDaysToFinish(daysToFinish, lang),
    milestoneDate,
    milestoneLabel,
    microTakeaway: getDailyMicroTakeaway(lang, date),
    cardLine:
      lang === "zh-Hant"
        ? `每天 ${lessonsPerDay} 課藏在我的滑屏裡 · 課程完成於 ${milestoneLabel}`
        : lang === "zh-Hans"
          ? `每天 ${lessonsPerDay} 课藏在我的滑屏里 · 课程完成于 ${milestoneLabel}`
          : lang === "th"
            ? `วันละ ${lessonsPerDay} บทเรียนซ่อนอยู่ในการไถของเรา · เรียนจบราว ${milestoneLabel}`
            : `${lessonsPerDay} lessons/day hiding in my scroll · course done by ${milestoneLabel}`,
  };
}
