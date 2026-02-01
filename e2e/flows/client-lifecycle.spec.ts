import { test, expect } from '@playwright/test';
import {
  createTestAdminClient,
  cleanupTestClients,
} from '../helpers/supabase';

const TEST_PREFIX = 'E2E_CLIENT_LIFECYCLE_';

test.describe('Client Lifecycle', () => {
  test.describe.configure({ mode: 'serial' });

  // This suite runs against BYPASS_AUTH=true (default playwright config).
  // It exercises the full client CRUD lifecycle through the UI.

  let clientName: string;

  test.beforeAll(async () => {
    clientName = `${TEST_PREFIX}${Date.now()}`;
    // Attempt cleanup of any leftover test data from previous runs
    try {
      const admin = createTestAdminClient();
      await cleanupTestClients(admin, TEST_PREFIX);
    } catch {
      // Admin client may not be configured; that's fine for BYPASS_AUTH mode
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

  test('create a new client via modal form', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.locator('h1')).toHaveText('Clients');

    // Open the new client modal
    await page.getByRole('button', { name: /new client/i }).click();

    // Fill in the form
    await page.locator('input[name="name"]').fill(clientName);
    await page.locator('input[name="email"]').fill('lifecycle@test.com');
    await page.locator('input[name="phone"]').fill('555-0100');
    await page.locator('input[name="address"]').fill('123 Test Street');

    // Submit
    await page.locator('form button[type="submit"]').click();

    // Wait for the modal to close (form success callback closes it)
    await expect(page.locator('input[name="name"]')).not.toBeVisible({ timeout: 10000 });

    // The page should refresh and show the new client in the table
    await page.waitForTimeout(1000); // router.refresh() triggers server re-render
    await page.reload(); // Ensure we see the latest data
    await expect(page.getByText(clientName)).toBeVisible();
  });

  test('client appears in the client list table', async ({ page }) => {
    await page.goto('/clients');

    // Verify the client row is present with expected data
    const row = page.locator('tr', { has: page.getByText(clientName) });
    await expect(row).toBeVisible();
    await expect(row.getByText('lifecycle@test.com')).toBeVisible();
    await expect(row.getByText('555-0100')).toBeVisible();
  });

  test('navigate to client detail page', async ({ page }) => {
    await page.goto('/clients');

    // Click the client name link
    await page.getByRole('link', { name: clientName }).click();
    await expect(page).toHaveURL(/\/clients\/.+/);

    // Verify client detail page content
    await expect(page.locator('h1')).toHaveText(clientName);
    await expect(page.getByText('lifecycle@test.com')).toBeVisible();
    await expect(page.getByText('555-0100')).toBeVisible();
    await expect(page.getByText('123 Test Street')).toBeVisible();

    // Should have an Edit Client button
    await expect(page.getByRole('button', { name: /edit client/i })).toBeVisible();

    // Should show invoices section (empty for now)
    await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByText('No invoices for this client yet.')).toBeVisible();
  });

  test('edit client via detail page modal', async ({ page }) => {
    await page.goto('/clients');
    await page.getByRole('link', { name: clientName }).click();
    await expect(page.locator('h1')).toHaveText(clientName);

    // Open edit modal
    await page.getByRole('button', { name: /edit client/i }).click();

    // The form should be pre-populated with existing values
    await expect(page.locator('input[name="name"]')).toHaveValue(clientName);
    await expect(page.locator('input[name="email"]')).toHaveValue('lifecycle@test.com');
    await expect(page.locator('input[name="phone"]')).toHaveValue('555-0100');
    await expect(page.locator('input[name="address"]')).toHaveValue('123 Test Street');

    // Update the phone and address
    await page.locator('input[name="phone"]').clear();
    await page.locator('input[name="phone"]').fill('555-0200');
    await page.locator('input[name="address"]').clear();
    await page.locator('input[name="address"]').fill('456 Updated Avenue');

    // Submit
    await page.locator('form button[type="submit"]').click();

    // Wait for modal to close
    await expect(page.locator('input[name="name"]')).not.toBeVisible({ timeout: 10000 });

    // Reload and verify changes
    await page.reload();
    await expect(page.getByText('555-0200')).toBeVisible();
    await expect(page.getByText('456 Updated Avenue')).toBeVisible();
  });

  test('verify edited client data in client list', async ({ page }) => {
    await page.goto('/clients');

    const row = page.locator('tr', { has: page.getByText(clientName) });
    await expect(row).toBeVisible();
    await expect(row.getByText('555-0200')).toBeVisible();
  });
});
