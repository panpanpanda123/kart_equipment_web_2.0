/**
 * Property-Based Tests for DataProvider
 * 
 * Feature: racing-equipment-config
 * 
 * This test suite uses property-based testing to verify the correctness
 * of configuration loading and validation across a wide range of inputs.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { LocalJsonDataProvider } from './dataProvider';
import { validConfigArbitrary } from './test-utils/arbitraries';
import type { ConfigData } from '../types';

describe('DataProvider - Property-Based Tests', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  /**
   * Property 28: Configuration Structure Completeness
   * 
   * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**
   * 
   * For any configuration loaded by Data_Provider, it SHALL contain all
   * required sections:
   * - character (with image)
   * - slots (array of exactly 10)
   * - items (array, minimum 12 recommended but not enforced after filtering)
   * - ui (with title and labels)
   * - achievements
   * 
   * Note: If items array has fewer than 12 items after filtering invalid
   * entries, a warning is logged but the system continues to operate.
   */
  test('Property 28: Configuration Structure Completeness', async () => {
    await fc.assert(
      fc.asyncProperty(validConfigArbitrary, async config => {
        // Mock fetch to return the generated config
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => config
        } as Response);

        const provider = new LocalJsonDataProvider();
        const loaded = await provider.loadConfig();

        // Verify all required sections exist
        expect(loaded).toHaveProperty('character');
        expect(loaded).toHaveProperty('slots');
        expect(loaded).toHaveProperty('items');
        expect(loaded).toHaveProperty('ui');
        expect(loaded).toHaveProperty('achievements');

        // Verify character section
        expect(loaded.character).toHaveProperty('image');
        expect(typeof loaded.character.image).toBe('string');
        expect(loaded.character.image.length).toBeGreaterThan(0);

        // Verify slots section - must be exactly 10
        expect(Array.isArray(loaded.slots)).toBe(true);
        expect(loaded.slots.length).toBe(10);

        // Verify each slot has required properties
        for (const slot of loaded.slots) {
          expect(slot).toHaveProperty('id');
          expect(slot).toHaveProperty('type');
          expect(slot).toHaveProperty('displayName');
          expect(slot).toHaveProperty('position');
          expect(slot).toHaveProperty('size');
          expect(slot).toHaveProperty('required');
          expect(slot).toHaveProperty('maxCount');
          expect(slot).toHaveProperty('allowedTypes');

          // Critical: allowedTypes must be non-empty
          expect(Array.isArray(slot.allowedTypes)).toBe(true);
          expect(slot.allowedTypes.length).toBeGreaterThan(0);
        }

        // Verify items section
        expect(Array.isArray(loaded.items)).toBe(true);
        // Note: We don't enforce >= 12 items as a hard requirement
        // The system logs a warning if < 12 but continues to operate

        // Verify each item has required fields
        for (const item of loaded.items) {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('type');
          expect(item).toHaveProperty('brand');
          expect(item).toHaveProperty('model');
          expect(item).toHaveProperty('displayName');
          expect(item).toHaveProperty('icon');
          expect(item).toHaveProperty('image');
          expect(item).toHaveProperty('summary');

          // All required fields must be non-empty strings
          expect(typeof item.id).toBe('string');
          expect(item.id.length).toBeGreaterThan(0);
          expect(typeof item.type).toBe('string');
          expect(item.type.length).toBeGreaterThan(0);
          expect(typeof item.brand).toBe('string');
          expect(item.brand.length).toBeGreaterThan(0);
          expect(typeof item.model).toBe('string');
          expect(item.model.length).toBeGreaterThan(0);
          expect(typeof item.displayName).toBe('string');
          expect(item.displayName.length).toBeGreaterThan(0);
          expect(typeof item.icon).toBe('string');
          expect(item.icon.length).toBeGreaterThan(0);
          expect(typeof item.image).toBe('string');
          expect(item.image.length).toBeGreaterThan(0);
          expect(typeof item.summary).toBe('string');
          expect(item.summary.length).toBeGreaterThan(0);
        }

        // Verify ui section
        expect(loaded.ui).toHaveProperty('title');
        expect(loaded.ui).toHaveProperty('labels');
        expect(typeof loaded.ui.title).toBe('string');
        expect(typeof loaded.ui.labels).toBe('object');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid structural data causes error
   * 
   * Configurations with invalid structural data (missing character,
   * wrong slot count, empty allowedTypes, missing ui) should throw errors.
   */
  test('invalid structural data causes error', async () => {
    const invalidConfigs = [
      // Missing character
      {
        slots: Array(10).fill({ id: 'test', allowedTypes: ['头盔'] }),
        items: [],
        ui: { title: 'Test', labels: {} },
        achievements: {}
      },
      // Missing character.image
      {
        character: { name: 'Test' },
        slots: Array(10).fill({ id: 'test', allowedTypes: ['头盔'] }),
        items: [],
        ui: { title: 'Test', labels: {} },
        achievements: {}
      },
      // Wrong slot count (9 instead of 10)
      {
        character: { image: '/test.png', name: 'Test' },
        slots: Array(9).fill({ id: 'test', allowedTypes: ['头盔'] }),
        items: [],
        ui: { title: 'Test', labels: {} },
        achievements: {}
      },
      // Wrong slot count (11 instead of 10)
      {
        character: { image: '/test.png', name: 'Test' },
        slots: Array(11).fill({ id: 'test', allowedTypes: ['头盔'] }),
        items: [],
        ui: { title: 'Test', labels: {} },
        achievements: {}
      },
      // Empty allowedTypes in slot
      {
        character: { image: '/test.png', name: 'Test' },
        slots: Array(10).fill({ id: 'test', allowedTypes: [] }),
        items: [],
        ui: { title: 'Test', labels: {} },
        achievements: {}
      },
      // Missing ui
      {
        character: { image: '/test.png', name: 'Test' },
        slots: Array(10).fill({ id: 'test', allowedTypes: ['头盔'] }),
        items: [],
        achievements: {}
      }
    ];

    for (const invalidConfig of invalidConfigs) {
      // Mock fetch to return invalid config
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => invalidConfig
      } as Response);

      const provider = new LocalJsonDataProvider();

      // Should throw error
      await expect(provider.loadConfig()).rejects.toThrow();
    }
  });

  /**
   * Property: Invalid items are filtered, not rejected
   * 
   * Configurations with some invalid items should filter them out
   * and continue with valid items (graceful degradation).
   */
  test('invalid items are filtered, not rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        validConfigArbitrary,
        fc.array(
          fc.record({
            id: fc.option(fc.string(), { nil: undefined }),
            type: fc.option(fc.string(), { nil: undefined }),
            brand: fc.option(fc.string(), { nil: undefined })
            // Missing other required fields
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (validConfig, invalidItems) => {
          // Mix valid and invalid items
          const mixedConfig = {
            ...validConfig,
            items: [...validConfig.items, ...invalidItems]
          };

          // Mock fetch to return mixed config
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => mixedConfig
          } as Response);

          const provider = new LocalJsonDataProvider();
          const loaded = await provider.loadConfig();

          // Should not throw - invalid items are filtered
          expect(loaded).toBeDefined();
          expect(Array.isArray(loaded.items)).toBe(true);

          // All loaded items should be valid
          for (const item of loaded.items) {
            expect(item.id).toBeDefined();
            expect(item.type).toBeDefined();
            expect(item.brand).toBeDefined();
            expect(item.model).toBeDefined();
            expect(item.displayName).toBeDefined();
            expect(item.icon).toBeDefined();
            expect(item.image).toBeDefined();
            expect(item.summary).toBeDefined();
          }

          // Should have at least the valid items from validConfig
          expect(loaded.items.length).toBeGreaterThanOrEqual(validConfig.items.length);
        }
      ),
      { numRuns: 50 } // Fewer runs for this more complex test
    );
  });

  /**
   * Property: Fetch errors are properly handled
   * 
   * **Validates: Requirements 11.6**
   * 
   * When Data_Provider encounters loading errors, it SHALL reject
   * the Promise with a descriptive error message.
   */
  test('Property 29: Data Provider Error Handling', async () => {
    const errorScenarios = [
      { ok: false, status: 404, statusText: 'Not Found' },
      { ok: false, status: 500, statusText: 'Internal Server Error' },
      { ok: false, status: 403, statusText: 'Forbidden' }
    ];

    for (const scenario of errorScenarios) {
      // Mock fetch to return error
      global.fetch = vi.fn().mockResolvedValue({
        ok: scenario.ok,
        status: scenario.status,
        statusText: scenario.statusText,
        json: async () => ({})
      } as Response);

      const provider = new LocalJsonDataProvider();

      // Should reject with descriptive error
      await expect(provider.loadConfig()).rejects.toThrow(/Configuration loading failed/);
    }
  });

  /**
   * Property: Network errors are properly handled
   */
  test('network errors are properly handled', async () => {
    // Mock fetch to throw network error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const provider = new LocalJsonDataProvider();

    // Should reject with descriptive error
    await expect(provider.loadConfig()).rejects.toThrow(/Configuration loading failed/);
  });

  /**
   * Property: Malformed JSON is properly handled
   */
  test('malformed JSON is properly handled', async () => {
    // Mock fetch to return invalid JSON
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => {
        throw new Error('Invalid JSON');
      }
    } as Response);

    const provider = new LocalJsonDataProvider();

    // Should reject with descriptive error
    await expect(provider.loadConfig()).rejects.toThrow(/Configuration loading failed/);
  });
});
