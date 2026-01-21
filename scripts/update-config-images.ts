/**
 * Update master-config.json to use .svg instead of .png
 */

import * as fs from 'fs';
import * as path from 'path';

const configPath = path.join('public', 'master-config.json');

// Read config
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Update character image
config.character.image = config.character.image.replace('.png', '.svg');

// Update all item icons and images
config.items.forEach((item: { icon: string; image: string }) => {
  item.icon = item.icon.replace('.png', '.svg');
  item.image = item.image.replace('.png', '.svg');
});

// Write back
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

console.log('✅ Updated master-config.json to use .svg extensions');
console.log(`   Character: ${config.character.image}`);
console.log(`   Items: ${config.items.length} items updated`);
