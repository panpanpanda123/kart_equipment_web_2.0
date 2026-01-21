/**
 * StorageManager Integration Example
 * 
 * This file demonstrates how StorageManager will be integrated
 * with the App component and application state.
 */

import { StorageManager } from './storageManager';
import type { EquipmentItem } from '../types';

/**
 * Example: App initialization with StorageManager
 */
export function exampleAppInitialization() {
  // Simulated loaded configuration
  const loadedItems: EquipmentItem[] = [
    { id: 'helmet-1', type: '头盔', brand: 'Brand A', model: 'Model X', displayName: 'Helmet X', icon: '/icon1.png', image: '/img1.png', summary: 'A helmet' },
    { id: 'gloves-1', type: '手套', brand: 'Brand B', model: 'Model Y', displayName: 'Gloves Y', icon: '/icon2.png', image: '/img2.png', summary: 'Gloves' },
    { id: 'gloves-2', type: '手套', brand: 'Brand C', model: 'Model Z', displayName: 'Gloves Z', icon: '/icon3.png', image: '/img3.png', summary: 'More gloves' },
  ];

  // Create set of valid item IDs from loaded configuration
  const validItemIds = new Set(loadedItems.map(item => item.id));
  console.log('Valid item IDs:', validItemIds);

  // Load saved state from localStorage
  const savedEquippedItems = StorageManager.load(validItemIds);
  console.log('Loaded equipped items from localStorage:', savedEquippedItems);

  // Initialize application state
  const applicationState = {
    selectedItemId: null as string | null,
    equippedItems: savedEquippedItems, // Restored from localStorage
  };

  console.log('Application state initialized:', applicationState);
  return applicationState;
}

/**
 * Example: Equipping an item
 */
export function exampleEquipItem() {
  // Current state
  const equippedItems = new Map<string, string[]>([
    ['helmet', ['helmet-1']],
  ]);

  console.log('Before equipping:', equippedItems);

  // User equips gloves-1 to gloves slot
  const slotId = 'gloves';
  const itemId = 'gloves-1';

  // Get current items in slot (or empty array)
  const currentItems = equippedItems.get(slotId) || [];
  
  // Add new item
  equippedItems.set(slotId, [...currentItems, itemId]);

  console.log('After equipping:', equippedItems);

  // Save to localStorage immediately (Requirement 9.1)
  StorageManager.save(equippedItems);
  console.log('✓ Saved to localStorage');

  return equippedItems;
}

/**
 * Example: Unequipping an item
 */
export function exampleUnequipItem() {
  // Current state
  const equippedItems = new Map<string, string[]>([
    ['helmet', ['helmet-1']],
    ['gloves', ['gloves-1', 'gloves-2']],
  ]);

  console.log('Before unequipping:', equippedItems);

  // User unequips from gloves slot (removes last item)
  const slotId = 'gloves';
  const currentItems = equippedItems.get(slotId) || [];
  
  if (currentItems.length > 0) {
    // Remove last item
    const updatedItems = currentItems.slice(0, -1);
    
    if (updatedItems.length > 0) {
      equippedItems.set(slotId, updatedItems);
    } else {
      equippedItems.delete(slotId);
    }
  }

  console.log('After unequipping:', equippedItems);

  // Save to localStorage immediately (Requirement 9.1)
  StorageManager.save(equippedItems);
  console.log('✓ Saved to localStorage');

  return equippedItems;
}

/**
 * Example: Reset all equipment
 */
export function exampleResetEquipment() {
  console.log('Resetting all equipment...');

  // Clear application state
  const equippedItems = new Map<string, string[]>();

  // Clear localStorage (Requirement 9.4)
  StorageManager.clear();
  console.log('✓ Cleared localStorage');

  console.log('After reset:', equippedItems);
  return equippedItems;
}

/**
 * Example: Handling configuration changes (item removed from config)
 */
export function exampleConfigurationChange() {
  console.log('=== Configuration Change Scenario ===\n');

  // Old configuration had these items
  const oldEquippedItems = new Map<string, string[]>([
    ['helmet', ['helmet-1', 'helmet-old']],
    ['gloves', ['gloves-1', 'gloves-old']],
    ['shoes', ['shoes-old']],
  ]);

  console.log('1. Previously saved state:');
  console.log(oldEquippedItems);

  // Save old state
  StorageManager.save(oldEquippedItems);

  // New configuration only has some items
  const newValidItemIds = new Set(['helmet-1', 'gloves-1']);
  console.log('\n2. New valid item IDs:', newValidItemIds);

  // Load with new valid IDs (Requirement 9.3: filter invalid IDs)
  const loadedEquippedItems = StorageManager.load(newValidItemIds);

  console.log('\n3. Loaded state (invalid IDs filtered):');
  console.log(loadedEquippedItems);
  console.log('\nHelmet:', loadedEquippedItems.get('helmet')); // ['helmet-1'] - helmet-old removed
  console.log('Gloves:', loadedEquippedItems.get('gloves')); // ['gloves-1'] - gloves-old removed
  console.log('Shoes:', loadedEquippedItems.get('shoes')); // undefined - all items invalid, slot removed

  console.log('\n✓ Invalid items automatically filtered during load');
}

/**
 * Example: localStorage unavailable scenario
 */
export function exampleLocalStorageUnavailable() {
  console.log('=== localStorage Unavailable Scenario ===\n');

  // Simulate localStorage being unavailable
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;

  try {
    // Mock localStorage to throw errors
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError: localStorage is full');
    };
    localStorage.getItem = () => {
      throw new Error('SecurityError: localStorage access denied');
    };

    console.log('1. Attempting to save (localStorage unavailable)...');
    const equippedItems = new Map<string, string[]>([['helmet', ['helmet-1']]]);
    StorageManager.save(equippedItems); // Should not crash
    console.log('✓ Save failed gracefully (error logged to console)');

    console.log('\n2. Attempting to load (localStorage unavailable)...');
    const loadedItems = StorageManager.load(new Set(['helmet-1'])); // Should not crash
    console.log('✓ Load failed gracefully, returned empty Map');
    console.log('Loaded items:', loadedItems);

    console.log('\n3. Application continues to work without persistence');
    console.log('User can still equip/unequip items, just not saved');

  } finally {
    // Restore original localStorage
    localStorage.setItem = originalSetItem;
    localStorage.getItem = originalGetItem;
  }

  console.log('\n✓ Graceful degradation working correctly (Requirement 9.5)');
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      StorageManager Integration Examples                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('Example 1: App Initialization');
  console.log('─────────────────────────────');
  exampleAppInitialization();

  console.log('\n\nExample 2: Equipping an Item');
  console.log('─────────────────────────────');
  exampleEquipItem();

  console.log('\n\nExample 3: Unequipping an Item');
  console.log('───────────────────────────────');
  exampleUnequipItem();

  console.log('\n\nExample 4: Reset Equipment');
  console.log('──────────────────────────');
  exampleResetEquipment();

  console.log('\n\nExample 5: Configuration Change');
  console.log('────────────────────────────────');
  exampleConfigurationChange();

  console.log('\n\nExample 6: localStorage Unavailable');
  console.log('────────────────────────────────────');
  exampleLocalStorageUnavailable();

  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              All Examples Complete                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).storageManagerExamples = {
    runAll: runAllExamples,
    appInit: exampleAppInitialization,
    equipItem: exampleEquipItem,
    unequipItem: exampleUnequipItem,
    reset: exampleResetEquipment,
    configChange: exampleConfigurationChange,
    unavailable: exampleLocalStorageUnavailable,
  };
  console.log('💡 StorageManager examples loaded! Try: storageManagerExamples.runAll()');
}
