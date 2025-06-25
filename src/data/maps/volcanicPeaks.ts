import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// Merchant inventory for Volcanic Peaks
export const volcanicPeaksMerchantInventory = [
  'Staff of Eternal Fire',
  'Dragonbone Sword',
  'Berserker Axe',
  'Red Dragon Mail',
  'Demonic Plate Armor',
  'Dragon Heart Pendant',
  'Dragonslayer Crossbow',
  'Chaos Blade',
  'Fortress Hammer',
  'Aegis Blade'
];

// ===== VOLCANIC PEAKS (Levels 25-35) =====
export const volcanicPeaksMonsters: WildernessMonster[] = [
  {
    id: 'lava_salamander',
    name: 'Lava Salamander',
    emoji: '',
    level: 25,
    baseStats: {
      health: 1500,
      damage: 75,
      armor: 20,
      speed: 18
    },
    biomes: ['volcanic'],
    rarity: 'common',
    lootTable: [
      { itemId: 'salamander_scale', chance: 0.4 },
      { itemId: 'fire_essence', chance: 0.3 }
    ]
  },
  {
    id: 'fire_imp',
    name: 'Fire Imp',
    emoji: '',
    level: 26,
    baseStats: {
      health: 1430,
      damage: 85,
      armor: 15,
      speed: 25
    },
    biomes: ['volcanic'],
    rarity: 'common',
    lootTable: [
      { itemId: 'imp_horn', chance: 0.35 },
      { itemId: 'flame_crystal', chance: 0.25 },
      { itemId: 'mana_potion', chance: 0.2 }
    ]
  },
  {
    id: 'magma_golem',
    name: 'Magma Golem',
    emoji: '',
    level: 27,
    baseStats: {
      health: 1620,
      damage: 75,
      armor: 30,
      speed: 10
    },
    biomes: ['volcanic'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'magma_core', chance: 0.5 },
      { itemId: 'obsidian_shard', chance: 0.3 },
      { itemId: 'defense_potion', chance: 0.25 }
    ]
  },
  {
    id: 'flame_wraith',
    name: 'Flame Wraith',
    emoji: '',
    level: 28,
    baseStats: {
      health: 1540,
      damage: 95,
      armor: 12,
      speed: 22
    },
    biomes: ['volcanic'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'wraith_flame', chance: 0.4 },
      { itemId: 'spirit_ash', chance: 0.35 },
      { itemId: 'fire_resistance_potion', chance: 0.2 }
    ]
  },
  {
    id: 'volcanic_drake',
    name: 'Volcanic Drake',
    emoji: '',
    level: 29,
    baseStats: {
      health: 1740,
      damage: 90,
      armor: 25,
      speed: 16
    },
    biomes: ['volcanic'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'drake_wing', chance: 0.4 },
      { itemId: 'volcanic_gem', chance: 0.3 },
      { itemId: 'rare_ore', chance: 0.2 }
    ]
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    emoji: '',
    level: 30,
    baseStats: {
      health: 1650,
      damage: 105,
      armor: 18,
      speed: 28
    },
    biomes: ['volcanic'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'phoenix_feather', chance: 0.6 },
      { itemId: 'rebirth_essence', chance: 0.4 },
      { itemId: 'legendary_potion', chance: 0.25 }
    ]
  },
  {
    id: 'lava_titan',
    name: 'Lava Titan',
    emoji: '',
    level: 31,
    baseStats: {
      health: 1860,
      damage: 100,
      armor: 35,
      speed: 12
    },
    biomes: ['volcanic'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'titan_heart', chance: 0.5 },
      { itemId: 'molten_steel', chance: 0.35 },
      { itemId: 'strength_potion', chance: 0.3 }
    ]
  },
  {
    id: 'inferno_dragon',
    name: 'Inferno Dragon',
    emoji: '',
    level: 32,
    baseStats: {
      health: 1920,
      damage: 110,
      armor: 32,
      speed: 18
    },
    biomes: ['volcanic'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'dragon_heart', chance: 0.8 },
      { itemId: 'inferno_scale', chance: 0.6 },
      { itemId: 'legendary_gem', chance: 0.4 },
      { itemId: 'full_heal_potion', chance: 0.5 }
    ]
  }
];

export const volcanicPeaksConfig = {
  id: 'volcanic_peaks',
  name: 'Volcanic Peaks',
  description: 'Scorching volcanic mountains where fire elementals and dragons make their home.',
  requiredLevel: 25,
  bossDefeated: false,
  monsters: volcanicPeaksMonsters
}; 