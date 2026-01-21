/**
 * Configuration validation script
 * Validates that master-config.json conforms to the ConfigData interface
 */

import type { ConfigData, SlotConfig, EquipmentItem } from '../src/types/index.js';
import * as fs from 'fs';
import * as path from 'path';

// Read the configuration file
const configPath = path.join(process.cwd(), 'public', 'master-config.json');
const configContent = fs.readFileSync(configPath, 'utf-8');
const config: ConfigData = JSON.parse(configContent);

// Validation results
const errors: string[] = [];
const warnings: string[] = [];

// Validate character section
if (!config.character || !config.character.image) {
  errors.push('Missing or invalid character configuration');
}

// Validate slots section
if (!Array.isArray(config.slots)) {
  errors.push('Slots must be an array');
} else {
  if (config.slots.length !== 10) {
    errors.push(`Expected exactly 10 slots, found ${config.slots.length}`);
  }

  // Check required slots
  const requiredSlots = config.slots.filter(slot => slot.required);
  const helmetSlot = config.slots.find(slot => slot.id === 'helmet');
  const ribSlot = config.slots.find(slot => slot.id === 'rib-protector');

  if (requiredSlots.length !== 2) {
    errors.push(`Expected exactly 2 required slots, found ${requiredSlots.length}`);
  }

  if (!helmetSlot || !helmetSlot.required) {
    errors.push('Helmet slot must be marked as required');
  }

  if (!ribSlot || !ribSlot.required) {
    errors.push('Rib-protector slot must be marked as required');
  }

  // Validate each slot
  config.slots.forEach((slot: SlotConfig, index: number) => {
    if (!slot.id) {
      errors.push(`Slot ${index}: Missing id`);
    }
    if (!slot.type) {
      errors.push(`Slot ${index}: Missing type`);
    }
    if (!slot.displayName) {
      errors.push(`Slot ${index}: Missing displayName`);
    }
    if (!slot.position || !slot.position.top || !slot.position.left) {
      errors.push(`Slot ${index}: Missing or invalid position`);
    } else {
      // Check percentage format
      if (!slot.position.top.endsWith('%') || !slot.position.left.endsWith('%')) {
        errors.push(`Slot ${index}: Position must use percentage format (e.g., "15%")`);
      }
    }
    if (!slot.size || !slot.size.width || !slot.size.height) {
      errors.push(`Slot ${index}: Missing or invalid size`);
    } else {
      // Check percentage format
      if (!slot.size.width.endsWith('%') || !slot.size.height.endsWith('%')) {
        errors.push(`Slot ${index}: Size must use percentage format (e.g., "12%")`);
      }
    }
    if (typeof slot.required !== 'boolean') {
      errors.push(`Slot ${index}: required must be a boolean`);
    }
    if (typeof slot.maxCount !== 'number' || slot.maxCount < 1) {
      errors.push(`Slot ${index}: maxCount must be a positive number`);
    }
    if (!Array.isArray(slot.allowedTypes) || slot.allowedTypes.length === 0) {
      errors.push(`Slot ${index}: allowedTypes must be a non-empty array`);
    }
  });
}

// Validate items section
if (!Array.isArray(config.items)) {
  errors.push('Items must be an array');
} else {
  if (config.items.length < 12) {
    warnings.push(`Recommended at least 12 items, found ${config.items.length}`);
  }

  // Validate each item
  config.items.forEach((item: EquipmentItem, index: number) => {
    const requiredFields = ['id', 'type', 'brand', 'model', 'displayName', 'icon', 'image', 'summary'];
    requiredFields.forEach(field => {
      if (!item[field as keyof EquipmentItem]) {
        errors.push(`Item ${index} (${item.id || 'unknown'}): Missing required field '${field}'`);
      }
    });

    // Validate optional specs
    if (item.specs) {
      if (item.specs.weight_g !== undefined && typeof item.specs.weight_g !== 'number') {
        errors.push(`Item ${index} (${item.id}): specs.weight_g must be a number`);
      }
      if (item.specs.vents !== undefined && typeof item.specs.vents !== 'number') {
        errors.push(`Item ${index} (${item.id}): specs.vents must be a number`);
      }
      if (item.specs.certs !== undefined && !Array.isArray(item.specs.certs)) {
        errors.push(`Item ${index} (${item.id}): specs.certs must be an array`);
      }
    }

    // Validate optional allowedSlots
    if (item.allowedSlots !== undefined && !Array.isArray(item.allowedSlots)) {
      errors.push(`Item ${index} (${item.id}): allowedSlots must be an array`);
    }
  });

  // Check type coverage
  const itemTypes = new Set(config.items.map(item => item.type));
  const expectedTypes = ['头盔', '头套', '手套', '赛车服', '护肋', '赛车鞋', '饰品'];
  expectedTypes.forEach(type => {
    if (!itemTypes.has(type)) {
      warnings.push(`No items found for type: ${type}`);
    }
  });
}

// Validate ui section
if (!config.ui) {
  errors.push('Missing ui configuration');
} else {
  if (!config.ui.title) {
    warnings.push('Missing ui.title');
  }
  if (!config.ui.labels || typeof config.ui.labels !== 'object') {
    warnings.push('Missing or invalid ui.labels');
  }
}

// Print results
console.log('\n=== Configuration Validation Results ===\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Configuration is valid!');
  console.log(`   - ${config.slots.length} slots defined`);
  console.log(`   - ${config.items.length} items defined`);
  console.log(`   - ${config.slots.filter(s => s.required).length} required slots`);
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(error => console.log(`   - ${error}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('Configuration validation FAILED');
    process.exit(1);
  } else {
    console.log('Configuration validation PASSED with warnings');
    process.exit(0);
  }
}
