import assert from "node:assert/strict";
import test from "node:test";
import {
  FLIP_LESSONS_PER_DAY,
  FLIP_MINUTES_PER_DAY,
  getDailyMicroTakeaway,
  getDaysToFinishTrack,
  getEducationOutput,
  getLadderSchedule,
  getLadderTotalDays,
  getLessonsPerDay,
  getTrackName,
  formatDaysToFinish,
  formatMilestoneDate,
  formatRungLabel,
  getMilestoneDate,
} from "./education";

test("lesson yield recomputes for common slider values", () => {
  assert.equal(getLessonsPerDay(2), 24);
  assert.equal(getLessonsPerDay(3.5), 42);
  assert.equal(getLessonsPerDay(8), 96);
});

// A1: course duration comes from the flip pace, not from scroll time.
// Deriving it from scroll time returned ceil(200/210) = 1 day and produced
// the "finish in under a week" claim that contradicted the ladder below it.
test("course duration is paced by the flip commitment, not the slider", () => {
  assert.equal(getDaysToFinishTrack("foundations"), 20); // 40 lessons x 5 min / 10 min per day
  assert.equal(getDaysToFinishTrack("statements"), 14);
  assert.equal(getDaysToFinishTrack("first-trade"), 10);
  assert.equal(getLadderTotalDays(), 44);
  assert.equal(FLIP_LESSONS_PER_DAY, 2);
});

// A1: every printed duration derives from one schedule, and the rung
// captions are distinct rather than a frozen Week 1 / Month 1 / Month 6.
test("ladder rung captions derive from the schedule and stay distinct", () => {
  const labels = getLadderSchedule().map((rung) => formatRungLabel(rung.days, "en"));
  assert.deepEqual(labels, ["Week 3", "Week 5", "Week 7"]);
  assert.equal(new Set(labels).size, labels.length);
  assert.equal(formatRungLabel(20, "zh-Hant"), "\u7b2c3\u9031");
  assert.equal(formatRungLabel(90, "en"), "Month 3");
});

test("lesson yield display minimum and under-a-week boundary", () => {
  assert.equal(getLessonsPerDay(0), 1);
  assert.equal(formatDaysToFinish(7, "en"), "in under a week");
  assert.equal(formatDaysToFinish(8, "en"), "in 8 days");
  assert.equal(formatDaysToFinish(7, "zh-Hant"), "一週內");
  assert.equal(formatDaysToFinish(8, "zh-Hant"), "8 天內");
  assert.equal(formatDaysToFinish(7, "zh-Hans"), "一周内");
  assert.equal(formatDaysToFinish(8, "zh-Hans"), "8 天内");
});

test("milestone date follows the ladder schedule, not a hardcoded year", () => {
  const from = new Date("2026-07-28T12:00:00Z");
  const milestone = getMilestoneDate(from);

  assert.equal(FLIP_MINUTES_PER_DAY, 10);
  // 2026-07-28 + 44 days. Previously a hardcoded +365 that ignored the
  // schedule entirely and printed "By July 2027" beside "in under a week".
  assert.equal(formatMilestoneDate(milestone, "en"), "September 2026");
  assert.equal(formatMilestoneDate(milestone, "zh-Hant"), "2026年9月");
  assert.equal(formatMilestoneDate(milestone, "zh-Hans"), "2026年9月");
});

test("education output includes personalized card line", () => {
  const output = getEducationOutput(3.5, "en", new Date("2026-07-28T12:00:00Z"));

  assert.equal(output.lessonsPerDay, 42); // rhetorical: slices hiding in the scroll
  assert.equal(output.finishPhrase, "in 20 days");
  // A2: the card line sits beside "Flipping 10 min/day" so it must describe
  // THAT input — not the user's entire scroll time.
  assert.equal(output.cardLine, "2 lessons/day · course done by September 2026");
});

// A1 done-when: every on-screen duration agrees across the slider range.
test("durations do not vary with the slider", () => {
  for (const hours of [0.5, 3.5, 12]) {
    const output = getEducationOutput(hours, "en", new Date("2026-07-28T12:00:00Z"));
    assert.equal(output.finishPhrase, "in 20 days");
    assert.equal(output.milestoneLabel, "September 2026");
    assert.equal(output.cardLine, "2 lessons/day · course done by September 2026");
  }
});

test("ladder track names come from config in all locales", () => {
  assert.equal(getTrackName("foundations", "en"), "Investing Foundations");
  assert.equal(getTrackName("statements", "en"), "Reading the Numbers");
  assert.equal(getTrackName("first-trade", "en"), "Your First Trade, Done Right");
  assert.equal(getTrackName("foundations", "zh-Hant"), "投資基礎");
  assert.equal(getTrackName("statements", "zh-Hant"), "看懂財務數字");
  assert.equal(getTrackName("first-trade", "zh-Hant"), "第一筆交易做對");
  assert.equal(getTrackName("foundations", "zh-Hans"), "投资基础");
  assert.equal(getTrackName("statements", "zh-Hans"), "看懂财务数字");
  assert.equal(getTrackName("first-trade", "zh-Hans"), "第一笔交易做对");
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
