import type { ScrollLocale } from "./campaign";

export type ScrollEducationLang = ScrollLocale;

// TODO(product) — BLOCKING for card accuracy, needs curriculum input:
//   1. the real track names and per-track lesson counts, and
//   2. the true average lesson length (LESSON_MINUTES, currently 5).
// Every duration printed on the share card derives from these three inputs
// via one shared rate: "N lessons/day", "in N days", and the milestone date
// ("course done by <month year>"). If the real curriculum differs, that date
// is a wrong factual claim on a shared artifact.
// The relationships are locked by tests, so correcting the numbers here
// propagates coherently — no other file needs touching.
export const LESSON_MINUTES = 5;
export const FLIP_MINUTES_PER_DAY = 10;

// zh-Hans: REVIEWED (internal team, 2026-07-30).
// zh-Hant: REVIEWED-BY-MIRROR (character conversion of the reviewed
// zh-Hans set) — these pairs were already exact s2t mirrors.
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
  // REVIEWED-BY-MIRROR (source: reviewed zh-Hans)
  "zh-Hant": [
    "ETF 是一籃子股票，讓你用一筆交易買入。",
    "股票代表你持有一家真實公司的一小部分。",
    "指數追蹤整個市場，讓你用一個數字看它的變化。",
    "分散配置的意思是，一個錯誤押注不會拖垮全部。",
    "複利的意思是，你的收益開始產生自己的收益。",
  ],
  // REVIEWED (internal team, 2026-07-30)
  "zh-Hans": [
    "ETF 是一篮子股票，让你用一笔交易买入。",
    "股票代表你持有一家真实公司的一小部分。",
    "指数追踪整个市场，让你用一个数字看它的变化。",
    "分散配置的意思是，一个错误押注不会拖垮全部。",
    "复利的意思是，你的收益开始产生自己的收益。",
  ],
  th: [
    "ETF คือตะกร้าหุ้นที่ซื้อได้ในเทรดเดียว",
    "หุ้นคือความเป็นเจ้าของชิ้นเล็ก ๆ ของบริษัทจริง",
    "ดัชนีคือภาพรวมตลาดทั้งหมด ให้คุณเห็นการเคลื่อนไหวเป็นตัวเลขเดียว",
    "การกระจายความเสี่ยงหมายถึงการลงทุนผิดตัวเดียวไม่ทำให้คุณเจ๊ง",
    "ผลตอบแทนทบต้นคือเมื่อกำไรของคุณเริ่มสร้างกำไรต่อ",
  ],
} as const;

export function getTrack(id: TrackId) {
  return TRACKS.find((track) => track.id === id) ?? TRACKS[0];
}

export function getTrackName(id: TrackId, lang: ScrollEducationLang) {
  return getTrack(id)[lang];
}

// Rhetorical figure only: how many lesson-sized slices the user's scroll
// time would equal. Never a study rate — nobody completes 42 lessons a day.
export function getLessonsPerDay(hours: number) {
  const safeHours = Number.isFinite(hours) && hours > 0 ? hours : 0;
  return Math.max(1, Math.floor((safeHours * 60) / LESSON_MINUTES));
}

// What the product actually asks for: FLIP_MINUTES_PER_DAY a day. This is
// the ONE rate every printed duration derives from.
export const FLIP_LESSONS_PER_DAY = Math.max(1, Math.floor(FLIP_MINUTES_PER_DAY / LESSON_MINUTES));

// Days to finish a track at the flip pace. Deliberately independent of the
// slider: the offer is 10 min/day regardless of how much a user scrolls.
// Deriving it from scroll time instead produced ceil(200/210) = 1 day and
// the "finish in under a week" claim that contradicted the ladder below it.
export function getDaysToFinishTrack(trackId: TrackId = "foundations") {
  return Math.max(1, Math.ceil((getTrack(trackId).lessons * LESSON_MINUTES) / FLIP_MINUTES_PER_DAY));
}

// Cumulative days to reach the end of each ladder rung, at the same pace.
export function getLadderSchedule() {
  let cumulative = 0;
  return LADDER_TRACKS.map((trackId) => {
    cumulative += getDaysToFinishTrack(trackId);
    return { trackId, days: cumulative };
  });
}

export function getLadderTotalDays() {
  const schedule = getLadderSchedule();
  return schedule[schedule.length - 1]?.days ?? 1;
}

// Rung captions ("Week 3", "Month 2") are derived, never hardcoded — the
// old fixed Week 1 / Month 1 / Month 6 labels disagreed with both the
// finish phrase and the milestone date.
export function formatRungLabel(days: number, lang: ScrollEducationLang) {
  const safeDays = Math.max(1, Math.ceil(Number.isFinite(days) ? days : 1));
  // Weeks up to 8; past that, months. Switching at 30 days collapsed the
  // last two ladder rungs onto the same caption.
  if (safeDays <= 56) {
    const weeks = Math.max(1, Math.ceil(safeDays / 7));
    if (lang === "zh-Hant") return `第${weeks}週`;
    if (lang === "zh-Hans") return `第${weeks}周`;
    if (lang === "th") return `สัปดาห์ที่ ${weeks}`;
    return `Week ${weeks}`;
  }
  const months = Math.max(1, Math.ceil(safeDays / 30));
  if (lang === "zh-Hant") return `第${months}個月`;
  if (lang === "zh-Hans") return `第${months}个月`;
  if (lang === "th") return `เดือนที่ ${months}`;
  return `Month ${months}`;
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

// Milestone = the end of the ladder at the flip pace. Previously a
// hardcoded +365 days that ignored daysToFinish entirely, which is how
// "in under a week", "Month 6" and "By July 2027" ended up on one screen.
export function getMilestoneDate(from = new Date(), days = getLadderTotalDays()) {
  const date = new Date(from);
  date.setDate(date.getDate() + Math.max(1, Math.ceil(days)));
  return date;
}

export function formatMilestoneDate(date: Date, lang: ScrollEducationLang) {
  if (lang === "zh-Hant" || lang === "zh-Hans") return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  // Deliberately Gregorian (not Buddhist era): the card mixes with an
  // English URL/hashtag, CE years are conventional in Thai fintech, and
  // shared-card years must compare across markets. See VOICE.md (th).
  if (lang === "th") return new Intl.DateTimeFormat("th-TH-u-ca-gregory", { month: "long", year: "numeric" }).format(date);
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
  const daysToFinish = getDaysToFinishTrack("foundations");
  const ladderTotalDays = getLadderTotalDays();
  const milestoneDate = getMilestoneDate(date, ladderTotalDays);
  const milestoneLabel = formatMilestoneDate(milestoneDate, lang);

  return {
    lessonsPerDay,
    flipLessonsPerDay: FLIP_LESSONS_PER_DAY,
    daysToFinish,
    ladderTotalDays,
    ladderSchedule: getLadderSchedule().map((rung) => ({ ...rung, label: formatRungLabel(rung.days, lang) })),
    finishPhrase: formatDaysToFinish(daysToFinish, lang),
    milestoneDate,
    milestoneLabel,
    microTakeaway: getDailyMicroTakeaway(lang, date),
    // Sits beside the "Flipping N min/day →" label on the share card, so it
    // must describe THAT input — not the user's whole scroll time. The old
    // line put lessonsPerDay (42 at 3.5 h) under a 10-min/day label.
    cardLine:
      lang === "zh-Hant"
        ? `每天 ${FLIP_LESSONS_PER_DAY} 課 · 課程完成於 ${milestoneLabel}`
        : lang === "zh-Hans"
          ? `每天 ${FLIP_LESSONS_PER_DAY} 课 · 课程完成于 ${milestoneLabel}`
          : lang === "th"
            ? `${FLIP_LESSONS_PER_DAY} บทเรียน/วัน · จบคอร์สภายใน${milestoneLabel}`
            : `${FLIP_LESSONS_PER_DAY} lessons/day · course done by ${milestoneLabel}`,
  };
}
