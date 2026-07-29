import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { classifyParseOutcome, parseScreenTimeText } from "./ocrSanitizer";
import { recognizeScreenTime } from "./ocrPipeline";

// End-to-end: rendered Samsung tile screenshot → real tesseract workers
// (full multilingual pass + restricted eng pass) → parser. This is the only
// test that exercises real OCR output and would have caught the Thai-glyph
// confusion class. Run via `npm run test:e2e` (slow: downloads traineddata
// on first run) — intended for a nightly lane, not the per-commit suite.

const FIXTURE_PNG = resolve(__dirname, "__fixtures__/samsung-tiles.png");

test("samsung tile screenshot parses end-to-end through the two-pass pipeline", async () => {
  // traineddata caches land in cwd; keep them out of the repo
  process.chdir(mkdtempSync(join(tmpdir(), "scroll-ocr-e2e-")));

  const recognized = await recognizeScreenTime(FIXTURE_PNG);
  const parsed = parseScreenTimeText(recognized.text, recognized.confidence);

  assert.equal(recognized.restrictedPassFailed, false);
  assert.equal(Math.round((parsed.scrollHours ?? 0) * 60), 351); // Video 3h16m + Social 2h35m
  assert.equal(Math.round((parsed.hours ?? 0) * 60), 351);
  assert.equal(parsed.totalHours, null); // headline rendered clipped, as on the real upload
  assert.ok(parsed.flags.includes("headline_crop_unrecoverable"));
  assert.equal(parsed.source, "day-total");
  assert.equal(classifyParseOutcome(parsed), "full");
  assert.deepEqual(parsed.apps, [
    { name: "YouTube", minutes: 196 },
    { name: "WhatsApp", minutes: 81 },
    { name: "Instagram", minutes: 45 },
  ]);
});

test("samsung goal screen recovers the chart-adjacent headline numeral", async () => {
  const recognized = await recognizeScreenTime(resolve(__dirname, "__fixtures__/samsung-goal.png"));
  const parsed = parseScreenTimeText(recognized.text, recognized.confidence);

  assert.equal(parsed.source, "day-total");
  assert.equal(Math.round((parsed.totalHours ?? 0) * 60), 206); // 3h26m via anchor-region pass
  assert.equal(Math.round((parsed.hours ?? 0) * 60), 186); // Social 3h6m drives the slider
  assert.deepEqual(parsed.apps, [
    { name: "Instagram", minutes: 98 },
    { name: "WhatsApp", minutes: 31 },
  ]);
});
