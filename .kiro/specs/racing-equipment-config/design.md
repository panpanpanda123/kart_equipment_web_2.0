# Design Document: Racing Equipment Configuration System

## Overview

本设计文档描述了赛车手装备配置系统的技术架构和实现细节。该系统是一个基于React + TypeScript的单页应用，使用Vite作为构建工具，Pixelact UI提供像素风格组件，Floating UI处理浮层定位。

系统核心功能包括：
- 可视化装备槽位管理（10个槽位）
- 装备库网格展示
- 装备详情浮层（桌面hover/移动长按）
- 装备装配/卸载交互
- localStorage持久化
- 配置驱动的数据架构

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     App Component                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         DataProvider (Context)                    │  │
│  │  - LocalJsonDataProvider                          │  │
│  │  - Loads master-config.json                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Application State (React State)              │  │
│  │  - selectedItemId: string | null                  │  │
│  │  - equippedItems: Map<slotId, itemId[]>          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │  CharacterView  │  │    EquipmentLibrary          │ │
│  │  - Character    │  │    - EquipmentGrid           │ │
│  │    Image        │  │    - EquipmentCard           │ │
│  │  - EquipmentSlot│  │    - DetailCard (Floating)   │ │
│  │    (x10)        │  │                              │ │
│  └─────────────────┘  └──────────────────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              StatusBar                            │  │
│  │  - Equipment count display                        │  │
│  │  - Reset button                                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Build Tool**: Vite 5.x
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **UI Library**: Pixelact UI (pixel-art components, registry-based import)
- **Positioning**: Floating UI (@floating-ui/react)
- **State Management**: React useState/useContext
- **Storage**: localStorage API
- **Styling**: Tailwind CSS (required for Pixelact UI and custom styles)

### UI Component Strategy

The system uses Pixelact UI components imported on-demand via registry pattern. Styling depends on Tailwind CSS for utility classes and pixel-art aesthetics. If a required Pixelact component is missing or incompatible, the system will fall back to shadcn/ui components with custom pixel-art border styles (e.g., `border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` for pixel-art effect).


## Components and Interfaces

### Core Components

#### 1. App Component
主应用组件，负责整体布局和状态管理。

**Responsibilities:**
- Initialize DataProvider and load configuration
- Manage Application State (selectedItemId, equippedItems)
- Orchestrate child components
- Handle localStorage persistence via StorageManager

**State:**
```typescript
interface AppState {
  selectedItemId: string | null;
  equippedItems: Map<string, string[]>; // slotId -> itemId[]
  config: ConfigData | null;
  loading: boolean;
  error: string | null;
}
```

#### 2. CharacterView Component
显示赛车手形象和装备槽位。

**Props:**
```typescript
interface CharacterViewProps {
  characterImage: string;
  slots: SlotConfig[];
  equippedItems: Map<string, string[]>;
  selectedItemId: string | null;
  items: EquipmentItem[];
  onSlotClick: (slotId: string) => void;
}
```

**Responsibilities:**
- Render character image with responsive sizing
- Render EquipmentSlot components at configured positions
- Handle slot click events

#### 3. EquipmentSlot Component
单个装备槽位的可视化表示。

**Props:**
```typescript
interface EquipmentSlotProps {
  slot: SlotConfig;
  equippedItemIds: string[];
  isHighlighted: boolean;
  isGrayedOut: boolean;
  items: EquipmentItem[];
  onClick: () => void;
}
```

**Responsibilities:**
- Display slot visual indicator
- Show equipped item thumbnail(s)
- Apply highlight/grayed-out styling based on selection state
- Display required indicator for required slots
- Handle click for equip/unequip actions

**Styling:**
- Position: absolute with percentage-based top/left from slot.position
- Size: configurable via slot.size
- Visual states: empty, occupied, highlighted, grayed-out, required


#### 4. EquipmentLibrary Component
装备库容器组件。

**Props:**
```typescript
interface EquipmentLibraryProps {
  items: EquipmentItem[];
  selectedItemId: string | null;
  onItemSelect: (itemId: string) => void;
}
```

**Responsibilities:**
- Render grid layout of EquipmentCard components
- Manage responsive grid columns
- Pass selection state to child cards

#### 5. EquipmentCard Component
单个装备卡片。

**Props:**
```typescript
interface EquipmentCardProps {
  item: EquipmentItem;
  isSelected: boolean;
  onClick: () => void;
  onHover: (event: React.MouseEvent) => void;
  onHoverEnd: () => void;
  onLongPress: (event: React.TouchEvent) => void;
}
```

**Responsibilities:**
- Display equipment thumbnail icon and model name
- Handle click for selection
- Handle hover for desktop detail card (200ms delay)
- Handle long-press for mobile detail card (500ms threshold, 10px movement cancellation)
- Apply selected styling

#### 6. DetailCard Component
装备详情浮层。

**Props:**
```typescript
interface DetailCardProps {
  item: EquipmentItem;
  anchorPosition: { x: number; y: number };
  isVisible: boolean;
  onClose: () => void;
}
```

**Responsibilities:**
- Display complete equipment information (brand, model, summary, specs, certs)
- Use Floating UI for positioning with flip middleware
- Follow mouse cursor on desktop (virtual element + requestAnimationFrame)
- Anchor above touch point on mobile (20px offset)
- Handle boundary detection and flipping
- Reserve UI space for Phase 2 features (certification comparison, advantages/disadvantages, applicable scenarios)

**Implementation Details:**
- Desktop: Use Floating UI's virtual element API to track mouse position
- Throttle position updates with requestAnimationFrame
- Mobile: Use fixed anchor position from touch event
- Apply flip middleware to prevent overflow
- Phase 2 UI: Below certification list, add a collapsible section or tab for "认证对比" showing bullet points and one-sentence conclusion (not long paragraphs)


#### 7. StatusBar Component
底部状态栏。

**Props:**
```typescript
interface StatusBarProps {
  equippedItems: Map<string, string[]>;
  slots: SlotConfig[];
  onReset: () => void;
}
```

**Responsibilities:**
- Calculate and display equipment counts: "已装配: X/Y 件装备 (必选: M/N)"
  - X = total equipped items (sum of all array lengths in equippedItems)
  - Y = total capacity (sum of all slot.maxCount)
  - M = count of required slots with at least one item
  - N = total required slots count
- Display completeness indicator (green checkmark when all required slots filled)
- Provide reset button to clear all equipment

#### 8. Toast Component
像素风格通知组件。

**Props:**
```typescript
interface ToastProps {
  message: string;
  isVisible: boolean;
  duration?: number; // default 3000ms
}
```

**Responsibilities:**
- Display pixel-art styled notification
- Auto-dismiss after duration
- Support error messages for invalid operations

### Service Modules

#### DataProvider Interface
抽象数据加载层。

```typescript
interface DataProvider {
  loadConfig(): Promise<ConfigData>;
}

interface ConfigData {
  character: {
    image: string;
    name: string;
  };
  slots: SlotConfig[];
  items: EquipmentItem[];
  ui: {
    title: string;
    labels: Record<string, string>;
  };
  achievements: any; // placeholder for future
}
```

#### LocalJsonDataProvider Implementation
```typescript
class LocalJsonDataProvider implements DataProvider {
  async loadConfig(): Promise<ConfigData> {
    const response = await fetch('/master-config.json');
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate structural data (fail-fast for critical errors)
    this.validateStructuralData(data);
    
    // Filter invalid items (non-critical, can continue with valid items)
    data.items = this.filterValidItems(data.items);
    
    return data;
  }
  
  private validateStructuralData(data: any): void {
    // Critical: character configuration must be valid
    if (!data.character || !data.character.image) {
      throw new Error('Invalid character configuration');
    }
    
    // Critical: must have exactly 10 slots
    if (!Array.isArray(data.slots) || data.slots.length !== 10) {
      throw new Error('Configuration must contain exactly 10 slots');
    }
    
    // Critical: all slots must have non-empty allowedTypes
    for (const slot of data.slots) {
      if (!Array.isArray(slot.allowedTypes) || slot.allowedTypes.length === 0) {
        throw new Error(`Slot ${slot.id} has empty allowedTypes array`);
      }
    }
    
    // Critical: ui configuration must exist
    if (!data.ui) {
      throw new Error('Missing ui configuration');
    }
  }
  
  private filterValidItems(items: any[]): EquipmentItem[] {
    if (!Array.isArray(items)) {
      console.warn('Items is not an array, using empty array');
      return [];
    }
    
    const validItems = items.filter(item => {
      const isValid = 
        item.id && 
        item.type && 
        item.brand && 
        item.model && 
        item.displayName && 
        item.icon && 
        item.image && 
        item.summary;
      
      if (!isValid) {
        console.warn(`Filtering out invalid item:`, item);
      }
      
      return isValid;
    });
    
    // Warn if fewer than 12 items after filtering (recommended minimum)
    if (validItems.length < 12) {
      console.warn(`Only ${validItems.length} valid items found (recommended: >= 12)`);
    }
    
    return validItems;
  }
}
```


#### StorageManager Module
localStorage持久化管理。

```typescript
const STORAGE_KEY = 'racing-equipment-config-v1';

interface StorageData {
  version: number;
  equipped: Record<string, string[]>; // slotId -> itemId[]
}

class StorageManager {
  static save(equippedItems: Map<string, string[]>): void {
    try {
      const data: StorageData = {
        version: 1,
        equipped: Object.fromEntries(equippedItems)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      // Continue without persistence
    }
  }

  static load(validItemIds: Set<string>): Map<string, string[]> {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) return new Map();

      const data: StorageData = JSON.parse(json);
      const equipped = new Map<string, string[]>();

      // Validate and filter invalid item IDs
      for (const [slotId, itemIds] of Object.entries(data.equipped)) {
        const validIds = itemIds.filter(id => validItemIds.has(id));
        if (validIds.length > 0) {
          equipped.set(slotId, validIds);
        }
      }

      return equipped;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return new Map();
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
```

#### CompatibilityChecker Module
装备兼容性检查逻辑。

```typescript
class CompatibilityChecker {
  static isCompatible(item: EquipmentItem, slot: SlotConfig): boolean {
    // Normalize allowedSlots (undefined or null becomes empty array)
    const allowedSlots = item.allowedSlots ?? [];
    
    // Check allowedSlots constraint (empty array means no restriction)
    const slotAllowed = 
      allowedSlots.length === 0 || 
      allowedSlots.includes(slot.id);

    // Check allowedTypes constraint (must be non-empty array, validated at config load)
    const typeAllowed = 
      slot.allowedTypes.length > 0 && 
      slot.allowedTypes.includes(item.type);

    return slotAllowed && typeAllowed;
  }

  static getCompatibleSlots(
    item: EquipmentItem, 
    slots: SlotConfig[]
  ): SlotConfig[] {
    return slots.filter(slot => this.isCompatible(item, slot));
  }
}
```


## Data Models

### SlotConfig
```typescript
interface SlotConfig {
  id: string;                    // e.g., "helmet", "gloves"
  type: string;                  // e.g., "头盔", "手套"
  displayName: string;           // e.g., "头盔槽"
  position: {                    // Percentage-based positioning relative to character container
    top: string;                 // e.g., "15%"
    left: string;                // e.g., "20%"
  };
  size: {                        // Percentage-based sizing relative to character container width
    width: string;               // e.g., "12%" (12% of character container width)
    height: string;              // e.g., "12%" (maintains aspect ratio)
  };
  required: boolean;             // true for 头盔, 护肋
  maxCount: number;              // Usually 1, can be >1 for accessories
  allowedTypes: string[];        // Must be non-empty array
}
```

**Size Calculation Strategy**: Slot sizes are specified as percentages of the character container width. This ensures slots scale proportionally with the character image across different screen sizes. For example, if the character container is 400px wide and a slot has width "12%", the slot will be 48px. On mobile where the container might be 300px, the same slot becomes 36px, maintaining proper proportions.
```

### EquipmentItem
```typescript
interface EquipmentItem {
  id: string;                    // Unique identifier
  type: string;                  // e.g., "头盔", "手套", "饰品"
  brand: string;                 // Manufacturer
  model: string;                 // Model name
  displayName: string;           // Display name
  icon: string;                  // Thumbnail image path
  image: string;                 // Full image path
  summary: string;               // Brief description
  specs?: {
    weight_g?: number;           // Weight in grams
    vents?: number;              // Number of vents
    certs?: string[];            // Certification names (e.g., ["FIA 8860-2018"])
  };
  tags?: string[];               // Optional tags
  aliases?: string[];            // Alternative names
  allowedSlots?: string[];       // Empty array = no restriction
  
  // Phase 2 reserved fields (not used in Phase 1)
  certComparison?: string;       // Certification comparison
  advantages?: string[];         // Advantages
  disadvantages?: string[];      // Disadvantages
  applicableScenarios?: string[]; // Use cases
}
```

### Application State
```typescript
interface ApplicationState {
  selectedItemId: string | null;
  equippedItems: Map<string, string[]>; // slotId -> itemId[]
}
```

**State Transitions:**
1. **Item Selection**: Click unselected item → set selectedItemId
2. **Item Deselection**: Click selected item → set selectedItemId to null
3. **Successful Equip**: Click compatible slot → add to equippedItems[slotId], set selectedItemId to null
4. **Failed Equip**: Click incompatible/full slot → show toast, keep selectedItemId
5. **Unequip**: Click occupied slot with no selection → remove last item from equippedItems[slotId]


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

**Redundancies Eliminated:**
1. R6.2 (highlight compatible) and R6.3 (gray out incompatible) can be combined into one property about slot visual state based on compatibility
2. R3.3 and R3.4 (optional field support) are redundant - can be combined into one property about optional fields
3. R4.6 and R5.6 (Phase 2 reserved fields) are identical - consolidate into one property
4. R8.1 and R8.2 (unequip on desktop/mobile) are the same behavior - combine into one property
5. R13.1 and R13.2 (layout switching) can be combined into one property about breakpoint behavior

**Properties to Combine:**
- Multiple UI rendering properties (1.3, 1.4, 10.2-10.5) can be consolidated into configuration structure validation
- Status bar count properties (12.2, 12.5) can be combined into one comprehensive counting property

### Core Properties

#### Property 1: Slot Count Invariant
*For any* valid configuration loaded by the system, the number of rendered equipment slots SHALL equal exactly 10.

**Validates: Requirements 1.2, 2.2**

#### Property 2: Required Slots Configuration
*For any* valid configuration, exactly 2 slots (头盔 and 护肋) SHALL be marked as required.

**Validates: Requirements 2.3**

#### Property 3: Slot Position Format
*For any* slot configuration, the position coordinates (top, left) SHALL be expressed as percentage strings (e.g., "15%", "20%").

**Validates: Requirements 2.4**

#### Property 4: Multi-Item Slot Capacity
*For any* slot with maxCount > 1, the system SHALL allow equipping up to maxCount items of compatible types to that slot.

**Validates: Requirements 2.5**


#### Property 5: Equipment Data Validation
*For any* equipment item loaded from configuration, it SHALL contain all required fields: id, type, brand, model, displayName, icon, image, and summary.

**Validates: Requirements 3.2**

#### Property 6: Optional Fields Support
*For any* equipment item, the system SHALL correctly handle items with or without optional fields (specs, tags, aliases, allowedSlots, Phase 2 fields).

**Validates: Requirements 3.3, 3.4, 4.6, 5.6**

#### Property 7: Equipment Library Completeness
*For any* set of equipment items loaded from configuration, all items SHALL appear in the equipment library grid.

**Validates: Requirements 3.5**

#### Property 8: Compatibility Check Correctness
*For any* equipment item and slot pair, the compatibility check SHALL return true if and only if: (item.allowedSlots is empty OR contains slot.id) AND (slot.allowedTypes is non-empty AND contains item.type).

**Validates: Requirements 6.2, 6.3**

#### Property 9: Single Selection Invariant
*For any* application state, at most one equipment item SHALL be selected (selectedItemId is either null or a single string, never multiple values).

**Validates: Requirements 6.5**

#### Property 10: Selection State Transitions
*For any* equipment item, clicking it when unselected SHALL set selectedItemId to that item's ID, and clicking it when selected SHALL set selectedItemId to null.

**Validates: Requirements 6.1, 6.4**

#### Property 11: Successful Equip Clears Selection
*For any* successful equipment operation (adding item to compatible slot), the system SHALL set selectedItemId to null.

**Validates: Requirements 7.1, 7.2, 7.5**

#### Property 12: Failed Equip Preserves Selection
*For any* failed equipment operation (incompatible slot or full slot), the system SHALL keep selectedItemId unchanged and display an appropriate toast message.

**Validates: Requirements 7.3, 7.4, 7.5**


#### Property 13: Unequip Behavior with No Selection
*For any* occupied slot, clicking it when no item is selected (selectedItemId is null) SHALL remove the last item from that slot's array.

**Validates: Requirements 8.1, 8.2**

#### Property 14: Equip Takes Precedence Over Unequip
*For any* occupied slot, clicking it when an item is selected SHALL attempt to equip the selected item (following R7 rules) rather than unequipping.

**Validates: Requirements 8.3**

#### Property 15: Required Slots Can Be Emptied
*For any* slot marked as required, the system SHALL allow unequipping items from it (required status does not prevent unequipping).

**Validates: Requirements 8.5, 12.3**

#### Property 16: Persistence Round Trip
*For any* valid equipped items state, saving to localStorage then loading SHALL produce an equivalent state (excluding invalid item IDs that no longer exist in configuration).

**Validates: Requirements 9.2, 9.3**

#### Property 17: Storage Format Consistency
*For any* equipped items state saved to localStorage, the data SHALL follow the format: {"version": 1, "equipped": {"slotId": ["itemId1", ...], ...}}.

**Validates: Requirements 9.6**

#### Property 18: Graceful Storage Degradation
*For any* localStorage error (unavailable or quota exceeded), the system SHALL continue operating without persistence and log the error.

**Validates: Requirements 9.5**

#### Property 19: Status Bar Count Accuracy
*For any* application state, the status bar SHALL display counts where: X = sum of all equipped item array lengths, Y = sum of all slot maxCounts, M = count of required slots with length > 0, N = total required slots.

**Validates: Requirements 12.2, 12.5**


#### Property 20: Completeness Indicator Logic
*For any* application state, the completeness indicator SHALL be displayed if and only if all required slots contain at least one item.

**Validates: Requirements 12.4**

#### Property 21: Responsive Layout Breakpoint
*For any* viewport width, the system SHALL use mobile layout when width < 768px and desktop layout when width >= 768px.

**Validates: Requirements 13.1, 13.2**

#### Property 22: Proportional Slot Scaling
*For any* character image size change, equipment slot positions SHALL scale proportionally maintaining their percentage-based coordinates.

**Validates: Requirements 1.5, 13.3**

#### Property 23: Toast Auto-Dismiss Timing
*For any* toast notification displayed, it SHALL automatically dismiss after approximately 3 seconds (3000ms ± 100ms tolerance).

**Validates: Requirements 14.2**

#### Property 24: Error Toast Display
*For any* invalid operation (incompatible equip, full slot, load failure, save failure), the system SHALL display a toast notification with an appropriate error message.

**Validates: Requirements 14.1, 14.3, 14.4**

#### Property 25: Detail Card Hover Delay
*For any* equipment item hover event on desktop, the detail card SHALL appear after a delay between 200ms and 250ms.

**Validates: Requirements 4.1**

#### Property 26: Detail Card Positioning
*For any* detail card display, it SHALL be positioned with 10px offset from the anchor point (mouse cursor or touch point) and SHALL flip to the opposite side if it would overflow viewport boundaries.

**Validates: Requirements 4.3**

#### Property 27: Long Press Detection
*For any* touch event on mobile, a long press SHALL be detected after 500ms of continuous touch, and SHALL be cancelled if the finger moves more than 10px from the initial touch point.

**Validates: Requirements 5.1, 5.3**


#### Property 28: Configuration Structure Completeness
*For any* configuration loaded by Data_Provider, it SHALL contain all required sections: character, slots (array of exactly 10), items (array, minimum 12 recommended but not enforced after filtering), ui, and achievements.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

**Note**: If items array has fewer than 12 items after filtering invalid entries, a warning is logged but the system continues to operate.

#### Property 29: Data Provider Error Handling
*For any* loading error encountered by Data_Provider, it SHALL reject the Promise with a descriptive error message.

**Validates: Requirements 11.6**

#### Property 30: AllowedTypes Non-Empty Constraint
*For any* slot configuration, the allowedTypes array SHALL be non-empty (empty array means no equipment can be equipped, which is invalid).

**Validates: Compatibility_Check definition in Glossary**

## Error Handling

### Error Categories

#### 1. Configuration Loading Errors
- **Scenario**: master-config.json fails to load or is malformed
- **Handling**: 
  - Display error message in main content area
  - Log detailed error to console
  - Provide retry button
  - Do not crash the application

#### 2. Data Validation Errors
- **Scenario**: Equipment items are missing required fields or have invalid values
- **Handling**:
  - Log validation errors to console
  - Filter out invalid items (items are non-critical data)
  - Continue with valid items
  - Display warning toast if significant data is missing (e.g., < 12 items after filtering)

**Note**: Structural data (character, slots, ui) uses fail-fast strategy - if invalid, the entire config load fails and displays error screen with retry button. This prevents rendering a broken state with missing slots or character.

#### 3. Storage Errors
- **Scenario**: localStorage is unavailable, quota exceeded, or access denied
- **Handling**:
  - Log error to console
  - Continue operation without persistence
  - Display one-time warning toast: "无法保存配置，刷新后将丢失"
  - All features remain functional

#### 4. User Operation Errors
- **Scenario**: User attempts invalid operation (incompatible equip, full slot)
- **Handling**:
  - Display pixel-art toast with specific error message
  - Keep current state unchanged
  - Auto-dismiss toast after 3 seconds
  - Provide visual feedback (e.g., shake animation)


### Error Messages

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

## Testing Strategy

### Dual Testing Approach

The system will use both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples and edge cases
- Component rendering and UI interactions
- Integration between modules
- Error conditions with specific inputs

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- State transition correctness
- Data validation and transformation

Both approaches are complementary and necessary. Unit tests catch concrete bugs with specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

**Library**: fast-check (for TypeScript/JavaScript)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: racing-equipment-config, Property N: [property text]`
- Use custom generators for domain objects (EquipmentItem, SlotConfig, etc.)

**Example Test Structure**:
```typescript
// Feature: racing-equipment-config, Property 8: Compatibility Check Correctness
test('compatibility check correctness', () => {
  fc.assert(
    fc.property(
      equipmentItemArbitrary,
      slotConfigArbitrary,
      (item, slot) => {
        const result = CompatibilityChecker.isCompatible(item, slot);
        const expected = 
          (item.allowedSlots.length === 0 || item.allowedSlots.includes(slot.id)) &&
          (slot.allowedTypes.length > 0 && slot.allowedTypes.includes(item.type));
        expect(result).toBe(expected);
      }
    ),
    { numRuns: 100 }
  );
});
```


### Unit Testing Focus Areas

#### Component Tests
- CharacterView renders with correct number of slots
- EquipmentSlot displays correct visual states (empty, occupied, highlighted, grayed)
- EquipmentCard handles click and hover events
- DetailCard displays all equipment information fields
- StatusBar calculates and displays correct counts
- Toast component auto-dismisses after 3 seconds

#### Integration Tests
- App component loads configuration and initializes state
- Selecting an item highlights compatible slots
- Clicking a compatible slot equips the item
- Clicking an incompatible slot shows error toast
- Unequipping an item updates the slot visual
- Reset button clears all equipped items and localStorage

#### Edge Cases
- Empty configuration (0 items)
- Configuration with exactly 12 items (minimum)
- Slot with maxCount = 1 (single item)
- Slot with maxCount > 1 (multiple items)
- Item with empty allowedSlots (no restriction)
- Item with specific allowedSlots (restricted)
- localStorage unavailable
- Invalid saved data in localStorage
- Viewport at exactly 768px breakpoint

### Test Data Generators

For property-based tests, create custom generators:

```typescript
// Arbitrary for SlotConfig
const slotConfigArbitrary = fc.record({
  id: fc.constantFrom('helmet', 'balaclava', 'gloves', 'suit', 'rib-protector', 'shoes', 'accessory-1', 'accessory-2', 'accessory-3', 'accessory-4'),
  type: fc.constantFrom('头盔', '头套', '手套', '赛车服', '护肋', '赛车鞋', '饰品'),
  displayName: fc.string(),
  position: fc.record({
    top: fc.integer({ min: 0, max: 100 }).map(n => `${n}%`),
    left: fc.integer({ min: 0, max: 100 }).map(n => `${n}%`)
  }),
  size: fc.record({
    width: fc.integer({ min: 8, max: 20 }).map(n => `${n}%`),
    height: fc.integer({ min: 8, max: 20 }).map(n => `${n}%`)
  }),
  required: fc.boolean(),
  maxCount: fc.integer({ min: 1, max: 4 }),
  allowedTypes: fc.array(
    fc.constantFrom('头盔', '头套', '手套', '赛车服', '护肋', '赛车鞋', '饰品'),
    { minLength: 1, maxLength: 7 }
  )
});

// Arbitrary for valid complete configuration (10 slots, >=12 items, valid structure)
const validConfigArbitrary = fc.record({
  character: fc.record({
    image: fc.constant('/character.png'),
    name: fc.string()
  }),
  slots: fc.constant([
    // Fixed 10 slots with proper IDs and non-empty allowedTypes
    { id: 'helmet', type: '头盔', allowedTypes: ['头盔'], /* ... */ },
    { id: 'balaclava', type: '头套', allowedTypes: ['头套'], /* ... */ },
    // ... (all 10 slots)
  ]),
  items: fc.array(equipmentItemArbitrary, { minLength: 12, maxLength: 50 }),
  ui: fc.record({
    title: fc.string(),
    labels: fc.dictionary(fc.string(), fc.string())
  }),
  achievements: fc.constant({})
});

// Arbitrary for invalid configuration (for error handling tests)
const invalidConfigArbitrary = fc.oneof(
  fc.record({ character: fc.constant(null) }), // Missing character
  fc.record({ slots: fc.array(slotConfigArbitrary, { maxLength: 9 }) }), // Wrong slot count
  fc.record({ slots: fc.array(fc.record({ ...slotConfigArbitrary, allowedTypes: fc.constant([]) })) }), // Empty allowedTypes
  fc.record({ ui: fc.constant(null) }) // Missing ui
);

// Arbitrary for EquipmentItem
const equipmentItemArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('头盔', '头套', '手套', '赛车服', '护肋', '赛车鞋', '饰品'),
  brand: fc.string(),
  model: fc.string(),
  displayName: fc.string(),
  icon: fc.constant('/icons/placeholder.png'),
  image: fc.constant('/images/placeholder.png'),
  summary: fc.string(),
  specs: fc.option(fc.record({
    weight_g: fc.option(fc.integer({ min: 100, max: 2000 })),
    vents: fc.option(fc.integer({ min: 0, max: 20 })),
    certs: fc.option(fc.array(fc.string()))
  })),
  allowedSlots: fc.array(fc.constantFrom('helmet', 'balaclava', 'gloves', 'suit', 'rib-protector', 'shoes', 'accessory-1', 'accessory-2', 'accessory-3', 'accessory-4'))
});
```

### Test Coverage Goals

- **Unit Test Coverage**: > 80% line coverage
- **Property Test Coverage**: All 30 correctness properties implemented
- **Integration Test Coverage**: All major user workflows
- **Edge Case Coverage**: All identified edge cases tested

