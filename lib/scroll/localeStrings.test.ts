import assert from "node:assert/strict";
import test from "node:test";
import { getArchetypeCopy, getScanStageMessage, getShareCaptionVariant } from "./personality";
import { getEducationOutput, getTrackName } from "./education";
import { getRankFrame } from "./rank";

// The share card now exports the real DOM node, so glyph rendering is the
// browser's (covered by the parity test across locales). These tests keep
// the underlying guarantee: card strings are native-script content, never
// transliteration or replacement characters.

test("Thai card strings are native Thai script with no replacement glyphs", () => {
  const thai = /[ก-๛]/;
  const samples = [
    getArchetypeCopy(4, "th").title,
    getArchetypeCopy(4, "th").subtitle,
    getRankFrame(63, "ไทย", "th").title,
    getTrackName("foundations", "th"),
    getScanStageMessage("th", "reading"),
    getShareCaptionVariant("th", "-1,278h", "Top 37%", () => 0),
    getEducationOutput(3.5, "th", new Date("2026-07-28T12:00:00Z")).cardLine,
  ];
  for (const sample of samples) {
    assert.match(sample, thai, `not Thai script: ${sample}`);
    assert.ok(!sample.includes("�"), `replacement character in: ${sample}`);
  }
});

test("Chinese card strings are native Han script in both variants", () => {
  const han = /[一-鿿]/;
  for (const lang of ["zh-Hant", "zh-Hans"] as const) {
    const samples = [
      getArchetypeCopy(4, lang).title,
      getRankFrame(63, "全球", lang).title,
      getTrackName("foundations", lang),
      getScanStageMessage(lang, "reading"),
      getEducationOutput(3.5, lang, new Date("2026-07-28T12:00:00Z")).cardLine,
    ];
    for (const sample of samples) {
      assert.match(sample, han, `not Han script (${lang}): ${sample}`);
      assert.ok(!sample.includes("�"), `replacement character in: ${sample}`);
    }
  }
});

test("Thai milestone dates use Thai month names with Gregorian years", () => {
  const output = getEducationOutput(3.5, "th", new Date("2026-07-28T12:00:00Z"));
  // 2026-07-28 + the 44-day ladder schedule (was a hardcoded +365).
  assert.match(output.milestoneLabel, /กันยายน/); // September, Thai month name
  assert.match(output.milestoneLabel, /2026/); // deliberately CE, not 2569 BE
  assert.doesNotMatch(output.milestoneLabel, /2569/);
});
