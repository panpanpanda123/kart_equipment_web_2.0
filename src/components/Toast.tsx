import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  duration?: number; // default 3000ms
  onClose?: () => void;
}

/**
 * Toast notification component with pixel-art styling
 * Auto-dismisses after specified duration (default 3000ms)
 * 
 * Validates: Requirements 14.1, 14.2
 */
export function Toast({ message, isVisible, duration = 3000, onClose }: ToastProps) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);

    if (isVisible) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-4 py-3 min-w-[200px] max-w-[90vw] text-center">
        <p className="text-sm font-medium text-black">{message}</p>
      </div>
    </div>
  );
}
