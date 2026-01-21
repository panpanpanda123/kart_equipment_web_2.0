/**
 * DataProvider Demo
 * 
 * This file demonstrates how to use the DataProvider interface
 * and LocalJsonDataProvider implementation.
 */

import { LocalJsonDataProvider } from './dataProvider';
import type { DataProvider } from './dataProvider';

/**
 * Example 1: Basic usage with LocalJsonDataProvider
 */
async function basicUsage() {
  console.log('=== Example 1: Basic Usage ===');
  
  const provider: DataProvider = new LocalJsonDataProvider();
  
  try {
    const config = await provider.loadConfig();
    
    console.log('Configuration loaded successfully!');
    console.log(`Character: ${config.character.name}`);
    console.log(`Slots: ${config.slots.length}`);
    console.log(`Items: ${config.items.length}`);
    console.log(`UI Title: ${config.ui.title}`);
    
    // Show slot details
    console.log('\nSlots:');
    config.slots.forEach(slot => {
      console.log(`  - ${slot.displayName} (${slot.id}): ${slot.allowedTypes.join(', ')}`);
    });
    
    // Show item details
    console.log('\nFirst 3 items:');
    config.items.slice(0, 3).forEach(item => {
      console.log(`  - ${item.displayName} (${item.brand} ${item.model})`);
    });
    
  } catch (error) {
    console.error('Failed to load configuration:', error);
  }
}

/**
 * Example 2: Error handling
 */
async function errorHandling() {
  console.log('\n=== Example 2: Error Handling ===');
  
  const provider = new LocalJsonDataProvider();
  
  try {
    const config = await provider.loadConfig();
    console.log('Config loaded successfully', config.items.length, 'items');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      
      // Handle different error types
      if (error.message.includes('Failed to load config')) {
        console.log('→ Network or file not found error');
      } else if (error.message.includes('Invalid configuration')) {
        console.log('→ Configuration validation error');
      }
    }
  }
}

/**
 * Example 3: Using DataProvider interface for dependency injection
 */
class ConfigurationManager {
  constructor(private dataProvider: DataProvider) {}
  
  async initialize() {
    console.log('\n=== Example 3: Dependency Injection ===');
    
    try {
      const config = await this.dataProvider.loadConfig();
      console.log('ConfigurationManager initialized with config');
      console.log(`Loaded ${config.items.length} items and ${config.slots.length} slots`);
      return config;
    } catch (error) {
      console.error('ConfigurationManager failed to initialize:', error);
      throw error;
    }
  }
}

/**
 * Example 4: Validation behavior demonstration
 */
async function validationBehavior() {
  console.log('\n=== Example 4: Validation Behavior ===');
  
  console.log('Structural validation (fail-fast):');
  console.log('  - character must exist with image');
  console.log('  - must have exactly 10 slots');
  console.log('  - all slots must have non-empty allowedTypes');
  console.log('  - ui section must exist');
  console.log('  → If any fail, throws error immediately');
  
  console.log('\nItem validation (graceful degradation):');
  console.log('  - filters out items missing required fields');
  console.log('  - warns if < 12 valid items remain');
  console.log('  → Continues with valid items');
}

/**
 * Run all examples
 */
async function runExamples() {
  // Note: These examples assume master-config.json exists in public/
  // In a real scenario, you would run these in a browser or with proper setup
  
  await validationBehavior();
  
  // Uncomment to run actual loading examples:
  // await basicUsage();
  // await errorHandling();
  // 
  // const manager = new ConfigurationManager(new LocalJsonDataProvider());
  // await manager.initialize();
}

// Export for use in other files
export { basicUsage, errorHandling, ConfigurationManager, validationBehavior };

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}
