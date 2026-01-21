/**
 * Quick diagnostic script to check app status
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Checking Racing Equipment Config App Status...\n');

// Check config file
console.log('1. Configuration File:');
try {
  const configPath = path.join('public', 'master-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  console.log(`   ✓ Config loaded successfully`);
  console.log(`   ✓ Character image: ${config.character.image}`);
  console.log(`   ✓ Slots: ${config.slots.length} slots`);
  console.log(`   ✓ Items: ${config.items.length} items`);
} catch (error) {
  console.log(`   ✗ Error loading config: ${error}`);
}

// Check images
console.log('\n2. Image Files:');
const characterExists = fs.existsSync(path.join('public', 'character.svg'));
console.log(`   ${characterExists ? '✓' : '✗'} Character image: ${characterExists ? 'EXISTS' : 'MISSING'}`);

const iconsCount = fs.readdirSync(path.join('public', 'icons')).filter(f => f.endsWith('.svg')).length;
console.log(`   ${iconsCount >= 16 ? '✓' : '✗'} Equipment icons: ${iconsCount} files`);

const imagesCount = fs.readdirSync(path.join('public', 'images')).filter(f => f.endsWith('.svg')).length;
console.log(`   ${imagesCount >= 16 ? '✓' : '✗'} Equipment images: ${imagesCount} files`);

// Check source files
console.log('\n3. Source Files:');
const sourceFiles = [
  'src/App.tsx',
  'src/components/CharacterView.tsx',
  'src/components/EquipmentSlot.tsx',
  'src/components/EquipmentCard.tsx',
  'src/components/EquipmentLibrary.tsx',
  'src/components/StatusBar.tsx',
  'src/components/Toast.tsx',
  'src/services/compatibilityChecker.ts',
  'src/services/storageManager.ts',
  'src/services/dataProvider.ts',
  'src/types/index.ts',
];

sourceFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
});

console.log('\n4. Dev Server:');
console.log('   ℹ️  Should be running at http://localhost:5173/');
console.log('   ℹ️  Check browser console for any errors');

console.log('\n✅ Diagnostic complete!');
console.log('\n📝 Next steps:');
console.log('   1. Open http://localhost:5173/ in your browser');
console.log('   2. Open browser DevTools (F12)');
console.log('   3. Check Console tab for errors');
console.log('   4. Check Network tab to see if images are loading');
