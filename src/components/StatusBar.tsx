import type { SlotConfig } from '../types';

interface StatusBarProps {
  equippedItems: Map<string, string[]>;
  slots: SlotConfig[];
  onReset: () => void;
}

/**
 * StatusBar component displays equipment statistics and reset functionality
 * 
 * Displays:
 * - "已装配: X/Y 件装备 (必选: M/N)"
 *   - X = total equipped items (sum of all array lengths in equippedItems)
 *   - Y = total capacity (sum of all slot.maxCount)
 *   - M = count of required slots with at least one item
 *   - N = total required slots count
 * - Completeness indicator (green checkmark when all required slots filled)
 * - Reset button to clear all equipment
 * 
 * Validates: Requirements 12.2, 12.4, 12.5
 */
export function StatusBar({ equippedItems, slots, onReset }: StatusBarProps) {
  // Calculate X: total equipped items count
  const totalEquipped = Array.from(equippedItems.values()).reduce(
    (sum, items) => sum + items.length,
    0
  );

  // Calculate Y: total capacity (sum of all maxCount)
  const totalCapacity = slots.reduce((sum, slot) => sum + slot.maxCount, 0);

  // Calculate N: total required slots count
  const totalRequiredSlots = slots.filter(slot => slot.required).length;

  // Calculate M: count of required slots with at least one item
  const filledRequiredSlots = slots.filter(slot => {
    if (!slot.required) return false;
    const items = equippedItems.get(slot.id);
    return items && items.length > 0;
  }).length;

  // Check if all required slots are filled (M === N)
  const isComplete = filledRequiredSlots === totalRequiredSlots;

  return (
    <div className="w-full bg-gray-100 border-t-2 border-black px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Equipment count display */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-black">
            已装配: {totalEquipped}/{totalCapacity} 件装备 (必选: {filledRequiredSlots}/{totalRequiredSlots})
          </span>
          
          {/* Completeness indicator - green checkmark when all required slots filled */}
          {isComplete && (
            <span 
              className="text-green-600 font-bold text-lg"
              title="所有必选槽位已装配"
              aria-label="配置完整"
            >
              ✓
            </span>
          )}
        </div>

        {/* Reset button with pixel-art styling */}
        <button
          onClick={onReset}
          className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-4 py-2 text-sm font-medium hover:bg-gray-50 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          aria-label="重置所有装备"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
