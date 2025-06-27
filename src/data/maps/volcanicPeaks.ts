import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// Balanced health calculation for enemies
// High tier (26-40): base 15 + (level × 3) with rarity modifiers
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

// Merchant inventory for Volcanic Peaks
export const volcanicPeaksMerchantInventory = [
  'Dwarven Axe',
  'Flame Sword',
  'Dragon Slayer',
  'Dragon Scale Armor',
  'Phoenix Mail',
  'Dragon Scale Shield',
  'Winged Boots',
  'Crossbow',
  'Sapphire Ring',
  'Ruby Ring'
];

// ===== VOLCANIC PEAKS (Levels 26-40) =====
export const volcanicPeaksMonsters: WildernessMonster[] = [
  {
    id: 'lava_lizard',
    name: 'Lava Lizard',
    level: 26,
    baseStats: {
      health: calculateEnemyHealth(26, 'common'), // 114 HP
      damage: 78,
      armor: 18,
      speed: 20
    },
    biomes: ['volcanic'],
    rarity: 'common',
    lootTable: [
      { itemId: 'lizard_scale', chance: 0.4 },
      { itemId: 'fire_crystal', chance: 0.3 },
      { itemId: 'health_potion', chance: 0.2 }
    ]
  },
  {
    id: 'fire_imp',
    name: 'Fire Imp',
    level: 27,
    baseStats: {
      health: calculateEnemyHealth(27, 'common'), // 118 HP
      damage: 82,
      armor: 15,
      speed: 25
    },
    biomes: ['volcanic'],
    rarity: 'common',
    lootTable: [
      { itemId: 'imp_horn', chance: 0.5 },
      { itemId: 'sulfur', chance: 0.3 },
      { itemId: 'mana_potion', chance: 0.2 }
    ]
  },
  {
    id: 'magma_golem',
    name: 'Magma Golem',
    level: 28,
    baseStats: {
      health: calculateEnemyHealth(28, 'uncommon'), // 146 HP (122 * 1.2)
      damage: 85,
      armor: 25,
      speed: 8
    },
    biomes: ['volcanic'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'magma_core', chance: 0.6 },
      { itemId: 'obsidian_shard', chance: 0.4 },
      { itemId: 'fire_resistance_potion', chance: 0.3 }
    ]
  },
  {
    id: 'flame_wraith',
    name: 'Flame Wraith',
    level: 29,
    baseStats: {
      health: calculateEnemyHealth(29, 'uncommon'), // 150 HP (126 * 1.2)
      damage: 88,
      armor: 12,
      speed: 30
    },
    biomes: ['volcanic'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'flame_essence', chance: 0.5 },
      { itemId: 'burning_soul', chance: 0.4 },
      { itemId: 'spirit_potion', chance: 0.3 }
    ]
  },
  {
    id: 'volcanic_drake',
    name: 'Volcanic Drake',
    level: 30,
    baseStats: {
      health: calculateEnemyHealth(30, 'rare'), // 195 HP (130 * 1.5)
      damage: 92,
      armor: 22,
      speed: 22
    },
    biomes: ['volcanic'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'drake_wing', chance: 0.6 },
      { itemId: 'volcanic_gem', chance: 0.4 },
      { itemId: 'rare_potion', chance: 0.3 }
    ]
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    level: 32,
    baseStats: {
      health: calculateEnemyHealth(32, 'rare'), // 207 HP (138 * 1.5)
      damage: 96,
      armor: 20,
      speed: 35
    },
    biomes: ['volcanic'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'phoenix_feather', chance: 0.7 },
      { itemId: 'phoenix_ash', chance: 0.5 },
      { itemId: 'resurrection_potion', chance: 0.4 }
    ]
  },
  {
    id: 'lava_titan',
    name: 'Lava Titan',
    level: 35,
    baseStats: {
      health: calculateEnemyHealth(35, 'rare'), // 225 HP (150 * 1.5)
      damage: 105,
      armor: 30,
      speed: 12
    },
    biomes: ['volcanic'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'titan_heart', chance: 0.6 },
      { itemId: 'molten_steel', chance: 0.5 },
      { itemId: 'strength_potion', chance: 0.4 }
    ]
  },
  {
    id: 'inferno_dragon',
    name: 'Inferno Dragon',
    level: 40,
    baseStats: {
      health: calculateEnemyHealth(40, 'elite'), // 340 HP (170 * 2)
      damage: 120,
      armor: 35,
      speed: 25
    },
    biomes: ['volcanic'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'dragon_heart', chance: 0.8 },
      { itemId: 'inferno_scale', chance: 0.6 },
      { itemId: 'legendary_gem', chance: 0.5 },
      { itemId: 'full_heal_potion', chance: 0.4 }
    ]
  }
];

export const volcanicPeaksConfig = {
  id: 'volcanic_peaks',
  name: 'Volcanic Peaks',
  description: 'Treacherous volcanic mountains where fire elementals and ancient dragons dwell.',
  requiredLevel: 26,
  bossDefeated: false,
  monsters: volcanicPeaksMonsters
}; 