import { test, expect } from '@playwright/test';
import {
  createTestAdminClient,
  cleanupTestClients,
} from '../helpers/supabase';

const TEST_PREFIX = 'E2E_PAYMENT_FLOW_';

test.describe('Payment Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let clientName: string;

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

  test('set up client and invoice for payment testing', async ({ page }) => {
    // Create client
    await page.goto('/clients');
    await page.getByRole('button', { name: /new client/i }).click();
    await page.locator('input[name="name"]').fill(clientName);
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('input[name="name"]')).not.toBeVisible({ timeout: 10000 });
    await page.reload();
    await expect(page.getByText(clientName)).toBeVisible();

    // Create invoice with total = $1,000.00
    await page.goto('/invoices/new');
    await page.locator('select[name="client_id"]').selectOption({ label: clientName });

    // Set due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    await page.locator('input[name="due_date"]').fill(dueDate.toISOString().split('T')[0]);

    const lineItemContainer = page.locator('.rounded-xl.border');
    const lineItemRow = lineItemContainer.locator('.grid.items-center').nth(0);
    await lineItemRow.locator('input[placeholder="Item description"]').fill('Consulting');
    await lineItemRow.locator('input[type="number"]').first().clear();
    await lineItemRow.locator('input[type="number"]').first().fill('4');
    await lineItemRow.locator('input[type="number"]').last().clear();
    await lineItemRow.locator('input[type="number"]').last().fill('250');

    // Verify total: 4 * 250 = $1,000.00 (no tax)
    await expect(page.getByText('$1,000.00').first()).toBeVisible();

    await page.getByRole('button', { name: 'Create Invoice' }).click();
    await page.waitForURL('**/invoices', { timeout: 15000 });
  });

  test('post a partial payment and verify status changes to partial', async ({ page }) => {
    await page.goto('/invoices');

    // Navigate to the invoice
    const row = page.locator('tr', { has: page.getByText(clientName) });
    await row.locator('a').first().click();
    await expect(page).toHaveURL(/\/invoices\/.+/);

    // Verify initial state
    await expect(page.getByText('Balance Due: $1,000.00')).toBeVisible();
    await expect(page.getByText('No payments recorded.')).toBeVisible();

    // Fill in partial payment form
    await page.locator('input[name="amount"]').fill('400');
    await page.locator('select[name="method"]').selectOption('card');
    await page.locator('input[name="reference"]').fill('CARD-001');

    // Submit payment
    await page.getByRole('button', { name: 'Record Payment' }).click();

    // Wait for page to refresh and payment to appear
    await page.waitForTimeout(2000);
    await page.reload();

    // Verify the payment appears in the payments table
    await expect(page.getByText('$400.00')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('CARD-001')).toBeVisible();

    // Balance should now be $600.00
    await expect(page.getByText('Balance Due: $600.00')).toBeVisible();

    // Status should have changed to "partial" (if the DB trigger is working)
    // The status badge is in the header area
    await expect(page.locator('span.capitalize', { hasText: 'partial' })).toBeVisible();

    // Payment form should still be visible (balance > 0)
    await expect(page.getByRole('heading', { name: 'Record Payment' })).toBeVisible();
  });

  test('post remaining payment and verify status changes to paid', async ({ page }) => {
    await page.goto('/invoices');

    const row = page.locator('tr', { has: page.getByText(clientName) });
    await row.locator('a').first().click();
    await expect(page).toHaveURL(/\/invoices\/.+/);

    // Verify current balance
    await expect(page.getByText('Balance Due: $600.00')).toBeVisible();

    // Post the remaining $600
    await page.locator('input[name="amount"]').fill('600');
    await page.locator('select[name="method"]').selectOption('transfer');
    await page.locator('input[name="reference"]').fill('WIRE-002');

    await page.getByRole('button', { name: 'Record Payment' }).click();

    await page.waitForTimeout(2000);
    await page.reload();

    // Verify both payments appear
    await expect(page.getByText('CARD-001')).toBeVisible();
    await expect(page.getByText('WIRE-002')).toBeVisible();

    // Balance should be $0.00
    await expect(page.getByText('Balance Due: $0.00')).toBeVisible();

    // Status should now be "paid"
    await expect(page.locator('span.capitalize', { hasText: 'paid' })).toBeVisible();

    // Payment form should NOT be visible (balance === 0)
    await expect(page.locator('input[name="amount"]')).not.toBeVisible();
  });

  test('fully paid invoice shows correct status in list view', async ({ page }) => {
    await page.goto('/invoices');

    const row = page.locator('tr', { has: page.getByText(clientName) });
    await expect(row.getByText('paid')).toBeVisible();
    await expect(row.getByText('$1,000.00')).toBeVisible();

    // Should appear when filtering by "paid"
    await page.goto('/invoices?status=paid');
    await expect(page.getByText(clientName)).toBeVisible();

    // Should NOT appear when filtering by "draft"
    await page.goto('/invoices?status=draft');
    await expect(page.getByText(clientName)).not.toBeVisible();
  });
});
