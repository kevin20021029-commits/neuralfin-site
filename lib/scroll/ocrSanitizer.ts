export type AppRoast = {
  name: string;
  minutes: number;
};

export type ParsedScreenTime = {
  hours: number | null;
  source: "average" | "weekly-total" | "day-total" | null;
  totalHours: number | null;
  scrollHours: number | null;
  apps: AppRoast[];
  confidence: number;
};

type RawAppLine = {
  rawName: string;
  minutes: number;
};

type RawParsedScreenTime = {
  hours: number | null;
  source: ParsedScreenTime["source"];
  totalHours?: number | null;
  scrollHours?: number | null;
  apps: RawAppLine[];
  confidence: number;
};

const APP_MATCH_THRESHOLD = 0.8;
const SCROLL_CATEGORIES = ["social", "video", "entertainment", "games"] as const;

const appCatalog = [
  { display: "TikTok", variants: ["tiktok", "tik tok", "抖音", "douyin", "ติ๊กต็อก"] },
  { display: "WeChat", variants: ["wechat", "we chat", "微信", "weixin", "วีแชท"] },
  { display: "Instagram", variants: ["instagram", "ig", "อินสตาแกรม"] },
  { display: "YouTube", variants: ["youtube", "you tube", "yt", "ยูทูบ"] },
  { display: "Facebook", variants: ["facebook", "fb", "เฟซบุ๊ก", "เฟสบุ๊ค"] },
  { display: "X", variants: ["x", "twitter", "ทวิตเตอร์"] },
  { display: "Threads", variants: ["threads", "เธรดส์"] },
  { display: "Xiaohongshu", variants: ["xiaohongshu", "red", "小红书", "小紅書", "little red book"] },
  { display: "LINE", variants: ["line", "ไลน์"] },
  { display: "Telegram", variants: ["telegram", "เทเลแกรม"] },
  { display: "WhatsApp", variants: ["whatsapp", "what's app", "วอตส์แอป", "วอทส์แอป"] },
  { display: "Snapchat", variants: ["snapchat", "snap", "สแนปแชต"] },
  { display: "Reddit", variants: ["reddit", "เรดดิท"] },
  { display: "Safari", variants: ["safari", "ซาฟารี"] },
  { display: "Chrome", variants: ["chrome", "google chrome", "โครม"] },
  { display: "Maps", variants: ["maps", "google maps", "apple maps", "地图", "地圖", "แผนที่"] },
  { display: "Photos", variants: ["photos", "google photos", "相簿", "照片", "รูปภาพ"] },
  { display: "Netflix", variants: ["netflix", "เน็ตฟลิกซ์"] },
  { display: "Spotify", variants: ["spotify", "สปอติฟาย"] },
] as const;

const scrollCategoryCatalog = [
  { id: "social", variants: ["social", "social networking", "social media", "社交", "โซเชียล", "สังคม"] },
  { id: "video", variants: ["video", "videos", "影片", "视频", "วิดีโอ"] },
  { id: "entertainment", variants: ["entertainment", "娛樂", "娱乐", "ความบันเทิง"] },
  { id: "games", variants: ["games", "game", "遊戲", "游戏", "เกม"] },
] as const;

const excludedCategoryCatalog = [
  "productivity",
  "finance",
  "productivity & finance",
  "travel",
  "navigation",
  "creativity",
  "information",
  "reading",
  "information & reading",
  "utilities",
  "utility",
  "communication",
  "生產力",
  "生产力",
  "效率",
  "財務",
  "财务",
  "金融",
  "旅行",
  "導航",
  "导航",
  "創意",
  "创意",
  "資訊",
  "信息",
  "閱讀",
  "阅读",
  "工具",
  "實用工具",
  "实用工具",
  "通訊",
  "通讯",
  "通信",
  "การทำงาน",
  "การเงิน",
  "เดินทาง",
  "นำทาง",
  "สร้างสรรค์",
  "ข้อมูล",
  "การอ่าน",
  "เครื่องมือ",
  "ยูทิลิตี้",
  "การสื่อสาร",
] as const;

function normalizeOcrText(text: string) {
  return text
    .replace(/[：﹕]/g, ":")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAppName(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^a-z0-9\u0E00-\u0E7F\u3400-\u9FFF]+/g, "");
}

function levenshteinDistance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if ((a.length >= 3 && b.includes(a)) || (b.length >= 3 && a.includes(b))) return 0.96;
  const maxLength = Math.max(a.length, b.length);
  return (maxLength - levenshteinDistance(a, b)) / maxLength;
}

function canonicalAppName(rawName: string) {
  const normalized = normalizeAppName(rawName);
  if (!normalized) return null;

  let best: { display: string; score: number } | null = null;

  for (const app of appCatalog) {
    for (const variant of app.variants) {
      const normalizedVariant = normalizeAppName(variant);
      if (normalizedVariant.length <= 2 && normalized !== normalizedVariant) continue;
      const score = similarity(normalized, normalizedVariant);
      if (!best || score > best.score) {
        best = { display: app.display, score };
      }
    }
  }

  return best && best.score >= APP_MATCH_THRESHOLD ? best.display : null;
}

function parseDurationToHours(input: string) {
  return firstDurationMatch(input)?.hours ?? null;
}

function firstDurationMatch(input: string) {
  const text = input.toLowerCase();
  const candidates: Array<{ hours: number; index: number; match: string }> = [];
  const colon = /\b(\d{1,2})\s*:\s*(\d{2})\b/.exec(text);
  if (colon) {
    const value = Number(colon[1]) + Number(colon[2]) / 60;
    if (value >= 0.1 && value <= 24) candidates.push({ hours: value, index: colon.index, match: colon[0] });
  }

  const hoursMatch = /(\d{1,2}(?:[.,]\d+)?)\s*(?:h|hr|hrs|hour|hours|小時|小时|ชม\.?|ชั่วโมง)(?:\s*(\d{1,3})\s*(?:m|min|mins|minute|minutes|分鐘|分钟|นาที))?/i.exec(text);
  if (hoursMatch) {
    const hours = Number(hoursMatch[1].replace(",", "."));
    const minutes = hoursMatch[2] ? Number(hoursMatch[2]) : 0;
    const value = hours + minutes / 60;
    if (value >= 0.1 && value <= 24) candidates.push({ hours: value, index: hoursMatch.index, match: hoursMatch[0] });
  }

  const minutesMatch = /(\d{1,3})\s*(?:m|min|mins|minute|minutes|分鐘|分钟|นาที)/i.exec(text);
  if (minutesMatch) {
    const value = Number(minutesMatch[1]) / 60;
    if (value >= 0.1 && value <= 24) candidates.push({ hours: value, index: minutesMatch.index, match: minutesMatch[0] });
  }

  return candidates.sort((a, b) => a.index - b.index)[0] ?? null;
}

function stripDuration(text: string) {
  return text
    .replace(/\b\d{1,2}\s*:\s*\d{2}\b/g, "")
    .replace(/\d{1,2}(?:[.,]\d+)?\s*(?:h|hr|hrs|hour|hours|小時|小时|ชม\.?|ชั่วโมง)(?:\s*\d{1,3}\s*(?:m|min|mins|minute|minutes|分鐘|分钟|นาที))?/gi, "")
    .replace(/\d{1,3}\s*(?:m|min|mins|minute|minutes|分鐘|分钟|นาที)/gi, "");
}

function isDurationOnlyLine(line: string) {
  return stripDuration(line).replace(/[()[\]{}:：·•|/\\.,+\-–—_]/g, "").trim().length === 0;
}

function categoryKindFromText(text: string): (typeof SCROLL_CATEGORIES)[number] | "excluded" | null {
  const normalized = normalizeAppName(stripDuration(text));
  if (!normalized) return null;

  for (const category of scrollCategoryCatalog) {
    for (const variant of category.variants) {
      const normalizedVariant = normalizeAppName(variant);
      if (normalized === normalizedVariant || normalized.includes(normalizedVariant) || normalizedVariant.includes(normalized)) {
        return category.id;
      }
    }
  }

  for (const variant of excludedCategoryCatalog) {
    const normalizedVariant = normalizeAppName(variant);
    if (normalized === normalizedVariant || normalized.includes(normalizedVariant) || normalizedVariant.includes(normalized)) {
      return "excluded";
    }
  }

  return null;
}

function isAppOrCategoryContext(text: string) {
  const label = stripDuration(text).trim();
  return Boolean(label && (canonicalAppName(label) || categoryKindFromText(label)));
}

function parseAnchoredDurationAfterLabel(line: string, label: RegExp) {
  const match = label.exec(line);
  if (!match) return null;
  const afterLabel = line.slice(match.index + match[0].length);
  const duration = firstDurationMatch(afterLabel);
  if (!duration) return null;
  if (isAppOrCategoryContext(afterLabel.slice(0, duration.index))) return null;
  return duration.hours;
}

function firstDurationAnchoredToLabels(rawText: string, labels: RegExp[]) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => normalizeOcrText(line))
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const matchingLabel = labels.find((label) => label.test(line));
    if (!matchingLabel) continue;

    const sameLineDuration = parseAnchoredDurationAfterLabel(line, matchingLabel);
    if (sameLineDuration !== null) return sameLineDuration;

    for (let offset = 1; offset <= 5 && index + offset < lines.length; offset += 1) {
      const candidateLine = lines[index + offset];
      const candidateDuration = parseDurationToHours(candidateLine);
      if (!candidateDuration) continue;
      if (!isDurationOnlyLine(candidateLine)) continue;
      const previousLine = lines[index + offset - 1];
      if (!parseDurationToHours(previousLine) && isAppOrCategoryContext(previousLine)) continue;
      return candidateDuration;
    }
  }

  return null;
}

function extractCategoryHours(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => normalizeOcrText(line))
    .filter(Boolean);
  const seen = new Set<string>();
  let minutes = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const sameLineDuration = parseDurationToHours(line);
    const sameLineCategory = categoryKindFromText(line);
    if (sameLineDuration && sameLineCategory && sameLineCategory !== "excluded" && !seen.has(sameLineCategory)) {
      seen.add(sameLineCategory);
      minutes += Math.round(sameLineDuration * 60);
      continue;
    }

    if (sameLineDuration || !sameLineCategory || sameLineCategory === "excluded" || seen.has(sameLineCategory)) continue;
    const nextLine = lines[index + 1];
    if (!nextLine || !isDurationOnlyLine(nextLine)) continue;
    const nextDuration = parseDurationToHours(nextLine);
    if (!nextDuration) continue;
    seen.add(sameLineCategory);
    minutes += Math.round(nextDuration * 60);
  }

  return minutes > 0 ? minutes / 60 : null;
}

function extractRawAppLines(rawText: string): RawAppLine[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blocked = /screen time|digital wellbeing|settings|average|avg|daily|total|all apps|pickups|notifications|螢幕|屏幕|平均|每日|總計|总计|ทั้งหมด|เฉลี่ย|หน้าจอ/i;

  return lines
    .map((line): RawAppLine | null => {
      if (blocked.test(line)) return null;
      const duration = parseDurationToHours(line);
      if (!duration) return null;
      const rawName = line
        .replace(/\b\d{1,2}\s*:\s*\d{2}\b/g, "")
        .replace(/\d{1,2}(?:[.,]\d+)?\s*(?:h|hr|hrs|hour|hours|小時|小时|ชม\.?|ชั่วโมง)/gi, "")
        .replace(/\d{1,3}\s*(?:m|min|mins|minute|minutes|分鐘|分钟|นาที)/gi, "")
        .replace(/[·•|-]+$/g, "")
        .trim();
      if (rawName.length < 1 || rawName.length > 40) return null;
      return { rawName, minutes: Math.round(duration * 60) };
    })
    .filter((app): app is RawAppLine => app !== null);
}

export function sanitizeParsedResult(parsed: RawParsedScreenTime): ParsedScreenTime {
  const headlineHours = parsed.hours !== null && parsed.hours >= 0.5 && parsed.hours <= 12 ? parsed.hours : null;
  const totalHours = parsed.totalHours != null && parsed.totalHours >= 0.5 && parsed.totalHours <= 12 ? parsed.totalHours : null;
  const candidateScrollHours = parsed.scrollHours != null && parsed.scrollHours >= 0.5 && parsed.scrollHours <= 12 ? parsed.scrollHours : null;
  const scrollHours =
    candidateScrollHours && (!totalHours || Math.round(candidateScrollHours * 60) <= Math.round(totalHours * 60))
      ? candidateScrollHours
      : null;
  const hours = scrollHours ?? headlineHours;
  const source = hours ? parsed.source : null;
  const totalMinutes = hours ? Math.round(hours * 60) : null;
  const maxAppMinutes = totalMinutes ?? 8 * 60;
  const seen = new Set<string>();

  const apps = parsed.apps
    .map((app): AppRoast | null => {
      const canonical = canonicalAppName(app.rawName);
      if (!canonical || seen.has(canonical)) return null;
      if (!Number.isFinite(app.minutes) || app.minutes <= 0 || app.minutes > 16 * 60 || app.minutes > maxAppMinutes) return null;
      seen.add(canonical);
      return { name: canonical, minutes: app.minutes };
    })
    .filter((app): app is AppRoast => app !== null)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 3);

  return {
    hours,
    source,
    totalHours,
    scrollHours,
    apps,
    confidence: Math.max(0, Math.min(100, parsed.confidence)),
  };
}

export function parseScreenTimeText(rawText: string, ocrConfidence = 0): ParsedScreenTime {
  const apps = extractRawAppLines(rawText);
  const scrollHours = extractCategoryHours(rawText);
  const confidence = Math.max(0, Math.min(100, ocrConfidence));
  const confidenceOk = confidence === 0 || confidence >= 45;
  const averageLabels = [
    /\b(?:daily\s+average|average|avg\.?|avg\s*\/\s*day|per\s+day)\b/i,
    /(?:每日平均|日均|平均每天|平均每日|平均|เฉลี่ยต่อวัน|เฉลี่ย|ต่อวัน)/i,
  ];
  const weeklyLabels = [
    /\b(?:week|weekly|this\s+week)\b/i,
    /(?:本週|本周|週總計|周总计|รายสัปดาห์|สัปดาห์)/i,
  ];
  const dayLabels = [
    /\b(?:screen\s*time\s*today|screen\s+time|today|daily\s+total|total\s+screen\s+time|total)\b/i,
    /(?:今天螢幕使用時間|今日螢幕使用時間|今天屏幕使用时间|今日屏幕使用时间|螢幕使用時間今天|屏幕使用时间今天|今天|今日|單日|单日|เวลาหน้าจอวันนี้|เวลาใช้หน้าจอวันนี้|เวลาหน้าจอ|วันนี้|รายวัน)/i,
  ];

  const average = firstDurationAnchoredToLabels(rawText, averageLabels);
  if (average && average >= 0.5 && average <= 12 && confidenceOk) {
    return sanitizeParsedResult({ hours: average, totalHours: average, scrollHours, source: "average", apps, confidence });
  }

  const weeklyTotal = firstDurationAnchoredToLabels(rawText, weeklyLabels);
  if (weeklyTotal && weeklyTotal >= 3.5 && weeklyTotal <= 84 && confidenceOk) {
    return sanitizeParsedResult({ hours: weeklyTotal / 7, totalHours: weeklyTotal / 7, scrollHours, source: "weekly-total", apps, confidence });
  }

  const dayTotal = firstDurationAnchoredToLabels(rawText, dayLabels);
  if (dayTotal && dayTotal >= 0.5 && dayTotal <= 12) {
    return sanitizeParsedResult({ hours: dayTotal, totalHours: dayTotal, scrollHours, source: "day-total", apps, confidence });
  }

  return sanitizeParsedResult({ hours: null, totalHours: null, scrollHours, source: scrollHours ? "day-total" : null, apps, confidence });
}
