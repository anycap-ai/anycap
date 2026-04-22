import { test, expect } from './fixtures';

const VIEWPORT = { width: 360, height: 640 };

async function openPopup(context: any, extensionId: string) {
  const popup = await context.newPage();
  await popup.setViewportSize(VIEWPORT);
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  return popup;
}

test.describe('popup visual states', () => {
  test('01-idle — default state with instruction', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await expect(popup.getByText('Right-click any image')).toBeVisible();
    await popup.screenshot({ path: 'tests/e2e/screenshots/01-idle.png' });
  });

  test('02-generate — pending request with source image', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.evaluate(() => {
      chrome.storage.session.set({
        pendingRequest: {
          type: 'ANYCAP_START_GENERATION',
          image: { srcUrl: 'https://picsum.photos/800/600', width: 800, height: 600 },
          pageUrl: 'about:blank',
        },
      });
    });
    await popup.reload();
    await expect(popup.locator('img[alt="Source"]')).toBeVisible({ timeout: 5_000 });
    await popup.screenshot({ path: 'tests/e2e/screenshots/02-generate.png' });
  });

  test('03-paywall — trial exhausted', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.evaluate(async () => {
      await chrome.storage.local.set({ trialCount: 3, trialFirstUsedAt: Date.now() });
      await chrome.storage.session.set({
        pendingRequest: {
          type: 'ANYCAP_START_GENERATION',
          image: { srcUrl: 'https://picsum.photos/800/600', width: 800, height: 600 },
          pageUrl: 'about:blank',
        },
      });
    });
    await popup.reload();
    await expect(popup.getByText(/Free Tries Used/i)).toBeVisible();
    await popup.screenshot({ path: 'tests/e2e/screenshots/03-paywall.png' });
  });

  test('04-history — recent generations grid', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await popup.evaluate(async () => {
      await chrome.storage.local.set({
        recentGenerations: [
          { resultUrl: 'https://picsum.photos/200/200?a=1', srcUrl: 'https://example.com/1.png', ts: Date.now() },
          { resultUrl: 'https://picsum.photos/200/200?a=2', srcUrl: 'https://example.com/2.png', ts: Date.now() - 1000 },
          { resultUrl: 'https://picsum.photos/200/200?a=3', srcUrl: 'https://example.com/3.png', ts: Date.now() - 2000 },
          { resultUrl: 'https://picsum.photos/200/200?a=4', srcUrl: 'https://example.com/4.png', ts: Date.now() - 3000 },
        ],
      });
    });
    await popup.reload();
    // Wait for at least one history thumbnail
    await expect(popup.locator('img[alt="Recent"]').first()).toBeVisible({ timeout: 5_000 });
    await popup.screenshot({ path: 'tests/e2e/screenshots/04-history.png' });
  });

  test('05-result — successful generation', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);

    // Mock API to return a result immediately
    await popup.route('**/v1/image/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'req_vis',
          status: 'success',
          data: {
            id: 'gen_vis',
            status: 'completed',
            model: 'nano-banana-2',
            outputs: [{ type: 'image', url: 'https://picsum.photos/400/400?result=1', mime_type: 'image/png' }],
          },
        }),
      });
    });

    await popup.evaluate(() => {
      chrome.storage.session.set({
        pendingRequest: {
          type: 'ANYCAP_START_GENERATION',
          image: { srcUrl: 'https://picsum.photos/800/600?source=1', width: 800, height: 600 },
          pageUrl: 'about:blank',
        },
      });
    });
    await popup.reload();
    await expect(popup.locator('img[alt="Source"]')).toBeVisible({ timeout: 5_000 });

    // Click generate and wait for result
    await popup.getByRole('button', { name: /Generate Variation/i }).click();
    await expect(popup.locator('img[alt="Generated variation"]')).toBeVisible({ timeout: 10_000 });

    await popup.screenshot({ path: 'tests/e2e/screenshots/05-result.png' });
  });

  test('06-error — failed generation', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);

    await popup.route('**/v1/image/generate', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'req_err',
          status: 'error',
          error: { code: 'RATE_LIMITED', message: 'Trial exhausted' },
        }),
      });
    });

    await popup.evaluate(() => {
      chrome.storage.session.set({
        pendingRequest: {
          type: 'ANYCAP_START_GENERATION',
          image: { srcUrl: 'https://picsum.photos/800/600?source=2', width: 800, height: 600 },
          pageUrl: 'about:blank',
        },
      });
    });
    await popup.reload();
    await expect(popup.locator('img[alt="Source"]')).toBeVisible({ timeout: 5_000 });

    await popup.getByRole('button', { name: /Generate Variation/i }).click();
    // Wait for error banner
    await expect(popup.locator('text=/free tries/i')).toBeVisible({ timeout: 10_000 });

    await popup.screenshot({ path: 'tests/e2e/screenshots/06-error.png' });
  });

  test('07-loading — generation in progress', async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);

    // Mock API with a long delay so we can catch the loading spinner
    await popup.route('**/v1/image/generate', async (route) => {
      await new Promise((r) => setTimeout(r, 5_000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'req_load',
          status: 'success',
          data: {
            id: 'gen_load',
            status: 'completed',
            model: 'nano-banana-2',
            outputs: [{ type: 'image', url: 'https://picsum.photos/400/400?result=2', mime_type: 'image/png' }],
          },
        }),
      });
    });

    await popup.evaluate(() => {
      chrome.storage.session.set({
        pendingRequest: {
          type: 'ANYCAP_START_GENERATION',
          image: { srcUrl: 'https://picsum.photos/800/600?source=3', width: 800, height: 600 },
          pageUrl: 'about:blank',
        },
      });
    });
    await popup.reload();
    await expect(popup.locator('img[alt="Source"]')).toBeVisible({ timeout: 5_000 });

    await popup.getByRole('button', { name: /Generate Variation/i }).click();
    // Spinner should appear immediately
    await expect(popup.locator('text=/Generating/i')).toBeVisible({ timeout: 5_000 });

    await popup.screenshot({ path: 'tests/e2e/screenshots/07-loading.png' });
  });
});
