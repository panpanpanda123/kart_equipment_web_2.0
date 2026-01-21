/**
 * Property-Based Tests for CompatibilityChecker
 * 
 * Feature: racing-equipment-config
 * 
 * This test suite uses property-based testing to verify the correctness
 * of the compatibility checking logic across a wide range of inputs.
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { CompatibilityChecker } from './compatibilityChecker';
import { equipmentItemArbitrary, slotConfigArbitrary } from './test-utils/arbitraries';

describe('CompatibilityChecker - Property-Based Tests', () => {
  /**
   * Property 8: Compatibility Check Correctness
   * 
   * **Validates: Requirements 6.2, 6.3**
   * 
   * For any equipment item and slot pair, the compatibility check SHALL return true
   * if and only if:
   * 1. (item.allowedSlots is empty OR contains slot.id) AND
   * 2. (slot.allowedTypes is non-empty AND contains item.type)
   * 
   * This property verifies that the compatibility logic correctly implements
   * the specification across all possible combinations of items and slots.
   */
  test('Property 8: Compatibility Check Correctness', () => {
    fc.assert(
      fc.property(
        equipmentItemArbitrary,
        slotConfigArbitrary,
        (item, slot) => {
          // Execute the compatibility check
          const result = CompatibilityChecker.isCompatible(item, slot);

          // Calculate expected result based on specification
          // Normalize allowedSlots (undefined/null becomes empty array)
          const allowedSlots = item.allowedSlots ?? [];

          // Check allowedSlots constraint
          // Empty array means no restriction (slot allowed)
          const slotAllowed =
            allowedSlots.length === 0 || allowedSlots.includes(slot.id);

          // Check allowedTypes constraint
          // slot.allowedTypes must be non-empty (guaranteed by generator)
          // Must contain item.type for compatibility
          const typeAllowed =
            slot.allowedTypes.length > 0 && slot.allowedTypes.includes(item.type);

          // Expected result: both constraints must be satisfied
          const expected = slotAllowed && typeAllowed;

          // Verify the implementation matches the specification
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: getCompatibleSlots returns only compatible slots
   * 
   * This property verifies that getCompatibleSlots correctly filters
   * the slot array to include only compatible slots.
   */
  test('getCompatibleSlots returns only compatible slots', () => {
    fc.assert(
      fc.property(
        equipmentItemArbitrary,
        fc.array(slotConfigArbitrary, { minLength: 1, maxLength: 10 }),
        (item, slots) => {
          const compatibleSlots = CompatibilityChecker.getCompatibleSlots(item, slots);

          // Every returned slot must be compatible
          for (const slot of compatibleSlots) {
            expect(CompatibilityChecker.isCompatible(item, slot)).toBe(true);
          }

          // Count compatible slots in input (handling duplicates)
          const compatibleCount = slots.filter(slot => 
            CompatibilityChecker.isCompatible(item, slot)
          ).length;
          
          // Result should have same number of compatible slots
          expect(compatibleSlots.length).toBe(compatibleCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Compatibility is deterministic
   * 
   * Calling isCompatible multiple times with the same inputs
   * should always return the same result.
   */
  test('compatibility check is deterministic', () => {
    fc.assert(
      fc.property(equipmentItemArbitrary, slotConfigArbitrary, (item, slot) => {
        const result1 = CompatibilityChecker.isCompatible(item, slot);
        const result2 = CompatibilityChecker.isCompatible(item, slot);
        const result3 = CompatibilityChecker.isCompatible(item, slot);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      }),
      { numRuns: 100 }
    );
  });
});
