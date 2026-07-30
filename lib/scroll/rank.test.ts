import assert from "node:assert/strict";
import test from "node:test";
import { getRankFrame } from "./rank";

// A5: one metric, one direction, across the whole range. The previous frame
// swapped metric at the median ("Lighter than 51%" -> "Top 46% scroller"),
// so crossing 4.2 h inverted both the number and its polarity.
test("rank frame uses one metric across the whole range", () => {
  assert.equal(getRankFrame(15, "Worldwide", "en").title, "You scroll more than 15% · Worldwide");
  assert.equal(getRankFrame(50, "Worldwide", "en").title, "You scroll more than 50% · Worldwide");
  assert.equal(getRankFrame(63, "Worldwide", "en").title, "You scroll more than 63% · Worldwide");
});

test("rank percentile rises monotonically and never inverts", () => {
  const values = [1, 15, 49, 50, 63, 90, 99];
  const rendered = values.map((p) => Number(getRankFrame(p, "Worldwide", "en").displayPercent.slice(1)));
  for (let i = 1; i < rendered.length; i += 1) {
    assert.ok(rendered[i] > rendered[i - 1], `expected P${rendered[i]} > P${rendered[i - 1]}`);
  }
});

// A4: "0%" and "100%" never render.
test("rank frame clamps the displayed percentile to a living range", () => {
  assert.equal(getRankFrame(0, "Worldwide", "en").displayPercent, "P1");
  assert.equal(getRankFrame(100, "Worldwide", "en").displayPercent, "P99");
  assert.equal(getRankFrame(Number.NaN, "Worldwide", "en").displayPercent, "P50");
});

test("rank frame keeps the compliment below the median and a roast above", () => {
  assert.equal(getRankFrame(15, "Worldwide", "en").subtitle, "nice — your feed doesn't own you 🌱");
  assert.equal(getRankFrame(63, "Worldwide", "en").subtitle, "that's a heavy position to carry");
});

test("rank frame localizes in every locale", () => {
  assert.equal(getRankFrame(63, "全球", "zh-Hant").title, "你滑得比 63% 的人多 · 全球");
  assert.equal(getRankFrame(63, "全球", "zh-Hans").title, "你滑得比 63% 的人多 · 全球");
  assert.equal(getRankFrame(63, "ไทย", "th").title, "คุณเลื่อนมากกว่า 63% · ไทย");
  // zh-Hant is a character mirror of the reviewed zh-Hans copy.
  assert.equal(getRankFrame(15, "全球", "zh-Hans").subtitle, "挺好，你没被信息流“控制”");
  assert.equal(getRankFrame(15, "全球", "zh-Hant").subtitle, "挺好，你沒被信息流「控制」");
});
