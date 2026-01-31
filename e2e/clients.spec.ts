import { test, expect } from '@playwright/test';

test.describe('Clients Page', () => {
  test('renders clients heading and new client button', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.locator('h1')).toHaveText('Clients');
    await expect(page.getByRole('button', { name: /new client/i })).toBeVisible();
  });

  test('opens new client form modal', async ({ page }) => {
    await page.goto('/clients');
    await page.getByRole('button', { name: /new client/i }).click();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="address"]')).toBeVisible();
  });

  test('client form shows validation error for empty name', async ({ page }) => {
    await page.goto('/clients');
    await page.getByRole('button', { name: /new client/i }).click();
    // Submit with empty name — the input has required attribute, bypass it
    await page.locator('input[name="name"]').evaluate((el: HTMLInputElement) => {
      el.removeAttribute('required');
    });
    await page.locator('input[name="name"]').fill('');
    const submitBtn = page.locator('form button[type="submit"]');
    await submitBtn.click();
    // Zod error should appear
    await expect(page.locator('.text-red-600').first()).toBeVisible();
  });

  test('shows empty state when no clients', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.getByText(/no client/i)).toBeVisible();
  });
});
