import { test, expect } from '@playwright/test';
import {
  createTestAdminClient,
  cleanupTestClients,
} from '../helpers/supabase';

const TEST_PREFIX = 'E2E_INV_LIFECYCLE_';

test.describe('Invoice Lifecycle', () => {
  test.describe.configure({ mode: 'serial' });

  let clientName: string;
  let invoiceNumber: string;

  test.beforeAll(async () => {
    clientName = `${TEST_PREFIX}${Date.now()}`;
    try {
      const admin = createTestAdminClient();
      await cleanupTestClients(admin, TEST_PREFIX);
    } catch {
      // Admin client may not be configured
    }
  });

  test.afterAll(async () => {
    try {
      const admin = createTestAdminClient();
      await cleanupTestClients(admin, TEST_PREFIX);
    } catch {
      // Cleanup is best-effort
    }
  });

  test('create a client to use for the invoice', async ({ page }) => {
    await page.goto('/clients');
    await page.getByRole('button', { name: /new client/i }).click();
    await page.locator('input[name="name"]').fill(clientName);
    await page.locator('input[name="email"]').fill('invoice-test@test.com');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('input[name="name"]')).not.toBeVisible({ timeout: 10000 });
    await page.reload();
    await expect(page.getByText(clientName)).toBeVisible();
  });

  test('create an invoice with line items and verify calculations', async ({ page }) => {
    await page.goto('/invoices/new');
    await expect(page.locator('h1')).toHaveText('New Invoice');

    // Select the client we just created
    await page.locator('select[name="client_id"]').selectOption({ label: clientName });

    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    await page.locator('input[name="due_date"]').fill(dueDateStr);

    // Fill in the first line item
    // Line items are controlled inputs without name attributes.
    // First row has labels; inputs are in flex rows with the remove button.
    const lineItemRows = page.locator('form .flex.gap-2.items-end');

    // First line item (index 0): Description, Qty, Price
    const row0Inputs = lineItemRows.nth(0).locator('input');
    await row0Inputs.nth(0).fill('Web Design Services');
    await row0Inputs.nth(1).clear();
    await row0Inputs.nth(1).fill('2');
    await row0Inputs.nth(2).clear();
    await row0Inputs.nth(2).fill('500');

    // Verify line item total: 2 * 500 = $1,000.00
    await expect(lineItemRows.nth(0).getByText('$1,000.00')).toBeVisible();

    // Add a second line item
    await page.getByRole('button', { name: /add line item/i }).click();

    const row1Inputs = lineItemRows.nth(1).locator('input');
    await row1Inputs.nth(0).fill('Hosting Setup');
    await row1Inputs.nth(1).clear();
    await row1Inputs.nth(1).fill('1');
    await row1Inputs.nth(2).clear();
    await row1Inputs.nth(2).fill('250');

    // Verify second line item total: 1 * 250 = $250.00
    await expect(lineItemRows.nth(1).getByText('$250.00')).toBeVisible();

    // Set tax rate to 10%
    const taxInput = page.locator('.flex.items-center.gap-4 input[type="number"]');
    await taxInput.clear();
    await taxInput.fill('10');

    // Verify totals in the summary area
    // Subtotal: $1,250.00, Tax: $125.00, Total: $1,375.00
    await expect(page.getByText('Subtotal: $1,250.00')).toBeVisible();
    await expect(page.getByText('Tax: $125.00')).toBeVisible();
    await expect(page.getByText('Total: $1,375.00')).toBeVisible();

    // Add notes
    await page.locator('textarea[name="notes"]').fill('Thank you for your business!');

    // Submit the invoice
    await page.getByRole('button', { name: 'Create Invoice' }).click();

    // Should redirect to invoices list
    await page.waitForURL('**/invoices', { timeout: 15000 });
  });

  test('invoice appears in the invoices list', async ({ page }) => {
    await page.goto('/invoices');

    // Find a row with our client name
    const row = page.locator('tr', { has: page.getByText(clientName) });
    await expect(row).toBeVisible();

    // Verify it shows the total
    await expect(row.getByText('$1,375.00')).toBeVisible();

    // Verify status is "draft"
    await expect(row.getByText('draft')).toBeVisible();

    // Capture the invoice number from the link (e.g., "#1")
    const invoiceLink = row.locator('a.text-blue-600');
    const linkText = await invoiceLink.textContent();
    invoiceNumber = linkText?.replace('#', '') || '';
    expect(invoiceNumber).toBeTruthy();
  });

  test('view invoice detail page with correct data', async ({ page }) => {
    await page.goto('/invoices');

    // Click into the invoice
    const row = page.locator('tr', { has: page.getByText(clientName) });
    await row.locator('a.text-blue-600').click();

    await expect(page).toHaveURL(/\/invoices\/.+/);
    await expect(page.locator('h1')).toContainText(`Invoice #${invoiceNumber}`);

    // Verify client name is linked
    await expect(page.getByRole('link', { name: clientName })).toBeVisible();

    // Verify status badge
    await expect(page.getByText('draft')).toBeVisible();

    // Verify line items table
    await expect(page.getByText('Web Design Services')).toBeVisible();
    await expect(page.getByText('Hosting Setup')).toBeVisible();

    // Verify totals in the line items section
    await expect(page.getByText('Subtotal: $1,250.00')).toBeVisible();
    await expect(page.getByText('Total: $1,375.00')).toBeVisible();

    // Verify notes
    await expect(page.getByText('Thank you for your business!')).toBeVisible();

    // Verify balance due equals total (no payments yet)
    await expect(page.getByText('Balance Due: $1,375.00')).toBeVisible();

    // Verify no payments message
    await expect(page.getByText('No payments recorded.')).toBeVisible();

    // Record Payment form should be visible (balance > 0)
    await expect(page.getByText('Record Payment')).toBeVisible();

    // Download PDF button should be present
    await expect(page.getByRole('button', { name: /download pdf/i })).toBeVisible();
  });

  test('invoice can be filtered by status', async ({ page }) => {
    await page.goto('/invoices?status=draft');

    const row = page.locator('tr', { has: page.getByText(clientName) });
    await expect(row).toBeVisible();

    // Filter by a different status should not show this invoice
    await page.goto('/invoices?status=paid');
    await expect(page.getByText(clientName)).not.toBeVisible();
  });
});
