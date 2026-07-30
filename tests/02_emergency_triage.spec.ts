import { test, expect } from '@playwright/test';

test.describe('Emergency Triage Wizard (START & JumpSTART Algorithms)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });
    await page.goto('/triage');
  });

  test('should render START algorithm setup screen with Adult and Pediatric toggles', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Triage Wizard/i })).toBeVisible();

    // Toggle buttons
    const adultBtn = page.getByRole('button', { name: /Adult START/i });
    const pedsBtn = page.getByRole('button', { name: /JumpSTART/i });

    await expect(adultBtn).toBeVisible();
    await expect(pedsBtn).toBeVisible();

    // Adult selected by default
    await expect(adultBtn).toHaveClass(/bg-white/);

    // Switch to Pediatric
    await pedsBtn.click();
    await expect(pedsBtn).toHaveClass(/bg-white/);
    await expect(page.locator('text=Pediatric Protocol')).toBeVisible();
  });

  test('should navigate Adult START algorithm to GREEN category (Ambulatory)', async ({ page }) => {
    // Begin assessment
    await page.getByRole('button', { name: /Begin Rapid Assessment/i }).click();

    // Question 1: Can the victim walk?
    await expect(page.locator('text=Can the victim walk?')).toBeVisible();

    // Click Yes — Can Walk
    await page.getByRole('button', { name: /Yes — Can Walk/i }).click();

    // Verify Result: GREEN Category
    await expect(page.locator('text=GREEN — Minor')).toBeVisible();
    await expect(page.locator('text=Delayed / Walking Wounded')).toBeVisible();
  });

  test('should navigate Adult START algorithm to BLACK category (Deceased)', async ({ page }) => {
    await page.getByRole('button', { name: /Begin Rapid Assessment/i }).click();

    // Q1: Can victim walk? -> No
    await page.getByRole('button', { name: /No — Unable/i }).click();

    // Q2: Is victim breathing? -> No
    await expect(page.locator('text=Is the victim breathing?')).toBeVisible();
    await page.getByRole('button', { name: /No — Not Breathing/i }).click();

    // Q3: After opening airway, are they breathing? -> No
    await expect(page.locator('text=After opening airway')).toBeVisible();
    await page.getByRole('button', { name: /No — Still Apneic/i }).click();

    // Verify Result: BLACK Category
    await expect(page.locator('text=BLACK — Deceased')).toBeVisible();
  });

  test('should navigate Adult START algorithm to RED category (Rapid Breathing)', async ({ page }) => {
    await page.getByRole('button', { name: /Begin Rapid Assessment/i }).click();

    // Q1: Walk? -> No
    await page.getByRole('button', { name: /No — Unable/i }).click();

    // Q2: Breathing? -> Yes
    await page.getByRole('button', { name: /Yes — Breathing/i }).click();

    // Q3: Resp rate > 30? -> Yes
    await expect(page.locator('text=Is respiratory rate > 30')).toBeVisible();
    await page.getByRole('button', { name: /Yes — >30\/min/i }).click();

    // Verify Result: RED Category
    await expect(page.locator('text=RED — Immediate')).toBeVisible();
    await expect(page.locator('text=Life-Threatening Emergency')).toBeVisible();
  });

  test('should allow resetting triage to assess next patient', async ({ page }) => {
    await page.getByRole('button', { name: /Begin Rapid Assessment/i }).click();
    await page.getByRole('button', { name: /Yes — Can Walk/i }).click();

    await expect(page.locator('text=GREEN — Minor')).toBeVisible();

    // Click Next Patient button
    await page.getByRole('button', { name: /Next Patient/i }).click();

    // Should return to assessment start screen
    await expect(page.getByRole('button', { name: /Begin Rapid Assessment/i })).toBeVisible();
  });
});
