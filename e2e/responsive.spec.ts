import { test, expect } from '@playwright/test';

test.describe('Responsive: Mobile Navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

  test('hamburger menu is visible on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByLabel('Toggle menu')).toBeVisible();
  });

  test('desktop nav links are hidden on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    // The nav links container is hidden md:flex — links should not be visible
    const desktopLinks = page.locator('nav .hidden.md\\:flex').first();
    await expect(desktopLinks).not.toBeVisible();
  });

  test('hamburger menu opens and shows nav links', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByLabel('Toggle menu').click();

    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clients' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible();
  });

  test('mobile menu closes after clicking a link', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByLabel('Toggle menu').click();
    await page.getByRole('link', { name: 'Clients' }).click();
    await expect(page).toHaveURL(/\/clients/);
    // Menu should close
    await expect(page.getByLabel('Toggle menu')).toHaveAttribute('aria-expanded', 'false');
  });

  test('sign out button is accessible in mobile menu', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByLabel('Toggle menu').click();
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });
});

test.describe('Responsive: Invoice Form Line Items', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('desktop grid header is hidden on mobile', async ({ page }) => {
    await page.goto('/invoices/new');
    const desktopHeader = page.locator('.hidden.md\\:grid').first();
    await expect(desktopHeader).not.toBeVisible();
  });

  test('mobile labels are visible on small screens', async ({ page }) => {
    await page.goto('/invoices/new');
    // Mobile-only labels should be visible
    await expect(page.getByText('Item 1')).toBeVisible();
    await expect(page.locator('label').getByText('Qty')).toBeVisible();
    await expect(page.locator('label').getByText('Price')).toBeVisible();
  });

  test('line item inputs are usable on mobile', async ({ page }) => {
    await page.goto('/invoices/new');
    const descInput = page.locator('input[placeholder="Item description"]').first();
    await expect(descInput).toBeVisible();
    await descInput.fill('Test item');
    await expect(descInput).toHaveValue('Test item');
  });
});

test.describe('Responsive: Action Buttons Wrap', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('client detail header stacks on mobile', async ({ page }) => {
    await page.goto('/clients');
    const clientLink = page.locator('table a[href^="/clients/"]').first();
    if (await clientLink.isVisible()) {
      await clientLink.click();
      await page.waitForLoadState('networkidle');
      // Buttons should still be visible and accessible
      await expect(page.getByRole('button', { name: /edit client/i })).toBeVisible();
    }
  });
});

test.describe('Responsive: Desktop Nav Unchanged', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('hamburger is hidden on desktop', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByLabel('Toggle menu')).not.toBeVisible();
  });

  test('desktop nav links are visible', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clients' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible();
  });
});
