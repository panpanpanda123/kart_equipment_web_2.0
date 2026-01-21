/**
 * Error Messages Constants
 * 
 * Centralized error message definitions for the racing equipment configuration system.
 * These messages are displayed to users via toast notifications or error screens.
 */

export const ERROR_MESSAGES = {
  /**
   * Message displayed when attempting to equip an item to a slot that has reached its maximum capacity.
   * @param maxCount - The maximum number of items allowed in the slot
   * @returns Formatted error message
   */
  SLOT_FULL: (maxCount: number) => `该槽位已满（最多${maxCount}件）`,

  /**
   * Message displayed when attempting to equip an item to an incompatible slot.
   * This occurs when the compatibility check fails (item type not allowed in slot or slot not in item's allowedSlots).
   */
  INCOMPATIBLE: '此装备无法装配到该槽位',

  /**
   * Message displayed when the configuration file (master-config.json) fails to load.
   * This is a critical error that prevents the application from functioning.
   */
  LOAD_CONFIG_FAILED: '配置加载失败，请刷新页面重试',

  /**
   * Message displayed when localStorage is unavailable or access is denied.
   * The application continues to function but without persistence.
   */
  STORAGE_UNAVAILABLE: '无法保存配置，刷新后将丢失',

  /**
   * Message displayed when saving to localStorage fails (e.g., quota exceeded).
   * The system may attempt to retry the save operation.
   */
  SAVE_FAILED: '保存失败，正在重试...',

  /**
   * Message displayed when some equipment items in the configuration are invalid and have been filtered out.
   * This is a non-critical warning - the application continues with valid items.
   */
  INVALID_DATA: '部分数据无效，已自动过滤'
} as const;

/**
 * Type for error message keys
 */
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
