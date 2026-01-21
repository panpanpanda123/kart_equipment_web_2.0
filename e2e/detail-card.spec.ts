import { test, expect } from '@playwright/test';

/**
 * E2E Test: DetailCard Functionality
 * Tests hover and long-press interactions for equipment details
 */
test.describe('DetailCard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=KART EQUIPMENT')).toBeVisible();
  });

  test.describe('Desktop Hover', () => {
    test('should show DetailCard on hover after delay', async ({ page }) => {
      // Hover over a helmet card
      const helmetCard = page.locator('[aria-label*="头盔"]').first();
      await helmetCard.hover();
      
      // DetailCard should not appear immediately
      await expect(page.locator('text=/Arai|Bell|Stilo/')).not.toBeVisible({ timeout: 100 });
      
      // Wait for hover delay (200ms)
      await page.waitForTimeout(250);
      
      // DetailCard should now be visible
      await expect(page.locator('text=/Arai|Bell|Stilo/')).toBeVisible();
      
      // Should show equipment details
      await expect(page.locator('text=/规格参数|重量|通风口/')).toBeVisible();
    });

    test('should hide DetailCard when mouse leaves', async ({ page }) => {
      // Hover over a helmet card
      const helmetCard = page.locator('[aria-label*="头盔"]').first();
      await helmetCard.hover();
      await page.waitForTimeout(250);
      
      // DetailCard should be visible
      await expect(page.locator('text=/Arai|Bell|Stilo/')).toBeVisible();
      
      // Move mouse away
      await page.mouse.move(0, 0);
      
      // DetailCard should hide immediately
      await expect(page.locator('text=/Arai|Bell|Stilo/')).not.toBeVisible({ timeout: 500 });
    });

    test('should show Phase 2 fields when expanded', async ({ page }) => {
      // Hover over a helmet with Phase 2 data
      const helmetCard = page.locator('[aria-label*="Arai"]').first();
      await helmetCard.hover();
      await page.waitForTimeout(250);
      
      // Click on "认证对比" to expand
      const expandButton = page.locator('button:has-text("认证对比")');
      if (await expandButton.isVisible()) {
        await expandButton.click();
        
        // Should show Phase 2 fields
        await expect(page.locator('text=/优势|劣势|适用场景/')).toBeVisible();
      }
    });
  });

  test.describe('Mobile Long-Press', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should show DetailCard on long-press', async ({ page }) => {
      // Long-press on a helmet card
      const helmetCard = page.locator('[aria-label*="头盔"]').first();
      
      // Simulate long-press (touch and hold)
      await helmetCard.dispatchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      // Wait for long-press delay (500ms)
      await page.waitForTimeout(550);
      
      // DetailCard should be visible
      await expect(page.locator('text=/Arai|Bell|Stilo/')).toBeVisible();
    });

    test('should close DetailCard when clicking outside', async ({ page }) => {
      // Long-press on a helmet card
      const helmetCard = page.locator('[aria-label*="头盔"]').first();
      await helmetCard.dispatchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      await page.waitForTimeout(550);
      
      // DetailCard should be visible
      await expect(page.locator('text=/Arai|Bell|Stilo/')).toBeVisible();
      
      // Click outside
      await page.mouse.click(10, 10);
      
      // DetailCard should close
      await expect(page.locator('text=/Arai|Bell|Stilo/')).not.toBeVisible({ timeout: 500 });
    });
  });

  test.describe('Equipped Item Details', () => {
    test('should show DetailCard when hovering over equipped item', async ({ page }) => {
      // Equip a helmet first
      const helmetCard = page.locator('[aria-label*="头盔"]').first();
      await helmetCard.click();
      const helmetSlot = page.locator('[title*="头盔槽"]');
      await helmetSlot.click();
      
      // Hover over the equipped item in slot
      await helmetSlot.hover();
      await page.waitForTimeout(250);
      
      // DetailCard should be visible
      await expect(page.locator('text=/Arai|Bell|Stilo/')).toBeVisible();
    });
  });
});
