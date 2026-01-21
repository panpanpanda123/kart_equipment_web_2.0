/**
 * StorageManager Module
 * 
 * Handles localStorage persistence for equipment configuration state.
 * Provides graceful degradation when localStorage is unavailable.
 * 
 * Storage Format:
 * {
 *   "version": 1,
 *   "equipped": {
 *     "slotId": ["itemId1", "itemId2"],
 *     ...
 *   }
 * }
 * 
 * Requirements: 9.1-9.6
 */

const STORAGE_KEY = 'racing-equipment-config-v1';

/**
 * Storage data structure
 */
interface StorageData {
  version: number;
  equipped: Record<string, string[]>; // slotId -> itemId[]
}

/**
 * StorageManager class
 * Manages localStorage operations with error handling
 */
export class StorageManager {
  /**
   * Save equipped items to localStorage
   * 
   * @param equippedItems - Map of slot IDs to arrays of equipped item IDs
   * 
   * Requirement 9.1: Save immediately when items are equipped/unequipped
   * Requirement 9.5: Graceful degradation on localStorage errors
   * Requirement 9.6: JSON format with version and equipped data
   */
  static save(equippedItems: Map<string, string[]>): void {
    try {
      const data: StorageData = {
        version: 1,
        equipped: Object.fromEntries(equippedItems)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      // Continue without persistence - graceful degradation
    }
  }

  /**
   * Load equipped items from localStorage
   * 
   * @param validItemIds - Set of valid item IDs from current configuration
   * @returns Map of slot IDs to arrays of equipped item IDs (filtered for validity)
   * 
   * Requirement 9.2: Restore saved configuration on application load
   * Requirement 9.3: Validate item IDs and filter invalid entries
   * Requirement 9.5: Graceful degradation on localStorage errors
   */
  static load(validItemIds: Set<string>): Map<string, string[]> {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) {
        return new Map();
      }

      const data: StorageData = JSON.parse(json);
      const equipped = new Map<string, string[]>();

      // Validate and filter invalid item IDs
      for (const [slotId, itemIds] of Object.entries(data.equipped)) {
        const validIds = itemIds.filter(id => validItemIds.has(id));
        if (validIds.length > 0) {
          equipped.set(slotId, validIds);
        }
      }

      return equipped;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return new Map();
    }
  }

  /**
   * Clear all saved data from localStorage
   * 
   * Requirement 9.4: Remove localStorage key when user clicks reset
   * Requirement 9.5: Graceful degradation on localStorage errors
   */
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      // Continue without persistence - graceful degradation
    }
  }
}
