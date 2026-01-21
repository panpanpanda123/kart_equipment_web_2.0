import { test, expect } from '@playwright/test';

/**
 * E2E Test: Error Recovery
 * Tests error handling and graceful degradation
 */
test.describe('Error Recovery', () => {
  test('should show error page when config fails to load', async ({ page }) => {
    // Intercept config request and make it fail
    await page.route('**/master-config.json', route => {
      route.abort('failed');
    });
    
    await page.goto('/');
    
    // Should show error message
    await expect(page.locator('text=/配置加载失败|加载失败/')).toBeVisible();
    
    // Should have retry button
    const retryButton = page.locator('button:has-text("重试")');
    await expect(retryButton).toBeVisible();
  });

  test('should retry loading config on button click', async ({ page }) => {
    let requestCount = 0;
    
    // Intercept config request - fail first time, succeed second time
    await page.route('**/master-config.json', route => {
      requestCount++;
      if (requestCount === 1) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    await page.goto('/');
    
    // Should show error first
    await expect(page.locator('text=/配置加载失败|加载失败/')).toBeVisible();
    
    // Click retry
    await page.locator('button:has-text("重试")').click();
    
    // Should load successfully
    await expect(page.locator('text=KART EQUIPMENT')).toBeVisible();
    await expect(page.locator('img[alt="赛车手"]')).toBeVisible();
  });

  test('should handle localStorage being unavailable', async ({ page, context }) => {
    // Disable localStorage
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage unavailable'); },
          setItem: () => { throw new Error('localStorage unavailable'); },
          removeItem: () => { throw new Error('localStorage unavailable'); },
          clear: () => { throw new Error('localStorage unavailable'); },
        },
        writable: false,
      });
    });
    
    await page.goto('/');
    
    // App should still load (graceful degradation)
    await expect(page.locator('text=KART EQUIPMENT')).toBeVisible();
    
    // Should be able to equip items (just won't persist)
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    const helmetSlot = page.locator('[title*="头盔槽"]');
    await helmetSlot.click();
    
    // Should work
    await expect(page.locator('text=/已装配: 1/')).toBeVisible();
  });

  test('should handle invalid item IDs in localStorage', async ({ page, context }) => {
    // Pre-populate localStorage with invalid data
    await context.addInitScript(() => {
      localStorage.setItem('racing-equipment-config-v1', JSON.stringify({
        equippedItems: {
          'helmet': ['invalid-item-id-123'],
          'gloves': ['helmet-001'], // Valid ID but wrong slot
        },
      }));
    });
    
    await page.goto('/');
    
    // App should load and filter out invalid items
    await expect(page.locator('text=KART EQUIPMENT')).toBeVisible();
    
    // Invalid items should be filtered out
    // Status bar should show 0 equipped (or only valid ones)
    await expect(page.locator('text=/已装配: [0-1]/')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Load app first
    await page.goto('/');
    await expect(page.locator('text=KART EQUIPMENT')).toBeVisible();
    
    // Now simulate network going offline
    await page.context().setOffline(true);
    
    // App should continue to work with cached data
    const helmetCard = page.locator('[aria-label*="头盔"]').first();
    await helmetCard.click();
    const helmetSlot = page.locator('[title*="头盔槽"]');
    await helmetSlot.click();
    
    // Should still work
    await expect(page.locator('text=/已装配: 1/')).toBeVisible();
  });

  test('should handle rapid interactions without breaking', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=KART EQUIPMENT')).toBeVisible();
    
    // Rapidly click multiple items
    const cards = page.locator('[aria-label^="选择装备"]');
    for (let i = 0; i < 5; i++) {
      await cards.nth(i).click({ delay: 10 });
    }
    
    // App should not crash
    await expect(page.locator('text=KART EQUIPMENT')).toBeVisible();
    
    // Only last item should be selected (single selection invariant)
    const selectedCards = page.locator('[aria-pressed="true"]');
    await expect(selectedCards).toHaveCount(1);
  });
});
