import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for recording showcase videos and screenshots.
 *
 * Uses BYPASS_AUTH so no real Supabase credentials needed.
 * Records video for every test (not just failures).
 * Outputs to showcase-artifacts/ for documentation.
 *
 * Run with: npx playwright test --config playwright.showcase.config.ts
 */
export default defineConfig({
  testDir: './e2e/showcase',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['html', { outputFolder: 'showcase-report' }]],
  outputDir: 'showcase-artifacts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    viewport: { width: 1280, height: 800 },
    launchOptions: {
      slowMo: 300,
    },
  },
  projects: [
    {
      name: 'showcase',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: 'BYPASS_AUTH=true npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
