import { test, expect } from '@playwright/test';

/**
 * Showcase recordings for the original requirements:
 *
 * "I just want a program that is simple.
 *  Can create different logins and track who does what.
 *  Can create invoice listed under a client number/name into printable pdf template.
 *  Can post payments to invoices.
 *  Can run report to show what each customer owes and has paid.
 *  Can run report to show total earned/owed during a time period selected"
 *
 * Each test records a video + takes named screenshots at key moments.
 * Run: npx playwright test --config playwright.showcase.config.ts
 */

test.describe('FR1: User Logins & Role Tracking', () => {
  test('login page and signup flow', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/01-login-page.png', fullPage: true });

    // Show the signup page
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/02-signup-page.png', fullPage: true });
  });

  test('admin user management', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/03-admin-users.png', fullPage: true });

    // Open invite modal
    const inviteBtn = page.getByRole('button', { name: /invite/i });
    if (await inviteBtn.isVisible()) {
      await inviteBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'showcase-artifacts/screenshots/04-invite-user-modal.png', fullPage: true });
    }
  });
});

test.describe('FR2: Client Management & Invoice Creation', () => {
  test('create client and view client list', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/05-clients-list.png', fullPage: true });

    // Open new client modal
    await page.getByRole('button', { name: /new client/i }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'showcase-artifacts/screenshots/06-new-client-modal.png', fullPage: true });

    // Fill in client form
    await page.locator('input[name="name"]').fill('Blackbeard Enterprises');
    await page.locator('input[name="email"]').fill('captain@blackbeard.io');
    await page.locator('input[name="phone"]').fill('555-ARRR');
    await page.locator('input[name="address"]').fill('1 Skull Island, Caribbean');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/07-client-form-filled.png', fullPage: true });
  });

  test('create invoice with line items', async ({ page }) => {
    await page.goto('/invoices/new');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/08-new-invoice-empty.png', fullPage: true });

    // Fill in line items
    const descInputs = page.locator('input[placeholder="Item description"]');
    const spinbuttons = page.getByRole('spinbutton');

    await descInputs.first().fill('Clown Rental (Premium)');
    await spinbuttons.nth(0).fill('3');
    await spinbuttons.nth(1).fill('250');

    // Add second line item
    await page.getByRole('button', { name: /add line item/i }).click();
    await page.waitForTimeout(300);

    await descInputs.nth(1).fill('Balloon Animals (Bulk)');
    await spinbuttons.nth(3).fill('100');
    await spinbuttons.nth(4).fill('5');

    // Set tax
    const taxInput = page.locator('input[type="number"][min="0"][max="100"]');
    await taxInput.fill('8.5');

    await page.screenshot({ path: 'showcase-artifacts/screenshots/09-invoice-with-line-items.png', fullPage: true });

    // Show notes area
    await page.locator('textarea[name="notes"]').fill('Payment due upon receipt of clown services. No refunds on balloon animals.');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/10-invoice-complete.png', fullPage: true });
  });

  test('invoice list with status filters', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/11-invoices-list.png', fullPage: true });
  });
});

test.describe('FR3: Invoice Detail & PDF', () => {
  test('invoice detail page with actions', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');

    // Try to click into an invoice
    const invoiceLink = page.locator('table a[href^="/invoices/"]').first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'showcase-artifacts/screenshots/12-invoice-detail.png', fullPage: true });

      // Show the status override dropdown
      const statusSelect = page.locator('select[aria-label="Change status"]');
      if (await statusSelect.isVisible()) {
        await page.screenshot({ path: 'showcase-artifacts/screenshots/13-status-override.png', fullPage: true });
      }

      // Show edit invoice page
      const editLink = page.getByRole('link', { name: /edit invoice/i });
      if (await editLink.isVisible()) {
        await editLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'showcase-artifacts/screenshots/14-edit-invoice.png', fullPage: true });
      }
    }
  });
});

test.describe('FR4: Post Payments to Invoices', () => {
  test('payment form on invoice detail', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');

    const invoiceLink = page.locator('table a[href^="/invoices/"]').first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();
      await page.waitForLoadState('networkidle');

      // Look for payment form
      const paymentForm = page.locator('text=Record Payment');
      if (await paymentForm.isVisible()) {
        await page.screenshot({ path: 'showcase-artifacts/screenshots/15-payment-form.png', fullPage: true });
      }

      // Show payments table
      const paymentsSection = page.locator('text=Payments');
      if (await paymentsSection.isVisible()) {
        await page.screenshot({ path: 'showcase-artifacts/screenshots/16-payments-table.png', fullPage: true });
      }
    }
  });
});

test.describe('FR5: Report — What Each Customer Owes & Has Paid', () => {
  test('reports page with client balances', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/17-reports-page.png', fullPage: true });

    // Scroll to client balances if needed
    const balancesSection = page.locator('text=Client Balances');
    if (await balancesSection.isVisible()) {
      await balancesSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'showcase-artifacts/screenshots/18-client-balances.png', fullPage: true });
    }
  });

  test('client detail with payment history', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const clientLink = page.locator('table a[href^="/clients/"]').first();
    if (await clientLink.isVisible()) {
      await clientLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'showcase-artifacts/screenshots/19-client-detail.png', fullPage: true });

      const paymentHistory = page.locator('text=Payment History');
      if (await paymentHistory.isVisible()) {
        await paymentHistory.scrollIntoViewIfNeeded();
        await page.screenshot({ path: 'showcase-artifacts/screenshots/20-client-payment-history.png', fullPage: true });
      }
    }
  });
});

test.describe('FR6: Report — Total Earned/Owed by Time Period', () => {
  test('revenue report with date range filters', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');

    // Show date filters with defaults
    const startDate = page.locator('input[name="start_date"]');
    const endDate = page.locator('input[name="end_date"]');
    if (await startDate.isVisible()) {
      await page.screenshot({ path: 'showcase-artifacts/screenshots/21-report-date-filters.png', fullPage: true });

      // Change date range to show filtering
      await startDate.fill('2025-01-01');
      await endDate.fill('2025-12-31');
      await page.getByRole('button', { name: /run report|filter|apply/i }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'showcase-artifacts/screenshots/22-report-filtered.png', fullPage: true });
    }
  });

  test('dashboard overview with balances', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'showcase-artifacts/screenshots/23-dashboard.png', fullPage: true });
  });
});
