import { Gem, GemType, GemTier, ItemRarity, CharacterStats } from '../types';

// Gem base definitions with their effects
export const gemBaseData: Record<GemType, {
  name: string;
  description: string;
  color: string;
  baseEffect: {
    statType: keyof Gem['consumeEffect']['statBonus'] | 'experienceBonus' | 'goldBonus';
    baseValue: number;
  };
  dropChance: {
    base: number; // Base drop chance (0.0 to 1.0)
    rarityMultiplier: number; // Multiplier for rare monsters
  };
}> = {
  ruby: {
    name: 'Ruby',
    description: 'A fiery red gem that enhances physical power',
    color: '#DC2626', // Red
    baseEffect: {
      statType: 'strength',
      baseValue: 5
    },
    dropChance: {
      base: 0.08, // 8% base chance
      rarityMultiplier: 1.5 // 1.5x for rare monsters
    }
  },
  sapphire: {
    name: 'Sapphire',
    description: 'A deep blue gem that fortifies the body',
    color: '#2563EB', // Blue
    baseEffect: {
      statType: 'constitution',
      baseValue: 5
    },
    dropChance: {
      base: 0.08, // 8% base chance
      rarityMultiplier: 1.5 // 1.5x for rare monsters
    }
  },
  emerald: {
    name: 'Emerald',
    description: 'A vibrant green gem that sharpens the mind',
    color: '#059669', // Green
    baseEffect: {
      statType: 'intelligence',
      baseValue: 5
    },
    dropChance: {
      base: 0.08, // 8% base chance
      rarityMultiplier: 1.5 // 1.5x for rare monsters
    }
  },
  diamond: {
    name: 'Diamond',
    description: 'A brilliant clear gem that enhances agility',
    color: '#E5E7EB', // White/Silver
    baseEffect: {
      statType: 'dexterity',
      baseValue: 5
    },
    dropChance: {
      base: 0.08, // 6% base chance (slightly rarer)
      rarityMultiplier: 1.8 // Higher multiplier for rare monsters
    }
  },
  opal: {
    name: 'Opal',
    description: 'A shimmering gem that increases swiftness',
    color: '#FCB8E6FF', // Purple
    baseEffect: {
      statType: 'speed',
      baseValue: 5
    },
    dropChance: {
      base: 0.05, // 5% base chance (rarer)
      rarityMultiplier: 2.0 // 2x for rare monsters
    }
  },
  citrine: {
    name: 'Amethyst',
    description: 'A golden gem that enhances learning and experience gain',
    color: '#A855F7', // Gold/Yellow
    baseEffect: {
      statType: 'experienceBonus',
      baseValue: 10 // 5% base experience bonus
    },
    dropChance: {
      base: 0.10,
      rarityMultiplier: 3.0 // 3x for rare monsters
    }
  },
  amber: {
    name: 'Amber',
    description: 'An ancient gem that attracts wealth and fortune',
    color: '#D97706', // Amber/Orange
    baseEffect: {
      statType: 'goldBonus',
      baseValue: 10 // 5% base gold bonus
    },
    dropChance: {
      base: 0.08,
      rarityMultiplier: 2.5 // 2.5x for rare monsters
    }
  }
};

// Gem tier multipliers and properties
export const gemTierData: Record<GemTier, {
  name: string;
  multiplier: number;
  rarity: ItemRarity;
  duration: number; // battles
  fusionCost: number; // how many of previous tier needed
  dropChanceModifier: number; // Modifier for drop chance (1.0 = normal, 0.5 = half chance, etc.)
}> = {
  flawed: {
    name: 'Flawed',
    multiplier: 0.5,
    rarity: 'common',
    duration: 20,
    fusionCost: 2, // 2 flawed = 1 normal
    dropChanceModifier: 1.0 // Base drop chance
  },
  normal: {
    name: 'Normal',
    multiplier: 1.0,
    rarity: 'uncommon',
    duration: 45,
    fusionCost: 2, // 2 flawed = 1 normal
    dropChanceModifier: 0.6 // 60% of base chance
  },
  greater: {
    name: 'Greater',
    multiplier: 2.0,
    rarity: 'rare',
    duration: 85,
    fusionCost: 2, // 2 normal = 1 greater
    dropChanceModifier: 0.3 // 30% of base chance
  },
  perfect: {
    name: 'Perfect',
    multiplier: 4.0,
    rarity: 'epic',
    duration: 180,
    fusionCost: 2, // 2 greater = 1 perfect
    dropChanceModifier: 0.1 // 10% of base chance
  },
  legendary: {
    name: 'Legendary',
    multiplier: 8.0,
    rarity: 'legendary',
    duration: 300,
    fusionCost: 4, // 4 perfect = 1 legendary
    dropChanceModifier: 0.02 // 2% of base chance (extremely rare)
  }
};

// Generate a gem with specific type and tier
export const createGem = (gemType: GemType, gemTier: GemTier, level: number = 1): Gem => {
  const baseData = gemBaseData[gemType];
  const tierData = gemTierData[gemTier];
  const tierName = tierData.name ? `${tierData.name} ` : '';

  if (baseData.baseEffect.statType === 'experienceBonus') {
    const bonusValue = Math.floor(baseData.baseEffect.baseValue * tierData.multiplier);
    return {
      id: `gem_${gemType}_${gemTier}_${Date.now()}_${Math.random()}`,
      name: `${tierName}${baseData.name}`,
      type: 'gem',
      gemType,
      gemTier,
      rarity: tierData.rarity,
      level,
      price: calculateGemPrice(gemType, gemTier, level),
      statBonus: {},
      durability: 1,
      maxDurability: 1,
      description: `${baseData.description}. Use to gain +${bonusValue}% experience for ${tierData.duration} battles.`,
      consumeEffect: {
        statBonus: {},
        experienceBonus: bonusValue,
        duration: tierData.duration,
        description: `+${bonusValue}% experience for ${tierData.duration} battles`
      }
    };
  }

  if (baseData.baseEffect.statType === 'goldBonus') {
    const bonusValue = Math.floor(baseData.baseEffect.baseValue * tierData.multiplier);
    return {
      id: `gem_${gemType}_${gemTier}_${Date.now()}_${Math.random()}`,
      name: `${tierName}${baseData.name}`,
      type: 'gem',
      gemType,
      gemTier,
      rarity: tierData.rarity,
      level,
      price: calculateGemPrice(gemType, gemTier, level),
      statBonus: {},
      durability: 1,
      maxDurability: 1,
      description: `${baseData.description}. Use to gain +${bonusValue}% gold for ${tierData.duration} battles.`,
      consumeEffect: {
        statBonus: {},
        goldBonus: bonusValue,
        duration: tierData.duration,
        description: `+${bonusValue}% gold for ${tierData.duration} battles`
      }
    };
  }

  // Handle stat bonus gems (existing functionality)
  const effectValue = Math.floor(baseData.baseEffect.baseValue * tierData.multiplier);
  const statType = baseData.baseEffect.statType as keyof CharacterStats;

  return {
    id: `gem_${gemType}_${gemTier}_${Date.now()}_${Math.random()}`,
    name: `${tierName}${baseData.name}`,
    type: 'gem',
    gemType,
    gemTier,
    rarity: tierData.rarity,
    level,
    price: calculateGemPrice(gemType, gemTier, level),
    statBonus: {},
    durability: 1,
    maxDurability: 1,
    description: `${baseData.description}. Use to gain +${effectValue} ${statType} for ${tierData.duration} battles.`,
    consumeEffect: {
      statBonus: {
        [statType]: effectValue
      },
      duration: tierData.duration,
      description: `+${effectValue} ${statType} for ${tierData.duration} battles`
    }
  };
};

// Calculate gem price based on type and tier
export const calculateGemPrice = (gemType: GemType, gemTier: GemTier, level: number): number => {
  const basePrices: Record<GemType, number> = {
    ruby: 100,
    sapphire: 100,
    emerald: 100,
    diamond: 200,
    opal: 300,
    citrine: 500, // Experience gems are more valuable
    amber: 400   // Gold gems are valuable but less than experience
  };

  const tierMultipliers: Record<GemTier, number> = {
    flawed: 0.5,
    normal: 1.0,
    greater: 3.0,
    perfect: 8.0,
    legendary: 20.0
  };

  return Math.floor(basePrices[gemType] * tierMultipliers[gemTier] * (1 + level * 0.1));
};

// Check if gems can be fused
export const canFuseGems = (gems: Gem[]): boolean => {
  if (gems.length < 2) return false;

  // All gems must be same type and tier
  const firstGem = gems[0];
  const requiredCount = gemTierData[firstGem.gemTier].fusionCost;

  if (gems.length < requiredCount) return false;

  return gems.every(gem =>
    gem.gemType === firstGem.gemType &&
    gem.gemTier === firstGem.gemTier
  );
};

// Get next tier for fusion
export const getNextTier = (currentTier: GemTier): GemTier | null => {
  const tiers: GemTier[] = ['flawed', 'normal', 'greater', 'perfect', 'legendary'];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null; // Already at max tier
  }

  return tiers[currentIndex + 1];
};

// Fuse gems into higher tier
export const fuseGems = (gems: Gem[]): Gem | null => {
  if (!canFuseGems(gems)) return null;

  const firstGem = gems[0];
  const nextTier = getNextTier(firstGem.gemTier);

  if (!nextTier) return null;

  // Use average level of input gems
  const avgLevel = Math.floor(gems.reduce((sum, gem) => sum + gem.level, 0) / gems.length);

  return createGem(firstGem.gemType, nextTier, avgLevel);
};

// Generate random gem drop
export const generateRandomGem = (playerLevel: number): Gem => {
  const gemTypes: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'opal', 'citrine', 'amber'];

  // Make citrine and amber rarer
  const weightedTypes: GemType[] = [
    'ruby', 'ruby', 'ruby',
    'sapphire', 'sapphire', 'sapphire',
    'emerald', 'emerald', 'emerald',
    'diamond', 'diamond',
    'opal', 'opal',
    'citrine', // Experience gems are rare
    'amber'    // Gold gems are rare
  ];

  const randomType = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];

  // Higher level players have slightly better chance at better gems
  let tier: GemTier = 'flawed';
  const roll = Math.random() * 100;

  if (playerLevel >= 10 && roll < 20) tier = 'normal';
  else if (playerLevel >= 20 && roll < 5) tier = 'greater';
  else if (playerLevel >= 40 && roll < 1) tier = 'perfect';

  return createGem(randomType, tier, Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1));
};

// Get all possible fusion recipes for display
export const getFusionRecipes = (): Array<{
  input: { type: GemType; tier: GemTier; count: number };
  output: { type: GemType; tier: GemTier };
}> => {
  const recipes: Array<{
    input: { type: GemType; tier: GemTier; count: number };
    output: { type: GemType; tier: GemTier };
  }> = [];

  const gemTypes: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'opal', 'citrine', 'amber'];
  const tiers: GemTier[] = ['flawed', 'normal', 'greater', 'perfect'];

  gemTypes.forEach(gemType => {
    tiers.forEach(tier => {
      const nextTier = getNextTier(tier);
      if (nextTier) {
        recipes.push({
          input: {
            type: gemType,
            tier,
            count: gemTierData[tier].fusionCost
          },
          output: { type: gemType, tier: nextTier }
        });
      }
    });
  });

  return recipes;
};

// Calculate the actual drop chance for a specific gem type and tier
export const calculateGemDropChance = (
  gemType: GemType,
  gemTier: GemTier,
  monsterRarity: 'common' | 'uncommon' | 'rare' | 'elite' | 'boss'
): number => {
  const baseData = gemBaseData[gemType];
  const tierData = gemTierData[gemTier];

  // Monster rarity multipliers
  const monsterRarityMultipliers = {
    'common': 1.0,
    'uncommon': 1.2,
    'rare': baseData.dropChance.rarityMultiplier,
    'elite': baseData.dropChance.rarityMultiplier * 1.5,
    'boss': baseData.dropChance.rarityMultiplier * 2.0
  };

  const finalChance = baseData.dropChance.base *
    tierData.dropChanceModifier *
    monsterRarityMultipliers[monsterRarity];

  return Math.min(1.0, finalChance); // Cap at 100%
};

// Get all possible gem drops with their chances for a given monster
export const getGemDropTable = (
  monsterLevel: number,
  monsterRarity: 'common' | 'uncommon' | 'rare' | 'elite' | 'boss'
): Array<{ gemType: GemType; gemTier: GemTier; chance: number }> => {
  const dropTable: Array<{ gemType: GemType; gemTier: GemTier; chance: number }> = [];

  const gemTypes: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'opal', 'citrine', 'amber'];
  const tiers: GemTier[] = ['flawed', 'normal', 'greater', 'perfect', 'legendary'];

  gemTypes.forEach(gemType => {
    tiers.forEach(tier => {
      // Only allow gems of appropriate tier for monster level
      const tierLevelRequirements = {
        'flawed': 1,
        'normal': 5,
        'greater': 15,
        'perfect': 30,
        'legendary': 50
      };

      if (monsterLevel >= tierLevelRequirements[tier]) {
        const chance = calculateGemDropChance(gemType, tier, monsterRarity);
        if (chance > 0) {
          dropTable.push({ gemType, gemTier: tier, chance });
        }
      }
    });
  });

  return dropTable.sort((a, b) => b.chance - a.chance); // Sort by chance descending
};

// Generate a gem drop based on the drop table
export const generateGemDrop = (
  monsterLevel: number,
  monsterRarity: 'common' | 'uncommon' | 'rare' | 'elite' | 'boss'
): Gem | null => {
  // Calculate a single overall gem drop chance based on monster rarity
  const baseGemDropChance = 0.05; // 5% base chance for any gem to drop

  const monsterRarityMultipliers = {
    'common': 1.0,
    'uncommon': 1.5,
    'rare': 2.0,
    'elite': 3.0,
    'boss': 4.0
  };

  const finalDropChance = baseGemDropChance * monsterRarityMultipliers[monsterRarity];

  console.log(`Gem Drop - Level ${monsterLevel} ${monsterRarity} monster, drop chance: ${(finalDropChance * 100).toFixed(1)}%`);

  // First roll: Does ANY gem drop at all?
  const dropRoll = Math.random();
  console.log(`Gem Drop - Roll: ${(dropRoll * 100).toFixed(1)}% vs ${(finalDropChance * 100).toFixed(1)}%`);

  if (dropRoll > finalDropChance) {
    console.log('Gem Drop - No gem dropped');
    return null; // No gem dropped
  }

  console.log('Gem Drop - Gem will drop! Selecting type...');

  // If a gem drops, determine which type and tier
  const availableGems = getGemDropTable(monsterLevel, monsterRarity);

  if (availableGems.length === 0) return null;

  // Create weighted selection based on individual gem rarities
  const weightedGems: Array<{ gemType: GemType; gemTier: GemTier; weight: number }> = [];

  availableGems.forEach(entry => {
    // Use the individual gem's drop chance as its weight in selection
    // Higher individual drop chance = more likely to be selected IF a gem drops
    const weight = entry.chance * 1000; // Scale up for integer weights
    weightedGems.push({
      gemType: entry.gemType,
      gemTier: entry.gemTier,
      weight: Math.max(1, Math.floor(weight))
    });
  });

  // Select gem based on weights
  const totalWeight = weightedGems.reduce((sum, gem) => sum + gem.weight, 0);
  let randomWeight = Math.floor(Math.random() * totalWeight);

  for (const gem of weightedGems) {
    randomWeight -= gem.weight;
    if (randomWeight <= 0) {
      const selectedGem = createGem(gem.gemType, gem.gemTier, monsterLevel);
      console.log(`Gem Drop - Selected: ${selectedGem.name}`);
      return selectedGem;
    }
  }

  // Fallback (shouldn't happen)
  const fallback = weightedGems[0];
  const fallbackGem = createGem(fallback.gemType, fallback.gemTier, monsterLevel);
  console.log(`Gem Drop - Fallback: ${fallbackGem.name}`);
  return fallbackGem;
};

// Get total gem drop chance for a monster (for display purposes)
export const getTotalGemDropChance = (
  monsterLevel: number,
  monsterRarity: 'common' | 'uncommon' | 'rare' | 'elite' | 'boss'
): number => {
  // Return the actual overall gem drop chance (not the sum of all individual chances)
  const baseGemDropChance = 0.05; // 5% base chance

  const monsterRarityMultipliers = {
    'common': 1.0,
    'uncommon': 1.5,
    'rare': 2.0,
    'elite': 3.0,
    'boss': 4.0
  };

  return Math.min(1.0, baseGemDropChance * monsterRarityMultipliers[monsterRarity]);
};

// Get formatted gem drop information for UI display
export const getGemDropInfo = (
  monsterLevel: number,
  monsterRarity: 'common' | 'uncommon' | 'rare' | 'elite' | 'boss'
): {
  totalChance: number;
  topDrops: Array<{ name: string; tier: string; chance: number; color: string }>;
} => {
  const dropTable = getGemDropTable(monsterLevel, monsterRarity);
  const totalChance = getTotalGemDropChance(monsterLevel, monsterRarity);

  // Get top 5 most likely drops for display
  const topDrops = dropTable
    .slice(0, 5)
    .map(entry => ({
      name: gemBaseData[entry.gemType].name,
      tier: gemTierData[entry.gemTier].name,
      chance: entry.chance,
      color: gemBaseData[entry.gemType].color
    }));

  return {
    totalChance,
    topDrops
  };
}; 