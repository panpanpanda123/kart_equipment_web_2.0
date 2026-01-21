import { useState } from 'react';
import { EquipmentCard } from './EquipmentCard';
import type { EquipmentItem } from '../types';

/**
 * Example usage of EquipmentCard component
 * Demonstrates selection interaction and visual states
 */
export function EquipmentCardExample() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Sample equipment items
  const sampleItems: EquipmentItem[] = [
    {
      id: 'helmet-1',
      type: '头盔',
      brand: 'Arai',
      model: 'GP-7',
      displayName: 'Arai GP-7 Racing Helmet',
      icon: '/icons/helmet-placeholder.png',
      image: '/images/helmet-placeholder.png',
      summary: 'Professional FIA 8860-2018 certified racing helmet',
      specs: {
        weight_g: 1450,
        vents: 12,
        certs: ['FIA 8860-2018'],
      },
    },
    {
      id: 'gloves-1',
      type: '手套',
      brand: 'Alpinestars',
      model: 'Tech-1 K',
      displayName: 'Alpinestars Tech-1 K Gloves',
      icon: '/icons/gloves-placeholder.png',
      image: '/images/gloves-placeholder.png',
      summary: 'Karting gloves with excellent grip',
      specs: {
        weight_g: 180,
        certs: ['FIA 8856-2018'],
      },
    },
    {
      id: 'suit-1',
      type: '赛车服',
      brand: 'Sparco',
      model: 'Prime K',
      displayName: 'Sparco Prime K Racing Suit',
      icon: '/icons/suit-placeholder.png',
      image: '/images/suit-placeholder.png',
      summary: 'Lightweight karting suit with breathable fabric',
      specs: {
        weight_g: 850,
        vents: 8,
        certs: ['CIK-FIA'],
      },
    },
    {
      id: 'accessory-1',
      type: '饰品',
      brand: 'Custom',
      model: 'Racing Badge',
      displayName: 'Team Racing Badge',
      icon: '/icons/badge-placeholder.png',
      image: '/images/badge-placeholder.png',
      summary: 'Decorative team badge',
    },
  ];

  const handleItemClick = (itemId: string) => {
    // Toggle selection: if already selected, deselect; otherwise select
    setSelectedItemId(prev => prev === itemId ? null : itemId);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          EquipmentCard Component Examples
        </h1>

        {/* Selection status display */}
        <div className="mb-6 p-4 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm">
            <strong>Selected Item:</strong>{' '}
            {selectedItemId ? (
              <span className="text-blue-600">
                {sampleItems.find(item => item.id === selectedItemId)?.displayName}
              </span>
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Click any card to select/deselect it. Only one item can be selected at a time.
          </p>
        </div>

        {/* Grid of equipment cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sampleItems.map(item => (
            <EquipmentCard
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </div>

        {/* Visual state examples */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Visual States</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unselected state */}
            <div>
              <h3 className="text-sm font-bold mb-2">Unselected State</h3>
              <div className="w-48">
                <EquipmentCard
                  item={sampleItems[0]}
                  isSelected={false}
                  onClick={() => {}}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Black border with standard shadow
              </p>
            </div>

            {/* Selected state */}
            <div>
              <h3 className="text-sm font-bold mb-2">Selected State</h3>
              <div className="w-48">
                <EquipmentCard
                  item={sampleItems[1]}
                  isSelected={true}
                  onClick={() => {}}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Blue border with enhanced shadow
              </p>
            </div>
          </div>
        </div>

        {/* Long model name example */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Long Model Name Handling</h2>
          <div className="w-48">
            <EquipmentCard
              item={{
                ...sampleItems[0],
                model: 'Very Long Model Name That Should Be Clamped To Two Lines Maximum',
              }}
              isSelected={false}
              onClick={() => {}}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Model names longer than 2 lines are truncated with ellipsis
          </p>
        </div>

        {/* Responsive grid example */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Responsive Grid Layout</h2>
          <p className="text-xs text-gray-600 mb-4">
            Resize the window to see the grid adapt: 2 columns on mobile, 4 columns on desktop
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...sampleItems, ...sampleItems].map((item, index) => (
              <EquipmentCard
                key={`${item.id}-${index}`}
                item={item}
                isSelected={false}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EquipmentCardExample;
