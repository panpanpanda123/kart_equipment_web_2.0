# Services Module

This directory contains service modules that provide core business logic for the Racing Equipment Configuration System.

## CompatibilityChecker

**File:** `compatibilityChecker.ts`

**Purpose:** Provides equipment compatibility checking logic to determine if an equipment item can be equipped to a specific slot.

**Compatibility Logic:**
An item is compatible with a slot if and only if:
1. `(item.allowedSlots is empty OR contains slot.id)` AND
2. `(slot.allowedTypes is non-empty AND contains item.type)`

**API:**

### `CompatibilityChecker.isCompatible(item, slot): boolean`
Checks if a single equipment item is compatible with a specific slot.

**Parameters:**
- `item: EquipmentItem` - The equipment item to check
- `slot: SlotConfig` - The slot to check compatibility with

**Returns:** `boolean` - true if compatible, false otherwise

**Example:**
```typescript
const helmet = { id: 'h1', type: '头盔', allowedSlots: undefined, ... };
const helmetSlot = { id: 'helmet', allowedTypes: ['头盔'], ... };
CompatibilityChecker.isCompatible(helmet, helmetSlot); // true
```

### `CompatibilityChecker.getCompatibleSlots(item, slots): SlotConfig[]`
Returns all slots that are compatible with a given equipment item.

**Parameters:**
- `item: EquipmentItem` - The equipment item to find compatible slots for
- `slots: SlotConfig[]` - Array of all available slots

**Returns:** `SlotConfig[]` - Array of compatible slots

**Example:**
```typescript
const helmet = { id: 'h1', type: '头盔', allowedSlots: undefined, ... };
const allSlots = [helmetSlot, glovesSlot, accessorySlot];
const compatibleSlots = CompatibilityChecker.getCompatibleSlots(helmet, allSlots);
// Returns: [helmetSlot]
```

**Implementation Details:**
- Normalizes `item.allowedSlots` using the nullish coalescing operator (`??`)
- `undefined` or `null` allowedSlots are treated as empty array (no restriction)
- Empty `allowedSlots` array means the item can be equipped to any slot (if type matches)
- Non-empty `allowedSlots` array restricts the item to specific slots
- `slot.allowedTypes` must be non-empty (validated at config load time)

**Usage in Application:**
- Used by UI components to highlight compatible slots when an item is selected (Requirement 6.2)
- Used by UI components to gray out incompatible slots when an item is selected (Requirement 6.3)
- Used by equipment logic to validate equip operations (Requirement 7.4)

**Testing:**
- Manual test file: `compatibilityChecker.demo.ts`
- Unit test file: `compatibilityChecker.test.ts` (requires vitest setup)
- All tests verify the core compatibility logic against various scenarios

**Requirements Satisfied:**
- Requirement 6.2: Highlight compatible equipment slots
- Requirement 6.3: Gray out incompatible equipment slots
- Property 8: Compatibility Check Correctness (Design Document)
