import assert from "node:assert/strict";
import test from "node:test";
import {
  PERCENTILE_MAX,
  PERCENTILE_MIN,
  SCROLL_REGIONS,
  detectScrollLocale,
  getRegionAverageHours,
  normalizeScrollLocale,
  scrollPercentile,
} from "./campaign";

test("normalizeScrollLocale accepts current and legacy values", () => {
  assert.equal(normalizeScrollLocale("en"), "en");
  assert.equal(normalizeScrollLocale("zh"), "zh-Hant"); // legacy two-locale era
  assert.equal(normalizeScrollLocale("zh-Hant"), "zh-Hant");
  assert.equal(normalizeScrollLocale("zh-hans"), "zh-Hans");
  assert.equal(normalizeScrollLocale("th"), "th");
  assert.equal(normalizeScrollLocale("th-TH"), "th");
  assert.equal(normalizeScrollLocale("fr"), null);
  assert.equal(normalizeScrollLocale(null), null);
});

test("browser script tags pick the matching Chinese script", () => {
  assert.equal(detectScrollLocale(["zh-HK"], "ww"), "zh-Hant");
  assert.equal(detectScrollLocale(["zh-TW"], "ww"), "zh-Hant");
  assert.equal(detectScrollLocale(["zh-Hant"], "sg"), "zh-Hant");
  assert.equal(detectScrollLocale(["zh-CN"], "ww"), "zh-Hans");
  assert.equal(detectScrollLocale(["zh-SG"], "ww"), "zh-Hans");
  assert.equal(detectScrollLocale(["zh-Hans-CN"], "hk"), "zh-Hans");
});

test("bare zh falls back to the detected region: HK Hant, SG Hans", () => {
  assert.equal(detectScrollLocale(["zh"], "hk"), "zh-Hant");
  assert.equal(detectScrollLocale(["zh"], "sg"), "zh-Hans");
  assert.equal(detectScrollLocale(["zh"], "ww"), "zh-Hans");
});

test("language beats region: explicit English wins over any region", () => {
  assert.equal(detectScrollLocale(["en-HK"], "hk"), "en");
  assert.equal(detectScrollLocale(["en-SG", "ms"], "sg"), "en");
  assert.equal(detectScrollLocale(["en-TH"], "th"), "en"); // en-TH stays English
  assert.equal(detectScrollLocale([], "ww"), "en");
});

test("Thai browser language selects Thai anywhere", () => {
  assert.equal(detectScrollLocale(["th"], "ww"), "th");
  assert.equal(detectScrollLocale(["th-TH"], "th"), "th");
  assert.equal(detectScrollLocale(["en-US", "th-TH"], "hk"), "th");
});

test("region Thailand fills in only when no recognized language preference exists", () => {
  assert.equal(detectScrollLocale([], "th"), "th");
  assert.equal(detectScrollLocale(["fr-FR"], "th"), "th"); // no en/zh/th expressed
  assert.equal(detectScrollLocale(["fr-FR"], "hk"), "en"); // only Thailand has a region default
});

test("first Chinese or Thai entry in the language list wins", () => {
  assert.equal(detectScrollLocale(["en-US", "zh-TW"], "ww"), "zh-Hant");
  assert.equal(detectScrollLocale(["en-US", "zh-CN", "zh-TW"], "ww"), "zh-Hans");
  assert.equal(detectScrollLocale(["en-US", "th-TH", "zh-TW"], "ww"), "th");
});

// A3: the rank tile names a market, so the number must actually depend on it.
// The previous T(hours) took no region and returned P68 for all four.
test("percentile depends on the selected market", () => {
  const seen = new Set(SCROLL_REGIONS.map((region) => scrollPercentile(5.2, region)));
  assert.ok(seen.size > 1, `expected the percentile to move with region, got ${[...seen]}`);
  // Thailand's own standings average is 5.2h, so a 5.2h Thai user must not
  // be told they out-scroll most of Thailand.
  assert.ok(
    scrollPercentile(5.2, "th") < scrollPercentile(5.2, "sg"),
    "a higher market average must place the same hours lower",
  );
});

// A4: 9.7h-12h previously all returned P100 / "Top 1%" — 19% of the slider
// producing one identical rank.
test("the top of the slider is not a dead range", () => {
  const tail = [9.5, 10, 11, 12].map((hours) => scrollPercentile(hours, "ww"));
  assert.ok(new Set(tail).size > 1, `expected distinct ranks across the tail, got ${tail}`);
  assert.ok(Math.max(...tail) <= PERCENTILE_MAX);
});

test("percentiles stay inside a living range and rise monotonically", () => {
  let previous = 0;
  for (let hours = 0.5; hours <= 12.0001; hours += 0.1) {
    const p = scrollPercentile(Math.round(hours * 10) / 10, "ww");
    assert.ok(p >= PERCENTILE_MIN && p <= PERCENTILE_MAX, `P${p} outside [1, 99]`);
    assert.ok(p >= previous, "percentile must not decrease as hours rise");
    previous = p;
  }
});

// B4: a normal distribution over a strictly positive quantity assigned ~2%
// of people negative screen time.
test("no share of the population sits below zero hours", () => {
  assert.equal(scrollPercentile(0, "ww"), PERCENTILE_MIN);
  assert.equal(scrollPercentile(-3, "ww"), PERCENTILE_MIN);
  assert.equal(scrollPercentile(Number.NaN, "ww"), PERCENTILE_MIN);
});

test("region averages come from the standings table", () => {
  assert.equal(getRegionAverageHours("th"), 5.2);
  assert.equal(getRegionAverageHours("sg"), 4.1);
  assert.equal(getRegionAverageHours("ww"), 4.4);
});
