import { test, expect } from './fixtures';

// Verifies the demo build (WXT_MOCK=true) — the entire flow works without
// any route mocking from Playwright. This is the test the demo build must
// pass before we hand it to a viewer. Skipped under the regular (non-mock)
// build because it intentionally relies on the in-bundle mock.
test.skip(
  process.env.ANYCAP_E2E_MODE !== 'demo',
  'Set ANYCAP_E2E_MODE=demo after `pnpm demo` to run.',
);

test('demo mock build: pending request → click generate → mock returns image', async ({
  context,
  extensionId,
}) => {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));

  // Seed a pending request as if the user just right-clicked an image.
  await sw.evaluate(
    () =>
      new Promise<void>((resolve) =>
        chrome.storage.session.set(
          {
            pendingRequest: {
              kind: 'vary',
              image: {
                srcUrl: 'https://picsum.photos/seed/anycap-source/600/600',
                width: 600,
                height: 600,
              },
              pageUrl: 'https://example.com/article',
            },
          },
          () => resolve(),
        ),
      ),
  );

  const popup = await context.newPage();

  // Track outbound network — there should be NO calls to api.anycap.ai.
  const outboundApi: string[] = [];
  popup.on('request', (req) => {
    if (req.url().includes('api.anycap.ai') || req.url().includes('/v1/')) {
      outboundApi.push(req.url());
    }
  });

  await popup.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(popup.locator('img[alt="Source"]')).toBeVisible({ timeout: 5_000 });

  await popup.getByRole('button', { name: /Generate Variation/i }).click();

  // Mock returns after ~2.4s. Allow up to 8s.
  await expect(popup.locator('img[alt="Generated variation"]')).toBeVisible({ timeout: 8_000 });

  // Confirm the demo bundle never calls the real server.
  expect(outboundApi).toEqual([]);
});
