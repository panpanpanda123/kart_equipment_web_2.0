# StorageManager Module

## Overview

The `StorageManager` module provides localStorage persistence for the Racing Equipment Configuration System. It handles saving, loading, and clearing equipment configuration state with robust error handling and graceful degradation.

## Features

- ✅ **Persistent Storage**: Saves equipment configuration to localStorage
- ✅ **Data Validation**: Filters out invalid item IDs during load
- ✅ **Error Handling**: Gracefully handles localStorage unavailability
- ✅ **Type Safety**: Fully typed with TypeScript
- ✅ **Simple API**: Static methods, no instance needed

## API Reference

### `StorageManager.save(equippedItems: Map<string, string[]>): void`

Saves the current equipped items state to localStorage.

**Parameters:**
- `equippedItems`: Map of slot IDs to arrays of equipped item IDs

**Example:**
```typescript
const equippedItems = new Map([
  ['helmet', ['helmet-1']],
  ['gloves', ['gloves-1', 'gloves-2']]
]);

StorageManager.save(equippedItems);
```

**Storage Format:**
```json
{
  "version": 1,
  "equipped": {
    "helmet": ["helmet-1"],
    "gloves": ["gloves-1", "gloves-2"]
  }
}
```

### `StorageManager.load(validItemIds: Set<string>): Map<string, string[]>`

Loads equipped items from localStorage and filters out invalid item IDs.

**Parameters:**
- `validItemIds`: Set of valid item IDs from current configuration

**Returns:**
- Map of slot IDs to arrays of valid equipped item IDs
- Empty Map if no data exists or on error

**Example:**
```typescript
const validItemIds = new Set(['helmet-1', 'gloves-1', 'gloves-2']);
const equippedItems = StorageManager.load(validItemIds);

// If localStorage had: { helmet: ['helmet-1', 'old-item'], gloves: ['gloves-1'] }
// Returns: Map { 'helmet' => ['helmet-1'], 'gloves' => ['gloves-1'] }
// 'old-item' is filtered out because it's not in validItemIds
```

### `StorageManager.clear(): void`

Removes all saved data from localStorage.

**Example:**
```typescript
StorageManager.clear();
// localStorage key 'racing-equipment-config-v1' is removed
```

## Usage in Application

### 1. App Initialization

Load saved state when the app starts:

```typescript
import { StorageManager } from './services/storageManager';

function App() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [equippedItems, setEquippedItems] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    // Load configuration
    const loadedConfig = await dataProvider.loadConfig();
    setConfig(loadedConfig);

    // Create set of valid item IDs
    const validItemIds = new Set(loadedConfig.items.map(item => item.id));

    // Restore saved state
    const savedEquippedItems = StorageManager.load(validItemIds);
    setEquippedItems(savedEquippedItems);
  }, []);

  // ...
}
```

### 2. Equipping Items

Save immediately after equipping:

```typescript
function handleEquipItem(slotId: string, itemId: string) {
  // Update state
  const currentItems = equippedItems.get(slotId) || [];
  const updatedEquippedItems = new Map(equippedItems);
  updatedEquippedItems.set(slotId, [...currentItems, itemId]);
  setEquippedItems(updatedEquippedItems);

  // Save to localStorage immediately
  StorageManager.save(updatedEquippedItems);
}
```

### 3. Unequipping Items

Save immediately after unequipping:

```typescript
function handleUnequipItem(slotId: string) {
  const currentItems = equippedItems.get(slotId) || [];
  if (currentItems.length === 0) return;

  // Remove last item
  const updatedItems = currentItems.slice(0, -1);
  const updatedEquippedItems = new Map(equippedItems);
  
  if (updatedItems.length > 0) {
    updatedEquippedItems.set(slotId, updatedItems);
  } else {
    updatedEquippedItems.delete(slotId);
  }
  
  setEquippedItems(updatedEquippedItems);

  // Save to localStorage immediately
  StorageManager.save(updatedEquippedItems);
}
```

### 4. Reset

Clear both state and localStorage:

```typescript
function handleReset() {
  // Clear state
  setEquippedItems(new Map());
  setSelectedItemId(null);

  // Clear localStorage
  StorageManager.clear();
}
```

## Error Handling

The StorageManager handles errors gracefully:

### localStorage Unavailable

If localStorage is unavailable (private browsing, quota exceeded, security restrictions):

- **save()**: Logs error to console, continues without saving
- **load()**: Logs error to console, returns empty Map
- **clear()**: Logs error to console, continues

The application continues to function normally without persistence.

### Invalid Data

If saved data is corrupted or malformed:

- **load()**: Catches JSON parse errors, logs to console, returns empty Map

### Invalid Item IDs

If saved item IDs no longer exist in the configuration:

- **load()**: Automatically filters out invalid IDs
- Slots with no valid items are removed from the result

## Storage Key

The module uses the storage key: `racing-equipment-config-v1`

This key is versioned to allow for future data format changes.

## Data Format

```typescript
interface StorageData {
  version: number;        // Format version (currently 1)
  equipped: {             // Equipped items by slot
    [slotId: string]: string[];  // Array of item IDs
  };
}
```

## Requirements Satisfied

- ✅ **Requirement 9.1**: Immediate save on equip/unequip
- ✅ **Requirement 9.2**: Restore configuration on load
- ✅ **Requirement 9.3**: Validate and filter invalid item IDs
- ✅ **Requirement 9.4**: Clear on reset
- ✅ **Requirement 9.5**: Graceful degradation on errors
- ✅ **Requirement 9.6**: JSON format with version and equipped data

## Testing

### Unit Tests

Run unit tests (when Vitest is configured):
```bash
npm test -- storageManager.test.ts
```

### Demo

Interactive demo in browser console:
```typescript
import { runAllDemos } from './services/storageManager.demo';
runAllDemos();
```

Or in browser console:
```javascript
storageManagerDemo.runAll();
```

### Examples

Integration examples:
```typescript
import { runAllExamples } from './services/storageManager.example';
runAllExamples();
```

Or in browser console:
```javascript
storageManagerExamples.runAll();
```

## Files

- `storageManager.ts` - Main implementation
- `storageManager.test.ts` - Unit tests (requires Vitest)
- `storageManager.demo.ts` - Interactive demonstrations
- `storageManager.example.ts` - Integration examples
- `storageManager.verification.md` - Implementation verification
- `storageManager.README.md` - This file

## Next Steps

This module is ready for integration with:

1. **Task 4.1**: App component initialization
2. **Task 4.3**: Equipment equip/unequip logic
3. **Task 4.4**: Reset functionality

## Notes

- The module uses static methods - no instance creation needed
- All methods are synchronous (localStorage is synchronous)
- Error handling ensures the app never crashes due to storage issues
- The module is framework-agnostic and can be used with any state management solution
