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
 * Runs in both desktop (1280x800) and mobile (390x844 iPhone 14) projects.
 * Run: npx playwright test --config playwright.showcase.config.ts
 */

function screenshotPath(projectName: string, name: string) {
  const suffix = projectName.includes('mobile') ? 'mobile' : 'desktop';
  return `showcase-artifacts/screenshots/${name}-${suffix}.png`;
}

test.describe('FR1: User Logins & Role Tracking', () => {
  test('login page and signup flow', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: p('01-login-page'), fullPage: true });

    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: p('02-signup-page'), fullPage: true });
  });

  test('admin user management', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: p('03-admin-users'), fullPage: true });

    const inviteBtn = page.getByRole('button', { name: /invite/i });
    if (await inviteBtn.isVisible()) {
      await inviteBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: p('04-invite-user-modal'), fullPage: true });
    }
  });
});

test.describe('FR2: Client Management & Invoice Creation', () => {
  test('create client and view client list', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: p('05-clients-list'), fullPage: true });

    await page.getByRole('button', { name: /new client/i }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: p('06-new-client-modal'), fullPage: true });

    await page.locator('input[name="name"]').fill('Blackbeard Enterprises');
    await page.locator('input[name="email"]').fill('captain@blackbeard.io');
    await page.locator('input[name="phone"]').fill('555-ARRR');
    await page.locator('input[name="address"]').fill('1 Skull Island, Caribbean');
    await page.screenshot({ path: p('07-client-form-filled'), fullPage: true });
  });

  test('create invoice with line items', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/invoices/new');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: p('08-new-invoice-empty'), fullPage: true });

    const descInputs = page.locator('input[placeholder="Item description"]');
    const spinbuttons = page.getByRole('spinbutton');

    await descInputs.first().fill('Clown Rental (Premium)');
    await spinbuttons.nth(0).fill('3');
    await spinbuttons.nth(1).fill('250');

    await page.getByRole('button', { name: /add line item/i }).click();
    await page.waitForTimeout(300);

    await descInputs.nth(1).fill('Balloon Animals (Bulk)');
    await spinbuttons.nth(3).fill('100');
    await spinbuttons.nth(4).fill('5');

    const taxInput = page.locator('input[type="number"][min="0"][max="100"]');
    await taxInput.fill('8.5');

    await page.screenshot({ path: p('09-invoice-with-line-items'), fullPage: true });

    await page.locator('textarea[name="notes"]').fill('Payment due upon receipt of clown services. No refunds on balloon animals.');
    await page.screenshot({ path: p('10-invoice-complete'), fullPage: true });
  });

  test('invoice list with status filters', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: p('11-invoices-list'), fullPage: true });
  });
});

test.describe('FR3: Invoice Detail & PDF', () => {
  test('invoice detail page with actions', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');

    const invoiceLink = page.locator('table a[href^="/invoices/"]').first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: p('12-invoice-detail'), fullPage: true });

      const statusSelect = page.locator('select[aria-label="Change status"]');
      if (await statusSelect.isVisible()) {
        await page.screenshot({ path: p('13-status-override'), fullPage: true });
      }

      const editLink = page.getByRole('link', { name: /edit invoice/i });
      if (await editLink.isVisible()) {
        await editLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: p('14-edit-invoice'), fullPage: true });
      }
    }
  });
});

test.describe('FR4: Post Payments to Invoices', () => {
  test('payment form on invoice detail', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');

    const invoiceLink = page.locator('table a[href^="/invoices/"]').first();
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click();
      await page.waitForLoadState('networkidle');

      const paymentForm = page.locator('text=Record Payment');
      if (await paymentForm.isVisible()) {
        await page.screenshot({ path: p('15-payment-form'), fullPage: true });
      }

      const paymentsSection = page.locator('text=Payments');
      if (await paymentsSection.isVisible()) {
        await page.screenshot({ path: p('16-payments-table'), fullPage: true });
      }
    }
  });
});

test.describe('FR5: Report — What Each Customer Owes & Has Paid', () => {
  test('reports page with client balances', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: p('17-reports-page'), fullPage: true });

    const balancesSection = page.locator('text=Client Balances');
    if (await balancesSection.isVisible()) {
      await balancesSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: p('18-client-balances'), fullPage: true });
    }
  });

  test('client detail with payment history', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const clientLink = page.locator('table a[href^="/clients/"]').first();
    if (await clientLink.isVisible()) {
      await clientLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: p('19-client-detail'), fullPage: true });

      const paymentHistory = page.locator('text=Payment History');
      if (await paymentHistory.isVisible()) {
        await paymentHistory.scrollIntoViewIfNeeded();
        await page.screenshot({ path: p('20-client-payment-history'), fullPage: true });
      }
    }
  });
});

test.describe('FR6: Report — Total Earned/Owed by Time Period', () => {
  test('revenue report with date range filters', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/reports');
    await page.waitForLoadState('networkidle');

    const startDate = page.locator('input[name="start_date"]');
    const endDate = page.locator('input[name="end_date"]');
    if (await startDate.isVisible()) {
      await page.screenshot({ path: p('21-report-date-filters'), fullPage: true });

      await startDate.fill('2025-01-01');
      await endDate.fill('2025-12-31');
      await page.getByRole('button', { name: /run report|filter|apply/i }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await page.screenshot({ path: p('22-report-filtered'), fullPage: true });
    }
  });

  test('dashboard overview with balances', async ({ page }, testInfo) => {
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: p('23-dashboard'), fullPage: true });
  });
});

test.describe('Responsive: Mobile Navigation', () => {
  test('hamburger menu interaction', async ({ page, browserName }, testInfo) => {
    // Only meaningful in mobile project
    if (!testInfo.project.name.includes('mobile')) {
      test.skip();
      return;
    }
    const p = (name: string) => screenshotPath(testInfo.project.name, name);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: p('24-mobile-nav-closed'), fullPage: true });

    await page.getByLabel('Toggle menu').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: p('25-mobile-nav-open'), fullPage: true });
  });
});
