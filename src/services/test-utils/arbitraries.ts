/**
 * Test Data Generators (Arbitraries) for Property-Based Testing
 * 
 * This module provides fast-check arbitraries for generating test data
 * for property-based tests. These generators create random but valid
 * instances of domain objects.
 */

import * as fc from 'fast-check';
import type { SlotConfig, EquipmentItem, ConfigData } from '../../types';

/**
 * Arbitrary for generating valid SlotConfig objects
 * 
 * Generates slots with:
 * - Valid slot IDs from the 10 standard slots
 * - Valid equipment types
 * - Percentage-based positions (0-100%)
 * - Percentage-based sizes (8-20%)
 * - Random required flag
 * - maxCount between 1-4
 * - Non-empty allowedTypes array (critical constraint)
 */
export const slotConfigArbitrary: fc.Arbitrary<SlotConfig> = fc.record({
  id: fc.constantFrom(
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
  ),
  type: fc.constantFrom('头盔', '头套', '手套', '赛车服', '护肋', '赛车鞋', '饰品'),
  displayName: fc.string({ minLength: 1, maxLength: 20 }),
  position: fc.record({
    top: fc.integer({ min: 0, max: 100 }).map(n => `${n}%`),
    left: fc.integer({ min: 0, max: 100 }).map(n => `${n}%`)
  }),
  size: fc.record({
    width: fc.integer({ min: 8, max: 20 }).map(n => `${n}%`),
    height: fc.integer({ min: 8, max: 20 }).map(n => `${n}%`)
  }),
  required: fc.boolean(),
  maxCount: fc.integer({ min: 1, max: 4 }),
  // Critical: allowedTypes must be non-empty
  allowedTypes: fc.array(
    fc.constantFrom('头盔', '头套', '手套', '赛车服', '护肋', '赛车鞋', '饰品'),
    { minLength: 1, maxLength: 7 }
  )
});

/**
 * Arbitrary for generating valid EquipmentItem objects
 * 
 * Generates items with:
 * - UUID for id
 * - Valid equipment types
 * - Required string fields
 * - Optional specs (weight, vents, certs)
 * - Optional allowedSlots (empty array = no restriction)
 */
export const equipmentItemArbitrary: fc.Arbitrary<EquipmentItem> = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('头盔', '头套', '手套', '赛车服', '护肋', '赛车鞋', '饰品'),
  brand: fc.string({ minLength: 1, maxLength: 30 }),
  model: fc.string({ minLength: 1, maxLength: 30 }),
  displayName: fc.string({ minLength: 1, maxLength: 50 }),
  icon: fc.constant('/icons/placeholder.png'),
  image: fc.constant('/images/placeholder.png'),
  summary: fc.string({ minLength: 1, maxLength: 200 }),
  specs: fc.option(
    fc.record({
      weight_g: fc.option(fc.integer({ min: 100, max: 2000 })),
      vents: fc.option(fc.integer({ min: 0, max: 20 })),
      certs: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 }))
    }),
    { nil: undefined }
  ),
  tags: fc.option(
    fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
    { nil: undefined }
  ),
  aliases: fc.option(
    fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 }),
    { nil: undefined }
  ),
  allowedSlots: fc.option(
    fc.array(
      fc.constantFrom(
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
      ),
      { maxLength: 10 }
    ),
    { nil: undefined }
  )
});

/**
 * Generate the standard 10 slots with proper configuration
 * This ensures we always have exactly 10 slots with correct IDs
 */
const generateStandard10Slots = (): SlotConfig[] => [
  {
    id: 'helmet',
    type: '头盔',
    displayName: '头盔槽',
    position: { top: '15%', left: '20%' },
    size: { width: '12%', height: '12%' },
    required: true,
    maxCount: 1,
    allowedTypes: ['头盔']
  },
  {
    id: 'balaclava',
    type: '头套',
    displayName: '头套槽',
    position: { top: '18%', left: '22%' },
    size: { width: '10%', height: '10%' },
    required: false,
    maxCount: 1,
    allowedTypes: ['头套']
  },
  {
    id: 'gloves',
    type: '手套',
    displayName: '手套槽',
    position: { top: '45%', left: '10%' },
    size: { width: '12%', height: '12%' },
    required: false,
    maxCount: 1,
    allowedTypes: ['手套']
  },
  {
    id: 'suit',
    type: '赛车服',
    displayName: '赛车服槽',
    position: { top: '35%', left: '25%' },
    size: { width: '15%', height: '15%' },
    required: false,
    maxCount: 1,
    allowedTypes: ['赛车服']
  },
  {
    id: 'rib-protector',
    type: '护肋',
    displayName: '护肋槽',
    position: { top: '38%', left: '28%' },
    size: { width: '12%', height: '12%' },
    required: true,
    maxCount: 1,
    allowedTypes: ['护肋']
  },
  {
    id: 'shoes',
    type: '赛车鞋',
    displayName: '赛车鞋槽',
    position: { top: '70%', left: '20%' },
    size: { width: '12%', height: '12%' },
    required: false,
    maxCount: 1,
    allowedTypes: ['赛车鞋']
  },
  {
    id: 'accessory-1',
    type: '饰品',
    displayName: '饰品槽1',
    position: { top: '20%', left: '70%' },
    size: { width: '10%', height: '10%' },
    required: false,
    maxCount: 2,
    allowedTypes: ['饰品']
  },
  {
    id: 'accessory-2',
    type: '饰品',
    displayName: '饰品槽2',
    position: { top: '35%', left: '70%' },
    size: { width: '10%', height: '10%' },
    required: false,
    maxCount: 2,
    allowedTypes: ['饰品']
  },
  {
    id: 'accessory-3',
    type: '饰品',
    displayName: '饰品槽3',
    position: { top: '50%', left: '70%' },
    size: { width: '10%', height: '10%' },
    required: false,
    maxCount: 2,
    allowedTypes: ['饰品']
  },
  {
    id: 'accessory-4',
    type: '饰品',
    displayName: '饰品槽4',
    position: { top: '65%', left: '70%' },
    size: { width: '10%', height: '10%' },
    required: false,
    maxCount: 2,
    allowedTypes: ['饰品']
  }
];

/**
 * Arbitrary for generating valid complete configuration
 * 
 * Generates configurations with:
 * - Valid character section
 * - Exactly 10 slots (using standard slot configuration)
 * - At least 12 items (recommended minimum)
 * - Valid ui section
 * - Empty achievements object
 */
export const validConfigArbitrary: fc.Arbitrary<ConfigData> = fc.record({
  character: fc.record({
    image: fc.constant('/character.png'),
    name: fc.string({ minLength: 1, maxLength: 50 })
  }),
  slots: fc.constant(generateStandard10Slots()),
  items: fc.array(equipmentItemArbitrary, { minLength: 12, maxLength: 50 }),
  ui: fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    labels: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.string({ minLength: 1, maxLength: 50 })
    )
  }),
  achievements: fc.constant({})
});

/**
 * Arbitrary for generating equipped items state
 * 
 * Generates a Map of slot IDs to arrays of item IDs
 * Useful for testing persistence round-trip
 */
export const equippedItemsArbitrary = (
  validSlotIds: string[],
  validItemIds: string[]
): fc.Arbitrary<Map<string, string[]>> => {
  return fc
    .array(
      fc.record({
        slotId: fc.constantFrom(...validSlotIds),
        itemIds: fc.array(fc.constantFrom(...validItemIds), { minLength: 1, maxLength: 3 })
      }),
      { maxLength: validSlotIds.length }
    )
    .map(entries => {
      const map = new Map<string, string[]>();
      for (const entry of entries) {
        map.set(entry.slotId, entry.itemIds);
      }
      return map;
    });
};
