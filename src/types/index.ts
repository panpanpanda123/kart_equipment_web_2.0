/**
 * Core TypeScript type definitions for Racing Equipment Configuration System
 * 
 * This file defines the data structures used throughout the application:
 * - SlotConfig: Equipment slot configuration with percentage-based positioning
 * - EquipmentItem: Equipment item data (Phase 1 fields only)
 * - ConfigData: Complete configuration structure loaded from master-config.json
 * - ApplicationState: Runtime application state
 */

/**
 * Equipment slot configuration
 * Defines a single equipment slot on the character with position, size, and rules
 */
export interface SlotConfig {
  /** Unique slot identifier (e.g., "helmet", "gloves") */
  id: string;
  
  /** Slot type display name (e.g., "头盔", "手套") */
  type: string;
  
  /** Display name for the slot (e.g., "头盔槽") */
  displayName: string;
  
  /** Percentage-based positioning relative to character container */
  position: {
    /** Top position as percentage string (e.g., "15%") */
    top: string;
    /** Left position as percentage string (e.g., "20%") */
    left: string;
  };
  
  /** Percentage-based sizing relative to character container width */
  size: {
    /** Width as percentage string (e.g., "12%") */
    width: string;
    /** Height as percentage string (e.g., "12%") */
    height: string;
  };
  
  /** Whether this slot is required (true for 头盔, 护肋) */
  required: boolean;
  
  /** Maximum number of items that can be equipped in this slot (usually 1, can be >1 for accessories) */
  maxCount: number;
  
  /** Array of allowed equipment types for this slot (must be non-empty) */
  allowedTypes: string[];
}

/**
 * Equipment item data structure (Phase 1 - MVP fields only)
 * Phase 2 fields (certComparison, advantages, disadvantages, applicableScenarios) are not included
 */
export interface EquipmentItem {
  /** Unique equipment identifier */
  id: string;
  
  /** Equipment type (e.g., "头盔", "手套", "饰品") */
  type: string;
  
  /** Manufacturer/brand name */
  brand: string;
  
  /** Model name */
  model: string;
  
  /** Display name for the equipment */
  displayName: string;
  
  /** Path to thumbnail icon image */
  icon: string;
  
  /** Path to full-size image */
  image: string;
  
  /** Brief description of the equipment */
  summary: string;
  
  /** Optional equipment specifications */
  specs?: {
    /** Weight in grams */
    weight_g?: number;
    /** Number of ventilation holes */
    vents?: number;
    /** Array of certification names (e.g., ["FIA 8860-2018"]) */
    certs?: string[];
  };
  
  /** Optional tags for categorization */
  tags?: string[];
  
  /** Optional alternative names */
  aliases?: string[];
  
  /** 
   * Optional array of allowed slot IDs
   * Empty array or undefined means no restriction (can be equipped to any compatible slot)
   */
  allowedSlots?: string[];
}

/**
 * Complete configuration data structure
 * Loaded from master-config.json by DataProvider
 */
export interface ConfigData {
  /** Character configuration */
  character: {
    /** Path to character image */
    image: string;
    /** Character name */
    name: string;
  };
  
  /** Array of exactly 10 equipment slot configurations */
  slots: SlotConfig[];
  
  /** Array of equipment items (minimum 12 recommended) */
  items: EquipmentItem[];
  
  /** UI configuration */
  ui: {
    /** Application title */
    title: string;
    /** UI text labels */
    labels: Record<string, string>;
  };
  
  /** Placeholder for future achievements feature */
  achievements: any;
}

/**
 * Application runtime state
 * Manages equipment selection and equipped items
 */
export interface ApplicationState {
  /** 
   * Currently selected equipment item ID
   * null when no item is selected
   * Only one item can be selected at a time (single selection invariant)
   */
  selectedItemId: string | null;
  
  /** 
   * Map of equipped items by slot ID
   * Key: slot ID (e.g., "helmet", "gloves")
   * Value: array of equipped item IDs (supports maxCount > 1)
   * 
   * Example: Map { "helmet" => ["item-1"], "accessory-1" => ["item-2", "item-3"] }
   */
  equippedItems: Map<string, string[]>;
}
