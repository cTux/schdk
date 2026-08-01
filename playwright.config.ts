import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/browser',
  outputDir: 'output/playwright/test-results',
  use: { baseURL: 'http://127.0.0.1:6006' },
  webServer: {
    command: 'pnpm --filter @schdk/ui storybook --ci',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
