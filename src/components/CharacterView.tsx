import type { SlotConfig, EquipmentItem } from '../types';
import { EquipmentSlot } from './EquipmentSlot';
import { CompatibilityChecker } from '../services/compatibilityChecker';

interface CharacterViewProps {
  characterImage: string;
  slots: SlotConfig[];
  equippedItems: Map<string, string[]>;
  selectedItemId: string | null;
  items: EquipmentItem[];
  onSlotClick: (slotId: string) => void;
  onSlotDrop: (slotId: string, itemId: string) => void;
}

/**
 * CharacterView component displays the racing driver character with equipment slots
 * 
 * Features:
 * - Displays pixel-art racing driver character image
 * - Renders 10 EquipmentSlot components at configured positions
 * - Uses relative positioning for container, absolute for slots
 * - Responsive scaling (slots scale proportionally with container)
 * - Highlights compatible slots when item is selected
 * - Grays out incompatible slots when item is selected
 * 
 * Validates: Requirements 1.1, 1.2, 1.5, 13.3
 */
export function CharacterView({
  characterImage,
  slots,
  equippedItems,
  selectedItemId,
  items,
  onSlotClick,
  onSlotDrop,
}: CharacterViewProps) {
  // Find selected item for compatibility checking
  const selectedItem = selectedItemId
    ? items.find(item => item.id === selectedItemId)
    : null;

  // Get compatible slots if an item is selected
  const compatibleSlots = selectedItem
    ? CompatibilityChecker.getCompatibleSlots(selectedItem, slots)
    : [];
  
  const compatibleSlotIds = new Set(compatibleSlots.map(s => s.id));

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      {/* Character container with relative positioning */}
      <div className="relative w-full max-w-md aspect-[3/4] bg-gray-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Character image */}
        <img
          src={characterImage}
          alt="赛车手"
          className="w-full h-full object-contain pixelated"
          onError={(e) => {
            // Fallback: show placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.placeholder')) {
              const placeholder = document.createElement('div');
              placeholder.className = 'placeholder absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200';
              placeholder.innerHTML = '<div class="text-center"><div class="text-4xl mb-2">🏎️</div><div class="text-sm text-gray-600">赛车手形象</div></div>';
              parent.appendChild(placeholder);
            }
          }}
        />

        {/* Equipment slots - absolutely positioned */}
        {slots.map((slot) => {
          const equippedItemIds = equippedItems.get(slot.id) || [];
          const isHighlighted = selectedItem !== null && compatibleSlotIds.has(slot.id);
          const isGrayedOut = selectedItem !== null && !compatibleSlotIds.has(slot.id);

          return (
            <EquipmentSlot
              key={slot.id}
              slot={slot}
              equippedItemIds={equippedItemIds}
              isHighlighted={isHighlighted}
              isGrayedOut={isGrayedOut}
              items={items}
              onClick={() => onSlotClick(slot.id)}
              onDrop={(itemId) => onSlotDrop(slot.id, itemId)}
            />
          );
        })}
      </div>
    </div>
  );
}
