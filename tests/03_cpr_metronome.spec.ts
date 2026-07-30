import { test, expect } from '@playwright/test';

test.describe('CPR Guide & 110 BPM Metronome', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    });
    await page.goto('/cpr');
  });

  test('should render CPR Pacer page with 110 BPM metronome indicators', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /CPR Guide & Pacer/i }).first()).toBeVisible();
    await expect(page.locator('text=110 BPM').first()).toBeVisible();

    const mode30_2 = page.getByRole('button', { name: /30:2/i }).first();
    const mode15_2 = page.getByRole('button', { name: /15:2/i }).first();

    await expect(mode30_2).toBeVisible();
    await expect(mode15_2).toBeVisible();
  });

  test('should toggle between 30:2 and 15:2 CPR ratio modes', async ({ page }) => {
    const mode30_2 = page.getByRole('button', { name: /30:2/i }).first();
    const mode15_2 = page.getByRole('button', { name: /15:2/i }).first();

    await mode15_2.click();
    await expect(mode15_2).toHaveClass(/bg-white/);

    await mode30_2.click();
    await expect(mode30_2).toHaveClass(/bg-white/);
  });

  test('should start and stop 110 BPM metronome', async ({ page }) => {
    const startBtn = page.getByRole('button', { name: /Start 110 BPM Metronome/i }).first();
    await expect(startBtn).toBeVisible();

    await startBtn.click();

    const stopBtn = page.getByRole('button', { name: /Stop Metronome/i }).first();
    await expect(stopBtn).toBeVisible();

    await page.waitForTimeout(1000);

    await stopBtn.click();
    await expect(startBtn).toBeVisible();
  });

  test('should toggle visual mode for damaged speakers', async ({ page }) => {
    const visualBtn = page.getByRole('button', { name: /Visual Mode/i }).first();
    await expect(visualBtn).toBeVisible();

    await visualBtn.click();
    await expect(visualBtn).toHaveClass(/bg-\[#F7D44C\]/);
  });
});
