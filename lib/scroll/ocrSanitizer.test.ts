import assert from "node:assert/strict";
import test from "node:test";
import { parseScreenTimeText, sanitizeParsedResult } from "./ocrSanitizer";

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
