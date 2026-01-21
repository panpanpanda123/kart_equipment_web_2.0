import type { EquipmentItem } from '../types';
import { EquipmentCard } from './EquipmentCard';

interface EquipmentLibraryProps {
  items: EquipmentItem[];
  selectedItemId: string | null;
  onItemSelect: (itemId: string) => void;
  onItemDoubleClick: (itemId: string) => void;
}

/**
 * EquipmentLibrary component displays all available equipment items in a responsive grid
 * 
 * Features:
 * - Responsive grid layout using CSS Grid with auto-fill
 * - Renders EquipmentCard components for each item
 * - Passes selection state to child cards
 * - Handles item selection through callback
 * 
 * Grid behavior:
 * - Desktop: Multiple columns based on available width
 * - Mobile: Fewer columns, maintains readability
 * - Auto-fill ensures optimal use of space
 * 
 * Validates: Requirements 3.5, 13.4
 */
export function EquipmentLibrary({
  items,
  selectedItemId,
  onItemSelect,
  onItemDoubleClick,
}: EquipmentLibraryProps) {
  return (
    <div className="w-full h-full overflow-y-auto p-4">
      {/* Responsive grid layout with smaller cards for more content */}
      <div
        className="
          grid gap-3
          grid-cols-[repeat(auto-fill,minmax(90px,1fr))]
          sm:grid-cols-[repeat(auto-fill,minmax(100px,1fr))]
          md:grid-cols-[repeat(auto-fill,minmax(110px,1fr))]
        "
      >
        {items.map((item) => (
          <EquipmentCard
            key={item.id}
            item={item}
            isSelected={selectedItemId === item.id}
            onClick={() => onItemSelect(item.id)}
            onDoubleClick={() => onItemDoubleClick(item.id)}
          />
        ))}
      </div>

      {/* Empty state message */}
      {items.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-center">
            暂无装备数据
            <br />
            <span className="text-sm">请检查配置文件</span>
          </p>
        </div>
      )}
    </div>
  );
}
