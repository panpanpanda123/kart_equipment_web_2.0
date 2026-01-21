/**
 * Unit tests for StorageManager module
 * 
 * Tests cover:
 * - Save/load/clear operations
 * - Invalid item ID filtering
 * - localStorage unavailable scenarios
 * - Data format validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager } from './storageManager';

describe('StorageManager', () => {
  // Mock localStorage
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    // Reset mock storage before each test
    mockStorage = {};

    // Mock localStorage methods
    global.localStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    } as Storage;

    // Clear console.error spy
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('save', () => {
    it('should save equipped items to localStorage in correct format', () => {
      const equippedItems = new Map<string, string[]>([
        ['helmet', ['item-1']],
        ['gloves', ['item-2', 'item-3']],
      ]);

      StorageManager.save(equippedItems);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'racing-equipment-config-v1',
        expect.any(String)
      );

      const savedData = JSON.parse(mockStorage['racing-equipment-config-v1']);
      expect(savedData).toEqual({
        version: 1,
        equipped: {
          helmet: ['item-1'],
          gloves: ['item-2', 'item-3'],
        },
      });
    });

    it('should save empty map correctly', () => {
      const equippedItems = new Map<string, string[]>();

      StorageManager.save(equippedItems);

      const savedData = JSON.parse(mockStorage['racing-equipment-config-v1']);
      expect(savedData).toEqual({
        version: 1,
        equipped: {},
      });
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock setItem to throw error
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const equippedItems = new Map<string, string[]>([['helmet', ['item-1']]]);

      // Should not throw
      expect(() => StorageManager.save(equippedItems)).not.toThrow();

      // Should log error
      expect(console.error).toHaveBeenCalledWith(
        'Failed to save to localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('load', () => {
    it('should load and return equipped items from localStorage', () => {
      // Setup saved data
      mockStorage['racing-equipment-config-v1'] = JSON.stringify({
        version: 1,
        equipped: {
          helmet: ['item-1'],
          gloves: ['item-2', 'item-3'],
        },
      });

      const validItemIds = new Set(['item-1', 'item-2', 'item-3']);
      const result = StorageManager.load(validItemIds);

      expect(result).toBeInstanceOf(Map);
      expect(result.get('helmet')).toEqual(['item-1']);
      expect(result.get('gloves')).toEqual(['item-2', 'item-3']);
    });

    it('should filter out invalid item IDs', () => {
      // Setup saved data with some invalid IDs
      mockStorage['racing-equipment-config-v1'] = JSON.stringify({
        version: 1,
        equipped: {
          helmet: ['item-1', 'invalid-item'],
          gloves: ['item-2', 'another-invalid'],
          shoes: ['all-invalid'],
        },
      });

      const validItemIds = new Set(['item-1', 'item-2']);
      const result = StorageManager.load(validItemIds);

      // Should only include valid IDs
      expect(result.get('helmet')).toEqual(['item-1']);
      expect(result.get('gloves')).toEqual(['item-2']);
      
      // Should not include slots with only invalid IDs
      expect(result.has('shoes')).toBe(false);
    });

    it('should return empty Map when no data exists', () => {
      const validItemIds = new Set(['item-1', 'item-2']);
      const result = StorageManager.load(validItemIds);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock getItem to throw error
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const validItemIds = new Set(['item-1']);

      // Should not throw
      const result = StorageManager.load(validItemIds);

      // Should return empty Map
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);

      // Should log error
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load from localStorage:',
        expect.any(Error)
      );
    });

    it('should handle malformed JSON gracefully', () => {
      // Setup invalid JSON
      mockStorage['racing-equipment-config-v1'] = 'invalid json {';

      const validItemIds = new Set(['item-1']);
      const result = StorageManager.load(validItemIds);

      // Should return empty Map
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);

      // Should log error
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should remove data from localStorage', () => {
      // Setup saved data
      mockStorage['racing-equipment-config-v1'] = JSON.stringify({
        version: 1,
        equipped: { helmet: ['item-1'] },
      });

      StorageManager.clear();

      expect(localStorage.removeItem).toHaveBeenCalledWith(
        'racing-equipment-config-v1'
      );
      expect(mockStorage['racing-equipment-config-v1']).toBeUndefined();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock removeItem to throw error
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      // Should not throw
      expect(() => StorageManager.clear()).not.toThrow();

      // Should log error
      expect(console.error).toHaveBeenCalledWith(
        'Failed to clear localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('round-trip persistence', () => {
    it('should correctly save and load the same data', () => {
      const originalData = new Map<string, string[]>([
        ['helmet', ['item-1']],
        ['gloves', ['item-2', 'item-3']],
        ['accessory-1', ['item-4', 'item-5', 'item-6']],
      ]);

      const validItemIds = new Set(['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6']);

      // Save
      StorageManager.save(originalData);

      // Load
      const loadedData = StorageManager.load(validItemIds);

      // Should match original
      expect(loadedData.size).toBe(originalData.size);
      expect(loadedData.get('helmet')).toEqual(originalData.get('helmet'));
      expect(loadedData.get('gloves')).toEqual(originalData.get('gloves'));
      expect(loadedData.get('accessory-1')).toEqual(originalData.get('accessory-1'));
    });

    it('should filter invalid IDs during round-trip', () => {
      const originalData = new Map<string, string[]>([
        ['helmet', ['item-1', 'item-2']],
        ['gloves', ['item-3']],
      ]);

      // Save with all IDs
      StorageManager.save(originalData);

      // Load with only some IDs valid
      const validItemIds = new Set(['item-1', 'item-3']);
      const loadedData = StorageManager.load(validItemIds);

      // Should only have valid IDs
      expect(loadedData.get('helmet')).toEqual(['item-1']);
      expect(loadedData.get('gloves')).toEqual(['item-3']);
    });
  });

  describe('storage format', () => {
    it('should use correct storage key', () => {
      const equippedItems = new Map<string, string[]>([['helmet', ['item-1']]]);

      StorageManager.save(equippedItems);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'racing-equipment-config-v1',
        expect.any(String)
      );
    });

    it('should include version number in saved data', () => {
      const equippedItems = new Map<string, string[]>([['helmet', ['item-1']]]);

      StorageManager.save(equippedItems);

      const savedData = JSON.parse(mockStorage['racing-equipment-config-v1']);
      expect(savedData.version).toBe(1);
    });

    it('should store equipped items as Record<string, string[]>', () => {
      const equippedItems = new Map<string, string[]>([
        ['helmet', ['item-1']],
        ['gloves', ['item-2', 'item-3']],
      ]);

      StorageManager.save(equippedItems);

      const savedData = JSON.parse(mockStorage['racing-equipment-config-v1']);
      expect(savedData.equipped).toEqual({
        helmet: ['item-1'],
        gloves: ['item-2', 'item-3'],
      });
      expect(Array.isArray(savedData.equipped.helmet)).toBe(true);
      expect(Array.isArray(savedData.equipped.gloves)).toBe(true);
    });
  });
});
