# Constants

This directory contains constant values used throughout the racing equipment configuration system.

## Error Messages (`errorMessages.ts`)

Centralized error message definitions for consistent user feedback across the application.

### Usage

```typescript
import { ERROR_MESSAGES } from '../constants/errorMessages';

// Static messages
console.error(ERROR_MESSAGES.INCOMPATIBLE);
console.error(ERROR_MESSAGES.LOAD_CONFIG_FAILED);

// Dynamic messages
const maxCount = 2;
console.error(ERROR_MESSAGES.SLOT_FULL(maxCount));
// Output: "该槽位已满（最多2件）"
```

### Available Messages

| Constant | Type | Description | Example Output |
|----------|------|-------------|----------------|
| `SLOT_FULL` | Function | Slot has reached maximum capacity | `该槽位已满（最多2件）` |
| `INCOMPATIBLE` | String | Equipment cannot be equipped to slot | `此装备无法装配到该槽位` |
| `LOAD_CONFIG_FAILED` | String | Configuration file failed to load | `配置加载失败，请刷新页面重试` |
| `STORAGE_UNAVAILABLE` | String | localStorage is unavailable | `无法保存配置，刷新后将丢失` |
| `SAVE_FAILED` | String | Failed to save to localStorage | `保存失败，正在重试...` |
| `INVALID_DATA` | String | Some data items were filtered out | `部分数据无效，已自动过滤` |

### Design Principles

1. **Centralization**: All user-facing error messages are defined in one place for easy maintenance and consistency
2. **Type Safety**: TypeScript types ensure correct usage throughout the codebase
3. **Localization Ready**: All messages are in Chinese (zh-CN) and can be easily extended for i18n support
4. **Clear Context**: Each message provides clear, actionable information to the user

### Related Requirements

- **Requirements 7.3, 7.4**: Equipment operation error messages
- **Requirements 14.1-14.4**: Error handling and user feedback
- **Design Document**: Error Handling section

### Testing

Unit tests are provided in `errorMessages.test.ts` to verify:
- All required message keys are defined
- SLOT_FULL function generates correct format
- All messages are non-empty strings
- Messages contain appropriate Chinese characters

Run tests with:
```bash
npm test -- src/constants/errorMessages.test.ts
```
