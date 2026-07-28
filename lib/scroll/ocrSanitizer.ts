export type AppRoast = {
  name: string;
  minutes: number;
};

export type ParsedScreenTime = {
  hours: number | null;
  source: "average" | "weekly-total" | "day-total" | null;
  apps: AppRoast[];
  confidence: number;
};

type RawAppLine = {
  rawName: string;
  minutes: number;
};

type RawParsedScreenTime = Omit<ParsedScreenTime, "apps"> & {
  apps: RawAppLine[];
};

const APP_MATCH_THRESHOLD = 0.8;

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
  const text = input.toLowerCase();
  const colon = text.match(/\b(\d{1,2})\s*:\s*(\d{2})\b/);
  if (colon) {
    const value = Number(colon[1]) + Number(colon[2]) / 60;
    return value >= 0.1 && value <= 24 ? value : null;
  }

  const hoursMatch = text.match(/(\d{1,2}(?:[.,]\d+)?)\s*(?:h|hr|hrs|hour|hours|小時|小时|ชม\.?|ชั่วโมง)/i);
  const minutesMatch = text.match(/(\d{1,3})\s*(?:m|min|mins|minute|minutes|分鐘|分钟|นาที)/i);
  const hours = hoursMatch ? Number(hoursMatch[1].replace(",", ".")) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  const value = hours + minutes / 60;
  return value >= 0.1 && value <= 24 ? value : null;
}

function firstDurationNearLabel(text: string, label: RegExp, windowChars = 140) {
  const match = label.exec(text);
  if (!match) return null;
  const start = Math.max(0, match.index - 30);
  const end = Math.min(text.length, match.index + windowChars);
  return parseDurationToHours(text.slice(match.index + match[0].length, end)) ?? parseDurationToHours(text.slice(start, match.index));
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
  const hours = parsed.hours !== null && parsed.hours >= 0.5 && parsed.hours <= 12 ? parsed.hours : null;
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
    apps,
    confidence: Math.max(0, Math.min(100, parsed.confidence)),
  };
}

export function parseScreenTimeText(rawText: string, ocrConfidence = 0): ParsedScreenTime {
  const text = normalizeOcrText(rawText);
  const apps = extractRawAppLines(rawText);
  const confidence = Math.max(0, Math.min(100, ocrConfidence));
  const confidenceOk = confidence === 0 || confidence >= 45;

  const average =
    firstDurationNearLabel(text, /\b(?:daily\s+average|average|avg\.?|avg\s*\/\s*day|per\s+day)\b/i) ??
    firstDurationNearLabel(text, /(?:每日平均|日均|平均每天|平均每日|平均|เฉลี่ยต่อวัน|เฉลี่ย|ต่อวัน)/i);
  if (average && average >= 0.5 && average <= 12 && confidenceOk) {
    return sanitizeParsedResult({ hours: average, source: "average", apps, confidence });
  }

  const weeklyTotal =
    firstDurationNearLabel(text, /\b(?:week|weekly|this\s+week)\b/i) ??
    firstDurationNearLabel(text, /(?:本週|本周|週總計|周总计|รายสัปดาห์|สัปดาห์)/i);
  if (weeklyTotal && weeklyTotal >= 3.5 && weeklyTotal <= 84 && confidenceOk) {
    return sanitizeParsedResult({ hours: weeklyTotal / 7, source: "weekly-total", apps, confidence });
  }

  const samsungDayTotal =
    firstDurationNearLabel(text, /\b(?:screen\s*time\s*today|digital\s+wellbeing|screen\s+time)\b/i, 180) ??
    firstDurationNearLabel(text, /(?:今天螢幕使用時間|今日螢幕使用時間|今天屏幕使用时间|今日屏幕使用时间|螢幕使用時間今天|屏幕使用时间今天|เวลาหน้าจอวันนี้|เวลาใช้หน้าจอวันนี้|ดิจิทัลเวลบีอิง)/i, 180);
  if (samsungDayTotal && samsungDayTotal >= 0.5 && samsungDayTotal <= 12) {
    return sanitizeParsedResult({ hours: samsungDayTotal, source: "day-total", apps, confidence });
  }

  const dayTotal =
    firstDurationNearLabel(text, /\b(?:today|day|daily|screen\s+time|total)\b/i) ??
    firstDurationNearLabel(text, /(?:今天|今日|單日|单日|螢幕使用時間|屏幕使用时间|วันนี้|รายวัน|เวลาหน้าจอ)/i);
  if (dayTotal && dayTotal >= 0.5 && dayTotal <= 12) {
    return sanitizeParsedResult({ hours: dayTotal, source: "day-total", apps, confidence });
  }

  return sanitizeParsedResult({ hours: null, source: null, apps, confidence });
}
