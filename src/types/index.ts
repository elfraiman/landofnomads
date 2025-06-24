// Core game types for Auto-Battler RPG

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  gold: number;
  energy: number;
  maxEnergy: number;

  // Core stats
  stats: CharacterStats;

  // Health system
  currentHealth: number;
  maxHealth: number;

  // Unspent stat points from leveling up
  unspentStatPoints: number;

  // Equipment
  equipment: Equipment;

  // Inventory for storing items
  inventory: Item[];

  // Combat records
  wins: number;
  losses: number;

  // Clan membership
  clanId?: string;

  // Training cooldowns
  lastTraining: Record<StatType, number>;

  // Creation timestamp
  createdAt: number;
  lastActive: number;
}

export interface CharacterStats {
  strength: number;      // Increases physical damage
  dexterity: number;     // Increases accuracy and dodge chance
  constitution: number;  // Increases health and health regen
  intelligence: number;  // Increases mana and magic damage
  speed: number;         // Determines turn order in combat
}

export type StatType = keyof CharacterStats;

export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  startingStats: CharacterStats;
  statGrowth: CharacterStats; // Multipliers for stat training
  primaryStat: StatType;
}

export interface Equipment {
  mainHand?: Item;
  offHand?: Item;
  armor?: Item;
  helmet?: Item;
  boots?: Item;
  accessory?: Item;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  level: number;
  price: number;

  // Stat modifiers
  statBonus: Partial<CharacterStats>;

  // Special properties
  durability: number;
  maxDurability: number;

  // Combat modifiers
  damage?: number;
  armor?: number;
  criticalChance?: number;
  dodgeChance?: number;

  // Weapon properties
  handedness?: 'one-handed' | 'two-handed';
  weaponSpeed?: number; // Attack speed modifier (higher = faster)

  description: string;
}

export type ItemType = 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface CombatResult {
  id: string;
  attacker: Character;
  defender: Character;
  winner: Character;
  loser: Character;
  rounds: CombatRound[];
  experienceGained: number;
  goldGained: number;
  timestamp: number;
  duration: number; // in milliseconds
}

export interface DetailedBattleResult {
  id: string;
  playerName: string;
  playerHealthBefore: number;
  playerHealthAfter: number;
  playerMaxHealth: number;
  victory: boolean;
  monstersKilled: {
    name: string;
    level: number;
    emoji: string;
    experience: number;
    gold: number;
  }[];
  totalRewards: {
    experience: number;
    gold: number;
    items: string[];
  };
  combatLog: string[];
  timestamp: number;
  battleDuration: number;
}

export interface CombatRound {
  roundNumber: number;
  attacker: Character;
  defender: Character;
  action: CombatAction;
  damage: number;
  isCritical: boolean;
  isDodged: boolean;
  attackerHealthBefore: number;
  attackerHealthAfter: number;
  defenderHealthBefore: number;
  defenderHealthAfter: number;
  description: string;
}

export type CombatAction = 'attack' | 'critical' | 'dodge' | 'miss';

export interface Clan {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: string[]; // Character IDs
  level: number;
  experience: number;
  createdAt: number;

  // Clan benefits
  bonuses: ClanBonuses;
}

export interface ClanBonuses {
  experienceMultiplier: number;
  goldMultiplier: number;
  trainingSpeedMultiplier: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  isDaily: boolean;
  isCompleted: boolean;
  completedAt?: number;
}

export interface QuestRequirement {
  type: 'level' | 'wins' | 'stat' | 'gold' | 'item';
  target: string | number;
  current: number;
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'energy';
  amount: number;
  itemId?: string;
}

export interface Leaderboard {
  type: 'level' | 'wins' | 'winRate' | 'gold';
  entries: LeaderboardEntry[];
  lastUpdated: number;
}

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  value: number;
  clanName?: string;
}

export interface GameState {
  currentCharacter?: Character;
  characters: Character[];
  clans: Clan[];
  combatHistory: CombatResult[];
  quests: Quest[];
  leaderboards: Record<string, Leaderboard>;

  // Game settings
  settings: GameSettings;

  // Time tracking
  lastSave: number;
  gameStarted: number;
}

export interface GameSettings {
  autoSave: boolean;
  combatSpeed: number;
  soundEnabled: boolean;
  notifications: boolean;
}

// Training system
export interface TrainingResult {
  statType: StatType;
  oldValue: number;
  newValue: number;
  energyCost: number;
  goldCost: number;
  success: boolean;
  criticalSuccess: boolean;
}

// Combat calculations
export interface CombatStats {
  health: number;
  maxHealth: number;
  damage: number;
  armor: number;
  accuracy: number;
  dodge: number;
  criticalChance: number;
  speed: number;
}

// Shop system
export interface ShopItem {
  item: Item;
  stock: number;
  refreshTime?: number;
}

export interface Shop {
  items: ShopItem[];
  lastRefresh: number;
  refreshCooldown: number;
}

// Battle queue system
export interface BattleQueue {
  characterId: string;
  targetId?: string; // If null, matches against random opponent
  queueTime: number;
  battleType: 'ranked' | 'casual' | 'clan';
}

// Notification system
export interface GameNotification {
  id: string;
  type: 'combat' | 'training' | 'quest' | 'clan' | 'achievement';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

// Re-export wilderness types
export * from './wilderness'; 