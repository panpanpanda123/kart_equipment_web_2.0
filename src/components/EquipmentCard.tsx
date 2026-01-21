import { useState } from 'react';
import type { EquipmentItem } from '../types';
import { useHover } from '../hooks/useHover';
import { useLongPress } from '../hooks/useLongPress';
import { DetailCard } from './DetailCard';

interface EquipmentCardProps {
  item: EquipmentItem;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
}

/**
 * EquipmentCard component displays a single equipment item in the library
 * 
 * Features:
 * - Displays equipment thumbnail icon and model name
 * - Handles click for selection/deselection
 * - Handles double-click for quick equip
 * - Supports drag and drop
 * - Applies selected state styling (highlighted border)
 * - Supports hover and long-press events for DetailCard (Phase 2)
 * 
 * Validates: Requirements 6.1, 6.4
 */
export function EquipmentCard({
  item,
  isSelected,
  onClick,
  onDoubleClick,
}: EquipmentCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [detailCardMode, setDetailCardMode] = useState<'hover' | 'longpress' | null>(null);
  const [touchPoint, setTouchPoint] = useState<{ x: number; y: number } | undefined>();
  const [virtualElement, setVirtualElement] = useState<{ getBoundingClientRect: () => DOMRect } | undefined>();

  // Desktop hover interaction
  const { handlers: hoverHandlers } = useHover({
    delay: 200,
    onHoverStart: (event) => {
      setVirtualElement({
        getBoundingClientRect: () => ({
          width: 0,
          height: 0,
          x: event.clientX,
          y: event.clientY,
          top: event.clientY,
          left: event.clientX,
          right: event.clientX,
          bottom: event.clientY,
        } as DOMRect),
      });
      setDetailCardMode('hover');
      setShowDetailCard(true);
    },
    onHoverEnd: () => {
      setShowDetailCard(false);
      setDetailCardMode(null);
      setVirtualElement(undefined);
    },
  });

  // Mobile long-press interaction
  const { handlers: longPressHandlers } = useLongPress({
    delay: 500,
    moveThreshold: 10,
    onLongPress: (event, point) => {
      setTouchPoint(point);
      setDetailCardMode('longpress');
      setShowDetailCard(true);
    },
  });

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      itemId: item.id,
      type: 'equipment',
    }));
    console.log('🎯 Drag start:', item.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    console.log('🎯 Drag end');
  };

  const handleCloseDetailCard = () => {
    setShowDetailCard(false);
    setDetailCardMode(null);
    setTouchPoint(undefined);
    setVirtualElement(undefined);
  };

  return (
    <>
      <button
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        {...hoverHandlers}
        {...longPressHandlers}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      className={`
        w-full aspect-square
        bg-white border-2 
        ${isSelected ? 'border-blue-600 shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] scale-105' : 'border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        hover:bg-gray-50 hover:scale-105 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
        active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
        transition-all duration-150
        flex flex-col items-center justify-center gap-1 p-2
        cursor-grab active:cursor-grabbing
      `}
      aria-label={`选择装备: ${item.displayName}`}
      aria-pressed={isSelected}
      title={`${item.displayName}\n单击选择 | 双击快速装配 | 拖拽到槽位`}
    >
      {/* Equipment thumbnail icon */}
      <div className="w-full h-2/3 flex items-center justify-center">
        <img
          src={item.icon}
          alt={item.displayName}
          className="max-w-full max-h-full object-contain pixelated pointer-events-none"
          loading="lazy"
        />
      </div>

      {/* Equipment model name */}
      <div className="w-full h-1/3 flex items-center justify-center">
        <span className="text-[10px] font-medium text-black text-center line-clamp-2 break-words">
          {item.model}
        </span>
      </div>
      </button>

      {/* DetailCard for hover/long-press */}
      <DetailCard
        item={item}
        isVisible={showDetailCard}
        virtualElement={detailCardMode === 'hover' ? virtualElement : undefined}
        anchorPosition={detailCardMode === 'longpress' ? touchPoint : undefined}
        onClose={handleCloseDetailCard}
      />
    </>
  );
}
