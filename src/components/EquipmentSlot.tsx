import { useState } from 'react';
import type { SlotConfig, EquipmentItem } from '../types';
import { useHover } from '../hooks/useHover';
import { useLongPress } from '../hooks/useLongPress';
import { DetailCard } from './DetailCard';

interface EquipmentSlotProps {
  slot: SlotConfig;
  equippedItemIds: string[];
  isHighlighted: boolean;
  isGrayedOut: boolean;
  items: EquipmentItem[];
  onClick: () => void;
  onDrop?: (itemId: string) => void;
}

/**
 * EquipmentSlot component displays a single equipment slot on the character
 * 
 * Features:
 * - Percentage-based positioning (absolute positioning with top/left from config)
 * - Percentage-based sizing (relative to character container width)
 * - Visual states: empty, occupied, highlighted, grayed-out, required
 * - Supports multiple items when maxCount > 1
 * - Handles click for equip/unequip actions
 * - Supports drag and drop
 * 
 * Validates: Requirements 2.4, 7.1-7.5, 8.1-8.5, 12.1
 */
export function EquipmentSlot({
  slot,
  equippedItemIds,
  isHighlighted,
  isGrayedOut,
  items,
  onClick,
  onDrop,
}: EquipmentSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [detailCardMode, setDetailCardMode] = useState<'hover' | 'longpress' | null>(null);
  const [touchPoint, setTouchPoint] = useState<{ x: number; y: number } | undefined>();
  const [hoveredItem, setHoveredItem] = useState<EquipmentItem | null>(null);
  const [virtualElement, setVirtualElement] = useState<{ getBoundingClientRect: () => DOMRect } | undefined>();

  // Find equipped items data
  const equippedItems = equippedItemIds
    .map(id => items.find(item => item.id === id))
    .filter((item): item is EquipmentItem => item !== undefined);

  const isEmpty = equippedItems.length === 0;
  const isFull = equippedItems.length >= slot.maxCount;

  // Desktop hover interaction (only for equipped items)
  const { handlers: hoverHandlers } = useHover({
    delay: 200,
    onHoverStart: (event) => {
      if (isEmpty) return;
      
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
      setHoveredItem(equippedItems[0]); // Show first equipped item
      setDetailCardMode('hover');
      setShowDetailCard(true);
    },
    onHoverEnd: () => {
      setShowDetailCard(false);
      setDetailCardMode(null);
      setHoveredItem(null);
      setVirtualElement(undefined);
    },
  });

  // Mobile long-press interaction (only for equipped items)
  const { handlers: longPressHandlers } = useLongPress({
    delay: 500,
    moveThreshold: 10,
    onLongPress: (event, point) => {
      if (isEmpty) return;
      
      setTouchPoint(point);
      setHoveredItem(equippedItems[0]); // Show first equipped item
      setDetailCardMode('longpress');
      setShowDetailCard(true);
    },
  });

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'equipment' && data.itemId && onDrop) {
        console.log('📦 Drop on slot:', { slotId: slot.id, itemId: data.itemId });
        onDrop(data.itemId);
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  const handleCloseDetailCard = () => {
    setShowDetailCard(false);
    setDetailCardMode(null);
    setTouchPoint(undefined);
    setHoveredItem(null);
    setVirtualElement(undefined);
  };

  // Determine border color based on state
  let borderColor = 'border-gray-400'; // default empty
  if (isDragOver && !isGrayedOut) {
    borderColor = 'border-yellow-500'; // drag over
  } else if (isHighlighted) {
    borderColor = 'border-green-500'; // compatible and item selected
  } else if (isGrayedOut) {
    borderColor = 'border-gray-300'; // incompatible and item selected
  } else if (!isEmpty) {
    borderColor = 'border-blue-500'; // occupied
  }

  // Required indicator
  const showRequired = slot.required && isEmpty;

  return (
    <>
      <button
        onClick={onClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        {...(isEmpty ? {} : hoverHandlers)}
        {...(isEmpty ? {} : longPressHandlers)}
      className={`
        absolute
        border-2 ${borderColor}
        bg-white/80
        shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]
        hover:bg-white hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]
        active:shadow-none active:translate-x-[1px] active:translate-y-[1px]
        transition-all duration-200
        flex items-center justify-center
        ${isGrayedOut ? 'opacity-40 grayscale' : 'opacity-100'}
        ${isHighlighted ? 'ring-2 ring-green-400 ring-offset-1 shadow-[0_0_12px_rgba(34,197,94,0.5)]' : ''}
        ${isDragOver && !isGrayedOut ? 'ring-2 ring-yellow-400 ring-offset-1 scale-105 shadow-[0_0_12px_rgba(234,179,8,0.5)]' : ''}
        ${!isEmpty && !isHighlighted && !isDragOver ? 'shadow-[0_0_8px_rgba(59,130,246,0.3)]' : ''}
      `}
      style={{
        top: slot.position.top,
        left: slot.position.left,
        width: slot.size.width,
        height: slot.size.height,
      }}
      title={`${slot.displayName}${slot.required ? ' (必选)' : ''} - ${equippedItems.length}/${slot.maxCount}\n拖拽装备到此处装配`}
      aria-label={`${slot.displayName}, ${isEmpty ? '空槽位' : `已装配${equippedItems.length}件`}`}
    >
      {/* Required indicator - red asterisk */}
      {showRequired && (
        <span className="absolute -top-1 -right-1 text-red-600 font-bold text-xs">
          *
        </span>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-gray-400 text-xs text-center px-1">
          <div className="font-bold">{slot.type}</div>
        </div>
      )}

      {/* Occupied state - show thumbnails */}
      {!isEmpty && (
        <div className="w-full h-full p-1 flex flex-wrap items-center justify-center gap-0.5">
          {equippedItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="relative"
              style={{
                width: slot.maxCount > 1 ? '45%' : '100%',
                height: slot.maxCount > 1 ? '45%' : '100%',
              }}
            >
              <img
                src={item.icon}
                alt={item.model}
                className="w-full h-full object-contain pixelated"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Full indicator */}
      {isFull && slot.maxCount > 1 && (
        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] px-1 rounded">
          满
        </div>
      )}
      </button>

      {/* DetailCard for hover/long-press on equipped items */}
      {hoveredItem && (
        <DetailCard
          item={hoveredItem}
          isVisible={showDetailCard}
          virtualElement={detailCardMode === 'hover' ? virtualElement : undefined}
          anchorPosition={detailCardMode === 'longpress' ? touchPoint : undefined}
          onClose={handleCloseDetailCard}
        />
      )}
    </>
  );
}
