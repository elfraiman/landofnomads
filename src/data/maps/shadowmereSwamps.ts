import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// ===== SHADOWMERE SWAMPS (Levels 8-15) =====
export const shadowmereSwampsMonsters: WildernessMonster[] = [
  {
    id: 'swamp_rat',
    name: 'Swamp Rat',
    emoji: '',
    level: 8,
    baseStats: {
      health: 90,
      damage: 12,
      armor: 6,
      speed: 14
    },
    biomes: ['swamp'],
    rarity: 'common',
    lootTable: [
      { itemId: 'rat_tail', chance: 0.4 },
      { itemId: 'health_potion', chance: 0.25 }
    ]
  },
  {
    id: 'bog_witch',
    name: 'Bog Witch',
    emoji: '',
    level: 9,
    baseStats: {
      health: 110,
      damage: 14,
      armor: 8,
      speed: 10
    },
    biomes: ['swamp'],
    rarity: 'common',
    lootTable: [
      { itemId: 'witch_herb', chance: 0.35 },
      { itemId: 'cursed_bone', chance: 0.2 },
      { itemId: 'mana_potion', chance: 0.3 }
    ]
  },
  {
    id: 'marsh_troll',
    name: 'Marsh Troll',
    emoji: '',
    level: 10,
    baseStats: {
      health: 130,
      damage: 16,
      armor: 12,
      speed: 6
    },
    biomes: ['swamp'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'troll_hide', chance: 0.3 },
      { itemId: 'regeneration_potion', chance: 0.15 },
      { itemId: 'health_potion', chance: 0.4 }
    ]
  },
  {
    id: 'venomous_serpent',
    name: 'Venomous Serpent',
    emoji: '',
    level: 11,
    baseStats: {
      health: 150,
      damage: 18,
      armor: 10,
      speed: 16
    },
    biomes: ['swamp'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'serpent_fang', chance: 0.4 },
      { itemId: 'deadly_poison', chance: 0.25 },
      { itemId: 'antidote', chance: 0.2 }
    ]
  },
  {
    id: 'swamp_ogre',
    name: 'Swamp Ogre',
    emoji: '',
    level: 12,
    baseStats: {
      health: 170,
      damage: 20,
      armor: 14,
      speed: 4
    },
    biomes: ['swamp'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'ogre_club', chance: 0.2 },
      { itemId: 'thick_hide', chance: 0.3 },
      { itemId: 'strength_potion', chance: 0.15 }
    ]
  },
  {
    id: 'shadow_stalker',
    name: 'Shadow Stalker',
    emoji: '',
    level: 13,
    baseStats: {
      health: 190,
      damage: 22,
      armor: 12,
      speed: 18
    },
    biomes: ['swamp'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'shadow_essence', chance: 0.4 },
      { itemId: 'stealth_potion', chance: 0.2 },
      { itemId: 'mana_potion', chance: 0.25 }
    ]
  },
  {
    id: 'corrupted_treant',
    name: 'Corrupted Treant',
    emoji: '',
    level: 14,
    baseStats: {
      health: 210,
      damage: 24,
      armor: 16,
      speed: 2
    },
    biomes: ['swamp'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'corrupted_bark', chance: 0.35 },
      { itemId: 'nature_gem', chance: 0.15 },
      { itemId: 'health_potion', chance: 0.3 }
    ]
  },
  {
    id: 'hydra',
    name: 'Hydra',
    emoji: '',
    level: 15,
    baseStats: {
      health: 230,
      damage: 26,
      armor: 18,
      speed: 6
    },
    biomes: ['swamp'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'hydra_scale', chance: 0.5 },
      { itemId: 'regeneration_gem', chance: 0.2 },
      { itemId: 'legendary_potion', chance: 0.1 }
    ]
  }
];

export const shadowmereSwampsConfig = {
  id: 'shadowmere_swamps',
  name: 'Shadowmere Swamps',
  description: 'Dark, misty swamplands filled with dangerous creatures and ancient curses.',
  requiredLevel: 8,
  bossDefeated: false,
  monsters: shadowmereSwampsMonsters
}; 