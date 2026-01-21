import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentCard } from './EquipmentCard';
import type { EquipmentItem } from '../types';

describe('EquipmentCard', () => {
  const mockItem: EquipmentItem = {
    id: 'test-helmet-1',
    type: '头盔',
    brand: 'TestBrand',
    model: 'Test Model X1',
    displayName: 'Test Helmet',
    icon: '/test-icon.png',
    image: '/test-image.png',
    summary: 'A test helmet',
  };

  it('renders equipment icon and model name', () => {
    render(
      <EquipmentCard
        item={mockItem}
        isSelected={false}
        onClick={() => {}}
      />
    );

    // Check that the image is rendered with correct src and alt
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test-icon.png');
    expect(img).toHaveAttribute('alt', 'Test Helmet');

    // Check that the model name is displayed
    expect(screen.getByText('Test Model X1')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <EquipmentCard
        item={mockItem}
        isSelected={false}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies selected styling when isSelected is true', () => {
    const { rerender } = render(
      <EquipmentCard
        item={mockItem}
        isSelected={false}
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    
    // Not selected - should have black border
    expect(button).toHaveClass('border-black');
    expect(button).not.toHaveClass('border-blue-600');

    // Rerender with isSelected=true
    rerender(
      <EquipmentCard
        item={mockItem}
        isSelected={true}
        onClick={() => {}}
      />
    );

    // Selected - should have blue border
    expect(button).toHaveClass('border-blue-600');
    expect(button).not.toHaveClass('border-black');
  });

  it('has correct aria attributes', () => {
    render(
      <EquipmentCard
        item={mockItem}
        isSelected={false}
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '选择装备: Test Helmet');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('updates aria-pressed when selected', () => {
    const { rerender } = render(
      <EquipmentCard
        item={mockItem}
        isSelected={false}
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <EquipmentCard
        item={mockItem}
        isSelected={true}
        onClick={() => {}}
      />
    );

    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles long model names with line clamp', () => {
    const longModelItem: EquipmentItem = {
      ...mockItem,
      model: 'Very Long Model Name That Should Be Clamped To Two Lines Maximum',
    };

    render(
      <EquipmentCard
        item={longModelItem}
        isSelected={false}
        onClick={() => {}}
      />
    );

    const modelText = screen.getByText(longModelItem.model);
    expect(modelText).toHaveClass('line-clamp-2');
  });

  it('renders with pixel-art styling', () => {
    render(
      <EquipmentCard
        item={mockItem}
        isSelected={false}
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    
    // Check for pixel-art border and shadow
    expect(button).toHaveClass('border-2');
    expect(button.className).toMatch(/shadow-\[2px_2px_0px_0px_rgba\(0,0,0,1\)\]/);
    
    // Check for pixelated image rendering
    const img = screen.getByRole('img');
    expect(img).toHaveClass('pixelated');
  });
});
