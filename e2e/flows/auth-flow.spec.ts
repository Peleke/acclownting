import { test, expect } from '@playwright/test';
import { TEST_USER, loginViaUI, loginViaSupabase, signOut } from '../helpers/auth';

/**
 * Auth flow tests require a real Supabase backend (no BYPASS_AUTH).
 * They should be run with `playwright.e2e.config.ts` which does NOT set
 * BYPASS_AUTH=true.
 *
 * These tests require the following environment variables:
 *   - E2E_USER_EMAIL: A valid test user email
 *   - E2E_USER_PASSWORD: The password for the test user
 *   - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon key
 *
 * If these are not set, the tests will be skipped.
 */
const hasAuthConfig =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !!process.env.E2E_USER_EMAIL &&
  !!process.env.E2E_USER_PASSWORD;

test.describe('Auth Flow (real Supabase)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    test.skip(!hasAuthConfig, 'Auth environment variables not configured');
    // Clear cookies to ensure we start logged out
    await page.context().clearCookies();
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveText('Acclownting');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign In');
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await loginViaUI(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toHaveText('Dashboard');
    // Nav should show the user name
    await expect(page.locator('nav')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(TEST_USER.email);
    await page.locator('input[name="password"]').fill('wrongpassword123');
    await page.locator('button[type="submit"]').click();

    // Should show an error message (Supabase returns "Invalid login credentials")
    await expect(page.locator('.text-red-600')).toBeVisible({ timeout: 10000 });
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('sign out redirects to login', async ({ page }) => {
    // Log in first
    await loginViaUI(page);
    await expect(page).toHaveURL(/\/dashboard/);

    // Sign out
    await signOut(page);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toHaveText('Acclownting');
  });

  test('accessing protected route when logged out redirects to login', async ({ page }) => {
    // Ensure we are logged out (cookies cleared in beforeEach)
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('accessing /clients when logged out redirects to login', async ({ page }) => {
    await page.goto('/clients');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('accessing /invoices when logged out redirects to login', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('accessing /admin/users when logged out redirects to login', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('fast login via Supabase client works', async ({ page }) => {
    test.skip(
      !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Supabase URL/key not configured'
    );

    await loginViaSupabase(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });

  test('session persists across page navigation', async ({ page }) => {
    await loginViaUI(page);

    // Navigate to different protected pages
    await page.goto('/clients');
    await expect(page.locator('h1')).toHaveText('Clients');

    await page.goto('/invoices');
    await expect(page.locator('h1')).toHaveText('Invoices');

    await page.goto('/reports');
    await expect(page.locator('h1')).toContainText(/report/i);

    // Still logged in — nav should be visible
    await expect(page.locator('nav')).toBeVisible();
  });
});
