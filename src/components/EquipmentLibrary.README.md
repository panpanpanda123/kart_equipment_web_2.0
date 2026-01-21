# EquipmentLibrary Component

## Overview

The `EquipmentLibrary` component displays all available equipment items in a responsive grid layout. It serves as the main equipment selection interface, allowing users to browse and select equipment items for configuration.

## Features

- **Responsive Grid Layout**: Uses CSS Grid with `auto-fill` to automatically adjust the number of columns based on available width
- **Equipment Display**: Renders all equipment items using the `EquipmentCard` component
- **Selection Management**: Tracks and displays the currently selected equipment item
- **Empty State**: Shows a helpful message when no equipment items are available
- **Scrollable**: Supports vertical scrolling for large equipment collections

## Props

```typescript
interface EquipmentLibraryProps {
  items: EquipmentItem[];        // Array of all equipment items to display
  selectedItemId: string | null; // ID of currently selected item (null if none)
  onItemSelect: (itemId: string) => void; // Callback when an item is clicked
}
```

## Usage

```tsx
import { EquipmentLibrary } from './components/EquipmentLibrary';

function App() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [items, setItems] = useState<EquipmentItem[]>([]);

  return (
    <EquipmentLibrary
      items={items}
      selectedItemId={selectedItemId}
      onItemSelect={(itemId) => {
        // Toggle selection: deselect if already selected, otherwise select
        setSelectedItemId(selectedItemId === itemId ? null : itemId);
      }}
    />
  );
}
```

## Responsive Behavior

The grid layout adapts to different screen sizes:

- **Mobile (< 640px)**: Minimum card width of 120px
- **Small screens (≥ 640px)**: Minimum card width of 140px
- **Medium+ screens (≥ 768px)**: Minimum card width of 160px

The `auto-fill` behavior ensures optimal use of available space, automatically calculating the number of columns that can fit.

## Grid Layout Details

The component uses CSS Grid with the following configuration:

```css
grid-cols-[repeat(auto-fill,minmax(120px,1fr))]  /* Mobile */
sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]  /* Small screens */
md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]  /* Medium+ screens */
```

This creates a responsive grid where:
- Each column has a minimum width (120px/140px/160px depending on screen size)
- Columns expand to fill available space (`1fr`)
- The number of columns adjusts automatically based on container width
- Gap between items is 1rem (16px)

## Empty State

When no items are provided (`items.length === 0`), the component displays:

```
暂无装备数据
请检查配置文件
```

This helps users understand why the library is empty and suggests checking the configuration file.

## Integration Points

### With EquipmentCard

The library renders `EquipmentCard` components for each item, passing:
- `item`: The equipment item data
- `isSelected`: Boolean indicating if this item is currently selected
- `onClick`: Callback that invokes `onItemSelect` with the item's ID

### With App State

The library integrates with application state through:
- `items`: Loaded from configuration via `DataProvider`
- `selectedItemId`: Part of `ApplicationState`
- `onItemSelect`: Updates `ApplicationState.selectedItemId`

## Accessibility

- Uses semantic HTML structure
- Scrollable container for keyboard navigation
- Selection state passed to child `EquipmentCard` components (which handle ARIA attributes)

## Performance Considerations

- **Lazy Loading**: Equipment card images use `loading="lazy"` (handled by `EquipmentCard`)
- **Key Props**: Each card uses `item.id` as the key for efficient React reconciliation
- **Memoization**: Consider wrapping in `React.memo()` if parent re-renders frequently

## Validation

**Validates Requirements:**
- **3.5**: Equipment Library displays all loaded equipment items in a grid layout
- **13.4**: System adjusts equipment library grid columns based on available width

## Testing

The component includes comprehensive unit tests covering:
- Rendering all equipment items
- Passing correct selection state to child cards
- Handling item selection callbacks
- Displaying empty state
- Grid layout structure
- Large numbers of items (50+ items)
- Selection state updates
- Null selection handling

Run tests with:
```bash
npm test -- src/components/EquipmentLibrary.test.tsx
```

## Future Enhancements (Phase 2)

Potential improvements for future phases:
- **Filtering**: Add ability to filter items by type, brand, or tags
- **Sorting**: Allow sorting by name, brand, or other criteria
- **Search**: Add search functionality to find specific equipment
- **Virtual Scrolling**: For very large equipment collections (100+ items)
- **Grid/List Toggle**: Allow users to switch between grid and list views
- **Favorites**: Mark and filter favorite equipment items

## Related Components

- **EquipmentCard**: Child component that displays individual equipment items
- **App**: Parent component that provides items and manages selection state
- **DetailCard** (Phase 2): Will show detailed information on hover/long-press

## File Location

```
src/components/EquipmentLibrary.tsx
src/components/EquipmentLibrary.test.tsx
src/components/EquipmentLibrary.README.md
```
