import { test, expect } from '@playwright/test';

/**
 * Signup page smoke tests (BYPASS_AUTH mode).
 * Covers FR33: Users can sign up for a new account (self-service registration).
 */
test.describe('Signup Page', () => {
  test('renders signup form with all required fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('h1')).toHaveText('Acclownting');
    await expect(page.locator('text=Create your account')).toBeVisible();
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign Up');
  });

  test('has link to login page', async ({ page }) => {
    await page.goto('/signup');
    const signInLink = page.locator('a[href="/login"]');
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveText('Sign in');
  });

  test('shows validation error for empty form submission', async ({ page }) => {
    await page.goto('/signup');

    // Remove required attributes to test Zod validation
    await page.locator('input[name="full_name"]').evaluate((el: HTMLInputElement) => {
      el.removeAttribute('required');
    });
    await page.locator('input[name="email"]').evaluate((el: HTMLInputElement) => {
      el.removeAttribute('required');
    });
    await page.locator('input[name="password"]').evaluate((el: HTMLInputElement) => {
      el.removeAttribute('required');
    });

    await page.locator('input[name="full_name"]').fill('');
    await page.locator('input[name="email"]').fill('');
    await page.locator('input[name="password"]').fill('');
    await page.locator('button[type="submit"]').click();

    // Should show a validation error from Zod schema
    await expect(page.locator('.text-destructive, .text-red-600, .text-red-700').first()).toBeVisible();
  });

  test('shows loading state on submit', async ({ page }) => {
    await page.goto('/signup');
    await page.locator('input[name="full_name"]').fill('Test User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Button should show loading text briefly
    await expect(page.locator('button[type="submit"]')).toHaveText('Creating account...');
  });
});
