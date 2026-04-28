import { test, expect } from './fixtures';

test('popup opens and shows idle state', async ({ context, extensionId }) => {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(popup.getByRole('heading', { name: 'AnyCap' })).toBeVisible();
  await expect(popup.getByText('Right-click any image')).toBeVisible();
});

test('pending request from storage session opens generate view', async ({ context, extensionId }) => {
  // Seed via the service worker BEFORE opening the panel — App.tsx reads
  // chrome.storage.session on mount and renders the source image.
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
  await popup.goto(`chrome-extension://${extensionId}/sidepanel.html`);

  await expect(popup.locator('img[alt="Source"]')).toBeVisible({ timeout: 5_000 });
});
