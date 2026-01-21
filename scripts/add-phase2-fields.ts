/**
 * Script to add Phase 2 fields to equipment items in master-config.json
 * Adds: certComparison, advantages, disadvantages, applicableScenarios
 */

import * as fs from 'fs';
import * as path from 'path';

const configPath = path.join(process.cwd(), 'public', 'master-config.json');

// Read config
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Phase 2 data for specific items
const phase2Data: Record<string, Partial<{
  certComparison: string;
  advantages: string[];
  disadvantages: string[];
  applicableScenarios: string;
}>> = {
  'helmet-001': {
    certComparison: 'FIA 8860-2018是最新的赛车头盔标准，相比旧版8860-2010提供更严格的冲击测试和火焰防护要求。Snell SA2020是美国标准，侧重于多次冲击保护。',
    advantages: [
      '双重认证提供最高安全保障',
      '碳纤维材质轻量化且强度高',
      '8个通风口提供良好散热'
    ],
    disadvantages: [
      '价格较高',
      '重量略高于Bell HP7'
    ],
    applicableScenarios: '适用于所有级别的赛车运动，特别是F1、GT赛事等高速赛事'
  },
  'helmet-002': {
    certComparison: '同样符合FIA 8860-2018和Snell SA2020双重认证，与Arai GP-7RC处于同一安全级别。',
    advantages: [
      '最轻量化设计（1290g）',
      '10个通风口散热性能最佳',
      '视野开阔'
    ],
    disadvantages: [
      '复合材料强度略低于碳纤维',
      '价格仍然较高'
    ],
    applicableScenarios: '适合长时间耐力赛和炎热环境比赛，对重量和散热要求高的场景'
  },
  'gloves-001': {
    advantages: [
      '外缝线设计提供最佳触感',
      '硅胶防滑颗粒增强抓握力',
      'FIA认证保证安全性'
    ],
    disadvantages: [
      '外缝线耐用性略低',
      '价格较高'
    ],
    applicableScenarios: '适合追求极致操控感的专业车手，特别是方程式和GT赛事'
  },
  'suit-001': {
    certComparison: 'FIA 8856-2018是三层赛车服的最新标准，提供12秒火焰防护时间，相比旧版8856-2000提升了50%的防护时间。',
    advantages: [
      '三层Nomex提供最高防护等级',
      '12秒火焰防护时间',
      '透气性设计减少闷热感'
    ],
    disadvantages: [
      '重量较重',
      '价格昂贵',
      '清洗维护要求高'
    ],
    applicableScenarios: '必备于所有专业赛车运动，特别是高风险的单座赛车和GT赛事'
  },
  'rib-001': {
    advantages: [
      'FIA认证保证防护标准',
      '碳纤维材质轻量化',
      '人体工学设计舒适度高'
    ],
    disadvantages: [
      '价格较高',
      '需要适应期'
    ],
    applicableScenarios: '卡丁车和方程式赛车必备，保护肋骨免受侧向冲击'
  },
  'accessory-001': {
    advantages: [
      'HANS系统显著降低颈部受伤风险',
      'FIA强制要求的安全装备',
      '碳纤维材质轻量化'
    ],
    disadvantages: [
      '需要配合专用头盔使用',
      '限制头部活动范围',
      '价格昂贵'
    ],
    applicableScenarios: '所有高速赛车运动的强制装备，特别是单座赛车和GT赛事'
  }
};

// Update items with Phase 2 data
config.items = config.items.map((item: { id: string }) => {
  if (phase2Data[item.id]) {
    return {
      ...item,
      ...phase2Data[item.id]
    };
  }
  return item;
});

// Write back
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

console.log('✅ Phase 2 fields added successfully!');
console.log(`Updated ${Object.keys(phase2Data).length} items with Phase 2 data`);
