import { test, expect } from '@playwright/test';

test.describe('Theme Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('toggles between light and dark', async ({ page }) => {
    const html = page.locator('html');

    // Default: no data-theme (light / wine & gold)
    await expect(html).not.toHaveAttribute('data-theme');

    const toggle = page.getByRole('button', { name: /theme/i });
    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await toggle.click();
    await expect(html).not.toHaveAttribute('data-theme');
  });

  test('persists theme after reload', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /theme/i });
    await toggle.click(); // dark

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('CSS variables change with theme', async ({ page }) => {
    const getBg = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
      );

    const lightBg = await getBg();

    const toggle = page.getByRole('button', { name: /theme/i });
    await toggle.click(); // dark
    const darkBg = await getBg();
    expect(darkBg).not.toBe(lightBg);
  });
});
