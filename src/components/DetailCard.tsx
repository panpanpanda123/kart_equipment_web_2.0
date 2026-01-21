import { useEffect, useRef, useState } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';
import type { EquipmentItem } from '../types';

interface DetailCardProps {
  item: EquipmentItem;
  /** Virtual element for mouse position */
  virtualElement?: { getBoundingClientRect: () => DOMRect };
  /** Whether to show the card */
  isVisible: boolean;
  /** Callback when clicking outside to close (for pinned mode) */
  onClose?: () => void;
  /** Whether this is pinned (from long-press) */
  isPinned?: boolean;
}

/**
 * DetailCard component - Red Bull F1 Racing Style
 * 
 * Features:
 * - Follows mouse cursor with smooth tracking
 * - Can be pinned via long-press for interaction
 * - Red Bull F1 racing aesthetic
 * - Displays full equipment specs
 * 
 * Validates: Requirements 4.1-4.6, 5.1-5.6
 */
export function DetailCard({
  item,
  virtualElement,
  isVisible,
  onClose,
  isPinned = false,
}: DetailCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles, update } = useFloating({
    placement: 'right-start',
    middleware: [
      offset(12),
      flip(),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Set reference element
  useEffect(() => {
    if (virtualElement) {
      refs.setReference(virtualElement);
    }
  }, [refs, virtualElement]);

  // Update position on mouse move (non-pinned mode)
  useEffect(() => {
    if (virtualElement && isVisible && !isPinned) {
      const rafId = requestAnimationFrame(() => {
        update();
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [virtualElement, isVisible, isPinned, update]);

  // Handle click outside to close (pinned mode only)
  useEffect(() => {
    if (!isVisible || !isPinned) return;

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
  }, [isVisible, isPinned, onClose]);

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
        z-50 w-[340px] max-w-[90vw] max-h-[85vh] overflow-y-auto
        bg-gradient-to-br from-[#141428] to-[#1E1E3F]
        border-2 border-[#0600EF]
        rounded-lg
        shadow-[0_8px_32px_rgba(6,0,239,0.4),0_4px_8px_rgba(0,0,0,0.5)]
        ${isPinned ? '' : 'pointer-events-none'}
      `}
    >
      {/* Racing stripe header */}
      <div className="h-1 bg-gradient-to-r from-[#0600EF] via-[#FCD700] to-[#DC0000]" />
      
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-br from-[#141428] to-[#1E1E3F] border-b-2 border-[#0600EF]/30 p-3 flex items-start justify-between z-10">
        <div className="flex-1">
          <h3 className="text-base font-bold text-[#FCD700] mb-1 font-racing tracking-wide">
            {item.brand}
          </h3>
          <p className="text-sm text-white/90 font-semibold">{item.model}</p>
          <p className="text-xs text-[#A9B4C2] mt-0.5">{item.displayName}</p>
        </div>
        {isPinned && (
          <button
            onClick={onClose}
            className="ml-2 w-7 h-7 flex items-center justify-center border-2 border-[#DC0000] bg-[#DC0000]/20 hover:bg-[#DC0000]/40 active:bg-[#DC0000]/60 transition-all rounded text-[#FF1E00] hover:text-white font-bold"
            aria-label="关闭"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Summary */}
        <div className="text-sm text-white/80 leading-relaxed">
          {item.summary}
        </div>

        {/* Specs */}
        {item.specs && (
          <div className="bg-[#0600EF]/10 border border-[#0600EF]/30 rounded-lg p-3">
            <h4 className="text-sm font-bold text-[#FCD700] mb-2 font-racing flex items-center gap-2">
              <span className="w-1 h-4 bg-[#FCD700]" />
              规格参数
            </h4>
            <div className="space-y-2 text-sm">
              {item.specs.weight_g && (
                <div className="flex justify-between items-center">
                  <span className="text-[#A9B4C2]">重量</span>
                  <span className="font-semibold text-white">{item.specs.weight_g}g</span>
                </div>
              )}
              {item.specs.vents && (
                <div className="flex justify-between items-center">
                  <span className="text-[#A9B4C2]">通风口</span>
                  <span className="font-semibold text-white">{item.specs.vents}个</span>
                </div>
              )}
              {item.specs.certs && item.specs.certs.length > 0 && (
                <div>
                  <div className="text-[#A9B4C2] mb-1.5">认证标准</div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.specs.certs.map((cert) => (
                      <span
                        key={cert}
                        className="px-2 py-1 text-xs bg-[#00FF88]/20 border border-[#00FF88] text-[#00FF88] rounded font-semibold"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 2: Certification Comparison */}
        {(item.certComparison || item.advantages || item.disadvantages || item.applicableScenarios) && (
          <div className="bg-[#1E1E3F]/50 border border-[#0600EF]/20 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-left p-3 flex items-center justify-between hover:bg-[#0600EF]/10 transition-colors"
            >
              <span className="text-sm font-bold text-[#FCD700] font-racing flex items-center gap-2">
                <span className="w-1 h-4 bg-[#FCD700]" />
                认证对比详情
              </span>
              <span className="text-[#FCD700] text-lg">{showDetails ? '▼' : '▶'}</span>
            </button>

            {showDetails && (
              <div className="p-3 pt-0 space-y-3 text-sm animate-in fade-in slide-in-from-top-1 duration-150">
                {item.certComparison && (
                  <div className="bg-[#0600EF]/10 p-2 rounded">
                    <p className="font-medium text-white/90 mb-1 text-xs">对比说明</p>
                    <p className="text-xs leading-relaxed text-white/70">{item.certComparison}</p>
                  </div>
                )}

                {item.advantages && item.advantages.length > 0 && (
                  <div>
                    <p className="font-medium text-[#00FF88] mb-1.5 text-xs flex items-center gap-1">
                      <span>✓</span> 优势
                    </p>
                    <ul className="space-y-1 text-xs text-white/70">
                      {item.advantages.map((adv, idx) => (
                        <li key={idx} className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#00FF88]">
                          {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.disadvantages && item.disadvantages.length > 0 && (
                  <div>
                    <p className="font-medium text-[#FF1E00] mb-1.5 text-xs flex items-center gap-1">
                      <span>✗</span> 劣势
                    </p>
                    <ul className="space-y-1 text-xs text-white/70">
                      {item.disadvantages.map((dis, idx) => (
                        <li key={idx} className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#FF1E00]">
                          {dis}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.applicableScenarios && (
                  <div className="bg-[#FCD700]/10 p-2 rounded">
                    <p className="font-medium text-[#FCD700] mb-1 text-xs flex items-center gap-1">
                      <span>🎯</span> 适用场景
                    </p>
                    <p className="text-xs leading-relaxed text-white/70">{item.applicableScenarios}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-[#A9B4C2] mb-2">标签</h4>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-[#0600EF]/20 border border-[#0600EF] text-[#FCD700] rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hint for non-pinned mode */}
        {!isPinned && (
          <div className="pt-2 border-t border-[#0600EF]/20">
            <p className="text-[10px] text-[#A9B4C2] text-center">
              💡 长按装备可固定详情窗口
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
