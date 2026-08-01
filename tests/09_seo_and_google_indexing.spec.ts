import { test, expect } from '@playwright/test';

test.describe('SEO & Google Search Indexing Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });
  });

  test('should serve dynamic XML sitemap at /sitemap.xml', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);

    const xml = await res.text();
    expect(xml).toContain('<urlset');
    expect(xml).toContain('https://field-aid.vercel.app</loc>');
    expect(xml).toContain('https://field-aid.vercel.app/triage</loc>');
    expect(xml).toContain('https://field-aid.vercel.app/cpr</loc>');
    expect(xml).toContain('https://field-aid.vercel.app/dosage</loc>');
    expect(xml).toContain('https://field-aid.vercel.app/protocols</loc>');
    expect(xml).toContain('https://field-aid.vercel.app/protocols/protocol_trauma_hemorrhage</loc>');
  });

  test('should serve valid robots.txt at /robots.txt referencing sitemap.xml', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text.toLowerCase()).toContain('user-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://field-aid.vercel.app/sitemap.xml');
  });

  test('should render rich SEO tags, canonical link, and JSON-LD schemas on Home Page', async ({ page }) => {
    await page.goto('/');

    // Title & description
    const title = await page.title();
    expect(title).toContain('FieldAid');

    // Canonical link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://field-aid.vercel.app');

    // OpenGraph & Twitter tags
    await expect(page.locator('meta[property="og:title"]')).toBeAttached();
    await expect(page.locator('meta[property="og:description"]')).toBeAttached();
    await expect(page.locator('meta[name="twitter:card"]')).toBeAttached();

    // JSON-LD Medical Web Page Schema
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const scriptText = await jsonLdScripts.first().textContent();
    expect(scriptText).toContain('MedicalWebPage');
  });

  test('should render unique dynamic metadata and MedicalProcedure schema on Protocol Detail page', async ({ page }) => {
    await page.goto('/protocols/protocol_trauma_hemorrhage');

    // Check title
    const title = await page.title();
    expect(title).toContain('Severe Bleeding Control');

    // Check canonical link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://field-aid.vercel.app/protocols/protocol_trauma_hemorrhage');

    // Check JSON-LD procedure schema
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const texts = await jsonLdScripts.allTextContents();

    const hasProcedure = texts.some((t) => t.includes('MedicalProcedure') && t.includes('Severe Bleeding Control'));
    const hasBreadcrumb = texts.some((t) => t.includes('BreadcrumbList'));

    expect(hasProcedure).toBe(true);
    expect(hasBreadcrumb).toBe(true);
  });
});
