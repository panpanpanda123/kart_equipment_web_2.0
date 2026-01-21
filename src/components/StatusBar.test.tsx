import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusBar } from './StatusBar';
import type { SlotConfig } from '../types';

describe('StatusBar Component', () => {
  // Mock slot configurations
  const mockSlots: SlotConfig[] = [
    {
      id: 'helmet',
      type: '头盔',
      displayName: '头盔槽',
      position: { top: '10%', left: '20%' },
      size: { width: '12%', height: '12%' },
      required: true,
      maxCount: 1,
      allowedTypes: ['头盔']
    },
    {
      id: 'rib-protector',
      type: '护肋',
      displayName: '护肋槽',
      position: { top: '30%', left: '20%' },
      size: { width: '12%', height: '12%' },
      required: true,
      maxCount: 1,
      allowedTypes: ['护肋']
    },
    {
      id: 'gloves',
      type: '手套',
      displayName: '手套槽',
      position: { top: '50%', left: '20%' },
      size: { width: '12%', height: '12%' },
      required: false,
      maxCount: 1,
      allowedTypes: ['手套']
    },
    {
      id: 'accessory-1',
      type: '饰品',
      displayName: '饰品槽1',
      position: { top: '70%', left: '20%' },
      size: { width: '12%', height: '12%' },
      required: false,
      maxCount: 3,
      allowedTypes: ['饰品']
    }
  ];

  it('should calculate X correctly (total equipped items)', () => {
    const equippedItems = new Map([
      ['helmet', ['item-1']],
      ['gloves', ['item-2']],
      ['accessory-1', ['item-3', 'item-4']]
    ]);

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // X = 1 + 1 + 2 = 4
    expect(screen.getByText(/已装配: 4\//)).toBeInTheDocument();
  });

  it('should calculate Y correctly (total capacity)', () => {
    const equippedItems = new Map();

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // Y = 1 + 1 + 1 + 3 = 6
    expect(screen.getByText(/\/6 件装备/)).toBeInTheDocument();
  });

  it('should calculate M correctly (filled required slots)', () => {
    const equippedItems = new Map([
      ['helmet', ['item-1']]
      // rib-protector is empty
    ]);

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // M = 1 (only helmet filled), N = 2 (helmet and rib-protector are required)
    expect(screen.getByText(/必选: 1\/2/)).toBeInTheDocument();
  });

  it('should calculate N correctly (total required slots)', () => {
    const equippedItems = new Map();

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // N = 2 (helmet and rib-protector are required)
    expect(screen.getByText(/必选: 0\/2/)).toBeInTheDocument();
  });

  it('should display completeness indicator when all required slots are filled', () => {
    const equippedItems = new Map([
      ['helmet', ['item-1']],
      ['rib-protector', ['item-2']]
    ]);

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // M = 2, N = 2, so completeness indicator should be visible
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByLabelText('配置完整')).toBeInTheDocument();
  });

  it('should NOT display completeness indicator when required slots are not all filled', () => {
    const equippedItems = new Map([
      ['helmet', ['item-1']]
      // rib-protector is empty
    ]);

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // M = 1, N = 2, so completeness indicator should NOT be visible
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('should NOT display completeness indicator when no items are equipped', () => {
    const equippedItems = new Map();

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // M = 0, N = 2, so completeness indicator should NOT be visible
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('should call onReset when Reset button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const equippedItems = new Map([['helmet', ['item-1']]]);

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={onReset} />);

    const resetButton = screen.getByRole('button', { name: /重置所有装备/i });
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('should handle empty equippedItems map', () => {
    const equippedItems = new Map();

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // X = 0, Y = 6, M = 0, N = 2
    expect(screen.getByText('已装配: 0/6 件装备 (必选: 0/2)')).toBeInTheDocument();
  });

  it('should handle slots with maxCount > 1', () => {
    const equippedItems = new Map([
      ['accessory-1', ['item-1', 'item-2', 'item-3']] // 3 items in a slot with maxCount=3
    ]);

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // X = 3 (all three items counted)
    expect(screen.getByText(/已装配: 3\//)).toBeInTheDocument();
  });

  it('should display correct counts with complex equipped state', () => {
    const equippedItems = new Map([
      ['helmet', ['item-1']],           // 1 item
      ['rib-protector', ['item-2']],    // 1 item
      ['gloves', ['item-3']],           // 1 item
      ['accessory-1', ['item-4', 'item-5']] // 2 items
    ]);

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    // X = 1 + 1 + 1 + 2 = 5
    // Y = 1 + 1 + 1 + 3 = 6
    // M = 2 (helmet and rib-protector both filled)
    // N = 2
    expect(screen.getByText('已装配: 5/6 件装备 (必选: 2/2)')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument(); // Complete
  });

  it('should render Reset button with pixel-art styling', () => {
    const equippedItems = new Map();

    render(<StatusBar equippedItems={equippedItems} slots={mockSlots} onReset={() => {}} />);

    const resetButton = screen.getByRole('button', { name: /重置所有装备/i });
    
    // Check for pixel-art styling classes
    expect(resetButton).toHaveClass('border-2');
    expect(resetButton).toHaveClass('border-black');
    expect(resetButton).toHaveClass('shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]');
  });
});
