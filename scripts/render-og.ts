// Renders scripts/og-card.html to public/assets/scroll-og.png at the
// 1200x630 OG standard. Run with `npm run og:render` after editing the
// template; the output is committed so the site never depends on this
// script at build or request time.
import { resolve } from "node:path";
import { statSync } from "node:fs";

const TEMPLATE = resolve(__dirname, "og-card.html");
const OUTPUT = resolve(__dirname, "../public/assets/scroll-og.png");
const WIDTH = 1200;
const HEIGHT = 630;

async function main() {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(`file://${TEMPLATE}`, { waitUntil: "networkidle" });
    // Fail loudly rather than shipping an OG image with a missing logo.
    const brokenImages = await page.evaluate(() =>
      Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute("src")),
    );
    if (brokenImages.length > 0) throw new Error(`template has unloadable images: ${brokenImages.join(", ")}`);
    await page.screenshot({ path: OUTPUT });
    await context.close();
  } finally {
    await browser.close();
  }
  console.log(`wrote ${OUTPUT} (${statSync(OUTPUT).size} bytes, ${WIDTH}x${HEIGHT})`);
}

main();
