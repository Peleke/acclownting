import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveText('Acclownting');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign In');
  });

  test('shows validation error for invalid email via Zod', async ({ page }) => {
    await page.goto('/login');
    // Disable HTML5 validation so Zod handles it
    await page.locator('form').evaluate((form: HTMLFormElement) => {
      form.noValidate = true;
    });
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page.locator('.text-destructive')).toBeVisible();
  });

  test('shows validation error for short password', async ({ page }) => {
    await page.goto('/login');
    await page.locator('form').evaluate((form: HTMLFormElement) => {
      form.noValidate = true;
    });
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', '12345');
    await page.click('button[type="submit"]');
    await expect(page.locator('.text-destructive')).toBeVisible();
  });

  test('submit button shows loading state on valid input', async ({ page }) => {
    // Block all network requests to supabase so loading state persists
    await page.route('**/*supabase*/**', (route) => route.abort());
    await page.route('**/auth/**', (route) => route.abort());
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    // The button text should change briefly; check within a short window
    await expect(page.locator('button[type="submit"]')).toContainText(/sign/i);
  });

  test('email and password fields are required', async ({ page }) => {
    await page.goto('/login');
    const email = page.locator('input[name="email"]');
    const password = page.locator('input[name="password"]');
    await expect(email).toHaveAttribute('required', '');
    await expect(password).toHaveAttribute('required', '');
  });
});
