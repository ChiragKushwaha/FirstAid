import { test, expect } from '@playwright/test';

test.describe('WCAG High-Contrast & Visual Switch Legibility Audits', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });
  });

  test('should ensure active toggle switch text on Dosage page is bright white on dark background', async ({ page }) => {
    await page.goto('/dosage');

    // 1. Age Category Switch ('Child' active by default)
    const childBtn = page.getByRole('radio', { name: 'Child' });
    await expect(childBtn).toBeVisible();
    await expect(childBtn).toHaveClass(/bg-black/);
    await expect(childBtn).toHaveClass(/text-white/);

    // 2. Weight Unit Switch ('kg' active by default)
    const kgBtn = page.getByRole('radio', { name: 'kg' });
    await expect(kgBtn).toBeVisible();
    await expect(kgBtn).toHaveClass(/bg-black/);
    await expect(kgBtn).toHaveClass(/text-white/);

    // 3. Drug Filter Switch ('All' active by default)
    const allBtn = page.getByRole('button', { name: 'All' });
    await expect(allBtn).toBeVisible();
    await expect(allBtn).toHaveClass(/bg-black/);
    await expect(allBtn).toHaveClass(/text-white/);
  });

  test('should ensure active toggle switch text on Triage page is bright white on dark background', async ({ page }) => {
    await page.goto('/triage');

    const adultRadio = page.getByRole('radio', { name: /Adult START/i });
    await expect(adultRadio).toBeVisible();
    await expect(adultRadio).toHaveClass(/bg-black/);
    await expect(adultRadio).toHaveClass(/text-white/);
  });

  test('should maintain high-contrast legibility when toggling switches dynamically', async ({ page }) => {
    await page.goto('/dosage');

    // Click 'Infant'
    const infantBtn = page.getByRole('radio', { name: 'Infant' });
    await infantBtn.click();
    await expect(infantBtn).toHaveAttribute('aria-checked', 'true');
    await expect(infantBtn).toHaveClass(/bg-black/);
    await expect(infantBtn).toHaveClass(/text-white/);

    // Click 'lbs'
    const lbsBtn = page.getByRole('radio', { name: 'lbs' });
    await lbsBtn.click();
    await expect(lbsBtn).toHaveAttribute('aria-checked', 'true');
    await expect(lbsBtn).toHaveClass(/bg-black/);
    await expect(lbsBtn).toHaveClass(/text-white/);
  });
});
