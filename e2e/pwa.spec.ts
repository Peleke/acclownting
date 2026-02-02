import { test, expect } from '@playwright/test';

test.describe('PWA: Manifest and Meta Tags', () => {
  test('manifest.json is served and valid', async ({ page }) => {
    const response = await page.request.get('/manifest.json');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toBe('Acclownting');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#2274A5');
    expect(manifest.icons).toHaveLength(3);
    expect(manifest.icons[0].sizes).toBe('192x192');
    expect(manifest.icons[1].sizes).toBe('512x512');
    expect(manifest.icons[2].sizes).toBe('180x180');
  });

  test('HTML head includes manifest link', async ({ page }) => {
    await page.goto('/dashboard');
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  });

  test('HTML head includes theme-color meta', async ({ page }) => {
    await page.goto('/dashboard');
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#2274A5');
  });

  test('HTML head includes apple-web-app-capable', async ({ page }) => {
    await page.goto('/dashboard');
    const capable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(capable).toHaveAttribute('content', 'yes');
  });

  test('app icons are accessible', async ({ page }) => {
    const icon192 = await page.request.get('/icon-192x192.png');
    expect(icon192.status()).toBe(200);
    expect(icon192.headers()['content-type']).toContain('image/png');

    const icon512 = await page.request.get('/icon-512x512.png');
    expect(icon512.status()).toBe(200);

    const appleIcon = await page.request.get('/apple-touch-icon.png');
    expect(appleIcon.status()).toBe(200);
  });
});
