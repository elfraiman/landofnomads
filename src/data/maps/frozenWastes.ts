import { WildernessMonster } from '../../types/wilderness';


// Balanced health calculation for enemies
// Mid tier (9-15): base 15 + (level × 3) with rarity modifiers
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

// Merchant inventory for Frozen Wastes
export const frozenWastesMerchantInventory = [
  'Steel Blade',
  'Knight\'s Blade',
  'Elven Blade',
  'Fine Chain Mail',
  'Plate Armor',
  'Steel Tower Shield',
  'Steel Boots',
  'Composite Bow',
  'Ring of Power',
  'Emerald Ring'
];

// ===== FROZEN WASTES (Levels 9-15) =====
export const frozenWastesMonsters: WildernessMonster[] = [
  {
    id: 'ice_wolf',
    name: 'Ice Wolf',
    emoji: '',
    level: 9,
    baseStats: {
      health: calculateEnemyHealth(9, 'common'), // 37 HP
      damage: 28,
      armor: 8,
      speed: 14
    },
    biomes: ['tundra'],
    rarity: 'common',
    lootTable: [
      { itemId: 'ice_shard', chance: 0.4 },
      { itemId: 'frost_pelt', chance: 0.3 },
      { itemId: 'health_potion', chance: 0.2 }
    ]
  },
  {
    id: 'frost_goblin',
    name: 'Frost Goblin',
    emoji: '',
    level: 10,
    baseStats: {
      health: calculateEnemyHealth(10, 'common'), // 40 HP
      damage: 30,
      armor: 10,
      speed: 12
    },
    biomes: ['tundra', 'mountains'],
    rarity: 'common',
    lootTable: [
      { itemId: 'frozen_bone', chance: 0.4 },
      { itemId: 'ice_crystal', chance: 0.25 },
      { itemId: 'mana_potion', chance: 0.2 }
    ]
  },
  {
    id: 'snow_leopard',
    name: 'Snow Leopard',
    emoji: '',
    level: 11,
    baseStats: {
      health: calculateEnemyHealth(11, 'uncommon'), // 50 HP (43 * 1.2)
      damage: 35,
      armor: 12,
      speed: 18
    },
    biomes: ['tundra', 'mountains'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'leopard_spot', chance: 0.5 },
      { itemId: 'thick_fur', chance: 0.4 },
      { itemId: 'agility_potion', chance: 0.3 }
    ]
  },
  {
    id: 'ice_elemental',
    name: 'Ice Elemental',
    emoji: '',
    level: 12,
    baseStats: {
      health: calculateEnemyHealth(12, 'uncommon'), // 53 HP (46 * 1.2)
      damage: 38,
      armor: 15,
      speed: 10
    },
    biomes: ['tundra'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'elemental_ice', chance: 0.6 },
      { itemId: 'frozen_core', chance: 0.3 },
      { itemId: 'mana_potion', chance: 0.4 }
    ]
  },
  {
    id: 'yeti',
    name: 'Yeti',
    emoji: '',
    level: 13,
    baseStats: {
      health: calculateEnemyHealth(13, 'rare'), // 73 HP (49 * 1.5)
      damage: 42,
      armor: 18,
      speed: 12
    },
    biomes: ['tundra', 'mountains'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'yeti_fur', chance: 0.5 },
      { itemId: 'giant_fang', chance: 0.4 },
      { itemId: 'strength_potion', chance: 0.3 }
    ]
  },
  {
    id: 'frost_giant',
    name: 'Frost Giant',
    emoji: '',
    level: 14,
    baseStats: {
      health: calculateEnemyHealth(14, 'rare'), // 78 HP (52 * 1.5)
      damage: 45,
      armor: 20,
      speed: 8
    },
    biomes: ['tundra', 'mountains'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'giant_bone', chance: 0.6 },
      { itemId: 'frost_gem', chance: 0.4 },
      { itemId: 'defense_potion', chance: 0.3 }
    ]
  },
  {
    id: 'ice_dragon',
    name: 'Ice Dragon',
    emoji: '',
    level: 15,
    baseStats: {
      health: calculateEnemyHealth(15, 'elite'), // 110 HP (55 * 2)
      damage: 50,
      armor: 25,
      speed: 15
    },
    biomes: ['tundra'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'dragon_scale', chance: 0.8 },
      { itemId: 'ice_heart', chance: 0.5 },
      { itemId: 'rare_gem', chance: 0.4 },
      { itemId: 'full_heal_potion', chance: 0.4 }
    ]
  }
];

export const frozenWastesConfig = {
  id: 'frozen_wastes',
  name: 'Frozen Wastes',
  description: 'A harsh, icy wilderness where only the strong survive. The cold bites deep.',
  requiredLevel: 9,
  bossDefeated: false,
  monsters: frozenWastesMonsters
}; 