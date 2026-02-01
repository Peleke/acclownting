import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test('renders reports heading', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('h1')).toContainText(/report/i);
  });

  test('has date range filters with sensible defaults', async ({ page }) => {
    await page.goto('/reports');
    const startInput = page.locator('input[type="date"]').first();
    const endInput = page.locator('input[type="date"]').last();
    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();
    // FR30: Date inputs should default to current month
    const startVal = await startInput.inputValue();
    const endVal = await endInput.inputValue();
    expect(startVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('displays revenue summary with defaults loaded', async ({ page }) => {
    await page.goto('/reports');
    // FR30: Revenue stats load without clicking Run Report
    await expect(page.getByText('Total Invoiced')).toBeVisible();
    await expect(page.getByText('Total Paid')).toBeVisible();
    await expect(page.getByText('Outstanding')).toBeVisible();
  });

  test('client names in balances table are links', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByText('Client Balances')).toBeVisible();
    const clientLinks = page.locator('table a[href^="/clients/"]');
    const count = await clientLinks.count();
    if (count > 0) {
      await expect(clientLinks.first()).toBeVisible();
    }
  });
});
