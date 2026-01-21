/**
 * Data Provider Module
 * 
 * Provides an abstraction layer for loading configuration data.
 * This allows for easy swapping of data sources in the future.
 * 
 * Current implementation: LocalJsonDataProvider loads from master-config.json
 * Future implementations could load from API, database, etc.
 */

import type { ConfigData, EquipmentItem } from '../types';

/**
 * DataProvider interface
 * Defines the contract for loading configuration data
 */
export interface DataProvider {
  /**
   * Load complete configuration data
   * @returns Promise resolving to ConfigData
   * @throws Error if loading fails or data is invalid
   */
  loadConfig(): Promise<ConfigData>;
}

/**
 * LocalJsonDataProvider implementation
 * Loads configuration from master-config.json in the public directory
 * 
 * Validation strategy:
 * - Structural data (character, slots, ui): fail-fast - throw error if invalid
 * - Items data: filter invalid items, warn if < 12 items remain
 */
export class LocalJsonDataProvider implements DataProvider {
  /**
   * Load configuration from /master-config.json
   * @returns Promise resolving to validated ConfigData
   * @throws Error if fetch fails or structural validation fails
   */
  async loadConfig(): Promise<ConfigData> {
    try {
      const response = await fetch('/master-config.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate structural data (fail-fast for critical errors)
      this.validateStructuralData(data);
      
      // Filter invalid items (non-critical, can continue with valid items)
      data.items = this.filterValidItems(data.items);
      
      return data as ConfigData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Configuration loading failed: ${error.message}`);
      }
      throw new Error('Configuration loading failed: Unknown error');
    }
  }

  /**
   * Validate structural data (fail-fast strategy)
   * Throws error if any critical configuration is invalid
   * 
   * Critical validations:
   * - character configuration must exist and have image
   * - must have exactly 10 slots
   * - all slots must have non-empty allowedTypes
   * - ui configuration must exist
   * 
   * @param data Raw configuration data
   * @throws Error if structural validation fails
   */
  private validateStructuralData(data: unknown): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid configuration: data must be an object');
    }

    const config = data as Record<string, unknown>;
    // Critical: character configuration must be valid
    if (!config.character || typeof config.character !== 'object') {
      throw new Error('Invalid configuration: character section is missing or invalid');
    }
    
    const character = config.character as Record<string, unknown>;
    if (!character.image || typeof character.image !== 'string') {
      throw new Error('Invalid configuration: character.image is missing or invalid');
    }
    
    // Critical: must have exactly 10 slots
    if (!Array.isArray(config.slots)) {
      throw new Error('Invalid configuration: slots must be an array');
    }
    
    if (config.slots.length !== 10) {
      throw new Error(`Invalid configuration: must contain exactly 10 slots, found ${config.slots.length}`);
    }
    
    // Critical: all slots must have non-empty allowedTypes
    for (let i = 0; i < config.slots.length; i++) {
      const slot = config.slots[i] as Record<string, unknown>;
      
      if (!slot.id || typeof slot.id !== 'string') {
        throw new Error(`Invalid configuration: slot at index ${i} has missing or invalid id`);
      }
      
      if (!Array.isArray(slot.allowedTypes)) {
        throw new Error(`Invalid configuration: slot "${slot.id}" has invalid allowedTypes (must be an array)`);
      }
      
      if (slot.allowedTypes.length === 0) {
        throw new Error(`Invalid configuration: slot "${slot.id}" has empty allowedTypes array (must contain at least one type)`);
      }
    }
    
    // Critical: ui configuration must exist
    if (!config.ui || typeof config.ui !== 'object') {
      throw new Error('Invalid configuration: ui section is missing or invalid');
    }
  }

  /**
   * Filter invalid equipment items (graceful degradation)
   * Logs warnings for invalid items but continues with valid ones
   * 
   * Required fields for valid item:
   * - id, type, brand, model, displayName, icon, image, summary
   * 
   * @param items Raw items array
   * @returns Array of valid EquipmentItem objects
   */
  private filterValidItems(items: unknown): EquipmentItem[] {
    if (!Array.isArray(items)) {
      console.warn('Items is not an array, using empty array');
      return [];
    }
    
    const validItems = items.filter((item: unknown, index: number) => {
      // Check all required fields
      const hasRequiredFields = 
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' && item.id.length > 0 &&
        typeof item.type === 'string' && item.type.length > 0 &&
        typeof item.brand === 'string' && item.brand.length > 0 &&
        typeof item.model === 'string' && item.model.length > 0 &&
        typeof item.displayName === 'string' && item.displayName.length > 0 &&
        typeof item.icon === 'string' && item.icon.length > 0 &&
        typeof item.image === 'string' && item.image.length > 0 &&
        typeof item.summary === 'string' && item.summary.length > 0;
      
      if (!hasRequiredFields) {
        console.warn(`Filtering out invalid item at index ${index}:`, {
          id: item?.id,
          type: item?.type,
          brand: item?.brand,
          model: item?.model,
          hasAllFields: hasRequiredFields
        });
      }
      
      return hasRequiredFields;
    });
    
    // Warn if fewer than 12 items after filtering (recommended minimum)
    if (validItems.length < 12) {
      console.warn(
        `Only ${validItems.length} valid items found (recommended: >= 12). ` +
        `Filtered out ${items.length - validItems.length} invalid items.`
      );
    }
    
    return validItems as EquipmentItem[];
  }
}
