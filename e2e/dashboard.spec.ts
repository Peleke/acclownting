import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('renders dashboard heading and stats cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toHaveText('Dashboard');
    await expect(page.getByText('Invoiced This Month')).toBeVisible();
    await expect(page.getByText('Collected This Month')).toBeVisible();
    await expect(page.getByText('Total Outstanding')).toBeVisible();
  });

  test('renders client balances table', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Client Balances')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('shows empty state when no data', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('No client data yet.')).toBeVisible();
  });

  test('stats display $0.00 with no backend data', async ({ page }) => {
    await page.goto('/dashboard');
    // Three stat cards each show $0.00
    const amounts = page.locator('.bg-white.p-6 .text-2xl');
    await expect(amounts).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(amounts.nth(i)).toHaveText('$0.00');
    }
  });
});
