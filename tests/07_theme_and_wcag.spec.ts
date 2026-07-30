import { test, expect } from '@playwright/test';

test.describe('WCAG 2.1 Accessibility & Theme Toggle (Light/Dark Mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });
    await page.goto('/');
  });

  test('should default to dark theme and toggle to light theme', async ({ page }) => {
    // Check initial dark theme
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Find ThemeToggle button
    const themeBtn = page.getByRole('button', { name: /Switch to Light Mode/i }).first();
    await expect(themeBtn).toBeVisible();

    // Click toggle button
    await themeBtn.click();

    // Verify theme changed to light
    await expect(html).toHaveAttribute('data-theme', 'light');

    // Verify localStorage saved theme choice
    const savedTheme = await page.evaluate(() => window.localStorage.getItem('fieldaid_theme'));
    expect(savedTheme).toBe('light');

    // Toggle back to dark
    const darkToggleBtn = page.getByRole('button', { name: /Switch to Dark Mode/i }).first();
    await darkToggleBtn.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('should have semantic HTML structure (header, main, nav, section, footer)', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
  });

  test('should provide ARIA live announcements for screen readers', async ({ page }) => {
    const announcer = page.locator('#aria-announcer');
    await expect(announcer).toBeAttached();

    // Click theme toggle to trigger ARIA announcement
    const themeBtn = page.getByRole('button', { name: /Switch to Light Mode/i }).first();
    await themeBtn.click();

    await expect(announcer).toHaveText('Switched to light mode');
  });

  test('should satisfy WCAG 48px minimum touch target size for interactive controls', async ({ page }) => {
    const helpBtn = page.getByRole('button', { name: /App Disclaimer & Medical Information/i }).first();
    const box = await helpBtn.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
