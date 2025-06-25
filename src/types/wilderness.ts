import { Item } from './index';

export interface WildernessTile {
  id: string;
  x: number;
  y: number;
  type: TileType;
  name: string;
  description: string;
  visited: boolean;
  spawnRate: number; // 0-1 chance of spawning monster when entering
  minLevel: number;
  maxLevel: number;
  biome: BiomeType;
  spawnedMonsters: SpawnedMonster[]; // List of monsters currently on this tile
  lastSpawnCheck: number; // Timestamp of last spawn attempt
  // New portal and feature system
  isPortal?: boolean;
  portalDestination?: string; // Map ID to teleport to
  features?: TileFeature[]; // Extensible features for each tile
  npcs?: TileNPC[]; // NPCs on this tile
}

export interface WildernessMap {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  tiles: WildernessTile[][];
  startingPosition: { x: number; y: number };
}

export interface WildernessMonster {
  id: string;
  name: string;
  emoji: string;
  level: number;
  baseStats: {
    health: number;
    damage: number;
    armor: number;
    speed: number;
  };
  biomes: BiomeType[];
  rarity: MonsterRarity;
  lootTable: LootDrop[];
}

export interface SpawnedMonster {
  id: string; // Unique ID for this spawned instance
  monsterId: string; // Reference to base monster
  monster: WildernessMonster; // The actual monster data (scaled)
  tileId: string; // Which tile it's on
  spawnedAt: number; // When it was spawned
  isAlive: boolean; // Whether it can be fought
}

export interface LootDrop {
  itemId?: string; // Legacy support for old system
  item?: Omit<Item, 'id' | 'level' | 'price' | 'durability' | 'maxDurability'>; // Reference to base item template
  gold?: number;
  experience?: number;
  chance: number; // 0-1
}

export interface WildernessEncounter {
  id: string;
  spawnedMonsterId: string; // Reference to spawned monster
  monster: WildernessMonster;
  tile: WildernessTile;
  timestamp: number;
  resolved: boolean;
  outcome?: 'victory' | 'defeat' | 'fled';
  rewards?: {
    experience: number;
    gold: number;
    items: string[];
  };
}

export interface PlayerPosition {
  x: number;
  y: number;
  mapId: string;
  lastMoved: number;
}

export type TileType =
  | 'grass'
  | 'forest'
  | 'mountain'
  | 'water'
  | 'cave'
  | 'ruins'
  | 'village'
  | 'road'
  | 'portal'
  | 'merchant'; // New merchant tile type

export type BiomeType =
  | 'plains'
  | 'forest'
  | 'mountains'
  | 'swamp'
  | 'desert'
  | 'tundra'
  | 'underground'
  | 'volcanic';

export type MonsterRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'elite'
  | 'boss';

export interface WildernessState {
  currentMap: WildernessMap;
  playerPosition: PlayerPosition;
  encounters: WildernessEncounter[];
  exploredTiles: Set<string>;
  activeEncounter?: WildernessEncounter;
}

// Extensible tile feature system
export interface TileFeature {
  id: string;
  type: TileFeatureType;
  name: string;
  description: string;
  isActive: boolean;
  data?: any; // Flexible data for different feature types
}

export interface TileNPC {
  id: string;
  name: string;
  type: NPCType;
  dialogue: string[];
  services?: NPCService[];
}

export interface NPCService {
  id: string;
  name: string;
  type: 'shop' | 'heal' | 'quest' | 'portal';
  cost?: number;
  data?: any;
}

export type TileFeatureType =
  | 'portal'
  | 'shop'
  | 'shrine'
  | 'treasure'
  | 'trap'
  | 'resource'
  | 'quest_marker'
  | 'rest_area';

export type NPCType =
  | 'merchant'
  | 'healer'
  | 'guard'
  | 'quest_giver'
  | 'portal_keeper'
  | 'villager'; 