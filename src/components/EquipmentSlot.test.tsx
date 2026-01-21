/**
 * Unit tests for EquipmentSlot component
 * 
 * Tests cover:
 * - Visual states (empty, occupied, highlighted, grayed-out, required)
 * - Click handling for equip/unequip
 * - Drag and drop functionality
 * - Multiple items support
 * - Accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentSlot } from './EquipmentSlot';
import type { SlotConfig, EquipmentItem } from '../types';

describe('EquipmentSlot', () => {
  // Test data
  const mockSlot: SlotConfig = {
    id: 'helmet',
    type: '头盔',
    displayName: '头盔槽',
    position: { top: '10%', left: '40%' },
    size: { width: '20%', height: '20%' },
    required: true,
    maxCount: 1,
    allowedTypes: ['头盔'],
  };

  const mockItem: EquipmentItem = {
    id: 'helmet-001',
    type: '头盔',
    brand: 'Arai',
    model: 'GP-7RC',
    displayName: 'Arai GP-7RC',
    icon: '/icons/helmet-001.svg',
    image: '/images/helmet-001.svg',
    summary: '顶级头盔',
  };

  const mockItems: EquipmentItem[] = [mockItem];

  describe('Visual States', () => {
    it('should render empty slot with type label', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={[]}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByText('头盔')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '头盔槽, 空槽位');
    });

    it('should render occupied slot with equipment icon', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={['helmet-001']}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      const img = screen.getByAltText('GP-7RC');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/icons/helmet-001.svg');
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '头盔槽, 已装配1件');
    });

    it('should show required indicator for empty required slot', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={[]}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should NOT show required indicator when slot is filled', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={['helmet-001']}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should apply highlighted styling when isHighlighted is true', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={[]}
          isHighlighted={true}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-green-500');
      expect(button).toHaveClass('ring-2');
      expect(button).toHaveClass('ring-green-400');
    });

    it('should apply grayed-out styling when isGrayedOut is true', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={[]}
          isHighlighted={false}
          isGrayedOut={true}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-40');
      expect(button).toHaveClass('grayscale');
    });

    it('should apply occupied styling when slot has items', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={['helmet-001']}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-blue-500');
    });
  });

  describe('Multiple Items Support', () => {
    const multiSlot: SlotConfig = {
      ...mockSlot,
      id: 'accessory-1',
      type: '饰品',
      displayName: '饰品槽1',
      maxCount: 2,
      allowedTypes: ['饰品'],
    };

    const accessory1: EquipmentItem = {
      ...mockItem,
      id: 'acc-001',
      type: '饰品',
      model: 'ACC-1',
    };

    const accessory2: EquipmentItem = {
      ...mockItem,
      id: 'acc-002',
      type: '饰品',
      model: 'ACC-2',
    };

    it('should render multiple items in slot', () => {
      render(
        <EquipmentSlot
          slot={multiSlot}
          equippedItemIds={['acc-001', 'acc-002']}
          isHighlighted={false}
          isGrayedOut={false}
          items={[accessory1, accessory2]}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByAltText('ACC-1')).toBeInTheDocument();
      expect(screen.getByAltText('ACC-2')).toBeInTheDocument();
    });

    it('should show full indicator when slot is full', () => {
      render(
        <EquipmentSlot
          slot={multiSlot}
          equippedItemIds={['acc-001', 'acc-002']}
          isHighlighted={false}
          isGrayedOut={false}
          items={[accessory1, accessory2]}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByText('满')).toBeInTheDocument();
    });

    it('should NOT show full indicator when slot is not full', () => {
      render(
        <EquipmentSlot
          slot={multiSlot}
          equippedItemIds={['acc-001']}
          isHighlighted={false}
          isGrayedOut={false}
          items={[accessory1]}
          onClick={vi.fn()}
        />
      );

      expect(screen.queryByText('满')).not.toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={[]}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={handleClick}
        />
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Positioning and Sizing', () => {
    it('should apply correct position and size from config', () => {
      const { container } = render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={[]}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveStyle({
        top: '10%',
        left: '40%',
        width: '20%',
        height: '20%',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper title attribute', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={[]}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title');
      expect(button.getAttribute('title')).toContain('头盔槽');
      expect(button.getAttribute('title')).toContain('必选');
      expect(button.getAttribute('title')).toContain('0/1');
    });

    it('should have proper aria-label', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={['helmet-001']}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        '头盔槽, 已装配1件'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid item IDs gracefully', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={['invalid-id']}
          isHighlighted={false}
          isGrayedOut={false}
          items={mockItems}
          onClick={vi.fn()}
        />
      );

      // Should render as empty since item not found
      expect(screen.getByText('头盔')).toBeInTheDocument();
    });

    it('should handle empty items array', () => {
      render(
        <EquipmentSlot
          slot={mockSlot}
          equippedItemIds={['helmet-001']}
          isHighlighted={false}
          isGrayedOut={false}
          items={[]}
          onClick={vi.fn()}
        />
      );

      // Should render as empty since no items provided
      expect(screen.getByText('头盔')).toBeInTheDocument();
    });
  });
});
