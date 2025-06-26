import { Character, CombatResult, CombatRound, CombatStats, CombatAction, CharacterStats } from '../types';

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

// Calculate effective combat stats from character stats and equipment
export const calculateCombatStats = (character: Character): CombatStats => {
  const { stats, equipment, level } = character;

  // Base stats from character with diminishing returns applied
  let effectiveStats = {
    strength: applyDiminishingReturns(stats.strength),
    dexterity: applyDiminishingReturns(stats.dexterity),
    constitution: applyDiminishingReturns(stats.constitution),
    intelligence: applyDiminishingReturns(stats.intelligence),
    speed: applyDiminishingReturns(stats.speed)
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
    dualWieldBonus = weaponConfig.attacks.reduce((sum, attack) => sum + attack.damage, 0);
    weaponSpeedModifier = Math.floor(weaponConfig.attacks.reduce((sum, attack) => sum + attack.speed, 0) / weaponConfig.attacks.length * 1.1);
    criticalChance += 3; // Dual-wield crit bonus
  } else if (weaponConfig.attacks.length === 1) {
    const weapon = weaponConfig.attacks[0].weapon;
    if (weapon && weapon.handedness === 'two-handed') {
      // Two-handed weapons get damage bonus but are slower
      weaponDamage = Math.floor(weaponDamage * 1.2);
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
  
  // Primary damage from strength (reduced from 0.15 to 0.08)
  const strengthDamage = Math.floor(effectiveStats.strength * 0.08);
  
  // Weapon damage is the main source (unchanged)
  let baseDamage = strengthDamage + weaponDamage + dualWieldBonus;

  // Intelligence provides minimal damage bonus (reduced from 0.05 to 0.03)
  const intelligenceDamage = Math.floor(effectiveStats.intelligence * 0.03);
  baseDamage += intelligenceDamage;

  // Level provides very small scaling (unchanged - already conservative)
  const levelDamage = Math.floor(level * 0.2);
  baseDamage += levelDamage;

  // BALANCED ACCURACY CALCULATION
  // Reduced scaling to work with new stat system
  const dexterityAccuracy = Math.floor(Math.sqrt(effectiveStats.dexterity * 15)); // Reduced from 25 to 15
  const accuracy = Math.min(95, Math.max(15, 75 + dexterityAccuracy + accuracyBonus));

  // BALANCED DODGE CALCULATION  
  // Reduced scaling for new stat system
  const dexterityDodge = Math.floor(Math.sqrt(effectiveStats.dexterity * 6)); // Reduced from 8 to 6
  const dodge = Math.min(35, Math.max(0, dexterityDodge + dodgeChance));

  // BALANCED CRITICAL CHANCE CALCULATION
  // Reduced scaling for new stat system
  const dexterityCrit = Math.floor(Math.sqrt(effectiveStats.dexterity * 3)); // Reduced from 4 to 3
  const critical = Math.min(25, Math.max(2, 2 + dexterityCrit + criticalChance));

  // BALANCED SPEED CALCULATION FOR LEVEL 1-99 PROGRESSION
  // Reduced multipliers to work with new stat point economy
  let speed = Math.floor(effectiveStats.speed * 0.8); // Reduced from 1.0 to 0.8
  
  // Level provides speed scaling (unchanged - already conservative)
  speed += Math.floor(level * 0.5);
  
  // Dexterity provides speed bonus (reduced from 0.33 to 0.2)
  speed += Math.floor(effectiveStats.dexterity * 0.2);
  
  // Weapon speed modifiers (higher weapon speed = faster turns)
  if (weaponConfig.attacks.length > 1) {
    // Dual-wielding: Average weapon speeds with slight bonus
    const avgWeaponSpeed = weaponConfig.attacks.reduce((sum, attack) => sum + attack.speed, 0) / weaponConfig.attacks.length;
    speed += Math.floor(avgWeaponSpeed * 0.8); // 80% of weapon speed bonus
  } else if (weaponConfig.attacks.length === 1) {
    const weapon = weaponConfig.attacks[0].weapon;
    if (weapon && weapon.handedness === 'two-handed') {
      // Two-handed weapons: Slower but more powerful
      speed += Math.floor((weaponConfig.attacks[0].speed || 5) * 0.6); // 60% of weapon speed
    } else {
      // One-handed weapons: Full weapon speed bonus
      speed += Math.floor((weaponConfig.attacks[0].speed || 5) * 1.0);
    }
  }
  
  // Shield penalty: Shields reduce speed significantly
  if (weaponConfig.hasShield) {
    const { offHand } = equipment;
    if (offHand && offHand.weaponSpeed && offHand.weaponSpeed < 0) {
      speed += offHand.weaponSpeed; // weaponSpeed is negative for shields (penalty)
    } else {
      speed -= 2; // Default shield penalty if not specified
    }
  }
  
  // Ensure minimum speed
  speed = Math.max(1, speed);

  // BALANCED ARMOR CALCULATION
  // Reduced constitution armor scaling for new stat system
  const constitutionArmor = Math.floor(Math.sqrt(effectiveStats.constitution * 8)); // Reduced from 10 to 8
  const totalArmor = armor + constitutionArmor;

  return {
    health,
    maxHealth,
    damage: Math.max(3, baseDamage), // Minimum 3 damage (like RuneScape)
    armor: Math.max(0, totalArmor),
    accuracy: accuracy,
    dodge: dodge,
    criticalChance: critical,
    speed: Math.max(1, speed)
  };
};

// IMPROVED DAMAGE CALCULATION with shield blocking
const calculateDamage = (baseDamage: number, armor: number, hasShield: boolean, shieldBlockChance: number, shieldBlockAmount: number): { damage: number; wasBlocked: boolean } => {
  // Add damage variance (±12% for more consistent combat)
  const variance = 0.88 + (Math.random() * 0.24); // 0.88 to 1.12
  let variableDamage = Math.floor(baseDamage * variance);

  // Check for shield block first
  let wasBlocked = false;
  if (hasShield && Math.random() * 100 < shieldBlockChance) {
    wasBlocked = true;
    variableDamage = Math.max(0, variableDamage - shieldBlockAmount);
  }

  // Then apply armor reduction
  const armorEffectiveness = armor / (armor + 12 * Math.sqrt(armor));
  const damageReduction = Math.min(0.75, armorEffectiveness); // Cap at 75% reduction
  const finalDamage = Math.floor(variableDamage * (1 - damageReduction));

  return { 
    damage: Math.max(1, finalDamage), // Minimum 1 damage after armor/blocking
    wasBlocked 
  };
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
  wasBlocked: boolean = false
): string => {
  const attackerName = attacker.name;
  const defenderName = defender.name;

  let blockText = wasBlocked ? ' (partially blocked by shield)' : '';

  switch (action) {
    case 'dodge':
      return `${defenderName} nimbly dodges ${attackerName}'s ${weaponName}!`;
    case 'miss':
      return `${attackerName} swings their ${weaponName} at ${defenderName} but the attack goes wide!`;
    case 'critical':
      return `${attackerName} finds an opening and delivers a DEVASTATING CRITICAL HIT with their ${weaponName} to ${defenderName} for ${damage} damage${blockText}!`;
    case 'attack':
      return `${attackerName} strikes with their ${weaponName} at ${defenderName} for ${damage} damage${blockText}.`;
    default:
      return `${attackerName} attacks ${defenderName} with their ${weaponName}.`;
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
  const attackerHealthBefore = attackerStats.health;
  const defenderHealthBefore = defenderStats.health;

  const rounds: CombatRound[] = [];
  const attackerConfig = getWeaponConfiguration(attacker);
  const defenderConfig = getWeaponConfiguration(defender);

  let totalDamage = 0;
  let anyHit = false;
  let anyCritical = false;

  // Execute attacks for each weapon
  attackerConfig.attacks.forEach((weaponAttack, attackIndex) => {
    if (defenderStats.health <= 0) return; // Stop if defender is already defeated

    let action: CombatAction = 'attack';
    let damage = 0;
    let isCritical = false;
    let isDodged = false;
    let wasBlocked = false;

    // Check if attack hits first
    if (!checkHit(attackerStats.accuracy, defenderStats.dodge)) {
      action = 'miss';
    } else {
      // Check for dodge (separate from accuracy)
      if (Math.random() * 100 < defenderStats.dodge) {
        action = 'dodge';
        isDodged = true;
      } else {
        // Attack hits, calculate base damage
        let baseDamage = Math.floor(attackerStats.damage * (weaponAttack.damage / Math.max(1, attackerConfig.attacks.reduce((sum, a) => sum + a.damage, 0))));
        baseDamage = Math.max(1, baseDamage + weaponAttack.damage);

        // Check for critical hit (includes speed bonus)
        const totalCritChance = attackerStats.criticalChance + weaponAttack.criticalChance;
        if (checkCritical(totalCritChance, attackerStats.speed, defenderStats.speed)) {
          isCritical = true;
          anyCritical = true;
          action = 'critical';
          baseDamage = Math.floor(baseDamage * 2.5); // 2.5x damage on crit
        }

        // Apply armor mitigation, damage variance, and shield blocking
        const damageResult = calculateDamage(
          baseDamage, 
          defenderStats.armor, 
          defenderConfig.hasShield, 
          defenderConfig.shieldBlockChance, 
          defenderConfig.shieldBlockAmount
        );
        damage = damageResult.damage;
        wasBlocked = damageResult.wasBlocked;

        // Apply damage to defender
        defenderStats.health = Math.max(0, defenderStats.health - damage);
        totalDamage += damage;
        anyHit = true;
      }
    }

    const description = generateCombatDescription(attacker, defender, action, damage, isCritical, weaponAttack.weaponName, wasBlocked);

    // Create combat round for this attack
    rounds.push({
      roundNumber: roundNumber + (attackIndex * 0.1), // Sub-rounds for multiple attacks
      attacker,
      defender,
      action,
      damage,
      isCritical,
      isDodged,
      attackerHealthBefore,
      attackerHealthAfter: attackerStats.health,
      defenderHealthBefore: defenderStats.health - (totalDamage - damage), // Health before this specific attack
      defenderHealthAfter: defenderStats.health,
      description
    });
  });

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
    timestamp: startTime,
    duration: endTime - startTime
  };
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

// Get stat point cost for training (alternative to manual distribution)
export const getTrainingCost = (currentValue: number): { gold: number; energy: number } => {
  const baseCost = Math.floor(50 * Math.pow(1.2, Math.floor(currentValue / 10)));
  return {
    gold: baseCost,
    energy: Math.min(50, Math.floor(baseCost / 2))
  };
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
    lastTraining: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, speed: 0 },
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