import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render toast when isVisible is true', () => {
    render(<Toast message="Test message" isVisible={true} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should not render toast when isVisible is false', () => {
    render(<Toast message="Test message" isVisible={false} />);
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('should auto-dismiss after default duration (3000ms)', () => {
    const onClose = vi.fn();
    render(<Toast message="Test message" isVisible={true} onClose={onClose} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    // Fast-forward time by 3000ms
    vi.advanceTimersByTime(3000);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after custom duration', () => {
    const onClose = vi.fn();
    render(<Toast message="Test message" isVisible={true} duration={2000} onClose={onClose} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    // Fast-forward time by 2000ms
    vi.advanceTimersByTime(2000);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should have pixel-art styling', () => {
    render(<Toast message="Test message" isVisible={true} />);
    const toastElement = screen.getByText('Test message').parentElement;
    
    expect(toastElement).toHaveClass('border-2');
    expect(toastElement).toHaveClass('border-black');
    expect(toastElement).toHaveClass('shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]');
  });

  it('should have proper accessibility attributes', () => {
    render(<Toast message="Test message" isVisible={true} />);
    const alertElement = screen.getByRole('alert');
    
    expect(alertElement).toHaveAttribute('aria-live', 'polite');
  });

  it('should clean up timer when unmounted', () => {
    const onClose = vi.fn();
    const { unmount } = render(<Toast message="Test message" isVisible={true} onClose={onClose} />);
    
    unmount();
    
    // Fast-forward time
    vi.advanceTimersByTime(3000);
    
    // onClose should not be called after unmount
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should update when isVisible changes from false to true', async () => {
    const { rerender } = render(<Toast message="Test message" isVisible={false} />);
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    
    rerender(<Toast message="Test message" isVisible={true} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should restart timer when isVisible changes', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Toast message="Test message" isVisible={true} onClose={onClose} />);
    
    // Advance time by 1500ms
    vi.advanceTimersByTime(1500);
    
    // Change visibility to false then back to true (restart)
    rerender(<Toast message="Test message" isVisible={false} onClose={onClose} />);
    rerender(<Toast message="Test message" isVisible={true} onClose={onClose} />);
    
    // Advance time by another 1500ms (total 3000ms from first render, but only 1500ms from restart)
    vi.advanceTimersByTime(1500);
    
    // Should not have closed yet (needs another 1500ms)
    expect(onClose).not.toHaveBeenCalled();
    
    // Advance remaining time
    vi.advanceTimersByTime(1500);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
