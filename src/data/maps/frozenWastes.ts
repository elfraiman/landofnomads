import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// Merchant inventory for Frozen Wastes
export const frozenWastesMerchantInventory = [
  'Excalibur',
  'Soul Reaper',
  'Ice Mail',
  'Hermes\' Sandals',
  'Philosopher\'s Stone',
  'Viper\'s Fang',
  'Champion\'s Sword',
  'Aegis Blade',
  'Mail of the Dead',
  'Blessed Angelic Armor'
];

// ===== FROZEN WASTES (Levels 35-45) =====
export const frozenWastesMonsters: WildernessMonster[] = [
  {
    id: 'frost_wolf',
    name: 'Frost Wolf',
    emoji: '',
    level: 35,
    baseStats: {
      health: 2100,
      damage: 125,
      armor: 30,
      speed: 22
    },
    biomes: ['tundra'],
    rarity: 'common',
    lootTable: [
      { itemId: 'frost_pelt', chance: 0.5 },
      { itemId: 'ice_crystal', chance: 0.3 }
    ]
  },
  {
    id: 'ice_elemental',
    name: 'Ice Elemental',
    emoji: '',
    level: 36,
    baseStats: {
      health: 2160,
      damage: 130,
      armor: 25,
      speed: 18
    },
    biomes: ['tundra'],
    rarity: 'common',
    lootTable: [
      { itemId: 'elemental_ice', chance: 0.4 },
      { itemId: 'frozen_essence', chance: 0.35 },
      { itemId: 'mana_potion', chance: 0.25 }
    ]
  },
  {
    id: 'yeti',
    name: 'Yeti',
    emoji: '',
    level: 37,
    baseStats: {
      health: 2220,
      damage: 120,
      armor: 40,
      speed: 14
    },
    biomes: ['tundra'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'yeti_fur', chance: 0.5 },
      { itemId: 'giant_claw', chance: 0.3 },
      { itemId: 'strength_potion', chance: 0.2 }
    ]
  },
  {
    id: 'frost_giant',
    name: 'Frost Giant',
    emoji: '',
    level: 38,
    baseStats: {
      health: 2280,
      damage: 140,
      armor: 35,
      speed: 12
    },
    biomes: ['tundra'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'giant_bone', chance: 0.4 },
      { itemId: 'frost_gem', chance: 0.3 },
      { itemId: 'ice_armor_shard', chance: 0.2 }
    ]
  },
  {
    id: 'ice_dragon',
    name: 'Ice Dragon',
    emoji: '',
    level: 39,
    baseStats: {
      health: 2340,
      damage: 145,
      armor: 45,
      speed: 16
    },
    biomes: ['tundra'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'dragon_ice', chance: 0.6 },
      { itemId: 'ice_scale', chance: 0.4 },
      { itemId: 'rare_gem', chance: 0.3 }
    ]
  },
  {
    id: 'blizzard_wraith',
    name: 'Blizzard Wraith',
    emoji: '',
    level: 40,
    baseStats: {
      health: 2200,
      damage: 160,
      armor: 20,
      speed: 28
    },
    biomes: ['tundra'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'wraith_essence', chance: 0.5 },
      { itemId: 'blizzard_core', chance: 0.35 },
      { itemId: 'speed_potion', chance: 0.25 }
    ]
  },
  {
    id: 'frost_lich',
    name: 'Frost Lich',
    emoji: '',
    level: 41,
    baseStats: {
      health: 2460,
      damage: 155,
      armor: 35,
      speed: 20
    },
    biomes: ['tundra'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'lich_crown', chance: 0.4 },
      { itemId: 'frozen_soul', chance: 0.35 },
      { itemId: 'legendary_potion', chance: 0.3 }
    ]
  },
  {
    id: 'ancient_glacier',
    name: 'Ancient Glacier',
    emoji: '',
    level: 42,
    baseStats: {
      health: 2520,
      damage: 150,
      armor: 50,
      speed: 8
    },
    biomes: ['tundra'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'glacier_heart', chance: 0.8 },
      { itemId: 'eternal_ice', chance: 0.6 },
      { itemId: 'legendary_gem', chance: 0.5 },
      { itemId: 'full_heal_potion', chance: 0.4 }
    ]
  }
];

export const frozenWastesConfig = {
  id: 'frozen_wastes',
  name: 'Frozen Wastes',
  description: 'A harsh, frozen wasteland where only the strongest survive the eternal winter.',
  requiredLevel: 35,
  bossDefeated: false,
  monsters: frozenWastesMonsters
}; 