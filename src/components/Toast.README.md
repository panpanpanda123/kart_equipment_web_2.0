# Toast Component

A pixel-art styled toast notification component that auto-dismisses after a specified duration.

## Features

- ✅ Pixel-art styling with border and shadow
- ✅ Auto-dismiss after configurable duration (default 3000ms)
- ✅ Accessible with ARIA attributes
- ✅ Smooth fade-in animation
- ✅ Responsive positioning (centered at bottom)
- ✅ Callback support for close events

## Requirements Validation

**Validates: Requirements 14.1, 14.2**

- **14.1**: Displays pixel-art styled toast notification for invalid operations
- **14.2**: Auto-dismisses after 3 seconds (3000ms ± 100ms tolerance)

## Usage

```tsx
import { useState } from 'react';
import { Toast } from './components/Toast';

function App() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleToastClose = () => {
    setToastVisible(false);
  };

  return (
    <div>
      <button onClick={() => showToast('此装备无法装配到该槽位')}>
        Show Error
      </button>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={handleToastClose}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `message` | `string` | Yes | - | The message to display in the toast |
| `isVisible` | `boolean` | Yes | - | Controls toast visibility |
| `duration` | `number` | No | `3000` | Auto-dismiss duration in milliseconds |
| `onClose` | `() => void` | No | - | Callback fired when toast closes (after duration) |

## Styling

The Toast component uses pixel-art styling:

- **Border**: 2px solid black (`border-2 border-black`)
- **Shadow**: Pixel-art shadow effect (`shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`)
- **Background**: White (`bg-white`)
- **Position**: Fixed at bottom center with 20px offset from bottom
- **Animation**: Fade-in and slide-in from bottom

## Error Messages

Common error messages used with Toast:

```typescript
const ERROR_MESSAGES = {
  SLOT_FULL: (maxCount: number) => `该槽位已满（最多${maxCount}件）`,
  INCOMPATIBLE: '此装备无法装配到该槽位',
  LOAD_CONFIG_FAILED: '配置加载失败，请刷新页面重试',
  STORAGE_UNAVAILABLE: '无法保存配置，刷新后将丢失',
  SAVE_FAILED: '保存失败，正在重试...',
  INVALID_DATA: '部分数据无效，已自动过滤'
};
```

## Accessibility

The Toast component includes proper accessibility attributes:

- `role="alert"`: Announces the toast to screen readers
- `aria-live="polite"`: Ensures screen readers announce the message without interrupting

## Testing

The component includes comprehensive unit tests covering:

- ✅ Rendering when visible/hidden
- ✅ Auto-dismiss after default duration (3000ms)
- ✅ Auto-dismiss after custom duration
- ✅ Pixel-art styling classes
- ✅ Accessibility attributes
- ✅ Timer cleanup on unmount
- ✅ Visibility state changes
- ✅ Timer restart on visibility change

Run tests:

```bash
npm test -- src/components/Toast.test.tsx
```

## Example

See `Toast.example.tsx` for a complete working example with multiple toast types.

## Implementation Notes

1. **Timer Management**: Uses `useEffect` with cleanup to manage the auto-dismiss timer
2. **State Synchronization**: Internal `show` state syncs with `isVisible` prop
3. **Cleanup**: Timer is properly cleaned up when component unmounts or when visibility changes
4. **Positioning**: Uses Tailwind's fixed positioning and transform for centering
5. **Z-Index**: Set to `z-50` to ensure toast appears above other content

## Future Enhancements (Phase 2)

Potential improvements for future versions:

- Multiple toast stacking
- Different toast types (success, error, warning, info) with color coding
- Custom icons
- Action buttons (e.g., "Undo", "Retry")
- Swipe to dismiss on mobile
- Toast queue management
