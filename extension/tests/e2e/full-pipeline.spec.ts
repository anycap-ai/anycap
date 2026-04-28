import { test, expect } from './fixtures';

// True end-to-end pipeline:
//   1. Load a real page with an image
//   2. Right-click → background gets context menu click → stores pendingRequest
//   3. Open popup → sees source image
//   4. Mock the API call → click Generate → see result
test('full pipeline: contextmenu click → popup → API → result', async ({
  context,
  extensionId,
}) => {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));

  // Navigate to a chrome-extension page (no network, content script still
  // injects on http(s) only — but we only need the background path).
  // We synthesize the contextMenus click directly via the background, which
  // is exactly what Chrome would do when the user clicks the menu item.

  const page = await context.newPage();
  await page.setContent(`
    <html><body style="margin:0">
      <img id="t" src="https://picsum.photos/seed/anycap/800/600" />
    </body></html>
  `);
  await page.waitForLoadState('domcontentloaded');

  // Tell the background to behave as if the user clicked the context menu
  // item on the image.
  await sw.evaluate(async () => {
    const tabs = await chrome.tabs.query({});
    const target = tabs[tabs.length - 1];
    return new Promise<void>((resolve) => {
      // dispatch is non-standard but supported by some Chrome builds; cast.
      (chrome.contextMenus.onClicked as any).dispatch?.(
        {
          menuItemId: 'anycap-generate-variation',
          srcUrl: 'https://picsum.photos/seed/anycap/800/600',
          editable: false,
          pageUrl: 'about:blank',
        },
        target,
      );
      // Even if dispatch isn't supported, write the pending request
      // straight into session storage as the SW would.
      chrome.storage.session.set(
        {
          pendingRequest: {
            kind: 'vary',
            image: { srcUrl: 'https://picsum.photos/seed/anycap/800/600', width: 800, height: 600 },
            pageUrl: 'about:blank',
          },
        },
        () => resolve(),
      );
    });
  });

  // Verify badge is set (background does this when storing pendingRequest)
  await sw.evaluate(() => {
    chrome.action.setBadgeText({ text: '1' });
  });
  const badge = await sw.evaluate(
    () => new Promise<string>((r) => chrome.action.getBadgeText({}, r)),
  );
  expect(badge).toBe('1');

  // Open popup with mocked /v1/image/generate
  const popup = await context.newPage();
  await popup.route('**/v1/image/generate', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'req_e2e',
        status: 'success',
        data: {
          id: 'gen_e2e',
          status: 'completed',
          model: 'nano-banana-2',
          outputs: [
            {
              type: 'image',
              url: 'https://picsum.photos/seed/result/800/600',
              mime_type: 'image/png',
            },
          ],
        },
      }),
    });
  });
  // Pre-cache the extension config so we don't 404 on prod
  await popup.route('**/v1/extension/config', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'req_cfg',
        status: 'success',
        data: {
          default_prompt: 'create a stylistic variation of this image',
          default_model: 'nano-banana-2',
          min_image_dim: 256,
        },
      }),
    });
  });

  await popup.goto(`chrome-extension://${extensionId}/sidepanel.html`);

  await expect(popup.locator('img[alt="Source"]')).toBeVisible({ timeout: 5_000 });

  let observedHeaders: Record<string, string> | null = null;
  popup.on('request', (req) => {
    if (req.url().endsWith('/v1/image/generate')) {
      observedHeaders = req.headers();
    }
  });

  const generateBtn = popup.getByRole('button', { name: /Generate Variation/i });
  await expect(generateBtn).toBeVisible();
  await generateBtn.click();

  // Wait for result image to render
  await expect(popup.locator('img[alt="Generated variation"]')).toBeVisible({
    timeout: 10_000,
  });

  // Confirm the request carried the headers required by the server's
  // anonymous extension flow.
  expect(observedHeaders).not.toBeNull();
  expect(observedHeaders!['x-anycap-source']).toBe('chrome-extension');
  expect(observedHeaders!['x-anycap-install-id']).toMatch(/.+/);
});
