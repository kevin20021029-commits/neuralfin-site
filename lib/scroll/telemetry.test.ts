import assert from "node:assert/strict";
import test from "node:test";
import {
  buildScrollTelemetrySummary,
  recordScrollTelemetry,
  recordScrollTelemetryEvent,
  setScrollTelemetryStorage,
  type ScrollTelemetryStorage,
} from "./resultsStore";
import { PARSE_FLAGS } from "./ocrSanitizer";

test("event and layout counters accumulate through the storage interface", async () => {
  const counts = new Map<string, number>();
  setScrollTelemetryStorage({
    increment(key) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    },
    snapshot() {
      return Object.fromEntries(counts);
    },
  });

  recordScrollTelemetry("samsung", "full");
  recordScrollTelemetry("samsung", "full");
  recordScrollTelemetryEvent("tile_count_mismatch");
  recordScrollTelemetryEvent("headline_crop_unrecoverable");

  const summary = await buildScrollTelemetrySummary();
  assert.equal(summary["samsung:full"], 2);
  assert.equal(summary["event:tile_count_mismatch"], 1);
  assert.equal(summary["event:headline_crop_unrecoverable"], 1);
});

test("telemetry writes are fire-and-forget: a broken backend never throws", async () => {
  const throwingStorage: ScrollTelemetryStorage = {
    increment() {
      throw new Error("backend down");
    },
    snapshot() {
      return Promise.reject(new Error("backend down"));
    },
  };
  setScrollTelemetryStorage(throwingStorage);

  assert.doesNotThrow(() => recordScrollTelemetry("ios", "failed"));
  assert.doesNotThrow(() => recordScrollTelemetryEvent("restricted_pass_failed"));
  assert.deepEqual(await buildScrollTelemetrySummary(), {});

  const rejectingStorage: ScrollTelemetryStorage = {
    increment() {
      return Promise.reject(new Error("async backend down"));
    },
    snapshot() {
      return {};
    },
  };
  setScrollTelemetryStorage(rejectingStorage);
  assert.doesNotThrow(() => recordScrollTelemetryEvent("ambiguous_duration_dropped"));
});

test("the degradation event vocabulary is the parser flag set", () => {
  assert.deepEqual(
    [...PARSE_FLAGS].sort(),
    [
      "ambiguous_duration_dropped",
      "category_total_exceeds_headline",
      "headline_crop_unrecoverable",
      "restricted_pass_failed",
      "tile_count_mismatch",
    ].sort(),
  );
});
