import { test, expect } from '@playwright/test';

test.describe('Wine & Gold Palette', () => {
  test('primary color is Rich Cerulean on CTA buttons', async ({ page }) => {
    await page.goto('/invoices');
    const newInvoiceBtn = page.getByRole('link', { name: /new invoice/i }).locator('button');
    const bgColor = await newInvoiceBtn.evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    // Rich Cerulean hsl(202, 66%, 39%) ≈ rgb(34, 117, 165)
    // Parse RGB values and check they're in the cerulean range
    const match = bgColor.match(/(\d+)/g)?.map(Number) || [];
    expect(match[0]).toBeGreaterThanOrEqual(30);
    expect(match[0]).toBeLessThanOrEqual(40);
    expect(match[1]).toBeGreaterThanOrEqual(110);
    expect(match[1]).toBeLessThanOrEqual(120);
    expect(match[2]).toBeGreaterThanOrEqual(160);
    expect(match[2]).toBeLessThanOrEqual(170);
  });

  test('background uses warm neutral tone', async ({ page }) => {
    await page.goto('/login');
    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // Warm neutral background should not be pure white or cold gray
    // hsl(30 20% 97%) ≈ rgb(249, 247, 244)
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
    expect(bgColor).not.toBe('rgb(250, 250, 250)');
  });

  test('CSS custom properties are defined on :root', async ({ page }) => {
    await page.goto('/login');
    const vars = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        primary: style.getPropertyValue('--primary').trim(),
        secondary: style.getPropertyValue('--secondary').trim(),
        accent: style.getPropertyValue('--accent').trim(),
        destructive: style.getPropertyValue('--destructive').trim(),
        background: style.getPropertyValue('--background').trim(),
      };
    });
    expect(vars.primary).toBe('202 66% 39%');
    expect(vars.secondary).toBe('49 94% 68%');
    expect(vars.accent).toBe('42 79% 54%');
    expect(vars.destructive).toBe('355 39% 28%');
    expect(vars.background).toBe('30 20% 97%');
  });
});
