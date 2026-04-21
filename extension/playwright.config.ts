import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { headless: false, viewport: { width: 1280, height: 800 } },
  webServer: { command: 'pnpm dev', port: 3001, reuseExistingServer: true, timeout: 120_000 },
});
