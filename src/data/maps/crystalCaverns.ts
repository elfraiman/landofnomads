import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// Merchant inventory for Crystal Caverns
export const crystalCavernsMerchantInventory = [
  'Crystal Wand',
  'Mystic Staff',
  'Archmage\'s Rod',
  'Golden Chain Mail',
  'Boots of Haste',
  'Dragon Heart Pendant',
  'Phase Blade',
  'Windcutter',
  'Elven Longbow',
  'Champion\'s Sword'
];

// ===== CRYSTAL CAVERNS (Levels 15-25) =====
export const crystalCavernsMonsters: WildernessMonster[] = [
  {
    id: 'cave_bat',
    name: 'Cave Bat',
    emoji: '',
    level: 15,
    baseStats: {
      health: 900,
      damage: 45,
      armor: 10,
      speed: 20
    },
    biomes: ['underground'],
    rarity: 'common',
    lootTable: [
      { itemId: 'bat_wing', chance: 0.4 },
      { itemId: 'health_potion', chance: 0.2 }
    ]
  },
  {
    id: 'crystal_mite',
    name: 'Crystal Mite',
    emoji: '',
    level: 16,
    baseStats: {
      health: 960,
      damage: 48,
      armor: 12,
      speed: 15
    },
    biomes: ['underground'],
    rarity: 'common',
    lootTable: [
      { itemId: 'crystal_shard', chance: 0.5 },
      { itemId: 'mana_potion', chance: 0.3 }
    ]
  },
  {
    id: 'stone_golem',
    name: 'Stone Golem',
    emoji: '',
    level: 17,
    baseStats: {
      health: 1020,
      damage: 45,
      armor: 20,
      speed: 8
    },
    biomes: ['underground'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'stone_core', chance: 0.4 },
      { itemId: 'earth_gem', chance: 0.25 },
      { itemId: 'defense_potion', chance: 0.2 }
    ]
  },
  {
    id: 'crystal_spider',
    name: 'Crystal Spider',
    emoji: '',
    level: 18,
    baseStats: {
      health: 1080,
      damage: 54,
      armor: 15,
      speed: 16
    },
    biomes: ['underground'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'crystal_web', chance: 0.5 },
      { itemId: 'prismatic_shard', chance: 0.3 },
      { itemId: 'mana_potion', chance: 0.4 }
    ]
  },
  {
    id: 'cave_troll',
    name: 'Cave Troll',
    emoji: '',
    level: 19,
    baseStats: {
      health: 1140,
      damage: 57,
      armor: 18,
      speed: 10
    },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'troll_bone', chance: 0.4 },
      { itemId: 'cave_moss', chance: 0.35 },
      { itemId: 'strength_potion', chance: 0.25 }
    ]
  },
  {
    id: 'crystal_elemental',
    name: 'Crystal Elemental',
    emoji: '',
    level: 20,
    baseStats: {
      health: 1200,
      damage: 60,
      armor: 12,
      speed: 18
    },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'elemental_core', chance: 0.6 },
      { itemId: 'pure_crystal', chance: 0.4 },
      { itemId: 'mana_potion', chance: 0.5 }
    ]
  },
  {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    emoji: '',
    level: 21,
    baseStats: {
      health: 1050,
      damage: 68,
      armor: 8,
      speed: 25
    },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'shadow_essence', chance: 0.5 },
      { itemId: 'wraith_cloak', chance: 0.3 },
      { itemId: 'stealth_potion', chance: 0.2 }
    ]
  },
  {
    id: 'crystal_dragon',
    name: 'Crystal Dragon',
    emoji: '',
    level: 22,
    baseStats: {
      health: 1320,
      damage: 66,
      armor: 25,
      speed: 15
    },
    biomes: ['underground'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'dragon_crystal', chance: 0.7 },
      { itemId: 'crystal_scale', chance: 0.5 },
      { itemId: 'rare_gem', chance: 0.4 },
      { itemId: 'full_heal_potion', chance: 0.3 }
    ]
  },
  {
    id: 'gem_golem',
    name: 'Gem Golem',
    emoji: '',
    level: 20,
    baseStats: { health: 180, damage: 36, armor: 15, speed: 1 },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { gold: 100, experience: 200, chance: 1.0 },
      { gold: 170, chance: 0.5 },
      // Magical constructs - enchanted items
      { item: findItemByName('Mystic Robe'), chance: 0.22 },
      { item: findItemByName('Arcane Staff'), chance: 0.20 },
      { item: findItemByName('Crown of Wisdom'), chance: 0.18 },
      { item: findItemByName('Amulet of the Ancients'), chance: 0.15 },
      { item: findItemByName('Phoenix Feather Cloak'), chance: 0.12 },
    ]
  },
  {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    emoji: '',
    level: 22,
    baseStats: { health: 140, damage: 42, armor: 8, speed: 9 },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { gold: 115, experience: 230, chance: 1.0 },
      { gold: 190, chance: 0.5 },
      // Dark spirits - shadow and death themed items
      { item: findItemByName('Demon Hunter\'s Crossbow'), chance: 0.20 },
      { item: findItemByName('Arcane Staff'), chance: 0.18 },
      { item: findItemByName('Phoenix Feather Cloak'), chance: 0.16 },
      { item: findItemByName('Mystic Robe'), chance: 0.14 },
      { item: findItemByName('Amulet of the Ancients'), chance: 0.18 },
    ]
  },
  {
    id: 'crystal_dragon',
    name: 'Crystal Dragon',
    emoji: '',
    level: 25,
    baseStats: { health: 400, damage: 50, armor: 18, speed: 4 },
    biomes: ['underground'],
    rarity: 'elite',
    lootTable: [
      { gold: 200, experience: 400, chance: 1.0 },
      { gold: 350, chance: 0.7 },
      // Elite crystal boss - top tier magical loot
      { item: findItemByName('Legendary Sword'), chance: 0.30 },
      { item: findItemByName('Dragon Scale Armor'), chance: 0.28 },
      { item: findItemByName('Celestial Bow'), chance: 0.25 },
      { item: findItemByName('Void Walker Cloak'), chance: 0.22 },
      { item: findItemByName('Godslayer Gauntlets'), chance: 0.20 },
      { item: findItemByName('Crown of the Cosmos'), chance: 0.18 },
    ]
  }
];

export const crystalCavernsConfig = {
  id: 'crystal_caverns',
  name: 'Crystal Caverns',
  description: 'Glittering underground caverns filled with precious crystals and ancient guardians.',
  requiredLevel: 15,
  bossDefeated: false,
  monsters: crystalCavernsMonsters
}; 