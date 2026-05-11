#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chromium } from 'playwright';

export const CWS_SHOTS = [
  { html: '01-hero.html', out: '01-hero-1280x800.png', width: 1280, height: 800 },
  { html: '02-rightclick.html', out: '02-rightclick-1280x800.png', width: 1280, height: 800 },
  { html: '03-templates.html', out: '03-templates-1280x800.png', width: 1280, height: 800 },
  { html: '04-history.html', out: '04-history-1280x800.png', width: 1280, height: 800 },
  { html: '05-marquee.html', out: '05-marquee-1400x560.png', width: 1400, height: 560 },
  { html: '06-promo.html', out: '06-promo-440x280.png', width: 440, height: 280 },
];

const currentFile = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(currentFile);
const defaultRoot = path.resolve(scriptDir, '..');

export function browserLaunchOptions() {
  return { headless: true };
}

function fileUrl(filePath) {
  return pathToFileURL(filePath).href;
}

export async function renderCWSAssets({ rootDir = defaultRoot } = {}) {
  const composerDir = path.join(rootDir, 'store-assets/composer');
  const outDir = path.join(rootDir, 'store-assets/cws');
  const browser = await chromium.launch(browserLaunchOptions());

  try {
    const page = await browser.newPage();
    for (const shot of CWS_SHOTS) {
      await page.setViewportSize({ width: shot.width, height: shot.height });
      await page.goto(fileUrl(path.join(composerDir, shot.html)));
      await page.locator('.panel-frame img').first().waitFor({ state: 'visible', timeout: 5_000 });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(outDir, shot.out),
        clip: { x: 0, y: 0, width: shot.width, height: shot.height },
      });
      console.log(`render-cws-assets: wrote store-assets/cws/${shot.out}`);
    }
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  renderCWSAssets().catch((err) => {
    console.error(`render-cws-assets: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
