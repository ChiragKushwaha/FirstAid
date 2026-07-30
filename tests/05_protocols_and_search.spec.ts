import { test, expect } from '@playwright/test';

test.describe('Emergency Protocols & Client-Side Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });
    await page.goto('/protocols');
  });

  test('should list emergency protocols with category & severity tags', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Emergency Directory/i }).first()).toBeVisible();

    await expect(page.locator('text=Severe Bleeding Control').first()).toBeVisible();
    await expect(page.locator('text=Adult CPR (30:2)').first()).toBeVisible();
    await expect(page.locator('text=Anaphylaxis (Severe Allergic Reaction)').first()).toBeVisible();
  });

  test('should perform fuzzy search with lay terms (PRD Section 3.5)', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search symptoms').first();

    await searchInput.fill('bleeding');
    await expect(page.locator('text=Severe Bleeding Control').first()).toBeVisible();

    await searchInput.fill('snake bite');
    await expect(page.locator('text=Animal Bites, Snake & Spider Envenomation').first()).toBeVisible();
  });

  test('should filter protocols by category chips', async ({ page }) => {
    const traumaPill = page.locator('button.pill', { hasText: 'Trauma' }).first();
    await traumaPill.click();

    await expect(page.locator('text=Severe Bleeding Control').first()).toBeVisible();
    await expect(page.locator('text=Anaphylaxis (Severe Allergic Reaction)')).not.toBeVisible();
  });

  test('should navigate to protocol detail page with cream design theme', async ({ page }) => {
    await page.locator('text=Severe Bleeding Control').first().click();

    await expect(page.locator('h1').last()).toContainText('Bleeding');
    await expect(page.locator('text=Shared to').first()).toBeVisible();
    await expect(page.locator('text=Tap steps below').first()).toBeVisible();
    await expect(page.locator('text=Protocol Steps:').first()).toBeVisible();
    await expect(page.locator('text=CRITICAL WARNINGS').first()).toBeVisible();
  });
});
