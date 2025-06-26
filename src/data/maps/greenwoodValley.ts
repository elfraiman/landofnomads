import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// Balanced health calculation for enemies
// Low tier (1-8): base 15 + (level × 3) with rarity modifiers
const calculateEnemyHealth = (level: number, rarity: 'common' | 'uncommon' | 'rare' | 'elite') => {
  const baseHealth = 15;
  const levelMultiplier = 3; // Balanced multiplier
  let rarityModifier = 1;
  
  switch (rarity) {
    case 'common': rarityModifier = 1; break;
    case 'uncommon': rarityModifier = 1.2; break;
    case 'rare': rarityModifier = 1.5; break;
    case 'elite': rarityModifier = 2; break;
  }
  
  return Math.floor((baseHealth + (level * levelMultiplier)) * rarityModifier);
};

// Merchant inventory for Greenwood Valley
export const greenwoodValleyMerchantInventory = [
  'Iron Sword',
  'Steel Blade',
  'Knight\'s Blade',
  'Padded Undershirt',
  'Fine Chain Mail',
  'Guardian Shield',
  'Leather Boots',
  'Hunting Bow',
  'Silver Ring',
  'Ring of Power'
];

// ===== GREENWOOD VALLEY (Levels 1-8) =====
export const greenwoodValleyMonsters: WildernessMonster[] = [
  {
    id: 'forest_rabbit',
    name: 'Forest Rabbit',
    emoji: '',
    level: 1,
    baseStats: {
      health: calculateEnemyHealth(1, 'common'), // 12 HP
      damage: 4,
      armor: 1,
      speed: 8
    },
    biomes: ['forest', 'plains'],
    rarity: 'common',
    lootTable: [
      { itemId: 'rabbit_fur', chance: 0.4 },
      { itemId: 'health_potion', chance: 0.1 }
    ]
  },
  {
    id: 'goblin_scout',
    name: 'Goblin Scout',
    emoji: '',
    level: 2,
    baseStats: {
      health: calculateEnemyHealth(2, 'common'), // 14 HP
      damage: 7,
      armor: 2,
      speed: 6
    },
    biomes: ['forest', 'mountains'],
    rarity: 'common',
    lootTable: [
      { itemId: 'goblin_ear', chance: 0.4 },
      { itemId: 'iron_dagger', chance: 0.15 },
      { itemId: 'health_potion', chance: 0.2 }
    ]
  },
  {
    id: 'gray_wolf',
    name: 'Gray Wolf',
    emoji: '',
    level: 3,
    baseStats: {
      health: calculateEnemyHealth(3, 'common'), // 16 HP
      damage: 10,
      armor: 3,
      speed: 12
    },
    biomes: ['forest', 'mountains'],
    rarity: 'common',
    lootTable: [
      { itemId: 'wolf_pelt', chance: 0.5 },
      { itemId: 'wolf_fang', chance: 0.3 },
      { itemId: 'health_potion', chance: 0.15 }
    ]
  },
  {
    id: 'giant_spider',
    name: 'Giant Spider',
    emoji: '',
    level: 4,
    baseStats: {
      health: calculateEnemyHealth(4, 'uncommon'), // 22 HP (18 * 1.2)
      damage: 12,
      armor: 4,
      speed: 10
    },
    biomes: ['forest'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'spider_silk', chance: 0.6 },
      { itemId: 'poison_sac', chance: 0.3 },
      { itemId: 'mana_potion', chance: 0.2 }
    ]
  },
  {
    id: 'orc_warrior',
    name: 'Orc Warrior',
    emoji: '',
    level: 5,
    baseStats: {
      health: calculateEnemyHealth(5, 'uncommon'), // 24 HP (20 * 1.2)
      damage: 15,
      armor: 6,
      speed: 8
    },
    biomes: ['forest', 'mountains'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'orc_tusk', chance: 0.4 },
      { itemId: 'iron_sword', chance: 0.2 },
      { itemId: 'leather_armor', chance: 0.15 }
    ]
  },
  {
    id: 'forest_wisp',
    name: 'Forest Wisp',
    emoji: '',
    level: 6,
    baseStats: {
      health: calculateEnemyHealth(6, 'rare'), // 33 HP (22 * 1.5)
      damage: 18,
      armor: 4,
      speed: 15
    },
    biomes: ['forest'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'wisp_essence', chance: 0.5 },
      { itemId: 'magic_crystal', chance: 0.3 },
      { itemId: 'mana_potion', chance: 0.4 }
    ]
  },
  {
    id: 'ancient_bear',
    name: 'Ancient Bear',
    emoji: '',
    level: 7,
    baseStats: {
      health: calculateEnemyHealth(7, 'rare'), // 36 HP (24 * 1.5)
      damage: 22,
      armor: 8,
      speed: 10
    },
    biomes: ['forest', 'mountains'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'bear_claw', chance: 0.6 },
      { itemId: 'bear_hide', chance: 0.4 },
      { itemId: 'strength_potion', chance: 0.3 }
    ]
  },
  {
    id: 'forest_guardian',
    name: 'Forest Guardian',
    emoji: '',
    level: 8,
    baseStats: {
      health: calculateEnemyHealth(8, 'elite'), // 52 HP (26 * 2)
      damage: 25,
      armor: 10,
      speed: 12
    },
    biomes: ['forest'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'guardian_core', chance: 0.8 },
      { itemId: 'enchanted_wood', chance: 0.5 },
      { itemId: 'rare_gem', chance: 0.3 },
      { itemId: 'full_heal_potion', chance: 0.4 }
    ]
  }
];

export const greenwoodValleyConfig = {
  id: 'greenwood_valley',
  name: 'Greenwood Valley',
  description: 'A peaceful forest valley filled with wildlife and ancient trees. Perfect for new adventurers.',
  requiredLevel: 1,
  bossDefeated: false,
  monsters: greenwoodValleyMonsters
}; 