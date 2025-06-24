import { Character, CombatResult, CombatRound, CombatStats, CombatAction, CharacterStats } from '../types';

// Calculate effective combat stats from character stats and equipment
export const calculateCombatStats = (character: Character): CombatStats => {
  const { stats, equipment, level } = character;

  // Base stats from character
  let effectiveStats = { ...stats };
  let armor = 0;
  let weaponDamage = 0;
  let criticalChance = 0;
  let dodgeChance = 0;
  let accuracyBonus = 0;

  // Apply equipment bonuses
  Object.values(equipment).forEach(item => {
    if (!item) return;

    // Add stat bonuses from equipment
    Object.entries(item.statBonus).forEach(([stat, bonus]) => {
      if (typeof bonus === 'number') {
        effectiveStats[stat as keyof typeof effectiveStats] += bonus;
      }
    });

    // Add direct combat modifiers from equipment
    if (item.armor) armor += item.armor;
    if (item.damage) weaponDamage += item.damage;
    if (item.criticalChance) criticalChance += item.criticalChance;
    if (item.dodgeChance) dodgeChance += item.dodgeChance;
  });

  // DUAL-WIELDING MECHANICS
  const { mainHand, offHand } = equipment;
  let dualWieldBonus = 0;
  let weaponSpeedModifier = 0;

  if (mainHand && mainHand.type === 'weapon') {
    weaponSpeedModifier += mainHand.weaponSpeed || 5;

    // Check for dual-wielding
    if (offHand && offHand.type === 'weapon' &&
      mainHand.handedness === 'one-handed' && offHand.handedness === 'one-handed') {

      // Dual-wield damage: main hand 100% + off hand 50%
      const offHandDamage = Math.floor((offHand.damage || 0) * 0.5);
      dualWieldBonus += offHandDamage;

      // Speed bonus for dual-wielding (average of both weapons + 10%)
      const offHandSpeed = offHand.weaponSpeed || 5;
      weaponSpeedModifier = Math.floor((weaponSpeedModifier + offHandSpeed) * 1.1);

      // Dual-wield crit bonus (5% for having two weapons)
      criticalChance += 5;

    } else if (mainHand.handedness === 'two-handed') {
      // Two-handed weapons get 15% damage bonus
      weaponDamage = Math.floor(weaponDamage * 1.15);

      // But are slower
      weaponSpeedModifier = Math.floor(weaponSpeedModifier * 0.9);
    }
  }

  // Calculate health (base 100 + 5 per constitution + 10 per level)
  const maxHealth = Math.floor(100 + (effectiveStats.constitution * 5) + (level * 10));
  const health = character.currentHealth || maxHealth;

  // IMPROVED DAMAGE CALCULATION
  // Base damage uses square root scaling for better progression
  const strengthDamage = Math.floor(Math.sqrt(effectiveStats.strength * 20) + (effectiveStats.strength * 0.5));
  let baseDamage = strengthDamage + weaponDamage + dualWieldBonus;

  // Intelligence scaling for all characters (not just casters)
  // Uses Path of Exile style "added damage" approach
  const intelligenceDamage = Math.floor(effectiveStats.intelligence * 0.3);
  baseDamage += intelligenceDamage;

  // Level scaling with diminishing returns
  const levelDamage = Math.floor(level * 1.5 + Math.sqrt(level * 10));
  baseDamage += levelDamage;

  // IMPROVED ACCURACY CALCULATION
  // Base accuracy starts at 75%, scales with diminishing returns
  const dexterityAccuracy = Math.floor(Math.sqrt(effectiveStats.dexterity * 25));
  const accuracy = Math.min(95, Math.max(15, 75 + dexterityAccuracy + accuracyBonus));

  // IMPROVED DODGE CALCULATION  
  // Uses square root scaling for better early/late game balance
  const dexterityDodge = Math.floor(Math.sqrt(effectiveStats.dexterity * 8));
  const dodge = Math.min(35, Math.max(0, dexterityDodge + dodgeChance));

  // IMPROVED CRITICAL CHANCE CALCULATION
  // Base 2% + square root scaling + equipment bonuses
  const dexterityCrit = Math.floor(Math.sqrt(effectiveStats.dexterity * 4));
  const critical = Math.min(25, Math.max(2, 2 + dexterityCrit + criticalChance));

  // Speed calculation with better scaling including weapon speed
  const baseSpeed = effectiveStats.speed + Math.floor(level * 0.5) + Math.floor(effectiveStats.dexterity * 0.2);
  const speed = baseSpeed + (weaponSpeedModifier || 0);

  // IMPROVED ARMOR CALCULATION
  // Constitution provides natural armor + equipment armor
  const constitutionArmor = Math.floor(Math.sqrt(effectiveStats.constitution * 10));
  const totalArmor = armor + constitutionArmor;

  return {
    health,
    maxHealth,
    damage: Math.max(1, baseDamage),
    armor: Math.max(0, totalArmor),
    accuracy: accuracy,
    dodge: dodge,
    criticalChance: critical,
    speed: Math.max(1, speed)
  };
};

// IMPROVED DAMAGE CALCULATION with better armor scaling
const calculateDamage = (baseDamage: number, armor: number): number => {
  // Add damage variance (±12% for more consistent combat)
  const variance = 0.88 + (Math.random() * 0.24); // 0.88 to 1.12
  const variableDamage = Math.floor(baseDamage * variance);

  // Improved armor formula inspired by Path of Exile
  // Uses more sophisticated diminishing returns
  const armorEffectiveness = armor / (armor + 12 * Math.sqrt(armor));
  const damageReduction = Math.min(0.75, armorEffectiveness); // Cap at 75% reduction
  const finalDamage = Math.floor(variableDamage * (1 - damageReduction));

  return Math.max(1, finalDamage); // Minimum 1 damage
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

// Generate detailed combat description
const generateCombatDescription = (
  attacker: Character,
  defender: Character,
  action: CombatAction,
  damage: number,
  isCritical: boolean
): string => {
  const attackerName = attacker.name;
  const defenderName = defender.name;

  switch (action) {
    case 'dodge':
      return `${defenderName} nimbly dodges ${attackerName}'s attack!`;
    case 'miss':
      return `${attackerName} swings at ${defenderName} but the attack goes wide!`;
    case 'critical':
      return `${attackerName} finds an opening and delivers a DEVASTATING CRITICAL HIT to ${defenderName} for ${damage} damage!`;
    case 'attack':
      return `${attackerName} strikes ${defenderName} for ${damage} damage.`;
    default:
      return `${attackerName} attacks ${defenderName}.`;
  }
};

// Execute a single combat round
const executeCombatRound = (
  roundNumber: number,
  attacker: Character,
  defender: Character,
  attackerStats: CombatStats,
  defenderStats: CombatStats
): CombatRound => {
  const attackerHealthBefore = attackerStats.health;
  const defenderHealthBefore = defenderStats.health;

  let action: CombatAction = 'attack';
  let damage = 0;
  let isCritical = false;
  let isDodged = false;

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
      let baseDamage = attackerStats.damage;

      // Check for critical hit (includes speed bonus)
      if (checkCritical(attackerStats.criticalChance, attackerStats.speed, defenderStats.speed)) {
        isCritical = true;
        action = 'critical';
        baseDamage = Math.floor(baseDamage * 2.5); // 2.5x damage on crit
      }

      // Apply armor mitigation and damage variance
      damage = calculateDamage(baseDamage, defenderStats.armor);

      // Apply damage to defender
      defenderStats.health = Math.max(0, defenderStats.health - damage);
    }
  }

  const description = generateCombatDescription(attacker, defender, action, damage, isCritical);

  return {
    roundNumber,
    attacker,
    defender,
    action,
    damage,
    isCritical,
    isDodged,
    attackerHealthBefore,
    attackerHealthAfter: attackerStats.health,
    defenderHealthBefore,
    defenderHealthAfter: defenderStats.health,
    description
  };
};

// Main combat simulation function
export const simulateCombat = (char1: Character, char2: Character): CombatResult => {
  const startTime = Date.now();

  // Calculate combat stats for both characters
  const char1Stats = calculateCombatStats(char1);
  const char2Stats = calculateCombatStats(char2);

  // Determine turn order based on speed
  const isChar1First = char1Stats.speed >= char2Stats.speed;
  let currentAttacker = isChar1First ? char1 : char2;
  let currentDefender = isChar1First ? char2 : char1;
  let attackerStats = isChar1First ? char1Stats : char2Stats;
  let defenderStats = isChar1First ? char2Stats : char1Stats;

  const rounds: CombatRound[] = [];
  let roundNumber = 1;
  const maxRounds = 100; // Prevent infinite battles

  // Combat loop
  while (char1Stats.health > 0 && char2Stats.health > 0 && roundNumber <= maxRounds) {
    // Execute attack
    const round = executeCombatRound(
      roundNumber,
      currentAttacker,
      currentDefender,
      attackerStats,
      defenderStats
    );

    rounds.push(round);

    // Check if defender is defeated
    if (defenderStats.health <= 0) {
      break;
    }

    // Switch turns
    [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
    [attackerStats, defenderStats] = [defenderStats, attackerStats];

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

  // Give stat points to distribute manually
  const baseStatPoints = 5; // Base points per level
  const classBonus = Math.floor(newCharacter.level / 5); // Extra point every 5 levels
  newCharacter.unspentStatPoints += baseStatPoints + classBonus;

  // Recalculate max health based on new level and current constitution
  const newMaxHealth = Math.floor(100 + (newCharacter.stats.constitution * 5) + (newCharacter.level * 10));
  const healthIncrease = newMaxHealth - newCharacter.maxHealth;

  // Update max health and add the health increase to current health
  newCharacter.maxHealth = newMaxHealth;
  newCharacter.currentHealth = Math.min(newMaxHealth, newCharacter.currentHealth + healthIncrease);

  return newCharacter;
};

// Manually distribute a stat point
export const spendStatPoint = (character: Character, statType: keyof CharacterStats): Character => {
  if (character.unspentStatPoints <= 0) return character;

  const newCharacter = { ...character };
  newCharacter.stats[statType] += 1;
  newCharacter.unspentStatPoints -= 1;

  // If constitution was increased, recalculate max health
  if (statType === 'constitution') {
    const newMaxHealth = Math.floor(100 + (newCharacter.stats.constitution * 5) + (newCharacter.level * 10));
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
  const maxHealth = Math.floor(100 + (finalStats.constitution * 5) + (level * 10));

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
  return {
    health: `${character.currentHealth}/${stats.maxHealth}`,
    damage: `${stats.damage}`,
    armor: `${stats.armor}`,
    accuracy: `${stats.accuracy}%`,
    dodge: `${stats.dodge}%`,
    critical: `${stats.criticalChance}%`,
    speed: `${stats.speed}`
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
  });

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
      dodgeChance: equipmentDodge
    }
  };
}; 