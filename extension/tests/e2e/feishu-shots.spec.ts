import { test, expect } from './fixtures';

// Captures one screenshot per side-panel state to embed in the Feishu doc.
// Run only after explicit approval to open headed Chromium:
//   ANYCAP_ALLOW_HEADED_E2E=1 pnpm shots:feishu

test.skip(
  process.env.ANYCAP_E2E_MODE !== 'demo',
  'Set ANYCAP_E2E_MODE=demo after `pnpm demo` to run.',
);

const SHOT_DIR = 'tests/e2e/feishu-shots';
const SIDEPANEL_W = 400;
const SIDEPANEL_H = 760;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: SIDEPANEL_W, height: SIDEPANEL_H });
});

test('shot 00 — cold start, empty Vary tab', async ({ extensionId, page }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(page.getByRole('heading', { name: 'AnyCap' })).toBeVisible();
  await expect(page.getByText('Right-click any image')).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/00-cold-vary-empty.png` });
});

test('shot 01 — Vary tab with pending request (source image)', async ({
  context,
  extensionId,
  page,
}) => {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  await sw.evaluate(
    () =>
      new Promise<void>((r) =>
        chrome.storage.session.set(
          {
            pendingRequest: {
              kind: 'vary',
              image: { srcUrl: 'https://picsum.photos/seed/anycap-demo/600/600', width: 600, height: 600 },
              pageUrl: 'https://example.com',
            },
          },
          () => r(),
        ),
      ),
  );
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(page.locator('img[alt="Source"]')).toBeVisible({ timeout: 8_000 });
  // Give picsum a moment to fully render
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOT_DIR}/01-vary-pending.png` });
});

test('shot 02 — Vary tab result', async ({ context, extensionId, page }) => {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  await sw.evaluate(
    () =>
      new Promise<void>((r) =>
        chrome.storage.session.set(
          {
            pendingRequest: {
              kind: 'vary',
              image: { srcUrl: 'https://picsum.photos/seed/anycap-demo/600/600', width: 600, height: 600 },
              pageUrl: 'https://example.com',
            },
          },
          () => r(),
        ),
      ),
  );
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(page.locator('img[alt="Source"]')).toBeVisible({ timeout: 8_000 });
  await page.getByRole('button', { name: /Generate Variation/i }).click();
  await expect(page.locator('img[alt="Generated variation"]')).toBeVisible({ timeout: 12_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOT_DIR}/02-vary-result.png` });
});

test('shot 03 — Image tab with prompt + result', async ({ extensionId, page }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.getByRole('tab', { name: 'Image', exact: true }).click();
  await page.locator('textarea').fill('a watercolor cat reading a book by candlelight');
  await page.getByRole('button', { name: /Generate Image/i }).click();
  await expect(page.locator('img[alt="Generated"]')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOT_DIR}/03-image-result.png` });
});

test('shot 04 — Video tab with result', async ({ extensionId, page }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.getByRole('tab', { name: 'Video', exact: true }).click();
  await page.locator('textarea').fill('a calm beach at sunset, slow drone shot, pastel sky');
  await page.getByRole('button', { name: /Generate Video/i }).click();
  await expect(page.locator('video[controls]')).toBeVisible({ timeout: 14_000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOT_DIR}/04-video-result.png` });
});

test('shot 05 — Music tab with audio player', async ({ extensionId, page }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.getByRole('tab', { name: 'Music', exact: true }).click();
  await page.locator('textarea').fill('uplifting jazz with piano and saxophone, midtempo');
  await page.getByRole('button', { name: /Generate Music/i }).click();
  await expect(page.locator('audio')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOT_DIR}/05-music-result.png` });
});

test('shot 06 — Search tab with results', async ({ extensionId, page }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.getByRole('tab', { name: 'Search', exact: true }).click();
  const queryInput = page.getByPlaceholder('Search the web…');
  await queryInput.fill('agent capability runtime');
  await queryInput.press('Enter');
  await expect(page.locator('ul li').nth(3)).toBeVisible({ timeout: 8_000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOT_DIR}/06-search-results.png`, fullPage: true });
});

test('shot 07 — Crawl tab with extracted markdown', async ({ extensionId, page }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.getByRole('tab', { name: 'Crawl', exact: true }).click();
  await page.getByPlaceholder('https://example.com/article').fill('https://anycap.ai/blog/launch');
  await page.getByRole('button', { name: /Crawl Page/i }).click();
  await expect(page.getByRole('heading', { name: /anycap\.ai — extracted/i })).toBeVisible({
    timeout: 8_000,
  });
  // Open the disclosure so the markdown shows
  await page.getByText(/View extracted markdown/i).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOT_DIR}/07-crawl-markdown.png`, fullPage: true });
});

test('shot 09 — Image tab with template chips visible (no result yet)', async ({ extensionId, page }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.getByRole('tab', { name: 'Image', exact: true }).click();
  await expect(page.getByText('Quick start')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOT_DIR}/09-image-templates.png` });
});

test('shot 11 — Image tab with history thumbnails after 3 generations', async ({ context, extensionId, page }) => {
  // Pre-seed 3 history records via storage (so we don't wait 3 × 2.5s)
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  await sw.evaluate(
    () =>
      new Promise<void>((r) =>
        chrome.storage.local.set(
          {
            recentGenerations: [
              {
                kind: 'image',
                resultUrl: 'https://picsum.photos/seed/h1/600',
                srcUrl: '',
                prompt: 'A studio portrait of a young woman, soft lighting',
                model: 'nano-banana-2',
                aspectRatio: '4:5',
                ts: Date.now() - 1000,
              },
              {
                kind: 'image',
                resultUrl: 'https://picsum.photos/seed/h2/600',
                srcUrl: '',
                prompt: 'Cyberpunk Tokyo back-alley at night after rain, neon',
                model: 'flux-dev',
                aspectRatio: '16:9',
                ts: Date.now() - 2000,
              },
              {
                kind: 'image',
                resultUrl: 'https://picsum.photos/seed/h3/600',
                srcUrl: '',
                prompt: 'Watercolor coastal town at sunrise, pastel sky',
                model: 'flux-dev',
                aspectRatio: '4:3',
                ts: Date.now() - 3000,
              },
            ],
          },
          () => r(),
        ),
      ),
  );
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.getByRole('tab', { name: 'Image', exact: true }).click();
  await expect(page.getByText(/Recent · 3/)).toBeVisible();
  await page.waitForTimeout(800); // let thumbs load
  await page.screenshot({ path: `${SHOT_DIR}/11-image-history.png`, fullPage: true });
});

test('shot 10 — Settings tab', async ({ extensionId, page }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.getByRole('tab', { name: 'Settings', exact: true }).click();
  await expect(page.getByText('Default models')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOT_DIR}/10-settings.png`, fullPage: true });
});

test('shot 08 — paywall (after 3 trials)', async ({ context, extensionId, page }) => {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  await sw.evaluate(
    () =>
      new Promise<void>((r) =>
        chrome.storage.local.set(
          { trialCount: 3, trialFirstUsedAt: Date.now() },
          () => r(),
        ),
      ),
  );
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(page.getByText(/Free Tries Used/i)).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOT_DIR}/08-paywall.png` });
});
