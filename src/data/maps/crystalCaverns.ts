import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// Balanced health calculation for enemies
// Boss tier (41-50): base 15 + (level × 3) with rarity modifiers
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

// Merchant inventory for Crystal Caverns
export const crystalCavernsMerchantInventory = [
  'Dragon Slayer',
  'Legendary Sword',
  'Phoenix Mail',
  'Celestial Armor',
  'Divine Aegis',
  'Hermes\' Sandals',
  'Celestial Bow',
  'Ruby Ring',
  'Diamond Ring',
  'Champion\'s Sword'
];

// ===== CRYSTAL CAVERNS (Levels 41-50) =====
export const crystalCavernsMonsters: WildernessMonster[] = [
  {
    id: 'crystal_bat',
    name: 'Crystal Bat',
    level: 41,
    baseStats: {
      health: calculateEnemyHealth(41, 'common'), // 215 HP
      damage: 123,
      armor: 25,
      speed: 30
    },
    biomes: ['underground'],
    rarity: 'common',
    lootTable: [
      { itemId: 'crystal_wing', chance: 0.4 },
      { itemId: 'echo_crystal', chance: 0.3 },
      { itemId: 'health_potion', chance: 0.2 }
    ]
  },
  {
    id: 'crystal_mite',
    name: 'Crystal Mite',
    level: 42,
    baseStats: {
      health: calculateEnemyHealth(42, 'common'), // 220 HP
      damage: 126,
      armor: 20,
      speed: 25
    },
    biomes: ['underground'],
    rarity: 'common',
    lootTable: [
      { itemId: 'crystal_shard', chance: 0.5 },
      { itemId: 'prismatic_dust', chance: 0.3 },
      { itemId: 'mana_potion', chance: 0.2 }
    ]
  },
  {
    id: 'stone_golem',
    name: 'Stone Golem',
    level: 43,
    baseStats: {
      health: calculateEnemyHealth(43, 'uncommon'), // 271 HP (225 * 1.2)
      damage: 129,
      armor: 35,
      speed: 10
    },
    biomes: ['underground'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'stone_core', chance: 0.6 },
      { itemId: 'earth_gem', chance: 0.4 },
      { itemId: 'defense_potion', chance: 0.3 }
    ]
  },
  {
    id: 'crystal_spider',
    name: 'Crystal Spider',
    level: 44,
    baseStats: {
      health: calculateEnemyHealth(44, 'uncommon'), // 276 HP (230 * 1.2)
      damage: 132,
      armor: 28,
      speed: 28
    },
    biomes: ['underground'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'crystal_web', chance: 0.5 },
      { itemId: 'prismatic_shard', chance: 0.4 },
      { itemId: 'poison_potion', chance: 0.3 }
    ]
  },
  {
    id: 'cave_troll',
    name: 'Cave Troll',
    level: 45,
    baseStats: {
      health: calculateEnemyHealth(45, 'rare'), // 368 HP (235 * 1.5)
      damage: 135,
      armor: 32,
      speed: 15
    },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'troll_bone', chance: 0.6 },
      { itemId: 'cave_moss', chance: 0.5 },
      { itemId: 'strength_potion', chance: 0.4 }
    ]
  },
  {
    id: 'crystal_elemental',
    name: 'Crystal Elemental',
    level: 46,
    baseStats: {
      health: calculateEnemyHealth(46, 'rare'), // 375 HP (240 * 1.5)
      damage: 138,
      armor: 30,
      speed: 25
    },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'elemental_core', chance: 0.7 },
      { itemId: 'pure_crystal', chance: 0.5 },
      { itemId: 'mana_potion', chance: 0.4 }
    ]
  },
  {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    level: 47,
    baseStats: {
      health: calculateEnemyHealth(47, 'rare'), // 383 HP (245 * 1.5)
      damage: 141,
      armor: 25,
      speed: 35
    },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'shadow_essence', chance: 0.6 },
      { itemId: 'wraith_cloak', chance: 0.5 },
      { itemId: 'stealth_potion', chance: 0.4 }
    ]
  },
  {
    id: 'gem_golem',
    name: 'Gem Golem',
    level: 48,
    baseStats: {
      health: calculateEnemyHealth(48, 'rare'), // 390 HP (250 * 1.5)
      damage: 144,
      armor: 40,
      speed: 8
    },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'gem_heart', chance: 0.7 },
      { itemId: 'precious_stone', chance: 0.5 },
      { itemId: 'legendary_potion', chance: 0.3 }
    ]
  },
  {
    id: 'crystal_dragon',
    name: 'Crystal Dragon',
    level: 50,
    baseStats: {
      health: calculateEnemyHealth(50, 'elite'), // 520 HP (260 * 2)
      damage: 150,
      armor: 45,
      speed: 20
    },
    biomes: ['underground'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'dragon_crystal', chance: 0.8 },
      { itemId: 'crystal_scale', chance: 0.7 },
      { itemId: 'legendary_gem', chance: 0.6 },
      { itemId: 'full_heal_potion', chance: 0.5 }
    ]
  }
];

export const crystalCavernsConfig = {
  id: 'crystal_caverns',
  name: 'Crystal Caverns',
  description: 'Ancient underground caverns filled with powerful crystal guardians and legendary treasures.',
  requiredLevel: 41,
  bossDefeated: false,
  monsters: crystalCavernsMonsters
}; 