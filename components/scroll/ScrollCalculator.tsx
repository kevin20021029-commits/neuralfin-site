"use client";

import { ChangeEvent, KeyboardEvent, type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { appLinks } from "@/lib/site";
import { classifyParseOutcome, parseScreenTimeText, type AppRoast, type ParseOutcome, type ScreenTimeLayout } from "@/lib/scroll/ocrSanitizer";
import { SCROLL_CAMPAIGN_UTM, SCROLL_DEEP_LINK_PARAMS, SCROLL_STANDINGS, normalPercentile, type ScrollRegion } from "@/lib/scroll/campaign";
import { FLIP_MINUTES_PER_DAY, LADDER_TRACKS, getEducationOutput, getTrackName } from "@/lib/scroll/education";
import { getArchetypeCopy, getScanStageMessage, getShareCaptionVariant, getTapeNote, type ScanStage } from "@/lib/scroll/personality";
import { getRankFrame } from "@/lib/scroll/rank";

const HRS_YR = 365;
const PUBLIC_HOME_URL = "https://www.neuralfin.ai";
const PUBLIC_SCROLL_LABEL = "www.neuralfin.ai/scroll";
const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

type Lang = "en" | "zh";
type TapeRow = { region: ScrollRegion; hours: number; flipped?: boolean };
type UploadStatus = "idle" | "received" | "read" | "failed";
type ParsedScrollStat = { scrollHours: number; totalHours: number };

const regionOrder: ScrollRegion[] = ["ww", "hk", "sg", "th"];

const demoTape: TapeRow[] = [
  { region: "hk", hours: 6.5 },
  { region: "sg", hours: 3 },
  { region: "th", hours: 8 },
  { region: "hk", hours: 2, flipped: true },
  { region: "sg", hours: 5.5 },
  { region: "hk", hours: 11 },
];

const str = {
  en: {
    pill: "Built for the scroll generation",
    h1a: "Your scroll has a",
    sub: "Drag to your daily screen time. See the damage, see where you rank, post the card, then flip it green in the app.",
    steps: ["Upload", "See the damage", "Post it"],
    slider: "Your daily screen time",
    sliderSub: "count your scroll — social, video, games",
    hday: "h / day",
    scales: ["30 min", "saint", "6 h", "certified scroller", "12 h"],
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
    dropReadScroll: (scroll: string) => `${scroll} of scroll time`,
    dropCouldnt: "Couldn't read that",
    dropReplace: "Use a different screenshot",
    dropDone: "We read {hours} h/day — look right?",
    dropDay: (duration: string) => `That's today's number (${duration}) — set. For your true average, upload the Week view.`,
    dropApps: "Couldn't read your hours — set them below.",
    dropFail: "Couldn't read your hours — set them below.",
    orManual: "or drag it manually",
    priv: "Screenshots are read on your device and never uploaded. App names stay private unless you share them.",
    stand: "Market standings",
    standsub: "Ranked by % flipped — the market that turns scroll into skill wins.",
    standnote: "Demo data. Launch build: computed from the same anonymous aggregates (hours + market only). Pre-launch averages cite published statistics until community volume takes over.",
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
    cardtitle: "My Scroll P&L · 2026",
    cardflip: `Flipping ${FLIP_MINUTES_PER_DAY} min/day →`,
    challenge: "Are you down more than me?",
    scan: "Scan yours ↓",
    savebtn: "Download picture 📸",
    sticky1: "Flip your P&L for real",
    sticky2: "10 min/day in the NeuralFin app",
    anon: "anon",
    bench: "vs. published screen-time benchmarks",
    mostShorted: "Most shorted:",
    scrollChip: (scroll: string, total: string) => `${scroll} of ${total} was scroll`,
    fun: (yr: number) => {
      if (yr < 500) return { title: "Every Star Wars film", sub: "...even the prequels.", num: `×${Math.round(yr / 25)}` };
      if (yr < 1200) return { title: "One full watch of Titanic", sub: "The boat sinks every time.", num: `×${Math.round(yr / 3.23)}` };
      return { title: "Flying HK → New York", sub: "Without the air miles.", num: `×${Math.round(yr / 16)}` };
    },
    nativeReview: "照這個節奏, zh step strip, zh track names, archetype subtitles, tape notes, scan stages, share variants, and micro-takeaway copy require native + compliance review before launch.",
  },
  zh: {
    pill: "為滑屏世代而生",
    h1a: "你的滑屏也有",
    sub: "拖到你的每日螢幕時間。看看虧了多少、排第幾名、發卡挑戰朋友，再到 App 把它翻綠。",
    steps: ["上傳", "看看虧損", "發出去"],
    slider: "你的每日螢幕時間",
    // DRAFT — native review required
    sliderSub: "計算你的滑屏：社交、影片、遊戲",
    hday: "小時／天",
    scales: ["30分鐘", "聖人", "6小時", "認證滑屏員", "12小時"],
    regions: { ww: "全球", hk: "香港", sg: "新加坡", th: "泰國" },
    scrollpos: "滑屏持倉",
    openloss: "未平虧損",
    verified: "已驗證",
    hrsyr: "每年時數",
    pace: "照這個節奏",
    learnpos: "學習持倉",
    compounding: "複利中",
    feedcould: "你的 feed 本來可以教你的",
    lessonYield: (hours: string, lessons: number, phrase: string, track: string) =>
      `你每天 ${hours} 小時 = ${lessons} 節微課藏在滑屏裡。你可在${phrase}完成${track}。`,
    lessonZero: "第零課，免費：",
    hyr: "小時／年",
    ladder: [
      ["第1週", "ETF 到底是什麼", "以及為什麼人人都在講"],
      ["第1個月", "看懂資產負債表不再冒汗", "知道數字藏在哪裡"],
      ["第6個月", "建立你第一個自選股觀點", "自己的判斷，不是群組貼士"],
    ],
    milestone: (date: string) => [
      date + "前",
      "≈ 一門大學投資入門課",
      "全由你的 feed 贊助",
    ],
    dropTitle: "上傳你的螢幕時間截圖",
    dropSub: "只在你的裝置上讀取 · 永不上傳",
    dropHint: "iPhone：設定 → 螢幕使用時間 · Android：數位健康",
    // DRAFT — native review required
    dropReceived: "✓ 已收到截圖",
    // DRAFT — native review required
    dropRead: (duration: string) => `✓ 已讀取：${duration}`,
    // DRAFT — native review required
    dropReadScrollDay: (scroll: string, total: string) => `${scroll}滑屏 / ${total}今日總時數`,
    // DRAFT — native review required
    dropReadScroll: (scroll: string) => `${scroll}滑屏時間`,
    // DRAFT — native review required
    dropCouldnt: "讀不到這張截圖",
    // DRAFT — native review required
    dropReplace: "改用另一張截圖",
    dropDone: "我們讀到 {hours} 小時／天——看起來對嗎？",
    // DRAFT — native review required
    dropDay: (duration: string) => `這是今天的數字（${duration}）——已設定。若要真實平均，請上傳週視圖。`,
    dropApps: "讀不到你的時數——請在下方手動設定。",
    dropFail: "讀不到你的時數——請在下方手動設定。",
    orManual: "或者手動拖一下",
    priv: "截圖只在你的裝置上讀取，永不上傳。App 名稱除非你分享，否則保密。",
    stand: "市場排行榜",
    standsub: "以「翻轉率」排名——哪個市場最會把滑屏變本事，誰就贏。",
    standnote: "目前為示範數據。正式版：由同一組匿名統計（僅時數＋市場）計算。上線初期平均值引用公開統計，社群數據足夠後切換。",
    avgday: "平均／天",
    flipped: "已翻轉",
    youare: "你的市場",
    tape: "即時行情",
    tapesub: "最新滑屏紀錄，逐筆入市。全部匿名。",
    tapenote: "目前為示範數據。正式版：上線初期以公開的螢幕時間統計（附來源）作基準；社群數據累積後切換為真實行情。只儲存時數＋市場，絕無任何識別資料。",
    f1: "交易服務由德林證券（香港）有限公司提供，該公司為香港證監會持牌法團。",
    f2: "截圖分析只在你的瀏覽器本機進行；圖片與 App 名稱不會上傳或儲存。社群統計為匿名（僅時數與市場）。",
    f3: "本頁為市場推廣示意，僅供教育與娛樂。不構成投資建議、預測或回報推算。",
    vbadge: "已驗證滑屏",
    cardtitle: "我的滑屏損益 · 2026",
    cardflip: `每天翻轉 ${FLIP_MINUTES_PER_DAY} 分鐘 →`,
    challenge: "你虧得比我多嗎？",
    scan: "掃你的 ↓",
    savebtn: "下載圖片 📸",
    sticky1: "真正翻轉你的損益",
    sticky2: "每天 10 分鐘，就在 NeuralFin App",
    anon: "匿名",
    bench: "對比公開螢幕時間統計",
    mostShorted: "最重倉：",
    // DRAFT — native review required
    scrollChip: (scroll: string, total: string) => `${total}中有${scroll}是滑屏`,
    fun: (yr: number) => {
      if (yr < 500) return { title: "看完全部《星球大戰》", sub: "...連前傳都看了。", num: `×${Math.round(yr / 25)}` };
      if (yr < 1200) return { title: "完整看完《鐵達尼號》", sub: "船每次都沉。", num: `×${Math.round(yr / 3.23)}` };
      return { title: "香港飛紐約", sub: "里數一分都沒有。", num: `×${Math.round(yr / 16)}` };
    },
    nativeReview: "「照這個節奏」、步驟提示、課程名稱、卡片副標、tape note、掃描狀態、分享文案與第零課文案需 native + compliance review。",
  },
} as const;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function formatDurationFromHours(hours: number, lang: Lang) {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (lang === "zh") {
    if (wholeHours === 0) return `${minutes}分鐘`;
    if (minutes === 0) return `${wholeHours}小時`;
    return `${wholeHours}小時 ${minutes}分鐘`;
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

// Aggregate-only: two enums, nothing else — no image data, no OCR text,
// no app names. Tells us which OEM layouts need fixtures post-launch.
function sendParseTelemetry(layout: ScreenTimeLayout, outcome: ParseOutcome) {
  void fetch("/api/scroll-telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout, outcome }),
    keepalive: true,
  }).catch(() => undefined);
}

async function parseScreenshot(file: File) {
  const mod = await import("tesseract.js");
  const worker = await mod.createWorker("eng+chi_tra+tha");
  try {
    const result = await worker.recognize(file);
    return parseScreenTimeText(result.data.text, result.data.confidence);
  } finally {
    await worker.terminate();
  }
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
  const [uploadReadDuration, setUploadReadDuration] = useState<string | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [parsedHours, setParsedHours] = useState<number | null>(null);
  const [parsedScrollStat, setParsedScrollStat] = useState<ParsedScrollStat | null>(null);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [appRoasts, setAppRoasts] = useState<AppRoast[]>([]);
  const [tapeRows, setTapeRows] = useState<TapeRow[]>(demoTape);
  const fileRef = useRef<HTMLInputElement>(null);
  const hoursBlockRef = useRef<HTMLDivElement>(null);
  const hoursSliderRef = useRef<HTMLInputElement>(null);
  const uploadPreviewRef = useRef<string | null>(null);
  const autoFlipStartedRef = useRef(false);
  const autoFlipTimerRef = useRef<number | null>(null);

  const t = str[lang];
  const regionName = t.regions[region];
  const yearly = Math.round(hours * HRS_YR);
  const percentile = normalPercentile(hours);
  const fun = t.fun(yearly);
  const marketAverage = SCROLL_STANDINGS.find((item) => item.region === region)?.averageHours ?? 4.4;
  const diff = Math.round(((hours - marketAverage) / marketAverage) * 100);
  const workWeeks = Math.round(yearly / 40);
  const archetype = getArchetypeCopy(hours, lang);
  const arch = archetype.title;
  const archSubtitle = archetype.subtitle;
  const rankFrame = getRankFrame(percentile, regionName, lang);
  const rankLine = rankFrame.title;
  const maxBar = Math.max(hours, marketAverage) * 1.15;
  const appStoreHref = appLink(appLinks.appStore, hours, region, verified, lang);
  const playStoreHref = appLink(appLinks.googlePlay, hours, region, verified, lang);
  const rangeFill = ((hours - 0.5) / 11.5) * 100;
  const hasAppRoasts = appRoasts.length > 0;
  const appRoastText = appRoasts.map((app) => `${app.name} -${app.minutes}m`).join(" · ");
  const scrollCardStat = parsedScrollStat
    ? t.scrollChip(formatDurationFromHours(parsedScrollStat.scrollHours, lang), formatDurationFromHours(parsedScrollStat.totalHours, lang))
    : null;
  const education = getEducationOutput(hours, lang);
  const ladderRows = [...t.ladder, t.milestone(education.milestoneLabel)];
  const dropTitleText = scanning
    ? getScanStageMessage(lang, scanStage)
    : t.dropTitle;
  const dropStateText = scanning
    ? t.dropReceived
    : uploadStatus === "read" && uploadReadDuration
      ? t.dropRead(uploadReadDuration)
      : uploadStatus === "failed"
        ? t.dropCouldnt
      : t.dropTitle;

  const sortedStandings = useMemo(
    () => [...SCROLL_STANDINGS].sort((a, b) => b.flippedPercent - a.flippedPercent),
    [],
  );

  useEffect(() => {
    const requestedLang = new URLSearchParams(window.location.search).get("lang");
    if (requestedLang === "en" || requestedLang === "zh") {
      setLang(requestedLang);
    }
    const storedLang = window.localStorage.getItem("scroll-calc-lang");
    if (requestedLang !== "en" && requestedLang !== "zh" && (storedLang === "en" || storedLang === "zh")) {
      setLang(storedLang);
    }
    const locale = navigator.language.toLowerCase();
    if (locale.includes("hk")) setRegion("hk");
    else if (locale.includes("sg")) setRegion("sg");
    else if (locale.includes("th")) setRegion("th");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    window.localStorage.setItem("scroll-calc-lang", lang);
  }, [lang]);

  useEffect(() => {
    fetch("/api/scroll-results/summary")
      .then((response) => (response.ok ? response.json() : null))
      .then((summary: { recent?: Array<{ hours: number; region: ScrollRegion }> } | null) => {
        if (!summary?.recent?.length) return;
        setTapeRows(summary.recent.map((item) => ({ hours: item.hours, region: item.region })));
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

  async function submitResult() {
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
    setUploadReadDuration(null);
    setParsedScrollStat(null);
    setScanning(true);
    setScanStage("reading");
    setScanNotice(null);
    const auditTimer = window.setTimeout(() => setScanStage("auditing"), 450);
    try {
      const parsed = await parseScreenshot(file);
      window.clearTimeout(auditTimer);
      sendParseTelemetry(parsed.layout, classifyParseOutcome(parsed));
      setAppRoasts(parsed.apps);
      if (parsed.hours && parsed.source !== "day-total") {
        setScanStage("success");
        await wait(350);
        const rounded = roundSliderHours(parsed.hours);
        const duration = formatDurationFromHours(parsed.hours, lang);
        const scrollReadText = parsed.scrollHours && parsed.totalHours
          ? t.dropReadScrollDay(formatDurationFromHours(parsed.scrollHours, lang), formatDurationFromHours(parsed.totalHours, lang))
          : parsed.scrollHours
            ? t.dropReadScroll(formatDurationFromHours(parsed.scrollHours, lang))
            : duration;
        setHours(rounded);
        setParsedHours(rounded);
        setParsedScrollStat(parsed.scrollHours && parsed.totalHours ? { scrollHours: parsed.scrollHours, totalHours: parsed.totalHours } : null);
        setVerified(true);
        setUploadStatus("read");
        setUploadReadDuration(scrollReadText);
        setScanNotice(t.dropDone.replace("{hours}", rounded.toFixed(1)));
        scheduleAutoFlip();
      } else if (parsed.hours && parsed.source === "day-total") {
        setScanStage("fail");
        await wait(500);
        const rounded = roundSliderHours(parsed.hours);
        const duration = formatDurationFromHours(parsed.hours, lang);
        const scrollReadText = parsed.scrollHours && parsed.totalHours
          ? t.dropReadScrollDay(formatDurationFromHours(parsed.scrollHours, lang), formatDurationFromHours(parsed.totalHours, lang))
          : parsed.scrollHours
            ? t.dropReadScroll(formatDurationFromHours(parsed.scrollHours, lang))
            : duration;
        setHours(rounded);
        setParsedHours(null);
        setParsedScrollStat(parsed.scrollHours && parsed.totalHours ? { scrollHours: parsed.scrollHours, totalHours: parsed.totalHours } : null);
        setVerified(false);
        setUploadStatus("read");
        setUploadReadDuration(scrollReadText);
        setScanNotice(t.dropDay(duration));
        scheduleAutoFlip();
      } else if (parsed.apps.length > 0) {
        setScanStage("fail");
        await wait(500);
        setParsedHours(null);
        setParsedScrollStat(null);
        setVerified(false);
        setUploadStatus("failed");
        setScanNotice(t.dropApps);
      } else {
        setScanStage("fail");
        await wait(500);
        setParsedHours(null);
        setParsedScrollStat(null);
        setVerified(false);
        setUploadStatus("failed");
        setScanNotice(t.dropFail);
      }
    } catch {
      window.clearTimeout(auditTimer);
      sendParseTelemetry("unknown", "failed");
      setScanStage("fail");
      await wait(500);
      setParsedHours(null);
      setParsedScrollStat(null);
      setVerified(false);
      setUploadStatus("failed");
      setScanNotice(t.dropFail);
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

  function drawCard() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1740;
    const c = canvas.getContext("2d");
    if (!c) return canvas;
    const ctx = c;
    const W = canvas.width;
    const H = canvas.height;
    const PAD = 84;
    function fillFitText(text: string, x: number, y: number, maxWidth: number, size: number, weight = 800) {
      let fontSize = size;
      do {
        ctx.font = `${weight} ${fontSize}px Inter, -apple-system, sans-serif`;
        if (ctx.measureText(text).width <= maxWidth || fontSize <= 24) break;
        fontSize -= 2;
      } while (fontSize > 24);
      ctx.fillText(text, x, y);
    }
    const bg = c.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#06100d");
    bg.addColorStop(0.55, "#0a1713");
    bg.addColorStop(1, "#07120f");
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(255,92,108,.22)";
    c.beginPath();
    c.arc(W - 80, 80, 360, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(0,230,138,.20)";
    c.beginPath();
    c.arc(80, H - 100, 390, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#f7fbf7";
    c.font = "800 34px Inter, -apple-system, sans-serif";
    c.fillText(t.cardtitle.toUpperCase(), PAD, 200);
    if (verified) {
      c.fillStyle = "#EDDBA8";
      c.font = "700 28px Inter, -apple-system, sans-serif";
      c.fillText(`✓ ${t.vbadge}`, W - 390, 200);
    }
    c.fillStyle = "#FF5C6C";
    c.font = "800 170px Consolas, monospace";
    c.fillText(`-${fmt.format(yearly)}h`, PAD - 6, 350);
    c.fillStyle = "rgba(247,251,247,.68)";
    c.font = "600 34px Inter, -apple-system, sans-serif";
    c.fillText(t.pace, PAD, 400);
    c.fillStyle = "#EDDBA8";
    c.font = "700 46px Inter, -apple-system, sans-serif";
    c.fillText(rankLine, PAD, 470);
    c.strokeStyle = "#FF5C6C";
    c.lineWidth = 3;
    c.strokeRect(PAD, 514, Math.min(720, arch.length * 24 + 64), 62);
    c.fillStyle = "#FF5C6C";
    c.font = "900 34px Inter, -apple-system, sans-serif";
    c.fillText(arch.toUpperCase(), PAD + 22, 556);
    c.fillStyle = "rgba(247,251,247,.58)";
    c.font = "600 28px Inter, -apple-system, sans-serif";
    c.fillText(archSubtitle, PAD, 614);
    c.fillStyle = "#f7fbf7";
    c.font = "600 40px Inter, -apple-system, sans-serif";
    c.fillText(`${fun.title} ${fun.num}.`, PAD, 668);
    c.fillStyle = "rgba(247,251,247,.68)";
    c.font = "italic 36px Inter, -apple-system, sans-serif";
    c.fillText(fun.sub, PAD, 724);
    if (hasAppRoasts) {
      c.font = "600 34px Inter, -apple-system, sans-serif";
      c.fillText(`${t.mostShorted} ${appRoastText}`, PAD, 788);
    }
    c.font = "600 32px Inter, -apple-system, sans-serif";
    c.fillStyle = "#f7fbf7";
    c.fillText(`-${workWeeks} ${lang === "zh" ? "個工作週" : "work wks"}`, PAD, 850);
    c.fillText(`${diff >= 0 ? "+" : ""}${diff}% ${lang === "zh" ? "對比市場平均" : "vs market avg"}`, PAD + 360, 850);
    if (scrollCardStat) {
      c.fillStyle = "rgba(247,251,247,.68)";
      fillFitText(scrollCardStat, PAD, 902, 720, 28);
    }
    c.strokeStyle = "rgba(255,255,255,.12)";
    c.setLineDash([12, 12]);
    c.beginPath();
    c.moveTo(PAD, 960);
    c.lineTo(W - PAD, 960);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = "rgba(247,251,247,.68)";
    c.font = "400 38px Inter, -apple-system, sans-serif";
    c.fillText(t.cardflip, PAD, 1060);
    c.fillStyle = "#00e68a";
    fillFitText(education.cardLine, PAD, 1124, W - PAD * 2, 34);
    c.fillStyle = "#f7fbf7";
    c.font = "700 42px Inter, -apple-system, sans-serif";
    c.fillText(t.challenge, PAD, H - 260);
    c.fillText(t.scan, PAD, H - 202);
    c.font = "700 36px Inter, -apple-system, sans-serif";
    c.fillText(PUBLIC_SCROLL_LABEL, PAD, H - 92);
    c.fillStyle = "rgba(247,251,247,.68)";
    c.fillText("#ScrollAudit", W - 310, H - 92);
    return canvas;
  }

  async function saveCard() {
    const canvas = drawCard();
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const image = new File([blob], "my-scroll-pnl.png", { type: "image/png" });
      const text = getShareCaptionVariant(lang, `-${fmt.format(yearly)}h`, rankLine);
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
      URL.revokeObjectURL(href);
      await navigator.clipboard?.writeText(text).catch(() => undefined);
    }, "image/png");
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
              <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")} type="button">EN</button>
              <button className={lang === "zh" ? "on" : ""} onClick={() => setLang("zh")} type="button">中文</button>
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
              <div className="scroll-scale">{t.scales.map((label) => <span key={label}>{label}</span>)}</div>
            </div>

            <div className="scroll-regions" role="group" aria-label="Compare against">
              {regionOrder.map((key) => (
                <button className={region === key ? "on" : ""} key={key} type="button" onClick={() => setRegion(key)}>
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
                  <div className="num mono">+61 {t.hyr}</div>
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
              <div className={`scroll-card${verified ? " verified" : ""}`}>
                <div className="glow r" /><div className="glow g" />
                {verified ? <div className="vbadge">✓ {t.vbadge}</div> : null}
                <div className="cb">{t.cardtitle}</div>
                <div className="big mono">-{fmt.format(yearly)}h</div>
                <div className="pace">{t.pace}</div>
                <div className="rankline">{rankLine} {percentile < 50 ? "" : Math.max(1, 100 - percentile) <= 25 ? "💀" : "📉"}</div>
                <div><span className="arch">{arch}</span></div>
                <div className="arch-subtitle">{archSubtitle}</div>
                <div className="roast">{fun.title} {fun.num}. <i>{fun.sub}</i></div>
                {hasAppRoasts ? <div className="roast">{t.mostShorted} <b>{appRoastText}</b></div> : null}
                <div className="chips">
                  <span className="chip"><b>-{workWeeks}</b> {lang === "zh" ? "個工作週" : "work wks"}</span>
                  <span className="chip"><b>{diff >= 0 ? "+" : ""}{diff}%</b> {lang === "zh" ? "對比市場平均" : "vs market avg"}</span>
                  {scrollCardStat ? <span className="chip"><b>{scrollCardStat}</b></span> : null}
                </div>
                <div className="vsbar">
                  <div className="vlabel"><span>{lang === "zh" ? `你 · ${hours.toFixed(1)}小時` : `You · ${hours.toFixed(1)}h`}</span><span>{t.regions[region]} avg · {marketAverage.toFixed(1)}h</span></div>
                  <div className="track you"><i style={{ width: `${Math.round((hours / maxBar) * 100)}%` }} /></div>
                  <div className="track mkt"><i style={{ width: `${Math.round((marketAverage / maxBar) * 100)}%` }} /></div>
                </div>
                <div className="div" />
                <div className="flipline"><span>{t.cardflip}</span><b>{education.cardLine}</b></div>
                <div className="challenge">{t.challenge}<br />{t.scan}</div>
                <div className="brand"><b><img src="/icon.png" alt="" />{PUBLIC_SCROLL_LABEL}</b><span>#ScrollAudit</span></div>
              </div>
              <button className="scroll-download" type="button" onClick={() => { void submitResult(); void saveCard(); }}>
                {t.savebtn}
              </button>
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
            {sortedStandings.map((item, index) => (
              <div className={`srow${index === 0 ? " leader" : ""}${item.region === region ? " you" : ""}`} key={item.region}>
                <div className="medal">{["🥇", "🥈", "🥉", "—"][index]}</div>
                <div className="mkt"><b>{item.region === "ww" ? "🌏 " : ""}{t.regions[item.region]}</b>{item.region === region ? <span>{t.youare}</span> : null}</div>
                <div className="avg mono">{item.averageHours.toFixed(1)}h<span>{t.avgday}</span></div>
                <div className="flippct mono">{item.flippedPercent}%<span>{t.flipped}</span></div>
              </div>
            ))}
            <p className="note">{t.standnote}</p>
          </section>

          <section className="scroll-tape scroll-rise d3">
            <h2>{t.tape} 📟</h2>
            <p className="tsub">{t.tapesub}</p>
            {tapeRows.map((row, index) => {
              const rowYear = Math.round(row.hours * HRS_YR);
              const rowP = normalPercentile(row.hours);
              const rowTop = Math.max(1, 100 - rowP);
              return (
                <div className={`trow${row.flipped ? " flipped" : ""}`} key={`${row.region}-${row.hours}-${index}`}>
                  <span className="who"><b>{t.anon} · {t.regions[row.region]}</b> · {getTapeNote(lang, Boolean(row.flipped), index)}</span>
                  <span><span className="tnum mono">{row.flipped ? "+10m" : `-${fmt.format(rowYear)}h`}</span><span className="pct mono">Top {rowTop}%</span></span>
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
