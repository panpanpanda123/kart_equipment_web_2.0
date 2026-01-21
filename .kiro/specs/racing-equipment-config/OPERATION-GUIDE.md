# 操作指南：如何正确使用装备配置系统

## 🎮 正确的操作流程

### 装配装备的完整步骤

#### 步骤1: 选择装备（单击）
**操作**: 在右侧装备库中**单击**一个装备卡片

**预期效果**:
- ✅ 装备卡片边框变为**蓝色**（选中状态）
- ✅ 左侧兼容槽位显示**绿色边框**+光环
- ✅ 左侧不兼容槽位变**灰色**（透明度降低）

**示例**: 单击"Arai GP-7RC"头盔
- 头盔卡片：蓝色边框
- 左侧头盔槽位：绿色高亮
- 其他槽位：灰化

#### 步骤2: 装配到槽位（单击）
**操作**: **单击**左侧绿色高亮的槽位

**预期效果**:
- ✅ 装备卡片边框恢复**黑色**（选中状态清除）
- ✅ 槽位显示装备图标（彩色方块）
- ✅ 所有槽位恢复正常状态（无高亮/灰化）
- ✅ StatusBar计数增加

---

## 🔍 详细操作示例

### 示例1: 装配头盔

1. **单击**右侧红色的"Arai GP-7RC"头盔卡片
   - 观察：卡片边框变蓝色
   - 观察：左侧头盔槽位变绿色
   
2. **单击**左侧绿色的头盔槽位
   - 观察：头盔卡片边框恢复黑色
   - 观察：头盔槽位显示红色方块
   - 观察：StatusBar显示 "1/12 (必选: 1/2)"

### 示例2: 装配护肋

1. **单击**右侧绿色的"Bengio BRV Pro"护肋卡片
   - 观察：卡片边框变蓝色
   - 观察：左侧护肋槽位变绿色
   
2. **单击**左侧绿色的护肋槽位
   - 观察：护肋卡片边框恢复黑色
   - 观察：护肋槽位显示绿色方块
   - 观察：StatusBar显示 "2/12 (必选: 2/2)" + 绿色✓

### 示例3: 装配多件装备

重复上述步骤，依次装配：
1. 头盔 → 头盔槽位
2. 护肋 → 护肋槽位
3. 手套 → 手套槽位
4. 赛车服 → 赛车服槽位

**最终结果**:
- 4个槽位都显示装备图标
- StatusBar显示 "4/12 (必选: 2/2)" + 绿色✓

---

## ❌ 常见错误操作

### 错误1: 双击装备
**错误操作**: 双击装备卡片

**问题**: 
- 第一次点击：选中装备
- 第二次点击：取消选中装备
- 结果：装备没有被选中

**正确操作**: **单击一次**装备卡片

### 错误2: 点击不兼容的槽位
**错误操作**: 选中头盔后，点击灰色的手套槽位

**结果**: 
- 显示Toast: "此装备无法装配到该槽位"
- 头盔保持选中状态（蓝色边框）

**正确操作**: 点击**绿色高亮**的槽位

### 错误3: 没有先选择装备
**错误操作**: 直接点击空槽位（没有选中任何装备）

**结果**: 
- 无反应（因为没有装备可装配）

**正确操作**: 先选择装备，再点击槽位

---

## 🐛 故障排查

### 问题1: 点击装备没有反应

**检查清单**:
1. ✅ 打开浏览器DevTools (F12)
2. ✅ 切换到Console标签
3. ✅ 刷新页面 (F5)
4. ✅ 点击一个装备
5. ✅ 查看Console是否有日志输出

**预期日志**:
```
📊 AppState changed: { selectedItemId: 'helmet-001', ... }
```

**如果没有日志**:
- 检查JavaScript是否有错误（Console中的红色错误）
- 检查网络请求是否成功（Network标签）

### 问题2: 点击槽位没有反应

**检查清单**:
1. ✅ 确认装备已选中（蓝色边框）
2. ✅ 确认点击的是绿色高亮的槽位
3. ✅ 查看Console日志

**预期日志**:
```
🔍 handleSlotClick: { slotId: 'helmet', selectedItemId: 'helmet-001', ... }
✅ Equipping item: { slotId: 'helmet', itemId: 'helmet-001', ... }
📊 AppState changed: { selectedItemId: null, equippedItemsSize: 1, ... }
```

**如果看到错误日志**:
- 检查是否显示Toast通知
- 检查兼容性是否正确

### 问题3: 装备消失或只能装备一件

**检查清单**:
1. ✅ 查看Console日志中的`equippedItemsSize`
2. ✅ 装配第2件装备后，`equippedItemsSize`应该变为2

**预期日志**:
```
📊 AppState changed: { equippedItemsSize: 1, equippedItems: [['helmet', ['helmet-001']]] }
📊 AppState changed: { equippedItemsSize: 2, equippedItems: [['helmet', ['helmet-001']], ['rib-protector', ['rib-001']]] }
```

**如果`equippedItemsSize`一直是1**:
- 这是之前的bug，应该已经修复
- 确认代码已更新（刷新页面 Ctrl+F5）

---

## 📹 完整操作演示

### 场景: 装配4件装备

```
1. 刷新页面 (F5)
   → 看到：空槽位，StatusBar显示 "0/12 (必选: 0/2)"

2. 单击右侧红色头盔卡片
   → 看到：卡片蓝色边框，头盔槽位绿色高亮

3. 单击左侧绿色头盔槽位
   → 看到：头盔槽位显示红色方块，StatusBar显示 "1/12 (必选: 1/2)"

4. 单击右侧绿色护肋卡片
   → 看到：卡片蓝色边框，护肋槽位绿色高亮

5. 单击左侧绿色护肋槽位
   → 看到：护肋槽位显示绿色方块，StatusBar显示 "2/12 (必选: 2/2)" + 绿色✓

6. 单击右侧蓝色手套卡片
   → 看到：卡片蓝色边框，手套槽位绿色高亮

7. 单击左侧绿色手套槽位
   → 看到：手套槽位显示蓝色方块，StatusBar显示 "3/12 (必选: 2/2)" + 绿色✓

8. 单击右侧橙色赛车服卡片
   → 看到：卡片蓝色边框，赛车服槽位绿色高亮

9. 单击左侧绿色赛车服槽位
   → 看到：赛车服槽位显示橙色方块，StatusBar显示 "4/12 (必选: 2/2)" + 绿色✓

最终结果：4个槽位都有装备，StatusBar显示正确
```

---

## 🔧 调试技巧

### 1. 查看完整状态
在Console中输入：
```javascript
// 查看当前装备状态
console.log('Current equipped items:', 
  Array.from(document.querySelector('[data-equipped]')?.dataset || {})
);
```

### 2. 手动触发装配
在Console中输入：
```javascript
// 这不会工作，因为React组件的状态是私有的
// 但可以通过React DevTools查看
```

### 3. 使用React DevTools
1. 安装React DevTools扩展
2. 打开DevTools → Components标签
3. 选择App组件
4. 查看`appState`的值
5. 观察`equippedItems` Map的内容

---

## 📊 Console日志解读

### 正常的装配流程日志

```
// 初始状态
📊 AppState changed: { 
  selectedItemId: null, 
  equippedItemsSize: 0, 
  equippedItems: [] 
}

// 选择装备
📊 AppState changed: { 
  selectedItemId: 'helmet-001', 
  equippedItemsSize: 0, 
  equippedItems: [] 
}

// 点击槽位
🔍 handleSlotClick: { 
  slotId: 'helmet', 
  selectedItemId: 'helmet-001', 
  currentEquipped: [],
  currentEquippedItemsSize: 0,
  allEquippedItems: []
}

// 装配成功
✅ Equipping item: { 
  slotId: 'helmet', 
  itemId: 'helmet-001', 
  newEquippedForSlot: ['helmet-001'],
  newEquippedItemsSize: 1,
  allNewEquippedItems: [['helmet', ['helmet-001']]]
}

// 状态更新
📊 AppState changed: { 
  selectedItemId: null, 
  equippedItemsSize: 1, 
  equippedItems: [['helmet', ['helmet-001']]] 
}
```

### 关键指标

- `selectedItemId`: 当前选中的装备ID（选中时不为null）
- `equippedItemsSize`: 已装配的槽位数量（应该逐渐增加）
- `equippedItems`: 完整的装备Map（应该包含所有已装配的装备）

---

## ✅ 验证清单

完成以下操作，确认系统正常工作：

- [ ] 单击装备，卡片边框变蓝色
- [ ] 槽位正确高亮（绿色）和灰化
- [ ] 单击绿色槽位，装备成功装配
- [ ] 装备卡片边框恢复黑色
- [ ] 槽位显示装备图标
- [ ] StatusBar计数正确增加
- [ ] 可以装配多件装备（至少4件）
- [ ] 装配头盔+护肋后显示绿色✓
- [ ] Console日志显示正确的状态变化
- [ ] `equippedItemsSize`逐渐增加（1, 2, 3, 4...）

---

**如果以上所有检查都通过，系统工作正常！** ✅

**如果仍有问题，请提供**:
1. Console中的完整日志
2. 具体的操作步骤
3. 预期结果 vs 实际结果
