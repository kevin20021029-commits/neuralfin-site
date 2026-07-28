import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ARCHETYPES,
  SCAN_STAGE_CONFIG,
  SHARE_TEXT_VARIANTS,
  TAPE_NOTE_CONFIG,
  getArchetypeCopy,
  getScanStageMessage,
  getShareCaptionVariant,
  getTapeNote,
} from "./personality";

test("archetype subtitles cover all tiers in both languages", () => {
  const sampleHours = [1, 2, 4, 6, 9];
  const en = sampleHours.map((hours) => getArchetypeCopy(hours, "en"));
  const zh = sampleHours.map((hours) => getArchetypeCopy(hours, "zh"));

  assert.equal(en.length, ARCHETYPES.length);
  assert.equal(zh.length, ARCHETYPES.length);
  assert.deepEqual(en.map((item) => item.subtitle), [
    "suspicious. nobody's this disciplined",
    "dabbling. respectable",
    "mid, and that's okay",
    "the feed knows your name",
    "the algorithm sends its regards",
  ]);
  assert.ok(zh.every((item) => item.subtitle.length > 0));
  assert.ok(en.every((item) => item.subtitle.length <= 42));
});

test("scan stages use chief only on failure", () => {
  assert.equal(getScanStageMessage("en", "reading"), "Reading on your device...");
  assert.equal(getScanStageMessage("en", "auditing"), "Auditing the damage...");
  assert.equal(getScanStageMessage("en", "success"), "Marking to market...");
  assert.equal(getScanStageMessage("en", "fail"), "It's not looking good chief...");
  assert.ok(!getScanStageMessage("en", "success").includes("chief"));
});

test("share caption variants all include loss url and hashtag", () => {
  for (const lang of ["en", "zh"] as const) {
    SHARE_TEXT_VARIANTS[lang].forEach((variant) => {
      const caption = variant("-1,278h", "Top 63% scroller", "www.neuralfin.ai/scroll");
      assert.match(caption, /-1,278h/);
      assert.match(caption, /Top 63% scroller/);
      assert.match(caption, /www\.neuralfin\.ai\/scroll/);
      assert.match(caption, /#ScrollAudit/);
    });
  }
});

test("share caption can rotate across all variants", () => {
  const captions = [0, 0.34, 0.99].map((value) =>
    getShareCaptionVariant("en", "-1,278h", "Top 63% scroller", () => value),
  );

  assert.equal(new Set(captions).size, 3);
});

test("tape note config includes red and green voice pools", () => {
  assert.equal(TAPE_NOTE_CONFIG.en.red.includes("down bad (literally)"), true);
  assert.equal(TAPE_NOTE_CONFIG.en.green.includes("locked in ✓"), true);
  assert.equal(getTapeNote("en", false, 6), "portfolio: vibes");
  assert.equal(getTapeNote("en", true, 1), "locked in ✓");
  assert.ok(TAPE_NOTE_CONFIG.zh.red.length >= 7);
  assert.ok(TAPE_NOTE_CONFIG.zh.green.length >= 2);
});

test("personality configs carry last reviewed dates", () => {
  assert.ok(ARCHETYPES.every((item) => item.lastReviewed === "2026-07-28"));
  assert.equal(TAPE_NOTE_CONFIG.lastReviewed, "2026-07-28");
  assert.equal(SCAN_STAGE_CONFIG.lastReviewed, "2026-07-28");
  assert.equal(SHARE_TEXT_VARIANTS.lastReviewed, "2026-07-28");
});

test("voice guide exists and personality strings stay out of formal component copy", () => {
  const voice = readFileSync("VOICE.md", "utf8");
  const component = readFileSync("components/scroll/ScrollCalculator.tsx", "utf8");

  assert.match(voice, /A trader deadpanning about your attention/);
  assert.match(voice, /Slang never appears in the compliance footer/);
  assert.doesNotMatch(component, /down bad|cooked|no thoughts|portfolio: vibes|chief|suspicious|dabbling/);
});
