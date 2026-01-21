import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentLibrary } from './EquipmentLibrary';
import type { EquipmentItem } from '../types';

// Mock EquipmentCard component
vi.mock('./EquipmentCard', () => ({
  EquipmentCard: ({ item, isSelected, onClick }: any) => (
    <button
      data-testid={`equipment-card-${item.id}`}
      data-selected={isSelected}
      onClick={onClick}
    >
      {item.model}
    </button>
  ),
}));

describe('EquipmentLibrary', () => {
  const mockItems: EquipmentItem[] = [
    {
      id: 'item-1',
      type: '头盔',
      brand: 'Brand A',
      model: 'Model A',
      displayName: 'Display A',
      icon: '/icons/a.png',
      image: '/images/a.png',
      summary: 'Summary A',
    },
    {
      id: 'item-2',
      type: '手套',
      brand: 'Brand B',
      model: 'Model B',
      displayName: 'Display B',
      icon: '/icons/b.png',
      image: '/images/b.png',
      summary: 'Summary B',
    },
    {
      id: 'item-3',
      type: '赛车服',
      brand: 'Brand C',
      model: 'Model C',
      displayName: 'Display C',
      icon: '/icons/c.png',
      image: '/images/c.png',
      summary: 'Summary C',
    },
  ];

  it('renders all equipment items', () => {
    const onItemSelect = vi.fn();
    render(
      <EquipmentLibrary
        items={mockItems}
        selectedItemId={null}
        onItemSelect={onItemSelect}
      />
    );

    // All items should be rendered
    expect(screen.getByTestId('equipment-card-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('equipment-card-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('equipment-card-item-3')).toBeInTheDocument();

    // Check that model names are displayed
    expect(screen.getByText('Model A')).toBeInTheDocument();
    expect(screen.getByText('Model B')).toBeInTheDocument();
    expect(screen.getByText('Model C')).toBeInTheDocument();
  });

  it('passes correct selection state to EquipmentCard', () => {
    const onItemSelect = vi.fn();
    render(
      <EquipmentLibrary
        items={mockItems}
        selectedItemId="item-2"
        onItemSelect={onItemSelect}
      />
    );

    // Only item-2 should be selected
    expect(screen.getByTestId('equipment-card-item-1')).toHaveAttribute(
      'data-selected',
      'false'
    );
    expect(screen.getByTestId('equipment-card-item-2')).toHaveAttribute(
      'data-selected',
      'true'
    );
    expect(screen.getByTestId('equipment-card-item-3')).toHaveAttribute(
      'data-selected',
      'false'
    );
  });

  it('calls onItemSelect when an item is clicked', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(
      <EquipmentLibrary
        items={mockItems}
        selectedItemId={null}
        onItemSelect={onItemSelect}
      />
    );

    // Click on item-2
    await user.click(screen.getByTestId('equipment-card-item-2'));

    expect(onItemSelect).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith('item-2');
  });

  it('displays empty state when no items are provided', () => {
    const onItemSelect = vi.fn();
    render(
      <EquipmentLibrary
        items={[]}
        selectedItemId={null}
        onItemSelect={onItemSelect}
      />
    );

    // Empty state message should be displayed
    expect(screen.getByText('暂无装备数据')).toBeInTheDocument();
    expect(screen.getByText('请检查配置文件')).toBeInTheDocument();
  });

  it('renders grid layout with correct structure', () => {
    const onItemSelect = vi.fn();
    const { container } = render(
      <EquipmentLibrary
        items={mockItems}
        selectedItemId={null}
        onItemSelect={onItemSelect}
      />
    );

    // Check that grid container exists
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('gap-4');
  });

  it('handles large number of items', () => {
    const manyItems: EquipmentItem[] = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      type: '头盔',
      brand: `Brand ${i}`,
      model: `Model ${i}`,
      displayName: `Display ${i}`,
      icon: `/icons/${i}.png`,
      image: `/images/${i}.png`,
      summary: `Summary ${i}`,
    }));

    const onItemSelect = vi.fn();
    render(
      <EquipmentLibrary
        items={manyItems}
        selectedItemId={null}
        onItemSelect={onItemSelect}
      />
    );

    // All items should be rendered
    manyItems.forEach((item) => {
      expect(screen.getByTestId(`equipment-card-${item.id}`)).toBeInTheDocument();
    });
  });

  it('updates selection when selectedItemId changes', () => {
    const onItemSelect = vi.fn();
    const { rerender } = render(
      <EquipmentLibrary
        items={mockItems}
        selectedItemId="item-1"
        onItemSelect={onItemSelect}
      />
    );

    // Initially item-1 is selected
    expect(screen.getByTestId('equipment-card-item-1')).toHaveAttribute(
      'data-selected',
      'true'
    );

    // Change selection to item-3
    rerender(
      <EquipmentLibrary
        items={mockItems}
        selectedItemId="item-3"
        onItemSelect={onItemSelect}
      />
    );

    // Now item-3 should be selected
    expect(screen.getByTestId('equipment-card-item-1')).toHaveAttribute(
      'data-selected',
      'false'
    );
    expect(screen.getByTestId('equipment-card-item-3')).toHaveAttribute(
      'data-selected',
      'true'
    );
  });

  it('handles null selectedItemId correctly', () => {
    const onItemSelect = vi.fn();
    render(
      <EquipmentLibrary
        items={mockItems}
        selectedItemId={null}
        onItemSelect={onItemSelect}
      />
    );

    // No items should be selected
    expect(screen.getByTestId('equipment-card-item-1')).toHaveAttribute(
      'data-selected',
      'false'
    );
    expect(screen.getByTestId('equipment-card-item-2')).toHaveAttribute(
      'data-selected',
      'false'
    );
    expect(screen.getByTestId('equipment-card-item-3')).toHaveAttribute(
      'data-selected',
      'false'
    );
  });
});
