import { chromium, type FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const AUTH_FILE = path.resolve(__dirname, '..', 'test-results', '.auth', 'user.json');

async function globalSetup(config: FullConfig) {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    console.log('E2E_USER_EMAIL/PASSWORD not set — skipping auth setup');
    return;
  }

  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // Save auth state
  const { mkdirSync } = await import('fs');
  mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });

  await browser.close();
}

export default globalSetup;
export { AUTH_FILE };
