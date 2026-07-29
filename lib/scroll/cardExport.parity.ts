import assert from "node:assert/strict";
import test from "node:test";
import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

// Parity regression: the exported share-card PNG must be the DOM card.
// For each locale, screenshot the DOM card node and capture the actual
// downloaded PNG from the same page state, then compare.
//
// Comparison is shift-tolerant (a pixel only counts as different when it
// has no close match within a small window in the other image) because the
// SVG-foreignObject export rasterizes text with slightly different
// sub-pixel positions — accumulated letter-spacing can shift glyphs a few
// device pixels without any user-visible drift. Structural drift can't
// hide from it:
//  - globally, missing sections/bars register percents of the card;
//  - per-element regions (bbox-driven, incl. the wrapped rank emoji)
//    saturate their own region when an element goes missing.
//
// Run via `npm run test:parity` after `npm run build`. Requires the
// playwright chromium build: npx playwright@1.62.0 install chromium

const PORT = 4183;
const BASE = `http://localhost:${PORT}/scroll`;
const LOCALES = ["en", "zh-Hant", "zh-Hans", "th"] as const;
// Card is 320 css px wide; 3.375 makes both captures 1080px wide.
const SCALE = 3.375;
const SHIFT_RADIUS = 2; // after 2x downsample => tolerates ~4 device px
const CHANNEL_DELTA = 48;
const MAX_GLOBAL_RATIO = 0.015; // measured floor ~0.5% (en) from glyph metrics
const MAX_REGION_RATIO = 0.3; // a missing element saturates its region
const MAX_DIM_DRIFT_PX = 8;

const REGION_SELECTORS = [".big", ".rankline", ".rk-emoji", ".arch", ".arch-subtitle", ".roast", ".chips", ".vsbar", ".flipline", ".challenge", ".brand"];

let server: ChildProcess | null = null;

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("next start did not become ready on port 4183");
}

test.before(async () => {
  server = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
    cwd: process.cwd(),
    stdio: "ignore",
  });
  await waitForServer();
});

test.after(() => {
  server?.kill();
});

function cropTo(png: PNG, width: number, height: number): PNG {
  const out = new PNG({ width, height });
  PNG.bitblt(png, out, 0, 0, width, height, 0, 0);
  return out;
}

function downsample2x(png: PNG): PNG {
  const width = png.width >> 1;
  const height = png.height >> 1;
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      for (let channel = 0; channel < 4; channel += 1) {
        const sum =
          png.data[(y * 2 * png.width + x * 2) * 4 + channel] +
          png.data[(y * 2 * png.width + x * 2 + 1) * 4 + channel] +
          png.data[((y * 2 + 1) * png.width + x * 2) * 4 + channel] +
          png.data[((y * 2 + 1) * png.width + x * 2 + 1) * 4 + channel];
        out.data[(y * width + x) * 4 + channel] = sum >> 2;
      }
    }
  }
  return out;
}

type Rect = { x0: number; y0: number; x1: number; y1: number };

function shiftTolerantBadMask(a: PNG, b: PNG): Uint8Array {
  const { width, height } = a;
  const bad = new Uint8Array(width * height);
  const matches = (img: PNG, x: number, y: number, r: number, g: number, bl: number) => {
    for (let dy = -SHIFT_RADIUS; dy <= SHIFT_RADIUS; dy += 1) {
      for (let dx = -SHIFT_RADIUS; dx <= SHIFT_RADIUS; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const i = (ny * width + nx) * 4;
        if (
          Math.abs(img.data[i] - r) <= CHANNEL_DELTA &&
          Math.abs(img.data[i + 1] - g) <= CHANNEL_DELTA &&
          Math.abs(img.data[i + 2] - bl) <= CHANNEL_DELTA
        ) {
          return true;
        }
      }
    }
    return false;
  };
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (
        !matches(b, x, y, a.data[i], a.data[i + 1], a.data[i + 2]) ||
        !matches(a, x, y, b.data[i], b.data[i + 1], b.data[i + 2])
      ) {
        bad[y * width + x] = 1;
      }
    }
  }
  return bad;
}

function regionRatio(bad: Uint8Array, width: number, height: number, rect: Rect): number {
  const x0 = Math.max(0, Math.floor(rect.x0));
  const y0 = Math.max(0, Math.floor(rect.y0));
  const x1 = Math.min(width, Math.ceil(rect.x1));
  const y1 = Math.min(height, Math.ceil(rect.y1));
  const area = (x1 - x0) * (y1 - y0);
  if (area <= 0) return 0;
  let count = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      count += bad[y * width + x];
    }
  }
  return count / area;
}

test("exported PNG matches the DOM card across locales", async () => {
  const { chromium } = await import("playwright-core");
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    throw new Error(`chromium launch failed — run: npx playwright@1.62.0 install chromium\n${String(error)}`);
  }

  try {
    for (const locale of LOCALES) {
      const context = await browser.newContext({
        viewport: { width: 1240, height: 1000 },
        deviceScaleFactor: SCALE,
        acceptDownloads: true,
      });
      const page = await context.newPage();
      await page.goto(`${BASE}?lang=${locale}`, { waitUntil: "networkidle" });
      // Freeze animations and hide the fixed sticky bar, which otherwise
      // overlays the card's bottom in the element screenshot.
      await page.addStyleTag({
        content:
          "*, *::before, *::after { animation: none !important; transition: none !important; } .scroll-sticky { display: none !important; }",
      });
      await page.waitForTimeout(800);

      const card = page.locator(".scroll-inline-card .scroll-card");
      const regions = await card.evaluate((node, selectors) => {
        const base = node.getBoundingClientRect();
        const out: Record<string, { x0: number; y0: number; x1: number; y1: number }> = {};
        for (const selector of selectors) {
          const el = node.querySelector(selector);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) continue;
          out[selector] = { x0: r.left - base.left, y0: r.top - base.top, x1: r.right - base.left, y1: r.bottom - base.top };
        }
        return out;
      }, REGION_SELECTORS);

      const domShot = PNG.sync.read(await card.screenshot());
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.locator(".scroll-download").click(),
      ]);
      const exportPath = await download.path();
      assert.ok(exportPath, `${locale}: download produced no file`);
      const exported = PNG.sync.read(readFileSync(exportPath));

      assert.ok(
        Math.abs(domShot.width - exported.width) <= MAX_DIM_DRIFT_PX &&
          Math.abs(domShot.height - exported.height) <= MAX_DIM_DRIFT_PX,
        `${locale}: dimensions drifted — DOM ${domShot.width}x${domShot.height} vs export ${exported.width}x${exported.height}`,
      );

      const width = Math.min(domShot.width, exported.width);
      const height = Math.min(domShot.height, exported.height);
      const a = downsample2x(cropTo(domShot, width, height));
      const b = downsample2x(cropTo(exported, width, height));
      const bad = shiftTolerantBadMask(a, b);

      let globalBad = 0;
      for (const value of bad) globalBad += value;
      const globalRatio = globalBad / (a.width * a.height);
      console.log(`${locale}: global diff ${(globalRatio * 100).toFixed(3)}%`);
      assert.ok(
        globalRatio <= MAX_GLOBAL_RATIO,
        `${locale}: export drifted from DOM card — ${(globalRatio * 100).toFixed(2)}% of pixels differ (max ${MAX_GLOBAL_RATIO * 100}%)`,
      );

      for (const [selector, rect] of Object.entries(regions)) {
        // css rect → device px (SCALE) → downsampled coords (/2)
        const scaled: Rect = {
          x0: (rect.x0 * SCALE) / 2,
          y0: (rect.y0 * SCALE) / 2,
          x1: (rect.x1 * SCALE) / 2,
          y1: (rect.y1 * SCALE) / 2,
        };
        const ratio = regionRatio(bad, a.width, a.height, scaled);
        assert.ok(
          ratio <= MAX_REGION_RATIO,
          `${locale}: element ${selector} drifted between DOM and export — ${(ratio * 100).toFixed(1)}% of its region differs`,
        );
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
});
