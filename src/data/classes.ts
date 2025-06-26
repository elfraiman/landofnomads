import { CharacterClass } from '../types';

export const characterClasses: CharacterClass[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'A strong melee fighter with high health and physical damage. Excels in close combat.',
    startingStats: {
      strength: 15,
      dexterity: 10,
      constitution: 15,
      intelligence: 5,
      speed: 8
    },
    statGrowth: {
      strength: 1.3,
      dexterity: 1.0,
      constitution: 1.2,
      intelligence: 0.8,
      speed: 0.9
    },
    primaryStat: 'strength'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'A fast and agile fighter who relies on speed and critical hits. High dodge chance.',
    startingStats: {
      strength: 10,
      dexterity: 15,
      constitution: 10,
      intelligence: 8,
      speed: 15
    },
    statGrowth: {
      strength: 1.0,
      dexterity: 1.3,
      constitution: 1.0,
      intelligence: 1.0,
      speed: 1.3
    },
    primaryStat: 'dexterity'
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'A master of magic with high intelligence and magical damage. Fragile but powerful.',
    startingStats: {
      strength: 5,
      dexterity: 8,
      constitution: 8,
      intelligence: 18,
      speed: 10
    },
    statGrowth: {
      strength: 0.8,
      dexterity: 1.0,
      constitution: 0.9,
      intelligence: 1.4,
      speed: 1.1
    },
    primaryStat: 'intelligence'
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'A balanced holy warrior with good defense and moderate offense. Well-rounded stats.',
    startingStats: {
      strength: 12,
      dexterity: 10,
      constitution: 14,
      intelligence: 10,
      speed: 9
    },
    statGrowth: {
      strength: 1.1,
      dexterity: 1.0,
      constitution: 1.2,
      intelligence: 1.1,
      speed: 1.0
    },
    primaryStat: 'constitution'
  },
  {
    id: 'berserker',
    name: 'Berserker',
    description: 'A wild fighter with extreme strength but low defense. High risk, high reward.',
    startingStats: {
      strength: 18,
      dexterity: 12,
      constitution: 10,
      intelligence: 4,
      speed: 11
    },
    statGrowth: {
      strength: 1.4,
      dexterity: 1.1,
      constitution: 0.9,
      intelligence: 0.7,
      speed: 1.2
    },
    primaryStat: 'strength'
  }
];

export const getCharacterClass = (classId: string): CharacterClass | undefined => {
  return characterClasses.find(cls => cls.id === classId);
};

export const getRandomClass = (): CharacterClass => {
  return characterClasses[Math.floor(Math.random() * characterClasses.length)];
}; 