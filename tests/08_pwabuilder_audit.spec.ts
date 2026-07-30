import { test, expect } from '@playwright/test';

test.describe('PWABuilder Compliance Audit (Store-Ready PWA Guidelines)', () => {
  test('should satisfy PWABuilder Manifest checklist requirements', async ({ request }) => {
    const res = await request.get('/manifest.json');
    expect(res.status()).toBe(200);

    const manifest = await res.json();
    expect(manifest.id).toBe('/');
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.description).toBeTruthy();
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.display_override).toContain('standalone');
    expect(manifest.theme_color).toBe('#000000');
    expect(manifest.background_color).toBe('#000000');
    expect(manifest.categories).toEqual(expect.arrayContaining(['medical', 'health', 'utilities']));
    expect(manifest.prefer_related_applications).toBe(false);

    // Verify icons
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
    const maskableIcon = manifest.icons.find((i: any) => i.purpose === 'maskable');
    const anyIcon = manifest.icons.find((i: any) => i.purpose === 'any');

    expect(maskableIcon).toBeDefined();
    expect(anyIcon).toBeDefined();

    // Verify shortcuts
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(3);
    const triageShortcut = manifest.shortcuts.find((s: any) => s.url === '/triage');
    expect(triageShortcut).toBeDefined();

    // Verify screenshots (PWABuilder Store requirement)
    expect(manifest.screenshots.length).toBeGreaterThanOrEqual(2);
    const narrowScreenshot = manifest.screenshots.find((s: any) => s.form_factor === 'narrow');
    const wideScreenshot = manifest.screenshots.find((s: any) => s.form_factor === 'wide');

    expect(narrowScreenshot).toBeDefined();
    expect(wideScreenshot).toBeDefined();
  });

  test('should serve a valid Service Worker script at /sw.js', async ({ request }) => {
    const res = await request.get('/sw.js');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('CACHE_NAME');
    expect(text).toContain("self.addEventListener('fetch'");
    expect(text).toContain("self.addEventListener('install'");
  });

  test('should serve the offline fallback page at /offline', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.getByRole('heading', { name: /Offline Mode Active/i })).toBeVisible();
    await expect(page.locator('text=Zero-Connectivity Fallback')).toBeVisible();
  });

  test('should serve all required PNG icons and store screenshots', async ({ request }) => {
    const iconPaths = [
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/icons/maskable-192.png',
      '/icons/maskable-512.png',
      '/icons/apple-touch-icon.png',
      '/icons/favicon-32x32.png',
      '/screenshots/mobile-home.png',
      '/screenshots/desktop-home.png',
    ];

    for (const path of iconPaths) {
      const res = await request.get(path);
      expect(res.status(), `Expected ${path} to exist with status 200`).toBe(200);
    }
  });
});
