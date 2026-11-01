import { defineConfig } from '@playwright/test';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= 'D:/DevTools/playwright';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  use: { baseURL: 'http://localhost:5199', viewport: { width: 1280, height: 720 } },
  webServer: {
    command: 'npx vite --port 5199 --strictPort',
    url: 'http://localhost:5199',
    env: { VITE_E2E: '1' },
    reuseExistingServer: false,
  },
});
