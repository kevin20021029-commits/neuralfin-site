import assert from "node:assert/strict";
import test from "node:test";
import { CARD_FONT_FAMILIES, CARD_MONO_FAMILIES } from "./cardFont";
import { getArchetypeCopy, getScanStageMessage, getShareCaptionVariant } from "./personality";
import { getEducationOutput, getTrackName } from "./education";
import { getRankFrame } from "./rank";

// True rasterization isn't possible in this test environment (no canvas
// backend), so the missing-glyph guard is enforced at the two layers we
// control: the canvas font stack must name explicitly Thai- and
// Han-capable families (per-glyph fallback then resolves them), and every
// sampled card string must actually be in its native script rather than
// transliteration or replacement characters.

test("share-card font stack names Thai- and Han-capable families", () => {
  for (const family of ['"Noto Sans Thai"', "Thonburi", '"Leelawadee UI"']) {
    assert.ok(CARD_FONT_FAMILIES.includes(family), `missing Thai-capable family ${family}`);
  }
  for (const family of ['"PingFang TC"', '"PingFang SC"', '"Noto Sans TC"', '"Noto Sans SC"']) {
    assert.ok(CARD_FONT_FAMILIES.includes(family), `missing Han-capable family ${family}`);
  }
  assert.match(CARD_FONT_FAMILIES, /sans-serif$/);
  assert.match(CARD_MONO_FAMILIES, /monospace$/);
});

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

test("Thai milestone dates use Buddhist-era years via th-TH formatting", () => {
  const output = getEducationOutput(3.5, "th", new Date("2026-07-28T12:00:00Z"));
  assert.match(output.milestoneLabel, /กรกฎาคม/); // July
  assert.match(output.milestoneLabel, /2570/); // 2027 CE in Buddhist era
});
