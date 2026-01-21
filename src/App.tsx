import { useState, useEffect, useCallback } from 'react';
import './App.css';
import type { ConfigData, ApplicationState } from './types';
import { LocalJsonDataProvider } from './services/dataProvider';
import { StorageManager } from './services/storageManager';
import { CompatibilityChecker } from './services/compatibilityChecker';
import { ERROR_MESSAGES } from './constants/errorMessages';
import { CharacterView } from './components/CharacterView';
import { EquipmentLibrary } from './components/EquipmentLibrary';
import { StatusBar } from './components/StatusBar';
import { Toast } from './components/Toast';

/**
 * Main App Component
 * 
 * Manages application state and orchestrates all child components.
 * Handles configuration loading, equipment selection, equipping/unequipping,
 * localStorage persistence, and error handling.
 * 
 * Validates: Requirements 11.1-11.4, 9.2, 14.1, 6.1-6.5, 7.1-7.5, 8.1-8.5, 9.4
 */
function App() {
  // Configuration state
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application state
  const [appState, setAppState] = useState<ApplicationState>({
    selectedItemId: null,
    equippedItems: new Map(),
  });

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 AppState changed:', {
      selectedItemId: appState.selectedItemId,
      equippedItemsSize: appState.equippedItems.size,
      equippedItems: Array.from(appState.equippedItems.entries()),
    });
  }, [appState]);

  // Toast state
  const [toast, setToast] = useState<{ message: string; isVisible: boolean }>({
    message: '',
    isVisible: false,
  });

  /**
   * Load configuration from DataProvider and restore state from localStorage
   */
  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dataProvider = new LocalJsonDataProvider();
      const loadedConfig = await dataProvider.loadConfig();
      setConfig(loadedConfig);

      // Restore state from localStorage
      const validItemIds = new Set(loadedConfig.items.map(item => item.id));
      const restoredEquippedItems = StorageManager.load(validItemIds);

      setAppState({
        selectedItemId: null,
        equippedItems: restoredEquippedItems,
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to load configuration:', err);
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_CONFIG_FAILED);
      setLoading(false);
    }
  }, []);

  /**
   * Load configuration on mount
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConfiguration();
  }, [loadConfiguration]);

  /**
   * Show toast notification
   */
  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  /**
   * Hide toast notification
   */
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  /**
   * Handle equipment item selection
   * Requirement 6.1, 6.4, 6.5: Single selection, toggle on click
   */
  const handleItemSelect = (itemId: string) => {
    setAppState(prev => ({
      ...prev,
      selectedItemId: prev.selectedItemId === itemId ? null : itemId,
    }));
  };

  /**
   * Handle equipment item double-click - auto-equip to first compatible slot
   * UX Enhancement: Quick equip
   */
  const handleItemDoubleClick = (itemId: string) => {
    if (!config) return;

    const item = config.items.find(i => i.id === itemId);
    if (!item) return;

    // Find first compatible empty slot
    const compatibleSlots = CompatibilityChecker.getCompatibleSlots(item, config.slots);
    const targetSlot = compatibleSlots.find(slot => {
      const currentEquipped = appState.equippedItems.get(slot.id) || [];
      return currentEquipped.length < slot.maxCount;
    });

    if (!targetSlot) {
      showToast('没有可用的兼容槽位');
      return;
    }

    // Equip to the slot
    const currentEquipped = appState.equippedItems.get(targetSlot.id) || [];
    const newEquippedItems = new Map(appState.equippedItems);
    newEquippedItems.set(targetSlot.id, [...currentEquipped, itemId]);

    console.log('⚡ Quick equip (double-click):', {
      itemId,
      targetSlot: targetSlot.id,
      newEquippedItemsSize: newEquippedItems.size,
    });

    setAppState(prev => ({
      ...prev,
      selectedItemId: null,
      equippedItems: newEquippedItems,
    }));

    StorageManager.save(newEquippedItems);
  };

  /**
   * Handle slot click for equipping/unequipping
   * Requirements 7.1-7.5, 8.1-8.5
   */
  const handleSlotClick = (slotId: string) => {
    if (!config) return;

    const slot = config.slots.find(s => s.id === slotId);
    if (!slot) return;

    const currentEquipped = appState.equippedItems.get(slotId) || [];

    console.log('🔍 handleSlotClick:', {
      slotId,
      selectedItemId: appState.selectedItemId,
      currentEquipped,
      currentEquippedItemsSize: appState.equippedItems.size,
      allEquippedItems: Array.from(appState.equippedItems.entries()),
    });

    // Case 1: Item is selected - attempt to equip
    if (appState.selectedItemId !== null) {
      const selectedItem = config.items.find(item => item.id === appState.selectedItemId);
      if (!selectedItem) return;

      // Check compatibility
      if (!CompatibilityChecker.isCompatible(selectedItem, slot)) {
        showToast(ERROR_MESSAGES.INCOMPATIBLE);
        return; // Keep selectedItemId
      }

      // Check if slot is full
      if (currentEquipped.length >= slot.maxCount) {
        showToast(ERROR_MESSAGES.SLOT_FULL(slot.maxCount));
        return; // Keep selectedItemId
      }

      // Equip the item
      const newEquippedItems = new Map(appState.equippedItems);
      newEquippedItems.set(slotId, [...currentEquipped, appState.selectedItemId]);

      console.log('✅ Equipping item:', {
        slotId,
        itemId: appState.selectedItemId,
        newEquippedForSlot: newEquippedItems.get(slotId),
        newEquippedItemsSize: newEquippedItems.size,
        allNewEquippedItems: Array.from(newEquippedItems.entries()),
      });

      setAppState(prev => ({
        ...prev,
        selectedItemId: null, // Clear selection on success
        equippedItems: newEquippedItems,
      }));

      // Save to localStorage
      StorageManager.save(newEquippedItems);
    }
    // Case 2: No item selected - attempt to unequip
    else if (currentEquipped.length > 0) {
      // Remove the last item
      const newEquipped = currentEquipped.slice(0, -1);
      const newEquippedItems = new Map(appState.equippedItems);

      if (newEquipped.length === 0) {
        newEquippedItems.delete(slotId);
      } else {
        newEquippedItems.set(slotId, newEquipped);
      }

      console.log('🗑️ Unequipping item:', {
        slotId,
        newEquippedItemsSize: newEquippedItems.size,
      });

      setAppState(prev => ({
        ...prev,
        equippedItems: newEquippedItems,
      }));

      // Save to localStorage
      StorageManager.save(newEquippedItems);
    }
  };

  /**
   * Handle drag and drop equipment to slot
   * UX Enhancement: Drag and drop support
   */
  const handleSlotDrop = (slotId: string, itemId: string) => {
    if (!config) return;

    const slot = config.slots.find(s => s.id === slotId);
    const item = config.items.find(i => i.id === itemId);
    if (!slot || !item) return;

    const currentEquipped = appState.equippedItems.get(slotId) || [];

    // Check compatibility
    if (!CompatibilityChecker.isCompatible(item, slot)) {
      showToast(ERROR_MESSAGES.INCOMPATIBLE);
      return;
    }

    // Check if slot is full
    if (currentEquipped.length >= slot.maxCount) {
      showToast(ERROR_MESSAGES.SLOT_FULL(slot.maxCount));
      return;
    }

    // Equip the item
    const newEquippedItems = new Map(appState.equippedItems);
    newEquippedItems.set(slotId, [...currentEquipped, itemId]);

    console.log('🎯 Drag & drop equip:', {
      slotId,
      itemId,
      newEquippedItemsSize: newEquippedItems.size,
    });

    setAppState(prev => ({
      ...prev,
      selectedItemId: null,
      equippedItems: newEquippedItems,
    }));

    StorageManager.save(newEquippedItems);
  };

  /**
   * Handle reset - clear all equipment
   * Requirement 9.4
   */
  const handleReset = () => {
    setAppState(prev => ({
      ...prev,
      selectedItemId: null,
      equippedItems: new Map(),
    }));

    StorageManager.clear();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="pixel-card p-8 text-center">
          <div className="text-2xl mb-4">⚙️</div>
          <p className="text-lg font-medium">加载配置中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="pixel-card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4">配置加载失败</h2>
          <p className="text-gray-700 mb-6">{error || ERROR_MESSAGES.LOAD_CONFIG_FAILED}</p>
          <button
            onClick={loadConfiguration}
            className="pixel-button px-6 py-2"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // Main application
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Main content area - responsive layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left side: Character View */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-full overflow-auto">
          <CharacterView
            characterImage={config.character.image}
            slots={config.slots}
            equippedItems={appState.equippedItems}
            selectedItemId={appState.selectedItemId}
            items={config.items}
            onSlotClick={handleSlotClick}
            onSlotDrop={handleSlotDrop}
          />
        </div>

        {/* Right side: Equipment Library */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-full overflow-auto border-t-2 md:border-t-0 md:border-l-2 border-black">
          <EquipmentLibrary
            items={config.items}
            selectedItemId={appState.selectedItemId}
            onItemSelect={handleItemSelect}
            onItemDoubleClick={handleItemDoubleClick}
          />
        </div>
      </div>

      {/* Bottom: Status Bar */}
      <StatusBar
        equippedItems={appState.equippedItems}
        slots={config.slots}
        onReset={handleReset}
      />

      {/* Toast notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
