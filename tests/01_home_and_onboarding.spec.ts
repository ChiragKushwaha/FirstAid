import { test, expect } from '@playwright/test';

test.describe('FieldAid Home Page & Onboarding Disclaimer', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('should display mandatory medical onboarding disclaimer modal on first visit', async ({ page }) => {
    await page.goto('/');

    const modal = page.locator('text=Important Medical Notice').first();
    await expect(modal).toBeVisible();

    await expect(page.locator('text=FieldAid Onboarding').first()).toBeVisible();

    const acceptBtn = page.getByRole('button', { name: /I Understand & Accept/i }).first();
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    await expect(modal).not.toBeVisible();

    const savedState = await page.evaluate(() =>
      window.localStorage.getItem('fieldaid_disclaimer_accepted')
    );
    expect(savedState).toBe('true');
  });

  test('should allow opening disclaimer modal manually via help icon button', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });

    await page.goto('/');

    const helpBtn = page.getByRole('button', { name: /App Disclaimer/i }).first();
    await expect(helpBtn).toBeVisible();
    await helpBtn.click();

    await expect(page.locator('text=FieldAid Onboarding').first()).toBeVisible();

    await page.getByRole('button', { name: /I Understand & Accept/i }).first().click();
    await expect(page.locator('text=FieldAid Onboarding')).not.toBeVisible();
  });

  test('should render Home Page hero title, subtitle, and category filters', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Field Aid/i }).first()).toBeVisible();
    await expect(page.locator('text=Zero-latency offline first aid').first()).toBeVisible();

    const allPill = page.locator('button.pill', { hasText: 'All' }).first();
    const emergencyPill = page.locator('button.pill', { hasText: 'Emergency' }).first();

    await expect(allPill).toBeVisible();
    await expect(emergencyPill).toBeVisible();
  });

  test('should render leaf-shaped feature cards and navigate to core tools', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });

    await page.goto('/');

    const triageCard = page.locator('a[href="/triage"]').first();
    await expect(triageCard).toBeVisible();
    await expect(triageCard).toHaveClass(/leaf-card-left/);

    const cprCard = page.locator('a[href="/cpr"]').first();
    await expect(cprCard).toBeVisible();
    await expect(cprCard).toHaveClass(/leaf-card-right/);

    const dosageCard = page.locator('a[href="/dosage"]').first();
    await expect(dosageCard).toBeVisible();
    await expect(dosageCard).toHaveClass(/leaf-card-full/);
  });

  test('should render bottom floating dock buttons', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });

    await page.goto('/');

    const plusFab = page.locator('a.fab-plus').first();
    const micFab = page.locator('a.fab-mic-dock').first();

    await expect(plusFab).toBeVisible();
    await expect(micFab).toBeVisible();
  });
});
