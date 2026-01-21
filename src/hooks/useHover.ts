import { useRef, useCallback, useState } from 'react';

/**
 * Options for useHover hook
 */
export interface UseHoverOptions {
  /** Delay in milliseconds before showing hover content (default: 200ms) */
  delay?: number;
  /** Callback when hover starts (after delay) */
  onHoverStart?: (event: React.MouseEvent) => void;
  /** Callback when hover ends */
  onHoverEnd?: () => void;
}

/**
 * Hook for handling hover interactions with delay
 * 
 * Features:
 * - Configurable delay before triggering hover (default 200ms)
 * - Immediate cleanup on mouse leave
 * - Prevents memory leaks by cleaning up timers
 * 
 * Validates: Requirements 4.1-4.4
 * 
 * @param options - Configuration options
 * @returns Object with hover event handlers and state
 */
export function useHover(options: UseHoverOptions = {}) {
  const { delay = 200, onHoverStart, onHoverEnd } = options;
  
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const lastEventRef = useRef<React.MouseEvent | null>(null);

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    lastEventRef.current = event;
    
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    // Set new timeout for hover delay
    timeoutRef.current = window.setTimeout(() => {
      setIsHovering(true);
      if (onHoverStart && lastEventRef.current) {
        onHoverStart(lastEventRef.current);
      }
    }, delay);
  }, [delay, onHoverStart]);

  const handleMouseLeave = useCallback(() => {
    // Clear timeout immediately
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Hide immediately
    setIsHovering(false);
    lastEventRef.current = null;
    
    if (onHoverEnd) {
      onHoverEnd();
    }
  }, [onHoverEnd]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    lastEventRef.current = event;
  }, []);

  return {
    isHovering,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseMove: handleMouseMove,
    },
  };
}
