import assert from "node:assert/strict";
import test from "node:test";
import { addScrollResult, buildScrollSummary } from "./resultsStore";
import { SCROLL_COMMUNITY_THRESHOLD } from "./campaign";

// A8: the standings shipped inert — the summary endpoint computed data the
// component then discarded. The averages half is now wired; the flip-rate
// half is an in-app behaviour the calculator cannot observe, so it stays
// out of this payload by design rather than by omission.

test("market averages stay null until the community threshold is met", () => {
  const summary = buildScrollSummary();
  assert.equal(summary.useCommunity, false, "a fresh store must not claim community data");
  assert.ok(summary.markets, "markets must always be present in the payload");
  assert.equal(summary.markets.hk.averageHours, null, "no submissions -> no average");
  assert.equal(summary.markets.hk.count, 0);
});

test("market averages compute from real submissions once past the threshold", () => {
  // Two distinct markets so the per-region split is exercised, not just ww.
  for (let i = 0; i < SCROLL_COMMUNITY_THRESHOLD; i += 1) {
    addScrollResult({ hours: 6, region: "hk", ts: 1 });
  }
  addScrollResult({ hours: 2, region: "sg", ts: 1 });

  const summary = buildScrollSummary();
  assert.equal(summary.useCommunity, true);
  assert.equal(summary.markets.hk.averageHours, 6, "HK average is its own submissions");
  assert.equal(summary.markets.sg.averageHours, 2, "SG average is its own submissions");
  assert.equal(summary.markets.hk.count, SCROLL_COMMUNITY_THRESHOLD);

  // Worldwide aggregates every market, so it sits between the two.
  const ww = summary.markets.ww.averageHours!;
  assert.ok(ww > 2 && ww <= 6, `worldwide should aggregate all markets, got ${ww}`);

  // Hard Rule 2: the payload carries no identifiers, only hours/region/ts.
  const recentKeys = new Set(summary.recent.flatMap((row) => Object.keys(row)));
  assert.deepEqual([...recentKeys].sort(), ["hours", "region", "ts"]);
});
