import assert from "node:assert/strict";
import test from "node:test";
import { acceptRestrictedLine, collectOcrLines, isRestrictableValuesLine, RESTRICTED_WHITELIST } from "./ocrPipeline";

test("restricted whitelist stays digits + h + m", () => {
  assert.equal(RESTRICTED_WHITELIST, "0123456789hm");
});

test("values lines are restrictable; app rows and names keep multilingual OCR", () => {
  assert.equal(isRestrictableValuesLine("6 h 2 m"), true);
  assert.equal(isRestrictableValuesLine("3h16m 2 ท 35 ท 5 ท า"), true);
  assert.equal(isRestrictableValuesLine("45 m"), true);
  assert.equal(isRestrictableValuesLine("@ YouTube 3 ท 16 ท"), false);
  assert.equal(isRestrictableValuesLine("Video Social Productivity and"), false);
  assert.equal(isRestrictableValuesLine("Most used app categories"), false);
  assert.equal(isRestrictableValuesLine("6 小時 2 分鐘"), false); // zh stays with the multilingual pass
  assert.equal(isRestrictableValuesLine("onZm"), false); // no digits — unrecoverable crop
});

test("restricted output is accepted only when it parses as a duration", () => {
  assert.equal(acceptRestrictedLine("3h16m  2h35m   5m\n"), "3h16m 2h35m 5m");
  assert.equal(acceptRestrictedLine("6 h 2 m"), "6 h 2 m");
  assert.equal(acceptRestrictedLine("hm h m"), null); // whitelist noise, no digits parse
  assert.equal(acceptRestrictedLine("   "), null);
});

test("line collection flattens tesseract blocks and skips empty lines", () => {
  const lines = collectOcrLines({
    blocks: [
      {
        paragraphs: [
          { lines: [{ text: " 6 h 2 m \n", bbox: { x0: 0, y0: 0, x1: 10, y1: 10 } }, { text: "  ", bbox: { x0: 0, y0: 0, x1: 1, y1: 1 } }] },
        ],
      },
      { paragraphs: [{ lines: [{ text: "YouTube 3 h 16 m", bbox: { x0: 0, y0: 20, x1: 90, y1: 30 } }] }] },
    ],
  });
  assert.deepEqual(lines.map((line) => line.text), ["6 h 2 m", "YouTube 3 h 16 m"]);
});

test("no blocks means no restricted targets, not a crash", () => {
  assert.deepEqual(collectOcrLines({ blocks: null }), []);
  assert.deepEqual(collectOcrLines({}), []);
});
