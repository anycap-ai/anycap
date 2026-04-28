import { test } from './fixtures';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPOSER_DIR = path.resolve(__dirname, '../../store-assets/composer');
const OUT_DIR = path.resolve(__dirname, '../../store-assets/cws');

const fileUrl = (name: string) =>
  pathToFileURL(path.join(COMPOSER_DIR, name)).href;

const SHOTS: Array<{ html: string; out: string; w: number; h: number }> = [
  { html: '01-hero.html',       out: '01-hero-1280x800.png',      w: 1280, h: 800 },
  { html: '02-rightclick.html', out: '02-rightclick-1280x800.png', w: 1280, h: 800 },
  { html: '03-templates.html',  out: '03-templates-1280x800.png',  w: 1280, h: 800 },
  { html: '04-history.html',    out: '04-history-1280x800.png',    w: 1280, h: 800 },
  { html: '05-marquee.html',    out: '05-marquee-1400x560.png',    w: 1400, h: 560 },
  { html: '06-promo.html',      out: '06-promo-440x280.png',       w: 440,  h: 280 },
];

for (const s of SHOTS) {
  test(`render ${s.out}`, async ({ context }) => {
    const page = await context.newPage();
    await page.setViewportSize({ width: s.w, height: s.h });
    await page.goto(fileUrl(s.html));
    // Wait for the side panel screenshot to load
    await page.locator('.panel-frame img').first().waitFor({ state: 'visible', timeout: 5_000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT_DIR, s.out), clip: { x: 0, y: 0, width: s.w, height: s.h } });
  });
}
