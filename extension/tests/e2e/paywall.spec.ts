import { test, expect } from './fixtures';

test('4th anonymous generation shows paywall', async ({ context, extensionId }) => {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);

  // Seed trial exhaustion in local storage and session storage
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
  await expect(popup.getByRole('button', { name: /Sign In/i })).toBeVisible();
});
