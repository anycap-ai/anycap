import { test, expect } from '@playwright/test';

const EXTENSION_ID = process.env.EXTENSION_ID || 'anycap-extension';

test.describe('popup', () => {
  test('renders default state with instruction text', async ({ page }) => {
    await page.goto(`chrome-extension://${EXTENSION_ID}/popup.html`);
    await expect(page.locator('text=Right-click any image')).toBeVisible();
    await expect(page.locator('text=AnyCap')).toBeVisible();
  });

  test('shows trial count for anonymous users', async ({ page }) => {
    await page.goto(`chrome-extension://${EXTENSION_ID}/popup.html`);
    await expect(page.locator('text=free tries remaining')).toBeVisible();
  });
});
