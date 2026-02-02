import { test, expect } from '@playwright/test';

test.describe('Theme Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('cycles through three themes', async ({ page }) => {
    const html = page.locator('html');

    // Default: no data-theme (wine-gold)
    await expect(html).not.toHaveAttribute('data-theme');

    // Click theme toggle
    const toggle = page.getByRole('button', { name: /theme/i });
    await toggle.click();

    // Now classic
    await expect(html).toHaveAttribute('data-theme', 'classic');

    await toggle.click();
    // Now dark
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await toggle.click();
    // Back to wine-gold (no attribute)
    await expect(html).not.toHaveAttribute('data-theme');
  });

  test('persists theme after reload', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /theme/i });
    await toggle.click(); // classic

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'classic');
  });

  test('CSS variables change with theme', async ({ page }) => {
    const getBg = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
      );

    const defaultBg = await getBg();

    const toggle = page.getByRole('button', { name: /theme/i });
    await toggle.click(); // classic
    const classicBg = await getBg();
    expect(classicBg).not.toBe(defaultBg);

    await toggle.click(); // dark
    const darkBg = await getBg();
    expect(darkBg).not.toBe(defaultBg);
    expect(darkBg).not.toBe(classicBg);
  });
});
