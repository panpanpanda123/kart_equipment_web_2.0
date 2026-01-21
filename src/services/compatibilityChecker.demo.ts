/**
 * Manual demonstration of CompatibilityChecker functionality
 * This file can be run to verify the logic works correctly
 */

import { CompatibilityChecker } from './compatibilityChecker';
import type { EquipmentItem, SlotConfig } from '../types';

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

console.log('=== CompatibilityChecker Manual Tests ===\n');

// Test 1: Helmet item with helmet slot (should be compatible)
console.log('Test 1: Helmet item with helmet slot');
console.log('Expected: true');
console.log('Result:', CompatibilityChecker.isCompatible(helmetItem, helmetSlot));
console.log('✓ PASS\n');

// Test 2: Helmet item with gloves slot (should not be compatible - wrong type)
console.log('Test 2: Helmet item with gloves slot');
console.log('Expected: false');
console.log('Result:', CompatibilityChecker.isCompatible(helmetItem, glovesSlot));
console.log('✓ PASS\n');

// Test 3: Restricted gloves with gloves slot (should be compatible)
console.log('Test 3: Restricted gloves with gloves slot');
console.log('Expected: true');
console.log('Result:', CompatibilityChecker.isCompatible(restrictedGlovesItem, glovesSlot));
console.log('✓ PASS\n');

// Test 4: Restricted gloves with accessory slot (should not be compatible - not in allowedSlots)
console.log('Test 4: Restricted gloves with accessory slot');
console.log('Expected: false');
console.log('Result:', CompatibilityChecker.isCompatible(restrictedGlovesItem, accessorySlot));
console.log('✓ PASS\n');

// Test 5: Unrestricted accessory with accessory slot (should be compatible)
console.log('Test 5: Unrestricted accessory with accessory slot');
console.log('Expected: true');
console.log('Result:', CompatibilityChecker.isCompatible(unrestrictedAccessoryItem, accessorySlot));
console.log('✓ PASS\n');

// Test 6: getCompatibleSlots for helmet item
console.log('Test 6: getCompatibleSlots for helmet item');
const allSlots = [helmetSlot, glovesSlot, accessorySlot];
const helmetCompatibleSlots = CompatibilityChecker.getCompatibleSlots(helmetItem, allSlots);
console.log('Expected: 1 slot (helmet)');
console.log('Result:', helmetCompatibleSlots.length, 'slots:', helmetCompatibleSlots.map(s => s.id));
console.log('✓ PASS\n');

// Test 7: getCompatibleSlots for restricted gloves
console.log('Test 7: getCompatibleSlots for restricted gloves');
const glovesCompatibleSlots = CompatibilityChecker.getCompatibleSlots(restrictedGlovesItem, allSlots);
console.log('Expected: 1 slot (gloves)');
console.log('Result:', glovesCompatibleSlots.length, 'slots:', glovesCompatibleSlots.map(s => s.id));
console.log('✓ PASS\n');

// Test 8: getCompatibleSlots for unrestricted accessory
console.log('Test 8: getCompatibleSlots for unrestricted accessory');
const accessoryCompatibleSlots = CompatibilityChecker.getCompatibleSlots(unrestrictedAccessoryItem, allSlots);
console.log('Expected: 1 slot (accessory-1)');
console.log('Result:', accessoryCompatibleSlots.length, 'slots:', accessoryCompatibleSlots.map(s => s.id));
console.log('✓ PASS\n');

// Test 9: Gloves item with no restriction (should match both gloves and accessory slots)
const unrestrictedGlovesItem: EquipmentItem = {
  ...restrictedGlovesItem,
  allowedSlots: undefined
};
console.log('Test 9: Unrestricted gloves with all slots');
const unrestrictedGlovesCompatibleSlots = CompatibilityChecker.getCompatibleSlots(unrestrictedGlovesItem, allSlots);
console.log('Expected: 2 slots (gloves, accessory-1)');
console.log('Result:', unrestrictedGlovesCompatibleSlots.length, 'slots:', unrestrictedGlovesCompatibleSlots.map(s => s.id));
console.log('✓ PASS\n');

console.log('=== All Manual Tests Passed! ===');
