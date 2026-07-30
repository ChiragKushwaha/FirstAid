import { test, expect } from '@playwright/test';

test.describe('Weight-Based Dosage Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });
    await page.goto('/dosage');
  });

  test('should render dosage calculator setup with weight units & age groups', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Dosage Calculator/i }).first()).toBeVisible();

    const kgBtn = page.locator('button', { hasText: 'kg' }).first();
    const lbsBtn = page.locator('button', { hasText: 'lbs' }).first();

    await expect(kgBtn).toBeVisible();
    await expect(lbsBtn).toBeVisible();

    await expect(page.locator('button', { hasText: 'Infant' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Child' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Adult' }).first()).toBeVisible();
  });

  test('should convert lbs to kg automatically when unit is switched', async ({ page }) => {
    const input = page.getByPlaceholder('Enter weight').first();
    await input.fill('33');

    const lbsBtn = page.locator('button', { hasText: 'lbs' }).first();
    await lbsBtn.click();

    await expect(page.locator('text=15 kg').first()).toBeVisible();
  });

  test('should calculate liquid dosage volume using PRD formula', async ({ page }) => {
    const kgBtn = page.getByRole('radio', { name: 'kg' });
    await kgBtn.click();

    const input = page.getByPlaceholder('Enter weight').first();
    await input.fill('15');

    const acetaminophenBtn = page.locator('button', { hasText: 'Acetaminophen' }).first();
    await acetaminophenBtn.scrollIntoViewIfNeeded();
    await acetaminophenBtn.click();

    await expect(page.locator('text=Formula Output (mL)').first()).toBeVisible();
    await expect(page.locator('text=7.0 mL').first()).toBeVisible();
  });

  test('should enforce adult maximum cap warning for heavy patients', async ({ page }) => {
    const input = page.getByPlaceholder('Enter weight').first();
    await input.fill('80');

    const acetaminophenBtn = page.locator('button', { hasText: 'Acetaminophen' }).first();
    await acetaminophenBtn.scrollIntoViewIfNeeded();
    await acetaminophenBtn.click();

    await expect(page.locator('text=Enforced Adult Upper Cap').first()).toBeVisible();
    await expect(page.locator('text=31.5 mL').first()).toBeVisible();
  });

  test('should filter pre-loaded drugs using search bar', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search generic / brand...').first();
    await searchInput.fill('Ibuprofen');

    await expect(page.locator('button', { hasText: 'Ibuprofen' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Acetaminophen' })).not.toBeVisible();
  });
});
