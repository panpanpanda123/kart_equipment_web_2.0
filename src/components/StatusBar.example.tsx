import { StatusBar } from './StatusBar';
import type { SlotConfig } from '../types';

/**
 * Example usage of the StatusBar component
 * This file demonstrates different states and scenarios
 */

// Example slot configuration (simplified)
const exampleSlots: SlotConfig[] = [
  {
    id: 'helmet',
    type: '头盔',
    displayName: '头盔槽',
    position: { top: '10%', left: '20%' },
    size: { width: '12%', height: '12%' },
    required: true,
    maxCount: 1,
    allowedTypes: ['头盔']
  },
  {
    id: 'rib-protector',
    type: '护肋',
    displayName: '护肋槽',
    position: { top: '30%', left: '20%' },
    size: { width: '12%', height: '12%' },
    required: true,
    maxCount: 1,
    allowedTypes: ['护肋']
  },
  {
    id: 'gloves',
    type: '手套',
    displayName: '手套槽',
    position: { top: '50%', left: '20%' },
    size: { width: '12%', height: '12%' },
    required: false,
    maxCount: 1,
    allowedTypes: ['手套']
  },
  {
    id: 'accessory-1',
    type: '饰品',
    displayName: '饰品槽1',
    position: { top: '70%', left: '20%' },
    size: { width: '12%', height: '12%' },
    required: false,
    maxCount: 3,
    allowedTypes: ['饰品']
  }
];

// Example 1: Empty state
export function EmptyStateExample() {
  const equippedItems = new Map();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Example 1: Empty State</h3>
      <p className="text-sm text-gray-600">No items equipped</p>
      <StatusBar 
        equippedItems={equippedItems} 
        slots={exampleSlots} 
        onReset={() => console.log('Reset clicked')} 
      />
      <p className="text-xs text-gray-500">Expected: "已装配: 0/6 件装备 (必选: 0/2)" - No checkmark</p>
    </div>
  );
}

// Example 2: Partial completion (only one required slot filled)
export function PartialCompletionExample() {
  const equippedItems = new Map([
    ['helmet', ['helmet-item-1']],
    ['gloves', ['gloves-item-1']]
  ]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Example 2: Partial Completion</h3>
      <p className="text-sm text-gray-600">Helmet and gloves equipped, but rib-protector missing</p>
      <StatusBar 
        equippedItems={equippedItems} 
        slots={exampleSlots} 
        onReset={() => console.log('Reset clicked')} 
      />
      <p className="text-xs text-gray-500">Expected: "已装配: 2/6 件装备 (必选: 1/2)" - No checkmark</p>
    </div>
  );
}

// Example 3: All required slots filled
export function CompleteRequiredExample() {
  const equippedItems = new Map([
    ['helmet', ['helmet-item-1']],
    ['rib-protector', ['rib-item-1']]
  ]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Example 3: Complete Required Slots</h3>
      <p className="text-sm text-gray-600">Both required slots (helmet and rib-protector) filled</p>
      <StatusBar 
        equippedItems={equippedItems} 
        slots={exampleSlots} 
        onReset={() => console.log('Reset clicked')} 
      />
      <p className="text-xs text-gray-500">Expected: "已装配: 2/6 件装备 (必选: 2/2)" - Green checkmark ✓</p>
    </div>
  );
}

// Example 4: Multiple items in one slot
export function MultipleItemsExample() {
  const equippedItems = new Map([
    ['helmet', ['helmet-item-1']],
    ['rib-protector', ['rib-item-1']],
    ['accessory-1', ['acc-1', 'acc-2', 'acc-3']]
  ]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Example 4: Multiple Items in One Slot</h3>
      <p className="text-sm text-gray-600">Required slots filled + 3 accessories in one slot</p>
      <StatusBar 
        equippedItems={equippedItems} 
        slots={exampleSlots} 
        onReset={() => console.log('Reset clicked')} 
      />
      <p className="text-xs text-gray-500">Expected: "已装配: 5/6 件装备 (必选: 2/2)" - Green checkmark ✓</p>
    </div>
  );
}

// Example 5: Full capacity
export function FullCapacityExample() {
  const equippedItems = new Map([
    ['helmet', ['helmet-item-1']],
    ['rib-protector', ['rib-item-1']],
    ['gloves', ['gloves-item-1']],
    ['accessory-1', ['acc-1', 'acc-2', 'acc-3']]
  ]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Example 5: Full Capacity</h3>
      <p className="text-sm text-gray-600">All slots filled to maximum capacity</p>
      <StatusBar 
        equippedItems={equippedItems} 
        slots={exampleSlots} 
        onReset={() => console.log('Reset clicked')} 
      />
      <p className="text-xs text-gray-500">Expected: "已装配: 6/6 件装备 (必选: 2/2)" - Green checkmark ✓</p>
    </div>
  );
}

// Combined example showing all scenarios
export function AllExamples() {
  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">StatusBar Component Examples</h2>
      
      <EmptyStateExample />
      <hr className="border-gray-300" />
      
      <PartialCompletionExample />
      <hr className="border-gray-300" />
      
      <CompleteRequiredExample />
      <hr className="border-gray-300" />
      
      <MultipleItemsExample />
      <hr className="border-gray-300" />
      
      <FullCapacityExample />
    </div>
  );
}
