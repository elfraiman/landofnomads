import { Item, ItemRarity, ItemType } from '../types';
import { baseItems, generateItem } from './items';

// Drop chance multipliers for each rarity
export const RARITY_DROP_RATES: Record<ItemRarity, number> = {
  common: 0.35,      // 35% chance
  uncommon: 0.25,    // 25% chance
  rare: 0.15,        // 15% chance
  epic: 0.05,        // 5% chance
  legendary: 0.01    // 1% chance
};

// Level range for each rarity (when items start appearing)
export const RARITY_LEVEL_RANGES: Record<ItemRarity, { min: number; max: number }> = {
  common: { min: 1, max: 100 },
  uncommon: { min: 5, max: 100 },
  rare: { min: 10, max: 100 },
  epic: { min: 20, max: 100 },
  legendary: { min: 30, max: 100 }
};

// Special drop rates for boss monsters
export const BOSS_RARITY_DROP_RATES: Record<ItemRarity, number> = {
  common: 0.0,       // Bosses don't drop common items
  uncommon: 0.35,    // 35% chance
  rare: 0.30,        // 30% chance
  epic: 0.20,        // 20% chance
  legendary: 0.05    // 5% chance
};

// Item type weights based on monster type
export const MONSTER_TYPE_ITEM_WEIGHTS: Record<string, Partial<Record<ItemType, number>>> = {
  'humanoid': {
    weapon: 0.3,
    armor: 0.3,
    shield: 0.2,
    boots: 0.1,
    accessory: 0.1
  },
  'beast': {
    weapon: 0.2,
    armor: 0.4,
    boots: 0.2,
    accessory: 0.2
  },
  'undead': {
    weapon: 0.25,
    armor: 0.25,
    shield: 0.2,
    boots: 0.15,
    accessory: 0.15
  },
  'dragon': {
    weapon: 0.3,
    armor: 0.3,
    shield: 0.1,
    boots: 0.1,
    accessory: 0.2
  },
  'elemental': {
    weapon: 0.2,
    armor: 0.2,
    shield: 0.2,
    boots: 0.2,
    accessory: 0.2
  },
  'demon': {
    weapon: 0.35,
    armor: 0.25,
    shield: 0.15,
    boots: 0.15,
    accessory: 0.1
  },
  'default': {
    weapon: 0.25,
    armor: 0.25,
    shield: 0.2,
    boots: 0.15,
    accessory: 0.15
  }
};

// Helper function to determine if an item can drop based on monster level
const canItemDrop = (itemRarity: ItemRarity, monsterLevel: number): boolean => {
  const range = RARITY_LEVEL_RANGES[itemRarity];
  return monsterLevel >= range.min && monsterLevel <= range.max;
};

// Helper function to get weighted random item type based on monster type
const getRandomItemType = (monsterType: string): ItemType => {
  const weights = MONSTER_TYPE_ITEM_WEIGHTS[monsterType] || MONSTER_TYPE_ITEM_WEIGHTS['default'];
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [type, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return type as ItemType;
    }
  }
  
  return 'weapon'; // Fallback
};

// Helper function to get random rarity based on drop rates
const getRandomRarity = (monsterLevel: number, isBoss: boolean = false): ItemRarity | null => {
  const dropRates = isBoss ? BOSS_RARITY_DROP_RATES : RARITY_DROP_RATES;
  const random = Math.random();
  let cumulativeChance = 0;

  for (const [rarity, chance] of Object.entries(dropRates)) {
    if (!canItemDrop(rarity as ItemRarity, monsterLevel)) continue;
    
    cumulativeChance += chance;
    if (random <= cumulativeChance) {
      return rarity as ItemRarity;
    }
  }

  return null; // No drop
};

// Main function to generate loot from a monster
export const generateMonsterLoot = (
  monsterLevel: number,
  monsterType: string = 'default',
  isBoss: boolean = false,
  guaranteedDrop: boolean = false
): Item[] => {
  const loot: Item[] = [];
  
  // Determine if there should be a drop
  const shouldDrop = guaranteedDrop || Math.random() < 0.6; // 60% base chance for any drop
  if (!shouldDrop) return loot;

  // Determine rarity of the drop
  const rarity = getRandomRarity(monsterLevel, isBoss);
  if (!rarity) return loot;

  // Get random item type based on monster type
  const itemType = getRandomItemType(monsterType);

  // Filter available items by rarity and type
  const availableItems = baseItems.filter(item => 
    item.rarity === rarity && 
    item.type === itemType
  );

  if (availableItems.length > 0) {
    // Pick a random item from the filtered list
    const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    
    // Generate the item with a level close to the monster's level
    const itemLevel = Math.max(1, monsterLevel + Math.floor(Math.random() * 3) - 1);
    const generatedItem = generateItem(randomItem, itemLevel);
    
    loot.push(generatedItem);
  }

  return loot;
};

// Function to generate multiple items (for boss drops or special occasions)
export const generateMultipleItems = (
  monsterLevel: number,
  monsterType: string = 'default',
  minItems: number = 1,
  maxItems: number = 3,
  guaranteedRareOrBetter: boolean = false
): Item[] => {
  const itemCount = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
  const loot: Item[] = [];

  for (let i = 0; i < itemCount; i++) {
    const items = generateMonsterLoot(
      monsterLevel,
      monsterType,
      true, // Treat as boss drop for better chances
      guaranteedRareOrBetter // Guarantee at least rare items if specified
    );
    loot.push(...items);
  }

  return loot;
};

// Example usage:
// Normal monster: const loot = generateMonsterLoot(monsterLevel, monsterType);
// Boss monster: const bossLoot = generateMultipleItems(bossLevel, bossType, 2, 4, true); 