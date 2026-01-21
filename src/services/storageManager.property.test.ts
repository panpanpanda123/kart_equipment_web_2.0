/**
 * Property-Based Tests for StorageManager
 * 
 * Feature: racing-equipment-config
 * 
 * This test suite uses property-based testing to verify the correctness
 * of localStorage persistence operations across a wide range of inputs.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageManager } from './storageManager';
import { equippedItemsArbitrary } from './test-utils/arbitraries';

// Mock localStorage for testing
class LocalStorageMock {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('StorageManager - Property-Based Tests', () => {
  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    // Setup mock localStorage
    localStorageMock = new LocalStorageMock();
    global.localStorage = localStorageMock as unknown as Storage;
  });

  afterEach(() => {
    // Clean up
    localStorageMock.clear();
  });

  /**
   * Property 16: Persistence Round Trip
   * 
   * **Validates: Requirements 9.2, 9.3**
   * 
   * For any valid equipped items state, saving to localStorage then loading
   * SHALL produce an equivalent state (excluding invalid item IDs that no
   * longer exist in configuration).
   * 
   * This property verifies that:
   * 1. Data can be saved and restored correctly
   * 2. Invalid item IDs are filtered out during load
   * 3. Valid item IDs are preserved
   */
  test('Property 16: Persistence Round Trip', () => {
    // Generate valid slot and item IDs for testing
    const validSlotIds = [
      'helmet',
      'balaclava',
      'gloves',
      'suit',
      'rib-protector',
      'shoes',
      'accessory-1',
      'accessory-2',
      'accessory-3',
      'accessory-4'
    ];
    const validItemIds = Array.from({ length: 20 }, (_, i) => `item-${i}`);

    fc.assert(
      fc.property(
        equippedItemsArbitrary(validSlotIds, validItemIds),
        equippedItems => {
          // Save the equipped items
          StorageManager.save(equippedItems);

          // Load with all item IDs valid
          const validItemIdSet = new Set(validItemIds);
          const loaded = StorageManager.load(validItemIdSet);

          // Verify round-trip: loaded state should match saved state
          expect(loaded.size).toBe(equippedItems.size);

          for (const [slotId, itemIds] of equippedItems.entries()) {
            expect(loaded.has(slotId)).toBe(true);
            const loadedItemIds = loaded.get(slotId);
            expect(loadedItemIds).toEqual(itemIds);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid item IDs are filtered during load
   * 
   * When loading saved data, any item IDs that are not in the
   * validItemIds set should be filtered out.
   */
  test('invalid item IDs are filtered during load', () => {
    const validSlotIds = ['helmet', 'gloves', 'shoes'];
    const allItemIds = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'];

    fc.assert(
      fc.property(
        equippedItemsArbitrary(validSlotIds, allItemIds),
        fc.array(fc.constantFrom(...allItemIds), { minLength: 1, maxLength: allItemIds.length }),
        (equippedItems, validItemIdsArray) => {
          // Save the equipped items
          StorageManager.save(equippedItems);

          // Load with only a subset of item IDs valid
          const validItemIdSet = new Set(validItemIdsArray);
          const loaded = StorageManager.load(validItemIdSet);

          // Verify that only valid item IDs are in the loaded state
          for (const [slotId, itemIds] of loaded.entries()) {
            for (const itemId of itemIds) {
              expect(validItemIdSet.has(itemId)).toBe(true);
            }
          }

          // Verify that slots with no valid items are not in the loaded state
          for (const [slotId, itemIds] of equippedItems.entries()) {
            const validIds = itemIds.filter(id => validItemIdSet.has(id));
            if (validIds.length > 0) {
              expect(loaded.has(slotId)).toBe(true);
              expect(loaded.get(slotId)).toEqual(validIds);
            } else {
              // Slot should not be in loaded state if all items were invalid
              expect(loaded.has(slotId)).toBe(false);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Storage format consistency
   * 
   * **Validates: Requirements 9.6**
   * 
   * For any equipped items state saved to localStorage, the data SHALL
   * follow the format: {"version": 1, "equipped": {"slotId": ["itemId1", ...], ...}}
   */
  test('Property 17: Storage Format Consistency', () => {
    const validSlotIds = ['helmet', 'gloves', 'shoes'];
    const validItemIds = ['item-1', 'item-2', 'item-3'];

    fc.assert(
      fc.property(equippedItemsArbitrary(validSlotIds, validItemIds), equippedItems => {
        // Save the equipped items
        StorageManager.save(equippedItems);

        // Retrieve the raw JSON from localStorage
        const json = localStorage.getItem('racing-equipment-config-v1');
        expect(json).not.toBeNull();

        if (json) {
          const data = JSON.parse(json);

          // Verify structure
          expect(data).toHaveProperty('version');
          expect(data.version).toBe(1);
          expect(data).toHaveProperty('equipped');
          expect(typeof data.equipped).toBe('object');

          // Verify equipped data matches
          for (const [slotId, itemIds] of equippedItems.entries()) {
            expect(data.equipped[slotId]).toEqual(itemIds);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Clear removes all data
   * 
   * After calling clear(), loading should return an empty Map
   */
  test('clear removes all data', () => {
    const validSlotIds = ['helmet', 'gloves'];
    const validItemIds = ['item-1', 'item-2'];

    fc.assert(
      fc.property(equippedItemsArbitrary(validSlotIds, validItemIds), equippedItems => {
        // Skip test if equippedItems is empty (nothing to test)
        if (equippedItems.size === 0) {
          return true;
        }

        // Save some data
        StorageManager.save(equippedItems);

        // Verify data was saved
        const beforeClear = StorageManager.load(new Set(validItemIds));
        expect(beforeClear.size).toBeGreaterThan(0);

        // Clear the data
        StorageManager.clear();

        // Verify data was cleared
        const afterClear = StorageManager.load(new Set(validItemIds));
        expect(afterClear.size).toBe(0);

        // Verify localStorage key was removed
        const json = localStorage.getItem('racing-equipment-config-v1');
        expect(json).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty state round trip
   * 
   * Saving and loading an empty Map should work correctly
   */
  test('empty state round trip', () => {
    const emptyMap = new Map<string, string[]>();

    // Save empty state
    StorageManager.save(emptyMap);

    // Load empty state
    const loaded = StorageManager.load(new Set(['item-1', 'item-2']));

    // Should be empty
    expect(loaded.size).toBe(0);
  });
});
