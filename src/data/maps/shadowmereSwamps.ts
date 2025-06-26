import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// Balanced health calculation for enemies
// Mid tier (16-25): base 15 + (level × 3) with rarity modifiers
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

// Merchant inventory for Shadowmere Swamps
export const shadowmereSwampsMerchantInventory = [
  'Knight\'s Blade',
  'Elven Blade',
  'Dwarven Axe',
  'Plate Armor',
  'Dragon Scale Armor',
  'Steel Tower Shield',
  'Steel Boots',
  'Longbow',
  'Emerald Ring',
  'Sapphire Ring'
];

// ===== SHADOWMERE SWAMPS (Levels 16-25) =====
export const shadowmereSwampsMonsters: WildernessMonster[] = [
  {
    id: 'swamp_rat',
    name: 'Swamp Rat',
    emoji: '',
    level: 16,
    baseStats: {
      health: calculateEnemyHealth(16, 'common'), // 58 HP
      damage: 48,
      armor: 12,
      speed: 16
    },
    biomes: ['swamp'],
    rarity: 'common',
    lootTable: [
      { itemId: 'rat_tail', chance: 0.4 },
      { itemId: 'swamp_moss', chance: 0.3 },
      { itemId: 'health_potion', chance: 0.2 }
    ]
  },
  {
    id: 'bog_troll',
    name: 'Bog Troll',
    emoji: '',
    level: 17,
    baseStats: {
      health: calculateEnemyHealth(17, 'common'), // 61 HP
      damage: 52,
      armor: 15,
      speed: 10
    },
    biomes: ['swamp'],
    rarity: 'common',
    lootTable: [
      { itemId: 'troll_moss', chance: 0.5 },
      { itemId: 'bog_water', chance: 0.3 },
      { itemId: 'mana_potion', chance: 0.2 }
    ]
  },
  {
    id: 'poison_spider',
    name: 'Poison Spider',
    emoji: '',
    level: 18,
    baseStats: {
      health: calculateEnemyHealth(18, 'uncommon'), // 77 HP (64 * 1.2)
      damage: 55,
      armor: 10,
      speed: 20
    },
    biomes: ['swamp', 'forest'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'poison_gland', chance: 0.6 },
      { itemId: 'spider_leg', chance: 0.4 },
      { itemId: 'poison_potion', chance: 0.3 }
    ]
  },
  {
    id: 'marsh_wraith',
    name: 'Marsh Wraith',
    emoji: '',
    level: 19,
    baseStats: {
      health: calculateEnemyHealth(19, 'uncommon'), // 80 HP (67 * 1.2)
      damage: 58,
      armor: 8,
      speed: 25
    },
    biomes: ['swamp'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'wraith_essence', chance: 0.5 },
      { itemId: 'ectoplasm', chance: 0.4 },
      { itemId: 'spirit_potion', chance: 0.3 }
    ]
  },
  {
    id: 'swamp_dragon',
    name: 'Swamp Dragon',
    emoji: '',
    level: 20,
    baseStats: {
      health: calculateEnemyHealth(20, 'rare'), // 105 HP (70 * 1.5)
      damage: 62,
      armor: 20,
      speed: 18
    },
    biomes: ['swamp'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'dragon_hide', chance: 0.6 },
      { itemId: 'swamp_crystal', chance: 0.4 },
      { itemId: 'rare_potion', chance: 0.3 }
    ]
  },
  {
    id: 'ancient_treant',
    name: 'Ancient Treant',
    emoji: '',
    level: 21,
    baseStats: {
      health: calculateEnemyHealth(21, 'rare'), // 109 HP (73 * 1.5)
      damage: 60,
      armor: 25,
      speed: 8
    },
    biomes: ['swamp', 'forest'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'ancient_bark', chance: 0.7 },
      { itemId: 'living_root', chance: 0.5 },
      { itemId: 'nature_essence', chance: 0.4 }
    ]
  },
  {
    id: 'shadow_beast',
    name: 'Shadow Beast',
    emoji: '',
    level: 22,
    baseStats: {
      health: calculateEnemyHealth(22, 'rare'), // 112 HP (76 * 1.5)
      damage: 68,
      armor: 15,
      speed: 22
    },
    biomes: ['swamp'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'shadow_fur', chance: 0.5 },
      { itemId: 'dark_essence', chance: 0.4 },
      { itemId: 'stealth_potion', chance: 0.3 }
    ]
  },
  {
    id: 'bog_king',
    name: 'Bog King',
    emoji: '',
    level: 25,
    baseStats: {
      health: calculateEnemyHealth(25, 'elite'), // 170 HP (85 * 2)
      damage: 75,
      armor: 30,
      speed: 15
    },
    biomes: ['swamp'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'royal_crown', chance: 0.8 },
      { itemId: 'bog_heart', chance: 0.6 },
      { itemId: 'legendary_gem', chance: 0.4 },
      { itemId: 'full_heal_potion', chance: 0.5 }
    ]
  }
];

export const shadowmereSwampsConfig = {
  id: 'shadowmere_swamps',
  name: 'Shadowmere Swamps',
  description: 'A dark, treacherous swampland where poisonous creatures lurk in the murky waters.',
  requiredLevel: 16,
  bossDefeated: false,
  monsters: shadowmereSwampsMonsters
}; 