# EquipmentCard Component

## Overview

The `EquipmentCard` component displays a single equipment item in the equipment library. It shows the equipment's thumbnail icon and model name, handles selection interactions, and applies pixel-art styling consistent with the application's design.

## Features

- **Visual Display**: Shows equipment thumbnail icon and model name
- **Selection State**: Applies highlighted border when selected
- **Click Interaction**: Handles click events for equipment selection/deselection
- **Pixel-Art Styling**: Uses consistent border and shadow styling
- **Accessibility**: Includes proper ARIA attributes for screen readers
- **Phase 2 Ready**: Supports hover and long-press event handlers for DetailCard feature

## Props

```typescript
interface EquipmentCardProps {
  item: EquipmentItem;           // Equipment item data to display
  isSelected: boolean;            // Whether this item is currently selected
  onClick: () => void;            // Handler for click events
  onHover?: (event: React.MouseEvent) => void;      // Optional: hover handler (Phase 2)
  onHoverEnd?: () => void;        // Optional: hover end handler (Phase 2)
  onLongPress?: (event: React.TouchEvent) => void;  // Optional: long-press handler (Phase 2)
}
```

## Usage Example

```tsx
import { EquipmentCard } from './components/EquipmentCard';
import type { EquipmentItem } from './types';

function EquipmentLibrary() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  const item: EquipmentItem = {
    id: 'helmet-1',
    type: '头盔',
    brand: 'Arai',
    model: 'GP-7',
    displayName: 'Arai GP-7 Racing Helmet',
    icon: '/icons/helmet-1.png',
    image: '/images/helmet-1.png',
    summary: 'Professional racing helmet',
  };

  const handleItemClick = () => {
    // Toggle selection
    setSelectedItemId(prev => prev === item.id ? null : item.id);
  };

  return (
    <EquipmentCard
      item={item}
      isSelected={selectedItemId === item.id}
      onClick={handleItemClick}
    />
  );
}
```

## Visual States

### Unselected State
- Black border (`border-black`)
- Standard shadow: `shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
- White background

### Selected State
- Blue border (`border-blue-600`)
- Enhanced shadow: `shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]`
- White background

### Hover State
- Light gray background (`hover:bg-gray-50`)

### Active State (Click)
- No shadow
- Translates 2px down and right for "pressed" effect

## Layout

The component uses a square aspect ratio (`aspect-square`) with:
- **Top 75%**: Equipment icon (centered, maintains aspect ratio)
- **Bottom 25%**: Model name (centered, max 2 lines with ellipsis)

## Accessibility

- Uses semantic `<button>` element
- Includes `aria-label` with equipment display name
- Includes `aria-pressed` to indicate selection state
- Keyboard accessible (can be focused and activated with Enter/Space)

## Styling Details

- **Border**: 2px solid border with pixel-art shadow
- **Typography**: Small text (text-xs) with medium weight
- **Image Rendering**: Pixelated for retro aesthetic
- **Responsive**: Width adapts to parent container
- **Text Overflow**: Long model names are clamped to 2 lines with ellipsis

## Requirements Validation

This component validates:
- **Requirement 6.1**: Equipment selection interaction (click to select)
- **Requirement 6.4**: Visual highlighting of selected equipment

## Testing

The component includes comprehensive unit tests covering:
- Rendering of icon and model name
- Click event handling
- Selected/unselected styling
- ARIA attributes
- Hover event handlers
- Long text handling
- Pixel-art styling

Run tests with:
```bash
npm test -- src/components/EquipmentCard.test.tsx
```

## Phase 2 Enhancements

The component is prepared for Phase 2 features:
- `onHover` and `onHoverEnd` props for desktop DetailCard display
- `onLongPress` prop for mobile DetailCard display
- These handlers are optional and can be added when DetailCard is implemented

## Notes

- The component uses lazy loading for images (`loading="lazy"`)
- Model names longer than 2 lines are truncated with ellipsis
- The component maintains a square aspect ratio for consistent grid layout
- All interactive states include smooth transitions
