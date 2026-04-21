import { test, expect } from './fixtures';

test('popup opens and shows idle state', async ({ context, extensionId }) => {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.getByRole('heading', { name: 'AnyCap' })).toBeVisible();
  await expect(popup.getByText('Right-click any image')).toBeVisible();
});

test('pending request from storage session opens generate view', async ({ context, extensionId }) => {
  const popup = await context.newPage();

  // Seed the session storage with a pending request before opening popup
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.evaluate(() => {
    chrome.storage.session.set({
      pendingRequest: {
        type: 'ANYCAP_START_GENERATION',
        image: { srcUrl: 'https://picsum.photos/800/600', width: 800, height: 600 },
        pageUrl: 'about:blank',
      },
    });
  });

  // Reload so popup picks up the pending request
  await popup.reload();

  // Should show source image and generate button
  await expect(popup.locator('img[alt="Source"]')).toBeVisible({ timeout: 5_000 });
});
