import { WildernessMonster } from '../../types/wilderness';
import { baseItems } from '../items';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// ===== VOLCANIC PEAKS (Levels 22-35) =====
export const volcanicPeaksMonsters: WildernessMonster[] = [
  {
    id: 'fire_salamander',
    name: 'Fire Salamander',
    emoji: '',
    level: 25,
    baseStats: {
      health: 400,
      damage: 85,
      armor: 50,
      speed: 12
    },
    biomes: ['volcanic'],
    rarity: 'common',
    lootTable: [
      { itemId: 'salamander_scale', chance: 0.4 },
      { itemId: 'fire_essence', chance: 0.3 }
    ]
  },
  {
    id: 'flame_imp',
    name: 'Flame Imp',
    emoji: '',
    level: 26,
    baseStats: {
      health: 320,
      damage: 90,
      armor: 40,
      speed: 16
    },
    biomes: ['volcanic'],
    rarity: 'common',
    lootTable: [
      { itemId: 'imp_horn', chance: 0.35 },
      { itemId: 'fire_essence', chance: 0.25 },
      { itemId: 'mana_potion', chance: 0.2 }
    ]
  },
  {
    id: 'molten_golem',
    name: 'Molten Golem',
    emoji: '',
    level: 27,
    baseStats: {
      health: 600,
      damage: 95,
      armor: 70,
      speed: 6
    },
    biomes: ['volcanic'],
    rarity: 'common',
    lootTable: [
      { itemId: 'molten_core', chance: 0.4 },
      { itemId: 'volcanic_rock', chance: 0.3 }
    ]
  },
  {
    id: 'lava_elemental',
    name: 'Lava Elemental',
    emoji: '',
    level: 28,
    baseStats: {
      health: 500,
      damage: 100,
      armor: 45,
      speed: 8
    },
    biomes: ['volcanic'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'lava_core', chance: 0.35 },
      { itemId: 'fire_gem', chance: 0.25 }
    ]
  },
  {
    id: 'fire_drake',
    name: 'Fire Drake',
    emoji: '',
    level: 29,
    baseStats: {
      health: 650,
      damage: 110,
      armor: 55,
      speed: 14
    },
    biomes: ['volcanic'],
    rarity: 'uncommon',
    lootTable: [
      { itemId: 'drake_flame', chance: 0.3 },
      { itemId: 'fire_gem', chance: 0.2 },
      { itemId: 'rare_metal', chance: 0.15 }
    ]
  },
  {
    id: 'volcanic_dragon',
    name: 'Volcanic Dragon',
    emoji: '',
    level: 30,
    baseStats: {
      health: 800,
      damage: 120,
      armor: 70,
      speed: 10
    },
    biomes: ['volcanic'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'dragon_scale', chance: 0.2 },
      { itemId: 'dragon_heart', chance: 0.1 },
      { itemId: 'legendary_gem', chance: 0.05 }
    ]
  },
  {
    id: 'magma_giant',
    name: 'Magma Giant',
    emoji: '',
    level: 32,
    baseStats: {
      health: 900,
      damage: 130,
      armor: 80,
      speed: 5
    },
    biomes: ['volcanic'],
    rarity: 'rare',
    lootTable: [
      { itemId: 'giant_fist', chance: 0.3 },
      { itemId: 'molten_ore', chance: 0.4 }
    ]
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    emoji: '',
    level: 35,
    baseStats: {
      health: 650,
      damage: 140,
      armor: 60,
      speed: 18
    },
    biomes: ['volcanic'],
    rarity: 'elite',
    lootTable: [
      { itemId: 'phoenix_feather', chance: 0.15 },
      { itemId: 'rebirth_essence', chance: 0.1 },
      { itemId: 'fire_gem', chance: 0.4 }
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