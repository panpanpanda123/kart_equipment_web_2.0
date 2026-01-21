import { useEffect, useRef, useState } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  type Placement,
} from '@floating-ui/react';
import type { EquipmentItem } from '../types';

interface DetailCardProps {
  item: EquipmentItem;
  /** Virtual element for desktop (mouse position) */
  virtualElement?: { getBoundingClientRect: () => DOMRect };
  /** Anchor position for mobile (touch point) */
  anchorPosition?: { x: number; y: number };
  /** Whether to show the card */
  isVisible: boolean;
  /** Callback when clicking outside to close */
  onClose?: () => void;
}

/**
 * DetailCard component displays detailed equipment information
 * 
 * Features:
 * - Desktop: Follows mouse cursor using virtual element
 * - Mobile: Anchored above touch point
 * - Automatic boundary detection and flipping
 * - Displays full equipment specs and Phase 2 fields
 * - Pixel art styling consistent with app theme
 * 
 * Validates: Requirements 4.1-4.6, 5.1-5.6
 */
export function DetailCard({
  item,
  virtualElement,
  anchorPosition,
  isVisible,
  onClose,
}: DetailCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Determine placement based on mode
  const placement: Placement = anchorPosition ? 'top' : 'right-start';

  // Create reference element
  const referenceElement = virtualElement || (anchorPosition ? {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      x: anchorPosition.x,
      y: anchorPosition.y,
      top: anchorPosition.y,
      left: anchorPosition.x,
      right: anchorPosition.x,
      bottom: anchorPosition.y,
    } as DOMRect),
  } : null);

  const { refs, floatingStyles, update } = useFloating({
    placement,
    middleware: [
      offset(anchorPosition ? 20 : 10),
      flip(),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Set reference element
  useEffect(() => {
    if (referenceElement) {
      refs.setReference(referenceElement);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refs]);

  // Update position on mouse move (desktop mode)
  useEffect(() => {
    if (virtualElement && isVisible) {
      const rafId = requestAnimationFrame(() => {
        update();
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [virtualElement, isVisible, update]);

  // Handle click outside to close (mobile mode)
  useEffect(() => {
    if (!isVisible || !anchorPosition) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible, anchorPosition, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={(node) => {
        refs.setFloating(node);
        if (node && cardRef) {
          cardRef.current = node;
        }
      }}
      style={floatingStyles}
      className={`
        z-50 w-[300px] max-w-[90vw]
        bg-white border-2 border-black
        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
        p-4
        animate-in fade-in slide-in-from-bottom-2 duration-200
      `}
    >
      {/* Header */}
      <div className="mb-3 pb-3 border-b-2 border-black">
        <h3 className="text-lg font-bold text-black mb-1">
          {item.brand} {item.model}
        </h3>
        <p className="text-sm text-gray-700">{item.displayName}</p>
      </div>

      {/* Summary */}
      <div className="mb-3">
        <p className="text-sm text-gray-800">{item.summary}</p>
      </div>

      {/* Specs */}
      {item.specs && (
        <div className="mb-3 pb-3 border-b-2 border-black">
          <h4 className="text-sm font-bold text-black mb-2">规格参数</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            {item.specs.weight_g && (
              <li>• 重量: {item.specs.weight_g}g</li>
            )}
            {item.specs.vents && (
              <li>• 通风口: {item.specs.vents}个</li>
            )}
            {item.specs.certs && item.specs.certs.length > 0 && (
              <li>• 认证: {item.specs.certs.join(', ')}</li>
            )}
          </ul>
        </div>
      )}

      {/* Phase 2: Certification Comparison */}
      {(item.certComparison || item.advantages || item.disadvantages || item.applicableScenarios) && (
        <div className="mb-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-left text-sm font-bold text-black mb-2 flex items-center justify-between hover:text-blue-600 transition-colors"
          >
            <span>认证对比</span>
            <span className="text-lg">{showDetails ? '▼' : '▶'}</span>
          </button>

          {showDetails && (
            <div className="space-y-2 text-sm text-gray-700 animate-in fade-in slide-in-from-top-1 duration-150">
              {item.certComparison && (
                <div>
                  <p className="font-medium text-black mb-1">对比说明:</p>
                  <p>{item.certComparison}</p>
                </div>
              )}

              {item.advantages && item.advantages.length > 0 && (
                <div>
                  <p className="font-medium text-green-700 mb-1">优势:</p>
                  <ul className="space-y-0.5">
                    {item.advantages.map((adv, idx) => (
                      <li key={idx}>• {adv}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.disadvantages && item.disadvantages.length > 0 && (
                <div>
                  <p className="font-medium text-red-700 mb-1">劣势:</p>
                  <ul className="space-y-0.5">
                    {item.disadvantages.map((dis, idx) => (
                      <li key={idx}>• {dis}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.applicableScenarios && (
                <div>
                  <p className="font-medium text-blue-700 mb-1">适用场景:</p>
                  <p>{item.applicableScenarios}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-gray-200 border border-black text-black"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
