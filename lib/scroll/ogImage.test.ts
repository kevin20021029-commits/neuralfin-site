import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const OG = resolve(__dirname, "../../public/assets/scroll-og.png");

// The OG image is the preview for every shared link — the surface this
// campaign actually spreads through. It shipped as a 731x300 logo, which
// platforms letterbox or crop. These assert the committed asset stays at
// the standard and stays wired up.
test("the scroll OG image exists at the 1200x630 standard", () => {
  assert.ok(existsSync(OG), "public/assets/scroll-og.png missing — run `npm run og:render`");
  const png = readFileSync(OG);
  assert.equal(png.readUInt32BE(16), 1200, "OG width must be 1200");
  assert.equal(png.readUInt32BE(20), 630, "OG height must be 630");
});

test("the scroll page points OpenGraph and Twitter at it", () => {
  const page = readFileSync(resolve(__dirname, "../../app/scroll/page.tsx"), "utf8");
  const matches = page.match(/scroll-og\.png/g) ?? [];
  assert.equal(matches.length, 2, "both openGraph and twitter should use the OG card");
  assert.ok(!page.includes("neuralfin-logo-transparent-cropped"), "the logo placeholder should no longer be the share preview");
});
