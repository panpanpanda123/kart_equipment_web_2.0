/**
 * Generate placeholder images for equipment items and character
 * Creates simple colored SVG files as placeholders
 */

import * as fs from 'fs';
import * as path from 'path';

// Color palette for different equipment types
const colors: Record<string, string> = {
  '头盔': '#FF6B6B',
  '头套': '#4ECDC4',
  '手套': '#45B7D1',
  '赛车服': '#FFA07A',
  '护肋': '#98D8C8',
  '赛车鞋': '#F7DC6F',
  '饰品': '#BB8FCE',
};

/**
 * Generate SVG placeholder
 */
function generateSVG(text: string, color: string, size: number = 100): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
}

/**
 * Generate character placeholder
 */
function generateCharacterSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#E3F2FD;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#BBDEFB;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)"/>
  <text x="150" y="200" font-family="Arial" font-size="48" text-anchor="middle">🏎️</text>
  <text x="150" y="250" font-family="Arial" font-size="16" fill="#666" text-anchor="middle">赛车手形象</text>
</svg>`;
}

// Equipment items from config
const items = [
  { id: 'helmet-001', type: '头盔', model: 'GP-7RC' },
  { id: 'helmet-002', type: '头盔', model: 'HP7' },
  { id: 'helmet-003', type: '头盔', model: 'ST5 GT' },
  { id: 'balaclava-001', type: '头套', model: 'Prime H' },
  { id: 'balaclava-002', type: '头套', model: 'Race v3' },
  { id: 'gloves-001', type: '手套', model: 'Arrow RG-7' },
  { id: 'gloves-002', type: '手套', model: 'Tech-1 K' },
  { id: 'suit-001', type: '赛车服', model: 'Prime SP-16' },
  { id: 'suit-002', type: '赛车服', model: 'GP Tech v3' },
  { id: 'rib-001', type: '护肋', model: 'BRV Pro' },
  { id: 'rib-002', type: '护肋', model: 'P1' },
  { id: 'shoes-001', type: '赛车鞋', model: 'Speedcat Pro' },
  { id: 'shoes-002', type: '赛车鞋', model: 'Slalom RB-3' },
  { id: 'accessory-001', type: '饰品', model: 'Badge' },
  { id: 'accessory-002', type: '饰品', model: 'Patch' },
  { id: 'accessory-003', type: '饰品', model: 'Decal' },
];

// Generate character image (SVG)
const characterSVG = generateCharacterSVG();
fs.writeFileSync(path.join('public', 'character.svg'), characterSVG);
console.log('✓ Generated character.svg');

// Generate equipment icons and images (SVG)
items.forEach(item => {
  const color = colors[item.type] || '#95A5A6';
  
  // Icon (smaller, with type label)
  const iconSVG = generateSVG(item.type, color, 64);
  const iconPath = path.join('public', 'icons', `${item.id.replace('/', '-')}.svg`);
  fs.writeFileSync(iconPath, iconSVG);
  
  // Image (larger, with model label)
  const imageSVG = generateSVG(item.model, color, 200);
  const imagePath = path.join('public', 'images', `${item.id.replace('/', '-')}.svg`);
  fs.writeFileSync(imagePath, imageSVG);
});

console.log(`✓ Generated ${items.length} equipment icons`);
console.log(`✓ Generated ${items.length} equipment images`);
console.log('\n✅ All placeholder images generated successfully!');
console.log('\n📝 Note: Update master-config.json to use .svg extensions instead of .png');

