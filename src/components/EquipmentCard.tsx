import type { EquipmentItem } from '../types';

interface EquipmentCardProps {
  item: EquipmentItem;
  isSelected: boolean;
  onClick: () => void;
  onHover?: (event: React.MouseEvent) => void;
  onHoverEnd?: () => void;
  onLongPress?: (event: React.TouchEvent) => void;
}

/**
 * EquipmentCard component displays a single equipment item in the library
 * 
 * Features:
 * - Displays equipment thumbnail icon and model name
 * - Handles click for selection/deselection
 * - Applies selected state styling (highlighted border)
 * - Supports hover and long-press events for DetailCard (Phase 2)
 * 
 * Validates: Requirements 6.1, 6.4
 */
export function EquipmentCard({
  item,
  isSelected,
  onClick,
  onHover,
  onHoverEnd,
  onLongPress,
}: EquipmentCardProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onTouchStart={onLongPress}
      className={`
        w-full aspect-square
        bg-white border-2 
        ${isSelected ? 'border-blue-600 shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]' : 'border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
        hover:bg-gray-50
        active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
        transition-all
        flex flex-col items-center justify-center gap-2 p-2
      `}
      aria-label={`选择装备: ${item.displayName}`}
      aria-pressed={isSelected}
    >
      {/* Equipment thumbnail icon */}
      <div className="w-full h-3/4 flex items-center justify-center">
        <img
          src={item.icon}
          alt={item.displayName}
          className="max-w-full max-h-full object-contain pixelated"
          loading="lazy"
        />
      </div>

      {/* Equipment model name */}
      <div className="w-full h-1/4 flex items-center justify-center">
        <span className="text-xs font-medium text-black text-center line-clamp-2 break-words">
          {item.model}
        </span>
      </div>
    </button>
  );
}
