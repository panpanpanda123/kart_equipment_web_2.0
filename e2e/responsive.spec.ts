import { test, expect } from '@playwright/test';

/**
 * E2E Test: Responsive Layout
 * Tests layout behavior at different viewport sizes
 */
test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=赛车装备配置系统')).toBeVisible();
  });

  test('should display desktop layout on wide screens', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Character view and equipment library should be side by side
    const characterView = page.locator('img[alt="赛车手"]').locator('..');
    const equipmentLibrary = page.locator('[aria-label^="选择装备"]').first().locator('..');
    
    const characterBox = await characterView.boundingBox();
    const libraryBox = await equipmentLibrary.boundingBox();
    
    // They should be on the same horizontal level (side by side)
    expect(characterBox).toBeTruthy();
    expect(libraryBox).toBeTruthy();
    if (characterBox && libraryBox) {
      expect(Math.abs(characterBox.y - libraryBox.y)).toBeLessThan(100);
    }
  });

  test('should display mobile layout on narrow screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Character view and equipment library should be stacked vertically
    const characterView = page.locator('img[alt="赛车手"]').locator('..');
    const equipmentLibrary = page.locator('[aria-label^="选择装备"]').first().locator('..');
    
    const characterBox = await characterView.boundingBox();
    const libraryBox = await equipmentLibrary.boundingBox();
    
    // Library should be below character view
    expect(characterBox).toBeTruthy();
    expect(libraryBox).toBeTruthy();
    if (characterBox && libraryBox) {
      expect(libraryBox.y).toBeGreaterThan(characterBox.y + characterBox.height);
    }
  });

  test('should maintain slot proportions when resizing', async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1024, height: 768 });
    
    const helmetSlot = page.locator('[title*="头盔槽"]');
    const initialBox = await helmetSlot.boundingBox();
    
    // Resize to smaller
    await page.setViewportSize({ width: 768, height: 600 });
    
    const resizedBox = await helmetSlot.boundingBox();
    
    // Slot should scale proportionally
    expect(initialBox).toBeTruthy();
    expect(resizedBox).toBeTruthy();
    if (initialBox && resizedBox) {
      const initialRatio = initialBox.width / initialBox.height;
      const resizedRatio = resizedBox.width / resizedBox.height;
      
      // Aspect ratio should be maintained (within 10% tolerance)
      expect(Math.abs(initialRatio - resizedRatio) / initialRatio).toBeLessThan(0.1);
    }
  });

  test('should be usable on tablet size', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Should be able to select and equip
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    
    const helmetSlot = page.locator('[title*="头盔槽"]');
    await helmetSlot.click();
    
    // Should work correctly
    await expect(page.locator('text=/已装配: 1/')).toBeVisible();
  });

  test('should have touch-friendly targets on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Equipment cards should be large enough for touch (minimum 44x44px)
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    const box = await helmetCard.boundingBox();
    
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
