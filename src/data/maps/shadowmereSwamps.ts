import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// Merchant inventory for Shadowmere Swamps
export const shadowmereSwampsMerchantInventory = [
  'Poison Blade',
  'Assassin\'s Dagger',
  'Shadowstrike Knife',
  'Spider Armor',
  'Swift Boots',
  'Amulet of Protection',
  'Ring of Power',
  'Rapier',
  'Vampire Sword',
  'Lucky Charm Blade'
];

// ===== SHADOWMERE SWAMPS (Levels 8-15) =====
export const shadowmereSwampsMonsters: WildernessMonster[] = [
  {
    id: 'swamp_rat',
    name: 'Swamp Rat',
    emoji: '',
    level: 8,
    baseStats: {
      health: 480,
      damage: 20,
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
      health: 540,
      damage: 24,
      armor: 8,
      speed: 10
    },
    biomes: ['swamp'],
    rarity: 'common',
    lootTable: [
      { itemId: 'witch_herb', chance: 0.35 },
      { itemId: 'cursed_bone', chance: 0.25 },
      { itemId: 'mana_potion', chance: 0.3 }
    ]
  },
  {
    id: 'swamp_troll',
    name: 'Swamp Troll',
    emoji: '',
    level: 10,
    baseStats: {
      health: 600,
      damage: 28,
      armor: 10,
      speed: 8
    },
    biomes: ['swamp'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'troll_moss', chance: 0.4 },
      { itemId: 'regeneration_potion', chance: 0.2 },
      { itemId: 'swamp_gem', chance: 0.15 }
    ]
  },
  {
    id: 'venomous_serpent',
    name: 'Venomous Serpent',
    emoji: '',
    level: 11,
    baseStats: {
      health: 660,
      damage: 32,
      armor: 7,
      speed: 16
    },
    biomes: ['swamp'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'venom_gland', chance: 0.5 },
      { itemId: 'serpent_scale', chance: 0.3 },
      { itemId: 'antidote', chance: 0.25 }
    ]
  },
  {
    id: 'mud_golem',
    name: 'Mud Golem',
    emoji: '',
    level: 12,
    baseStats: {
      health: 720,
      damage: 30,
      armor: 15,
      speed: 6
    },
    biomes: ['swamp'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'golem_core', chance: 0.4 },
      { itemId: 'earth_crystal', chance: 0.3 },
      { itemId: 'defense_potion', chance: 0.2 }
    ]
  },
  {
    id: 'will_o_wisp',
    name: 'Will O Wisp',
    emoji: '',
    level: 13,
    baseStats: {
      health: 650,
      damage: 38,
      armor: 5,
      speed: 20
    },
    biomes: ['swamp'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'wisp_flame', chance: 0.6 },
      { itemId: 'spirit_essence', chance: 0.4 },
      { itemId: 'mana_potion', chance: 0.5 }
    ]
  },
  {
    id: 'swamp_dragon',
    name: 'Swamp Dragon',
    emoji: '',
    level: 14,
    baseStats: {
      health: 840,
      damage: 42,
      armor: 18,
      speed: 12
    },
    biomes: ['swamp'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'dragon_scale', chance: 0.7 },
      { itemId: 'dragon_claw', chance: 0.5 },
      { itemId: 'rare_gem', chance: 0.4 },
      { itemId: 'full_heal_potion', chance: 0.3 }
    ]
  },
  {
    id: 'swamp_lich',
    name: 'Swamp Lich',
    emoji: '',
    level: 15,
    baseStats: {
      health: 900,
      damage: 45,
      armor: 12,
      speed: 14
    },
    biomes: ['swamp'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'lich_phylactery', chance: 0.8 },
      { itemId: 'dark_crystal', chance: 0.6 },
      { itemId: 'necromancy_tome', chance: 0.3 },
      { itemId: 'legendary_potion', chance: 0.2 }
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