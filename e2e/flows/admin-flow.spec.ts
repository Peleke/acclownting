import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('admin nav link is visible for admin users', async ({ page }) => {
    // With BYPASS_AUTH=true, the mock profile has role='admin'
    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('admin page renders user management heading', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('h1')).toHaveText('User Management');
  });

  test('admin page shows the users table', async ({ page }) => {
    await page.goto('/admin/users');

    // Table headers
    await expect(page.getByText('Name', { exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
    await expect(page.getByText('Created', { exact: true })).toBeVisible();
  });

  test('invite user button opens modal', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByRole('button', { name: /invite user/i }).click();

    // Modal should show the invite form
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /send invite/i })).toBeVisible();
  });

  test('invite form validates required fields', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByRole('button', { name: /invite user/i }).click();

    // Disable HTML5 validation to test Zod validation
    await page.locator('form').evaluate((form: HTMLFormElement) => {
      form.noValidate = true;
    });

    // Submit empty form
    await page.locator('input[name="full_name"]').fill('');
    await page.locator('input[name="email"]').fill('');
    await page.getByRole('button', { name: /send invite/i }).click();

    // Should show validation error
    await expect(page.locator('.text-red-700').first()).toBeVisible();
  });

  test('invite form submits to API endpoint', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByRole('button', { name: /invite user/i }).click();

    // Fill in valid data
    await page.locator('input[name="full_name"]').fill('Test Invited User');
    await page.locator('input[name="email"]').fill(`invite-${Date.now()}@test.com`);
    await page.locator('select[name="role"]').selectOption('staff');

    // Intercept the API call to verify it's made correctly
    const responsePromise = page.waitForResponse('**/api/admin/invite');

    await page.getByRole('button', { name: /send invite/i }).click();

    // Verify the API call was made
    const response = await responsePromise;
    // The response might be an error (no real Supabase service role key in BYPASS_AUTH mode)
    // but we verify the endpoint was hit
    expect(response.url()).toContain('/api/admin/invite');
    expect(response.request().method()).toBe('POST');

    // Verify the request body was correct
    const requestBody = response.request().postDataJSON();
    expect(requestBody.full_name).toBe('Test Invited User');
    expect(requestBody.role).toBe('staff');
    expect(requestBody.email).toContain('@test.com');
  });

  test('role select has correct options', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByRole('button', { name: /invite user/i }).click();

    const roleSelect = page.locator('select[name="role"]');
    const options = roleSelect.locator('option');

    // Should have Staff and Admin options (plus possibly a placeholder)
    await expect(options.filter({ hasText: 'Staff' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'Admin' })).toHaveCount(1);
  });
});

test.describe('Admin Route Protection', () => {
  // NOTE: These tests verify behavior under BYPASS_AUTH=true where the mock
  // user is always admin. For real staff-vs-admin route protection testing,
  // use the auth-flow tests with real Supabase credentials.

  test('admin page is accessible with admin role (BYPASS_AUTH)', async ({ page }) => {
    await page.goto('/admin/users');
    // Should NOT redirect — the mock user is an admin
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator('h1')).toHaveText('User Management');
  });
});
