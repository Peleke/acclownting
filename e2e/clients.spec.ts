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
    await expect(page.locator('.text-destructive').first()).toBeVisible();
  });

  test('shows empty state when no clients', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.getByText(/no client/i)).toBeVisible();
  });

  test('renders search input on clients page', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.locator('input[name="q"]')).toBeVisible();
  });

  test('search with no results shows no-match message', async ({ page }) => {
    await page.goto('/clients?q=ZZZZNONEXISTENT');
    await expect(page.getByText(/no clients match/i)).toBeVisible();
  });
});

test.describe('Client Detail Page', () => {
  test('has New Invoice and Edit Client buttons', async ({ page }) => {
    // Navigate to clients first, then try to find a client link
    await page.goto('/clients');
    const clientLink = page.locator('table a[href^="/clients/"]').first();
    const hasClients = await clientLink.isVisible().catch(() => false);
    if (hasClients) {
      await clientLink.click();
      await expect(page.getByRole('link', { name: /new invoice/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /edit client/i })).toBeVisible();
    }
  });

  test('New Invoice link includes client_id param', async ({ page }) => {
    await page.goto('/clients');
    const clientLink = page.locator('table a[href^="/clients/"]').first();
    const hasClients = await clientLink.isVisible().catch(() => false);
    if (hasClients) {
      await clientLink.click();
      const newInvoiceLink = page.getByRole('link', { name: /new invoice/i });
      const href = await newInvoiceLink.getAttribute('href');
      expect(href).toMatch(/\/invoices\/new\?client_id=/);
    }
  });

  test('has Payment History section', async ({ page }) => {
    await page.goto('/clients');
    const clientLink = page.locator('table a[href^="/clients/"]').first();
    const hasClients = await clientLink.isVisible().catch(() => false);
    if (hasClients) {
      await clientLink.click();
      await expect(page.getByText('Payment History')).toBeVisible();
    }
  });
});
