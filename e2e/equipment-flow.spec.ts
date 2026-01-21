import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete Equipment Flow
 * Tests the full user journey from selecting to equipping items
 */
test.describe('Equipment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await expect(page.locator('text=赛车装备配置系统')).toBeVisible();
  });

  test('should load configuration and display slots and equipment', async ({ page }) => {
    // Check that character view is visible
    await expect(page.locator('img[alt="赛车手"]')).toBeVisible();
    
    // Check that equipment library is visible
    const equipmentCards = page.locator('[aria-label^="选择装备"]');
    await expect(equipmentCards.first()).toBeVisible();
    
    // Should have at least 12 equipment items
    const count = await equipmentCards.count();
    expect(count).toBeGreaterThanOrEqual(12);
    
    // Check status bar
    await expect(page.locator('text=/已装配:.*件装备/')).toBeVisible();
  });

  test('should select equipment and highlight compatible slots', async ({ page }) => {
    // Click on a helmet
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    
    // Should be selected (aria-pressed=true)
    await expect(helmetCard).toHaveAttribute('aria-pressed', 'true');
    
    // Helmet slot should be highlighted (green border)
    const helmetSlot = page.locator('[title*="头盔槽"]');
    await expect(helmetSlot).toHaveClass(/border-green-500/);
  });

  test('should equip item to slot', async ({ page }) => {
    // Select a helmet
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    
    // Click on helmet slot to equip
    const helmetSlot = page.locator('[title*="头盔槽"]');
    await helmetSlot.click();
    
    // Selection should be cleared (aria-pressed=false)
    await expect(helmetCard).toHaveAttribute('aria-pressed', 'false');
    
    // Slot should show equipped item (blue border)
    await expect(helmetSlot).toHaveClass(/border-blue-500/);
    
    // Status bar should update
    await expect(page.locator('text=/已装配: 1/')).toBeVisible();
  });

  test('should show toast when equipping to incompatible slot', async ({ page }) => {
    // Select a helmet
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    
    // Try to equip to gloves slot (incompatible)
    const glovesSlot = page.locator('[title*="手套槽"]');
    await glovesSlot.click();
    
    // Toast should appear
    await expect(page.locator('text=此装备无法装配到该槽位')).toBeVisible();
    
    // Selection should be preserved
    await expect(helmetCard).toHaveAttribute('aria-pressed', 'true');
    
    // Toast should auto-dismiss after 3 seconds
    await expect(page.locator('text=此装备无法装配到该槽位')).not.toBeVisible({ timeout: 4000 });
  });

  test('should unequip item from slot', async ({ page }) => {
    // Equip a helmet first
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    const helmetSlot = page.locator('[title*="头盔槽"]');
    await helmetSlot.click();
    
    // Click slot again to unequip (no selection)
    await helmetSlot.click();
    
    // Slot should be empty
    await expect(helmetSlot).toHaveClass(/border-gray-400/);
    
    // Status bar should update
    await expect(page.locator('text=/已装配: 0/')).toBeVisible();
  });

  test('should persist state after page refresh', async ({ page }) => {
    // Equip a helmet
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    const helmetSlot = page.locator('[title*="头盔槽"]');
    await helmetSlot.click();
    
    // Refresh page
    await page.reload();
    
    // Wait for app to load
    await expect(page.locator('text=赛车装备配置系统')).toBeVisible();
    
    // Helmet should still be equipped
    await expect(helmetSlot).toHaveClass(/border-blue-500/);
    await expect(page.locator('text=/已装配: 1/')).toBeVisible();
  });

  test('should reset all equipment', async ({ page }) => {
    // Equip multiple items
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    await page.locator('[title*="头盔槽"]').click();
    
    const glovesCard = page.locator('[aria-label*="手套"]').first();
    await glovesCard.click();
    await page.locator('[title*="手套槽"]').click();
    
    // Click Reset button
    await page.locator('button:has-text("重置")').click();
    
    // All slots should be empty
    await expect(page.locator('text=/已装配: 0/')).toBeVisible();
    
    // Completeness indicator should not be visible
    await expect(page.locator('text=✓')).not.toBeVisible();
  });

  test('should show completeness indicator when required slots filled', async ({ page }) => {
    // Equip helmet (required)
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    await page.locator('[title*="头盔槽"]').click();
    
    // Completeness indicator should not be visible yet (need rib protector too)
    await expect(page.locator('.bg-green-500').locator('text=✓')).not.toBeVisible();
    
    // Equip rib protector (required)
    const ribCard = page.locator('[aria-label*="护肋"]').first();
    await ribCard.click();
    await page.locator('[title*="护肋槽"]').click();
    
    // Completeness indicator should be visible
    await expect(page.locator('.bg-green-500').locator('text=✓')).toBeVisible();
    await expect(page.locator('text=/必选: 2\\/2/')).toBeVisible();
  });

  test('should support double-click quick equip', async ({ page }) => {
    // Double-click a helmet
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.dblclick();
    
    // Should be equipped automatically
    const helmetSlot = page.locator('[title*="头盔槽"]');
    await expect(helmetSlot).toHaveClass(/border-blue-500/);
    
    // Status bar should update
    await expect(page.locator('text=/已装配: 1/')).toBeVisible();
  });
});
