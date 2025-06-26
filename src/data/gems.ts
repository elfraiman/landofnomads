import { Gem, GemType, GemTier, ItemRarity } from '../types';

// Gem base definitions with their effects
export const gemBaseData: Record<GemType, {
  name: string;
  description: string;
  emoji: string;
  baseEffect: {
    statType: keyof Gem['consumeEffect']['statBonus'];
    baseValue: number;
  };
}> = {
  ruby: {
    name: 'Ruby',
    description: 'A fiery red gem that enhances physical power',
    emoji: '🔴',
    baseEffect: {
      statType: 'strength',
      baseValue: 5
    }
  },
  sapphire: {
    name: 'Sapphire', 
    description: 'A deep blue gem that fortifies the body',
    emoji: '🔵',
    baseEffect: {
      statType: 'constitution',
      baseValue: 5
    }
  },
  emerald: {
    name: 'Emerald',
    description: 'A vibrant green gem that sharpens the mind',
    emoji: '🟢', 
    baseEffect: {
      statType: 'intelligence',
      baseValue: 5
    }
  },
  diamond: {
    name: 'Diamond',
    description: 'A brilliant clear gem that enhances agility',
    emoji: '💎',
    baseEffect: {
      statType: 'dexterity',
      baseValue: 5
    }
  },
  opal: {
    name: 'Opal',
    description: 'A shimmering gem that increases swiftness',
    emoji: '🌈',
    baseEffect: {
      statType: 'speed',
      baseValue: 5
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
}> = {
  flawed: {
    name: 'Flawed',
    multiplier: 0.5,
    rarity: 'common',
    duration: 5,
    fusionCost: 2 // 2 flawed = 1 normal
  },
  normal: {
    name: '',
    multiplier: 1.0,
    rarity: 'uncommon', 
    duration: 10,
    fusionCost: 2 // 2 flawed = 1 normal
  },
  greater: {
    name: 'Greater',
    multiplier: 2.0,
    rarity: 'rare',
    duration: 15,
    fusionCost: 2 // 2 normal = 1 greater
  },
  perfect: {
    name: 'Perfect',
    multiplier: 4.0,
    rarity: 'epic',
    duration: 25,
    fusionCost: 2 // 2 greater = 1 perfect
  },
  legendary: {
    name: 'Legendary',
    multiplier: 8.0,
    rarity: 'legendary',
    duration: 50,
    fusionCost: 2 // 2 perfect = 1 legendary
  }
};

// Generate a gem with specific type and tier
export const createGem = (gemType: GemType, gemTier: GemTier, level: number = 1): Gem => {
  const baseData = gemBaseData[gemType];
  const tierData = gemTierData[gemTier];
  
  const effectValue = Math.floor(baseData.baseEffect.baseValue * tierData.multiplier);
  const tierName = tierData.name ? `${tierData.name} ` : '';
  
  return {
    id: `gem_${gemType}_${gemTier}_${Date.now()}_${Math.random()}`,
    name: `${tierName}${baseData.name}`,
    type: 'gem',
    gemType,
    gemTier,
    rarity: tierData.rarity,
    level,
    price: calculateGemPrice(gemType, gemTier, level),
    statBonus: {}, // Gems don't provide passive stats
    durability: 1,
    maxDurability: 1,
    description: `${baseData.description}. Use to gain +${effectValue} ${baseData.baseEffect.statType} for ${tierData.duration} battles.`,
    consumeEffect: {
      statBonus: {
        [baseData.baseEffect.statType]: effectValue
      },
      duration: tierData.duration,
      description: `+${effectValue} ${baseData.baseEffect.statType} for ${tierData.duration} battles`
    }
  };
};

// Calculate gem price based on type and tier
export const calculateGemPrice = (gemType: GemType, gemTier: GemTier, level: number): number => {
  const basePrices: Record<GemType, number> = {
    ruby: 50,
    sapphire: 50, 
    emerald: 50,
    diamond: 75,
    opal: 60
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
  const gemTypes: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'opal'];
  const randomType = gemTypes[Math.floor(Math.random() * gemTypes.length)];
  
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
  
  const gemTypes: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'opal'];
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