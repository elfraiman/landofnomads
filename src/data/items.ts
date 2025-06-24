import { Item, ItemRarity, ItemType } from '../types';

// Base items that can be generated at different levels
export const baseItems: Omit<Item, 'id' | 'level' | 'price' | 'durability' | 'maxDurability'>[] = [
  // === STRENGTH BUILDS - High Damage Weapons ===
  {
    name: 'Iron Sword',
    type: 'weapon',
    rarity: 'common',
    statBonus: { strength: 2 },
    damage: 8,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'A sturdy iron sword. Reliable and sharp.'
  },
  {
    name: 'Steel Blade',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { strength: 3, dexterity: 1 },
    damage: 12,
    criticalChance: 5,
    handedness: 'one-handed',
    weaponSpeed: 7,
    description: 'A well-forged steel blade with excellent balance.'
  },
  {
    name: 'Berserker Axe',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { strength: 5, constitution: -1 },
    damage: 18,
    criticalChance: 12,
    handedness: 'two-handed',
    weaponSpeed: 3,
    description: 'A massive two-handed axe. High risk, high reward.'
  },
  {
    name: 'Dragonbone Sword',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { strength: 6, constitution: 2 },
    damage: 20,
    criticalChance: 10,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Forged from ancient dragon bones, this sword radiates power.'
  },
  {
    name: 'Excalibur',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 8, dexterity: 4, constitution: 4 },
    damage: 30,
    criticalChance: 20,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'The legendary sword of kings. Unmatched in power and beauty.'
  },

  // === CRITICAL BUILDS - High Crit Chance Weapons ===
  {
    name: 'Assassin\'s Dagger',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { dexterity: 4, speed: 2 },
    damage: 10,
    criticalChance: 15,
    handedness: 'one-handed',
    weaponSpeed: 9,
    description: 'A swift blade favored by rogues and assassins.'
  },
  {
    name: 'Poison Blade',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { dexterity: 3, intelligence: 1 },
    damage: 8,
    criticalChance: 12,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'A blade coated with deadly poison. Strikes vital points.'
  },
  {
    name: 'Shadowstrike Knife',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { dexterity: 5, speed: 3 },
    damage: 9,
    criticalChance: 20,
    handedness: 'one-handed',
    weaponSpeed: 9,
    description: 'Strikes from the shadows with lethal precision.'
  },
  {
    name: 'Viper\'s Fang',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { dexterity: 7, speed: 4 },
    damage: 12,
    criticalChance: 25,
    handedness: 'one-handed',
    weaponSpeed: 10,
    description: 'A curved dagger that never misses vital points.'
  },

  // === SPEED BUILDS - Fast Attack Weapons ===
  {
    name: 'Rapier',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { dexterity: 2, speed: 3 },
    damage: 9,
    criticalChance: 8,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'A lightweight thrusting sword favoring speed over power.'
  },
  {
    name: 'Twin Blades',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { dexterity: 4, speed: 5 },
    damage: 11,
    criticalChance: 10,
    handedness: 'one-handed',
    weaponSpeed: 9,
    description: 'Dual wielded blades for lightning-fast combinations.'
  },
  {
    name: 'Windcutter',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { speed: 8, dexterity: 3 },
    damage: 13,
    criticalChance: 12,
    handedness: 'one-handed',
    weaponSpeed: 10,
    description: 'So light and fast, it cuts through air itself.'
  },

  // === INTELLIGENCE BUILDS - Magical Weapons ===
  {
    name: 'Mystic Staff',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { intelligence: 4 },
    damage: 6,
    handedness: 'two-handed',
    weaponSpeed: 4,
    description: 'A staff imbued with magical energy.'
  },
  {
    name: 'Crystal Wand',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { intelligence: 5, speed: 2 },
    damage: 8,
    criticalChance: 8,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Focuses magical energy into devastating spells.'
  },
  {
    name: 'Archmage\'s Rod',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { intelligence: 8, constitution: 2 },
    damage: 12,
    criticalChance: 15,
    handedness: 'one-handed',
    weaponSpeed: 5,
    description: 'Channel the power of arcane masters.'
  },
  {
    name: 'Staff of Eternal Fire',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { intelligence: 10, strength: 3 },
    damage: 18,
    criticalChance: 18,
    handedness: 'two-handed',
    weaponSpeed: 5,
    description: 'Burns with the flames of a thousand suns.'
  },

  // === BALANCED BUILDS - Versatile Weapons ===
  {
    name: 'Knight\'s Blade',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { strength: 2, constitution: 2, dexterity: 1 },
    damage: 11,
    criticalChance: 5,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'A well-balanced weapon for honorable combat.'
  },
  {
    name: 'Paladin\'s Mace',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { strength: 3, constitution: 3, intelligence: 2 },
    damage: 14,
    criticalChance: 7,
    handedness: 'one-handed',
    weaponSpeed: 5,
    description: 'Blessed weapon that protects and strikes with righteousness.'
  },
  {
    name: 'Champion\'s Sword',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { strength: 4, dexterity: 3, constitution: 3, speed: 2 },
    damage: 16,
    criticalChance: 12,
    handedness: 'one-handed',
    weaponSpeed: 7,
    description: 'The weapon of a true champion, balanced in all aspects.'
  },

  // === TANK BUILDS - Defensive Weapons ===
  {
    name: 'Guardian Shield',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { constitution: 4, strength: 1 },
    damage: 7,
    armor: 3,
    handedness: 'one-handed',
    weaponSpeed: 4,
    description: 'A defensive weapon that can also deal damage.'
  },
  {
    name: 'Fortress Hammer',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { constitution: 5, strength: 3 },
    damage: 13,
    armor: 5,
    handedness: 'two-handed',
    weaponSpeed: 3,
    description: 'Heavy weapon that provides protection while crushing foes.'
  },
  {
    name: 'Aegis Blade',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { constitution: 6, strength: 4, intelligence: 2 },
    damage: 15,
    armor: 8,
    handedness: 'one-handed',
    weaponSpeed: 5,
    description: 'Sword and shield combined, ultimate defensive weapon.'
  },

  // === RANGED BUILDS - Archer Weapons ===
  {
    name: 'Hunting Bow',
    type: 'weapon',
    rarity: 'common',
    statBonus: { dexterity: 3, speed: 1 },
    damage: 9,
    criticalChance: 6,
    handedness: 'two-handed',
    weaponSpeed: 5,
    description: 'Simple but effective ranged weapon.'
  },
  {
    name: 'Elven Longbow',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { dexterity: 5, speed: 3, intelligence: 1 },
    damage: 12,
    criticalChance: 12,
    handedness: 'two-handed',
    weaponSpeed: 6,
    description: 'Crafted by elven masters, deadly at long range.'
  },
  {
    name: 'Dragonslayer Crossbow',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { dexterity: 7, strength: 3, speed: 2 },
    damage: 16,
    criticalChance: 15,
    handedness: 'two-handed',
    weaponSpeed: 4,
    description: 'Pierces even the thickest dragon scales.'
  },

  // === GLASS CANNON BUILDS - High Damage, Low Defense ===
  {
    name: 'Chaos Blade',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { strength: 6, constitution: -2, speed: 2 },
    damage: 19,
    criticalChance: 8,
    handedness: 'one-handed',
    weaponSpeed: 7,
    description: 'Chaotic energy courses through this blade. Power at a cost.'
  },
  {
    name: 'Soul Reaper',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { strength: 8, intelligence: 4, constitution: -3 },
    damage: 22,
    criticalChance: 15,
    handedness: 'two-handed',
    weaponSpeed: 4,
    description: 'Feeds on life force to deal devastating damage.'
  },

  // === UTILITY BUILDS - Special Effect Weapons ===
  {
    name: 'Lucky Charm Blade',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { dexterity: 2, speed: 2 },
    damage: 8,
    criticalChance: 15,
    dodgeChance: 5,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Lady luck favors the bold.'
  },
  {
    name: 'Vampire Sword',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { strength: 4, constitution: 2, intelligence: 1 },
    damage: 12,
    criticalChance: 10,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Drains life from enemies to heal the wielder.'
  },
  {
    name: 'Phase Blade',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { dexterity: 5, speed: 4, intelligence: 3 },
    damage: 11,
    criticalChance: 12,
    dodgeChance: 15,
    handedness: 'one-handed',
    weaponSpeed: 9,
    description: 'Phases between dimensions, hard to block or counter.'
  },

  // === COMPREHENSIVE WEAPON SYSTEM ===
  // Based on successful RPG scaling formulas with build diversity
  // Damage ranges converted to base damage with variance in combat
  // Each weapon supports different build archetypes

  // EARLY GAME WEAPONS (Levels 1-20)
  {
    name: 'Bronze Dagger',
    type: 'weapon',
    rarity: 'common',
    statBonus: { dexterity: 1, speed: 1 },
    damage: 4,
    criticalChance: 8,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'A simple bronze dagger, perfect for quick strikes.'
  },
  {
    name: 'Iron Daggers',
    type: 'weapon',
    rarity: 'common',
    statBonus: { dexterity: 2, speed: 2 },
    damage: 6,
    criticalChance: 10,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Twin iron daggers for swift dual-wielding combat.'
  },
  {
    name: 'Oak Short Bow',
    type: 'weapon',
    rarity: 'common',
    statBonus: { dexterity: 2, speed: 1 },
    damage: 9,
    criticalChance: 6,
    handedness: 'two-handed',
    weaponSpeed: 6,
    description: 'A sturdy oak bow for hunting and combat.'
  },
  {
    name: 'Iron Battle Axe',
    type: 'weapon',
    rarity: 'common',
    statBonus: { strength: 3, constitution: 1 },
    damage: 11,
    criticalChance: 5,
    handedness: 'two-handed',
    weaponSpeed: 3,
    description: 'Heavy iron axe that cleaves through armor.'
  },
  {
    name: 'Steel Crossbow',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { dexterity: 3, strength: 1 },
    damage: 13,
    criticalChance: 8,
    handedness: 'two-handed',
    weaponSpeed: 6,
    description: 'Precise crossbow with excellent range and power.'
  },
  {
    name: 'Willow Long Bow',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { dexterity: 4, speed: 2, intelligence: 1 },
    damage: 16,
    criticalChance: 12,
    handedness: 'two-handed',
    weaponSpeed: 6,
    description: 'Elegant elven-crafted bow with superior accuracy.'
  },
  {
    name: 'Dimension Sword',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { strength: 3, intelligence: 2, speed: 1 },
    damage: 20,
    criticalChance: 8,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Blade that cuts through dimensional barriers.'
  },
  {
    name: 'Assassin Blade',
    type: 'weapon',
    rarity: 'uncommon',
    statBonus: { dexterity: 5, speed: 3 },
    damage: 24,
    criticalChance: 18,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Curved blade designed for silent kills.'
  },
  {
    name: 'Arctic Blade',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { strength: 4, intelligence: 3, constitution: 1 },
    damage: 28,
    criticalChance: 10,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Frost-enchanted blade that freezes enemies.'
  },
  {
    name: 'Dragon Sword',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { strength: 5, constitution: 3, intelligence: 2 },
    damage: 33,
    criticalChance: 12,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Forged from dragon scales, burns with inner fire.'
  },

  // MID GAME WEAPONS (Levels 21-50)
  {
    name: 'Burning Axe',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { strength: 6, constitution: 2, intelligence: 3 },
    damage: 39,
    criticalChance: 8,
    handedness: 'two-handed',
    weaponSpeed: 3,
    description: 'Two-handed axe wreathed in eternal flames.'
  },
  {
    name: 'Righteous Mace',
    type: 'weapon',
    rarity: 'rare',
    statBonus: { strength: 5, constitution: 4, intelligence: 4 },
    damage: 45,
    criticalChance: 6,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Holy mace that smites the undead.'
  },
  {
    name: 'Dagger of the Zodiac',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { dexterity: 8, speed: 6, intelligence: 3 },
    damage: 51,
    criticalChance: 22,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Mystical dagger aligned with celestial powers.'
  },
  {
    name: 'Angelic Whip',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { dexterity: 7, speed: 8, intelligence: 5 },
    damage: 57,
    criticalChance: 15,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Divine whip that strikes with heavenly light.'
  },
  {
    name: 'Celestial Fury Katana',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { strength: 6, dexterity: 8, speed: 6 },
    damage: 62,
    criticalChance: 18,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Eastern blade channeling the fury of the stars.'
  },
  {
    name: 'Velm Glabrazu Sword',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { strength: 8, constitution: 5, intelligence: 6 },
    damage: 67,
    criticalChance: 12,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Demonic blade forged in the depths of the abyss.'
  },
  {
    name: 'Devil\'s Fang',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { strength: 9, dexterity: 6, intelligence: 7 },
    damage: 73,
    criticalChance: 16,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Cursed fang that pierces both body and soul.'
  },
  {
    name: 'Blackmyst Halberd',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { strength: 10, constitution: 6, dexterity: 5 },
    damage: 79,
    criticalChance: 10,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Polearm shrouded in dark mist and shadow.'
  },
  {
    name: 'Frost Wand',
    type: 'weapon',
    rarity: 'epic',
    statBonus: { intelligence: 12, speed: 5, constitution: 4 },
    damage: 85,
    criticalChance: 20,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Crystalline wand that freezes enemies solid.'
  },

  // HIGH GAME WEAPONS (Levels 51-100)
  {
    name: 'Adamant Sickles',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 12, speed: 10, strength: 6 },
    damage: 92,
    criticalChance: 25,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Twin sickles forged from adamantine ore.'
  },
  {
    name: 'Platinum Bone Sword',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 12, constitution: 8, intelligence: 8 },
    damage: 99,
    criticalChance: 14,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Blade crafted from platinum-infused dragon bone.'
  },
  {
    name: 'High Enchanted Morning Star',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 14, constitution: 10, intelligence: 6 },
    damage: 105,
    criticalChance: 12,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Spiked mace enhanced with powerful enchantments.'
  },
  {
    name: 'Cursed SkullKrusher',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 16, constitution: 8, intelligence: 10 },
    damage: 111,
    criticalChance: 16,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Cursed hammer that grows stronger with each kill.'
  },
  {
    name: 'Mace of Andromeda',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 15, constitution: 12, intelligence: 12 },
    damage: 117,
    criticalChance: 10,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Stellar mace infused with cosmic energy.'
  },
  {
    name: 'Viper Whip',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 16, speed: 14, intelligence: 8 },
    damage: 123,
    criticalChance: 20,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Serpentine whip that strikes with venomous precision.'
  },
  {
    name: 'Flail of Hades',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 18, constitution: 10, intelligence: 14 },
    damage: 129,
    criticalChance: 14,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Infernal flail that burns with hellfire.'
  },
  {
    name: 'Blade of Chaos',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 17, dexterity: 12, intelligence: 15 },
    damage: 135,
    criticalChance: 18,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Chaotic blade that shifts between realities.'
  },
  {
    name: 'Shadow Battle Axe',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 20, dexterity: 10, speed: 12 },
    damage: 141,
    criticalChance: 16,
    handedness: 'two-handed',
    weaponSpeed: 3,
    description: 'Axe forged from solidified shadows.'
  },
  {
    name: 'Arch Spider Daggers',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 20, speed: 16, intelligence: 10 },
    damage: 147,
    criticalChance: 28,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Twin daggers that inject paralyzing venom.'
  },

  // EPIC GAME WEAPONS (Levels 101-200)
  {
    name: 'Gallant Knight Sword',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 18, constitution: 15, dexterity: 12, intelligence: 12 },
    damage: 153,
    criticalChance: 15,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Noble blade wielded by the greatest knights.'
  },
  {
    name: 'Cursed Awentia Sabre',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 22, speed: 18, intelligence: 15 },
    damage: 160,
    criticalChance: 22,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Cursed sabre that thirsts for blood.'
  },
  {
    name: 'The Sleeper',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 24, constitution: 18, intelligence: 18 },
    damage: 168,
    criticalChance: 12,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Ancient weapon that awakens only for worthy wielders.'
  },
  {
    name: 'Lance of the Damned',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 22, constitution: 20, dexterity: 15 },
    damage: 175,
    criticalChance: 14,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Cursed lance that pierces through any defense.'
  },
  {
    name: 'Sword of Legend',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 26, dexterity: 18, constitution: 16, intelligence: 16 },
    damage: 182,
    criticalChance: 18,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Legendary blade spoken of in ancient tales.'
  },
  {
    name: 'Splitter Maul',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 28, constitution: 22, intelligence: 12 },
    damage: 188,
    criticalChance: 10,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Massive maul that splits mountains.'
  },
  {
    name: 'Banani High Flail',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 25, dexterity: 20, constitution: 18 },
    damage: 196,
    criticalChance: 16,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Exotic flail from the distant Banani kingdom.'
  },
  {
    name: 'Tinkenanken',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { intelligence: 30, speed: 20, dexterity: 15 },
    damage: 205,
    criticalChance: 24,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Mechanical weapon of unknown origin.'
  },
  {
    name: 'MegaDeath',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 32, constitution: 20, intelligence: 20 },
    damage: 215,
    criticalChance: 18,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Weapon of mass destruction, handle with care.'
  },
  {
    name: 'Rune Magi Staff',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { intelligence: 35, constitution: 18, speed: 22 },
    damage: 235,
    criticalChance: 26,
    handedness: 'two-handed',
    weaponSpeed: 4,
    description: 'Staff inscribed with the most powerful runes.'
  },

  // LEGENDARY GAME WEAPONS (Levels 201-500)
  {
    name: 'Pixie Dagger',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 35, speed: 30, intelligence: 25 },
    damage: 255,
    criticalChance: 32,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Tiny but incredibly sharp dagger blessed by pixies.'
  },
  {
    name: 'Cats Eye Sword',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 32, speed: 28, strength: 25, intelligence: 20 },
    damage: 265,
    criticalChance: 28,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Blade that sees through all illusions and deceptions.'
  },
  {
    name: 'Double Bladed Battle Axe',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 38, constitution: 28, dexterity: 20 },
    damage: 275,
    criticalChance: 16,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Fearsome double-headed axe for berserker warriors.'
  },
  {
    name: 'Scared Titanium Mallet',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 40, constitution: 30, intelligence: 25 },
    damage: 285,
    criticalChance: 14,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Sacred mallet that crushes evil with divine force.'
  },
  {
    name: 'Tribunal Power Staff',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { intelligence: 45, constitution: 25, strength: 25 },
    damage: 295,
    criticalChance: 22,
    handedness: 'two-handed',
    weaponSpeed: 4,
    description: 'Staff wielded by the highest tribunal of mages.'
  },
  {
    name: 'Marrow Slicer',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 40, speed: 35, strength: 25 },
    damage: 310,
    criticalChance: 30,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Blade so sharp it cuts through bone like butter.'
  },
  {
    name: 'Zombie Sniffer',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { intelligence: 42, dexterity: 35, constitution: 28 },
    damage: 332,
    criticalChance: 26,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Necromantic weapon that detects and destroys undead.'
  },
  {
    name: 'Demonic Ice Blade',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 42, intelligence: 38, constitution: 30 },
    damage: 360,
    criticalChance: 20,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Paradoxical blade that burns with frozen hellfire.'
  },
  {
    name: 'Molten Slasher',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 45, constitution: 35, intelligence: 35 },
    damage: 385,
    criticalChance: 18,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Sword forged in the core of a dying star.'
  },
  {
    name: 'Sinshuan Battle Katana',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 48, speed: 42, strength: 35, intelligence: 30 },
    damage: 420,
    criticalChance: 25,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Masterwork katana from the legendary Sinshuan smiths.'
  },

  // MYTHIC GAME WEAPONS (Levels 501-1000)
  {
    name: 'Minotaur Battle Axe',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 55, constitution: 45, dexterity: 30 },
    damage: 460,
    criticalChance: 16,
    handedness: 'two-handed',
    weaponSpeed: 3,
    description: 'Massive axe wielded by the legendary minotaur king.'
  },
  {
    name: 'Dragon Tooth Nikka',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 52, intelligence: 48, constitution: 40 },
    damage: 500,
    criticalChance: 22,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Spear carved from an ancient dragon\'s tooth.'
  },
  {
    name: 'Bintai\'s Magic Slayer',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 58, dexterity: 45, intelligence: 50 },
    damage: 540,
    criticalChance: 24,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Enchanted blade that disrupts magical energies.'
  },
  {
    name: 'Blastium Marcium',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { intelligence: 65, strength: 50, constitution: 45 },
    damage: 580,
    criticalChance: 28,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Explosive weapon that channels raw arcane energy.'
  },
  {
    name: 'Weightless Warrior Pole',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 60, speed: 55, strength: 45 },
    damage: 625,
    criticalChance: 26,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Impossibly light polearm that defies gravity.'
  },
  {
    name: 'Dimension Snare',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { intelligence: 70, dexterity: 55, speed: 50 },
    damage: 675,
    criticalChance: 30,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Weapon that traps enemies in dimensional pockets.'
  },
  {
    name: 'Blade of the Insects',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { dexterity: 65, speed: 60, intelligence: 55 },
    damage: 725,
    criticalChance: 32,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Blade that commands swarms of deadly insects.'
  },
  {
    name: 'Teskamianiam',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 70, constitution: 60, intelligence: 60 },
    damage: 775,
    criticalChance: 20,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Ancient weapon whose true name cannot be spoken.'
  },
  {
    name: 'Red Sword of Chaos',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 75, intelligence: 65, dexterity: 55 },
    damage: 825,
    criticalChance: 25,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Crimson blade that embodies pure chaos.'
  },
  {
    name: 'Chaos Spear',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 72, dexterity: 62, constitution: 58, intelligence: 58 },
    damage: 875,
    criticalChance: 22,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Spear that pierces the barriers between worlds.'
  },

  // DIVINE GAME WEAPONS (Levels 1001-2000)
  {
    name: 'Barbarian Hammer',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 85, constitution: 70, intelligence: 55 },
    damage: 925,
    criticalChance: 18,
    handedness: 'two-handed',
    weaponSpeed: 3,
    description: 'Primal hammer that channels the rage of ancient barbarians.'
  },
  {
    name: 'Covenant Blade',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 82, intelligence: 75, constitution: 68, dexterity: 60 },
    damage: 975,
    criticalChance: 24,
    handedness: 'one-handed',
    weaponSpeed: 8,
    description: 'Sacred blade forged from divine covenant.'
  },
  {
    name: 'Black Lance of Demise',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 90, constitution: 75, intelligence: 70 },
    damage: 1025,
    criticalChance: 20,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Dark lance that brings inevitable doom to enemies.'
  },
  {
    name: 'Sentinel Sword',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 88, dexterity: 78, constitution: 72, intelligence: 75 },
    damage: 1125,
    criticalChance: 26,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Guardian blade that protects the innocent.'
  },
  {
    name: 'Golden Trident',
    type: 'weapon',
    rarity: 'legendary',
    statBonus: { strength: 95, intelligence: 85, constitution: 80, dexterity: 70 },
    damage: 1175,
    criticalChance: 28,
    handedness: 'one-handed',
    weaponSpeed: 6,
    description: 'Divine trident of the sea god, command over all waters.'
  },

  // === COMPREHENSIVE ARMOR SYSTEM ===
  // Based on successful RPG scaling formulas (Path of Exile inspired)
  // Armor scales using: base_armor * (1 + level_multiplier)^1.2 for balanced progression
  // Constitution bonus scales with armor tier for meaningful stat progression

  // EARLY GAME ARMORS (Levels 1-20)
  {
    name: 'Padded Undershirt',
    type: 'armor',
    rarity: 'common',
    statBonus: { constitution: 1 },
    armor: 3,
    description: 'Basic padded protection for novice adventurers.'
  },
  {
    name: 'Field Jacket',
    type: 'armor',
    rarity: 'common',
    statBonus: { constitution: 1, dexterity: 1 },
    armor: 5,
    description: 'Sturdy jacket offering basic protection in the field.'
  },
  {
    name: 'Lattuce Shirt',
    type: 'armor',
    rarity: 'common',
    statBonus: { constitution: 2 },
    armor: 8,
    description: 'Reinforced shirt with metal lattice work.'
  },
  {
    name: 'Tin Mail',
    type: 'armor',
    rarity: 'common',
    statBonus: { constitution: 2, strength: 1 },
    armor: 10,
    description: 'Lightweight mail armor made from tin links.'
  },
  {
    name: 'Splint Mail',
    type: 'armor',
    rarity: 'uncommon',
    statBonus: { constitution: 3, strength: 1 },
    armor: 12,
    description: 'Armor reinforced with metal splints for extra protection.'
  },
  {
    name: 'Fine Chain Mail',
    type: 'armor',
    rarity: 'uncommon',
    statBonus: { constitution: 3, strength: 2 },
    armor: 14,
    description: 'Well-crafted chain mail with fine metal links.'
  },
  {
    name: 'Woven Scale Mail',
    type: 'armor',
    rarity: 'uncommon',
    statBonus: { constitution: 4, strength: 2 },
    armor: 18,
    description: 'Intricately woven scales providing flexible protection.'
  },
  {
    name: 'Kizmacs Training Mail',
    type: 'armor',
    rarity: 'uncommon',
    statBonus: { constitution: 4, strength: 2, dexterity: 1 },
    armor: 22,
    description: 'Training armor used by elite military academies.'
  },
  {
    name: 'Mammoth Hide Armor',
    type: 'armor',
    rarity: 'rare',
    statBonus: { constitution: 5, strength: 3 },
    armor: 26,
    description: 'Thick hide from ancient mammoths, naturally protective.'
  },
  {
    name: 'Crimson Plate Mail',
    type: 'armor',
    rarity: 'rare',
    statBonus: { constitution: 6, strength: 3, intelligence: 1 },
    armor: 30,
    description: 'Crimson-colored plate mail worn by royal guards.'
  },

  // MID GAME ARMORS (Levels 21-50)
  {
    name: 'Full Body Armor',
    type: 'armor',
    rarity: 'rare',
    statBonus: { constitution: 7, strength: 4 },
    armor: 34,
    description: 'Complete body protection for serious warriors.'
  },
  {
    name: 'Platinum Shirt',
    type: 'armor',
    rarity: 'rare',
    statBonus: { constitution: 8, strength: 4, intelligence: 2 },
    armor: 38,
    description: 'Lightweight yet strong platinum mesh armor.'
  },
  {
    name: 'Titanium Armor',
    type: 'armor',
    rarity: 'rare',
    statBonus: { constitution: 9, strength: 5, dexterity: 2 },
    armor: 42,
    description: 'Advanced titanium alloy armor, light but incredibly strong.'
  },
  {
    name: 'Demonic Plate Armor',
    type: 'armor',
    rarity: 'epic',
    statBonus: { constitution: 10, strength: 6, intelligence: 3 },
    armor: 46,
    description: 'Dark armor infused with demonic energy.'
  },
  {
    name: 'Golden Chain Mail',
    type: 'armor',
    rarity: 'epic',
    statBonus: { constitution: 11, strength: 6, intelligence: 4 },
    armor: 50,
    description: 'Enchanted golden mail that gleams with magical power.'
  },
  {
    name: 'Forged Fine Splint Mail',
    type: 'armor',
    rarity: 'epic',
    statBonus: { constitution: 12, strength: 7, dexterity: 3 },
    armor: 54,
    description: 'Masterfully forged splint mail with perfect balance.'
  },
  {
    name: 'Spider Armor',
    type: 'armor',
    rarity: 'epic',
    statBonus: { constitution: 13, dexterity: 8, speed: 4 },
    armor: 60,
    description: 'Armor woven from giant spider silk, flexible yet strong.'
  },
  {
    name: 'Proven Warrior Mail',
    type: 'armor',
    rarity: 'epic',
    statBonus: { constitution: 14, strength: 8, intelligence: 4 },
    armor: 64,
    description: 'Battle-tested mail worn by proven warriors.'
  },
  {
    name: 'Hart Armor',
    type: 'armor',
    rarity: 'epic',
    statBonus: { constitution: 15, strength: 9, speed: 5 },
    armor: 68,
    description: 'Armor blessed by the spirit of the great hart.'
  },
  {
    name: 'Ice Mail',
    type: 'armor',
    rarity: 'epic',
    statBonus: { constitution: 16, strength: 9, intelligence: 6 },
    armor: 72,
    description: 'Crystalline armor that never melts, cold to the touch.'
  },

  // HIGH GAME ARMORS (Levels 51-100)
  {
    name: 'Rashkas Invisible Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 17, dexterity: 12, speed: 8 },
    armor: 75,
    description: 'Nearly invisible mail that bends light around the wearer.'
  },
  {
    name: 'Mail of the Dead',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 18, strength: 10, intelligence: 8 },
    armor: 79,
    description: 'Cursed mail that draws power from the realm of the dead.'
  },
  {
    name: 'Ebony Battle Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 19, strength: 12, dexterity: 6 },
    armor: 84,
    description: 'Jet-black mail forged from the darkest ebony.'
  },
  {
    name: 'Red Dragon Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 20, strength: 13, intelligence: 9 },
    armor: 92,
    description: 'Mail crafted from red dragon scales, radiating heat.'
  },
  {
    name: 'Blessed Angelic Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 22, strength: 14, intelligence: 12 },
    armor: 100,
    description: 'Divine armor blessed by celestial beings.'
  },
  {
    name: 'Ancient Ecryptic Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 24, intelligence: 16, speed: 10 },
    armor: 115,
    description: 'Ancient armor covered in mysterious runes.'
  },
  {
    name: 'Molten Lava Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 26, strength: 18, intelligence: 14 },
    armor: 130,
    description: 'Forged in the heart of a volcano, eternally hot.'
  },
  {
    name: 'Black Acid Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 28, strength: 20, dexterity: 12 },
    armor: 150,
    description: 'Armor that corrodes enemy weapons on contact.'
  },
  {
    name: 'Emerald Lattuce Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 30, intelligence: 22, speed: 15 },
    armor: 165,
    description: 'Crystalline armor that pulses with emerald energy.'
  },
  {
    name: 'Pride of the Legions',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 32, strength: 24, intelligence: 16 },
    armor: 180,
    description: 'Ceremonial armor worn by the greatest legion commanders.'
  },

  // EPIC GAME ARMORS (Levels 101-200)
  {
    name: 'Wyvern Skin Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 35, strength: 26, speed: 18 },
    armor: 200,
    description: 'Flexible mail made from wyvern hide, naturally magical.'
  },
  {
    name: 'Armor of the Hammerites',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 38, strength: 30, intelligence: 20 },
    armor: 215,
    description: 'Sacred armor of the ancient Hammerite order.'
  },
  {
    name: 'Rune Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 42, intelligence: 35, speed: 22 },
    armor: 230,
    description: 'Covered in powerful runes that enhance magical abilities.'
  },
  {
    name: 'Misty Mountain Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 46, strength: 34, intelligence: 26 },
    armor: 260,
    description: 'Forged in the mystical peaks of the highest mountains.'
  },
  {
    name: 'Encryptic Bolon Garb',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 50, intelligence: 40, dexterity: 28 },
    armor: 270,
    description: 'Mysterious garb that phases between dimensions.'
  },
  {
    name: 'Crystal Dragon Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 55, strength: 38, intelligence: 32 },
    armor: 285,
    description: 'Crystalline mail that refracts light and magic.'
  },
  {
    name: 'Undead Mystic Chain Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 60, intelligence: 45, strength: 35 },
    armor: 300,
    description: 'Chain mail that draws power from undead energies.'
  },
  {
    name: 'Royal Gem Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 65, strength: 42, intelligence: 38 },
    armor: 315,
    description: 'Adorned with precious gems that amplify the wearer\'s power.'
  },
  {
    name: 'Silver Knight Plate Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 70, strength: 48, dexterity: 35 },
    armor: 330,
    description: 'Shining silver plate mail of legendary knights.'
  },
  {
    name: 'Solar Crafted Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 75, intelligence: 55, speed: 40 },
    armor: 350,
    description: 'Forged using the power of the sun itself.'
  },

  // LEGENDARY GAME ARMORS (Levels 201-500)
  {
    name: 'Bekel\'s Phantom Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 80, dexterity: 60, speed: 45 },
    armor: 380,
    description: 'Ghostly armor that phases between the material and spirit worlds.'
  },
  {
    name: 'Gold Dragon Scale Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 85, strength: 58, intelligence: 50 },
    armor: 400,
    description: 'Golden scales from the mightiest of dragons.'
  },
  {
    name: 'Soul Armour',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 90, intelligence: 65, strength: 55 },
    armor: 430,
    description: 'Armor forged from the essence of souls themselves.'
  },
  {
    name: 'Asylferal\'s Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 95, strength: 65, dexterity: 50 },
    armor: 460,
    description: 'Named after the legendary warrior who never fell in battle.'
  },
  {
    name: 'Nukahatsu Plate',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 100, strength: 70, intelligence: 60 },
    armor: 500,
    description: 'Eastern-style plate armor with perfect balance and protection.'
  },
  {
    name: 'Diamond Cut Splintmail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 110, strength: 75, speed: 55 },
    armor: 540,
    description: 'Splintmail cut with diamond precision for maximum protection.'
  },
  {
    name: 'Krinton\'s Mirror Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 120, intelligence: 85, dexterity: 65 },
    armor: 580,
    description: 'Reflective mail that turns enemy attacks back upon them.'
  },
  {
    name: 'Tingsten Battlemail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 130, strength: 90, intelligence: 75 },
    armor: 620,
    description: 'Incredibly dense battlemail forged from rare tungsten.'
  },
  {
    name: 'Solari Mail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 140, intelligence: 100, speed: 70 },
    armor: 670,
    description: 'Radiant mail that channels the power of the sun.'
  },
  {
    name: 'Akari Robe',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 150, intelligence: 110, dexterity: 80 },
    armor: 720,
    description: 'Flowing robe that provides protection through magical barriers.'
  },

  // MYTHIC GAME ARMORS (Levels 501-1000)
  {
    name: 'Vurshalos Spiked Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 160, strength: 110, intelligence: 90 },
    armor: 770,
    description: 'Spiked armor that damages enemies who dare to strike it.'
  },
  {
    name: 'Red Armor of Chaos',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 170, strength: 120, speed: 85 },
    armor: 830,
    description: 'Chaotic armor that shifts its properties unpredictably.'
  },
  {
    name: 'Crusader Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 180, strength: 130, intelligence: 100 },
    armor: 900,
    description: 'Holy armor worn by the greatest crusaders of legend.'
  },
  {
    name: 'Arnkell Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 190, strength: 140, dexterity: 100 },
    armor: 980,
    description: 'Named after the legendary Nordic warrior king.'
  },
  {
    name: 'Hjalmarr Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 200, strength: 150, intelligence: 120 },
    armor: 1070,
    description: 'Viking armor blessed by the gods of war.'
  },
  {
    name: 'Malgieri Plate',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 220, strength: 160, speed: 110 },
    armor: 1170,
    description: 'Ornate plate armor of the ancient Malgieri dynasty.'
  },
  {
    name: 'Brunhilde\'s Battle Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 240, strength: 170, intelligence: 140 },
    armor: 1280,
    description: 'The legendary Valkyrie\'s own battle armor.'
  },
  {
    name: 'Sacred Battle Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 260, intelligence: 180, strength: 160 },
    armor: 1400,
    description: 'Blessed armor that grows stronger with each righteous battle.'
  },
  {
    name: 'Armour of the Round Table',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 280, strength: 190, intelligence: 160 },
    armor: 1530,
    description: 'Worn by the knights of the legendary Round Table.'
  },
  {
    name: 'Bezil\'s Sun Embossed Plate',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 300, intelligence: 200, speed: 140 },
    armor: 1670,
    description: 'Plate armor embossed with the symbol of the eternal sun.'
  },

  // DIVINE GAME ARMORS (Levels 1001-2000)
  {
    name: 'Tempered Dragonmail',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 320, strength: 220, intelligence: 180 },
    armor: 1820,
    description: 'Dragon mail tempered in the fires of creation.'
  },
  {
    name: 'Magical Destiny Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 340, intelligence: 240, dexterity: 180 },
    armor: 1980,
    description: 'Armor that shapes itself to the wearer\'s destiny.'
  },
  {
    name: 'Armor of the Sakapuss',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 360, strength: 250, speed: 180 },
    armor: 2150,
    description: 'Mysterious armor from the legendary Sakapuss realm.'
  },
  {
    name: 'Gubs Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 380, strength: 270, intelligence: 220 },
    armor: 2320,
    description: 'Armor crafted by the master smith Gubs.'
  },
  {
    name: 'Synth Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 400, intelligence: 280, dexterity: 220 },
    armor: 2490,
    description: 'Synthetic armor that adapts to any situation.'
  },
  {
    name: 'Tungsten Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 420, strength: 300, intelligence: 250 },
    armor: 2660,
    description: 'Incredibly dense tungsten armor, nearly indestructible.'
  },
  {
    name: 'Raider Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 450, strength: 320, speed: 240 },
    armor: 3000,
    description: 'Battle-worn armor of the legendary raiders.'
  },
  {
    name: 'Ancient Chest Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 480, intelligence: 340, strength: 300 },
    armor: 3340,
    description: 'Ancient armor discovered in forgotten tombs.'
  },
  {
    name: 'Adamantium Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 520, strength: 360, intelligence: 320 },
    armor: 3680,
    description: 'Forged from the rarest adamantium, virtually unbreakable.'
  },
  {
    name: 'Forsaken Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 560, strength: 380, dexterity: 300 },
    armor: 4020,
    description: 'Dark armor abandoned by its original owner.'
  },

  // TRANSCENDENT ARMORS (Levels 2001+)
  {
    name: 'Bonehead Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 600, strength: 400, intelligence: 350 },
    armor: 4360,
    description: 'Armor made from the bones of primordial titans.'
  },
  {
    name: 'Remnant Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 650, intelligence: 420, speed: 320 },
    armor: 4700,
    description: 'Last remnant of a civilization lost to time.'
  },
  {
    name: 'Ah Ahkriin',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 700, strength: 450, intelligence: 400 },
    armor: 5040,
    description: 'Ancient draconic armor whose name means "Courage" in the old tongue.'
  },
  {
    name: 'Dukaan Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 750, strength: 480, dexterity: 380 },
    armor: 5380,
    description: 'Armor of the legendary Dishonored, now seeking redemption.'
  },
  {
    name: 'Krongrah Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 800, strength: 520, intelligence: 450 },
    armor: 5720,
    description: 'Sorcerer-king\'s armor, pulsing with arcane energy.'
  },
  {
    name: 'Glass Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 850, intelligence: 550, speed: 420 },
    armor: 6060,
    description: 'Impossibly strong glass armor that bends light around it.'
  },
  {
    name: 'Armadura',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 900, strength: 580, intelligence: 500 },
    armor: 6400,
    description: 'The ultimate armor, perfected through countless battles.'
  },
  {
    name: 'Panoplia',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 950, strength: 620, dexterity: 480 },
    armor: 6740,
    description: 'Complete battle regalia of the ancient god-kings.'
  },
  {
    name: 'Armor of Elohim',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1000, intelligence: 650, strength: 600 },
    armor: 7080,
    description: 'Divine armor blessed by the creator himself.'
  },
  {
    name: 'Phased Plasma Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1100, intelligence: 700, speed: 550 },
    armor: 7420,
    description: 'Futuristic armor that exists partially in another dimension.'
  },
  {
    name: 'Ancient\'s Chest Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1200, strength: 750, intelligence: 700 },
    armor: 7760,
    description: 'Chest piece worn by the first beings to walk the earth.'
  },
  {
    name: 'Prism Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1300, intelligence: 800, dexterity: 650 },
    armor: 8100,
    description: 'Crystalline armor that splits attacks into harmless light.'
  },
  {
    name: 'Void Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1400, strength: 850, intelligence: 750 },
    armor: 8440,
    description: 'Armor forged from the void between stars.'
  },
  {
    name: 'Grave Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1500, strength: 900, speed: 700 },
    armor: 8780,
    description: 'Armor that draws power from the realm of the dead.'
  },
  {
    name: 'Armor of Light',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1600, intelligence: 950, strength: 850 },
    armor: 9120,
    description: 'Pure light given form and substance.'
  },
  {
    name: 'Anga Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1700, strength: 1000, intelligence: 900 },
    armor: 9460,
    description: 'Armor of the fire god, eternally burning but never consumed.'
  },
  {
    name: 'Liquid Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1800, intelligence: 1050, dexterity: 850 },
    armor: 9800,
    description: 'Flows like liquid but hardens instantly upon impact.'
  },
  {
    name: 'Mighty Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 1900, strength: 1150, intelligence: 950 },
    armor: 10140,
    description: 'Armor that grows mightier with each victory.'
  },
  {
    name: 'Clanka Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2000, strength: 1200, speed: 900 },
    armor: 10480,
    description: 'Mechanical armor that enhances the wearer\'s every movement.'
  },
  {
    name: 'Robert Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2100, strength: 1300, intelligence: 1000 },
    armor: 10820,
    description: 'Named after the legendary king who united the realms.'
  },
  {
    name: 'Soaring Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2200, intelligence: 1350, speed: 1050 },
    armor: 11160,
    description: 'Armor that allows the wearer to soar above the battlefield.'
  },
  {
    name: 'Hard Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2300, strength: 1450, intelligence: 1100 },
    armor: 11500,
    description: 'The hardest armor ever forged, unyielding as diamond.'
  },
  {
    name: 'Soft Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2400, intelligence: 1500, dexterity: 1150 },
    armor: 11840,
    description: 'Paradoxically soft yet impenetrable, like silk made of starlight.'
  },
  {
    name: 'Tech Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2500, intelligence: 1600, speed: 1200 },
    armor: 12180,
    description: 'Advanced technological armor from a distant future.'
  },
  {
    name: 'Diamond Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2600, strength: 1650, intelligence: 1300 },
    armor: 12520,
    description: 'Forged from the largest diamonds ever discovered.'
  },
  {
    name: 'Angelic Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2700, intelligence: 1750, strength: 1500 },
    armor: 12860,
    description: 'Worn by the highest angels, radiating divine light.'
  },
  {
    name: 'Demonic Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2800, strength: 1800, intelligence: 1600 },
    armor: 13200,
    description: 'Forged in the deepest pits of hell, emanating dark power.'
  },
  {
    name: 'Black Armors',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 2900, strength: 1900, speed: 1400 },
    armor: 13540,
    description: 'Armor so dark it seems to absorb light itself.'
  },
  {
    name: 'Purple Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 3000, intelligence: 2000, strength: 1750 },
    armor: 13880,
    description: 'Royal purple armor worn by the emperor of the void.'
  },
  {
    name: 'Pink Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 3100, intelligence: 2100, dexterity: 1650 },
    armor: 14220,
    description: 'Deceptively beautiful armor that hides incredible power.'
  },
  {
    name: 'Grey Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 3200, strength: 2200, intelligence: 1900 },
    armor: 14560,
    description: 'Neutral armor that adapts to any fighting style.'
  },
  {
    name: 'Teal Armor',
    type: 'armor',
    rarity: 'legendary',
    statBonus: { constitution: 3300, intelligence: 2300, speed: 1800 },
    armor: 14900,
    description: 'The ultimate armor, transcending all known limits.'
  },

  // Helmets
  {
    name: 'Iron Helm',
    type: 'helmet',
    rarity: 'common',
    statBonus: { constitution: 1 },
    armor: 2,
    description: 'A simple iron helmet.'
  },
  {
    name: 'Knight\'s Helm',
    type: 'helmet',
    rarity: 'uncommon',
    statBonus: { constitution: 2, strength: 1 },
    armor: 4,
    description: 'A sturdy helmet worn by knights.'
  },
  {
    name: 'Crown of Wisdom',
    type: 'helmet',
    rarity: 'rare',
    statBonus: { intelligence: 4, constitution: 1 },
    armor: 3,
    description: 'A crown that enhances mental abilities.'
  },
  {
    name: 'Phoenix Crown',
    type: 'helmet',
    rarity: 'epic',
    statBonus: { intelligence: 6, constitution: 3, speed: 2 },
    armor: 8,
    description: 'A crown adorned with phoenix feathers, granting magical protection.'
  },

  // Boots
  {
    name: 'Leather Boots',
    type: 'boots',
    rarity: 'common',
    statBonus: { speed: 1 },
    description: 'Comfortable leather boots for travel.'
  },
  {
    name: 'Swift Boots',
    type: 'boots',
    rarity: 'uncommon',
    statBonus: { speed: 3, dexterity: 1 },
    dodgeChance: 5,
    description: 'Boots that enhance movement speed.'
  },
  {
    name: 'Boots of Haste',
    type: 'boots',
    rarity: 'rare',
    statBonus: { speed: 5, dexterity: 2 },
    dodgeChance: 10,
    description: 'Magical boots that greatly increase agility.'
  },
  {
    name: 'Hermes\' Sandals',
    type: 'boots',
    rarity: 'legendary',
    statBonus: { speed: 10, dexterity: 6 },
    dodgeChance: 25,
    description: 'The sandals of the messenger god, granting incredible speed.'
  },

  // Accessories
  {
    name: 'Silver Ring',
    type: 'accessory',
    rarity: 'common',
    statBonus: { intelligence: 1 },
    description: 'A simple silver ring with minor enchantments.'
  },
  {
    name: 'Ring of Power',
    type: 'accessory',
    rarity: 'uncommon',
    statBonus: { strength: 2, intelligence: 2 },
    description: 'A ring that enhances both physical and magical power.'
  },
  {
    name: 'Amulet of Protection',
    type: 'accessory',
    rarity: 'rare',
    statBonus: { constitution: 4, intelligence: 2 },
    armor: 5,
    description: 'An amulet that provides magical protection.'
  },
  {
    name: 'Dragon Heart Pendant',
    type: 'accessory',
    rarity: 'epic',
    statBonus: { strength: 4, constitution: 4, intelligence: 4 },
    armor: 8,
    criticalChance: 10,
    description: 'A pendant containing the heart of an ancient dragon.'
  },
  {
    name: 'Philosopher\'s Stone',
    type: 'accessory',
    rarity: 'legendary',
    statBonus: { strength: 5, dexterity: 5, constitution: 5, intelligence: 5, speed: 5 },
    armor: 10,
    criticalChance: 15,
    dodgeChance: 15,
    description: 'The ultimate alchemical creation, enhancing all aspects of its bearer.'
  }
];

// Rarity multipliers for stats and price
export const rarityMultipliers: Record<ItemRarity, { stats: number; price: number; durability: number }> = {
  common: { stats: 1.0, price: 1.0, durability: 1.0 },
  uncommon: { stats: 1.3, price: 2.0, durability: 1.2 },
  rare: { stats: 1.6, price: 4.0, durability: 1.5 },
  epic: { stats: 2.0, price: 8.0, durability: 2.0 },
  legendary: { stats: 2.5, price: 16.0, durability: 3.0 }
};

// Get items by build type for shop variety
export const getWeaponsByBuildType = (buildType: 'strength' | 'critical' | 'speed' | 'intelligence' | 'balanced' | 'tank' | 'ranged' | 'glass-cannon' | 'utility') => {
  const weaponIndices = {
    'strength': [0, 1, 2, 3, 4], // Iron Sword to Excalibur
    'critical': [5, 6, 7, 8], // Assassin's Dagger to Viper's Fang  
    'speed': [9, 10, 11], // Rapier to Windcutter
    'intelligence': [12, 13, 14, 15], // Mystic Staff to Staff of Eternal Fire
    'balanced': [16, 17, 18], // Knight's Blade to Champion's Sword
    'tank': [19, 20, 21], // Guardian Shield to Aegis Blade
    'ranged': [22, 23, 24], // Hunting Bow to Dragonslayer Crossbow
    'glass-cannon': [25, 26], // Chaos Blade to Soul Reaper
    'utility': [27, 28, 29] // Lucky Charm Blade to Phase Blade
  };

  return weaponIndices[buildType].map(index => baseItems[index]);
};

// Shop rarity weights for randomness
export const RARITY_WEIGHTS = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1
};

// Generate random shop inventory
export const generateShopInventory = (shopLevel: number = 1): Item[] => {
  const inventory: Item[] = [];
  const itemCount = Math.min(4 + Math.floor(shopLevel / 2), 8); // 4-8 items based on shop level

  for (let i = 0; i < itemCount; i++) {
    // Get weighted random rarity
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    let selectedRarity: ItemRarity = 'common';

    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
      random -= weight;
      if (random <= 0) {
        selectedRarity = rarity as ItemRarity;
        break;
      }
    }

    // Get items of selected rarity
    const itemsOfRarity = baseItems.filter(item => item.rarity === selectedRarity);
    if (itemsOfRarity.length > 0) {
      const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
      const level = Math.max(1, shopLevel + Math.floor(Math.random() * 3) - 1); // ±1 level variance
      inventory.push(generateItem(randomItem, level));
    }
  }

  return inventory;
};

// ENHANCED PRICE CALCULATION for high-tier items
export const calculateItemPrice = (item: Omit<Item, 'id' | 'level' | 'price' | 'durability' | 'maxDurability'>, level: number): number => {
  const basePrice = {
    common: 50,
    uncommon: 150,
    rare: 500,
    epic: 2000,
    legendary: 10000
  };

  // Calculate total item power for pricing
  let itemPower = 0;

  // Add stat bonus values
  Object.values(item.statBonus).forEach(value => {
    if (typeof value === 'number') {
      itemPower += value;
    }
  });

  // Add combat values
  if (item.armor) itemPower += item.armor * 0.5; // Armor worth 0.5x its value
  if (item.damage) itemPower += item.damage * 2; // Damage worth 2x its value
  if (item.criticalChance) itemPower += item.criticalChance * 10;
  if (item.dodgeChance) itemPower += item.dodgeChance * 10;

  // Level scaling with diminishing returns for high levels
  const levelMultiplier = Math.pow(1.2, Math.min(level - 1, 50)) * Math.pow(1.05, Math.max(level - 51, 0));

  // Power-based pricing with exponential scaling for very high-tier items
  const powerMultiplier = itemPower > 1000 ? Math.pow(itemPower / 1000, 1.5) : Math.max(1, itemPower / 100);

  const finalPrice = Math.floor(basePrice[item.rarity] * levelMultiplier * powerMultiplier);

  // Cap prices at reasonable maximums to prevent overflow
  return Math.min(finalPrice, 999999999999); // 999 billion max
};

// Enhanced item generation with proper pricing
export const generateItem = (baseItem: typeof baseItems[0], level: number): Item => {
  const levelBonus = Math.floor((level - 1) / 2); // Every 2 levels adds +1 to stats
  const price = calculateItemPrice(baseItem, level);

  // Scale stats based on level
  const enhancedStatBonus: Partial<typeof baseItem.statBonus> = {};
  Object.entries(baseItem.statBonus).forEach(([stat, value]) => {
    if (typeof value === 'number') {
      enhancedStatBonus[stat as keyof typeof baseItem.statBonus] = value + levelBonus;
    }
  });

  return {
    id: `${baseItem.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    ...baseItem,
    level,
    price,
    statBonus: enhancedStatBonus,
    damage: baseItem.damage ? baseItem.damage + levelBonus * 2 : undefined,
    armor: baseItem.armor ? baseItem.armor + levelBonus : undefined,
    criticalChance: baseItem.criticalChance,
    dodgeChance: baseItem.dodgeChance,
    durability: 100,
    maxDurability: 100
  };
};

export const generateRandomItem = (minLevel: number = 1, maxLevel: number = 10): Item => {
  const randomBaseItem = baseItems[Math.floor(Math.random() * baseItems.length)];
  const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
  return generateItem(randomBaseItem, level);
};

export const getItemsByType = (type: ItemType): typeof baseItems => {
  return baseItems.filter(item => item.type === type);
};

export const getItemsByRarity = (rarity: ItemRarity): typeof baseItems => {
  return baseItems.filter(item => item.rarity === rarity);
};

export const generateStarterEquipment = (): Item[] => {
  const starterWeapon = generateItem(baseItems[0], 1); // Iron Sword
  const starterArmor = generateItem(baseItems.find(item => item.name === 'Padded Undershirt')!, 1);
  const starterBoots = generateItem(baseItems.find(item => item.name === 'Leather Boots')!, 1);

  return [starterWeapon, starterArmor, starterBoots];
}; 