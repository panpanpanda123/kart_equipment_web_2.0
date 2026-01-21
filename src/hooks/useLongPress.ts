import { useRef, useCallback, useState } from 'react';

/**
 * Options for useLongPress hook
 */
export interface UseLongPressOptions {
  /** Delay in milliseconds before triggering long press (default: 500ms) */
  delay?: number;
  /** Movement threshold in pixels to cancel long press (default: 10px) */
  moveThreshold?: number;
  /** Callback when long press is triggered */
  onLongPress?: (event: React.TouchEvent, touchPoint: { x: number; y: number }) => void;
  /** Callback when long press is cancelled */
  onCancel?: () => void;
}

/**
 * Hook for handling long press interactions on touch devices
 * 
 * Features:
 * - Configurable delay before triggering (default 500ms)
 * - Cancels if finger moves more than threshold (default 10px)
 * - Provides touch point coordinates for positioning
 * - Prevents memory leaks by cleaning up timers
 * 
 * Validates: Requirements 5.1-5.4
 * 
 * @param options - Configuration options
 * @returns Object with touch event handlers and state
 */
export function useLongPress(options: UseLongPressOptions = {}) {
  const { delay = 500, moveThreshold = 10, onLongPress, onCancel } = options;
  
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastEventRef = useRef<React.TouchEvent | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;

    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    lastEventRef.current = event;

    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    // Set new timeout for long press
    timeoutRef.current = window.setTimeout(() => {
      if (startPosRef.current && lastEventRef.current) {
        setIsLongPressing(true);
        if (onLongPress) {
          onLongPress(lastEventRef.current, startPosRef.current);
        }
      }
    }, delay);
  }, [delay, onLongPress]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch || !startPosRef.current) return;

    // Calculate distance moved
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel if moved beyond threshold
    if (distance > moveThreshold) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      startPosRef.current = null;
      
      if (onCancel) {
        onCancel();
      }
    }
  }, [moveThreshold, onCancel]);

  const handleTouchEnd = useCallback(() => {
    // Clear timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Reset state
    setIsLongPressing(false);
    startPosRef.current = null;
    lastEventRef.current = null;
  }, []);

  const handleTouchCancel = useCallback(() => {
    handleTouchEnd();
    if (onCancel) {
      onCancel();
    }
  }, [handleTouchEnd, onCancel]);

  return {
    isLongPressing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}
