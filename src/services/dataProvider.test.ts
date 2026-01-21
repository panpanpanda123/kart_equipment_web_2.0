/**
 * Unit tests for DataProvider and LocalJsonDataProvider
 * 
 * Tests cover:
 * - Successful configuration loading
 * - Structural validation (fail-fast)
 * - Item filtering (graceful degradation)
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalJsonDataProvider } from './dataProvider';

describe('LocalJsonDataProvider', () => {
  let provider: LocalJsonDataProvider;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    provider = new LocalJsonDataProvider();
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadConfig - successful loading', () => {
    it('should load valid configuration successfully', async () => {
      const validConfig = {
        character: {
          image: '/character.png',
          name: 'Test Driver'
        },
        slots: Array.from({ length: 10 }, (_, i) => ({
          id: `slot-${i}`,
          type: `Type ${i}`,
          displayName: `Slot ${i}`,
          position: { top: '10%', left: '10%' },
          size: { width: '12%', height: '12%' },
          required: false,
          maxCount: 1,
          allowedTypes: ['type1', 'type2']
        })),
        items: Array.from({ length: 12 }, (_, i) => ({
          id: `item-${i}`,
          type: 'helmet',
          brand: 'Brand',
          model: `Model ${i}`,
          displayName: `Item ${i}`,
          icon: '/icon.png',
          image: '/image.png',
          summary: 'Test item'
        })),
        ui: {
          title: 'Test App',
          labels: {}
        },
        achievements: {}
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => validConfig
      });

      const result = await provider.loadConfig();

      expect(result).toBeDefined();
      expect(result.character.image).toBe('/character.png');
      expect(result.slots).toHaveLength(10);
      expect(result.items).toHaveLength(12);
      expect(result.ui.title).toBe('Test App');
    });

    it('should filter out invalid items and keep valid ones', async () => {
      const configWithInvalidItems = {
        character: { image: '/character.png', name: 'Test' },
        slots: Array.from({ length: 10 }, (_, i) => ({
          id: `slot-${i}`,
          type: 'Type',
          displayName: 'Slot',
          position: { top: '10%', left: '10%' },
          size: { width: '12%', height: '12%' },
          required: false,
          maxCount: 1,
          allowedTypes: ['type1']
        })),
        items: [
          // Valid item
          {
            id: 'item-1',
            type: 'helmet',
            brand: 'Brand',
            model: 'Model 1',
            displayName: 'Item 1',
            icon: '/icon.png',
            image: '/image.png',
            summary: 'Valid item'
          },
          // Invalid: missing id
          {
            type: 'helmet',
            brand: 'Brand',
            model: 'Model 2',
            displayName: 'Item 2',
            icon: '/icon.png',
            image: '/image.png',
            summary: 'Invalid item'
          },
          // Invalid: missing brand
          {
            id: 'item-3',
            type: 'helmet',
            model: 'Model 3',
            displayName: 'Item 3',
            icon: '/icon.png',
            image: '/image.png',
            summary: 'Invalid item'
          },
          // Valid item
          {
            id: 'item-4',
            type: 'gloves',
            brand: 'Brand',
            model: 'Model 4',
            displayName: 'Item 4',
            icon: '/icon.png',
            image: '/image.png',
            summary: 'Valid item'
          }
        ],
        ui: { title: 'Test', labels: {} },
        achievements: {}
      };

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => configWithInvalidItems
      });

      const result = await provider.loadConfig();

      // Should keep only valid items
      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe('item-1');
      expect(result.items[1].id).toBe('item-4');

      // Should warn about filtered items
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('should warn when fewer than 12 valid items remain', async () => {
      const configWithFewItems = {
        character: { image: '/character.png', name: 'Test' },
        slots: Array.from({ length: 10 }, (_, i) => ({
          id: `slot-${i}`,
          type: 'Type',
          displayName: 'Slot',
          position: { top: '10%', left: '10%' },
          size: { width: '12%', height: '12%' },
          required: false,
          maxCount: 1,
          allowedTypes: ['type1']
        })),
        items: Array.from({ length: 8 }, (_, i) => ({
          id: `item-${i}`,
          type: 'helmet',
          brand: 'Brand',
          model: `Model ${i}`,
          displayName: `Item ${i}`,
          icon: '/icon.png',
          image: '/image.png',
          summary: 'Test item'
        })),
        ui: { title: 'Test', labels: {} },
        achievements: {}
      };

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => configWithFewItems
      });

      const result = await provider.loadConfig();

      expect(result.items).toHaveLength(8);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Only 8 valid items found (recommended: >= 12)')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('loadConfig - structural validation errors', () => {
    it('should throw error if character is missing', async () => {
      const invalidConfig = {
        slots: Array.from({ length: 10 }, () => ({
          id: 'slot',
          allowedTypes: ['type1']
        })),
        items: [],
        ui: { title: 'Test', labels: {} }
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => invalidConfig
      });

      await expect(provider.loadConfig()).rejects.toThrow(
        'character section is missing or invalid'
      );
    });

    it('should throw error if character.image is missing', async () => {
      const invalidConfig = {
        character: { name: 'Test' },
        slots: Array.from({ length: 10 }, () => ({
          id: 'slot',
          allowedTypes: ['type1']
        })),
        items: [],
        ui: { title: 'Test', labels: {} }
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => invalidConfig
      });

      await expect(provider.loadConfig()).rejects.toThrow(
        'character.image is missing or invalid'
      );
    });

    it('should throw error if slots is not an array', async () => {
      const invalidConfig = {
        character: { image: '/character.png', name: 'Test' },
        slots: 'not an array',
        items: [],
        ui: { title: 'Test', labels: {} }
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => invalidConfig
      });

      await expect(provider.loadConfig()).rejects.toThrow(
        'slots must be an array'
      );
    });

    it('should throw error if slots count is not exactly 10', async () => {
      const invalidConfig = {
        character: { image: '/character.png', name: 'Test' },
        slots: Array.from({ length: 8 }, () => ({
          id: 'slot',
          allowedTypes: ['type1']
        })),
        items: [],
        ui: { title: 'Test', labels: {} }
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => invalidConfig
      });

      await expect(provider.loadConfig()).rejects.toThrow(
        'must contain exactly 10 slots, found 8'
      );
    });

    it('should throw error if slot has empty allowedTypes', async () => {
      const invalidConfig = {
        character: { image: '/character.png', name: 'Test' },
        slots: [
          ...Array.from({ length: 9 }, (_, i) => ({
            id: `slot-${i}`,
            allowedTypes: ['type1']
          })),
          {
            id: 'slot-9',
            allowedTypes: [] // Empty array
          }
        ],
        items: [],
        ui: { title: 'Test', labels: {} }
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => invalidConfig
      });

      await expect(provider.loadConfig()).rejects.toThrow(
        'slot "slot-9" has empty allowedTypes array'
      );
    });

    it('should throw error if slot has invalid allowedTypes', async () => {
      const invalidConfig = {
        character: { image: '/character.png', name: 'Test' },
        slots: [
          ...Array.from({ length: 9 }, (_, i) => ({
            id: `slot-${i}`,
            allowedTypes: ['type1']
          })),
          {
            id: 'slot-9',
            allowedTypes: 'not an array' // Invalid type
          }
        ],
        items: [],
        ui: { title: 'Test', labels: {} }
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => invalidConfig
      });

      await expect(provider.loadConfig()).rejects.toThrow(
        'slot "slot-9" has invalid allowedTypes'
      );
    });

    it('should throw error if ui is missing', async () => {
      const invalidConfig = {
        character: { image: '/character.png', name: 'Test' },
        slots: Array.from({ length: 10 }, () => ({
          id: 'slot',
          allowedTypes: ['type1']
        })),
        items: []
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => invalidConfig
      });

      await expect(provider.loadConfig()).rejects.toThrow(
        'ui section is missing or invalid'
      );
    });
  });

  describe('loadConfig - fetch errors', () => {
    it('should throw error if fetch fails', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(provider.loadConfig()).rejects.toThrow(
        'Failed to load config: 404 Not Found'
      );
    });

    it('should throw error if fetch throws', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      await expect(provider.loadConfig()).rejects.toThrow(
        'Configuration loading failed: Network error'
      );
    });

    it('should handle non-Error exceptions', async () => {
      fetchMock.mockRejectedValue('String error');

      await expect(provider.loadConfig()).rejects.toThrow(
        'Configuration loading failed: Unknown error'
      );
    });
  });

  describe('filterValidItems - edge cases', () => {
    it('should handle non-array items gracefully', async () => {
      const configWithInvalidItems = {
        character: { image: '/character.png', name: 'Test' },
        slots: Array.from({ length: 10 }, () => ({
          id: 'slot',
          allowedTypes: ['type1']
        })),
        items: 'not an array',
        ui: { title: 'Test', labels: {} },
        achievements: {}
      };

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => configWithInvalidItems
      });

      const result = await provider.loadConfig();

      expect(result.items).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Items is not an array, using empty array'
      );

      consoleWarnSpy.mockRestore();
    });

    it('should filter items with empty string fields', async () => {
      const configWithEmptyFields = {
        character: { image: '/character.png', name: 'Test' },
        slots: Array.from({ length: 10 }, () => ({
          id: 'slot',
          allowedTypes: ['type1']
        })),
        items: [
          {
            id: '',  // Empty string
            type: 'helmet',
            brand: 'Brand',
            model: 'Model',
            displayName: 'Item',
            icon: '/icon.png',
            image: '/image.png',
            summary: 'Test'
          },
          {
            id: 'valid-item',
            type: 'helmet',
            brand: 'Brand',
            model: 'Model',
            displayName: 'Item',
            icon: '/icon.png',
            image: '/image.png',
            summary: 'Test'
          }
        ],
        ui: { title: 'Test', labels: {} },
        achievements: {}
      };

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => configWithEmptyFields
      });

      const result = await provider.loadConfig();

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('valid-item');

      consoleWarnSpy.mockRestore();
    });
  });
});
