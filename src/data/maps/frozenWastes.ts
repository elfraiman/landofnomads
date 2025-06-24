import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// ===== FROZEN WASTES (Levels 32-45) =====
export const frozenWastesMonsters: WildernessMonster[] = [
  {
    id: 'ice_wolf',
    name: 'Ice Wolf',
    emoji: '',
    level: 35,
    baseStats: {
      health: 600,
      damage: 110,
      armor: 65,
      speed: 16
    },
    biomes: ['tundra'],
    rarity: 'common',
    lootTable: [
      { itemId: 'ice_pelt', chance: 0.4 },
      { itemId: 'frost_essence', chance: 0.3 }
    ]
  },
  {
    id: 'frost_wraith',
    name: 'Frost Wraith',
    emoji: '',
    level: 36,
    baseStats: {
      health: 520,
      damage: 115,
      armor: 55,
      speed: 18
    },
    biomes: ['tundra'],
    rarity: 'common',
    lootTable: [
      { itemId: 'frost_essence', chance: 0.45 },
      { itemId: 'spectral_ice', chance: 0.25 },
      { itemId: 'mana_potion', chance: 0.2 }
    ]
  },
  {
    id: 'ice_troll',
    name: 'Ice Troll',
    emoji: '',
    level: 37,
    baseStats: {
      health: 800,
      damage: 125,
      armor: 85,
      speed: 8
    },
    biomes: ['tundra'],
    rarity: 'common',
    lootTable: [
      { itemId: 'frozen_bone', chance: 0.4 },
      { itemId: 'ice_essence', chance: 0.3 },
      { itemId: 'strength_potion', chance: 0.15 }
    ]
  },
  {
    id: 'frost_giant',
    name: 'Frost Giant',
    emoji: '',
    level: 38,
    baseStats: {
      health: 1000,
      damage: 140,
      armor: 90,
      speed: 6
    },
    biomes: ['tundra'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'giant_bone', chance: 0.3 },
      { itemId: 'ice_gem', chance: 0.2 }
    ]
  },
  {
    id: 'arctic_bear',
    name: 'Arctic Bear',
    emoji: '',
    level: 39,
    baseStats: {
      health: 900,
      damage: 135,
      armor: 80,
      speed: 10
    },
    biomes: ['tundra'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'arctic_fur', chance: 0.4 },
      { itemId: 'bear_claw', chance: 0.25 },
      { itemId: 'ice_essence', chance: 0.3 }
    ]
  },
  {
    id: 'ice_dragon',
    name: 'Ice Dragon',
    emoji: '',
    level: 40,
    baseStats: {
      health: 1200,
      damage: 160,
      armor: 100,
      speed: 12
    },
    biomes: ['tundra'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'ice_dragon_scale', chance: 0.15 },
      { itemId: 'frozen_heart', chance: 0.1 },
      { itemId: 'legendary_gem', chance: 0.08 }
    ]
  },
  {
    id: 'blizzard_elemental',
    name: 'Blizzard Elemental',
    emoji: '',
    level: 42,
    baseStats: {
      health: 800,
      damage: 150,
      armor: 70,
      speed: 14
    },
    biomes: ['tundra'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'blizzard_core', chance: 0.35 },
      { itemId: 'ice_essence', chance: 0.4 }
    ]
  },
  {
    id: 'winter_king',
    name: 'Winter King',
    emoji: '',
    level: 45,
    baseStats: {
      health: 1500,
      damage: 180,
      armor: 120,
      speed: 8
    },
    biomes: ['tundra'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'winter_crown', chance: 0.1 },
      { itemId: 'eternal_ice', chance: 0.15 },
      { itemId: 'king_scepter', chance: 0.12 }
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