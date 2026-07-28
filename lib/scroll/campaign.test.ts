import assert from "node:assert/strict";
import test from "node:test";
import { detectScrollLocale, normalizeScrollLocale } from "./campaign";

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
