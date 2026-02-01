import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('renders dashboard heading and stats cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toHaveText('Dashboard');
    await expect(page.getByText('Invoiced This Month')).toBeVisible();
    await expect(page.getByText('Collected This Month')).toBeVisible();
    await expect(page.getByText('Total Outstanding')).toBeVisible();
  });

  test('renders client balances section', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Client Balances')).toBeVisible();
  });

  test('stats cards display currency values', async ({ page }) => {
    await page.goto('/dashboard');
    // Three stat cards each show a currency value
    const amounts = page.locator('.text-2xl');
    await expect(amounts).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(amounts.nth(i)).toHaveText(/\$[\d,]+\.\d{2}/);
    }
  });
});
