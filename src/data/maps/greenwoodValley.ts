import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// ===== GREENWOOD VALLEY (Levels 1-8) =====
export const greenwoodValleyMonsters: WildernessMonster[] = [
  {
    id: 'forest_rabbit',
    name: 'Forest Rabbit',
    emoji: '',
    level: 1,
    baseStats: {
      health: 45,
      damage: 3,
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
      health: 65,
      damage: 5,
      armor: 2,
      speed: 6
    },
    biomes: ['forest', 'mountains'],
    rarity: 'common',
    lootTable: [
      { itemId: 'rusty_dagger', chance: 0.15 },
      { itemId: 'health_potion', chance: 0.2 }
    ]
  },
  {
    id: 'gray_wolf',
    name: 'Gray Wolf',
    emoji: '',
    level: 3,
    baseStats: {
      health: 85,
      damage: 8,
      armor: 3,
      speed: 10
    },
    biomes: ['forest', 'mountains'],
    rarity: 'common',
    lootTable: [
      { itemId: 'wolf_pelt', chance: 0.3 },
      { itemId: 'health_potion', chance: 0.15 }
    ]
  },
  {
    id: 'giant_spider',
    name: 'Giant Spider',
    emoji: '',
    level: 4,
    baseStats: {
      health: 105,
      damage: 10,
      armor: 4,
      speed: 7
    },
    biomes: ['forest', 'underground'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'spider_silk', chance: 0.35 },
      { itemId: 'poison_vial', chance: 0.2 },
      { itemId: 'health_potion', chance: 0.25 }
    ]
  },
  {
    id: 'orc_warrior',
    name: 'Orc Warrior',
    emoji: '',
    level: 5,
    baseStats: {
      health: 125,
      damage: 12,
      armor: 6,
      speed: 5
    },
    biomes: ['forest', 'mountains'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'iron_sword', chance: 0.12 },
      { itemId: 'leather_armor', chance: 0.1 },
      { itemId: 'health_potion', chance: 0.3 }
    ]
  },
  {
    id: 'forest_wisp',
    name: 'Forest Wisp',
    emoji: '',
    level: 6,
    baseStats: {
      health: 145,
      damage: 14,
      armor: 5,
      speed: 12
    },
    biomes: ['forest'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'wisp_essence', chance: 0.4 },
      { itemId: 'mana_potion', chance: 0.25 },
      { itemId: 'health_potion', chance: 0.2 }
    ]
  },
  {
    id: 'ancient_bear',
    name: 'Ancient Bear',
    emoji: '',
    level: 7,
    baseStats: {
      health: 165,
      damage: 16,
      armor: 8,
      speed: 4
    },
    biomes: ['forest', 'mountains'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'bear_claw', chance: 0.3 },
      { itemId: 'thick_hide', chance: 0.25 },
      { itemId: 'health_potion', chance: 0.35 }
    ]
  },
  {
    id: 'forest_guardian',
    name: 'Forest Guardian',
    emoji: '',
    level: 8,
    baseStats: {
      health: 185,
      damage: 18,
      armor: 10,
      speed: 3
    },
    biomes: ['forest'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'guardian_bark', chance: 0.5 },
      { itemId: 'nature_gem', chance: 0.15 },
      { itemId: 'health_potion', chance: 0.4 },
      { itemId: 'mana_potion', chance: 0.2 }
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