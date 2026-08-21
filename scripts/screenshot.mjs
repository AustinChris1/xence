/**
 * Visual verification.
 *
 * Design work cannot be judged through grep. This drives a real browser over
 * the running dev server and writes screenshots, so a colour or layout change
 * gets looked at before it is called done.
 *
 * Usage:  pnpm dev            (in one shell)
 *         pnpm shots          (in another)
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.SHOT_BASE ?? "http://localhost:3111";
const OUT = process.env.SHOT_OUT ?? "shots";

const SHOTS = [
  { name: "01-hero", path: "/", y: 0 },
  { name: "02-problem", path: "/", y: 1100 },
  { name: "03-conflict", path: "/", y: 2200 },
  { name: "04-mechanism", path: "/", y: 3400 },
  { name: "05-forfeit", path: "/", y: 4600 },
  { name: "06-privacy", path: "/", y: 5800 },
  { name: "07-calibration", path: "/", y: 7000 },
  { name: "08-app", path: "/app", y: 0 },
  { name: "09-leaderboard", path: "/leaderboard", y: 0 },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

let current = null;
for (const shot of SHOTS) {
  if (current !== shot.path) {
    await page.goto(BASE + shot.path, { waitUntil: "networkidle", timeout: 60000 });
    current = shot.path;
    await page.waitForTimeout(2000);
  }
  await page.evaluate((y) => window.scrollTo(0, y), shot.y);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${shot.name}.png` });
  console.log(`  ${shot.name}`);
}

await browser.close();
console.log(`\n${SHOTS.length} screenshots -> ${OUT}/`);
