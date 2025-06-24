import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// ===== CRYSTAL CAVERNS (Levels 15-25) =====
export const crystalCavernsMonsters: WildernessMonster[] = [
  {
    id: 'cave_bat',
    name: 'Cave Bat',
    emoji: '',
    level: 15,
    baseStats: {
      health: 68,
      damage: 18,
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
      health: 72,
      damage: 20,
      armor: 12,
      speed: 18
    },
    biomes: ['underground'],
    rarity: 'common',
    lootTable: [
      { itemId: 'crystal_dust', chance: 0.5 },
      { itemId: 'health_potion', chance: 0.15 }
    ]
  },
  {
    id: 'stone_guardian',
    name: 'Stone Guardian',
    emoji: '',
    level: 17,
    baseStats: {
      health: 95,
      damage: 22,
      armor: 18,
      speed: 8
    },
    biomes: ['underground'],
    rarity: 'common',
    lootTable: [
      { itemId: 'stone_fragment', chance: 0.4 },
      { itemId: 'earth_essence', chance: 0.2 }
    ]
  },
  {
    id: 'crystal_golem',
    name: 'Crystal Golem',
    emoji: '',
    level: 18,
    baseStats: {
      health: 110,
      damage: 24,
      armor: 22,
      speed: 4
    },
    biomes: ['underground'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'crystal_shard', chance: 0.6 },
      { itemId: 'earth_gem', chance: 0.15 }
    ]
  },
  {
    id: 'cave_wraith',
    name: 'Cave Wraith',
    emoji: '',
    level: 19,
    baseStats: {
      health: 85,
      damage: 26,
      armor: 14,
      speed: 16
    },
    biomes: ['underground'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'spectral_essence', chance: 0.35 },
      { itemId: 'shadow_gem', chance: 0.2 },
      { itemId: 'mana_potion', chance: 0.25 }
    ]
  },
  {
    id: 'underground_drake',
    name: 'Underground Drake',
    emoji: '',
    level: 20,
    baseStats: {
      health: 125,
      damage: 28,
      armor: 18,
      speed: 12
    },
    biomes: ['underground'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'drake_scale', chance: 0.3 },
      { itemId: 'fire_gem', chance: 0.2 },
      { itemId: 'rare_metal', chance: 0.1 }
    ]
  },
  {
    id: 'cave_troll',
    name: 'Cave Troll',
    emoji: '',
    level: 22,
    baseStats: {
      health: 145,
      damage: 32,
      armor: 24,
      speed: 6
    },
    biomes: ['underground'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'troll_bone', chance: 0.4 },
      { itemId: 'strength_potion', chance: 0.25 }
    ]
  },
  {
    id: 'crystal_spider',
    name: 'Crystal Spider',
    emoji: '',
    level: 25,
    baseStats: {
      health: 135,
      damage: 35,
      armor: 16,
      speed: 15
    },
    biomes: ['underground'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'crystal_silk', chance: 0.5 },
      { itemId: 'venom_sac', chance: 0.3 }
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