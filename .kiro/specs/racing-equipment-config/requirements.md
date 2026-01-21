# Requirements Document

## Introduction

本文档定义了赛车手装备配置系统的功能需求。该系统是一个单页应用，允许用户通过可视化界面为像素风赛车手形象配置装备，包括头盔、护肋、手套等10个槽位的装备管理。

## Glossary

- **System**: 赛车手装备配置系统
- **Equipment_Slot**: 装备槽位，赛车手形象上可以装配装备的位置，具有type、maxCount、allowedTypes属性
- **Equipment_Item**: 装备物品，可以被装配到槽位的物品，具有type、allowedSlots属性
- **Equipment_Library**: 装备库，显示所有可用装备的网格视图
- **Detail_Card**: 详情卡，显示装备详细信息的浮层
- **Configuration_Manager**: 配置管理器，负责加载和管理master-config.json
- **Storage_Manager**: 存储管理器，负责localStorage的读写，使用key "racing-equipment-config-v1"
- **Data_Provider**: 数据提供者，抽象数据加载层，定义loadConfig()方法，返回包含items的完整配置
- **Application_State**: 应用状态，包含selectedItemId（当前选中装备ID或null）和equippedItems（Map<slotId, itemId[]>结构，支持maxCount>1的槽位）
- **Compatibility_Check**: 兼容性检查，判断装备是否可装配到槽位的逻辑：(item.allowedSlots为空数组或包含slot.id) AND (slot.allowedTypes为非空数组且包含item.type)。注：slot.allowedTypes必须为非空数组，空数组表示不允许任何装备类型

## Requirements

### Requirement 1: 界面布局

**User Story:** 作为用户，我希望看到清晰的界面布局，以便我能够方便地查看赛车手形象、装备槽位和装备库。

#### Acceptance Criteria

1. THE System SHALL display a pixel-art racing driver character on the left side of the interface
2. THE System SHALL display 10 equipment slot hotspots overlaid on the character image at configured positions
3. THE System SHALL display an equipment library grid on the right side showing thumbnail icons and model names
4. THE System SHALL display a status bar at the bottom of the interface
5. WHEN the viewport size changes, THE System SHALL maintain responsive layout using relative percentage positioning

### Requirement 2: 装备槽位配置

**User Story:** 作为系统管理员，我希望通过配置文件定义装备槽位，以便我能够灵活调整槽位类型、位置和规则。

#### Acceptance Criteria

1. THE Configuration_Manager SHALL load slot definitions from master-config.json including position, size, type, required flag, allowed types, and maxCount
2. THE System SHALL support exactly 10 equipment slots with the following types: 头盔, 头套, 手套, 赛车服, 护肋, 赛车鞋, 饰品1, 饰品2, 饰品3, 饰品4
3. THE System SHALL mark 头盔 and 护肋 slots as required
4. THE System SHALL use relative percentage coordinates for all slot positions to enable responsive scaling
5. WHERE a slot has maxCount greater than 1, THE System SHALL allow multiple items of the same type to be equipped

### Requirement 3: 装备数据管理

**User Story:** 作为用户，我希望系统能够加载和显示装备数据，以便我能够查看可用的装备选项。

#### Acceptance Criteria

1. THE Data_Provider SHALL load equipment data from master-config.json containing at least 12 items covering all equipment types
2. WHEN loading equipment data, THE System SHALL validate that each item contains required fields: id, type, brand, model, displayName, icon, image, summary
3. THE System SHALL support optional equipment specifications including weight_g, vents, and certs array
4. THE System SHALL support optional fields including tags, aliases, and allowedSlots for each equipment item
5. THE Equipment_Library SHALL display all loaded equipment items in a grid layout with thumbnail icons and model names

### Requirement 4: 装备详情显示（桌面端）

**User Story:** 作为桌面端用户，我希望鼠标悬停在装备上时能看到详细信息，以便我能够了解装备的规格和特性。

#### Acceptance Criteria

1. WHEN the user hovers over an equipment item on desktop, THE System SHALL display a Detail_Card with complete equipment information after a 200ms delay
2. WHILE the mouse is moving, THE Detail_Card SHALL update its position using Floating UI's virtual element API with requestAnimationFrame throttling to prevent excessive re-renders
3. THE Detail_Card SHALL be positioned with a 10px offset from the cursor, and WHEN it would extend beyond viewport boundaries, THE System SHALL flip its position using Floating UI's flip middleware
4. WHEN the mouse leaves the equipment item, THE System SHALL hide the Detail_Card immediately
5. THE Detail_Card SHALL display brand, model, summary, specs (weight, vents), and certification names without explanations
6. THE Detail_Card data structure SHALL include reserved fields for future Phase 2 capability: certification comparison, advantages/disadvantages, and applicable scenarios (not displayed in Phase 1)

### Requirement 5: 装备详情显示（移动端）

**User Story:** 作为移动端用户，我希望长按装备时能看到详细信息，以便我能够在触摸设备上查看装备规格。

#### Acceptance Criteria

1. WHEN the user presses and holds an equipment item for 500ms or longer on mobile, THE System SHALL display a Detail_Card anchored 20px above the touch point
2. WHEN the user taps outside the Detail_Card, THE System SHALL close the Detail_Card
3. WHEN the user moves their finger during the long-press (more than 10px from initial touch point), THE System SHALL cancel the long-press and not show the Detail_Card
4. THE Detail_Card SHALL remain visible until explicitly closed by tapping outside or until another item is long-pressed
5. THE Detail_Card SHALL display the same information as the desktop version, using Floating UI library for positioning and boundary detection
6. THE Detail_Card data structure SHALL include reserved fields for future Phase 2 capability: certification comparison, advantages/disadvantages, and applicable scenarios (not displayed in Phase 1)

### Requirement 6: 装备选择交互

**User Story:** 作为用户，我希望能够选择装备，以便我能够将其装配到槽位上。

#### Acceptance Criteria

1. WHEN the user clicks an unselected equipment item, THE System SHALL set Application_State.selectedItemId to that item's ID and apply visual highlighting
2. WHEN an equipment item is selected, THE System SHALL highlight all compatible equipment slots based on Compatibility_Check
3. WHEN an equipment item is selected, THE System SHALL gray out all incompatible equipment slots
4. WHEN the user clicks a selected equipment item again, THE System SHALL set Application_State.selectedItemId to null and remove all slot highlighting
5. THE System SHALL allow only one equipment item to be selected at a time (selectedItemId is a single value, not an array)

### Requirement 7: 装备装配交互

**User Story:** 作为用户，我希望能够将选中的装备装配到槽位上，以便我能够配置赛车手的装备。

#### Acceptance Criteria

1. WHEN a user clicks a compatible empty slot with an equipment item selected, THE System SHALL add the item ID to Application_State.equippedItems[slotId] array and set selectedItemId to null
2. WHEN a user clicks an occupied slot with an equipment item selected AND the slot has not reached maxCount, THE System SHALL add the item ID to that slot's array and set selectedItemId to null
3. WHEN a user clicks an occupied slot with an equipment item selected AND the slot has reached maxCount, THE System SHALL display toast "该槽位已满（最多X件）" where X equals slot.maxCount, and keep selectedItemId unchanged
4. WHEN a user attempts to equip an item to an incompatible slot (Compatibility_Check fails), THE System SHALL display toast "此装备无法装配到该槽位" and keep selectedItemId unchanged
5. THE System SHALL only clear selectedItemId after successful equipping, not after failed attempts

### Requirement 8: 装备卸载交互

**User Story:** 作为用户，我希望能够卸载已装配的装备，以便我能够更换或移除装备。

#### Acceptance Criteria

1. WHEN a user clicks an occupied equipment slot on desktop with no item selected (Application_State.selectedItemId is null), THE System SHALL remove the last item from Application_State.equippedItems[slotId] array
2. WHEN a user long-presses an occupied equipment slot on mobile with no item selected, THE System SHALL remove the last item from that slot's array
3. WHEN a user clicks an occupied slot with an item selected, THE System SHALL follow Requirement 7.2 装配行为 instead of unequipping
4. WHEN an item is unequipped, THE System SHALL update the slot visual to show remaining items or empty state
5. THE System SHALL allow unequipping items from any slot regardless of whether it is required

### Requirement 9: 数据持久化

**User Story:** 作为用户，我希望系统能够保存我的装备配置，以便我刷新页面后能够恢复之前的配置状态。

#### Acceptance Criteria

1. WHEN a user equips or unequips an item, THE Storage_Manager SHALL immediately save Application_State.equippedItems to localStorage using key "racing-equipment-config-v1"
2. WHEN the application loads, THE Storage_Manager SHALL restore the saved configuration from localStorage and populate Application_State.equippedItems
3. WHEN restoring configuration, THE System SHALL validate that all saved equipment item IDs exist in the current loaded data, and SHALL remove invalid entries
4. WHEN the user clicks a reset button, THE System SHALL set Application_State.equippedItems to an empty Map and remove the "racing-equipment-config-v1" key from localStorage
5. WHEN localStorage is unavailable or throws errors, THE System SHALL log the error and operate without persistence, allowing normal usage without saving
6. THE Storage_Manager SHALL store data in JSON format as: {"version": 1, "equipped": {"slotId": ["itemId1", "itemId2"], ...}}

### Requirement 10: 配置文件结构

**User Story:** 作为系统管理员，我希望通过统一的配置文件管理所有系统配置，以便我能够方便地调整系统行为。

#### Acceptance Criteria

1. THE Configuration_Manager SHALL load a master-config.json file containing character, slots, items, ui, and achievements sections
2. THE character section SHALL define the racing driver image configuration
3. THE slots section SHALL define all 10 equipment slot configurations with position, type, required, maxCount, and allowedTypes
4. THE items section SHALL contain at least 12 equipment items with complete data fields
5. THE ui section SHALL define text labels and theme configuration

### Requirement 11: 数据加载架构

**User Story:** 作为开发者，我希望系统使用抽象的数据加载层，以便未来能够轻松替换数据源。

#### Acceptance Criteria

1. THE System SHALL define a Data_Provider interface with method: loadConfig(): Promise<ConfigData>
2. THE System SHALL implement a LocalJsonDataProvider class that loads data from master-config.json in the public directory
3. THE ConfigData return type SHALL include: character, slots: SlotConfig[], items: EquipmentItem[], ui, achievements (items are loaded as part of config, not separately)
4. THE Data_Provider interface SHALL support async loading and SHALL return a Promise for the config operation
5. THE System SHALL allow Data_Provider implementations to be swapped by changing a single import or dependency injection configuration
6. WHEN Data_Provider encounters loading errors, THE System SHALL reject the Promise with a descriptive error message

### Requirement 12: 必选槽位验证

**User Story:** 作为用户，我希望系统能够提示我哪些槽位是必选的，以便我能够确保配置完整。

#### Acceptance Criteria

1. THE System SHALL visually distinguish required slots (头盔, 护肋) from optional slots using a visual indicator (e.g., red border or asterisk)
2. WHEN displaying the status bar, THE System SHALL show: "已装配: X/Y 件装备 (必选: M/N)" where X = total equipped items count, Y = total slot capacity (sum of all maxCount), M = filled required slots count, N = total required slots count
3. THE System SHALL allow users to save configurations even when required slots are empty
4. WHEN all required slots contain at least one item, THE System SHALL display a visual indicator showing configuration completeness (e.g., green checkmark)
5. THE status bar SHALL update in real-time as items are equipped or unequipped

### Requirement 13: 响应式设计

**User Story:** 作为用户，我希望系统能够在不同屏幕尺寸上正常工作，以便我能够在桌面和移动设备上使用。

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE System SHALL switch to mobile layout
2. WHEN the viewport width is 768px or greater, THE System SHALL use desktop layout
3. THE System SHALL scale equipment slot positions proportionally based on character image size
4. THE System SHALL adjust equipment library grid columns based on available width
5. THE System SHALL ensure all interactive elements remain accessible and properly sized on all screen sizes

### Requirement 14: 错误处理和用户反馈

**User Story:** 作为用户，我希望系统能够清晰地告知我操作结果，以便我能够理解系统状态和错误原因。

#### Acceptance Criteria

1. WHEN an invalid operation occurs, THE System SHALL display a pixel-art styled toast notification
2. THE toast notification SHALL automatically dismiss after 3 seconds
3. WHEN equipment fails to load, THE System SHALL display an error message in the equipment library area
4. WHEN configuration fails to save, THE System SHALL notify the user and attempt to retry
5. THE System SHALL provide clear visual feedback for all user interactions including hover, click, and selection states
