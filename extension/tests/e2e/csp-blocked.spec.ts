import { test, expect } from './fixtures';

test('server 429 shows paywall with trial exhausted message', async ({ context, extensionId }) => {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  await sw.evaluate(
    () =>
      new Promise<void>((resolve) =>
        chrome.storage.session.set(
          {
            pendingRequest: {
              kind: 'vary',
              image: { srcUrl: 'https://picsum.photos/800/600', width: 800, height: 600 },
              pageUrl: 'about:blank',
            },
          },
          () => resolve(),
        ),
      ),
  );

  const popup = await context.newPage();
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

  await popup.goto(`chrome-extension://${extensionId}/sidepanel.html`);

  await expect(popup.locator('img[alt="Source"]')).toBeVisible();
  await popup.getByRole('button', { name: /Generate Variation/i }).click();
  await expect(popup.getByText(/Free Tries Used/i)).toBeVisible({ timeout: 15_000 });
});
