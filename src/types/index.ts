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

  // Active gem effects
  activeGemEffects: ActiveGemEffect[];

  // Creation timestamp
  createdAt: number;
  lastActive: number;

  // Quest system
  activeQuests: QuestProgress[]; // Quests currently in progress
  completedQuests: QuestProgress[]; // Finished quests (claimed or unclaimed)
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

  // Combat modifiers
  damage?: number;
  armor?: number;
  criticalChance?: number;
  dodgeChance?: number;
  blockChance?: number; // Shield block chance percentage
  isMagicWeapon?: boolean; // Whether this weapon scales with intelligence
  magicDamageBonus?: number; // Additional magic damage bonus (for offhand books)

  // Weapon properties
  handedness?: 'one-handed' | 'two-handed';
  weaponSpeed?: number; // Attack speed modifier (higher = faster)

  // Optional durability system (currently unused)
  durability?: number;
  maxDurability?: number;

  description: string;
}

export type ItemType = 'weapon' | 'shield' | 'armor' | 'helmet' | 'boots' | 'accessory' | 'gem' | 'offhand';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type GemType = 'ruby' | 'sapphire' | 'emerald' | 'diamond' | 'opal' | 'citrine' | 'amber';
export type GemTier = 'flawed' | 'normal' | 'greater' | 'perfect' | 'legendary';

export interface Gem extends Omit<Item, 'type'> {
  type: 'gem';
  gemType: GemType;
  gemTier: GemTier;
  consumeEffect: {
    statBonus: Partial<CharacterStats>;
    experienceBonus?: number; // Percentage bonus to experience gain
    goldBonus?: number; // Percentage bonus to gold gain
    duration: number; // number of battles the effect lasts
    description: string;
  };
}

export interface ActiveGemEffect {
  gemName: string;
  gemType: GemType;
  gemTier: GemTier;
  statBonus: Partial<CharacterStats>;
  experienceBonus?: number; // Percentage bonus to experience gain
  goldBonus?: number; // Percentage bonus to gold gain
  battlesRemaining: number;
  description: string;
  appliedAt: number;
}

export interface CombatResult {
  id: string;
  attacker: Character;
  defender: Character;
  winner: Character;
  loser: Character;
  rounds: CombatRound[];
  experienceGained: number;
  goldGained: number;
  lootDrops: Item[];
  timestamp: number;
  duration: number; // in milliseconds
}

export interface DetailedBattleResult {
  id?: string;
  victory: boolean;
  playerName: string;
  playerHealthBefore?: number;
  playerHealthAfter: number;
  playerMaxHealth: number;
  weaponName?: string;
  weaponRarity?: ItemRarity;
  offHandWeaponName?: string;
  offHandWeaponRarity?: ItemRarity;
  combatLog: string[];
  totalRewards: {
    experience: number;
    gold: number;
    items: Item[];
  };
  monstersKilled?: any[];
  timestamp?: number;
  monsterName?: string;
  monsterMaxHealth?: number;
  battleDuration?: number;
  questProgressUpdates?: { questName: string; progress: number; goal: number }[];
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

// Combat calculations
export interface CombatStats {
  health: number;
  maxHealth: number;
  damage: number;
  minDamage: number;
  maxDamage: number;
  armor: number;
  accuracy: number;
  dodge: number;
  criticalChance: number;
  speed: number;
  isMagicWeapon: boolean;
  magicDamageBonus: number;
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

// Quest definitions (static data loaded per map)
export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: 'kill' | 'collect' | 'explore';
  target: string; // e.g., monster id, item id, tile id
  goal: number; // Amount required to complete
  rewards: QuestReward[];
  mapId: string; // Which map this quest belongs to
}

// Runtime quest progress stored on a character
export interface QuestProgress {
  id: string; // Unique ID for this quest instance
  questId: string; // Reference to QuestDefinition.id
  progress: number; // Current amount achieved
  goal: number; // Cached from definition for quick access
  isCompleted: boolean; // Reached goal
  isClaimed: boolean; // Rewards already claimed
  startedAt: number;
  completedAt?: number;
} 