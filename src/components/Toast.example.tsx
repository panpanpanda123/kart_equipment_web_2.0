import { useState } from 'react';
import { Toast } from './Toast';
import { ERROR_MESSAGES } from '../constants/errorMessages';

/**
 * Example usage of the Toast component
 * 
 * This demonstrates how to use the Toast component in your application:
 * 1. Maintain a state for toast visibility and message
 * 2. Show toast by setting isVisible to true
 * 3. Toast will auto-dismiss after 3 seconds (or custom duration)
 * 4. Handle onClose callback to reset state
 * 5. Use ERROR_MESSAGES constants for consistent error messaging
 */
export function ToastExample() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleToastClose = () => {
    setToastVisible(false);
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Toast Component Examples</h1>
      
      <div className="space-y-2">
        <button
          onClick={() => showToast(ERROR_MESSAGES.INCOMPATIBLE)}
          className="px-4 py-2 bg-blue-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          Show Incompatible Error
        </button>

        <button
          onClick={() => showToast(ERROR_MESSAGES.SLOT_FULL(2))}
          className="px-4 py-2 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          Show Slot Full Error
        </button>

        <button
          onClick={() => showToast('配置已保存')}
          className="px-4 py-2 bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          Show Success Message
        </button>
      </div>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={handleToastClose}
      />
    </div>
  );
}
