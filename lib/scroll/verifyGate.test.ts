import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { canVerifyParse, regionFromLocale } from "@/components/scroll/ScrollCalculator";
import type { ParsedScreenTime } from "./ocrSanitizer";

function parsed(overrides: Partial<ParsedScreenTime> = {}): ParsedScreenTime {
  return {
    hours: 5.2,
    source: "average",
    totalHours: 5.2,
    scrollHours: null,
    apps: [],
    confidence: 92,
    layout: "ios",
    flags: [],
    sawCategories: false,
    ratioScope: null,
    ...overrides,
  };
}

// A0b: the badge is the page's strongest claim — that the figure came from
// the user's screenshot and was checked. On the backtest fixtures the MORE
// wrong read (-85%) earned it while the less wrong one (-63%) did not,
// because a confidently-wrong parse carries no flags at all.
test("a clean, anchored, confident parse is verifiable", () => {
  assert.equal(canVerifyParse(parsed()), true);
});

test("day-scoped totals are never verified", () => {
  assert.equal(canVerifyParse(parsed({ source: "day-total" })), false);
});

test("degradation flags block the badge, except a failed restricted pass", () => {
  assert.equal(canVerifyParse(parsed({ flags: ["ambiguous_duration_dropped"] })), false);
  assert.equal(canVerifyParse(parsed({ flags: ["tile_count_mismatch"] })), false);
  assert.equal(canVerifyParse(parsed({ flags: ["restricted_pass_failed"] })), true);
});

// The 11h47m fixture's failure mode: categories were recognized (707 min of
// them) but the parser could not reconcile them with the promoted headline,
// so it suppressed the ratio — and then the UI asserted VERIFIED anyway.
test("unreconciled category rows block the badge", () => {
  assert.equal(canVerifyParse(parsed({ sawCategories: true, scrollHours: null })), false);
  // Reconciled: categories parsed AND squared against the total.
  assert.equal(
    canVerifyParse(parsed({ sawCategories: true, scrollHours: 3.1, totalHours: 5.2, ratioScope: "day" })),
    true,
  );
});

// BUILD_SPEC §6: the weekly-view parse is correct and must not regress. That
// path never computes a scroll ratio, so its null scrollHours is by design
// and must not be read as a failed reconciliation.
test("a correct weekly-total parse keeps its badge", () => {
  assert.equal(
    canVerifyParse(parsed({ source: "weekly-total", sawCategories: true, scrollHours: null })),
    true,
  );
});

test("low OCR confidence blocks the badge", () => {
  assert.equal(canVerifyParse(parsed({ confidence: 40 })), false);
  assert.equal(canVerifyParse(parsed({ confidence: 0 })), false);
});

test("a parse with no hours is never verified", () => {
  assert.equal(canVerifyParse(parsed({ hours: null, source: null })), false);
});

// B8: region came from a substring scan of the whole locale string rather
// than the region subtag.
test("region comes from the locale's region subtag", () => {
  assert.equal(regionFromLocale("zh-HK"), "hk");
  assert.equal(regionFromLocale("en-SG"), "sg");
  assert.equal(regionFromLocale("th-TH"), "th");
  assert.equal(regionFromLocale("en-US"), "ww");
  assert.equal(regionFromLocale("zh-Hant"), "ww"); // script subtag, not a region
  assert.equal(regionFromLocale("zh-Hant-HK"), "hk");
  assert.equal(regionFromLocale("en"), "ww");
});

// The notice must never hedge and assert at the same time, and must never
// tell a user who uploaded a daily average to go upload a daily average.
// This mirrors the routing in ScrollCalculator's scanNotice.
function noticeKind(r: { verified: boolean; source: ParsedScreenTime["source"] }) {
  if (r.verified) return "none";
  return r.source === "day-total" ? "day-view-prompt" : "look-right";
}

test("a verified read does not also hedge", () => {
  // The ✓ badge and the "Read: <duration>" chip assert; adding
  // "look right?" beside them is the page contradicting itself.
  assert.equal(noticeKind({ verified: true, source: "average" }), "none");
  assert.equal(noticeKind({ verified: true, source: "weekly-total" }), "none");
});

test("only a day-scoped read is told to upload the week view", () => {
  assert.equal(noticeKind({ verified: false, source: "day-total" }), "day-view-prompt");
  // An average or weekly source already IS the week view — prompting for it
  // told users to do the thing they had just done.
  assert.equal(noticeKind({ verified: false, source: "average" }), "look-right");
  assert.equal(noticeKind({ verified: false, source: "weekly-total" }), "look-right");
});

// The save overlay declares role="dialog" aria-modal="true" — a promise to
// assistive tech that the rest of the page is inert. It implemented none of
// it: focus stayed behind, Tab walked out into that supposedly-inert
// content, Escape did nothing, the page still scrolled, and focus was
// dropped on close. It matters more than most dialogs because in WeChat /
// LINE / IG / FB this overlay is the ONLY way to save the card.
//
// The behaviour lives in a DOM effect, so this asserts the contract the
// component must keep; the browser-level verification is in the a11y sweep.
test("a dialog claiming aria-modal owes five behaviours", () => {
  const required = [
    "focus moves into the dialog on open",
    "focus is trapped while it is open",
    "Escape closes it",
    "the page behind does not scroll",
    "focus returns to the trigger on close",
  ];
  assert.equal(required.length, 5);
  // Guard the markup contract the effect depends on: without the refs and
  // the aria attributes, the effect silently does nothing.
  const source = readFileSync(resolve(__dirname, "../../components/scroll/ScrollCalculator.tsx"), "utf8");
  assert.match(source, /role="dialog"/, "overlay must keep its dialog role");
  assert.match(source, /aria-modal="true"/, "overlay must keep aria-modal");
  assert.match(source, /ref=\{saveOverlayElRef\}/, "the effect needs a ref to the dialog to trap focus");
  assert.match(source, /ref=\{saveOverlayCloseRef\}/, "the effect needs a ref to focus on open");
  assert.match(source, /document\.body\.style\.overflow = "hidden"/, "the page behind must be scroll-locked");
  assert.match(source, /event\.key === "Escape"/, "Escape must close the dialog");
  assert.match(source, /previouslyFocused\?\.focus\?\.\(\)/, "focus must return to the trigger");
});
