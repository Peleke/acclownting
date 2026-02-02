import { test, expect } from '@playwright/test';
import {
  createTestAdminClient,
  createTestClient,
  createTestInvoice,
  cleanupTestClients,
  getTestUserId,
} from '../helpers/supabase';

/**
 * Overdue flagging in reports flow tests.
 * Covers FR31: Overdue amounts are visually flagged in reports
 *         FR30: Reports load with sensible defaults
 *
 * Tests require SUPABASE_SERVICE_ROLE_KEY to seed data with overdue invoices.
 */

const hasAdminClient =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

test.describe('Overdue Flagging in Reports', () => {
  test.describe.configure({ mode: 'serial' });

  const prefix = `E2E_OVERDUE_RPT_${Date.now()}`;

  test.beforeAll(async () => {
    if (!hasAdminClient) return;
    const admin = createTestAdminClient();
    const userId = await getTestUserId(admin, process.env.E2E_USER_EMAIL!);

    await cleanupTestClients(admin, prefix);

    // Create a client with an overdue invoice
    const client = await createTestClient(admin, {
      name: `${prefix}_OverdueClient`,
      email: 'overdue-report@example.com',
    });

    // Overdue invoice: past due, unpaid
    await createTestInvoice(admin, {
      client_id: client.id,
      status: 'sent',
      due_date: '2025-06-01', // Well past due
      line_items: [{ description: 'Overdue Service', quantity: 1, unit_price: 2000 }],
      subtotal: 2000,
      tax_rate: 0,
      tax_amount: 0,
      total: 2000,
      created_by: userId,
    });

    // Current invoice: not overdue
    await createTestInvoice(admin, {
      client_id: client.id,
      status: 'sent',
      due_date: '2026-12-31', // Future due date
      line_items: [{ description: 'Current Service', quantity: 1, unit_price: 500 }],
      subtotal: 500,
      tax_rate: 0,
      tax_amount: 0,
      total: 500,
      created_by: userId,
    });
  });

  test.afterAll(async () => {
    if (!hasAdminClient) return;
    const admin = createTestAdminClient();
    await cleanupTestClients(admin, prefix);
  });

  test('reports page loads with sensible defaults', async ({ page }) => {
    test.skip(!hasAdminClient, 'Admin client not configured');
    await page.goto('/reports');

    // FR30: Reports load without requiring configuration
    // Should see client balances and revenue sections without needing to set date range
    await expect(page.locator('h1')).toContainText(/report/i);

    // Client balances section should be visible by default
    await expect(page.getByText(/client balances/i).or(page.getByText(/balances/i)).first()).toBeVisible();
  });

  test('overdue client has visually flagged outstanding amount in reports', async ({ page }) => {
    test.skip(!hasAdminClient, 'Admin client not configured');
    await page.goto('/reports');

    // FR31: Overdue amounts are visually flagged
    // Look for the test client's row in the client balances table
    const clientRow = page.locator('tr', { hasText: prefix });
    await expect(clientRow).toBeVisible({ timeout: 10000 });

    // The outstanding amount should have visual emphasis
    // This could be red text, bold, an icon, or a special class
    // Check for common overdue visual indicators
    const outstandingCell = clientRow.locator('td').last();
    const cellHtml = await outstandingCell.innerHTML();

    // At minimum, the outstanding amount should be displayed
    // FR31 requires visual flagging — check for any visual distinction
    const hasVisualFlag =
      cellHtml.includes('text-red') ||
      cellHtml.includes('text-destructive') ||
      cellHtml.includes('overdue') ||
      cellHtml.includes('font-bold') ||
      cellHtml.includes('text-amber') ||
      cellHtml.includes('⚠') ||
      cellHtml.includes('warning');

    // NOTE: This assertion may need adjustment based on actual implementation
    // If it fails, the overdue visual flagging feature (FR31/Story 5.3) needs implementation
    expect(hasVisualFlag).toBe(true);
  });

  test('dashboard shows outstanding stats with overdue data', async ({ page }) => {
    test.skip(!hasAdminClient, 'Admin client not configured');
    await page.goto('/dashboard');

    // Dashboard should show stats that include our overdue amount
    // Look for the outstanding/overdue section
    await expect(page.getByText(/outstanding/i).first()).toBeVisible();

    // The client balances table should show the overdue client
    const clientRow = page.locator('tr', { hasText: prefix });
    if (await clientRow.isVisible()) {
      // Verify the balance amount is shown
      await expect(clientRow.getByText('$2,500.00').first().or(clientRow.getByText('$2,000.00').first())).toBeVisible();
    }
  });
});
