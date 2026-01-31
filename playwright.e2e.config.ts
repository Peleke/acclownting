import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for full E2E user flow tests.
 *
 * Unlike the default playwright.config.ts, this does NOT use BYPASS_AUTH.
 * The web server starts normally, requiring real Supabase auth.
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY (for test data setup/teardown)
 *   E2E_USER_EMAIL
 *   E2E_USER_PASSWORD
 *
 * Run with: npm run test:e2e:flows
 */
export default defineConfig({
  testDir: './e2e/flows',
  fullyParallel: false, // Flow tests are serial by nature
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Serial execution for dependent flow tests
  reporter: [['html', { outputFolder: 'playwright-report-e2e' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
