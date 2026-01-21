# Public Assets Directory

This directory contains static assets served by the application.

## master-config.json

The main configuration file for the Racing Equipment Configuration System.

### Structure Overview

```json
{
  "character": { ... },      // Character display configuration
  "slots": [ ... ],          // 10 equipment slot definitions
  "items": [ ... ],          // 16 equipment items
  "ui": { ... },             // UI labels and text
  "achievements": { ... }    // Placeholder for future features
}
```

### Slots Configuration (10 slots)

| Slot ID | Type | Required | Max Count | Position |
|---------|------|----------|-----------|----------|
| helmet | 头盔 | ✅ Yes | 1 | Top: 8%, Left: 38% |
| balaclava | 头套 | No | 1 | Top: 12%, Left: 42% |
| gloves | 手套 | No | 1 | Top: 45%, Left: 20% |
| suit | 赛车服 | No | 1 | Top: 35%, Left: 38% |
| rib-protector | 护肋 | ✅ Yes | 1 | Top: 38%, Left: 42% |
| shoes | 赛车鞋 | No | 1 | Top: 75%, Left: 38% |
| accessory-1 | 饰品 | No | 2 | Top: 25%, Left: 15% |
| accessory-2 | 饰品 | No | 2 | Top: 25%, Left: 75% |
| accessory-3 | 饰品 | No | 2 | Top: 55%, Left: 15% |
| accessory-4 | 饰品 | No | 2 | Top: 55%, Left: 75% |

### Equipment Items (16 items)

#### Helmets (3)
- Arai GP-7RC - 1350g, 8 vents, FIA 8860-2018 + Snell SA2020
- Bell HP7 - 1290g, 10 vents, FIA 8860-2018 + Snell SA2020
- Stilo ST5 GT - 1380g, 7 vents, FIA 8860-2018

#### Balaclavas (2)
- Sparco Prime H - 85g, FIA 8856-2018
- Alpinestars Race v3 - 75g, FIA 8856-2018

#### Gloves (2)
- Sparco Arrow RG-7 - 120g, FIA 8856-2018
- Alpinestars Tech-1 K Race v2 - 95g, FIA 8856-2018

#### Suits (2)
- Sparco Prime SP-16 - 1850g, FIA 8856-2018
- Alpinestars GP Tech v3 - 1650g, FIA 8856-2018

#### Rib Protectors (2)
- Bengio BRV Pro - 850g, FIA 8870-2018
- Stand 21 P1 - 780g, FIA 8870-2018

#### Shoes (2)
- Puma Speedcat Pro - 420g, FIA 8856-2018
- Sparco Slalom RB-3 - 450g, FIA 8856-2018

#### Accessories (3)
- OMP Racing Badge
- Sparco Team Patch
- Alpinestars Sponsor Decal

## Image Assets (To Be Added)

The configuration references the following image paths that need to be created:

### Character
- `/character.png` - Pixel-art racing driver character

### Equipment Icons (thumbnails for equipment library)
- `/icons/helmet-*.png` (3 files)
- `/icons/balaclava-*.png` (2 files)
- `/icons/gloves-*.png` (2 files)
- `/icons/suit-*.png` (2 files)
- `/icons/rib-*.png` (2 files)
- `/icons/shoes-*.png` (2 files)
- `/icons/accessory-*.png` (3 files)

### Equipment Images (full-size for detail view)
- `/images/helmet-*.png` (3 files)
- `/images/balaclava-*.png` (2 files)
- `/images/gloves-*.png` (2 files)
- `/images/suit-*.png` (2 files)
- `/images/rib-*.png` (2 files)
- `/images/shoes-*.png` (2 files)
- `/images/accessory-*.png` (3 files)

**Note**: Placeholder images can be used during development. The application will gracefully handle missing images.

## Validation

To validate the configuration file structure:

```bash
npm run validate-config
```

This will check:
- Exactly 10 slots defined
- 2 required slots (helmet and rib-protector)
- All slots have percentage-based positioning
- All slots have non-empty allowedTypes
- At least 12 equipment items
- All items have required fields
- TypeScript type compliance
