import { test, expect } from './fixtures';

test.describe('popup', () => {
  test('renders default state with instruction text', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.getByText('Right-click any image')).toBeVisible();
    await expect(popup.getByRole('heading', { name: 'AnyCap' })).toBeVisible();
  });

  test('shows trial count for anonymous users', async ({ context, extensionId }) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.locator('text=free tries remaining')).toBeVisible();
  });
});
