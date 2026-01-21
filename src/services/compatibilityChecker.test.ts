/**
 * Manual tests for CompatibilityChecker
 * These tests verify the core compatibility logic
 */

import { describe, it, expect } from 'vitest';
import { CompatibilityChecker } from './compatibilityChecker';
import type { EquipmentItem, SlotConfig } from '../types';

describe('CompatibilityChecker', () => {
  // Test fixtures
  const helmetSlot: SlotConfig = {
    id: 'helmet',
    type: '头盔',
    displayName: '头盔槽',
    position: { top: '10%', left: '20%' },
    size: { width: '12%', height: '12%' },
    required: true,
    maxCount: 1,
    allowedTypes: ['头盔']
  };

  const glovesSlot: SlotConfig = {
    id: 'gloves',
    type: '手套',
    displayName: '手套槽',
    position: { top: '30%', left: '40%' },
    size: { width: '10%', height: '10%' },
    required: false,
    maxCount: 1,
    allowedTypes: ['手套']
  };

  const accessorySlot: SlotConfig = {
    id: 'accessory-1',
    type: '饰品',
    displayName: '饰品槽1',
    position: { top: '50%', left: '60%' },
    size: { width: '8%', height: '8%' },
    required: false,
    maxCount: 3,
    allowedTypes: ['饰品', '手套'] // Allows multiple types
  };

  const helmetItem: EquipmentItem = {
    id: 'helmet-1',
    type: '头盔',
    brand: 'Brand A',
    model: 'Model X',
    displayName: 'Helmet X',
    icon: '/icons/helmet.png',
    image: '/images/helmet.png',
    summary: 'A great helmet',
    allowedSlots: undefined // No restriction
  };

  const restrictedGlovesItem: EquipmentItem = {
    id: 'gloves-1',
    type: '手套',
    brand: 'Brand B',
    model: 'Model Y',
    displayName: 'Gloves Y',
    icon: '/icons/gloves.png',
    image: '/images/gloves.png',
    summary: 'Special gloves',
    allowedSlots: ['gloves'] // Only allowed in gloves slot
  };

  const unrestrictedAccessoryItem: EquipmentItem = {
    id: 'accessory-1',
    type: '饰品',
    brand: 'Brand C',
    model: 'Model Z',
    displayName: 'Accessory Z',
    icon: '/icons/accessory.png',
    image: '/images/accessory.png',
    summary: 'A nice accessory',
    allowedSlots: [] // Empty array = no restriction
  };

  describe('isCompatible', () => {
    it('should return true when item type matches slot allowedTypes and no allowedSlots restriction', () => {
      // Helmet item (no allowedSlots restriction) should be compatible with helmet slot
      expect(CompatibilityChecker.isCompatible(helmetItem, helmetSlot)).toBe(true);
    });

    it('should return false when item type does not match slot allowedTypes', () => {
      // Helmet item should not be compatible with gloves slot (wrong type)
      expect(CompatibilityChecker.isCompatible(helmetItem, glovesSlot)).toBe(false);
    });

    it('should return true when item has specific allowedSlots and slot is in the list', () => {
      // Restricted gloves should be compatible with gloves slot
      expect(CompatibilityChecker.isCompatible(restrictedGlovesItem, glovesSlot)).toBe(true);
    });

    it('should return false when item has specific allowedSlots and slot is not in the list', () => {
      // Restricted gloves should not be compatible with accessory slot (not in allowedSlots)
      expect(CompatibilityChecker.isCompatible(restrictedGlovesItem, accessorySlot)).toBe(false);
    });

    it('should return true when item has empty allowedSlots array (no restriction)', () => {
      // Unrestricted accessory should be compatible with accessory slot
      expect(CompatibilityChecker.isCompatible(unrestrictedAccessoryItem, accessorySlot)).toBe(true);
    });

    it('should handle slot with multiple allowedTypes', () => {
      // Accessory slot allows both '饰品' and '手套'
      const glovesForAccessory: EquipmentItem = {
        ...restrictedGlovesItem,
        allowedSlots: undefined // No restriction
      };
      expect(CompatibilityChecker.isCompatible(glovesForAccessory, accessorySlot)).toBe(true);
      expect(CompatibilityChecker.isCompatible(unrestrictedAccessoryItem, accessorySlot)).toBe(true);
    });

    it('should normalize undefined allowedSlots to empty array', () => {
      // Item with undefined allowedSlots should behave like empty array (no restriction)
      const itemWithUndefined: EquipmentItem = {
        ...helmetItem,
        allowedSlots: undefined
      };
      expect(CompatibilityChecker.isCompatible(itemWithUndefined, helmetSlot)).toBe(true);
    });

    it('should return false when slot allowedTypes is empty (invalid config)', () => {
      // This should not happen in practice (validated at config load)
      // But the logic should handle it gracefully
      const invalidSlot: SlotConfig = {
        ...helmetSlot,
        allowedTypes: []
      };
      expect(CompatibilityChecker.isCompatible(helmetItem, invalidSlot)).toBe(false);
    });
  });

  describe('getCompatibleSlots', () => {
    const allSlots = [helmetSlot, glovesSlot, accessorySlot];

    it('should return all slots that match item type when no allowedSlots restriction', () => {
      // Helmet item should only be compatible with helmet slot
      const compatibleSlots = CompatibilityChecker.getCompatibleSlots(helmetItem, allSlots);
      expect(compatibleSlots).toHaveLength(1);
      expect(compatibleSlots[0].id).toBe('helmet');
    });

    it('should return only slots in allowedSlots list that also match type', () => {
      // Restricted gloves should only be compatible with gloves slot
      const compatibleSlots = CompatibilityChecker.getCompatibleSlots(restrictedGlovesItem, allSlots);
      expect(compatibleSlots).toHaveLength(1);
      expect(compatibleSlots[0].id).toBe('gloves');
    });

    it('should return all type-matching slots when allowedSlots is empty', () => {
      // Unrestricted accessory should be compatible with accessory slot
      const compatibleSlots = CompatibilityChecker.getCompatibleSlots(unrestrictedAccessoryItem, allSlots);
      expect(compatibleSlots).toHaveLength(1);
      expect(compatibleSlots[0].id).toBe('accessory-1');
    });

    it('should return empty array when no slots are compatible', () => {
      // Create an item with a type that no slot accepts
      const incompatibleItem: EquipmentItem = {
        ...helmetItem,
        type: '不存在的类型'
      };
      const compatibleSlots = CompatibilityChecker.getCompatibleSlots(incompatibleItem, allSlots);
      expect(compatibleSlots).toHaveLength(0);
    });

    it('should handle item that can go to multiple slots', () => {
      // Gloves can go to both gloves slot and accessory slot (which allows 手套)
      const flexibleGloves: EquipmentItem = {
        ...restrictedGlovesItem,
        allowedSlots: undefined // No restriction
      };
      const compatibleSlots = CompatibilityChecker.getCompatibleSlots(flexibleGloves, allSlots);
      expect(compatibleSlots).toHaveLength(2);
      expect(compatibleSlots.map(s => s.id).sort()).toEqual(['accessory-1', 'gloves']);
    });
  });
});
