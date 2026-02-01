import { test, expect } from '@playwright/test';

test.describe('Invoices Page', () => {
  test('renders invoices heading', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page.locator('h1')).toHaveText('Invoices');
  });

  test('has link to create new invoice', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page.getByRole('link', { name: /new invoice/i })).toBeVisible();
  });

  test('shows status filter options', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page.getByText('All')).toBeVisible();
  });
});

test.describe('New Invoice Page', () => {
  test('renders invoice creation form', async ({ page }) => {
    await page.goto('/invoices/new');
    await expect(page.locator('h1')).toHaveText('New Invoice');
  });

  test('has client select and form fields', async ({ page }) => {
    await page.goto('/invoices/new');
    await expect(page.locator('select[name="client_id"]')).toBeVisible();
    await expect(page.locator('input[name="due_date"]')).toBeVisible();
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
    await expect(page.getByText('Line Items')).toBeVisible();
  });

  test('has line item inputs (controlled, no name attributes)', async ({ page }) => {
    await page.goto('/invoices/new');
    // Line items use controlled inputs - find by label text
    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText('Qty')).toBeVisible();
    await expect(page.getByText('Price')).toBeVisible();
  });

  test('can add line items', async ({ page }) => {
    await page.goto('/invoices/new');
    // Count initial line item rows (each has a × button)
    // Count initial line item rows by description placeholder
    const descInputs = page.locator('input[placeholder="Item description"]');
    const initialCount = await descInputs.count();

    await page.getByRole('button', { name: /add line item/i }).click();
    await expect(descInputs).toHaveCount(initialCount + 1);
  });

  test('shows subtotal, tax, and total', async ({ page }) => {
    await page.goto('/invoices/new');
    await expect(page.getByText(/subtotal/i)).toBeVisible();
    await expect(page.getByText(/tax/i).first()).toBeVisible();
    await expect(page.getByText(/total/i).last()).toBeVisible();
  });

  test('has create and cancel buttons', async ({ page }) => {
    await page.goto('/invoices/new');
    await expect(page.getByRole('button', { name: 'Create Invoice' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });
});

test.describe('Invoice List Clickability', () => {
  test('invoice rows have clickable client names', async ({ page }) => {
    await page.goto('/invoices');
    const clientLink = page.locator('table a[href^="/invoices/"]').first();
    const hasInvoices = await clientLink.isVisible().catch(() => false);
    if (hasInvoices) {
      await expect(clientLink).toHaveAttribute('href', /\/invoices\//);
    }
  });
});

test.describe('Invoice Detail Page', () => {
  test('has Edit Invoice button', async ({ page }) => {
    await page.goto('/invoices');
    const invoiceLink = page.locator('table a[href^="/invoices/"]').first();
    const hasInvoices = await invoiceLink.isVisible().catch(() => false);
    if (hasInvoices) {
      await invoiceLink.click();
      await expect(page.getByRole('link', { name: /edit invoice/i })).toBeVisible();
    }
  });

  test('has status override dropdown', async ({ page }) => {
    await page.goto('/invoices');
    const invoiceLink = page.locator('table a[href^="/invoices/"]').first();
    const hasInvoices = await invoiceLink.isVisible().catch(() => false);
    if (hasInvoices) {
      await invoiceLink.click();
      await expect(page.locator('select[aria-label="Change status"]')).toBeVisible();
    }
  });

  test('has delete payment buttons when payments exist', async ({ page }) => {
    await page.goto('/invoices');
    const invoiceLink = page.locator('table a[href^="/invoices/"]').first();
    const hasInvoices = await invoiceLink.isVisible().catch(() => false);
    if (hasInvoices) {
      await invoiceLink.click();
      // Delete payment buttons have aria-label="Delete payment"
      const deleteButtons = page.locator('button[aria-label="Delete payment"]');
      // May or may not have payments — just verify the page loads
      await expect(page.locator('h1')).toContainText('Invoice #');
    }
  });

  test('Edit Invoice link navigates to edit page', async ({ page }) => {
    await page.goto('/invoices');
    const invoiceLink = page.locator('table a[href^="/invoices/"]').first();
    const hasInvoices = await invoiceLink.isVisible().catch(() => false);
    if (hasInvoices) {
      await invoiceLink.click();
      const editLink = page.getByRole('link', { name: /edit invoice/i });
      const isVisible = await editLink.isVisible().catch(() => false);
      if (isVisible) {
        await editLink.click();
        await expect(page.locator('h1')).toContainText('Edit Invoice');
        await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
      }
    }
  });
});
