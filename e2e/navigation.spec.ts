import { test, expect } from '@playwright/test';

test.describe('Navigation (auth bypassed)', () => {
  test('dashboard page loads with nav', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('nav')).toBeVisible();
    // Check nav links by their text content
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clients' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible();
  });

  test('nav shows admin link for admin user', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('displays user name in nav', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('E2E Test User')).toBeVisible();
  });

  test('clicking nav links navigates correctly', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: 'Clients' }).click();
    await expect(page).toHaveURL(/\/clients/);

    await page.getByRole('link', { name: 'Invoices' }).click();
    await expect(page).toHaveURL(/\/invoices/);

    await page.getByRole('link', { name: 'Reports' }).click();
    await expect(page).toHaveURL(/\/reports/);

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveText('Acclownting');
  });
});
