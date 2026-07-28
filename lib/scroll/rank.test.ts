import assert from "node:assert/strict";
import test from "node:test";
import { getRankFrame } from "./rank";

test("rank frame compliments users below median", () => {
  const frame = getRankFrame(15, "Worldwide", "en");

  assert.equal(frame.title, "Lighter than 85% of people 🌱");
  assert.equal(frame.subtitle, "nice — your feed doesn't own you");
  assert.equal(frame.displayPercent, "P15");
});

test("rank frame keeps top framing at and above median", () => {
  assert.equal(getRankFrame(50, "Worldwide", "en").title, "Top 50% scroller · Worldwide");
  assert.equal(getRankFrame(63, "Worldwide", "en").title, "Top 37% scroller · Worldwide");
  assert.equal(getRankFrame(63, "全球", "zh").title, "全球前 37% 滑屏員");
});

test("rank frame localizes light scroller copy", () => {
  const frame = getRankFrame(15, "全球", "zh");

  assert.equal(frame.title, "比 85% 的人更輕倉 🌱");
  assert.equal(frame.subtitle, "不錯——feed 還沒收購你");
});
