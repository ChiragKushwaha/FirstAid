import { test, expect } from '@playwright/test';

test.describe('Emergency Triage Wizard (START & JumpSTART Algorithms)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });
    await page.goto('/triage');
  });

  test('should render START algorithm setup screen with Adult and Pediatric toggles', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Triage Wizard/i }).first()).toBeVisible();

    const adultBtn = page.getByRole('radio', { name: /Adult START/i }).first();
    const pedsBtn = page.getByRole('radio', { name: /JumpSTART/i }).first();

    await expect(adultBtn).toBeVisible();
    await expect(pedsBtn).toBeVisible();

    await pedsBtn.click();
    await expect(page.locator('text=Pediatric Protocol').first()).toBeVisible();
  });

  test('should navigate Adult START algorithm to GREEN category (Ambulatory)', async ({ page }) => {
    await page.getByRole('button', { name: /Begin Rapid Assessment/i }).first().click();
    await expect(page.locator('text=Can the victim walk?').first()).toBeVisible();

    await page.getByRole('button', { name: /Yes — Can Walk/i }).first().click();

    await expect(page.locator('text=GREEN — Minor').first()).toBeVisible();
    await expect(page.locator('text=Delayed / Walking Wounded').first()).toBeVisible();
  });

  test('should navigate Adult START algorithm to BLACK category (Deceased)', async ({ page }) => {
    await page.getByRole('button', { name: /Begin Rapid Assessment/i }).first().click();

    await page.getByRole('button', { name: /No — Unable/i }).first().click();

    await expect(page.locator('text=Is the victim breathing?').first()).toBeVisible();
    await page.getByRole('button', { name: /No — Not Breathing/i }).first().click();

    await expect(page.locator('text=After opening airway').first()).toBeVisible();
    await page.getByRole('button', { name: /No — Still Apneic/i }).first().click();

    await expect(page.locator('text=BLACK — Deceased').first()).toBeVisible();
  });

  test('should navigate Adult START algorithm to RED category (Rapid Breathing)', async ({ page }) => {
    await page.getByRole('button', { name: /Begin Rapid Assessment/i }).first().click();

    await page.getByRole('button', { name: /No — Unable/i }).first().click();
    await page.getByRole('button', { name: /Yes — Breathing/i }).first().click();

    await expect(page.locator('text=Is respiratory rate > 30').first()).toBeVisible();
    await page.getByRole('button', { name: /Yes/i }).first().click();

    await expect(page.locator('text=RED — Immediate').first()).toBeVisible();
    await expect(page.locator('text=Life-Threatening Emergency').first()).toBeVisible();
  });

  test('should allow resetting triage to assess next patient', async ({ page }) => {
    await page.getByRole('button', { name: /Begin Rapid Assessment/i }).first().click();
    await page.getByRole('button', { name: /Yes — Can Walk/i }).first().click();

    await expect(page.locator('text=GREEN — Minor').first()).toBeVisible();

    await page.getByRole('button', { name: /Next Patient/i }).first().click();

    await expect(page.getByRole('button', { name: /Begin Rapid Assessment/i }).first()).toBeVisible();
  });
});
