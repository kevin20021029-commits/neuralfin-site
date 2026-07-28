import assert from "node:assert/strict";
import test from "node:test";
import { classifyParseOutcome, guessScreenTimeLayout, parseScreenTimeText, sanitizeParsedResult } from "./ocrSanitizer";

test("clean app list renders canonical names and plausible minutes", () => {
  const parsed = parseScreenTimeText(
    [
      "Screen Time",
      "Daily Average 3h 20m",
      "Tik Tok 1h 05m",
      "You Tube 42m",
      "Instagram 30m",
    ].join("\n"),
    88,
  );

  assert.equal(parsed.source, "average");
  assert.equal(Math.round((parsed.hours ?? 0) * 10) / 10, 3.3);
  assert.deepEqual(parsed.apps, [
    { name: "TikTok", minutes: 65 },
    { name: "YouTube", minutes: 42 },
    { name: "Instagram", minutes: 30 },
  ]);
});

test("partial garbage is dropped while valid fuzzy matches survive", () => {
  const sanitized = sanitizeParsedResult({
    hours: 2.5,
    source: "average",
    confidence: 80,
    apps: [
      { rawName: "ๅ ๕6 ๑ Nf 75% ol ED", minutes: 1018 },
      { rawName: "Settime", minutes: 137 },
      { rawName: "Instagrarn", minutes: 44 },
      { rawName: "We Chat", minutes: 31 },
    ],
  });

  assert.deepEqual(sanitized.apps, [
    { name: "Instagram", minutes: 44 },
    { name: "WeChat", minutes: 31 },
  ]);
});

test("only garbage yields no app roasts", () => {
  const sanitized = sanitizeParsedResult({
    hours: 2,
    source: "average",
    confidence: 70,
    apps: [
      { rawName: "©) Settime", minutes: 137 },
      { rawName: "ๅ ๕6 ๑ Nf 75% ol ED", minutes: 25 },
    ],
  });

  assert.deepEqual(sanitized.apps, []);
});

test("per-app duration exceeding total or hard cap is dropped", () => {
  const withTotal = sanitizeParsedResult({
    hours: 2,
    source: "average",
    confidence: 70,
    apps: [
      { rawName: "TikTok", minutes: 130 },
      { rawName: "WeChat", minutes: 90 },
    ],
  });
  assert.deepEqual(withTotal.apps, [{ name: "WeChat", minutes: 90 }]);

  const withoutTotal = sanitizeParsedResult({
    hours: null,
    source: null,
    confidence: 70,
    apps: [
      { rawName: "YouTube", minutes: 500 },
      { rawName: "Chrome", minutes: 120 },
    ],
  });
  assert.deepEqual(withoutTotal.apps, [{ name: "Chrome", minutes: 120 }]);
});

test("zh localized screenshot matches catalog", () => {
  const parsed = parseScreenTimeText("每日平均 2小時30分鐘\n抖音 45分鐘\n微信 31分鐘\n小红书 20分鐘", 91);

  assert.equal(parsed.source, "average");
  assert.equal(parsed.hours, 2.5);
  assert.deepEqual(parsed.apps, [
    { name: "TikTok", minutes: 45 },
    { name: "WeChat", minutes: 31 },
    { name: "Xiaohongshu", minutes: 20 },
  ]);
});

test("thai localized screenshot matches catalog", () => {
  const parsed = parseScreenTimeText("เฉลี่ยต่อวัน 3 ชั่วโมง 0 นาที\nไลน์ 40 นาที\nยูทูบ 35 นาที\nเฟซบุ๊ก 20 นาที", 86);

  assert.equal(parsed.source, "average");
  assert.equal(parsed.hours, 3);
  assert.deepEqual(parsed.apps, [
    { name: "LINE", minutes: 40 },
    { name: "YouTube", minutes: 35 },
    { name: "Facebook", minutes: 20 },
  ]);
});

test("Samsung Digital Wellbeing day dashboard parses total and category scroll time without verification source", () => {
  const parsed = parseScreenTimeText(
    [
      "Digital Wellbeing",
      "Screen time today",
      "6 h 2 m",
      "Video 3 h 16 m",
      "Social 2 h 35 m",
      "Productivity 5 m",
      "Most used apps",
      "YouTube 3 h 16 m",
      "WhatsApp 1 h 21 m",
      "Instagram 45 m",
    ].join("\n"),
    83,
  );

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.totalHours ?? 0) * 100) / 100, 6.03);
  assert.equal(Math.round((parsed.scrollHours ?? 0) * 100) / 100, 5.85);
  assert.equal(Math.round((parsed.hours ?? 0) * 100) / 100, 5.85);
  assert.deepEqual(parsed.apps, [
    { name: "YouTube", minutes: 196 },
    { name: "WhatsApp", minutes: 81 },
    { name: "Instagram", minutes: 45 },
  ]);
});

test("Samsung headline stays anchored to total instead of app or category durations", () => {
  const parsed = parseScreenTimeText(
    [
      "Digital Wellbeing",
      "Screen time today",
      "Video 3 h 16 m",
      "Social 2 h 35 m",
      "6 h 2 m",
      "YouTube 3 h 16 m",
    ].join("\n"),
    83,
  );

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.totalHours ?? 0) * 100) / 100, 6.03);
  assert.equal(Math.round((parsed.hours ?? 0) * 100) / 100, 5.85);
});

test("total without categories falls back to total and emits no scroll chip metadata", () => {
  const parsed = parseScreenTimeText("Screen time today\n6 h 2 m\nYouTube 3 h 16 m", 83);

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.hours ?? 0) * 100) / 100, 6.03);
  assert.equal(parsed.scrollHours, null);
  assert.equal(Math.round((parsed.totalHours ?? 0) * 100) / 100, 6.03);
});

// Samsung One UI fixture — tesseract column/block ordering: the headline
// label, then the app-name column, then the value column (headline value
// first), then category tiles as a names block followed by a values block.
const SAMSUNG_BLOCK_FIXTURE = [
  "Digital Wellbeing",
  "Screen time today",
  "YouTube",
  "WhatsApp",
  "Instagram",
  "6 h 2 m",
  "3 h 16 m",
  "1 h 21 m",
  "45 m",
  "Screen time by category",
  "Video",
  "Social",
  "Productivity and finance",
  "3 h 16 m",
  "2 h 35 m",
  "5 m",
].join("\n");

test("Samsung block-ordered OCR anchors headline to the day total, never an app row", () => {
  const parsed = parseScreenTimeText(SAMSUNG_BLOCK_FIXTURE, 83);

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.totalHours ?? 0) * 60), 362); // 6h 2m
  assert.notEqual(Math.round((parsed.totalHours ?? 0) * 60), 196); // never YouTube's 3h 16m
  assert.equal(Math.round((parsed.scrollHours ?? 0) * 60), 351); // Video 3h16m + Social 2h35m
  assert.equal(Math.round((parsed.hours ?? 0) * 60), 351); // slider driven by scroll time
  assert.deepEqual(parsed.apps, [
    { name: "YouTube", minutes: 196 },
    { name: "WhatsApp", minutes: 81 },
    { name: "Instagram", minutes: 45 },
  ]);
});

// iOS Screen Time fixture — category legend under the usage chart, ordered
// by usage (an excluded category first), values day-scoped.
const IOS_DAY_FIXTURE = [
  "SCREEN TIME",
  "Today",
  "2h 2m",
  "Creativity 44m · Social 32m · Travel 9m",
  "Show Categories",
].join("\n");

test("iOS legend counts only scroll categories, per segment", () => {
  const parsed = parseScreenTimeText(IOS_DAY_FIXTURE, 88);

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.totalHours ?? 0) * 60), 122); // 2h 2m
  assert.equal(Math.round((parsed.scrollHours ?? 0) * 60), 32); // Social only, not Creativity's 44m
  assert.equal(Math.round((parsed.hours ?? 0) * 60), 32);
});

test("iOS week view never mixes weekly category values into a daily scroll ratio", () => {
  const parsed = parseScreenTimeText(
    ["SCREEN TIME", "Daily Average 5h 6m", "Social 6h 40m · Entertainment 3h 2m", "Show Categories"].join("\n"),
    88,
  );

  assert.equal(parsed.source, "average");
  assert.equal(Math.round((parsed.hours ?? 0) * 60), 306); // 5h 6m daily average drives the slider
  assert.equal(parsed.scrollHours, null); // scope mismatch → total-only, no ratio
});

// Stock Android (Pixel) Digital Wellbeing — "hr"/"min" word tokens with a
// comma, per-app list, no category tiles.
const PIXEL_FIXTURE = [
  "Digital Wellbeing",
  "Screen time",
  "4 hr, 12 min",
  "Chrome 1 hr 2 min",
  "YouTube 58 min",
  "Instagram 44 min",
].join("\n");

test("Pixel comma-separated hr/min tokens parse as total-only with app roasts", () => {
  const parsed = parseScreenTimeText(PIXEL_FIXTURE, 85);

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.totalHours ?? 0) * 60), 252); // 4h 12m
  assert.equal(parsed.scrollHours, null); // no categories visible → total-only
  assert.equal(Math.round((parsed.hours ?? 0) * 60), 252);
  assert.deepEqual(parsed.apps, [
    { name: "Chrome", minutes: 62 },
    { name: "YouTube", minutes: 58 },
    { name: "Instagram", minutes: 44 },
  ]);
});

test("duration token formats all resolve to the same value", () => {
  const cases = [
    "3 h 20 m",
    "3 hr 20 min",
    "3 hr, 20 min",
    "3h 20m",
    "3:20",
    "3 小時 20 分鐘",
    "3 ชั่วโมง 20 นาที",
  ];
  for (const token of cases) {
    const parsed = parseScreenTimeText(`Daily Average ${token}`, 90);
    assert.equal(Math.round((parsed.hours ?? 0) * 60), 200, `token "${token}"`);
  }
  const minutesOnly = parseScreenTimeText("Daily Average 45 m", 90);
  assert.equal(Math.round((minutesOnly.hours ?? 0) * 60), 45);
});

test("garbage OCR yields no hours, no apps, and a failed outcome", () => {
  const parsed = parseScreenTimeText("ๅ ๕6 ๑ Nf 75% ol ED\n©) qwerty 999\n???\n@@##", 22);

  assert.equal(parsed.hours, null);
  assert.equal(parsed.source, null);
  assert.equal(parsed.scrollHours, null);
  assert.deepEqual(parsed.apps, []);
  assert.equal(classifyParseOutcome(parsed), "failed");
});

test("unknown OEM layout with an anchored total degrades to total-only, not failure", () => {
  const parsed = parseScreenTimeText("การใช้งานอุปกรณ์\nเวลาหน้าจอ 5 ชั่วโมง 12 นาที\nแอปที่ใช้บ่อย", 70);

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.hours ?? 0) * 60), 312);
  assert.equal(parsed.scrollHours, null);
  assert.equal(classifyParseOutcome(parsed), "total_only");
  assert.equal(guessScreenTimeLayout("การใช้งานอุปกรณ์\nเวลาหน้าจอ 5 ชั่วโมง 12 นาที"), "unknown");
});

test("layout guess separates samsung, pixel, and ios", () => {
  assert.equal(guessScreenTimeLayout(SAMSUNG_BLOCK_FIXTURE), "samsung");
  assert.equal(guessScreenTimeLayout(PIXEL_FIXTURE), "pixel");
  assert.equal(guessScreenTimeLayout(IOS_DAY_FIXTURE), "ios");
});

test("parse outcome classification covers full, total_only, failed", () => {
  assert.equal(classifyParseOutcome(parseScreenTimeText(SAMSUNG_BLOCK_FIXTURE, 83)), "full");
  assert.equal(classifyParseOutcome(parseScreenTimeText(PIXEL_FIXTURE, 85)), "total_only");
  assert.equal(classifyParseOutcome(parseScreenTimeText("nothing useful here", 10)), "failed");
});

test("parser category labels match both Traditional and Simplified scripts", () => {
  const hant = parseScreenTimeText(
    ["今日螢幕使用時間", "6 小時 2 分鐘", "影片 3 小時 16 分鐘", "社交 2 小時 35 分鐘", "生產力 5 分鐘"].join("\n"),
    85,
  );
  const hans = parseScreenTimeText(
    ["今日屏幕使用时间", "6 小时 2 分钟", "视频 3 小时 16 分钟", "社交 2 小时 35 分钟", "生产力 5 分钟"].join("\n"),
    85,
  );

  for (const parsed of [hant, hans]) {
    assert.equal(parsed.source, "day-total");
    assert.equal(Math.round((parsed.totalHours ?? 0) * 60), 362);
    assert.equal(Math.round((parsed.scrollHours ?? 0) * 60), 351); // Video + Social; Productivity excluded
  }
});

test("entertainment and games categories count in both scripts", () => {
  const hant = parseScreenTimeText("今天\n5 小時 0 分鐘\n娛樂 2 小時 0 分鐘\n遊戲 1 小時 0 分鐘\n創意 30 分鐘", 85);
  const hans = parseScreenTimeText("今天\n5 小时 0 分钟\n娱乐 2 小时 0 分钟\n游戏 1 小时 0 分钟\n创意 30 分钟", 85);

  for (const parsed of [hant, hans]) {
    assert.equal(Math.round((parsed.scrollHours ?? 0) * 60), 180); // Entertainment + Games; Creativity excluded
    assert.equal(Math.round((parsed.totalHours ?? 0) * 60), 300);
  }
});

test("Thai headline and category labels parse with full-word duration units", () => {
  const parsed = parseScreenTimeText(
    ["เวลาหน้าจอวันนี้", "6 ชั่วโมง 2 นาที", "วิดีโอ 3 ชั่วโมง 16 นาที", "โซเชียล 2 ชั่วโมง 35 นาที", "การเงิน 5 นาที"].join("\n"),
    85,
  );

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.totalHours ?? 0) * 60), 362);
  assert.equal(Math.round((parsed.scrollHours ?? 0) * 60), 351); // Video + Social; Finance excluded
});

test("Thai abbreviated duration units (ชม.) parse for headline and categories", () => {
  const parsed = parseScreenTimeText(
    ["เวลาหน้าจอวันนี้", "6 ชม. 2 นาที", "ความบันเทิง 2 ชม. 0 นาที", "เกม 1 ชม. 0 นาที", "สร้างสรรค์ 30 นาที"].join("\n"),
    85,
  );

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.totalHours ?? 0) * 60), 362);
  assert.equal(Math.round((parsed.scrollHours ?? 0) * 60), 180); // Entertainment + Games; Creativity excluded
});

test("app row only does not promote an app duration to headline", () => {
  const parsed = parseScreenTimeText("YouTube 3 h 16 m\nWhatsApp 1 h 21 m\nInstagram 45 m", 83);

  assert.equal(parsed.hours, null);
  assert.equal(parsed.source, null);
  assert.deepEqual(parsed.apps, [
    { name: "YouTube", minutes: 196 },
    { name: "WhatsApp", minutes: 81 },
    { name: "Instagram", minutes: 45 },
  ]);
});
