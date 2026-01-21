/**
 * Unit tests for Error Messages Constants
 * 
 * Tests verify:
 * - All error messages are defined
 * - SLOT_FULL function returns correct format
 * - Message strings are non-empty
 */

import { describe, it, expect } from 'vitest';
import { ERROR_MESSAGES } from './errorMessages';

describe('ERROR_MESSAGES', () => {
  it('should have all required error message keys', () => {
    expect(ERROR_MESSAGES).toHaveProperty('SLOT_FULL');
    expect(ERROR_MESSAGES).toHaveProperty('INCOMPATIBLE');
    expect(ERROR_MESSAGES).toHaveProperty('LOAD_CONFIG_FAILED');
    expect(ERROR_MESSAGES).toHaveProperty('STORAGE_UNAVAILABLE');
    expect(ERROR_MESSAGES).toHaveProperty('SAVE_FAILED');
    expect(ERROR_MESSAGES).toHaveProperty('INVALID_DATA');
  });

  describe('SLOT_FULL', () => {
    it('should return formatted message with maxCount', () => {
      const message = ERROR_MESSAGES.SLOT_FULL(1);
      expect(message).toBe('该槽位已满（最多1件）');
    });

    it('should handle different maxCount values', () => {
      expect(ERROR_MESSAGES.SLOT_FULL(2)).toBe('该槽位已满（最多2件）');
      expect(ERROR_MESSAGES.SLOT_FULL(3)).toBe('该槽位已满（最多3件）');
      expect(ERROR_MESSAGES.SLOT_FULL(4)).toBe('该槽位已满（最多4件）');
    });
  });

  describe('Static error messages', () => {
    it('INCOMPATIBLE should be a non-empty string', () => {
      expect(typeof ERROR_MESSAGES.INCOMPATIBLE).toBe('string');
      expect(ERROR_MESSAGES.INCOMPATIBLE.length).toBeGreaterThan(0);
      expect(ERROR_MESSAGES.INCOMPATIBLE).toBe('此装备无法装配到该槽位');
    });

    it('LOAD_CONFIG_FAILED should be a non-empty string', () => {
      expect(typeof ERROR_MESSAGES.LOAD_CONFIG_FAILED).toBe('string');
      expect(ERROR_MESSAGES.LOAD_CONFIG_FAILED.length).toBeGreaterThan(0);
      expect(ERROR_MESSAGES.LOAD_CONFIG_FAILED).toBe('配置加载失败，请刷新页面重试');
    });

    it('STORAGE_UNAVAILABLE should be a non-empty string', () => {
      expect(typeof ERROR_MESSAGES.STORAGE_UNAVAILABLE).toBe('string');
      expect(ERROR_MESSAGES.STORAGE_UNAVAILABLE.length).toBeGreaterThan(0);
      expect(ERROR_MESSAGES.STORAGE_UNAVAILABLE).toBe('无法保存配置，刷新后将丢失');
    });

    it('SAVE_FAILED should be a non-empty string', () => {
      expect(typeof ERROR_MESSAGES.SAVE_FAILED).toBe('string');
      expect(ERROR_MESSAGES.SAVE_FAILED.length).toBeGreaterThan(0);
      expect(ERROR_MESSAGES.SAVE_FAILED).toBe('保存失败，正在重试...');
    });

    it('INVALID_DATA should be a non-empty string', () => {
      expect(typeof ERROR_MESSAGES.INVALID_DATA).toBe('string');
      expect(ERROR_MESSAGES.INVALID_DATA.length).toBeGreaterThan(0);
      expect(ERROR_MESSAGES.INVALID_DATA).toBe('部分数据无效，已自动过滤');
    });
  });

  describe('Message content validation', () => {
    it('all static messages should contain Chinese characters', () => {
      const chineseRegex = /[\u4e00-\u9fa5]/;
      
      expect(chineseRegex.test(ERROR_MESSAGES.INCOMPATIBLE)).toBe(true);
      expect(chineseRegex.test(ERROR_MESSAGES.LOAD_CONFIG_FAILED)).toBe(true);
      expect(chineseRegex.test(ERROR_MESSAGES.STORAGE_UNAVAILABLE)).toBe(true);
      expect(chineseRegex.test(ERROR_MESSAGES.SAVE_FAILED)).toBe(true);
      expect(chineseRegex.test(ERROR_MESSAGES.INVALID_DATA)).toBe(true);
    });

    it('SLOT_FULL should generate messages with Chinese characters', () => {
      const chineseRegex = /[\u4e00-\u9fa5]/;
      expect(chineseRegex.test(ERROR_MESSAGES.SLOT_FULL(1))).toBe(true);
    });
  });
});
