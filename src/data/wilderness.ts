import { WildernessMap, WildernessMonster, WildernessTile, TileType, BiomeType, PlayerPosition, SpawnedMonster } from '../types/wilderness';
import { baseItems, generateItem } from './items';
import { Item } from '../types';
import { greenwoodValleyMerchantInventory } from './maps/greenwoodValley';
import { shadowmereSwampsMerchantInventory } from './maps/shadowmereSwamps';
import { crystalCavernsMerchantInventory } from './maps/crystalCaverns';
import { volcanicPeaksMerchantInventory } from './maps/volcanicPeaks';
import { frozenWastesMerchantInventory } from './maps/frozenWastes';

// Import monsters from individual map files
import { greenwoodValleyMonsters } from './maps/greenwoodValley';
import { shadowmereSwampsMonsters } from './maps/shadowmereSwamps';
import { crystalCavernsMonsters } from './maps/crystalCaverns';
import { volcanicPeaksMonsters } from './maps/volcanicPeaks';
import { frozenWastesMonsters } from './maps/frozenWastes';

// Helper function to find items by name from the global items list
const findItemByName = (name: string) => {
  return baseItems.find(item => item.name === name);
};

// Enhanced loot table interface that references actual items
interface LootDrop {
  gold?: number;
  experience?: number;
  item?: typeof baseItems[0]; // Reference to actual item from items.ts
  chance: number; // 0.0 to 1.0
}

// Map configuration interface
interface MapConfig {
  id: string;
  name: string;
  description: string;
  levelRange: { min: number; max: number };
  monsters: WildernessMonster[];
  portalRequirement?: {
    minLevel: number;
    questCompleted?: string;
    bossDefeated?: string;
  };
}

// Map configurations using imported monsters
export const mapConfigs: MapConfig[] = [
  {
    id: 'greenwood_valley',
    name: 'Greenwood Valley',
    description: 'A peaceful forest valley perfect for new adventurers.',
    levelRange: { min: 1, max: 10 },
    monsters: greenwoodValleyMonsters,
  },
  {
    id: 'shadowmere_swamps',
    name: 'Shadowmere Swamps',
    description: 'Dark, treacherous swamps filled with dangerous creatures.',
    levelRange: { min: 8, max: 18 },
    monsters: shadowmereSwampsMonsters,
    portalRequirement: {
      minLevel: 8,
      bossDefeated: 'forest_guardian'
    }
  },
  {
    id: 'crystal_caverns',
    name: 'Crystal Caverns',
    description: 'Underground caverns filled with magical crystals and ancient guardians.',
    levelRange: { min: 15, max: 25 },
    monsters: crystalCavernsMonsters,
    portalRequirement: {
      minLevel: 15,
      bossDefeated: 'hydra'
    }
  },
  {
    id: 'volcanic_peaks',
    name: 'Volcanic Peaks',
    description: 'Scorching mountain peaks where fire elementals roam.',
    levelRange: { min: 22, max: 35 },
    monsters: volcanicPeaksMonsters,
    portalRequirement: {
      minLevel: 22,
      bossDefeated: 'crystal_dragon'
    }
  },
  {
    id: 'frozen_wastes',
    name: 'Frozen Wastes',
    description: 'An endless tundra of ice and snow, home to ancient frost creatures.',
    levelRange: { min: 32, max: 45 },
    monsters: frozenWastesMonsters,
    portalRequirement: {
      minLevel: 32,
      bossDefeated: 'phoenix'
    }
  }
];

// Legacy export for backward compatibility
export const starterMapMonsters = greenwoodValleyMonsters;

// Helper functions
export const getMapById = (mapId: string): MapConfig | undefined => {
  return mapConfigs.find(map => map.id === mapId);
};

export const getNextMap = (currentMapId: string): MapConfig | undefined => {
  const currentIndex = mapConfigs.findIndex(map => map.id === currentMapId);
  return currentIndex !== -1 && currentIndex < mapConfigs.length - 1
    ? mapConfigs[currentIndex + 1]
    : undefined;
};

export const canAccessMap = (mapId: string, playerLevel: number, defeatedBosses: string[]): boolean => {
  const map = getMapById(mapId);
  if (!map || !map.portalRequirement) return true; // First map or no requirements

  const meetsLevelReq = playerLevel >= map.portalRequirement.minLevel;
  const meetsBossReq = !map.portalRequirement.bossDefeated ||
    defeatedBosses.includes(map.portalRequirement.bossDefeated);

  return meetsLevelReq && meetsBossReq;
};

// Helper function to get tile text representation
export const getTileEmoji = (type: TileType): string => {
  const tileMap: Record<TileType, string> = {
    grass: 'G',
    forest: 'F',
    mountain: 'M',
    water: 'W',
    cave: 'C',
    ruins: 'R',
    village: 'V',
    road: 'P',
    portal: 'O',
    merchant: 'S'
  };
  return tileMap[type] || '?';
};

// Helper function to calculate monster level based on distance from start and player level
export const calculateMonsterLevel = (
  playerLevel: number,
  distanceFromStart: number,
  tileMinLevel: number,
  tileMaxLevel: number
): number => {
  // More aggressive level scaling that allows higher level monsters
  // Base level now scales more with distance and player level
  const baseLevel = Math.max(1, Math.floor(playerLevel * 0.8) + Math.floor(distanceFromStart * 0.8));

  // Wider randomness range (±2 levels instead of ±1)
  const randomVariation = Math.floor(Math.random() * 5) - 2; // -2 to +2

  // Calculate target level with more variation
  let targetLevel = baseLevel + randomVariation;

  // For Greenwood Valley specifically, ensure we can spawn up to level 8 monsters
  // If we're in early game (player level 1-10), allow spawning up to level 8
  if (playerLevel <= 10) {
    targetLevel = Math.max(1, Math.min(8, targetLevel));
  } else {
    // Clamp to tile's level range for other areas
    targetLevel = Math.max(tileMinLevel, Math.min(tileMaxLevel, targetLevel));
  }

  return targetLevel;
};

// Helper function to scale monster stats based on level
export const scaleMonsterStats = (monster: WildernessMonster, targetLevel: number) => {
  const levelDiff = targetLevel - monster.level;
  const scaleFactor = 1 + (levelDiff * 0.08); // Reduced from 0.15 to 0.08 (8% increase per level)

  // Additional scaling based on monster rarity for multi-combat balance
  const rarityMultiplier = {
    'common': 0.6,     // Much weaker for grinding (reduced from 0.8)
    'uncommon': 0.7,   // Weaker scaling (reduced from 0.9)
    'rare': 0.8,       // Reduced scaling (reduced from 1.0)
    'elite': 0.9,      // Slightly reduced (reduced from 1.1)
    'boss': 1.0        // Full scaling (reduced from 1.2)
  };

  const finalScaleFactor = Math.max(0.4, scaleFactor * (rarityMultiplier[monster.rarity] || 1.0));

  return {
    ...monster,
    level: targetLevel,
    baseStats: {
      health: Math.max(5, Math.floor(monster.baseStats.health * finalScaleFactor)),
      damage: Math.max(1, Math.floor(monster.baseStats.damage * finalScaleFactor)),
      armor: Math.max(0, Math.floor(monster.baseStats.armor * finalScaleFactor)),
      speed: monster.baseStats.speed // Speed doesn't scale as much
    }
  };
};

// Create the starter map (4x5 grid)
export const createStarterMap = (): WildernessMap => {
  const tiles: WildernessTile[][] = [];

  // Define the map layout
  const mapLayout: { type: TileType; biome: BiomeType; name: string; spawnRate: number }[][] = [
    // Row 0 (Top)
    [
      { type: 'mountain', biome: 'mountains', name: 'Rocky Peak', spawnRate: 0.4 },
      { type: 'mountain', biome: 'mountains', name: 'Stone Cliffs', spawnRate: 0.3 },
      { type: 'cave', biome: 'underground', name: 'Dark Cave', spawnRate: 0.6 },
      { type: 'mountain', biome: 'mountains', name: 'High Ridge', spawnRate: 0.3 }
    ],
    // Row 1
    [
      { type: 'forest', biome: 'forest', name: 'Pine Woods', spawnRate: 0.3 },
      { type: 'forest', biome: 'forest', name: 'Dense Forest', spawnRate: 0.4 },
      { type: 'forest', biome: 'forest', name: 'Ancient Grove', spawnRate: 0.3 },
      { type: 'ruins', biome: 'forest', name: 'Old Ruins', spawnRate: 0.5 }
    ],
    // Row 2 (Starting area)
    [
      { type: 'grass', biome: 'plains', name: 'Green Meadow', spawnRate: 0.2 },
      { type: 'village', biome: 'plains', name: 'Starting Village', spawnRate: 0.0 },
      { type: 'grass', biome: 'plains', name: 'Peaceful Field', spawnRate: 0.2 },
      { type: 'road', biome: 'plains', name: 'Trade Route', spawnRate: 0.1 }
    ],
    // Row 3
    [
      { type: 'grass', biome: 'plains', name: 'Rolling Hills', spawnRate: 0.2 },
      { type: 'forest', biome: 'forest', name: 'Young Forest', spawnRate: 0.3 },
      { type: 'water', biome: 'plains', name: 'Crystal Lake', spawnRate: 0.1 },
      { type: 'grass', biome: 'plains', name: 'Flower Field', spawnRate: 0.2 }
    ],
    // Row 4 (Bottom)
    [
      { type: 'forest', biome: 'forest', name: 'Thick Woods', spawnRate: 0.4 },
      { type: 'forest', biome: 'forest', name: 'Misty Grove', spawnRate: 0.3 },
      { type: 'forest', biome: 'forest', name: 'Shadowy Path', spawnRate: 0.4 },
      { type: 'cave', biome: 'underground', name: 'Hidden Cavern', spawnRate: 0.5 }
    ]
  ];

  // Generate tiles with proper scaling
  for (let y = 0; y < 5; y++) {
    tiles[y] = [];
    for (let x = 0; x < 4; x++) {
      const layout = mapLayout[y][x];
      const distanceFromStart = Math.abs(x - 1) + Math.abs(y - 2); // Distance from village at (1,2)

      // Calculate level range based on distance from start
      const minLevel = Math.max(1, 1 + Math.floor(distanceFromStart / 2));
      const maxLevel = Math.max(minLevel, minLevel + 2 + Math.floor(distanceFromStart / 1.5));

      tiles[y][x] = {
        id: `tile_${x}_${y}`,
        x,
        y,
        type: layout.type,
        name: layout.name,
        description: generateTileDescription(layout.type, layout.name),
        visited: x === 1 && y === 2, // Starting village is visited
        spawnRate: layout.spawnRate,
        minLevel,
        maxLevel,
        biome: layout.biome,
        spawnedMonsters: [], // Start with no spawned monsters
        lastSpawnCheck: 0 // Never checked for spawns
      };
    }
  }

  return {
    id: 'starter_map',
    name: 'Greenwood Valley',
    description: 'A peaceful valley perfect for new adventurers to begin their journey.',
    width: 4,
    height: 5,
    tiles,
    startingPosition: { x: 1, y: 2 } // Village position
  };
};

// Helper function to generate tile descriptions
const generateTileDescription = (type: TileType, name: string): string => {
  const descriptions: Record<TileType, string[]> = {
    grass: [
      'Rolling green fields stretch as far as the eye can see.',
      'Peaceful grasslands dotted with wildflowers.',
      'Open meadows where gentle breezes blow.'
    ],
    forest: [
      'Dense woods filled with ancient trees and mysterious shadows.',
      'A lush forest teeming with wildlife and hidden secrets.',
      'Towering trees create a natural canopy overhead.'
    ],
    mountain: [
      'Rugged peaks that touch the clouds above.',
      'Rocky terrain that challenges even seasoned climbers.',
      'Steep cliffs and narrow mountain paths.'
    ],
    water: [
      'Crystal clear waters reflect the sky above.',
      'A serene body of water perfect for rest and reflection.',
      'Gentle waves lap against the shoreline.'
    ],
    cave: [
      'A dark opening leads deep into the earth.',
      'Mysterious caverns echo with unknown sounds.',
      'Ancient caves that hold secrets of the past.'
    ],
    ruins: [
      'Crumbling structures tell tales of a forgotten age.',
      'Ancient stones covered in moss and mystery.',
      'Remnants of a once-great civilization.'
    ],
    village: [
      'A peaceful settlement where friendly folk reside.',
      'Cozy homes and welcoming faces greet travelers.',
      'A safe haven for rest and resupply.'
    ],
    road: [
      'A well-traveled path connecting distant places.',
      'Stone-paved roads that have seen countless journeys.',
      'A reliable route for merchants and adventurers.'
    ],
    portal: [
      'A swirling vortex of magical energy connects distant realms.',
      'Ancient runes glow around a mystical gateway.',
      'Reality bends and warps around this dimensional portal.'
    ],
    merchant: [
      'A traveling merchant has set up shop here.',
      'Exotic goods and rare equipment are sold by a friendly trader.',
      'A merchant\'s stall offers wares suited to this region.'
    ]
  };

  const options = descriptions[type] || ['An interesting location awaits exploration.'];
  return options[Math.floor(Math.random() * options.length)];
};

// Create a wilderness map based on configuration
export const createWildernessMap = (mapConfig: MapConfig): WildernessMap => {
  const width = 4;
  const height = 5;
  const tiles: WildernessTile[][] = [];

  // Define map-specific terrain patterns
  const getTerrainForMap = (mapId: string, x: number, y: number) => {
    switch (mapId) {
      case 'greenwood_valley':
        return getGreenwoodTerrain(x, y);
      case 'shadowmere_swamps':
        return getSwampTerrain(x, y);
      case 'crystal_caverns':
        return getCavernTerrain(x, y);
      case 'volcanic_peaks':
        return getVolcanicTerrain(x, y);
      case 'frozen_wastes':
        return getFrozenTerrain(x, y);
      default:
        return getGreenwoodTerrain(x, y);
    }
  };

  for (let y = 0; y < height; y++) {
    const row: WildernessTile[] = [];
    for (let x = 0; x < width; x++) {
      const terrain = getTerrainForMap(mapConfig.id, x, y);

      const tile: WildernessTile = {
        id: `tile_${mapConfig.id}_${x}_${y}`,
        x,
        y,
        type: terrain.type,
        name: terrain.name,
        description: terrain.description,
        visited: false,
        spawnRate: terrain.spawnRate,
        minLevel: terrain.minLevel,
        maxLevel: terrain.maxLevel,
        biome: terrain.biome,
        spawnedMonsters: [],
        lastSpawnCheck: 0,
        // Add portal features to villages
        features: terrain.type === 'village' ? [{
          id: 'portal_hub',
          type: 'portal',
          name: 'Portal Hub',
          description: 'A mystical portal that can transport you to other realms.',
          isActive: true,
          data: { availableMaps: mapConfigs.map(m => m.id) }
        }] : undefined,
        // Add NPCs to villages and merchants
        npcs: terrain.type === 'village' ? [{
          id: 'portal_keeper',
          name: 'Portal Keeper',
          type: 'portal_keeper',
          dialogue: [
            'Greetings, traveler! I maintain the portals to distant lands.',
            'Where would you like to go today?',
            'Each realm has its own challenges and rewards!'
          ],
          services: [{
            id: 'portal_service',
            name: 'Portal Travel',
            type: 'portal',
            cost: 0
          }]
        }] : terrain.type === 'merchant' ? [{
          id: `merchant_${mapConfig.id}_${x}_${y}`,
          name: terrain.name,
          type: 'merchant',
          dialogue: [
            'Welcome, adventurer! I have the finest gear for these lands.',
            'Looking for something specific? I might have just what you need.',
            'These items are perfectly suited for the dangers ahead!'
          ],
          services: [{
            id: 'merchant_shop',
            name: 'Browse Wares',
            type: 'shop',
            cost: 0
          }]
        }] : undefined
      };

      row.push(tile);
    }
    tiles.push(row);
  }

  // Add portal to next map (if not the last map)
  const nextMap = getNextMap(mapConfig.id);
  if (nextMap) {
    // Place portal at bottom-right corner
    const portalTile = tiles[height - 1][width - 1];
    portalTile.type = 'ruins';
    portalTile.name = `Portal to ${nextMap.name}`;
    portalTile.description = `A mystical portal leading to ${nextMap.name}. ${nextMap.description}`;
    portalTile.spawnRate = 0; // No monsters on portal tiles
  }

  return {
    id: mapConfig.id,
    name: mapConfig.name,
    description: mapConfig.description,
    width,
    height,
    tiles,
    startingPosition: { x: 1, y: 2 } // Start at village position for consistency
  };
};

// Terrain generation functions for different map types
const getGreenwoodTerrain = (x: number, y: number) => {
  const distanceFromStart = Math.abs(x - 1) + Math.abs(y - 2);
  const minLevel = Math.max(1, 1 + Math.floor(distanceFromStart / 2));
  const maxLevel = Math.max(minLevel, minLevel + 2 + Math.floor(distanceFromStart / 1.5));

  // Use similar layout to original starter map
  const layout = [
    [{ type: 'mountain', name: 'Rocky Peak', spawnRate: 0.4 }, { type: 'mountain', name: 'Stone Cliffs', spawnRate: 0.3 }, { type: 'cave', name: 'Dark Cave', spawnRate: 0.6 }, { type: 'merchant', name: 'Mountain Trader', spawnRate: 0.0 }],
    [{ type: 'forest', name: 'Pine Woods', spawnRate: 0.3 }, { type: 'forest', name: 'Dense Forest', spawnRate: 0.4 }, { type: 'forest', name: 'Ancient Grove', spawnRate: 0.3 }, { type: 'ruins', name: 'Old Ruins', spawnRate: 0.5 }],
    [{ type: 'grass', name: 'Green Meadow', spawnRate: 0.2 }, { type: 'village', name: 'Starting Village', spawnRate: 0.0 }, { type: 'grass', name: 'Peaceful Field', spawnRate: 0.2 }, { type: 'road', name: 'Trade Route', spawnRate: 0.1 }],
    [{ type: 'grass', name: 'Rolling Hills', spawnRate: 0.2 }, { type: 'forest', name: 'Young Forest', spawnRate: 0.3 }, { type: 'water', name: 'Crystal Lake', spawnRate: 0.1 }, { type: 'grass', name: 'Flower Field', spawnRate: 0.2 }],
    [{ type: 'forest', name: 'Thick Woods', spawnRate: 0.4 }, { type: 'forest', name: 'Misty Grove', spawnRate: 0.3 }, { type: 'forest', name: 'Shadowy Path', spawnRate: 0.4 }, { type: 'cave', name: 'Hidden Cavern', spawnRate: 0.5 }]
  ];

  const tile = layout[y][x];
  return {
    type: tile.type as TileType,
    biome: (tile.type === 'mountain' || tile.type === 'cave') ? 'mountains' as BiomeType :
      (tile.type === 'forest') ? 'forest' as BiomeType : 'plains' as BiomeType,
    name: tile.name,
    spawnRate: tile.spawnRate,
    minLevel,
    maxLevel,
    description: generateTileDescription(tile.type as TileType, tile.name)
  };
};

const getSwampTerrain = (x: number, y: number) => {
  const minLevel = 8;
  const maxLevel = 18;

  const layout = [
    [{ type: 'water', name: 'Murky Bog', spawnRate: 0.6 }, { type: 'forest', name: 'Twisted Trees', spawnRate: 0.5 }, { type: 'water', name: 'Stagnant Pool', spawnRate: 0.7 }, { type: 'forest', name: 'Gnarled Grove', spawnRate: 0.5 }],
    [{ type: 'water', name: 'Misty Marsh', spawnRate: 0.6 }, { type: 'water', name: 'Deep Swamp', spawnRate: 0.7 }, { type: 'ruins', name: 'Sunken Ruins', spawnRate: 0.8 }, { type: 'water', name: 'Witch\'s Pool', spawnRate: 0.9 }],
    [{ type: 'merchant', name: 'Swamp Merchant', spawnRate: 0.0 }, { type: 'village', name: 'Swamp Settlement', spawnRate: 0.0 }, { type: 'water', name: 'Toxic Pond', spawnRate: 0.6 }, { type: 'forest', name: 'Willow Grove', spawnRate: 0.5 }],
    [{ type: 'water', name: 'Crocodile Lair', spawnRate: 0.8 }, { type: 'forest', name: 'Hanging Vines', spawnRate: 0.5 }, { type: 'water', name: 'Bubbling Marsh', spawnRate: 0.7 }, { type: 'ruins', name: 'Ancient Altar', spawnRate: 0.6 }],
    [{ type: 'water', name: 'Deadly Bog', spawnRate: 0.9 }, { type: 'forest', name: 'Poisonous Grove', spawnRate: 0.7 }, { type: 'water', name: 'Dragon\'s Lair', spawnRate: 1.0 }, { type: 'ruins', name: 'Portal Chamber', spawnRate: 0.0 }]
  ];

  const tile = layout[y][x];
  return {
    type: tile.type as TileType,
    biome: 'swamp' as BiomeType,
    name: tile.name,
    spawnRate: tile.spawnRate,
    minLevel,
    maxLevel,
    description: generateTileDescription(tile.type as TileType, tile.name)
  };
};

const getCavernTerrain = (x: number, y: number) => {
  const minLevel = 15;
  const maxLevel = 25;

  const layout = [
    [{ type: 'cave', name: 'Crystal Chamber', spawnRate: 0.7 }, { type: 'cave', name: 'Glowing Tunnel', spawnRate: 0.6 }, { type: 'ruins', name: 'Ancient Gallery', spawnRate: 0.8 }, { type: 'cave', name: 'Gem Cavern', spawnRate: 0.7 }],
    [{ type: 'cave', name: 'Shadow Passage', spawnRate: 0.8 }, { type: 'ruins', name: 'Mystic Shrine', spawnRate: 0.9 }, { type: 'cave', name: 'Echo Chamber', spawnRate: 0.7 }, { type: 'ruins', name: 'Lost Temple', spawnRate: 0.8 }],
    [{ type: 'cave', name: 'Winding Path', spawnRate: 0.5 }, { type: 'village', name: 'Mining Outpost', spawnRate: 0.0 }, { type: 'merchant', name: 'Crystal Merchant', spawnRate: 0.0 }, { type: 'cave', name: 'Underground Lake', spawnRate: 0.7 }],
    [{ type: 'ruins', name: 'Forgotten Vault', spawnRate: 0.8 }, { type: 'cave', name: 'Narrow Crevice', spawnRate: 0.7 }, { type: 'cave', name: 'Crystal Garden', spawnRate: 0.8 }, { type: 'ruins', name: 'Guardian\'s Chamber', spawnRate: 0.9 }],
    [{ type: 'cave', name: 'Deep Abyss', spawnRate: 0.9 }, { type: 'ruins', name: 'Dragon\'s Hoard', spawnRate: 1.0 }, { type: 'cave', name: 'Final Depths', spawnRate: 0.8 }, { type: 'ruins', name: 'Portal Nexus', spawnRate: 0.0 }]
  ];

  const tile = layout[y][x];
  return {
    type: tile.type as TileType,
    biome: 'underground' as BiomeType,
    name: tile.name,
    spawnRate: tile.spawnRate,
    minLevel,
    maxLevel,
    description: generateTileDescription(tile.type as TileType, tile.name)
  };
};

const getVolcanicTerrain = (x: number, y: number) => {
  const minLevel = 22;
  const maxLevel = 35;

  const layout = [
    [{ type: 'mountain', name: 'Smoking Peak', spawnRate: 0.8 }, { type: 'cave', name: 'Lava Tube', spawnRate: 0.9 }, { type: 'mountain', name: 'Molten Ridge', spawnRate: 0.8 }, { type: 'cave', name: 'Fire Cavern', spawnRate: 0.9 }],
    [{ type: 'mountain', name: 'Ash Fields', spawnRate: 0.7 }, { type: 'mountain', name: 'Volcanic Slope', spawnRate: 0.8 }, { type: 'ruins', name: 'Burnt Temple', spawnRate: 0.9 }, { type: 'mountain', name: 'Cinder Cone', spawnRate: 0.8 }],
    [{ type: 'mountain', name: 'Rocky Outcrop', spawnRate: 0.6 }, { type: 'village', name: 'Fire Fortress', spawnRate: 0.0 }, { type: 'mountain', name: 'Lava Flow', spawnRate: 0.8 }, { type: 'merchant', name: 'Fire Merchant', spawnRate: 0.0 }],
    [{ type: 'cave', name: 'Steam Vents', spawnRate: 0.8 }, { type: 'mountain', name: 'Obsidian Cliffs', spawnRate: 0.8 }, { type: 'ruins', name: 'Fire Lord\'s Throne', spawnRate: 1.0 }, { type: 'mountain', name: 'Sulfur Peaks', spawnRate: 0.8 }],
    [{ type: 'cave', name: 'Infernal Depths', spawnRate: 0.9 }, { type: 'mountain', name: 'Volcano Heart', spawnRate: 1.0 }, { type: 'ruins', name: 'Lord\'s Chamber', spawnRate: 1.0 }, { type: 'ruins', name: 'Portal of Fire', spawnRate: 0.0 }]
  ];

  const tile = layout[y][x];
  return {
    type: tile.type as TileType,
    biome: 'mountains' as BiomeType,
    name: tile.name,
    spawnRate: tile.spawnRate,
    minLevel,
    maxLevel,
    description: generateTileDescription(tile.type as TileType, tile.name)
  };
};

const getFrozenTerrain = (x: number, y: number) => {
  const minLevel = 32;
  const maxLevel = 45;

  const layout = [
    [{ type: 'mountain', name: 'Frozen Peak', spawnRate: 0.8 }, { type: 'water', name: 'Ice Lake', spawnRate: 0.7 }, { type: 'mountain', name: 'Glacier Wall', spawnRate: 0.8 }, { type: 'cave', name: 'Ice Cave', spawnRate: 0.9 }],
    [{ type: 'water', name: 'Frozen Tundra', spawnRate: 0.7 }, { type: 'mountain', name: 'Snow Drifts', spawnRate: 0.8 }, { type: 'ruins', name: 'Ice Palace', spawnRate: 0.9 }, { type: 'water', name: 'Blizzard Fields', spawnRate: 0.8 }],
    [{ type: 'mountain', name: 'Icy Slopes', spawnRate: 0.6 }, { type: 'village', name: 'Ice Fortress', spawnRate: 0.0 }, { type: 'water', name: 'Frozen Marsh', spawnRate: 0.7 }, { type: 'mountain', name: 'Crystal Spires', spawnRate: 0.8 }],
    [{ type: 'merchant', name: 'Ice Merchant', spawnRate: 0.0 }, { type: 'mountain', name: 'Avalanche Zone', spawnRate: 0.8 }, { type: 'ruins', name: 'Giant\'s Hall', spawnRate: 1.0 }, { type: 'cave', name: 'Frost Cavern', spawnRate: 0.9 }],
    [{ type: 'mountain', name: 'Eternal Winter', spawnRate: 0.9 }, { type: 'water', name: 'Ice Throne', spawnRate: 1.0 }, { type: 'ruins', name: 'Frozen Palace', spawnRate: 1.0 }, { type: 'ruins', name: 'Portal of Ice', spawnRate: 0.0 }]
  ];

  const tile = layout[y][x];
  return {
    type: tile.type as TileType,
    biome: 'tundra' as BiomeType,
    name: tile.name,
    spawnRate: tile.spawnRate,
    minLevel,
    maxLevel,
    description: generateTileDescription(tile.type as TileType, tile.name)
  };
};

// Get merchant inventory for a specific map
export const getMerchantInventory = (mapId: string, playerLevel: number): Item[] => {
  const inventory: Item[] = [];

  // Get map-specific merchant inventory
  let mapItems: string[] = [];
  switch (mapId) {
    case 'greenwood_valley':
      mapItems = greenwoodValleyMerchantInventory;
      break;
    case 'shadowmere_swamps':
      mapItems = shadowmereSwampsMerchantInventory;
      break;
    case 'crystal_caverns':
      mapItems = crystalCavernsMerchantInventory;
      break;
    case 'volcanic_peaks':
      mapItems = volcanicPeaksMerchantInventory;
      break;
    case 'frozen_wastes':
      mapItems = frozenWastesMerchantInventory;
      break;
    default:
      mapItems = greenwoodValleyMerchantInventory; // fallback
  }

  // Generate 6-8 items from the map's merchant inventory
  const itemCount = Math.min(6 + Math.floor(playerLevel / 5), 8);
  const availableItems = [...mapItems]; // Copy array so we don't modify original

  for (let i = 0; i < itemCount && availableItems.length > 0; i++) {
    // Pick a random item from available items
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const itemName = availableItems.splice(randomIndex, 1)[0]; // Remove item so we don't duplicate

    // Find the base item from items.ts
    const baseItem = baseItems.find(item => item.name === itemName);
    if (baseItem) {
      // Generate item with appropriate level (player level ± 2)
      const itemLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 5) - 2);
      const generatedItem = generateItem(baseItem, itemLevel);
      inventory.push(generatedItem);
    }
  }
  return inventory;
}; 