# DataProvider Module

## Overview

The DataProvider module provides an abstraction layer for loading configuration data in the Racing Equipment Configuration System. This design allows for easy swapping of data sources in the future (e.g., from local JSON to API, database, etc.).

## Architecture

```
┌─────────────────────────────────────┐
│      DataProvider Interface         │
│  - loadConfig(): Promise<ConfigData>│
└─────────────────────────────────────┘
                 ▲
                 │ implements
                 │
┌─────────────────────────────────────┐
│   LocalJsonDataProvider             │
│  - Loads from master-config.json    │
│  - Validates structural data        │
│  - Filters invalid items            │
└─────────────────────────────────────┘
```

## Components

### DataProvider Interface

```typescript
interface DataProvider {
  loadConfig(): Promise<ConfigData>;
}
```

The interface defines a single method that returns a Promise resolving to complete configuration data.

### LocalJsonDataProvider Class

Current implementation that loads configuration from `/master-config.json` in the public directory.

**Key Features:**
- Async loading via fetch API
- Two-tier validation strategy:
  - **Fail-fast**: Structural data (character, slots, ui) - throws error if invalid
  - **Graceful degradation**: Items data - filters invalid items, warns if < 12 remain
- Comprehensive error messages

## Validation Strategy

### Structural Validation (Fail-Fast)

These validations throw errors immediately if they fail:

1. **Character Configuration**
   - `character` object must exist
   - `character.image` must be a non-empty string

2. **Slots Configuration**
   - `slots` must be an array
   - Must contain exactly 10 slots
   - Each slot must have a valid `id` (non-empty string)
   - Each slot must have `allowedTypes` as a non-empty array

3. **UI Configuration**
   - `ui` object must exist

**Rationale**: These are critical structural requirements. Without them, the application cannot render properly.

### Item Validation (Graceful Degradation)

Item validation filters out invalid items but continues with valid ones:

**Required fields for valid item:**
- `id` (non-empty string)
- `type` (non-empty string)
- `brand` (non-empty string)
- `model` (non-empty string)
- `displayName` (non-empty string)
- `icon` (non-empty string)
- `image` (non-empty string)
- `summary` (non-empty string)

**Behavior:**
- Invalid items are filtered out with console warnings
- If fewer than 12 valid items remain, a warning is logged
- Application continues with available valid items

**Rationale**: Items are content data. Missing some items is better than failing to load the entire application.

## Usage Examples

### Basic Usage

```typescript
import { LocalJsonDataProvider } from './services/dataProvider';

const provider = new LocalJsonDataProvider();

try {
  const config = await provider.loadConfig();
  console.log(`Loaded ${config.items.length} items`);
  console.log(`Loaded ${config.slots.length} slots`);
} catch (error) {
  console.error('Failed to load configuration:', error);
}
```

### Dependency Injection

```typescript
import type { DataProvider } from './services/dataProvider';
import { LocalJsonDataProvider } from './services/dataProvider';

class App {
  constructor(private dataProvider: DataProvider) {}
  
  async initialize() {
    const config = await this.dataProvider.loadConfig();
    // Use config...
  }
}

// Easy to swap implementations
const app = new App(new LocalJsonDataProvider());
```

### Future: API-based Provider

```typescript
class ApiDataProvider implements DataProvider {
  constructor(private apiUrl: string) {}
  
  async loadConfig(): Promise<ConfigData> {
    const response = await fetch(`${this.apiUrl}/config`);
    const data = await response.json();
    // Same validation logic...
    return data;
  }
}

// Swap implementation by changing one line
const app = new App(new ApiDataProvider('https://api.example.com'));
```

## Error Handling

### Error Types

1. **Network Errors**
   - Thrown when fetch fails
   - Message: `"Failed to load config: [status] [statusText]"`

2. **Structural Validation Errors**
   - Thrown when critical configuration is invalid
   - Message: `"Invalid configuration: [specific error]"`

3. **JSON Parse Errors**
   - Thrown when response is not valid JSON
   - Message: `"Configuration loading failed: [error message]"`

### Error Handling Pattern

```typescript
try {
  const config = await provider.loadConfig();
  // Success path
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Failed to load config')) {
      // Network error - show retry button
    } else if (error.message.includes('Invalid configuration')) {
      // Validation error - show error details
    }
  }
}
```

## Testing

The module includes comprehensive unit tests covering:

- ✅ Successful configuration loading
- ✅ Item filtering (invalid items removed)
- ✅ Warning when < 12 items
- ✅ Character validation errors
- ✅ Slots count validation (must be exactly 10)
- ✅ AllowedTypes validation (must be non-empty)
- ✅ UI validation errors
- ✅ Network errors
- ✅ Edge cases (non-array items, empty strings, etc.)

Run tests:
```bash
npm test -- dataProvider.test.ts
```

## Configuration File Structure

Expected structure of `master-config.json`:

```json
{
  "character": {
    "image": "/character.png",
    "name": "Racing Driver"
  },
  "slots": [
    {
      "id": "helmet",
      "type": "头盔",
      "displayName": "头盔槽",
      "position": { "top": "15%", "left": "20%" },
      "size": { "width": "12%", "height": "12%" },
      "required": true,
      "maxCount": 1,
      "allowedTypes": ["头盔"]
    }
    // ... 9 more slots (total 10)
  ],
  "items": [
    {
      "id": "item-1",
      "type": "头盔",
      "brand": "Brand",
      "model": "Model",
      "displayName": "Display Name",
      "icon": "/icons/item.png",
      "image": "/images/item.png",
      "summary": "Item description",
      "specs": {
        "weight_g": 1200,
        "vents": 8,
        "certs": ["FIA 8860-2018"]
      }
    }
    // ... at least 12 items recommended
  ],
  "ui": {
    "title": "Racing Equipment Configuration",
    "labels": {}
  },
  "achievements": {}
}
```

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 11.1**: ✅ DataProvider interface with loadConfig() method
- **Requirement 11.2**: ✅ LocalJsonDataProvider loads from master-config.json
- **Requirement 11.3**: ✅ ConfigData includes character, slots, items, ui, achievements
- **Requirement 11.4**: ✅ Async loading with Promise
- **Requirement 11.6**: ✅ Descriptive error messages on failure
- **Requirement 3.2**: ✅ Validates required item fields

## Design Properties

This implementation satisfies:

- **Property 28**: Configuration Structure Completeness
  - Validates all required sections exist
  - Ensures exactly 10 slots
  - Warns if < 12 items (but continues)

- **Property 29**: Data Provider Error Handling
  - Rejects Promise with descriptive errors
  - Handles network, validation, and parse errors

- **Property 30**: AllowedTypes Non-Empty Constraint
  - Validates all slots have non-empty allowedTypes
  - Throws error if any slot has empty array

## Future Enhancements

Possible future implementations:

1. **CachedDataProvider**: Wraps another provider with caching
2. **ApiDataProvider**: Loads from REST API
3. **LocalStorageDataProvider**: Loads from localStorage (for offline mode)
4. **MockDataProvider**: Returns mock data for testing
5. **CompositeDataProvider**: Merges data from multiple sources

All would implement the same `DataProvider` interface, making them interchangeable.
