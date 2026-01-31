import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test('renders reports heading', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('h1')).toContainText(/report/i);
  });

  test('has date range filters', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
  });

  test('displays revenue summary section', async ({ page }) => {
    await page.goto('/reports');
    // Should have revenue-related labels even with zero data
    await expect(page.getByText(/invoiced|earned|revenue/i).first()).toBeVisible();
  });
});
