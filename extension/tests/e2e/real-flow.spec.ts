import { test, expect } from './fixtures';
import type { BrowserContext, Page } from '@playwright/test';

test.skip(
  process.env.ANYCAP_E2E_MODE !== 'real',
  'Set ANYCAP_E2E_MODE=real after a production-mode build to run.',
);

test.describe.configure({ timeout: 180_000 });

async function resetAnonymousState(context: BrowserContext) {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  await sw.evaluate(
    () =>
      new Promise<void>((resolve) => {
        chrome.storage.local.remove(['authToken', 'extensionConfigCache', 'trialCount'], () => resolve());
      }),
  );
  return sw;
}

async function openPanel(panel: Page, extensionId: string) {
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(panel.getByRole('heading', { name: 'AnyCap' })).toBeVisible({ timeout: 10_000 });
}

test('real API smoke: anonymous image variation succeeds', async ({ context, extensionId }) => {
  const sw = await resetAnonymousState(context);

  await sw.evaluate(
    () =>
      new Promise<void>((resolve) => {
        chrome.storage.session.set(
          {
            pendingRequest: {
              kind: 'vary',
              image: {
                srcUrl: 'https://picsum.photos/seed/anycap-real-smoke/800/600',
                width: 800,
                height: 600,
              },
              pageUrl: 'https://example.com/anycap-real-smoke',
            },
          },
          () => resolve(),
        );
      }),
  );

  const panel = await context.newPage();
  let observedHeaders: Record<string, string> | null = null;

  panel.on('request', (req) => {
    if (req.url().endsWith('/v1/image/generate')) {
      observedHeaders = req.headers();
    }
  });

  await openPanel(panel, extensionId);
  await expect(panel.locator('img[alt="Source"]')).toBeVisible({ timeout: 10_000 });

  const responsePromise = panel.waitForResponse(
    (res) => res.url().endsWith('/v1/image/generate') && res.request().method() === 'POST',
    { timeout: 150_000 },
  );

  await panel.getByRole('button', { name: /Generate Variation/i }).click();
  const response = await responsePromise;
  const body = await response.text();

  if (!response.ok()) {
    throw new Error(`Real image variation failed with HTTP ${response.status()}: ${body}`);
  }

  await expect(panel.locator('img[alt="Generated variation"]')).toBeVisible({
    timeout: 150_000,
  });

  expect(observedHeaders).not.toBeNull();
  expect(observedHeaders!['x-anycap-source']).toBe('chrome-extension');
  expect(observedHeaders!['x-anycap-install-id']).toMatch(/.+/);
});

test('real API smoke: anonymous image-from-text succeeds', async ({ context, extensionId }) => {
  await resetAnonymousState(context);

  const panel = await context.newPage();
  let observedHeaders: Record<string, string> | null = null;

  panel.on('request', (req) => {
    if (req.url().endsWith('/v1/image/generate')) {
      observedHeaders = req.headers();
    }
  });

  await openPanel(panel, extensionId);
  await panel.getByRole('tab', { name: 'Image', exact: true }).click();
  await panel.locator('textarea').fill('a compact AnyCap chrome extension smoke test card');

  const responsePromise = panel.waitForResponse(
    (res) => res.url().endsWith('/v1/image/generate') && res.request().method() === 'POST',
    { timeout: 150_000 },
  );

  await panel.getByRole('button', { name: /Generate Image/i }).click();
  const response = await responsePromise;
  const body = await response.text();

  if (!response.ok()) {
    throw new Error(`Real image generation failed with HTTP ${response.status()}: ${body}`);
  }

  await expect(panel.locator('img[alt="Generated"]')).toBeVisible({ timeout: 150_000 });

  expect(observedHeaders).not.toBeNull();
  expect(observedHeaders!['x-anycap-source']).toBe('chrome-extension');
  expect(observedHeaders!['x-anycap-install-id']).toMatch(/.+/);
});

test('real API smoke: anonymous crawl succeeds', async ({ context, extensionId }) => {
  await resetAnonymousState(context);

  const panel = await context.newPage();
  let observedHeaders: Record<string, string> | null = null;

  panel.on('request', (req) => {
    if (req.url().endsWith('/v1/web/crawl')) {
      observedHeaders = req.headers();
    }
  });

  await openPanel(panel, extensionId);
  await panel.getByRole('tab', { name: 'Crawl', exact: true }).click();
  await panel.getByPlaceholder('https://example.com/article').fill('https://example.com/');

  const responsePromise = panel.waitForResponse(
    (res) => res.url().endsWith('/v1/web/crawl') && res.request().method() === 'POST',
    { timeout: 60_000 },
  );

  await panel.getByRole('button', { name: /Crawl Page/i }).click();
  const response = await responsePromise;
  const body = await response.text();

  if (!response.ok()) {
    throw new Error(`Real crawl failed with HTTP ${response.status()}: ${body}`);
  }

  await expect(panel.getByText(/View extracted markdown/i)).toBeVisible({ timeout: 60_000 });

  expect(observedHeaders).not.toBeNull();
  expect(observedHeaders!['x-anycap-source']).toBe('chrome-extension');
  expect(observedHeaders!['x-anycap-install-id']).toMatch(/.+/);
});
