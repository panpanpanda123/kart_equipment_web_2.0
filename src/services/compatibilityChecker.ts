/**
 * CompatibilityChecker Module
 * 
 * Provides equipment compatibility checking logic based on:
 * - item.allowedSlots constraint (empty array = no restriction)
 * - slot.allowedTypes constraint (must be non-empty array)
 * 
 * Compatibility Check Logic:
 * An item is compatible with a slot if and only if:
 * 1. (item.allowedSlots is empty OR contains slot.id) AND
 * 2. (slot.allowedTypes is non-empty AND contains item.type)
 * 
 * Note: slot.allowedTypes must be non-empty (validated at config load time)
 */

import type { EquipmentItem, SlotConfig } from '../types';

/**
 * CompatibilityChecker class
 * Static utility class for equipment compatibility checks
 */
export class CompatibilityChecker {
  /**
   * Check if an equipment item is compatible with a slot
   * 
   * @param item - The equipment item to check
   * @param slot - The slot to check compatibility with
   * @returns true if the item can be equipped to the slot, false otherwise
   * 
   * @example
   * const helmet = { id: 'h1', type: '头盔', allowedSlots: undefined, ... };
   * const helmetSlot = { id: 'helmet', allowedTypes: ['头盔'], ... };
   * CompatibilityChecker.isCompatible(helmet, helmetSlot); // true
   * 
   * @example
   * const restrictedGloves = { id: 'g1', type: '手套', allowedSlots: ['gloves'], ... };
   * const helmetSlot = { id: 'helmet', allowedTypes: ['头盔'], ... };
   * CompatibilityChecker.isCompatible(restrictedGloves, helmetSlot); // false
   */
  static isCompatible(item: EquipmentItem, slot: SlotConfig): boolean {
    // Normalize allowedSlots (undefined or null becomes empty array)
    // Empty array means no restriction - item can go to any slot (if type matches)
    const allowedSlots = item.allowedSlots ?? [];
    
    // Check allowedSlots constraint
    // If allowedSlots is empty, no restriction (slot allowed)
    // If allowedSlots is non-empty, must contain slot.id
    const slotAllowed = 
      allowedSlots.length === 0 || 
      allowedSlots.includes(slot.id);

    // Check allowedTypes constraint
    // slot.allowedTypes must be non-empty (validated at config load)
    // Must contain item.type for compatibility
    const typeAllowed = 
      slot.allowedTypes.length > 0 && 
      slot.allowedTypes.includes(item.type);

    // Both constraints must be satisfied
    return slotAllowed && typeAllowed;
  }

  /**
   * Get all compatible slots for an equipment item
   * 
   * @param item - The equipment item to find compatible slots for
   * @param slots - Array of all available slots
   * @returns Array of slots that are compatible with the item
   * 
   * @example
   * const helmet = { id: 'h1', type: '头盔', allowedSlots: undefined, ... };
   * const slots = [
   *   { id: 'helmet', allowedTypes: ['头盔'], ... },
   *   { id: 'gloves', allowedTypes: ['手套'], ... }
   * ];
   * CompatibilityChecker.getCompatibleSlots(helmet, slots);
   * // Returns: [{ id: 'helmet', allowedTypes: ['头盔'], ... }]
   */
  static getCompatibleSlots(
    item: EquipmentItem, 
    slots: SlotConfig[]
  ): SlotConfig[] {
    return slots.filter(slot => this.isCompatible(item, slot));
  }
}
