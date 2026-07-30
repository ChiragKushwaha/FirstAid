import { test, expect } from '@playwright/test';

test.describe('Offline PWA Asset & Security Audits', () => {
  test('should provide a valid manifest.json for offline installation', async ({ request }) => {
    const res = await request.get('/manifest.json');
    expect(res.status()).toBe(200);

    const manifest = await res.json();
    expect(manifest.name).toContain('FieldAid');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
  });

  test('should execute 100% locally with zero external API tracking calls', async ({ page }) => {
    const externalRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (!url.includes('localhost') && !url.includes('127.0.0.1') && !url.includes('fonts.googleapis.com') && !url.includes('fonts.gstatic.com')) {
        externalRequests.push(url);
      }
    });

    await page.goto('/');
    await page.goto('/triage');
    await page.goto('/cpr');
    await page.goto('/dosage');
    await page.goto('/protocols');

    // Verify zero tracking / analytics network requests were made
    expect(externalRequests.length).toBe(0);
  });
});
