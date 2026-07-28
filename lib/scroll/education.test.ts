import assert from "node:assert/strict";
import test from "node:test";
import {
  FLIP_MINUTES_PER_DAY,
  getDailyMicroTakeaway,
  getDaysToFinishTrack,
  getEducationOutput,
  getLessonsPerDay,
  getTrackName,
  formatDaysToFinish,
  formatMilestoneDate,
  getMilestoneDate,
} from "./education";

test("lesson yield recomputes for common slider values", () => {
  assert.equal(getLessonsPerDay(2), 24);
  assert.equal(getDaysToFinishTrack(2), 2);
  assert.equal(getLessonsPerDay(3.5), 42);
  assert.equal(getDaysToFinishTrack(3.5), 1);
  assert.equal(getLessonsPerDay(8), 96);
  assert.equal(getDaysToFinishTrack(8), 1);
});

test("lesson yield display minimum and under-a-week boundary", () => {
  assert.equal(getLessonsPerDay(0), 1);
  assert.equal(formatDaysToFinish(7, "en"), "in under a week");
  assert.equal(formatDaysToFinish(8, "en"), "in 8 days");
  assert.equal(formatDaysToFinish(7, "zh"), "一週內");
  assert.equal(formatDaysToFinish(8, "zh"), "8 天內");
});

test("milestone date is runtime based and locale formatted", () => {
  const from = new Date("2026-07-28T12:00:00Z");
  const milestone = getMilestoneDate(from);

  assert.equal(FLIP_MINUTES_PER_DAY, 10);
  assert.equal(formatMilestoneDate(milestone, "en"), "July 2027");
  assert.equal(formatMilestoneDate(milestone, "zh"), "2027年7月");
});

test("education output includes personalized card line", () => {
  const output = getEducationOutput(3.5, "en", new Date("2026-07-28T12:00:00Z"));

  assert.equal(output.lessonsPerDay, 42);
  assert.equal(output.finishPhrase, "in under a week");
  assert.equal(output.cardLine, "42 lessons/day hiding in my scroll · course done by July 2027");
});

test("ladder track names come from config in both locales", () => {
  assert.equal(getTrackName("foundations", "en"), "Investing Foundations");
  assert.equal(getTrackName("statements", "en"), "Reading the Numbers");
  assert.equal(getTrackName("first-trade", "en"), "Your First Trade, Done Right");
  assert.equal(getTrackName("foundations", "zh"), "投資基礎");
  assert.equal(getTrackName("statements", "zh"), "看懂財務數字");
  assert.equal(getTrackName("first-trade", "zh"), "第一筆交易做對");
});

test("micro-takeaway is deterministic for fixed dates and rotates", () => {
  const first = getDailyMicroTakeaway("en", new Date("2026-01-01T12:00:00Z"));
  const second = getDailyMicroTakeaway("en", new Date("2026-01-02T12:00:00Z"));
  const firstAgain = getDailyMicroTakeaway("en", new Date("2026-01-01T12:00:00Z"));

  assert.ok(first.length > 0);
  assert.ok(second.length > 0);
  assert.equal(first, firstAgain);
  assert.notEqual(first, second);
});
