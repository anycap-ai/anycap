import { defineConfig } from '@playwright/test';
import path from 'path';

const extensionPath = path.resolve(__dirname, '.output/chrome-mv3-dev');

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    headless: false,
    viewport: { width: 1280, height: 800 },
    launchOptions: {
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    },
  },
});
