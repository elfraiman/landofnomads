import { Character, CombatResult, CombatRound, CombatStats, CombatAction, CharacterStats, ActiveGemEffect, CharacterClass, Item, ItemRarity } from '../types';
import { baseItems, generateItem } from '../data/items';

// Helper function to generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Combat weapon attack information
interface WeaponAttack {
  weapon: any;
  weaponName: string;
  damage: number;
  speed: number;
  criticalChance: number;
}

// Combat configuration for different weapon setups
interface CombatConfiguration {
  attacks: WeaponAttack[];
  hasShield: boolean;
  shieldBlockChance: number;
  shieldBlockAmount: number;
}

// Get weapon attack configuration from equipment
const getWeaponConfiguration = (character: Character): CombatConfiguration => {
  const { mainHand, offHand } = character.equipment;
  const attacks: WeaponAttack[] = [];
  let hasShield = false;
  let shieldBlockChance = 0;
  let shieldBlockAmount = 0;

  // Check main hand weapon
  if (mainHand && mainHand.type === 'weapon') {
    attacks.push({
      weapon: mainHand,
      weaponName: mainHand.name,
      damage: mainHand.damage || 0,
      speed: mainHand.weaponSpeed || 5,
      criticalChance: mainHand.criticalChance || 0
    });

    // If two-handed weapon, no off-hand possible
    if (mainHand.handedness === 'two-handed') {
      return { attacks, hasShield, shieldBlockChance, shieldBlockAmount };
    }
  }

  // Check off-hand - could be weapon or shield
  if (offHand) {
    if (offHand.type === 'weapon' || offHand.type === 'shield') {
      // Check if this is actually a shield (explicit shield type, or weapon with explicit blockChance or high armor/low damage)
      const hasExplicitBlockChance = offHand.blockChance && offHand.blockChance > 0;
      const isImplicitShield = (offHand.armor && offHand.armor > 0) && (!offHand.damage || offHand.damage < 5);
      const isShield = offHand.type === 'shield' || hasExplicitBlockChance || isImplicitShield;
      
      if (isShield) {
        // This is a shield
        hasShield = true;
        if (hasExplicitBlockChance) {
          // Use explicit block chance from item
          shieldBlockChance = offHand.blockChance!;
        } else {
          // Fallback to old calculation for items without explicit block chance
          shieldBlockChance = 25 + (offHand.armor || 0) * 2;
        }
        shieldBlockAmount = Math.floor((offHand.armor || 0) * 1.5); // 1.5x armor value blocked
      } else if (offHand.handedness === 'one-handed') {
        // This is a second weapon for dual-wielding
        attacks.push({
          weapon: offHand,
          weaponName: offHand.name,
          damage: Math.floor((offHand.damage || 0) * 0.75), // Off-hand penalty
          speed: offHand.weaponSpeed || 5,
          criticalChance: (offHand.criticalChance || 0) * 0.8 // Slight crit penalty for off-hand
        });
      }
    }
  }

  // If no weapons, use fists
  if (attacks.length === 0) {
    attacks.push({
      weapon: null,
      weaponName: 'fists',
      damage: 0,
      speed: 5,
      criticalChance: 0
    });
  }

  // Cap shield block chance at reasonable maximum
  shieldBlockChance = Math.min(shieldBlockChance, 60);

  return { attacks, hasShield, shieldBlockChance, shieldBlockAmount };
};

// Apply diminishing returns to stat values for balanced progression
const applyDiminishingReturns = (statValue: number): number => {
  // First 50 points at full effectiveness, then square root scaling
  const baseStat = Math.min(statValue, 50);
  const excessStat = Math.max(0, statValue - 50);
  return baseStat + Math.sqrt(excessStat * 5);
};

// Apply active gem effects to character stats
const applyGemEffects = (baseStats: CharacterStats, activeGemEffects: ActiveGemEffect[]): CharacterStats => {
  let modifiedStats = { ...baseStats };
  
  activeGemEffects.forEach(effect => {
    Object.entries(effect.statBonus).forEach(([stat, bonus]) => {
      if (typeof bonus === 'number') {
        modifiedStats[stat as keyof CharacterStats] += bonus;
      }
    });
  });
  
  return modifiedStats;
};

// Calculate effective combat stats from character stats and equipment
export const calculateCombatStats = (character: Character): CombatStats => {
  const { stats, equipment, level } = character;

  // Apply gem effects to base stats first, then diminishing returns
  const gemModifiedStats = applyGemEffects(stats, character.activeGemEffects || []);
  
  // Base stats from character with gem effects and diminishing returns applied
  let effectiveStats = {
    strength: applyDiminishingReturns(gemModifiedStats.strength),
    dexterity: applyDiminishingReturns(gemModifiedStats.dexterity),
    constitution: applyDiminishingReturns(gemModifiedStats.constitution),
    intelligence: applyDiminishingReturns(gemModifiedStats.intelligence),
    speed: applyDiminishingReturns(gemModifiedStats.speed)
  };
  
  let armor = 0;
  let weaponDamage = 0;
  let criticalChance = 0;
  let dodgeChance = 0;
  let accuracyBonus = 0;

  // Apply equipment bonuses (equipment bonuses don't get diminishing returns)
  Object.values(equipment).forEach(item => {
    if (!item) return;

    // Add stat bonuses from equipment (these add to base stats, then get diminishing returns applied)
    Object.entries(item.statBonus).forEach(([stat, bonus]) => {
      if (typeof bonus === 'number') {
        const baseStat = stats[stat as keyof typeof stats] + bonus;
        effectiveStats[stat as keyof typeof effectiveStats] = applyDiminishingReturns(baseStat);
      }
    });

    // Add direct combat modifiers from equipment
    if (item.armor) armor += item.armor;
    if (item.damage) weaponDamage += item.damage;
    if (item.criticalChance) criticalChance += item.criticalChance;
    if (item.dodgeChance) dodgeChance += item.dodgeChance;
  });

  // ENHANCED DUAL-WIELDING MECHANICS
  const weaponConfig = getWeaponConfiguration(character);
  let dualWieldBonus = 0;
  let weaponSpeedModifier = 0;

  if (weaponConfig.attacks.length > 1) {
    // Dual-wielding bonuses
    dualWieldBonus = Math.floor(weaponConfig.attacks.reduce((sum, attack) => sum + attack.damage, 0) * 0.7);
    weaponSpeedModifier = Math.floor(weaponConfig.attacks.reduce((sum, attack) => sum + attack.speed, 0) / weaponConfig.attacks.length * 1.1);
    criticalChance += 3; // Dual-wield crit bonus
  } else if (weaponConfig.attacks.length === 1) {
    const weapon = weaponConfig.attacks[0].weapon;
    if (weapon && weapon.handedness === 'two-handed') {
      // Two-handed weapons get slight bonus but dampened by overall scaling
      weaponDamage = Math.floor(weaponDamage * 0.9);
      weaponSpeedModifier = Math.floor((weaponConfig.attacks[0].speed || 5) * 0.85);
    } else {
      weaponSpeedModifier = weaponConfig.attacks[0].speed || 5;
    }
  }

  // Calculate health with balanced scaling for new stat system
  // Reduced constitution multiplier to work with new stat point economy
  // Base formula: 20 + (level * 3) + (constitution * 3)
  const baseHealth = 20; // Starting base health
  const levelBonus = level * 3; // 3 HP per level (unchanged - balanced with enemy scaling)
  const constitutionBonus = effectiveStats.constitution * 3; // Reduced from 5 to 3 HP per constitution point
  const maxHealth = Math.floor(baseHealth + levelBonus + constitutionBonus);
  const health = character.currentHealth || maxHealth;

  // BALANCED DAMAGE CALCULATION FOR LEVEL 1-99 PROGRESSION
  // Reduced multipliers to work with new stat point economy
  
  // "Stat damage" is the portion of damage that comes purely from character stats (STR/INT, level, etc.)
  // and global modifiers like magicDamageBonus. Weapon damage will be added per-attack later.
  let statDamage = 0;
  let magicDamageBonus = 0;

  // Check if using a magic weapon
  const isMagicWeapon = weaponConfig.attacks.some(attack => attack.weapon?.isMagicWeapon);
  
  if (isMagicWeapon) {
    // Magic weapons scale with intelligence
    const intelligenceDamage = Math.floor(effectiveStats.intelligence * 0.05); // Further reduced scaling for INT
    statDamage = intelligenceDamage;

    // Add magic damage bonus from offhand book if present (applies to every spell cast)
    if (character.equipment.offHand?.magicDamageBonus) {
      magicDamageBonus = character.equipment.offHand.magicDamageBonus;
      statDamage += magicDamageBonus;
    }
  } else {
    // Physical weapons scale with strength
    const strengthDamage = Math.floor(effectiveStats.strength * 0.03);
    statDamage = strengthDamage;
  }

  // Apply level scaling
  const levelScaling = Math.floor(level * 0.2);
  statDamage += levelScaling;

  // Calculate final damage range (80% - 120% of base damage)
  const minDamage = Math.floor(statDamage * 0.8);
  const maxDamage = Math.floor(statDamage * 1.2);

  // Calculate critical hit chance
  // Base crit chance from equipment
  let finalCriticalChance = criticalChance;
  
  // Add dexterity bonus to crit chance
  const dexterityCritBonus = Math.floor(effectiveStats.dexterity * 0.2);
  finalCriticalChance += dexterityCritBonus;

  // Magic weapons get intelligence bonus to crit chance
  if (isMagicWeapon) {
    const intelligenceCritBonus = Math.floor(effectiveStats.intelligence * 0.15);
    finalCriticalChance += intelligenceCritBonus;
  }

  // Cap crit chance at 75%
  finalCriticalChance = Math.min(finalCriticalChance, 75);

  // Calculate dodge chance
  const baseDodgeChance = dodgeChance || 0;
  const speedDodgeBonus = Math.floor(effectiveStats.speed * 0.3);
  const dexterityDodgeBonus = Math.floor(effectiveStats.dexterity * 0.2);
  let finalDodgeChance = baseDodgeChance + speedDodgeBonus + dexterityDodgeBonus;

  // Cap dodge at 60%
  finalDodgeChance = Math.min(finalDodgeChance, 60);

  // Calculate accuracy
  const baseAccuracy = 85; // Base 85% accuracy
  const dexterityAccuracyBonus = Math.floor(effectiveStats.dexterity * 0.3);
  let finalAccuracy = baseAccuracy + dexterityAccuracyBonus + accuracyBonus;

  // Magic weapons get intelligence bonus to accuracy
  if (isMagicWeapon) {
    const intelligenceAccuracyBonus = Math.floor(effectiveStats.intelligence * 0.2);
    finalAccuracy += intelligenceAccuracyBonus;
  }

  // Cap accuracy at 95%
  finalAccuracy = Math.min(finalAccuracy, 95);

  // Apply global weapon damage scaling to tone down weapon power
  weaponDamage = Math.floor(weaponDamage * 0.7);

  return {
    health,
    maxHealth,
    damage: statDamage,
    minDamage,
    maxDamage,
    armor,
    accuracy: finalAccuracy,
    dodge: finalDodgeChance,
    criticalChance: finalCriticalChance,
    speed: effectiveStats.speed,
    isMagicWeapon,
    magicDamageBonus
  };
};

// IMPROVED DAMAGE CALCULATION with shield blocking
const calculateDamage = (
  baseDamage: number,
  minDamage: number,
  maxDamage: number,
  armor: number,
  defenderHasShield: boolean,
  defenderShieldBlockChance: number,
  defenderShieldBlockAmount: number,
  isMagicWeapon: boolean
): { damage: number; wasBlocked: boolean } => {
  // Check for shield block first (defender's shield blocks incoming damage)
  if (defenderHasShield && Math.random() * 100 < defenderShieldBlockChance) {
    const blockedDamage = Math.max(0, baseDamage - defenderShieldBlockAmount);
    return { damage: blockedDamage, wasBlocked: true };
  }

  // Calculate random damage within range
  const rawDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

  // Magic weapons ignore a portion of armor
  let effectiveArmor = armor;
  if (isMagicWeapon) {
    effectiveArmor = Math.floor(armor * 0.7); // Magic weapons ignore 30% of armor
  }

  // Apply armor reduction
  const damageReduction = Math.min(0.75, effectiveArmor / 100); // Cap damage reduction at 75%
  const finalDamage = Math.max(1, Math.floor(rawDamage * (1 - damageReduction)));

  return { damage: finalDamage, wasBlocked: false };
};

// IMPROVED HIT CALCULATION with better accuracy vs dodge interaction
const checkHit = (accuracy: number, dodgeChance: number): boolean => {
  // More sophisticated accuracy vs dodge calculation
  // Uses multiplicative interaction instead of simple subtraction
  const hitChance = accuracy * (1 - (dodgeChance / 100));
  return Math.random() * 100 < Math.max(5, hitChance); // Minimum 5% hit chance
};

// IMPROVED CRITICAL HIT CALCULATION with better speed scaling
const checkCritical = (criticalChance: number, attackerSpeed: number, defenderSpeed: number): boolean => {
  // Speed advantage gives scaling crit bonus (up to 8% bonus)
  const speedDifference = attackerSpeed - defenderSpeed;
  const speedBonus = Math.max(0, Math.min(8, speedDifference * 0.15));
  const effectiveCritChance = criticalChance + speedBonus;
  return Math.random() * 100 < effectiveCritChance;
};

// Generate detailed combat description with weapon names
const generateCombatDescription = (
  attacker: Character,
  defender: Character,
  action: CombatAction,
  damage: number,
  isCritical: boolean,
  weaponName: string,
  wasBlocked: boolean = false,
  isMagicWeapon: boolean = false
): string => {
  const attackerName = attacker.name;
  const defenderName = defender.name;

  // Get weapon display name
  const displayWeapon = weaponName || 'weapon';

  switch (action) {
    case 'miss':
      return `${attackerName} misses their attack with ${displayWeapon}!`;
    case 'dodge':
      return `${defenderName} dodges ${attackerName}'s attack!`;
    case 'critical':
      if (isMagicWeapon) {
        return wasBlocked
          ? `${attackerName} casts a powerful spell with their ${displayWeapon}, but ${defenderName}'s shield partially blocks it for ${damage} damage!`
          : `${attackerName} casts a devastating spell with their ${displayWeapon} for ${damage} critical damage!`;
      } else {
        return wasBlocked
          ? `${attackerName} lands a critical hit with their ${displayWeapon}, but ${defenderName}'s shield reduces it to ${damage} damage!`
          : `${attackerName} lands a critical hit with their ${displayWeapon} for ${damage} damage!`;
      }
    case 'attack':
      if (isMagicWeapon) {
        return wasBlocked
          ? `${attackerName} casts a spell with their ${displayWeapon}, but ${defenderName}'s shield partially blocks it for ${damage} damage!`
          : `${attackerName} casts a spell with their ${displayWeapon} for ${damage} damage!`;
      } else {
        return wasBlocked
          ? `${attackerName} strikes with their ${displayWeapon}, but ${defenderName}'s shield reduces it to ${damage} damage!`
          : `${attackerName} strikes with their ${displayWeapon} for ${damage} damage!`;
      }
    default:
      return `${attackerName} attacks ${defenderName} for ${damage} damage.`;
  }
};

// Execute a single combat round with multiple weapon attacks
const executeCombatRound = (
  roundNumber: number,
  attacker: Character,
  defender: Character,
  attackerStats: CombatStats,
  defenderStats: CombatStats
): CombatRound[] => {
  const rounds: CombatRound[] = [];
  const attackerWeaponConfig = getWeaponConfiguration(attacker);
  const defenderWeaponConfig = getWeaponConfiguration(defender);

  // Process each attack in the weapon configuration
  for (const attack of attackerWeaponConfig.attacks) {
    // Check if attack hits
    if (!checkHit(attackerStats.accuracy, defenderStats.dodge)) {
      rounds.push({
        roundNumber,
        attacker,
        defender,
        action: 'miss',
        damage: 0,
        isCritical: false,
        isDodged: true,
        attackerHealthBefore: attacker.currentHealth,
        attackerHealthAfter: attacker.currentHealth,
        defenderHealthBefore: defender.currentHealth,
        defenderHealthAfter: defender.currentHealth,
        description: generateCombatDescription(attacker, defender, 'miss', 0, false, attack.weaponName)
      });
      continue;
    }

    // Check for critical hit
    const isCritical = checkCritical(attackerStats.criticalChance, attackerStats.speed, defenderStats.speed);

    // Include any weapon-specific magic damage bonus (for staves/books that carry extra spell power)
    const weaponMagicBonus = attack.weapon?.magicDamageBonus || 0;
    const attackBaseDamage = attackerStats.damage + attack.damage + weaponMagicBonus;
    const attackMinDamage = Math.floor(attackBaseDamage * 0.8);
    const attackMaxDamage = Math.floor(attackBaseDamage * 1.2);

    let { damage, wasBlocked } = calculateDamage(
      attackBaseDamage,
      attackMinDamage,
      attackMaxDamage,
      defenderStats.armor,
      defenderWeaponConfig.hasShield,
      defenderWeaponConfig.shieldBlockChance,
      defenderWeaponConfig.shieldBlockAmount,
      attackerStats.isMagicWeapon
    );

    // Apply critical hit multiplier
    if (isCritical) {
      damage = Math.floor(damage * 2);
    }

    // Update health values
    const defenderHealthBefore = defender.currentHealth;
    defender.currentHealth = Math.max(0, defender.currentHealth - damage);
    const defenderHealthAfter = defender.currentHealth;

    // Sync defender's stats health so simulateCombat can detect defeat
    defenderStats.health = defender.currentHealth;

    // Create combat round
    rounds.push({
      roundNumber,
      attacker,
      defender,
      action: isCritical ? 'critical' : 'attack',
      damage,
      isCritical,
      isDodged: false,
      attackerHealthBefore: attacker.currentHealth,
      attackerHealthAfter: attacker.currentHealth,
      defenderHealthBefore,
      defenderHealthAfter,
      description: generateCombatDescription(attacker, defender, isCritical ? 'critical' : 'attack', damage, isCritical, attack.weaponName, wasBlocked, attackerStats.isMagicWeapon)
    });

    // Check if defender is defeated
    if (defender.currentHealth <= 0) {
      break;
    }
  }

  return rounds;
};

// Speed-based turn queue system
interface TurnQueueEntry {
  character: Character;
  stats: CombatStats;
  nextTurnTime: number;
}

// Calculate turn delay based on speed (lower is faster)
const calculateTurnDelay = (speed: number): number => {
  // Base turn time of 1000, reduced by speed
  // Higher speed = lower delay = more frequent turns
  const baseDelay = 1000;
  const speedReduction = Math.min(speed * 8, 800); // Cap speed reduction at 800
  return Math.max(200, baseDelay - speedReduction); // Minimum delay of 200
};

// Main combat simulation function with speed-based turn frequency
export const simulateCombat = (char1: Character, char2: Character): CombatResult => {
  const startTime = Date.now();

  // Calculate combat stats for both characters
  const char1Stats = calculateCombatStats(char1);
  const char2Stats = calculateCombatStats(char2);

  // Initialize turn queue with both characters
  const turnQueue: TurnQueueEntry[] = [
    {
      character: char1,
      stats: char1Stats,
      nextTurnTime: 0 // Both start immediately
    },
    {
      character: char2,
      stats: char2Stats,
      nextTurnTime: 0
    }
  ];

  const rounds: CombatRound[] = [];
  let currentTime = 0;
  let roundNumber = 1;
  const maxRounds = 200; // Increased limit due to more frequent turns
  const maxCombatTime = 20000; // 20 second time limit to prevent infinite loops

  // Combat loop with speed-based turn system
  while (char1Stats.health > 0 && char2Stats.health > 0 && roundNumber <= maxRounds && currentTime < maxCombatTime) {
    // Find the character whose turn it is (lowest nextTurnTime)
    turnQueue.sort((a, b) => a.nextTurnTime - b.nextTurnTime);
    const currentEntry = turnQueue[0];
    const otherEntry = turnQueue[1];

    // Advance time to current turn
    currentTime = currentEntry.nextTurnTime;

    // Execute the current character's turn
    const roundResults = executeCombatRound(
      roundNumber,
      currentEntry.character,
      otherEntry.character,
      currentEntry.stats,
      otherEntry.stats
    );

    rounds.push(...roundResults);

    // Check if defender is defeated
    if (otherEntry.stats.health <= 0) {
      break;
    }

    // Schedule next turn for this character based on their speed
    const turnDelay = calculateTurnDelay(currentEntry.stats.speed);
    currentEntry.nextTurnTime = currentTime + turnDelay;

    roundNumber++;
  }

  // Determine winner and loser
  const char1Won = char1Stats.health > 0;
  const winner = char1Won ? char1 : char2;
  const loser = char1Won ? char2 : char1;

  // Calculate rewards
  const levelDifference = winner.level - loser.level;
  const baseExperience = 50 + (loser.level * 10);
  const experienceMultiplier = Math.max(0.5, 1 - (levelDifference * 0.1)); // Reduced XP for fighting lower levels
  const experienceGained = Math.floor(baseExperience * experienceMultiplier);

  const baseGold = 20 + (loser.level * 5);
  const goldGained = Math.floor(baseGold * experienceMultiplier);

  // Generate loot drops
  const lootDrops = generateLootDrops(winner, loser);

  const endTime = Date.now();

  return {
    id: `combat_${startTime}_${Math.random().toString(36).substr(2, 9)}`,
    attacker: char1,
    defender: char2,
    winner,
    loser,
    rounds,
    experienceGained,
    goldGained,
    lootDrops, // Add loot drops to combat result
    timestamp: startTime,
    duration: endTime - startTime
  };
};

// Generate loot drops based on winner and loser levels and stats
const generateLootDrops = (winner: Character, loser: Character): Item[] => {
  const drops: Item[] = [];
  const levelDifference = winner.level - loser.level;

  // Base drop chances for each rarity
  const dropChances = {
    common: 0.35,      // 35% chance
    uncommon: 0.25,    // 25% chance
    rare: 0.15,        // 15% chance
    epic: 0.05,        // 5% chance
    legendary: 0.01    // 1% chance
  };

  // Level requirements for each rarity
  const levelRequirements = {
    common: 1,
    uncommon: 5,
    rare: 10,
    epic: 20,
    legendary: 30
  };

  // Adjust drop chances based on level difference
  const adjustedDropChances = { ...dropChances };
  if (levelDifference > 0) {
    // Reduce chances when fighting lower level enemies
    Object.keys(adjustedDropChances).forEach(rarity => {
      adjustedDropChances[rarity as ItemRarity] *= Math.max(0.5, 1 - (levelDifference * 0.1));
    });
  } else if (levelDifference < 0) {
    // Increase chances when fighting higher level enemies
    Object.keys(adjustedDropChances).forEach(rarity => {
      adjustedDropChances[rarity as ItemRarity] *= Math.min(2, 1 + (Math.abs(levelDifference) * 0.1));
    });
  }

  // Try to drop items of each rarity
  Object.entries(adjustedDropChances).forEach(([rarity, chance]) => {
    if (loser.level >= levelRequirements[rarity as ItemRarity] && Math.random() < chance) {
      // Filter base items by rarity
      const availableItems = baseItems.filter(item => 
        item.rarity === rarity
      );

      if (availableItems.length > 0) {
        // Pick a random item from available ones
        const baseItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        
        // Generate item with level close to loser's level
        const itemLevel = Math.max(1, loser.level + Math.floor(Math.random() * 3) - 1);
        const generatedItem = generateItem(baseItem, itemLevel);
        
        drops.push(generatedItem);
      }
    }
  });

  return drops;
};

// Calculate experience required for next level
export const getExperienceForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Check if character can level up
export const canLevelUp = (character: Character): boolean => {
  const requiredExp = getExperienceForLevel(character.level + 1);
  return character.experience >= requiredExp;
};

// Level up character with manual stat distribution
export const levelUpCharacter = (character: Character): Character => {
  if (!canLevelUp(character)) return character;

  const requiredExp = getExperienceForLevel(character.level + 1);
  const newCharacter = { ...character };

  newCharacter.level += 1;
  newCharacter.experience -= requiredExp;

  // BALANCED STAT POINT ECONOMY FOR LEVEL 1-99 PROGRESSION
  // Dramatically reduced from old system (5+ points per level)
  let statPointsToAdd = 0;
  
  if (newCharacter.level <= 20) {
    statPointsToAdd = 2; // 2 points per level for early game (levels 2-20)
  } else if (newCharacter.level <= 50) {
    statPointsToAdd = 1; // 1 point per level for mid game (levels 21-50)
  } else {
    // Late game: 1 point per level + bonus every 5 levels (levels 51-99)
    statPointsToAdd = 1;
    if (newCharacter.level % 5 === 0) {
      statPointsToAdd += 1; // Bonus point every 5 levels
    }
  }
  
  newCharacter.unspentStatPoints += statPointsToAdd;

  // Recalculate max health based on new level and current constitution
  // Use same formula as calculateCombatStats: 20 + (level * 3) + (constitution * 3)
  const effectiveConstitution = applyDiminishingReturns(newCharacter.stats.constitution);
  const baseHealth = 20;
  const levelBonus = newCharacter.level * 3;
  const constitutionBonus = effectiveConstitution * 3; // Updated to match new formula
  const newMaxHealth = Math.floor(baseHealth + levelBonus + constitutionBonus);
  const healthIncrease = newMaxHealth - newCharacter.maxHealth;

  // Update max health and add the health increase to current health
  newCharacter.maxHealth = newMaxHealth;
  newCharacter.currentHealth = Math.min(newMaxHealth, newCharacter.currentHealth + healthIncrease);

  return newCharacter;
};

// Manually distribute a stat point with stat caps
export const spendStatPoint = (character: Character, statType: keyof CharacterStats): Character => {
  if (character.unspentStatPoints <= 0) return character;
  
  // STAT CAPS: Maximum 99 in any stat (like RuneScape)
  if (character.stats[statType] >= 99) {
    return character; // Can't increase stat beyond 99
  }

  const newCharacter = { ...character };
  newCharacter.stats[statType] += 1;
  newCharacter.unspentStatPoints -= 1;

  // If constitution was increased, recalculate max health
  if (statType === 'constitution') {
    // Use same formula as calculateCombatStats: 20 + (level * 3) + (constitution * 3)
    const effectiveConstitution = applyDiminishingReturns(newCharacter.stats.constitution);
    const baseHealth = 20;
    const levelBonus = newCharacter.level * 3;
    const constitutionBonus = effectiveConstitution * 3; // Updated to match new formula
    const newMaxHealth = Math.floor(baseHealth + levelBonus + constitutionBonus);
    const healthIncrease = newMaxHealth - newCharacter.maxHealth;

    // Update max health and add the health increase to current health
    newCharacter.maxHealth = newMaxHealth;
    newCharacter.currentHealth = Math.min(newMaxHealth, newCharacter.currentHealth + healthIncrease);
  }

  return newCharacter;
};

// Generate AI opponent based on player level
export const generateAIOpponent = (playerLevel: number): Character => {
  const level = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1); // ±1 level variance

  // Random class
  const classes = ['warrior', 'rogue', 'mage', 'paladin', 'berserker', 'archer'];
  const classId = classes[Math.floor(Math.random() * classes.length)];

  // Generate random name
  const names = [
    'Grimjaw', 'Shadowbane', 'Ironwill', 'Swiftblade', 'Stormcaller',
    'Bloodfist', 'Nightwhisper', 'Flameheart', 'Icevein', 'Thornspike',
    'Voidwalker', 'Sunbringer', 'Darkbane', 'Steelclaw', 'Mistral'
  ];
  const name = names[Math.floor(Math.random() * names.length)];

  // Scale stats based on level
  const baseStats = { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, speed: 10 };
  const statIncrease = (level - 1) * 3;
  const finalStats = {
    strength: baseStats.strength + statIncrease,
    dexterity: baseStats.dexterity + statIncrease,
    constitution: baseStats.constitution + statIncrease,
    intelligence: baseStats.intelligence + statIncrease,
    speed: baseStats.speed + statIncrease
  };

  // Calculate health based on constitution and level
  // Use same formula as calculateCombatStats: 20 + (level * 3) + (constitution * 3)
  const effectiveConstitution = applyDiminishingReturns(finalStats.constitution);
  const baseHealth = 20;
  const levelBonus = level * 3;
  const constitutionBonus = effectiveConstitution * 3; // Updated to match new formula
  const maxHealth = Math.floor(baseHealth + levelBonus + constitutionBonus);

  // Create base character
  const character: Character = {
    id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    class: { id: classId, name: classId, description: '', startingStats: baseStats, statGrowth: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, speed: 1 }, primaryStat: 'strength' },
    level,
    experience: 0,
    gold: Math.floor(Math.random() * 100) + 50,
    energy: 100,
    maxEnergy: 100,
    stats: finalStats,
    currentHealth: maxHealth,
    maxHealth: maxHealth,
    unspentStatPoints: 0, // AI doesn't need unspent points
    equipment: {},
    inventory: [], // AI doesn't need inventory
    wins: Math.floor(Math.random() * level * 5),
    losses: Math.floor(Math.random() * level * 3),
    activeQuests: [],
    completedQuests: [],
    activeGemEffects: [], // AI characters start with no gem effects
    createdAt: Date.now(),
    lastActive: Date.now()
  };

  return character;
};

// Helper function to get readable combat stats for display
export const getCombatStatsDisplay = (character: Character) => {
  const stats = calculateCombatStats(character);
  const config = getWeaponConfiguration(character);
  
  let combatStyleText = '';
  if (config.attacks.length > 1) {
    combatStyleText = `Dual-wielding (${config.attacks.map(a => a.weaponName).join(' + ')})`;
  } else if (config.attacks.length === 1 && config.attacks[0].weapon?.handedness === 'two-handed') {
    combatStyleText = `Two-handed (${config.attacks[0].weaponName})`;
  } else if (config.hasShield) {
    combatStyleText = `Weapon + Shield (${config.shieldBlockChance}% block)`;
  } else {
    combatStyleText = `Single weapon (${config.attacks[0]?.weaponName || 'unarmed'})`;
  }

  return {
    health: `${character.currentHealth}/${stats.maxHealth}`,
    damage: `${stats.damage}`,
    armor: `${stats.armor}`,
    accuracy: `${stats.accuracy}%`,
    dodge: `${stats.dodge}%`,
    critical: `${stats.criticalChance}%`,
    speed: `${stats.speed}`,
    combatStyle: combatStyleText
  };
};

// Consume a gem and apply its effects to the character
export const consumeGem = (character: Character, gem: any): Character => {
  if (gem.type !== 'gem') {
    throw new Error('Item is not a gem');
  }

  const newGemEffect: ActiveGemEffect = {
    gemName: gem.name,
    gemType: gem.gemType,
    gemTier: gem.gemTier,
    statBonus: gem.consumeEffect.statBonus,
    experienceBonus: gem.consumeEffect.experienceBonus,
    goldBonus: gem.consumeEffect.goldBonus,
    battlesRemaining: gem.consumeEffect.duration,
    description: gem.consumeEffect.description,
    appliedAt: Date.now()
  };

  return {
    ...character,
    activeGemEffects: [...(character.activeGemEffects || []), newGemEffect],
    inventory: character.inventory.filter(item => item.id !== gem.id)
  };
};

// Reduce gem effect durations after combat
export const updateGemEffectsAfterCombat = (character: Character): Character => {
  const updatedEffects = (character.activeGemEffects || [])
    .map(effect => ({
      ...effect,
      battlesRemaining: effect.battlesRemaining - 1
    }))
    .filter(effect => effect.battlesRemaining > 0);

  return {
    ...character,
    activeGemEffects: updatedEffects
  };
};

// Get active gem effects summary for display
export const getActiveGemEffectsSummary = (character: Character): string[] => {
  if (!character.activeGemEffects || character.activeGemEffects.length === 0) {
    return [];
  }

  return character.activeGemEffects.map(effect => 
    `${effect.gemName}: ${effect.description} (${effect.battlesRemaining} battles left)`
  );
};

// NEW: Calculate equipment bonuses breakdown for visual display
export const calculateEquipmentBonuses = (character: Character) => {
  const baseStats = { ...character.stats };
  let equipmentStats = { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, speed: 0 };
  let equipmentArmor = 0;
  let equipmentDamage = 0;
  let equipmentCritical = 0;
  let equipmentDodge = 0;
  let equipmentBlockChance = 0;

  // Calculate equipment bonuses
  Object.values(character.equipment).forEach(item => {
    if (!item) return;

    // Add stat bonuses from equipment
    Object.entries(item.statBonus).forEach(([stat, bonus]) => {
      if (typeof bonus === 'number') {
        equipmentStats[stat as keyof typeof equipmentStats] += bonus;
      }
    });

    // Add direct combat modifiers from equipment
    if (item.armor) equipmentArmor += item.armor;
    if (item.damage) equipmentDamage += item.damage;
    if (item.criticalChance) equipmentCritical += item.criticalChance;
    if (item.dodgeChance) equipmentDodge += item.dodgeChance;
    if (item.blockChance) equipmentBlockChance += item.blockChance;
  });

  // Get shield block chance from weapon configuration
  const weaponConfig = getWeaponConfiguration(character);
  const totalBlockChance = equipmentBlockChance || (weaponConfig.hasShield ? weaponConfig.shieldBlockChance : 0);

  // Calculate total stats (base + equipment)
  const totalStats = {
    strength: baseStats.strength + equipmentStats.strength,
    dexterity: baseStats.dexterity + equipmentStats.dexterity,
    constitution: baseStats.constitution + equipmentStats.constitution,
    intelligence: baseStats.intelligence + equipmentStats.intelligence,
    speed: baseStats.speed + equipmentStats.speed
  };

  return {
    baseStats,
    equipmentStats,
    totalStats,
    equipmentBonuses: {
      armor: equipmentArmor,
      damage: equipmentDamage,
      criticalChance: equipmentCritical,
      dodgeChance: equipmentDodge,
      blockChance: totalBlockChance
    }
  };
};

export const createCharacter = (name: string, characterClass: CharacterClass): Character => {
  return {
    id: generateId(),
    name,
    class: characterClass,
    level: 1,
    experience: 0,
    gold: 100,
    energy: 100,
    maxEnergy: 100,
    stats: { ...characterClass.startingStats },
    unspentStatPoints: 0,
    inventory: [],
    equipment: {
      mainHand: undefined,
      offHand: undefined,
      armor: undefined,
      helmet: undefined,
      boots: undefined,
      accessory: undefined,
    },
    currentHealth: 100,
    maxHealth: 100,
    wins: 0,
    losses: 0,
    activeQuests: [],
    completedQuests: [],
    activeGemEffects: [], // AI characters start with no gem effects
    createdAt: Date.now(),
    lastActive: Date.now(),
  };
}; 