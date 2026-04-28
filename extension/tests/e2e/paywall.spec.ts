import { test, expect } from './fixtures';

test('4th anonymous generation shows paywall', async ({ context, extensionId }) => {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  await sw.evaluate(
    () =>
      new Promise<void>((resolve) => {
        chrome.storage.local.set({ trialCount: 3, trialFirstUsedAt: Date.now() }, () => {
          chrome.storage.session.set(
            {
              pendingRequest: {
                kind: 'vary',
                image: { srcUrl: 'https://picsum.photos/800/600', width: 800, height: 600 },
                pageUrl: 'about:blank',
              },
            },
            () => resolve(),
          );
        });
      }),
  );

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/sidepanel.html`);

  await expect(popup.getByText(/Free Tries Used/i)).toBeVisible();
  await expect(popup.getByText(/Account login coming soon/i)).toBeVisible();
});
