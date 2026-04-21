import { test, expect } from './fixtures';

test('server 429 shows paywall with trial exhausted message', async ({ context, extensionId }) => {
  const popup = await context.newPage();

  // Mock the generate API to return 429
  await popup.route('**/v1/image/generate', async (route) => {
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'req_429',
        status: 'error',
        error: { code: 'RATE_LIMITED', message: 'Trial exhausted' },
      }),
    });
  });

  await popup.goto(`chrome-extension://${extensionId}/popup.html`);

  // Seed pending request
  await popup.evaluate(async () => {
    await chrome.storage.session.set({
      pendingRequest: {
        type: 'ANYCAP_START_GENERATION',
        image: { srcUrl: 'https://picsum.photos/800/600', width: 800, height: 600 },
        pageUrl: 'about:blank',
      },
    });
  });

  await popup.reload();

  // Wait for generate view to appear
  await expect(popup.locator('img[alt="Source"]')).toBeVisible();

  // Click generate and wait for the error/paywall state
  await popup.getByRole('button', { name: /Generate Variation/i }).click();

  // The mocked 429 maps to TRIAL_EXHAUSTED → paywall view
  await expect(popup.getByText(/Free Tries Used/i)).toBeVisible({ timeout: 15_000 });
});
