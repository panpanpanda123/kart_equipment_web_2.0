# StatusBar Component

## Overview

The StatusBar component displays equipment statistics and provides a reset functionality for the Racing Equipment Configuration System. It shows the current equipment status, required slot completion, and a reset button.

## Features

- **Equipment Count Display**: Shows "已装配: X/Y 件装备 (必选: M/N)"
  - **X**: Total equipped items (sum of all array lengths in equippedItems)
  - **Y**: Total capacity (sum of all slot.maxCount)
  - **M**: Count of required slots with at least one item
  - **N**: Total required slots count (always 2: 头盔 and 护肋)

- **Completeness Indicator**: Green checkmark (✓) displayed when all required slots are filled (M === N)

- **Reset Button**: Clears all equipped items and localStorage when clicked

## Props

```typescript
interface StatusBarProps {
  equippedItems: Map<string, string[]>;  // Map of slot IDs to arrays of equipped item IDs
  slots: SlotConfig[];                    // Array of all slot configurations
  onReset: () => void;                    // Callback function when Reset button is clicked
}
```

## Usage Example

```tsx
import { StatusBar } from './components/StatusBar';

function App() {
  const [equippedItems, setEquippedItems] = useState(new Map());
  const slots = [...]; // Load from configuration

  const handleReset = () => {
    setEquippedItems(new Map());
    StorageManager.clear();
  };

  return (
    <div>
      {/* Main content */}
      <StatusBar 
        equippedItems={equippedItems} 
        slots={slots} 
        onReset={handleReset} 
      />
    </div>
  );
}
```

## Calculation Formulas

### X (Total Equipped Items)
```typescript
const totalEquipped = Array.from(equippedItems.values()).reduce(
  (sum, items) => sum + items.length,
  0
);
```

### Y (Total Capacity)
```typescript
const totalCapacity = slots.reduce((sum, slot) => sum + slot.maxCount, 0);
```

### N (Total Required Slots)
```typescript
const totalRequiredSlots = slots.filter(slot => slot.required).length;
```

### M (Filled Required Slots)
```typescript
const filledRequiredSlots = slots.filter(slot => {
  if (!slot.required) return false;
  const items = equippedItems.get(slot.id);
  return items && items.length > 0;
}).length;
```

### Completeness Check
```typescript
const isComplete = filledRequiredSlots === totalRequiredSlots;
```

## Styling

The component uses pixel-art styling consistent with the rest of the application:

- **Container**: Gray background with black top border
- **Reset Button**: White background with 2px black border and pixel-art shadow effect
  - Shadow: `shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
  - Active state: Shadow removed and button translates 2px down and right
- **Completeness Indicator**: Green checkmark (✓) with bold font

## Accessibility

- Reset button has `aria-label="重置所有装备"` for screen readers
- Completeness indicator has `aria-label="配置完整"` and title tooltip
- Responsive layout with flexbox that wraps on smaller screens

## Requirements Validation

This component validates the following requirements:

- **Requirement 12.2**: Status bar displays equipment counts in the format "已装配: X/Y 件装备 (必选: M/N)"
- **Requirement 12.4**: Displays completeness indicator when all required slots are filled
- **Requirement 12.5**: Status bar updates in real-time as items are equipped or unequipped

## Testing

The component includes comprehensive unit tests covering:

- Correct calculation of X, Y, M, N values
- Completeness indicator display logic
- Reset button functionality
- Edge cases (empty state, maxCount > 1, complex equipped states)
- Pixel-art styling verification

Run tests with:
```bash
npm test -- StatusBar.test.tsx
```

## Example Scenarios

### Scenario 1: Empty State
```
equippedItems: Map {}
Result: "已装配: 0/6 件装备 (必选: 0/2)"
Completeness: ✗ (not shown)
```

### Scenario 2: Partial Completion
```
equippedItems: Map {
  'helmet' => ['item-1'],
  'gloves' => ['item-2']
}
Result: "已装配: 2/6 件装备 (必选: 1/2)"
Completeness: ✗ (not shown)
```

### Scenario 3: Complete Required Slots
```
equippedItems: Map {
  'helmet' => ['item-1'],
  'rib-protector' => ['item-2']
}
Result: "已装配: 2/6 件装备 (必选: 2/2)"
Completeness: ✓ (shown in green)
```

### Scenario 4: Multiple Items in One Slot
```
equippedItems: Map {
  'helmet' => ['item-1'],
  'rib-protector' => ['item-2'],
  'accessory-1' => ['item-3', 'item-4', 'item-5']
}
Result: "已装配: 5/6 件装备 (必选: 2/2)"
Completeness: ✓ (shown in green)
```

## Notes

- The component is stateless and relies on props for all data
- Calculations are performed on every render (optimized with simple reduce operations)
- The component is responsive and works on both desktop and mobile layouts
- The Reset button triggers the parent's onReset callback, which should handle clearing state and localStorage
