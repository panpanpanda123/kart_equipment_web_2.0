/**
 * Demo file for StorageManager
 * 
 * This file demonstrates the usage of StorageManager module
 * and can be used for manual testing in the browser console.
 */

import { StorageManager } from './storageManager';

/**
 * Demo: Basic save and load operations
 */
export function demoBasicOperations() {
  console.log('=== StorageManager Demo: Basic Operations ===\n');

  // Create sample equipped items
  const equippedItems = new Map<string, string[]>([
    ['helmet', ['helmet-item-1']],
    ['gloves', ['gloves-item-1', 'gloves-item-2']],
    ['accessory-1', ['accessory-item-1', 'accessory-item-2', 'accessory-item-3']],
  ]);

  console.log('1. Original equipped items:');
  console.log(equippedItems);

  // Save to localStorage
  console.log('\n2. Saving to localStorage...');
  StorageManager.save(equippedItems);
  console.log('✓ Saved successfully');

  // Check what was saved
  const savedJson = localStorage.getItem('racing-equipment-config-v1');
  console.log('\n3. Raw data in localStorage:');
  console.log(savedJson);
  console.log('\n4. Parsed data:');
  console.log(JSON.parse(savedJson!));

  // Load from localStorage
  console.log('\n5. Loading from localStorage...');
  const validItemIds = new Set([
    'helmet-item-1',
    'gloves-item-1',
    'gloves-item-2',
    'accessory-item-1',
    'accessory-item-2',
    'accessory-item-3',
  ]);
  const loadedItems = StorageManager.load(validItemIds);
  console.log('✓ Loaded successfully:');
  console.log(loadedItems);

  // Verify round-trip
  console.log('\n6. Verification:');
  console.log('Helmet match:', JSON.stringify(loadedItems.get('helmet')) === JSON.stringify(equippedItems.get('helmet')));
  console.log('Gloves match:', JSON.stringify(loadedItems.get('gloves')) === JSON.stringify(equippedItems.get('gloves')));
  console.log('Accessory-1 match:', JSON.stringify(loadedItems.get('accessory-1')) === JSON.stringify(equippedItems.get('accessory-1')));
}

/**
 * Demo: Invalid item ID filtering
 */
export function demoInvalidItemFiltering() {
  console.log('\n\n=== StorageManager Demo: Invalid Item Filtering ===\n');

  // Save items with some IDs
  const equippedItems = new Map<string, string[]>([
    ['helmet', ['item-1', 'item-2', 'item-3']],
    ['gloves', ['item-4', 'item-5']],
    ['shoes', ['item-6']],
  ]);

  console.log('1. Saving equipped items:');
  console.log(equippedItems);
  StorageManager.save(equippedItems);

  // Load with only some valid IDs
  console.log('\n2. Loading with limited valid IDs (only item-1, item-4, item-6)...');
  const validItemIds = new Set(['item-1', 'item-4', 'item-6']);
  const loadedItems = StorageManager.load(validItemIds);

  console.log('\n3. Loaded items (invalid IDs filtered out):');
  console.log(loadedItems);
  console.log('\nHelmet items:', loadedItems.get('helmet')); // Should only have ['item-1']
  console.log('Gloves items:', loadedItems.get('gloves')); // Should only have ['item-4']
  console.log('Shoes items:', loadedItems.get('shoes')); // Should have ['item-6']

  // Save items where entire slot becomes invalid
  console.log('\n4. Testing slot with all invalid items...');
  const equippedItems2 = new Map<string, string[]>([
    ['helmet', ['valid-item']],
    ['gloves', ['invalid-1', 'invalid-2']],
  ]);
  StorageManager.save(equippedItems2);

  const validItemIds2 = new Set(['valid-item']);
  const loadedItems2 = StorageManager.load(validItemIds2);

  console.log('\n5. Loaded items (gloves slot removed because all IDs invalid):');
  console.log(loadedItems2);
  console.log('Has helmet:', loadedItems2.has('helmet')); // true
  console.log('Has gloves:', loadedItems2.has('gloves')); // false - all items were invalid
}

/**
 * Demo: Clear operation
 */
export function demoClearOperation() {
  console.log('\n\n=== StorageManager Demo: Clear Operation ===\n');

  // Save some data
  const equippedItems = new Map<string, string[]>([
    ['helmet', ['item-1']],
    ['gloves', ['item-2']],
  ]);

  console.log('1. Saving data...');
  StorageManager.save(equippedItems);
  console.log('Data in localStorage:', localStorage.getItem('racing-equipment-config-v1'));

  // Clear
  console.log('\n2. Clearing localStorage...');
  StorageManager.clear();
  console.log('✓ Cleared');

  // Verify cleared
  console.log('\n3. Checking localStorage:');
  const afterClear = localStorage.getItem('racing-equipment-config-v1');
  console.log('Data in localStorage:', afterClear); // Should be null
  console.log('Is null:', afterClear === null);

  // Load after clear should return empty Map
  console.log('\n4. Loading after clear:');
  const loadedItems = StorageManager.load(new Set(['item-1', 'item-2']));
  console.log('Loaded items:', loadedItems);
  console.log('Size:', loadedItems.size); // Should be 0
}

/**
 * Demo: Error handling (localStorage unavailable)
 */
export function demoErrorHandling() {
  console.log('\n\n=== StorageManager Demo: Error Handling ===\n');

  console.log('Note: This demo simulates localStorage errors.');
  console.log('In a real scenario, errors would be logged to console.error\n');

  // Save original localStorage
  const originalLocalStorage = window.localStorage;

  try {
    // Mock localStorage to throw errors
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => { throw new Error('localStorage unavailable'); },
        setItem: () => { throw new Error('QuotaExceededError'); },
        removeItem: () => { throw new Error('SecurityError'); },
      },
      writable: true,
    });

    console.log('1. Testing save with localStorage error...');
    const equippedItems = new Map<string, string[]>([['helmet', ['item-1']]]);
    StorageManager.save(equippedItems); // Should not throw
    console.log('✓ Save handled gracefully (error logged to console)');

    console.log('\n2. Testing load with localStorage error...');
    const loadedItems = StorageManager.load(new Set(['item-1'])); // Should not throw
    console.log('✓ Load handled gracefully (returned empty Map)');
    console.log('Loaded items:', loadedItems);
    console.log('Size:', loadedItems.size); // Should be 0

    console.log('\n3. Testing clear with localStorage error...');
    StorageManager.clear(); // Should not throw
    console.log('✓ Clear handled gracefully (error logged to console)');

  } finally {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  }

  console.log('\n✓ All error scenarios handled gracefully without crashing');
}

/**
 * Demo: Storage format verification
 */
export function demoStorageFormat() {
  console.log('\n\n=== StorageManager Demo: Storage Format ===\n');

  const equippedItems = new Map<string, string[]>([
    ['helmet', ['item-1']],
    ['gloves', ['item-2', 'item-3']],
  ]);

  StorageManager.save(equippedItems);

  const savedJson = localStorage.getItem('racing-equipment-config-v1');
  const savedData = JSON.parse(savedJson!);

  console.log('1. Storage key:', 'racing-equipment-config-v1');
  console.log('✓ Correct key used\n');

  console.log('2. Data structure:');
  console.log(JSON.stringify(savedData, null, 2));

  console.log('\n3. Format validation:');
  console.log('Has version field:', 'version' in savedData);
  console.log('Version is 1:', savedData.version === 1);
  console.log('Has equipped field:', 'equipped' in savedData);
  console.log('Equipped is object:', typeof savedData.equipped === 'object');
  console.log('Helmet value is array:', Array.isArray(savedData.equipped.helmet));
  console.log('Gloves value is array:', Array.isArray(savedData.equipped.gloves));

  console.log('\n✓ Storage format matches specification:');
  console.log('  { "version": 1, "equipped": { "slotId": ["itemId1", ...], ... } }');
}

/**
 * Run all demos
 */
export function runAllDemos() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         StorageManager Module - Complete Demo             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  demoBasicOperations();
  demoInvalidItemFiltering();
  demoClearOperation();
  demoStorageFormat();
  demoErrorHandling();

  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    All Demos Complete                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).storageManagerDemo = {
    runAll: runAllDemos,
    basicOperations: demoBasicOperations,
    invalidItemFiltering: demoInvalidItemFiltering,
    clearOperation: demoClearOperation,
    storageFormat: demoStorageFormat,
    errorHandling: demoErrorHandling,
  };
  console.log('💡 StorageManager demo loaded! Try: storageManagerDemo.runAll()');
}
