import { useState } from 'react';
import { EquipmentLibrary } from './EquipmentLibrary';
import type { EquipmentItem } from '../types';

/**
 * Example usage of EquipmentLibrary component
 * 
 * This example demonstrates:
 * 1. Basic usage with mock equipment data
 * 2. Selection state management
 * 3. Toggle selection behavior (click to select, click again to deselect)
 */

// Mock equipment data for demonstration
const mockEquipmentItems: EquipmentItem[] = [
  {
    id: 'helmet-1',
    type: '头盔',
    brand: 'Arai',
    model: 'GP-7',
    displayName: 'Arai GP-7 赛车头盔',
    icon: '/icons/helmet-1.png',
    image: '/images/helmet-1.png',
    summary: '顶级FIA认证赛车头盔，提供卓越的安全性和舒适性',
    specs: {
      weight_g: 1450,
      vents: 8,
      certs: ['FIA 8860-2018', 'Snell SA2020'],
    },
  },
  {
    id: 'helmet-2',
    type: '头盔',
    brand: 'Bell',
    model: 'HP7',
    displayName: 'Bell HP7 赛车头盔',
    icon: '/icons/helmet-2.png',
    image: '/images/helmet-2.png',
    summary: '轻量化设计，优秀的通风系统',
    specs: {
      weight_g: 1380,
      vents: 10,
      certs: ['FIA 8860-2018'],
    },
  },
  {
    id: 'gloves-1',
    type: '手套',
    brand: 'Alpinestars',
    model: 'Tech-1 K',
    displayName: 'Alpinestars Tech-1 K 卡丁车手套',
    icon: '/icons/gloves-1.png',
    image: '/images/gloves-1.png',
    summary: '专为卡丁车设计的轻量化手套',
    specs: {
      weight_g: 120,
      certs: ['FIA 8856-2018'],
    },
  },
  {
    id: 'gloves-2',
    type: '手套',
    brand: 'Sparco',
    model: 'Arrow',
    displayName: 'Sparco Arrow 卡丁车手套',
    icon: '/icons/gloves-2.png',
    image: '/images/gloves-2.png',
    summary: '高性能卡丁车手套，提供出色的抓地力',
    specs: {
      weight_g: 130,
      certs: ['FIA 8856-2018'],
    },
  },
  {
    id: 'suit-1',
    type: '赛车服',
    brand: 'OMP',
    model: 'One-S',
    displayName: 'OMP One-S 赛车服',
    icon: '/icons/suit-1.png',
    image: '/images/suit-1.png',
    summary: '轻量化单层赛车服，适合卡丁车比赛',
    specs: {
      weight_g: 850,
      certs: ['FIA 8856-2018'],
    },
  },
  {
    id: 'rib-protector-1',
    type: '护肋',
    brand: 'Benelli',
    model: 'K50',
    displayName: 'Benelli K50 护肋',
    icon: '/icons/rib-1.png',
    image: '/images/rib-1.png',
    summary: '专业级护肋，提供全方位保护',
    specs: {
      weight_g: 650,
      certs: ['CIK-FIA'],
    },
  },
  {
    id: 'shoes-1',
    type: '赛车鞋',
    brand: 'Puma',
    model: 'Speedcat',
    displayName: 'Puma Speedcat 赛车鞋',
    icon: '/icons/shoes-1.png',
    image: '/images/shoes-1.png',
    summary: '轻量化赛车鞋，提供优秀的踏板感',
    specs: {
      weight_g: 380,
      certs: ['FIA 8856-2018'],
    },
  },
  {
    id: 'balaclava-1',
    type: '头套',
    brand: 'Alpinestars',
    model: 'Race v3',
    displayName: 'Alpinestars Race v3 头套',
    icon: '/icons/balaclava-1.png',
    image: '/images/balaclava-1.png',
    summary: '阻燃头套，提供额外的安全保护',
    specs: {
      weight_g: 45,
      certs: ['FIA 8856-2018'],
    },
  },
  {
    id: 'accessory-1',
    type: '饰品',
    brand: 'Custom',
    model: 'Racing Badge',
    displayName: '赛车徽章',
    icon: '/icons/badge-1.png',
    image: '/images/badge-1.png',
    summary: '个性化赛车徽章',
  },
  {
    id: 'accessory-2',
    type: '饰品',
    brand: 'Custom',
    model: 'Team Patch',
    displayName: '车队贴纸',
    icon: '/icons/patch-1.png',
    image: '/images/patch-1.png',
    summary: '车队标识贴纸',
  },
  {
    id: 'accessory-3',
    type: '饰品',
    brand: 'Custom',
    model: 'Number Plate',
    displayName: '号码牌',
    icon: '/icons/number-1.png',
    image: '/images/number-1.png',
    summary: '个性化号码牌',
  },
  {
    id: 'accessory-4',
    type: '饰品',
    brand: 'Custom',
    model: 'Sponsor Logo',
    displayName: '赞助商标志',
    icon: '/icons/sponsor-1.png',
    image: '/images/sponsor-1.png',
    summary: '赞助商品牌标志',
  },
];

/**
 * Example 1: Basic Usage
 * Simple equipment library with selection
 */
export function BasicExample() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleItemSelect = (itemId: string) => {
    // Toggle selection: if already selected, deselect; otherwise select
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-gray-100 border-b-2 border-black">
        <h2 className="text-xl font-bold">装备库示例</h2>
        <p className="text-sm text-gray-600">
          当前选中: {selectedItemId || '无'}
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <EquipmentLibrary
          items={mockEquipmentItems}
          selectedItemId={selectedItemId}
          onItemSelect={handleItemSelect}
        />
      </div>
    </div>
  );
}

/**
 * Example 2: With Filtering
 * Equipment library with type filter
 */
export function FilteredExample() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredItems = filterType
    ? mockEquipmentItems.filter((item) => item.type === filterType)
    : mockEquipmentItems;

  const equipmentTypes = Array.from(
    new Set(mockEquipmentItems.map((item) => item.type))
  );

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-gray-100 border-b-2 border-black">
        <h2 className="text-xl font-bold mb-2">装备库 - 带筛选</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType(null)}
            className={`px-3 py-1 border-2 border-black ${
              filterType === null ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            全部 ({mockEquipmentItems.length})
          </button>
          {equipmentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 border-2 border-black ${
                filterType === type ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              {type} (
              {mockEquipmentItems.filter((item) => item.type === type).length})
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          当前选中: {selectedItemId || '无'}
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <EquipmentLibrary
          items={filteredItems}
          selectedItemId={selectedItemId}
          onItemSelect={(itemId) =>
            setSelectedItemId(selectedItemId === itemId ? null : itemId)
          }
        />
      </div>
    </div>
  );
}

/**
 * Example 3: Empty State
 * Shows the empty state when no items are available
 */
export function EmptyStateExample() {
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-gray-100 border-b-2 border-black">
        <h2 className="text-xl font-bold">装备库 - 空状态</h2>
        <p className="text-sm text-gray-600">没有可用的装备数据</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <EquipmentLibrary
          items={[]}
          selectedItemId={null}
          onItemSelect={() => {}}
        />
      </div>
    </div>
  );
}

/**
 * Example 4: Responsive Layout
 * Demonstrates responsive grid behavior at different widths
 */
export function ResponsiveExample() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [width, setWidth] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const widthClasses = {
    mobile: 'max-w-sm',
    tablet: 'max-w-2xl',
    desktop: 'max-w-full',
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-gray-100 border-b-2 border-black">
        <h2 className="text-xl font-bold mb-2">装备库 - 响应式布局</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setWidth('mobile')}
            className={`px-3 py-1 border-2 border-black ${
              width === 'mobile' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            移动端 (&lt; 640px)
          </button>
          <button
            onClick={() => setWidth('tablet')}
            className={`px-3 py-1 border-2 border-black ${
              width === 'tablet' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            平板 (640-768px)
          </button>
          <button
            onClick={() => setWidth('desktop')}
            className={`px-3 py-1 border-2 border-black ${
              width === 'desktop' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            桌面 (&gt; 768px)
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex justify-center">
        <div className={`${widthClasses[width]} h-full border-x-2 border-black`}>
          <EquipmentLibrary
            items={mockEquipmentItems}
            selectedItemId={selectedItemId}
            onItemSelect={(itemId) =>
              setSelectedItemId(selectedItemId === itemId ? null : itemId)
            }
          />
        </div>
      </div>
    </div>
  );
}

// Export all examples
export default {
  BasicExample,
  FilteredExample,
  EmptyStateExample,
  ResponsiveExample,
};
