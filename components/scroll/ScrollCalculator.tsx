"use client";

import { ChangeEvent, KeyboardEvent, type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { appLinks, appStoreLinkForRegion } from "@/lib/site";
import { classifyParseOutcome, parseScreenTimeText, type AppRoast, type ParseFlag, type ParseOutcome, type ParsedScreenTime, type ScreenTimeLayout } from "@/lib/scroll/ocrSanitizer";
import { recognizeScreenTime } from "@/lib/scroll/ocrPipeline";
import { detectWebviewEnv, type WebviewEnv } from "@/lib/scroll/webview";
import { SCROLL_CAMPAIGN_UTM, SCROLL_DEEP_LINK_PARAMS, SCROLL_STANDINGS, detectScrollLocale, getRegionAverageHours, normalizeScrollLocale, scrollPercentile, type ScrollLocale, type ScrollRegion } from "@/lib/scroll/campaign";
import { FLIP_MINUTES_PER_DAY, LADDER_TRACKS, getEducationOutput, getTrackName } from "@/lib/scroll/education";
import { getArchetypeCopy, getScanStageMessage, getShareCaptionVariant, getTapeNote, type ScanStage } from "@/lib/scroll/personality";
import { getRankFrame } from "@/lib/scroll/rank";

const PUBLIC_HOME_URL = "https://www.neuralfin.ai";
const PUBLIC_SCROLL_LABEL = "www.neuralfin.ai/scroll";
const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const SLIDER_MIN_HOURS = 0.5;
const SLIDER_MAX_HOURS = 12;

// Region from the locale's region subtag (BCP-47 position), not a substring
// scan of the whole tag.
export function regionFromLocale(locale: string): ScrollRegion {
  const subtag = locale.split(/[-_]/).slice(1).find((part) => /^[A-Za-z]{2}$/.test(part))?.toLowerCase();
  if (subtag === "hk" || subtag === "mo") return "hk";
  if (subtag === "sg") return "sg";
  if (subtag === "th") return "th";
  return "ww";
}

// Days in the current year — a fixed 365 under-counts every leap year, and
// this feeds the card's headline number.
function daysInYear(date = new Date()) {
  const year = date.getFullYear();
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

// Axis labels sit at their own value's offset along the track. Positioning
// five mixed labels with `space-between` put "saint" at 3.4 h and
// "certified scroller" at 8.7 h — each two archetype bands from its name.
function trackOffsetPercent(hours: number) {
  const clamped = Math.max(SLIDER_MIN_HOURS, Math.min(SLIDER_MAX_HOURS, hours));
  return ((clamped - SLIDER_MIN_HOURS) / (SLIDER_MAX_HOURS - SLIDER_MIN_HOURS)) * 100;
}

// Anchoring the label by its own width fraction keeps it inside the track at
// both ends: centred mid-track, left-aligned at 0%, right-aligned at 100%.
// A flat translateX(-50%) hung "The Saint" 25px off the left edge and
// "Touch Grass Candidate" 61px off the right.
function tickStyle(hours: number): CSSProperties {
  const percent = trackOffsetPercent(hours);
  return { left: `${percent}%`, transform: `translateX(-${percent}%)` };
}


type Lang = ScrollLocale;
type TapeRow = { region: ScrollRegion; hours: number; flipped?: boolean };
type ScrollSummary = {
  useCommunity?: boolean;
  markets?: Partial<Record<ScrollRegion, { count: number; averageHours: number | null }>>;
  recent?: Array<{ hours: number; region: ScrollRegion }>;
};
type UploadStatus = "idle" | "received" | "read" | "failed" | "partial";
type ParsedScrollStat = { scrollHours: number; totalHours: number };
// Scan outcome stored as numbers, never formatted strings — the chip and
// notice re-derive on every render so a language switch re-localizes them.
type ScanResult =
  | { kind: "read"; verified: boolean; hours: number; scrollHours: number | null; totalHours: number | null; ratioScope: "day" | "week" | null }
  | { kind: "partial"; found: "apps" | "categories" }
  | { kind: "failed" };

const regionOrder: ScrollRegion[] = ["ww", "hk", "sg", "th"];

const demoTape: TapeRow[] = [
  { region: "hk", hours: 6.5 },
  { region: "sg", hours: 3 },
  { region: "th", hours: 8 },
  { region: "hk", hours: 2, flipped: true },
  { region: "sg", hours: 5.5 },
  { region: "hk", hours: 11 },
];

// Exported for locale tests: slot integrity and the zh-Hant/zh-Hans
// character-mirror contract are asserted against this table.
export const str = {
  en: {
    pill: "Built for the scroll generation",
    h1a: "Your scroll has a",
    sub: "Drag to your daily screen time. See the damage, see where you rank, post the card, then flip it green in the app.",
    steps: ["Upload", "See the damage", "Post it"],
    slider: "Your daily screen time",
    sliderSub: "count your scroll — social, video, games",
    hday: "h / day",
    // Numeric axis ticks only — archetype ticks derive from ARCHETYPES.
    axis: ["30 min", "6 h", "12 h"],
    regions: { ww: "Worldwide", hk: "Hong Kong", sg: "Singapore", th: "Thailand" },
    scrollpos: "Scroll position",
    openloss: "Open loss",
    verified: "Verified",
    hrsyr: "hours per year",
    pace: "at your current pace",
    learnpos: "Learning position",
    compounding: "Compounding",
    feedcould: "what your feed could have taught you",
    lessonYield: (hours: string, lessons: number, phrase: string, track: string) =>
      `Your ${hours}h/day = ${lessons} micro-lessons a day hiding in your scroll. You'd finish ${track} ${phrase}.`,
    lessonZero: "Lesson zero, free:",
    hyr: "h/yr",
    ladder: [
      ["Week 1", "What an ETF actually is", "and why everyone will not stop talking about them"],
      ["Month 1", "Read a balance sheet without sweating", "where the bodies are buried"],
      ["Month 6", "Build your first watchlist thesis", "an actual opinion, not a group-chat tip"],
    ],
    milestone: (date: string) => [
      "By " + date,
      "≈ a university intro-to-investing course",
      "funded entirely by your feed",
    ],
    dropTitle: "Upload your screen-time screenshot",
    dropSub: "Read on your device · never uploaded",
    dropHint: "iPhone: Settings → Screen Time · Android: Digital Wellbeing",
    dropReceived: "✓ Screenshot received",
    dropRead: (duration: string) => `✓ Read: ${duration}`,
    dropReadScrollDay: (scroll: string, total: string) => `${scroll} of scroll in your ${total} day`,
    dropReadScrollWeek: (scroll: string, total: string) => `${scroll} of scroll in your ${total} week`,
    dropReadScroll: (scroll: string) => `${scroll} of scroll time`,
    dropCouldnt: "Couldn't read that",
    dropReplace: "Use a different screenshot",
    dropDone: "We read {hours} h/day — look right?",
    dropDay: (duration: string) => `That's today's number (${duration}) — set. For your true average, upload the Week view.`,
    dropApps: "Couldn't read your hours — set them below.",
    dropPartialChip: "\u2713 Found your app list",
    dropAppsOnly: "Found your app list — but not your total. Scroll to the top of Screen Time and screenshot the daily average.",
    dropCategoriesOnly: "Found your categories — but not your total. Scroll to the top of Screen Time and screenshot the daily average.",
    longPressSave: "Long-press the image to save it",
    overlayClose: "Close",
    dropFail: "Couldn't read your hours — set them below.",
    orManual: "or drag it manually",
    priv: "Screenshots are read on your device and never uploaded. App names stay private unless you share them.",
    stand: "Market standings",
    standsub: "Ranked by % flipped — the market that turns scroll into skill wins.",
    standnote: "Demo data. Launch build: computed from the same anonymous aggregates (hours + market only). Pre-launch averages cite published statistics until community volume takes over.",
    // Shown once community averages replace the published ones. Formal
    // register: this is a data-handling statement (VOICE.md).
    standnoteLive: "Averages are live, computed from anonymous community results (hours and market only). Flip rate still cites published statistics until in-app data is available.",
    avgday: "avg / day",
    flipped: "flipped",
    youare: "your market",
    tape: "The tape",
    tapesub: "Recent scrolls, marked to market. Anonymous, always.",
    tapenote: "Demo data shown. Launch build: pre-launch ranks benchmark against published screen-time statistics (sourced); community tape activates once real results accumulate. Only hours + market are stored — nothing identifying.",
    f1: "Trading services provided through DL Securities (Hong Kong) Limited, a licensed corporation regulated by the SFC.",
    f2: "Screenshot analysis happens locally in your browser; images and app names are not uploaded or stored. Community stats are anonymous (hours and market only).",
    f3: "This page is a marketing illustration for education and entertainment. It is not financial advice, a forecast, or a projection of returns.",
    vbadge: "VERIFIED SCROLL",
    cardtitle: (year: number) => `My Scroll P&L · ${year}`,
    cardflip: `Flipping ${FLIP_MINUTES_PER_DAY} min/day →`,
    // Privacy-adjacent: formal register, no slang (VOICE.md).
    shareOptIn: "Add my result to the anonymous market stats (hours and market only)",
    // Blocking error state: formal register, no slang (VOICE.md).
    saveFailed: "Couldn't save the picture. Please try again, or screenshot the card.",
    challenge: "Are you down more than me?",
    scan: "Scan yours ↓",
    savebtn: "Download picture 📸",
    sticky1: "Flip your P&L for real",
    sticky2: "10 min/day in the NeuralFin app",
    anon: "anon",
    bench: "vs. published screen-time benchmarks",
    mostShorted: "Most shorted:",
    wkwks: "work wks",
    vsmkt: "vs market avg",
    youAt: (hours: string) => `You · ${hours}h`,
    scrollChip: (scroll: string, total: string) => `${scroll} of ${total} was scroll`,
    fun: (yr: number) => {
      if (yr < 500) return { title: "Every Star Wars film", sub: "...even the prequels.", num: `×${Math.round(yr / 25)}` };
      if (yr < 1200) return { title: "One full watch of Titanic", sub: "The boat sinks every time.", num: `×${Math.round(yr / 3.23)}` };
      return { title: "Flying HK → New York", sub: "Without the air miles.", num: `×${Math.round(yr / 16)}` };
    },
  },
  // REVIEWED-BY-MIRROR — character conversion (OpenCC-style s2t) of the
  // reviewed zh-Hans set below; vocabulary is NOT re-chosen, only script.
  // Source: reviewed zh-Hans (internal team, 2026-07-30). This replaces the
  // previous Cantonese-register Hant copy — see VOICE.md.
  // f1/f2/f3 below are converted legal text, COMPLIANCE-APPROVED 2026-07-31.
  "zh-Hant": {
    pill: "為滑屏世代而生",
    h1a: "你的滑屏也有",
    sub: "上傳你的每日屏幕時間。看看虧了多少、排第幾名、發卡挑戰朋友，再到 App 把它翻綠。",
    steps: ["上傳", "看看虧損", "發出去"],
    slider: "你的每日屏幕時間",
    sliderSub: "統計你的屏幕使用時間：社交、視頻、遊戲",
    hday: "小時／天",
    axis: ["30分鐘", "6小時", "12小時"],
    regions: { ww: "全球", hk: "香港", sg: "新加坡", th: "泰國" },
    scrollpos: "滑屏持倉",
    openloss: "浮虧",
    verified: "已驗證",
    hrsyr: "小時/年",
    pace: "照這個節奏",
    learnpos: "學習持倉",
    compounding: "複利中",
    feedcould: "同樣的時間，刷手機本可以教你這些",
    lessonYield: (hours: string, lessons: number, phrase: string, track: string) =>
      `你每天 ${hours} 小時 = ${lessons} 節微課藏在滑屏裡。${phrase}就能學完${track}。`,
    lessonZero: "第零課，免費：",
    hyr: "小時／年",
    // NOTE: the `when` column is no longer rendered — rung captions derive
    // from getLadderSchedule()/formatRungLabel.
    ladder: [
      ["第一週", "ETF到底是個啥？", "為什麼最近人人都在聊它"],
      ["第一個月", "教你輕鬆看懂資產負債表", "那些「貓膩」都藏在哪兒"],
      ["第六個月", "搭建你自己的第一份「自選股＋投資邏輯」", "有理有據的真觀點，告別群聊小道消息"],
    ],
    milestone: (date: string) => [
      `到${date}`,
      "你等於免費蹭完了一門大學投資入門課",
      "學費？零，全靠平時刷到的內容攢出來的",
    ],
    dropTitle: "上傳你的屏幕使用時間截圖",
    dropSub: "僅在本機讀取 · 絕不上傳",
    dropHint: "iPhone：設置 → 屏幕使用時間 · Android：數字健康",
    dropReceived: "✓ 已收到截圖",
    dropRead: (duration: string) => `✓ 已讀取：${duration}`,
    dropReadScrollDay: (scroll: string, total: string) => `滑屏${scroll} / 今日${total}`,
    dropReadScrollWeek: (scroll: string, total: string) => `滑屏${scroll} / 本週${total}`,
    dropReadScroll: (scroll: string) => `${scroll}滑屏時間`,
    dropCouldnt: "讀不到這張截圖",
    dropReplace: "換一張截圖",
    dropDone: "我們讀到 {hours} 小時／天——看起來對嗎？",
    dropDay: (duration: string) => `這是今天的數字（${duration}）——已設置。要看真實平均值，請上傳週視圖。`,
    dropApps: "讀不到你的時長——請在下面手動設置。",
    dropPartialChip: "\u2713 已找到你的 App 列表",
    dropAppsOnly: "找到了你的App使用列表，但沒找到總時長。請滑到「屏幕使用時間」頁面頂部，截圖那個「日均使用時長」。",
    dropCategoriesOnly: "找到了你的分類使用情況，但沒找到總時長。請滑到「屏幕使用時間」頁面頂部，截圖那個「日均使用時長」。",
    // Standard WeChat save pattern.
    longPressSave: "長按保存圖片",
    overlayClose: "關閉",
    dropFail: "讀不到你的時長——請在下面手動設置。",
    orManual: "或者手動拖一下",
    priv: "截圖僅在你的設備上讀取，絕不上傳。App名稱也不會外洩，除非你主動分享。",
    stand: "市場排行榜",
    standsub: "按「翻轉率」排名——誰把滑屏變成本事，誰就贏。",
    standnote: "演示數據。正式版將基於相同的匿名匯總數據（僅統計使用時長和市場）計算得出。上線初期的平均值先參考已公開的統計數據，等社區數據積累到一定規模後，再改用真實數據。",
    // DRAFT — native review required (new string; mirror of the zh-Hans line)
    standnoteLive: "平均值已改用匿名社區數據（僅時長與市場）計算。翻轉率仍引用公開統計數據，直到 App 端數據可用為止。",
    avgday: "平均／天",
    flipped: "已翻轉",
    youare: "你的市場",
    tape: "實時行情",
    tapesub: "最近刷過的內容，按市場實時計價。全程匿名",
    tapenote: "當前顯示的是演示數據。正式上線後：上線初期的排名先參照已公開的屏幕使用時間統計（會註明來源），等真實用戶數據積累到一定量後，「社區實時行情」功能將自動開啟。系統只記錄使用時長和所選市場，不會存儲任何能識別身份的信息。",
    // COMPLIANCE-APPROVED 2026-07-31 — converted legal text (s2t of the
    // zh-Hans f1/f2/f3), signed off for this script. Now frozen: do not
    // modify without a new approval (CLAUDE.md Hard Rule 3).
    f1: "交易服務由德林證券（香港）有限公司提供，該公司為香港證監會持牌法團。",
    f2: "截圖分析只在你的瀏覽器本地進行；圖片與 App 名稱不會上傳或存儲。社區統計為匿名（僅時長與市場）。",
    f3: "本頁為市場推廣示意，僅供教育與娛樂。不構成投資建議、預測或回報推算。",
    vbadge: "已驗證滑屏",
    cardtitle: (year: number) => `我的滑屏損益 · ${year}`,
    cardflip: `每天翻轉 ${FLIP_MINUTES_PER_DAY} 分鐘 →`,
    // Privacy-adjacent: formal register, no slang (VOICE.md).
    shareOptIn: "將我的結果加入匿名市場統計（僅時長與市場）",
    // Blocking error state: formal register, no slang (VOICE.md).
    saveFailed: "無法保存圖片。請重試，或直接為此卡片截圖。",
    challenge: "你虧得比我多嗎？",
    scan: "掃你的 ↓",
    savebtn: "下載圖片 📸",
    sticky1: "這一次，真正扭虧為盈",
    sticky2: "每天 10 分鐘，就在 NeuralFin App",
    anon: "匿名",
    bench: "對比公開屏幕時間基準",
    mostShorted: "最重倉：",
    wkwks: "個工作週",
    vsmkt: "對比市場平均",
    youAt: (hours: string) => `你 · ${hours}小時`,
    scrollChip: (scroll: string, total: string) => `${total}中有${scroll}是滑屏`,
    fun: (yr: number) => {
      if (yr < 500) return { title: "看完全部《星球大戰》", sub: "...連前傳都看了。", num: `×${Math.round(yr / 25)}` };
      if (yr < 1200) return { title: "等於看了《泰坦尼克號》", sub: "每次船都照樣沉", num: `×${Math.round(yr / 3.23)}遍` };
      return { title: "相當於飛了香港→紐約", sub: "但一里「飛行里程」都沒攢到。", num: `×${Math.round(yr / 16)}趟` };
    },
  },
  // REVIEWED — native review complete (reviewer: internal team, 2026-07-30).
  // zh-Hans is the reviewed source of truth for both Chinese scripts;
  // zh-Hant above is a character-conversion mirror of this set.
  "zh-Hans": {
    pill: "为滑屏世代而生",
    h1a: "你的滑屏也有",
    sub: "上传你的每日屏幕时间。看看亏了多少、排第几名、发卡挑战朋友，再到 App 把它翻绿。",
    steps: ["上传", "看看亏损", "发出去"],
    slider: "你的每日屏幕时间",
    sliderSub: "统计你的屏幕使用时间：社交、视频、游戏",
    hday: "小时／天",
    axis: ["30分钟", "6小时", "12小时"],
    regions: { ww: "全球", hk: "香港", sg: "新加坡", th: "泰国" },
    scrollpos: "滑屏持仓",
    openloss: "浮亏",
    verified: "已验证",
    hrsyr: "小时/年",
    pace: "照这个节奏",
    learnpos: "学习持仓",
    compounding: "复利中",
    feedcould: "同样的时间，刷手机本可以教你这些",
    // Reviewer's copy carried a literal "42"; restored to the ${lessons}
    // slot — the figure is slider-derived (see fun.* below, same class).
    lessonYield: (hours: string, lessons: number, phrase: string, track: string) =>
      `你每天 ${hours} 小时 = ${lessons} 节微课藏在滑屏里。${phrase}就能学完${track}。`,
    lessonZero: "第零课，免费：",
    hyr: "小时／年",
    // NOTE: the `when` column is no longer rendered — rung captions derive
    // from getLadderSchedule()/formatRungLabel. Reviewer's 第一周/第一个月/
    // 第六个月 are kept for the record but do not reach the UI.
    ladder: [
      ["第一周", "ETF到底是个啥？", "为什么最近人人都在聊它"],
      ["第一个月", "教你轻松看懂资产负债表", "那些“猫腻”都藏在哪儿"],
      ["第六个月", "搭建你自己的第一份“自选股＋投资逻辑”", "有理有据的真观点，告别群聊小道消息"],
    ],
    // Reviewer collapsed this to one sentence; split at her own punctuation
    // so it wraps across the milestone rung's three slots.
    milestone: (date: string) => [
      `到${date}`,
      "你等于免费蹭完了一门大学投资入门课",
      "学费？零，全靠平时刷到的内容攒出来的",
    ],
    dropTitle: "上传你的屏幕使用时间截图",
    dropSub: "仅在本机读取 · 绝不上传",
    dropHint: "iPhone：设置 → 屏幕使用时间 · Android：数字健康",
    dropReceived: "✓ 已收到截图",
    dropRead: (duration: string) => `✓ 已读取：${duration}`,
    dropReadScrollDay: (scroll: string, total: string) => `滑屏${scroll} / 今日${total}`,
    dropReadScrollWeek: (scroll: string, total: string) => `滑屏${scroll} / 本周${total}`,
    dropReadScroll: (scroll: string) => `${scroll}滑屏时间`,
    dropCouldnt: "读不到这张截图",
    dropReplace: "换一张截图",
    dropDone: "我们读到 {hours} 小时／天——看起来对吗？",
    dropDay: (duration: string) => `这是今天的数字（${duration}）——已设置。要看真实平均值，请上传周视图。`,
    dropApps: "读不到你的时长——请在下面手动设置。",
    dropPartialChip: "\u2713 已找到你的 App 列表",
    dropAppsOnly: "找到了你的App使用列表，但没找到总时长。请滑到“屏幕使用时间”页面顶部，截图那个“日均使用时长”。",
    dropCategoriesOnly: "找到了你的分类使用情况，但没找到总时长。请滑到“屏幕使用时间”页面顶部，截图那个“日均使用时长”。",
    // Standard WeChat save pattern.
    longPressSave: "长按保存图片",
    overlayClose: "关闭",
    dropFail: "读不到你的时长——请在下面手动设置。",
    orManual: "或者手动拖一下",
    priv: "截图仅在你的设备上读取，绝不上传。App名称也不会外泄，除非你主动分享。",
    stand: "市场排行榜",
    standsub: "按“翻转率”排名——谁把滑屏变成本事，谁就赢。",
    standnote: "演示数据。正式版将基于相同的匿名汇总数据（仅统计使用时长和市场）计算得出。上线初期的平均值先参考已公开的统计数据，等社区数据积累到一定规模后，再改用真实数据。",
    // DRAFT — native review required (new string)
    standnoteLive: "平均值已改用匿名社区数据（仅时长与市场）计算。翻转率仍引用公开统计数据，直到 App 端数据可用为止。",
    avgday: "平均／天",
    flipped: "已翻转",
    youare: "你的市场",
    tape: "实时行情",
    tapesub: "最近刷过的内容，按市场实时计价。全程匿名",
    tapenote: "当前显示的是演示数据。正式上线后：上线初期的排名先参照已公开的屏幕使用时间统计（会注明来源），等真实用户数据积累到一定量后，“社区实时行情”功能将自动开启。系统只记录使用时长和所选市场，不会存储任何能识别身份的信息。",
    f1: "交易服务由德林证券（香港）有限公司提供，该公司为香港证监会持牌法团。",
    f2: "截图分析只在你的浏览器本地进行；图片与 App 名称不会上传或存储。社区统计为匿名（仅时长与市场）。",
    f3: "本页为市场推广示意，仅供教育与娱乐。不构成投资建议、预测或回报推算。",
    vbadge: "已验证滑屏",
    cardtitle: (year: number) => `我的滑屏损益 · ${year}`,
    cardflip: `每天翻转 ${FLIP_MINUTES_PER_DAY} 分钟 →`,
    // Privacy-adjacent: formal register, no slang (VOICE.md).
    shareOptIn: "将我的结果加入匿名市场统计（仅时长与市场）",
    // Blocking error state: formal register, no slang (VOICE.md).
    saveFailed: "无法保存图片。请重试，或直接为此卡片截图。",
    challenge: "你亏得比我多吗？",
    scan: "扫你的 ↓",
    savebtn: "下载图片 📸",
    sticky1: "这一次，真正扭亏为盈",
    sticky2: "每天 10 分钟，就在 NeuralFin App",
    anon: "匿名",
    bench: "对比公开屏幕时间基准",
    mostShorted: "最重仓：",
    wkwks: "个工作周",
    vsmkt: "对比市场平均",
    youAt: (hours: string) => `你 · ${hours}小时`,
    scrollChip: (scroll: string, total: string) => `${total}中有${scroll}是滑屏`,
    fun: (yr: number) => {
      if (yr < 500) return { title: "看完全部《星球大战》", sub: "...连前传都看了。", num: `×${Math.round(yr / 25)}` };
      // Reviewer wrote the multiplier inline; the component renders it as a
      // separate `num` column, so it lives there and her wording splits
      // across title/sub. Rendered: "<title> <num>. <sub>".
      if (yr < 1200) return { title: "等于看了《泰坦尼克号》", sub: "每次船都照样沉", num: `×${Math.round(yr / 3.23)}遍` };
      return { title: "相当于飞了香港→纽约", sub: "但一里“飞行里程”都没攒到。", num: `×${Math.round(yr / 16)}趟` };
    },
  },
  // REVIEWED — native review complete (reviewer: native speaker,
  // 2026-07-31), all 119 rows. Thai-native internet register, not a literal
  // EN translation — see VOICE.md.
  // f1/f2/f3 were returned UNCHANGED by the reviewer and carry their own
  // compliance sign-off (COMPLIANCE-APPROVED 2026-07-31).
  th: {
    pill: "สร้างมาเพื่อสายไถฟีด",
    h1a: "การไถฟีดของคุณก็มี ",
    sub: "ไปที่เวลาหน้าจอเฉลี่ยต่อวันของคุณ ดูความเสียหาย ดูอันดับ โพสต์การ์ด แล้วพลิกให้เป็นสีเขียวในแอป",
    steps: ["อัปโหลด", "ดูความเสียหาย", "โพสต์เลย"],
    slider: "เวลาหน้าจอต่อวันของคุณ",
    sliderSub: "นับเวลาที่คุณไถฟีด — โซเชียล วิดีโอ และเกม",
    hday: "ชม. / วัน",
    axis: ["30 นาที", "6 ชม.", "12 ชม."],
    regions: { ww: "ทั่วโลก", hk: "ฮ่องกง", sg: "สิงคโปร์", th: "ไทย" },
    scrollpos: "สถานะไถฟีด",
    openloss: "ขาดทุน",
    verified: "ยืนยันแล้ว",
    hrsyr: "ชั่วโมงต่อปี",
    pace: "ตามอัตราปัจจุบัน",
    learnpos: "สถานะการเรียน",
    compounding: "กำลังทบต้น",
    feedcould: "สิ่งที่ฟีดของคุณสอนคุณได้",
    // Reviewer's copy carried a literal "42"; restored to the ${lessons}
    // slot — the figure is slider-derived.
    lessonYield: (hours: string, lessons: number, phrase: string, track: string) =>
      `เวลาไถฟีด ${hours} ชม./วัน = บทเรียนสั้น ${lessons} บท ซ่อนอยู่ในการไถฟีดของคุณ สามารถเรียนจบ ${track} ได้ ${phrase}`,
    lessonZero: "บทเรียนแรก ฟรี:",
    hyr: "ชม./ปี",
    // NOTE: the `when` column is no longer rendered — rung captions derive
    // from getLadderSchedule()/formatRungLabel. Reviewer's สัปดาห์ที่ 1 /
    // เดือนที่ 1 / เดือนที่ 6 are kept for the record but do not reach the UI.
    ladder: [
      ["สัปดาห์ที่ 1", "ETF คืออะไร?", "ทำไมทุกคนถึงพูดถึงมัน"],
      ["เดือนที่ 1", "อ่านงบดุลเป็นแบบเหงื่อไม่ตก", "รู้ว่าตัวเลขสำคัญอยู่ตรงไหน"],
      ["เดือนที่ 6", "สร้าง Watchlist หุ้นชุดแรกจากมุมมองของตัวเอง", "ไม่ใช่ทิปจากกลุ่มแชท"],
    ],
    milestone: (date: string) => [
      "ภายใน " + date,
      "≈ คอร์สปูพื้นการลงทุนระดับมหาวิทยาลัย",
      "สนับสนุนโดยฟีดของคุณล้วน ๆ",
    ],
    dropTitle: "อัปโหลดสกรีนช็อตเวลาหน้าจอของคุณ",
    dropSub: "อ่านบนอุปกรณ์ของคุณ · ไม่มีการอัปโหลด",
    dropHint: "iPhone: การตั้งค่า → เวลาหน้าจอ · Android: Digital Wellbeing",
    dropReceived: "✓ ได้รับสกรีนช็อตแล้ว",
    dropRead: (duration: string) => `✓ อ่านได้: ${duration}`,
    dropReadScrollDay: (scroll: string, total: string) => `ไถฟีดไป ${scroll} จากทั้งวัน ${total}`,
    dropReadScrollWeek: (scroll: string, total: string) => `ไถฟีดไป ${scroll} จากทั้งสัปดาห์ ${total}`,
    dropReadScroll: (scroll: string) => `เวลาไถฟีด ${scroll}`,
    dropCouldnt: "อ่านสกรีนช็อตนี้ไม่ได้",
    dropReplace: "ลองสกรีนช็อตอื่น",
    dropDone: "เราอ่านค่าได้ {hours} ชม./วัน — ถูกต้องไหม?",
    dropDay: (duration: string) => `ตัวเลขของวันนี้ (${duration}) — บันทึกให้แล้ว ถ้าอยากได้ค่าเฉลี่ยจริง อัปโหลดมุมมองรายสัปดาห์`,
    dropApps: "อ่านชั่วโมงของคุณไม่ได้ — ตั้งค่าเองด้านล่างได้เลย",
    dropPartialChip: "\u2713 พบรายการแอปของคุณแล้ว",
    dropAppsOnly: "พบรายการแอปแล้ว แต่ยังไม่พบยอดรวม เลื่อนขึ้นไปด้านบนสุดของหน้าเวลาหน้าจอ แล้วแคปภาพค่าเฉลี่ยรายวัน",
    dropCategoriesOnly: "พบหมวดหมู่แล้ว แต่ยังไม่พบยอดรวม เลื่อนขึ้นไปด้านบนสุดของหน้าเวลาหน้าจอ แล้วแคปภาพค่าเฉลี่ยรายวัน",
    longPressSave: "กดค้างที่ภาพเพื่อบันทึก",
    overlayClose: "ปิด",
    dropFail: "อ่านค่าชั่วโมงไม่ได้ — ตั้งค่าด้านล่างเองได้เลย",
    orManual: "หรือลากปรับก็ได้",
    priv: "อ่านภาพหน้าจอบนอุปกรณ์ของคุณเท่านั้น ไม่มีการอัปโหลด ชื่อแอปจะไม่ถูกเปิดเผย ยกเว้นคุณเลือกแชร์เอง",
    stand: "อันดับตลาด",
    standsub: "จัดอันดับตาม % ที่พลิกได้ ยิ่งเปลี่ยนเวลาไถฟีดเป็นทักษะได้มาก อันดับยิ่งสูง",
    standnote: "ข้อมูลตัวอย่าง เวอร์ชันเปิดตัว: คำนวณจากข้อมูลนิรนาม (ชั่วโมงการใช้งาน + ตลาดเท่านั้น) ช่วงก่อนเปิดตัว อ้างอิงค่าเฉลี่ยจากข้อมูลสาธารณะ จนกว่าจะมีข้อมูลจากผู้ใช้เพียงพอ",
    // DRAFT — native review required (new string, added after the th review)
    standnoteLive: "ค่าเฉลี่ยคำนวณจากข้อมูลชุมชนแบบไม่ระบุตัวตนแล้ว (เฉพาะชั่วโมงและตลาด) ส่วนอัตราการพลิกยังอ้างอิงสถิติสาธารณะ จนกว่าจะมีข้อมูลจากแอป",
    avgday: "เฉลี่ย / วัน",
    flipped: "พลิกแล้ว",
    youare: "ตลาดของคุณ",
    tape: "เทป",
    tapesub: "การไถล่าสุด ตีราคาตลาด นิรนามเสมอ",
    tapenote: "แสดงข้อมูลตัวอย่าง เวอร์ชันเปิดตัว: อันดับก่อนเปิดตัวจะเทียบกับสถิติเวลาหน้าจอที่เผยแพร่ (จากแหล่งอ้างอิง); ฟีดชุมชนจะเริ่มทำงานเมื่อมีผลลัพธ์จริงสะสมเข้ามา เราเก็บเฉพาะชั่วโมงใช้งานและข้อมูลตลาดเท่านั้น — ไม่มีข้อมูลระบุตัวตน",
    // COMPLIANCE-APPROVED 2026-07-31 — signed off for Thai. The native
    // reviewer returned these three UNCHANGED and native review does not
    // constitute compliance sign-off; this is the separate approval. Now
    // frozen: do not modify without a new one (CLAUDE.md Hard Rule 3). The
    // approved SFC rendering is สำนักงาน ก.ล.ต. ฮ่องกง (SFC).
    f1: "บริการซื้อขายให้บริการโดย DL Securities (Hong Kong) Limited ซึ่งเป็นบริษัทที่ได้รับใบอนุญาตและอยู่ภายใต้การกำกับดูแลของสำนักงาน ก.ล.ต. ฮ่องกง (SFC)",
    f2: "การวิเคราะห์สกรีนช็อตเกิดขึ้นในเบราว์เซอร์ของคุณเท่านั้น รูปภาพและชื่อแอปไม่ถูกอัปโหลดหรือจัดเก็บ สถิติชุมชนเป็นแบบนิรนาม (เฉพาะชั่วโมงและตลาด)",
    f3: "หน้านี้เป็นภาพประกอบทางการตลาดเพื่อการศึกษาและความบันเทิง ไม่ใช่คำแนะนำการลงทุน การคาดการณ์ หรือการประมาณผลตอบแทน",
    vbadge: "ยืนยันการไถฟีดแล้ว",
    // Reviewer's copy hardcoded "2026"; kept on the ${year} slot (B5).
    cardtitle: (year: number) => `P&L การไถฟีดของเรา · ${year}`,
    // Privacy-adjacent: formal register, no slang (VOICE.md).
    shareOptIn: "เพิ่มผลลัพธ์ของฉันในสถิติตลาดแบบไม่ระบุตัวตน (เฉพาะชั่วโมงและตลาด)",
    // Blocking error state: formal register, no slang (VOICE.md).
    saveFailed: "บันทึกรูปภาพไม่สำเร็จ กรุณาลองใหม่ หรือถ่ายภาพหน้าจอการ์ดนี้",
    cardflip: `พลิกให้เขียววันละ ${FLIP_MINUTES_PER_DAY} นาที →`,
    challenge: "คุณแดงหนักกว่าเราไหม?",
    scan: "สแกนของคุณ ↓",
    savebtn: "ดาวน์โหลดรูป 📸",
    sticky1: "พลิก P&L ของคุณ",
    sticky2: "วันละ 10 นาทีในแอป NeuralFin",
    anon: "นิรนาม",
    bench: "เทียบสถิติเวลาหน้าจอสาธารณะ",
    mostShorted: "ลบหนักสุด:",
    wkwks: "สัปดาห์ทำงาน",
    vsmkt: "เทียบค่าเฉลี่ยตลาด",
    youAt: (hours: string) => `คุณ · ${hours} ชม.`,
    // Reviewer wrote "⟨scroll⟩ ชม. จาก ⟨total⟩ ชม."; the slots are already
    // formatted durations that carry their own unit ("2 ชม. 41 นาที"), so
    // the extra ชม. is dropped to avoid "2 ชม. 41 นาที ชม.".
    scrollChip: (scroll: string, total: string) => `${scroll} จาก ${total} ใช้ไปกับการไถ`,
    fun: (yr: number) => {
      // Reviewer wrote the multiplier inline; the component renders it as a
      // separate `num` column, so it lives there and the wording splits
      // across title/sub. Rendered: "<title> <num>. <sub>".
      if (yr < 500) return { title: "ดู Star Wars ครบทุกภาค", sub: "...รวมพรีเควลด้วย", num: `×${Math.round(yr / 25)}` };
      if (yr < 1200) return { title: "ดู Titanic จบรอบ", sub: "...เรือจมทุกครั้ง", num: `×${Math.round(yr / 3.23)}` };
      return { title: "บินฮ่องกง → นิวยอร์ก", sub: "...ไม่ได้สะสมไมล์สักแต้ม", num: `×${Math.round(yr / 16)}` };
    },
  },
} as const;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function formatDurationFromHours(hours: number, lang: Lang) {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (lang === "zh-Hant") {
    if (wholeHours === 0) return `${minutes}分鐘`;
    if (minutes === 0) return `${wholeHours}小時`;
    return `${wholeHours}小時 ${minutes}分鐘`;
  }

  if (lang === "zh-Hans") {
    if (wholeHours === 0) return `${minutes}分钟`;
    if (minutes === 0) return `${wholeHours}小时`;
    return `${wholeHours}小时 ${minutes}分钟`;
  }

  if (lang === "th") {
    if (wholeHours === 0) return `${minutes} นาที`;
    if (minutes === 0) return `${wholeHours} ชม.`;
    return `${wholeHours} ชม. ${minutes} นาที`;
  }

  if (wholeHours === 0) return `${minutes}m`;
  if (minutes === 0) return `${wholeHours}h`;
  return `${wholeHours}h ${minutes}m`;
}

function roundSliderHours(hours: number) {
  return Math.round(hours * 10) / 10;
}

function appLink(base: string, hours: number, region: ScrollRegion, verified: boolean, lang: Lang) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(SCROLL_CAMPAIGN_UTM)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set(SCROLL_DEEP_LINK_PARAMS.hours, String(hours));
  url.searchParams.set(SCROLL_DEEP_LINK_PARAMS.region, region);
  url.searchParams.set(SCROLL_DEEP_LINK_PARAMS.verified, verified ? "1" : "0");
  url.searchParams.set(SCROLL_DEEP_LINK_PARAMS.lang, lang);
  return url.toString();
}

// Aggregate-only: enum fields, nothing else — no image data, no OCR text,
// no app names. Tells us which OEM layouts need fixtures post-launch and
// which degradation paths fire in the wild. Fire-and-forget: telemetry
// failure can never fail a parse.
function sendParseTelemetry(layout: ScreenTimeLayout, outcome: ParseOutcome, events: readonly ParseFlag[] = []) {
  const env: WebviewEnv = detectWebviewEnv(navigator.userAgent);
  void fetch("/api/scroll-telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout, outcome, env, ...(events.length ? { events } : {}) }),
    keepalive: true,
  }).catch(() => undefined);
}

async function parseScreenshot(file: File) {
  const { text, confidence, restrictedPassFailed } = await recognizeScreenTime(file);
  const parsed = parseScreenTimeText(text, confidence);
  return restrictedPassFailed ? { ...parsed, flags: [...parsed.flags, "restricted_pass_failed" as const] } : parsed;
}

// restricted_pass_failed alone doesn't demote a read — the fallback path may
// still parse cleanly — but every other flag makes it unverified.
function hasBlockingFlags(parsed: { flags: readonly string[] }) {
  return parsed.flags.some((flag) => flag !== "restricted_pass_failed");
}

// A read can be flag-free and still wrong, so the badge needs positive
// evidence rather than merely the absence of complaints.
const VERIFY_MIN_CONFIDENCE = 60;

// Category rows were recognized but the parser could not reconcile them
// against the headline (it suppressed the ratio). That is an explicit
// statement that the two numbers on the screenshot were not squared with
// each other — enough for the slider, not enough to assert VERIFIED.
//
// Only the "average" path attempts that reconciliation. The weekly-total
// path deliberately carries no scroll ratio, so its null scrollHours is by
// design and must not cost a correct weekly parse its badge.
function categoriesUnreconciled(parsed: ParsedScreenTime) {
  return parsed.source === "average" && parsed.sawCategories && parsed.scrollHours === null;
}

// The badge is the page's strongest claim: that this figure came from the
// user's own screenshot and was checked. Gate it on anchored source, clean
// flags, real OCR confidence, and a reconciled category cross-check.
export function canVerifyParse(parsed: ParsedScreenTime) {
  return Boolean(
    parsed.hours &&
      parsed.source !== "day-total" &&
      !hasBlockingFlags(parsed) &&
      !categoriesUnreconciled(parsed) &&
      parsed.confidence >= VERIFY_MIN_CONFIDENCE,
  );
}

export function ScrollCalculator() {
  const [hours, setHours] = useState(3.5);
  const [lang, setLang] = useState<Lang>("en");
  const [region, setRegion] = useState<ScrollRegion>("ww");
  const [verified, setVerified] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStage, setScanStage] = useState<ScanStage>("reading");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [parsedHours, setParsedHours] = useState<number | null>(null);
  const [parsedScrollStat, setParsedScrollStat] = useState<ParsedScrollStat | null>(null);
  const [appRoasts, setAppRoasts] = useState<AppRoast[]>([]);
  const [tapeRows, setTapeRows] = useState<TapeRow[]>(demoTape);
  const [saveOverlayUrl, setSaveOverlayUrl] = useState<string | null>(null);
  const [communityMarkets, setCommunityMarkets] = useState<ScrollSummary["markets"] | null>(null);
  const [shareStats, setShareStats] = useState(true);
  const [saveError, setSaveError] = useState(false);
  // Submit at most once per distinct result. Without this every click of the
  // download button filed another identical row, inflating the aggregate the
  // percentiles and standings are computed from.
  const submittedRef = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoursBlockRef = useRef<HTMLDivElement>(null);
  const hoursSliderRef = useRef<HTMLInputElement>(null);
  const uploadPreviewRef = useRef<string | null>(null);
  const autoFlipStartedRef = useRef(false);
  const autoFlipTimerRef = useRef<number | null>(null);
  const saveOverlayRef = useRef<string | null>(null);

  const t = str[lang];
  const regionName = t.regions[region];
  const yearDays = daysInYear();
  const yearly = Math.round(hours * yearDays);
  // Region-aware: changing the market now changes the comparison the rank
  // tile has always named.
  const percentile = scrollPercentile(hours, region);
  const fun = t.fun(yearly);
  const marketAverage = getRegionAverageHours(region);
  const diff = Math.round(((hours - marketAverage) / marketAverage) * 100);
  // Below the market average is the good direction on a loss-themed card,
  // so the chip is styled by valence, not by the sign of the number.
  const diffIsFavourable = diff < 0;
  const workWeeks = Math.round(yearly / 40);
  // Derived, not the frozen "+61" — that string sat in a slider-driven
  // column while never moving, and drifts the moment the flip target changes.
  const flipHoursPerYear = Math.round((FLIP_MINUTES_PER_DAY * yearDays) / 60);
  const archetype = getArchetypeCopy(hours, lang);
  const arch = archetype.title;
  const archSubtitle = archetype.subtitle;
  const rankFrame = getRankFrame(percentile, regionName, lang);
  const rankLine = rankFrame.title;
  // Fixed domain, so BOTH bars move. Normalising to max(you, avg) pinned
  // whichever bar led at 1/1.15 = 87% for every value, making 12 h vs 4.4 h
  // indistinguishable from 4.5 h vs 4.4 h.
  const maxBar = SLIDER_MAX_HOURS;
  const appStoreHref = appLink(appStoreLinkForRegion(region), hours, region, verified, lang);
  const playStoreHref = appLink(appLinks.googlePlay, hours, region, verified, lang);
  const rangeFill = ((hours - 0.5) / 11.5) * 100;
  const hasAppRoasts = appRoasts.length > 0;
  const appRoastText = appRoasts.map((app) => `${app.name} -${app.minutes}m`).join(" · ");
  const scrollCardStat = parsedScrollStat
    ? t.scrollChip(formatDurationFromHours(parsedScrollStat.scrollHours, lang), formatDurationFromHours(parsedScrollStat.totalHours, lang))
    : null;
  const education = getEducationOutput(hours, lang);
  const cardYear = new Date().getFullYear();
  // Rung captions come from the ladder schedule, not a frozen Week 1 /
  // Month 1 / Month 6 list that disagreed with the milestone below it.
  const ladderRows: Array<[string, string, string]> = [
    ...t.ladder.map(([, title, sub], index) => [
      education.ladderSchedule[index]?.label ?? "",
      title,
      sub,
    ] as [string, string, string]),
    t.milestone(education.milestoneLabel) as unknown as [string, string, string],
  ];
  const dropTitleText = scanning
    ? getScanStageMessage(lang, scanStage)
    : t.dropTitle;
  const readDurationText =
    scanResult?.kind === "read"
      ? scanResult.scrollHours && scanResult.totalHours
        ? (scanResult.ratioScope === "week" ? t.dropReadScrollWeek : t.dropReadScrollDay)(
            formatDurationFromHours(scanResult.scrollHours, lang),
            formatDurationFromHours(scanResult.totalHours, lang),
          )
        : scanResult.scrollHours
          ? t.dropReadScroll(formatDurationFromHours(scanResult.scrollHours, lang))
          : formatDurationFromHours(scanResult.hours, lang)
      : null;
  const scanNotice =
    scanResult === null
      ? null
      : scanResult.kind === "read"
        ? scanResult.verified
          ? t.dropDone.replace("{hours}", roundSliderHours(scanResult.hours).toFixed(1))
          : t.dropDay(formatDurationFromHours(scanResult.hours, lang))
        : scanResult.kind === "partial"
          ? scanResult.found === "apps"
            ? t.dropAppsOnly
            : t.dropCategoriesOnly
          : t.dropFail;
  const dropStateText = scanning
    ? t.dropReceived
    : uploadStatus === "read" && readDurationText
      ? t.dropRead(readDurationText)
      : uploadStatus === "partial"
        ? t.dropPartialChip
        : uploadStatus === "failed"
          ? t.dropCouldnt
          : t.dropTitle;

  // Worldwide is not a peer of its own members — it was being ranked against
  // HK/SG/TH and awarded 🥉 while Thailand got "—". Medals go to the actual
  // markets; Worldwide still renders, as a reference row.
  // Averages come from the community once there is enough of it; the flip
  // rate is an in-app behaviour the calculator cannot observe, so it stays
  // on published figures and the note below says which is which.
  const standings = useMemo(
    () =>
      SCROLL_STANDINGS.map((item) => {
        const live = communityMarkets?.[item.region];
        return live?.averageHours != null ? { ...item, averageHours: live.averageHours } : item;
      }),
    [communityMarkets],
  );
  const averagesAreLive = communityMarkets !== null;
  const sortedStandings = useMemo(
    () => [...standings].sort((a, b) => b.flippedPercent - a.flippedPercent),
    [standings],
  );
  const rankedMarkets = useMemo(() => sortedStandings.filter((item) => item.region !== "ww"), [sortedStandings]);

  useEffect(() => {
    // Parse the region SUBTAG rather than substring-matching the whole
    // locale string: "zh-Hant" contains no region but "…-TH" style
    // substrings can appear anywhere in a tag.
    const detectedRegion = regionFromLocale(navigator.language);
    setRegion(detectedRegion);

    // Precedence: URL param → stored manual choice → browser/region default.
    const requestedLang = normalizeScrollLocale(new URLSearchParams(window.location.search).get("lang"));
    const storedLang = normalizeScrollLocale(window.localStorage.getItem("scroll-calc-lang"));
    const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
    setLang(requestedLang ?? storedLang ?? detectScrollLocale(browserLanguages, detectedRegion));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem("scroll-calc-lang", lang);
  }, [lang]);

  useEffect(() => {
    fetch("/api/scroll-results/summary")
      .then((response) => (response.ok ? response.json() : null))
      .then((summary: ScrollSummary | null) => {
        if (!summary) return;
        if (summary.recent?.length) {
          setTapeRows(summary.recent.map((item) => ({ hours: item.hours, region: item.region })));
        }
        // Community averages replace the published figures only once the
        // threshold is met — below it the sample is too small to be honest.
        if (summary.useCommunity && summary.markets) setCommunityMarkets(summary.markets);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    return () => {
      if (autoFlipTimerRef.current !== null) {
        window.clearTimeout(autoFlipTimerRef.current);
      }
      if (uploadPreviewRef.current !== null) {
        URL.revokeObjectURL(uploadPreviewRef.current);
      }
      if (saveOverlayRef.current !== null) {
        URL.revokeObjectURL(saveOverlayRef.current);
      }
    };
  }, []);

  function replaceUploadPreview(file: File) {
    if (uploadPreviewRef.current !== null) {
      URL.revokeObjectURL(uploadPreviewRef.current);
    }
    const nextUrl = URL.createObjectURL(file);
    uploadPreviewRef.current = nextUrl;
    setUploadPreviewUrl(nextUrl);
  }

  // Opt-out, defaulting on. The payload stays {hours, region} — the same
  // anonymous contract the footer already discloses — but saving the card no
  // longer implies submitting, and the choice is stated at the button rather
  // than only in the compliance footer.
  async function submitResult() {
    if (!shareStats) return;
    const key = `${hours}|${region}`;
    if (submittedRef.current === key) return;
    submittedRef.current = key;
    await fetch("/api/scroll-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours, region }),
    }).catch(() => undefined);
  }

  function landOnHoursControl() {
    window.requestAnimationFrame(() => {
      hoursBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.requestAnimationFrame(() => {
        hoursSliderRef.current?.focus({ preventScroll: true });
      });
    });
  }

  function scheduleAutoFlip() {
    if (autoFlipStartedRef.current) return;
    autoFlipStartedRef.current = true;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = prefersReducedMotion ? 0 : 800;
    autoFlipTimerRef.current = window.setTimeout(() => {
      setFlipped(true);
      autoFlipTimerRef.current = null;
    }, delay);
  }

  async function handleScan(file?: File) {
    if (!file || scanning) return;
    replaceUploadPreview(file);
    setUploadStatus("received");
    setScanResult(null);
    setParsedScrollStat(null);
    setScanning(true);
    setScanStage("reading");
    const auditTimer = window.setTimeout(() => setScanStage("auditing"), 450);
    try {
      const parsed = await parseScreenshot(file);
      window.clearTimeout(auditTimer);
      sendParseTelemetry(parsed.layout, classifyParseOutcome(parsed), parsed.flags);
      setAppRoasts(parsed.apps);
      if (parsed.hours && canVerifyParse(parsed)) {
        setScanStage("success");
        await wait(350);
        const rounded = roundSliderHours(parsed.hours);
        setHours(rounded);
        setParsedHours(rounded);
        setParsedScrollStat(parsed.scrollHours && parsed.totalHours ? { scrollHours: parsed.scrollHours, totalHours: parsed.totalHours } : null);
        setVerified(true);
        setUploadStatus("read");
        setScanResult({ kind: "read", verified: true, hours: parsed.hours, scrollHours: parsed.scrollHours, totalHours: parsed.totalHours, ratioScope: parsed.ratioScope });
        scheduleAutoFlip();
      } else if (parsed.hours) {
        // Day-scoped totals and any flagged (degraded) read land here:
        // slider set, but never the verified badge.
        setScanStage("fail");
        await wait(500);
        setHours(roundSliderHours(parsed.hours));
        setParsedHours(null);
        setParsedScrollStat(parsed.scrollHours && parsed.totalHours ? { scrollHours: parsed.scrollHours, totalHours: parsed.totalHours } : null);
        setVerified(false);
        setUploadStatus("read");
        setScanResult({ kind: "read", verified: false, hours: parsed.hours, scrollHours: parsed.scrollHours, totalHours: parsed.totalHours, ratioScope: parsed.ratioScope });
        scheduleAutoFlip();
      } else if (parsed.apps.length > 0 || parsed.sawCategories) {
        // Partial parse: catalog-gated roasts may show (setAppRoasts above),
        // the slider stays manual, no badge — but the guidance is specific
        // to what WAS found (app list vs category list).
        setScanStage("fail");
        await wait(500);
        setParsedHours(null);
        setParsedScrollStat(null);
        setVerified(false);
        setUploadStatus("partial");
        setScanResult({ kind: "partial", found: parsed.apps.length > 0 ? "apps" : "categories" });
      } else {
        setScanStage("fail");
        await wait(500);
        setParsedHours(null);
        setParsedScrollStat(null);
        setVerified(false);
        setUploadStatus("failed");
        setScanResult({ kind: "failed" });
      }
    } catch {
      window.clearTimeout(auditTimer);
      sendParseTelemetry("unknown", "failed", ["ocr_exception"]);
      setScanStage("fail");
      await wait(500);
      setParsedHours(null);
      setParsedScrollStat(null);
      setVerified(false);
      setUploadStatus("failed");
      setScanResult({ kind: "failed" });
    } finally {
      setScanning(false);
      landOnHoursControl();
    }
  }

  function handleDropKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileRef.current?.click();
    }
  }

  function closeSaveOverlay() {
    if (saveOverlayRef.current !== null) {
      URL.revokeObjectURL(saveOverlayRef.current);
      saveOverlayRef.current = null;
    }
    setSaveOverlayUrl(null);
  }

  async function saveCard() {
    const node = cardRef.current;
    setSaveError(false);
    if (!node) {
      setSaveError(true);
      return;
    }
    // A zero-width node made pixelRatio Infinity, which failed toBlob and
    // returned silently. Guard the divisor and fall back to 1:1.
    const width = node.offsetWidth;
    const pixelRatio = width > 0 ? 1080 / width : 1;
    // Export the real DOM card node — parity with what the user sees is
    // true by construction. ~1080px wide at 320px card width.
    const { toBlob } = await import("html-to-image");
    // style.margin override: the clone otherwise inherits the computed
    // "margin: 0 auto" centering as a concrete left margin and renders the
    // card offset out of its own canvas.
    const blob = await toBlob(node, {
      pixelRatio,
      cacheBust: true,
      style: { margin: "0" },
    }).catch(() => null);
    if (!blob) {
      setSaveError(true);
      return;
    }
    const text = getShareCaptionVariant(lang, `-${fmt.format(yearly)}h`, rankLine);
    // In-app browsers (WeChat, LINE, IG/FB) don't reliably support blob
    // downloads or file share. The universal in-place pattern: show the
    // rendered PNG full-screen and let the user long-press to save.
    if (detectWebviewEnv(navigator.userAgent) !== "none") {
      if (saveOverlayRef.current !== null) URL.revokeObjectURL(saveOverlayRef.current);
      const overlayUrl = URL.createObjectURL(blob);
      saveOverlayRef.current = overlayUrl;
      setSaveOverlayUrl(overlayUrl);
      return;
    }
    const image = new File([blob], "my-scroll-pnl.png", { type: "image/png" });
    const shareData = { files: [image], title: "My Scroll P&L", text };
    if (navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "my-scroll-pnl.png";
    a.click();
    // Revoking on the same tick as the click races the download and yields a
    // failed or 0-byte file in Safari and Firefox. Release on a later tick.
    window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
    await navigator.clipboard?.writeText(text).catch(() => undefined);
  }

  return (
    <div className="scroll-campaign">
      <div className="scroll-wrap">
        <header className="scroll-header">
          <a className="scroll-logo" href={PUBLIC_HOME_URL} aria-label="NeuralFin home">
            <img src="/assets/neuralfin-logo-transparent-cropped.png" alt="NeuralFin" />
          </a>
          <div className="scroll-header-right">
            <div className="scroll-pill">{t.pill}</div>
            <div className="scroll-lang" role="group" aria-label="Language">
              <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")} type="button" aria-pressed={lang === "en"}>EN</button>
              <button className={lang === "zh-Hant" ? "on" : ""} onClick={() => setLang("zh-Hant")} type="button" aria-pressed={lang === "zh-Hant"} aria-label="繁體中文">繁</button>
              <button className={lang === "zh-Hans" ? "on" : ""} onClick={() => setLang("zh-Hans")} type="button" aria-pressed={lang === "zh-Hans"} aria-label="简体中文">简</button>
              <button className={lang === "th" ? "on" : ""} onClick={() => setLang("th")} type="button" aria-pressed={lang === "th"} aria-label="ภาษาไทย">ไทย</button>
            </div>
          </div>
        </header>

        <div className="scroll-topgrid">
          <section className="scroll-hero scroll-rise">
            <h1><span>{t.h1a}</span> <span className={flipped ? "gain-t" : "loss-t"}>P&amp;L.</span></h1>
            <p>{t.sub}</p>
            <div className="scroll-stepstrip" aria-label="Scroll calculator steps">
              {t.steps.map((step, index) => (
                <span key={step}>
                  {index > 0 ? <i aria-hidden="true">→</i> : null}
                  {step}
                </span>
              ))}
            </div>
          </section>

          <section className="scroll-calc scroll-rise d1" aria-label="Scroll calculator">
            <button
              className={`scroll-drop${scanning ? " scanning" : ""}`}
              type="button"
              onClick={() => fileRef.current?.click()}
              onKeyDown={handleDropKey}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void handleScan(event.dataTransfer.files[0]);
              }}
            >
              {uploadPreviewUrl ? (
                <span className="scroll-thumb" aria-hidden="true">
                  <img src={uploadPreviewUrl} alt="" />
                </span>
              ) : (
                <span className="di">📱</span>
              )}
              <b>{dropTitleText}</b>
              {uploadStatus !== "idle" ? (
                <span className={`scroll-upload-state ${uploadStatus === "failed" ? "bad" : "ok"}`}>{dropStateText}</span>
              ) : null}
              <span className="dsub">{t.dropSub}</span>
              <span className="dhint">{uploadStatus === "idle" ? t.dropHint : t.dropReplace}</span>
              <span className="beam" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                void handleScan(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <div className="scroll-hours-block" ref={hoursBlockRef}>
              {scanNotice ? (
                <p
                  id="scroll-scan-notice"
                  className={`scroll-scan-notice${verified ? " ok" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  {scanNotice}
                </p>
              ) : null}
              <div className="scroll-orsep"><span>{t.orManual}</span></div>
              <div className="scroll-row-label">
                <label htmlFor="hours">{t.slider}<span>{t.sliderSub}</span></label>
                <div className="scroll-val mono"><span>{hours.toFixed(1)}</span> {t.hday}</div>
              </div>
              <input
                ref={hoursSliderRef}
                id="hours"
                className="scroll-range"
                type="range"
                min="0.5"
                max="12"
                step="0.1"
                value={hours}
                aria-valuetext={`${hours.toFixed(1)} ${t.hday}`}
                aria-describedby={scanNotice ? "scroll-scan-notice" : undefined}
                style={{ "--fill": `${rangeFill}%` } as CSSProperties}
                onChange={(event) => {
                  scheduleAutoFlip();
                  const nextHours = Number(event.target.value);
                  const keepVerified = parsedHours !== null && Math.abs(nextHours - parsedHours) <= 0.5;
                  setHours(nextHours);
                  setParsedScrollStat(null);
                  setVerified(keepVerified);
                }}
              />
              <div className="scroll-scale">
                {[SLIDER_MIN_HOURS, 6, SLIDER_MAX_HOURS].map((tickHours, index) => (
                  <span key={tickHours} className="tick" style={tickStyle(tickHours)}>
                    {t.axis[index]}
                  </span>
                ))}
                {/* Archetype label rides the thumb, derived from the same
                    ARCHETYPES thresholds the card reads — so it can never
                    name a different band than the card does. */}
                <span className="tick arch" style={tickStyle(hours)}>{arch}</span>
              </div>
            </div>

            {/* One polite live region carrying the whole summary. Eight
                separate regions would talk over each other on every drag. */}
            <p className="scroll-sr-only" role="status" aria-live="polite">
              {`${hours.toFixed(1)} ${t.hday} · ${arch} · ${rankLine} · -${fmt.format(yearly)} ${t.hrsyr}`}
            </p>

            <div className="scroll-regions" role="group" aria-label="Compare against">
              {regionOrder.map((key) => (
                <button className={region === key ? "on" : ""} key={key} type="button" aria-pressed={region === key} onClick={() => setRegion(key)}>
                  {key === "ww" ? "🌏 " : ""}{t.regions[key]}
                </button>
              ))}
            </div>

            <div className="scroll-pos loss">
              <div className="name"><b>{t.scrollpos} <span className="tag l">{t.openloss}</span>{verified ? <span className="tag v">✓ {t.verified}</span> : null}</b><span>{t.hrsyr} · {t.pace}</span></div>
              <div className="num mono">-{fmt.format(yearly)} h</div>
            </div>
            <div className="scroll-pos rank">
              <div className="name"><b>{rankLine}</b><span>{rankFrame.subtitle} · {t.bench}</span></div>
              <div className="num mono">{rankFrame.displayPercent}</div>
            </div>
            <div className="scroll-pos loss">
              <div className="name"><b>{fun.title}</b><span>{fun.sub}</span></div>
              <div className="num mono">{fun.num}</div>
            </div>
            {hasAppRoasts ? (
              <div className="scroll-pos app-roast">
                <div className="name"><b>{t.mostShorted}</b><span>{appRoastText}</span></div>
              </div>
            ) : null}

            {flipped ? (
              <div className="scroll-flip-reveal">
                <div className="scroll-lesson-yield">
                  {t.lessonYield(hours.toFixed(1), education.lessonsPerDay, education.finishPhrase, getTrackName("foundations", lang))}
                </div>
                <div className="scroll-pos gain">
                  <div className="name"><b>{t.learnpos} <span className="tag g">{t.compounding}</span></b><span>{t.feedcould}</span></div>
                  <div className="num mono">+{fmt.format(flipHoursPerYear)} {t.hyr}</div>
                </div>
                {ladderRows.map(([when, title, sub], index) => (
                  <div className="scroll-rung" key={when} style={{ "--stagger": `${index * 90}ms` } as CSSProperties}>
                    <div className="when mono">{when}</div>
                    <div>
                      <span>{title}{index < LADDER_TRACKS.length ? <i>{getTrackName(LADDER_TRACKS[index], lang)}</i> : null}</span>
                      <span>{sub}</span>
                    </div>
                  </div>
                ))}
                <div className="scroll-lesson-zero">
                  <b>{t.lessonZero}</b>
                  <span>{education.microTakeaway}</span>
                </div>
              </div>
            ) : null}

            <section className="scroll-inline-card" aria-label="Your Scroll P&L card">
              <div className={`scroll-card${verified ? " verified" : ""}`} ref={cardRef}>
                <div className="glow r" /><div className="glow g" />
                {verified ? <div className="vbadge">✓ {t.vbadge}</div> : null}
                <div className="cb">{t.cardtitle(cardYear)}</div>
                <div className="big mono">-{fmt.format(yearly)}h</div>
                <div className="pace">{t.pace}</div>
                <div className="rankline">{rankLine} <span className="rk-emoji">{percentile < 50 ? "" : Math.max(1, 100 - percentile) <= 25 ? "💀" : "📉"}</span></div>
                <div><span className="arch">{arch}</span></div>
                <div className="arch-subtitle">{archSubtitle}</div>
                <div className="roast">{fun.title} {fun.num}. <i>{fun.sub}</i></div>
                {hasAppRoasts ? <div className="roast">{t.mostShorted} <b>{appRoastText}</b></div> : null}
                <div className="chips">
                  <span className="chip"><b>-{workWeeks}</b> {t.wkwks}</span>
                  <span className={`chip${diffIsFavourable ? " good" : ""}`}><b>{diff >= 0 ? "+" : ""}{diff}%</b> {t.vsmkt}</span>
                  {scrollCardStat ? <span className="chip"><b>{scrollCardStat}</b></span> : null}
                </div>
                <div className="vsbar">
                  <div className="vlabel"><span>{t.youAt(hours.toFixed(1))}</span><span>{t.regions[region]} avg · {marketAverage.toFixed(1)}h</span></div>
                  <div className="track you"><i style={{ width: `${Math.round((hours / maxBar) * 100)}%` }} /></div>
                  <div className="track mkt"><i style={{ width: `${Math.round((marketAverage / maxBar) * 100)}%` }} /></div>
                </div>
                <div className="div" />
                <div className="flipline"><span>{t.cardflip}</span><b>{education.cardLine}</b></div>
                <div className="cfoot">
                  <div className="challenge">{t.challenge}<br />{t.scan}</div>
                  <img className="qr" src="/assets/scroll-qr.png" alt="QR · neuralfin.ai" />
                </div>
                <div className="brand"><b><img src="/icon.png" alt="" />{PUBLIC_SCROLL_LABEL}</b><span>#ScrollAudit</span></div>
              </div>
              <button className="scroll-download" type="button" onClick={() => { void submitResult(); void saveCard(); }}>
                {t.savebtn}
              </button>
              {saveError ? (
                <p className="scroll-save-error" role="status" aria-live="polite">{t.saveFailed}</p>
              ) : null}
              {/* Stated at the button, not only in the compliance footer.
                  Unchecking stops the POST; the card still saves either way. */}
              <label className="scroll-optin">
                <input
                  type="checkbox"
                  checked={shareStats}
                  onChange={(event) => setShareStats(event.target.checked)}
                />
                <span>{t.shareOptIn}</span>
              </label>
              <div className="scroll-stores inline-stores">
                <a className="scroll-store-button" href={appStoreHref} aria-label="Download on the App Store"><img src="/assets/app-store.svg" alt="Download on the App Store" /></a>
                <a className="scroll-store-button" href={playStoreHref} aria-label="Get it on Google Play"><img src="/assets/google-play.svg" alt="Get it on Google Play" /></a>
              </div>
            </section>
            <p className="scroll-privnote">🔒 {t.priv}</p>
          </section>
        </div>

        <div className="scroll-botgrid">
          <section className="scroll-standings scroll-rise d2">
            <h2>{t.stand} 🏆</h2>
            <p className="ssub">{t.standsub}</p>
            {sortedStandings.map((item) => (
              <div className={`srow${rankedMarkets[0]?.region === item.region ? " leader" : ""}${item.region === region ? " you" : ""}`} key={item.region}>
                <div className="medal">{item.region === "ww" ? "🌏" : ["🥇", "🥈", "🥉"][rankedMarkets.indexOf(item)] ?? "—"}</div>
                <div className="mkt"><b>{item.region === "ww" ? "🌏 " : ""}{t.regions[item.region]}</b>{item.region === region ? <span>{t.youare}</span> : null}</div>
                <div className="avg mono">{item.averageHours.toFixed(1)}h<span>{t.avgday}</span></div>
                <div className="flippct mono">{item.flippedPercent}%<span>{t.flipped}</span></div>
              </div>
            ))}
            <p className="note">{averagesAreLive ? t.standnoteLive : t.standnote}</p>
          </section>

          <section className="scroll-tape scroll-rise d3">
            <h2>{t.tape} 📟</h2>
            <p className="tsub">{t.tapesub}</p>
            {tapeRows.map((row, index) => {
              const rowYear = Math.round(row.hours * yearDays);
              // Same percentile function and same region basis as the tile
              // and the card — and the same direction, so the green flipped
              // row no longer carries the worst-looking number on the board.
              const rowP = scrollPercentile(row.hours, row.region);
              return (
                <div className={`trow${row.flipped ? " flipped" : ""}`} key={`${row.region}-${row.hours}-${index}`}>
                  <span className="who"><b>{t.anon} · {t.regions[row.region]}</b> · {getTapeNote(lang, Boolean(row.flipped), index)}</span>
                  {/* Flipped rows report the same quantity as the rest of the
                      row (their own hours), not a constant "+10m". */}
                  <span><span className="tnum mono">{row.flipped ? `+${FLIP_MINUTES_PER_DAY}m` : `-${fmt.format(rowYear)}h`}</span><span className="pct mono">&gt;{rowP}%</span></span>
                </div>
              );
            })}
            <p className="note">{t.tapenote}</p>
          </section>
        </div>

        <footer className="scroll-footer">
          <b>NeuralFin Technologies</b> · <span>{t.f1}</span> <span>{t.f2}</span> <span>{t.f3}</span>
        </footer>
      </div>

      {saveOverlayUrl ? (
        <div className="scroll-save-overlay" role="dialog" aria-modal="true" aria-label={t.longPressSave}>
          <img src={saveOverlayUrl} alt="My Scroll P&L" />
          <p>{t.longPressSave}</p>
          <button type="button" onClick={closeSaveOverlay}>{t.overlayClose}</button>
        </div>
      ) : null}

      <div className="scroll-sticky">
        <div className="in">
          <div className="txt"><b>{t.sticky1}</b><span>{t.sticky2}</span></div>
          <div className="scroll-stores">
            <a className="scroll-store-button" href={appStoreHref} aria-label="Download on the App Store"><img src="/assets/app-store.svg" alt="Download on the App Store" /></a>
            <a className="scroll-store-button" href={playStoreHref} aria-label="Get it on Google Play"><img src="/assets/google-play.svg" alt="Get it on Google Play" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}
