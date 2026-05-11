import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

test.skip(
  process.env.ANYCAP_E2E_MODE !== 'demo',
  'Set ANYCAP_E2E_MODE=demo after `pnpm demo` to run.',
);

async function openPanel(panel: Page, extensionId: string) {
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(panel.getByRole('heading', { name: 'AnyCap' })).toBeVisible();
}

test('side panel: all 6 tabs render and switch correctly', async ({ context, extensionId }) => {
  const panel = await context.newPage();
  await openPanel(panel, extensionId);

  for (const label of ['Vary', 'Image', 'Video', 'Music', 'Search', 'Crawl', 'Settings']) {
    await panel.getByRole('tab', { name: label, exact: true }).click();
  }
});

test('side panel: first-run onboarding can be dismissed and stays dismissed', async ({
  context,
  extensionId,
}) => {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  await sw.evaluate(
    () =>
      new Promise<void>((resolve) =>
        chrome.storage.local.set({ onboardingCompleted: false }, () => resolve()),
      ),
  );

  const panel = await context.newPage();
  await openPanel(panel, extensionId);

  await expect(panel.getByText('Right-click to start')).toBeVisible();
  await panel.getByRole('button', { name: 'Skip onboarding' }).click();
  await expect(panel.getByText('Right-click to start')).toBeHidden();

  await panel.reload();
  await expect(panel.getByText('Right-click to start')).toBeHidden();
});

test('side panel: image tab generates a result against the mock', async ({ context, extensionId }) => {
  const panel = await context.newPage();
  await openPanel(panel, extensionId);

  await panel.getByRole('tab', { name: 'Image', exact: true }).click();
  await panel.locator('textarea').fill('a watercolor cat reading a book');
  await panel.getByRole('button', { name: /Generate Image/i }).click();

  await expect(panel.locator('img[alt="Generated"]')).toBeVisible({ timeout: 10_000 });
});

test('side panel: search tab renders ≥4 result cards', async ({ context, extensionId }) => {
  const panel = await context.newPage();
  await openPanel(panel, extensionId);

  await panel.getByRole('tab', { name: 'Search', exact: true }).click();
  const queryInput = panel.getByPlaceholder('Search the web…');
  await queryInput.fill('agent capability runtime');
  await queryInput.press('Enter');

  // Mock returns 6 result cards; ensure ≥4 result <li>s render.
  await expect(panel.locator('ul li').nth(3)).toBeVisible({ timeout: 5_000 });
});

test('side panel: crawl tab returns markdown for the typed URL', async ({ context, extensionId }) => {
  const panel = await context.newPage();
  await openPanel(panel, extensionId);

  await panel.getByRole('tab', { name: 'Crawl', exact: true }).click();
  await panel.getByPlaceholder('https://example.com/article').fill('https://example.org/blog/post');
  await panel.getByRole('button', { name: /Crawl Page/i }).click();

  await expect(panel.getByRole('heading', { name: /example\.org — extracted content/i })).toBeVisible({
    timeout: 5_000,
  });
  await expect(panel.getByText(/View extracted markdown/i)).toBeVisible();
});

test('side panel: music tab returns a playable audio element', async ({ context, extensionId }) => {
  const panel = await context.newPage();
  await openPanel(panel, extensionId);

  await panel.getByRole('tab', { name: 'Music', exact: true }).click();
  await panel.locator('textarea').fill('uplifting jazz with piano and saxophone');
  await panel.getByRole('button', { name: /Generate Music/i }).click();

  await expect(panel.locator('audio')).toBeVisible({ timeout: 10_000 });
});

test('side panel: video tab returns a playable video element', async ({ context, extensionId }) => {
  const panel = await context.newPage();
  await openPanel(panel, extensionId);

  await panel.getByRole('tab', { name: 'Video', exact: true }).click();
  await panel.locator('textarea').fill('a calm beach at sunset, slow drone shot');
  await panel.getByRole('button', { name: /Generate Video/i }).click();

  await expect(panel.locator('video[controls]')).toBeVisible({ timeout: 12_000 });
});

test('side panel: pending image-from-text request opens Image tab pre-filled', async ({
  context,
  extensionId,
}) => {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  await sw.evaluate(
    () =>
      new Promise<void>((resolve) =>
        chrome.storage.session.set(
          {
            pendingRequest: {
              kind: 'image-from-text',
              prompt: 'a paper crane on a wooden table',
              pageUrl: 'about:blank',
            },
          },
          () => resolve(),
        ),
      ),
  );

  const panel = await context.newPage();
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);

  await expect(panel.locator('textarea')).toHaveValue('a paper crane on a wooden table', { timeout: 5_000 });
});
