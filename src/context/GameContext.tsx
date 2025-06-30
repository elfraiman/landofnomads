import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character, GameState, StatType, CombatResult, Item, ItemType, WildernessState, PlayerPosition, SpawnedMonster, DetailedBattleResult } from '../types';
import { WildernessMonster, LootDrop } from '../types/wilderness';
import { characterClasses } from '../data/classes';
import { generateStarterEquipment, baseItems, generateItem } from '../data/items';
import { simulateCombat, generateAIOpponent, canLevelUp, levelUpCharacter } from '../utils/combatEngine';
import { createStarterMap, starterMapMonsters, calculateMonsterLevel, scaleMonsterStats, mapConfigs, getMapById, canAccessMap as canAccessMapHelper, createWildernessMap } from '../data/wilderness';
import { Notification } from '../components/ui/NotificationSystem';
import { PlatformStorage } from '../utils/storage';

interface GameContextType {
  // Game state
  gameState: GameState;
  currentCharacter: Character | null;

  // Character management
  createCharacter: (name: string, classId: string) => Promise<Character>;
  selectCharacter: (characterId: string) => void;
  deleteCharacter: (characterId: string) => Promise<void>;
  updateCharacter: (character: Character) => void;

  // Combat system
  startBattle: (targetId?: string) => Promise<CombatResult>;
  getBattleHistory: () => CombatResult[];

  // Equipment system
  equipItem: (item: Item) => void;
  unequipItem: (slot: keyof Character['equipment']) => void;

  // Inventory system
  addItemToInventory: (item: Item) => void;
  removeItemFromInventory: (itemId: string) => void;
  sellItem: (itemId: string) => void;
  purchaseItem: (item: Item) => boolean;

  // Gem system
  consumeGem: (gemId: string) => boolean;
  fuseGems: (gemIds: string[]) => boolean;
  getActiveGemEffects: () => string[];

  // Energy system
  regenerateEnergy: () => void;

  // Leveling
  checkLevelUp: () => boolean;
  performLevelUp: () => void;

  // Wilderness system
  wildernessState: WildernessState | null;
  moveToTile: (x: number, y: number) => Promise<void>;
  fightMonster: (spawnedMonsterId: string) => Promise<DetailedBattleResult>;
  battleAllMonsters: (tileId: string) => Promise<DetailedBattleResult>;
  removeDeadMonster: (spawnedMonsterId: string) => void;
  getAvailableMoves: () => { x: number; y: number }[];

  // Portal/Map system
  getAvailableMaps: () => any[];
  switchToMap: (mapId: string) => Promise<void>;
  canAccessMap: (mapId: string) => boolean;

  // Health system
  healCharacter: (amount?: number) => void;
  getHealthPercentage: () => number;
  isPlayerDead: () => boolean;

  // Notification system
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;

  // Persistence
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  debugSaveData: () => Promise<void>;
  addTestItem: () => void;

  // Experience system
  getExperienceForLevel: (level: number) => number;
  getExperiencePercentage: (character?: Character) => number;
  getExperienceToNextLevel: (character?: Character) => number;

  // Utilities
  isLoading: boolean;
  error: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = 'auto_battler_game_state';
const ENERGY_REGEN_INTERVAL = 5 * 60 * 1000; // 5 minutes
const ENERGY_REGEN_AMOUNT = 10;

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentCharacter: undefined,
    characters: [],
    clans: [],
    combatHistory: [],
    quests: [],
    leaderboards: {},
    settings: {
      autoSave: true,
      combatSpeed: 1,
      soundEnabled: true,
      notifications: true
    },
    lastSave: Date.now(),
    gameStarted: Date.now()
  });

  const [wildernessState, setWildernessState] = useState<WildernessState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize game and load saved data
  useEffect(() => {
    loadGame(); // This will call initializeWilderness if no save data exists

    // Set up energy regeneration
    const energyInterval = setInterval(() => {
      regenerateEnergy();
    }, ENERGY_REGEN_INTERVAL);

    // Auto-save every 30 seconds if enabled
    const autoSaveInterval = setInterval(() => {
      if (gameState.settings.autoSave) {
        saveGame();
      }
    }, 30000);

    return () => {
      clearInterval(energyInterval);
      clearInterval(autoSaveInterval);
    };
  }, []);

  const calculateMaxHealth = (constitution: number, level: number): number => {
    return Math.floor(100 + (constitution * 5) + (level * 10));
  };

  const initializeWilderness = () => {
    // Use the first map config (Greenwood Valley) instead of the hardcoded starter map
    const starterMapConfig = mapConfigs[0]; // This should be 'greenwood_valley'
    const starterMap = createWildernessMap(starterMapConfig);

    // Mark the starting village as visited
    const startingTile = starterMap.tiles[starterMap.startingPosition.y][starterMap.startingPosition.x];
    startingTile.visited = true;

    setWildernessState({
      currentMap: starterMap,
      playerPosition: {
        x: starterMap.startingPosition.x,
        y: starterMap.startingPosition.y,
        mapId: starterMap.id,
        lastMoved: Date.now()
      },
      encounters: [],
      exploredTiles: new Set([`tile_${starterMap.id}_${starterMap.startingPosition.x}_${starterMap.startingPosition.y}`]),
      activeEncounter: undefined
    });
  };

  const createCharacter = async (name: string, classId: string): Promise<Character> => {
    try {
      const characterClass = characterClasses.find(c => c.id === classId);
      if (!characterClass) {
        throw new Error('Invalid character class');
      }

      const starterEquipment = generateStarterEquipment();
      const maxHealth = calculateMaxHealth(characterClass.startingStats.constitution, 1);
      const newCharacter: Character = {
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        class: characterClass,
        level: 1,
        experience: 0,
        gold: 500, // Starting gold
        energy: 100,
        maxEnergy: 100,
        stats: { ...characterClass.startingStats },
        currentHealth: maxHealth,
        maxHealth: maxHealth,
        unspentStatPoints: 0, // No unspent points at creation
        equipment: {
          mainHand: starterEquipment.find(item => item.type === 'weapon'),
          armor: starterEquipment.find(item => item.type === 'armor'),
          boots: starterEquipment.find(item => item.type === 'boots')
        },
        inventory: [], // Start with empty inventory
        wins: 0,
        losses: 0,
        activeGemEffects: [], // Start with no gem effects
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      setGameState(prev => ({
        ...prev,
        characters: [...prev.characters, newCharacter],
        currentCharacter: newCharacter
      }));

      await saveGame();
      return newCharacter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
      throw err;
    }
  };

  const selectCharacter = (characterId: string) => {
    const character = gameState.characters.find(c => c.id === characterId);
    if (character) {
      setGameState(prev => ({
        ...prev,
        currentCharacter: { ...character, lastActive: Date.now() }
      }));
    }
  };

  const deleteCharacter = async (characterId: string) => {
    setGameState(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== characterId),
      currentCharacter: prev.currentCharacter?.id === characterId ? undefined : prev.currentCharacter
    }));
    await saveGame();
  };

  const updateCharacter = (updatedCharacter: Character) => {
    setGameState(prev => ({
      ...prev,
      characters: prev.characters.map(c =>
        c.id === updatedCharacter.id ? updatedCharacter : c
      ),
      currentCharacter: prev.currentCharacter?.id === updatedCharacter.id ? updatedCharacter : prev.currentCharacter
    }));
  };

  const startBattle = async (targetId?: string): Promise<CombatResult> => {
    if (!gameState.currentCharacter) {
      throw new Error('No character selected');
    }

    let opponent: Character;
    if (targetId) {
      const target = gameState.characters.find(c => c.id === targetId);
      if (!target) {
        throw new Error('Target character not found');
      }
      opponent = target;
    } else {
      // Generate AI opponent
      opponent = generateAIOpponent(gameState.currentCharacter.level);
    }

    const combatResult = simulateCombat(gameState.currentCharacter, opponent);

    // Update character stats based on result
    const isWinner = combatResult.winner.id === gameState.currentCharacter.id;
    const updatedCharacter = {
      ...gameState.currentCharacter,
      experience: gameState.currentCharacter.experience + (isWinner ? combatResult.experienceGained : Math.floor(combatResult.experienceGained * 0.5)),
      gold: gameState.currentCharacter.gold + (isWinner ? combatResult.goldGained : 0),
      wins: gameState.currentCharacter.wins + (isWinner ? 1 : 0),
      losses: gameState.currentCharacter.losses + (isWinner ? 0 : 1)
    };

    // Add loot drops to inventory if player won
    if (isWinner && combatResult.lootDrops.length > 0) {
      updatedCharacter.inventory = [...updatedCharacter.inventory, ...combatResult.lootDrops];

      // Show notifications for dropped items
      combatResult.lootDrops.forEach(item => {
        // Show special notification for gem drops
        if (item.type === 'gem') {
          const gem = item as any; // Gem type
          addNotification({
            type: 'gem_drop',
            title: 'Rare Gem Found!',
            message: `${opponent.name} dropped a ${gem.name}! This valuable gem can boost your stats or be fused with others for greater power.`,
            duration: 5000
          });
        } else {
          // Show notification for regular item drop
          addNotification({
            type: 'item_drop',
            title: 'Item Found!',
            message: `${opponent.name} dropped an item!`,
            itemDetails: {
              name: item.name,
              level: item.level,
              rarity: item.rarity
            },
            duration: 3000
          });
        }
      });
    }

    setGameState(prev => ({
      ...prev,
      currentCharacter: updatedCharacter,
      characters: prev.characters.map(c =>
        c.id === updatedCharacter.id ? updatedCharacter : c
      ),
      combatHistory: [combatResult, ...prev.combatHistory.slice(0, 99)] // Keep last 100 battles
    }));

    await saveGame();
    return combatResult;
  };

  const getBattleHistory = (): CombatResult[] => {
    if (!gameState.currentCharacter) return [];
    return gameState.combatHistory.filter(
      battle => battle.attacker.id === gameState.currentCharacter!.id ||
        battle.defender.id === gameState.currentCharacter!.id
    );
  };

  const equipItem = (item: Item) => {
    if (!gameState.currentCharacter) {
      console.log('No current character when trying to equip item');
      return;
    }

    // Gems cannot be equipped, they are consumables
    if (item.type === 'gem') {
      console.log('Cannot equip gems - they are consumables');
      return;
    }

    const character = gameState.currentCharacter;
    console.log(`Equipping item: ${item.name} to character: ${character.name}`);
    console.log(`Inventory - Character inventory before: ${character.inventory?.length || 0} items`);

    let targetSlot: keyof Character['equipment'];
    let currentEquipped: Item | undefined;

    if (item.type === 'weapon') {
      // For weapons, determine which hand to equip to
      const { mainHand, offHand } = character.equipment;

      if (!mainHand) {
        // Main hand is empty
        targetSlot = 'mainHand';
        currentEquipped = undefined;
      } else if (!offHand && item.handedness === 'one-handed') {
        // Off hand is empty and item is one-handed
        targetSlot = 'offHand';
        currentEquipped = undefined;
      } else if (item.handedness === 'two-handed') {
        // Two-handed weapon replaces main hand and clears off hand
        targetSlot = 'mainHand';
        currentEquipped = mainHand;

        // Also need to handle off-hand if it exists
        if (offHand) {
          // Add off-hand to inventory as well
          const updatedCharacter = {
            ...character,
            equipment: {
              ...character.equipment,
              mainHand: item,
              offHand: undefined
            },
            inventory: [
              ...(character.inventory || []).filter(inventoryItem => inventoryItem.id !== item.id),
              mainHand,
              offHand
            ]
          };

          setGameState(prev => ({
            ...prev,
            currentCharacter: updatedCharacter,
            characters: prev.characters.map(c =>
              c.id === character.id ? updatedCharacter : c
            )
          }));

          setTimeout(() => saveGame(), 100);
          return;
        }
      } else {
        // Replace main hand
        targetSlot = 'mainHand';
        currentEquipped = mainHand;
      }
    } else if (item.type === 'shield') {
      // Shields always go to off-hand
      targetSlot = 'offHand';
      currentEquipped = character.equipment.offHand;
    } else {
      // For other item types, use direct mapping (gems are not equipment)
      const slotMap: Record<Exclude<ItemType, 'weapon' | 'shield' | 'gem'>, keyof Character['equipment']> = {
        armor: 'armor',
        helmet: 'helmet',
        boots: 'boots',
        accessory: 'accessory'
      };

      targetSlot = slotMap[item.type as Exclude<ItemType, 'weapon' | 'shield' | 'gem'>];
      currentEquipped = character.equipment[targetSlot];
    }

    console.log(`Equipment - Target slot: ${targetSlot} Currently equipped: ${currentEquipped?.name || 'none'}`);

    const updatedCharacter = {
      ...character,
      equipment: {
        ...character.equipment,
        [targetSlot]: item
      },
      inventory: [
        // Remove the item being equipped from inventory
        ...(character.inventory || []).filter(inventoryItem => inventoryItem.id !== item.id),
        // Add the previously equipped item (if any) to inventory
        ...(currentEquipped ? [currentEquipped] : [])
      ]
    };

    console.log(`Inventory - Updated inventory size: ${updatedCharacter.inventory.length}`);

    setGameState(prev => ({
      ...prev,
      currentCharacter: updatedCharacter,
      characters: prev.characters.map(c =>
        c.id === character.id ? updatedCharacter : c
      )
    }));

    // Save the game after equipping
    setTimeout(() => saveGame(), 100);
  };

  const unequipItem = (slot: keyof Character['equipment']) => {
    if (!gameState.currentCharacter) {
      console.log('No current character when trying to unequip item');
      return;
    }

    const character = gameState.currentCharacter;
    const item = character.equipment[slot];
    if (!item) {
      console.log('No item equipped in slot:', slot);
      return;
    }

    console.log('Unequipping item:', item.name, 'from slot:', slot);
    console.log('Character inventory before:', character.inventory?.length || 0, 'items');

    // Create new equipment object without the unequipped item
    const newEquipment = { ...character.equipment };
    delete newEquipment[slot];

    const updatedCharacter = {
      ...character,
      equipment: newEquipment,
      inventory: [...(character.inventory || []), item]
    };

    console.log('Updated character inventory after:', updatedCharacter.inventory.length, 'items');
    console.log('Equipment slot', slot, 'after unequip:', updatedCharacter.equipment[slot]);
    console.log('Item added to inventory:', item.name, 'with ID:', item.id);

    setGameState(prev => {
      const newState = {
        ...prev,
        currentCharacter: updatedCharacter,
        characters: prev.characters.map(c =>
          c.id === character.id ? updatedCharacter : c
        )
      };

      console.log('State updated - new current character inventory:', newState.currentCharacter?.inventory?.length || 0);
      console.log('State updated - equipment slot', slot, ':', newState.currentCharacter?.equipment[slot]);

      return newState;
    });

    // Save the game after unequipping
    setTimeout(() => saveGame(), 100);
  };

  const regenerateEnergy = () => {
    if (!gameState.currentCharacter) return;

    const character = gameState.currentCharacter;
    if (character.energy < character.maxEnergy) {
      const newEnergy = Math.min(character.maxEnergy, character.energy + ENERGY_REGEN_AMOUNT);
      const updatedCharacter = { ...character, energy: newEnergy };

      setGameState(prev => ({
        ...prev,
        currentCharacter: updatedCharacter,
        characters: prev.characters.map(c =>
          c.id === character.id ? updatedCharacter : c
        )
      }));
    }
  };

  const addItemToInventory = (item: Item) => {
    if (!gameState.currentCharacter) {
      console.error('❌ Cannot add item: no current character');
      return;
    }

    const character = gameState.currentCharacter;
    console.log(`Inventory - Adding ${item.name} to ${character.name}'s inventory (current inventory size: ${character.inventory.length})`);

    const updatedCharacter = {
      ...character,
      inventory: [...character.inventory, item]
    };

    console.log(`Inventory - Updated inventory size: ${updatedCharacter.inventory.length}`);

    setGameState(prev => ({
      ...prev,
      currentCharacter: updatedCharacter,
      characters: prev.characters.map(c =>
        c.id === character.id ? updatedCharacter : c
      )
    }));

    // Save the game after adding item to inventory
    setTimeout(() => {
      console.log('Storage - Saving game after item addition...');
      saveGame();
    }, 100);
  };

  const removeItemFromInventory = (itemId: string) => {
    if (!gameState.currentCharacter) return;

    const character = gameState.currentCharacter;
    const updatedCharacter = {
      ...character,
      inventory: character.inventory.filter(item => item.id !== itemId)
    };

    setGameState(prev => ({
      ...prev,
      currentCharacter: updatedCharacter,
      characters: prev.characters.map(c =>
        c.id === character.id ? updatedCharacter : c
      )
    }));
  };

  const sellItem = (itemId: string) => {
    if (!gameState.currentCharacter) return;

    const character = gameState.currentCharacter;
    const item = (character.inventory || []).find(item => item.id === itemId);
    if (!item) return;

    // Sell for 50% of original price
    const sellPrice = Math.floor(item.price * 0.5);

    const updatedCharacter = {
      ...character,
      gold: character.gold + sellPrice,
      inventory: (character.inventory || []).filter(item => item.id !== itemId)
    };

    setGameState(prev => ({
      ...prev,
      currentCharacter: updatedCharacter,
      characters: prev.characters.map(c =>
        c.id === character.id ? updatedCharacter : c
      )
    }));

    // Save the game after selling
    setTimeout(() => saveGame(), 100);
  };

  const purchaseItem = (item: Item): boolean => {
    if (!gameState.currentCharacter) return false;

    const character = gameState.currentCharacter;
    
    // Check if player has enough gold
    if (character.gold < item.price) {
      return false;
    }

    // Deduct gold and add item to inventory
    const updatedCharacter = {
      ...character,
      gold: character.gold - item.price,
      inventory: [...(character.inventory || []), item]
    };

    setGameState(prev => ({
      ...prev,
      currentCharacter: updatedCharacter,
      characters: prev.characters.map(c =>
        c.id === character.id ? updatedCharacter : c
      )
    }));

    // Save the game after purchasing
    setTimeout(() => saveGame(), 100);
    return true;
  };

  const checkLevelUp = (): boolean => {
    return gameState.currentCharacter ? canLevelUp(gameState.currentCharacter) : false;
  };

  const performLevelUp = () => {
    if (!gameState.currentCharacter || !canLevelUp(gameState.currentCharacter)) return;

    const leveledUpCharacter = levelUpCharacter(gameState.currentCharacter);

    setGameState(prev => ({
      ...prev,
      currentCharacter: leveledUpCharacter,
      characters: prev.characters.map(c =>
        c.id === leveledUpCharacter.id ? leveledUpCharacter : c
      )
    }));
  };

  const saveGame = async () => {
    try {
      const dataToSave = {
        ...gameState,
        wildernessState, // Include wilderness state in save data
        lastSave: Date.now()
      };
      await PlatformStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log(`Game saved successfully at: ${new Date().toLocaleTimeString()} (${PlatformStorage.getPlatformInfo()})`);
    } catch (err) {
      console.error('Failed to save game:', err);
      setError('Failed to save game');
    }
  };

  const loadGame = async () => {
    try {
      setIsLoading(true);
      const savedData = await PlatformStorage.getItem(STORAGE_KEY);

      if (savedData) {
        const parsedData = JSON.parse(savedData) as any; // Use any to handle both old and new save formats

        // Migrate old characters to include inventory field
        const migratedCharacters = parsedData.characters.map((character: any) => ({
          ...character,
          inventory: character.inventory || [] // Add empty inventory if missing
        }));

        const migratedCurrentCharacter = parsedData.currentCharacter ? {
          ...parsedData.currentCharacter,
          inventory: parsedData.currentCharacter.inventory || []
        } : undefined;

        setGameState({
          ...parsedData,
          characters: migratedCharacters,
          currentCharacter: migratedCurrentCharacter
        });

        // Load wilderness state if it exists
        if (parsedData.wildernessState) {
          // Convert Set back from array if needed
          const exploredTiles = parsedData.wildernessState.exploredTiles instanceof Set
            ? parsedData.wildernessState.exploredTiles
            : new Set(parsedData.wildernessState.exploredTiles || []);

          // Check if we need to migrate from old starter_map to new greenwood_valley
          let wildernessToLoad = parsedData.wildernessState;
          if (wildernessToLoad.currentMap.id === 'starter_map') {
            console.log('Migrating from old starter_map to new greenwood_valley map');
            // Create new map with proper config
            const starterMapConfig = mapConfigs[0]; // greenwood_valley
            const newMap = createWildernessMap(starterMapConfig);

            // Preserve player position and visited tiles
            const playerPos = wildernessToLoad.playerPosition;
            if (playerPos.x < newMap.width && playerPos.y < newMap.height) {
              newMap.tiles[playerPos.y][playerPos.x].visited = true;
            }

            // Update wilderness state with new map
            wildernessToLoad = {
              ...wildernessToLoad,
              currentMap: newMap,
              playerPosition: {
                ...playerPos,
                mapId: newMap.id
              }
            };
          }

          setWildernessState({
            ...wildernessToLoad,
            exploredTiles
          });
          console.log('Wilderness state loaded successfully');
        } else {
          // Initialize wilderness if not found in save data
          initializeWilderness();
          console.log('Wilderness state initialized (not found in save)');
        }

        console.log('Game loaded successfully, characters:', migratedCharacters.length);
      } else {
        console.log('No saved game found, starting fresh');
        initializeWilderness();
      }
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game');
      // Initialize wilderness as fallback
      initializeWilderness();
    } finally {
      setIsLoading(false);
    }
  };

  // Wilderness functions
  const moveToTile = async (x: number, y: number): Promise<void> => {
    if (!wildernessState || !gameState.currentCharacter) return;

    // Prevent movement if player is dead
    if (gameState.currentCharacter.currentHealth === 0) {
      throw new Error('You cannot move while dead. You must heal first.');
    }

    const { currentMap } = wildernessState;

    // Validate move
    if (x < 0 || x >= currentMap.width || y < 0 || y >= currentMap.height) {
      return;
    }

    const targetTile = currentMap.tiles[y][x];

    // Update player position
    const newPosition: PlayerPosition = {
      x,
      y,
      mapId: currentMap.id,
      lastMoved: Date.now()
    };

    // Mark tile as visited and explored
    targetTile.visited = true;
    const tileId = `tile_${currentMap.id}_${x}_${y}`;
    const newExploredTiles = new Set(wildernessState.exploredTiles);
    newExploredTiles.add(tileId);


    if ( Math.random() < targetTile.spawnRate) {
      spawnMonsterOnTile(targetTile);
    }

    // Update wilderness state
    setWildernessState(prev => prev ? {
      ...prev,
      playerPosition: newPosition,
      exploredTiles: newExploredTiles
    } : null);
  };

  const spawnMonsterOnTile = (tile: any): void => {
    if (!gameState.currentCharacter || !wildernessState) return;

    // Get the current map's monsters
    const currentMapConfig = getMapById(wildernessState.currentMap.id);
    console.log('Spawning monster - Map ID:', wildernessState.currentMap.id, 'Config found:', !!currentMapConfig);
    if (!currentMapConfig) return;

    // Calculate appropriate level first
    const distanceFromStart = Math.abs(tile.x - 1) + Math.abs(tile.y - 2);
    const targetLevel = calculateMonsterLevel(
      gameState.currentCharacter.level,
      distanceFromStart,
      tile.minLevel,
      tile.maxLevel
    );

    console.log('Target monster level:', targetLevel, 'Player level:', gameState.currentCharacter.level, 'Distance:', distanceFromStart);

    // Find monsters that can appear in this biome
    const availableMonsters = currentMapConfig.monsters.filter(monster =>
      monster.biomes.includes(tile.biome)
    );
    console.log('Available monsters for biome', tile.biome, ':', availableMonsters.length);

    if (availableMonsters.length === 0) return;

    // Select monster based on level preference and rarity
    const monster = selectMonsterForLevel(availableMonsters, targetLevel);

    // Scale monster to appropriate level
    const scaledMonster = scaleMonsterStats(monster, targetLevel);

    console.log('Selected monster:', monster.name, 'Level', monster.level, '-> Scaled to level', targetLevel);

    // Create spawned monster
    const spawnedMonster: SpawnedMonster = {
      id: `spawned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      monsterId: monster.id,
      monster: scaledMonster,
      tileId: tile.id,
      spawnedAt: Date.now(),
      isAlive: true
    };

    // Add to tile's spawned monsters list
    tile.spawnedMonsters.push(spawnedMonster);

    // Update wilderness state to trigger re-render
    setWildernessState(prev => prev ? { ...prev } : null);
  };

  const selectMonsterForLevel = (monsters: any[], targetLevel: number) => {
    // Create a weighted list that prefers monsters closer to the target level
    const weightedMonsters = monsters.map(monster => {
      const levelDiff = Math.abs(monster.level - targetLevel);

      // Base rarity weights
      const rarityWeights = {
        common: 50,
        uncommon: 30,
        rare: 15,
        elite: 4,
        boss: 1
      };

      // Very small level proximity bonus (allows much more variety)
      const levelBonus = Math.max(0.5, 2 - levelDiff * 0.1); // Much smaller impact

      // Final weight is mostly based on rarity, not level proximity
      const finalWeight = (rarityWeights as any)[monster.rarity] * levelBonus;

      return { monster, weight: finalWeight };
    });

    // Select based on weighted random
    const totalWeight = weightedMonsters.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weightedMonsters) {
      random -= item.weight;
      if (random <= 0) return item.monster;
    }

    return monsters[0]; // Fallback
  };

  // Helper function to calculate gem bonuses
  const calculateGemBonuses = (character: Character): { experienceBonus: number; goldBonus: number } => {
    let totalExperienceBonus = 0;
    let totalGoldBonus = 0;

    console.log('Gem Bonuses - Calculating for character:', character.name);
    console.log('Gem Bonuses - Active gem effects count:', character.activeGemEffects.length);

    character.activeGemEffects.forEach(effect => {
      console.log('Gem Bonuses - Processing gem effect:', effect.gemName, effect);
      if (effect.experienceBonus) {
        totalExperienceBonus += effect.experienceBonus;
        console.log('Gem Bonuses - Added experience bonus:', effect.experienceBonus, 'Total now:', totalExperienceBonus);
      }
      if (effect.goldBonus) {
        totalGoldBonus += effect.goldBonus;
        console.log('Gem Bonuses - Added gold bonus:', effect.goldBonus, 'Total now:', totalGoldBonus);
      }
    });

    console.log('Gem Bonuses - Final bonuses - Experience:', totalExperienceBonus, '%, Gold:', totalGoldBonus, '%');
    return { experienceBonus: totalExperienceBonus, goldBonus: totalGoldBonus };
  };

  // Generate loot from monster's loot table with guaranteed base rewards
  const generateLoot = (monster: WildernessMonster, playerLevel: number): { gold: number; experience: number; items: Item[] } => {
    let totalGold = 0;
    let totalExperience = 0;
    const droppedItems: Item[] = [];

    // GUARANTEED BASE REWARDS - Every monster gives XP and gold
    // Base XP formula: 10 * monster_level^1.2 (exponential scaling)
    const baseXP = Math.floor(10 * Math.pow(monster.level, 1.2));

    // Base Gold formula: 5 * monster_level^1.1 (slightly less exponential than XP)
    const baseGold = Math.floor(5 * Math.pow(monster.level, 1.1));

    // Rarity multipliers for base rewards
    const rarityMultipliers = {
      'common': 1.0,
      'uncommon': 1.3,
      'rare': 1.6,
      'elite': 2.0,
      'boss': 3.0
    };

    const rarityMultiplier = rarityMultipliers[monster.rarity] || 1.0;

    // Level difference bonus/penalty (±20% per level difference)
    const levelDiff = monster.level - playerLevel;
    const levelMultiplier = Math.max(0.3, 1 + (levelDiff * 0.2));

    // Calculate base rewards
    let finalExperience = Math.floor(baseXP * rarityMultiplier * levelMultiplier);
    let finalGold = Math.floor(baseGold * rarityMultiplier * levelMultiplier);

    // Apply gem bonuses if character is available
    if (gameState.currentCharacter) {
      const gemBonuses = calculateGemBonuses(gameState.currentCharacter);

      console.log('Loot Generation - Gem bonuses calculated:', gemBonuses);
      console.log('Loot Generation - Base rewards before bonuses - XP:', finalExperience, 'Gold:', finalGold);

      if (gemBonuses.experienceBonus > 0) {
        const bonusXP = Math.floor(finalExperience * (gemBonuses.experienceBonus / 100));
        finalExperience += bonusXP;
        console.log('Loot Generation - Experience bonus applied:', bonusXP, 'New total:', finalExperience);
      }

      if (gemBonuses.goldBonus > 0) {
        const bonusGold = Math.floor(finalGold * (gemBonuses.goldBonus / 100));
        finalGold += bonusGold;
        console.log('Loot Generation - Gold bonus applied:', bonusGold, 'New total:', finalGold);
      }
    }

    totalExperience = finalExperience;
    totalGold = finalGold;

    // BONUS REWARDS from loot table (in addition to guaranteed rewards)
    monster.lootTable.forEach(drop => {
      if (Math.random() <= drop.chance) {
        // Add bonus gold
        if (drop.gold) {
          let bonusGold = drop.gold;
          // Apply gem bonus to bonus gold as well
          if (gameState.currentCharacter) {
            const gemBonuses = calculateGemBonuses(gameState.currentCharacter);
            if (gemBonuses.goldBonus > 0) {
              bonusGold += Math.floor(drop.gold * (gemBonuses.goldBonus / 100));
            }
          }
          totalGold += bonusGold;
        }

        // Add bonus experience
        if (drop.experience) {
          let bonusXP = drop.experience;
          // Apply gem bonus to bonus experience as well
          if (gameState.currentCharacter) {
            const gemBonuses = calculateGemBonuses(gameState.currentCharacter);
            if (gemBonuses.experienceBonus > 0) {
              bonusXP += Math.floor(drop.experience * (gemBonuses.experienceBonus / 100));
            }
          }
          totalExperience += bonusXP;
        }

        // Add items (both new system and legacy support)
        if (drop.item) {
          // Use new system with actual item objects
          const itemLevel = Math.max(1, monster.level + Math.floor(Math.random() * 3) - 1); // ±1 level variance
          const generatedItem = generateItem(drop.item, itemLevel);
          droppedItems.push(generatedItem);
        } else if (drop.itemId) {
          // Legacy support for old itemId system
          const baseItem = baseItems.find(item =>
            item.name.toLowerCase().replace(/[^a-z0-9]/g, '_') === drop.itemId?.replace(/'/g, '')
          );
          if (baseItem) {
            const itemLevel = Math.max(1, monster.level + Math.floor(Math.random() * 3) - 1); // ±1 level variance
            const generatedItem = generateItem(baseItem, itemLevel);
            droppedItems.push(generatedItem);
          }
        }
      }
    });

    // RARE GEM DROPS using configurable drop chances
    const { generateGemDrop } = require('../data/gems');
    const droppedGem = generateGemDrop(monster.level, monster.rarity);

    if (droppedGem) {
      droppedItems.push(droppedGem);

      // Add gem drop notification
      addNotification({
        type: 'gem_drop',
        title: 'Gem Found!',
        message: `Found a ${droppedGem.name} from the defeated monster!`,
        duration: 3000,
        gemDetails: {
          name: droppedGem.name,
          gemType: droppedGem.gemType
        }
      });
    }

    return { gold: totalGold, experience: totalExperience, items: droppedItems };
  };

  const fightMonster = async (spawnedMonsterId: string): Promise<DetailedBattleResult> => {
    const battleStartTime = Date.now();

    if (!wildernessState || !gameState.currentCharacter) {
      return {
        id: `battle_${Date.now()}`,
        playerName: 'Unknown',
        playerHealthBefore: 0,
        playerHealthAfter: 0,
        playerMaxHealth: 0,
        victory: false,
        monstersKilled: [],
        totalRewards: { experience: 0, gold: 0, items: [] },
        combatLog: ['No character available'],
        timestamp: battleStartTime,
        battleDuration: Date.now() - battleStartTime,
        weaponName: 'fists',
        weaponRarity: 'common',
        offHandWeaponName: undefined,
        offHandWeaponRarity: undefined,
        monsterName: spawnedMonster?.monster?.name,
        monsterMaxHealth: spawnedMonster?.monster?.baseStats?.health,
      };
    }

    const character = gameState.currentCharacter;
    const playerHealthBefore = character.currentHealth;

    // Find the spawned monster
    let spawnedMonster: SpawnedMonster | null = null;
    let targetTile: any = null;

    for (const row of wildernessState.currentMap.tiles) {
      for (const tile of row) {
        const found = tile.spawnedMonsters.find(m => m.id === spawnedMonsterId);
        if (found) {
          spawnedMonster = found;
          targetTile = tile;
          break;
        }
      }
      if (spawnedMonster) break;
    }

    if (!spawnedMonster || !targetTile) {
      return {
        id: `battle_${Date.now()}`,
        playerName: character.name,
        playerHealthBefore,
        playerHealthAfter: playerHealthBefore,
        playerMaxHealth: character.maxHealth,
        victory: false,
        monstersKilled: [],
        totalRewards: { experience: 0, gold: 0, items: [] },
        combatLog: ['Monster not found'],
        timestamp: battleStartTime,
        battleDuration: Date.now() - battleStartTime,
        weaponName: 'fists',
        weaponRarity: 'common',
        offHandWeaponName: undefined,
        offHandWeaponRarity: undefined,
        monsterName: spawnedMonster?.monster?.name,
        monsterMaxHealth: spawnedMonster?.monster?.baseStats?.health,
      };
    }

    try {
      // Create a temporary character for the monster with proper stats
      const monsterBaseHealth = spawnedMonster.monster.baseStats.health || 20;
      const monsterMaxHealth = Math.max(5, Math.floor(monsterBaseHealth + (spawnedMonster.monster.level * 2))); // Much more reasonable health calculation
      const monsterCharacter: Character = {
        id: spawnedMonster.monster.id,
        name: spawnedMonster.monster.name,
        class: character.class,
        level: spawnedMonster.monster.level,
        experience: 0,
        gold: 0,
        energy: 100,
        maxEnergy: 100,
        stats: {
          strength: Math.max(1, Math.floor((spawnedMonster.monster.baseStats.damage || 5) * 0.6)), // Reduce monster strength
          dexterity: Math.max(1, Math.floor((spawnedMonster.monster.baseStats.speed || 5) * 0.8)),
          constitution: Math.max(1, Math.floor((spawnedMonster.monster.baseStats.health || 20) / 15)), // Reduce constitution impact
          intelligence: 5, // Lower intelligence
          speed: Math.max(1, Math.floor((spawnedMonster.monster.baseStats.speed || 5) * 0.8))
        },
        currentHealth: monsterMaxHealth,
        maxHealth: monsterMaxHealth,
        unspentStatPoints: 0,
        equipment: {
          // Give monster basic equipment to make combat more interesting
          mainHand: (spawnedMonster.monster.baseStats.damage || 0) > 0 ? {
            id: 'monster_weapon',
            name: 'Monster Claws',
            type: 'weapon',
            rarity: 'common',
            level: spawnedMonster.monster.level,
            price: 0,
            statBonus: {},
            durability: 100,
            maxDurability: 100,
            damage: Math.max(1, Math.floor((spawnedMonster.monster.baseStats.damage || 5) * 0.2)), // Further reduce weapon damage
            handedness: 'one-handed',
            weaponSpeed: 5,
            description: 'Natural weapons'
          } : undefined,
          armor: (spawnedMonster.monster.baseStats.armor || 0) > 0 ? {
            id: 'monster_armor',
            name: 'Thick Hide',
            type: 'armor',
            rarity: 'common',
            level: spawnedMonster.monster.level,
            price: 0,
            statBonus: {},
            durability: 100,
            maxDurability: 100,
            armor: Math.floor((spawnedMonster.monster.baseStats.armor || 0) * 0.5), // Reduce monster armor
            description: 'Natural armor'
          } : undefined
        },
        inventory: [],
        wins: 0,
        losses: 0,
        activeGemEffects: [], // Monsters don't have gem effects
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      // Create a temporary character with current health for combat simulation
      const combatCharacter: Character = {
        ...character,
        currentHealth: character.currentHealth,
        maxHealth: character.maxHealth
      };

      // Run actual combat simulation
      const combatResult = simulateCombat(combatCharacter, monsterCharacter);
      const victory = combatResult.winner.id === character.id;

      // Calculate actual health after combat based on simulation
      let playerHealthAfter = character.currentHealth;

      if (victory) {
        // Player won - calculate damage taken during combat
        const totalDamageTaken = combatResult.rounds
          .filter(round => round.defender.id === character.id && round.damage > 0)
          .reduce((total, round) => total + round.damage, 0);
        playerHealthAfter = Math.max(0, character.currentHealth - totalDamageTaken);
      } else {
        // Player lost - calculate damage taken and apply it (can result in death)
        const totalDamageTaken = combatResult.rounds
          .filter(round => round.defender.id === character.id && round.damage > 0)
          .reduce((total, round) => total + round.damage, 0);
        playerHealthAfter = Math.max(0, character.currentHealth - totalDamageTaken);

        // If player dies (health reaches 0), add death notification
        if (playerHealthAfter === 0) {
          addNotification({
            type: 'death',
            title: 'You have died!',
            message: `You were slain by ${spawnedMonster.monster.name}. You cannot take any more actions until you heal.`,
            duration: 5000
          });
        }
      }

      let rewards = { experience: 0, gold: 0, items: [] as string[] };
      let monstersKilled: DetailedBattleResult['monstersKilled'] = [];

      if (victory) {
        // Calculate rewards based on monster loot table
        const lootResult = generateLoot(spawnedMonster.monster, character.level);

        // Add actual items to inventory (not string IDs)
        console.log(`Loot - Generated: ${lootResult.items.length} items`, lootResult.items.map(i => `${i.name} (${i.type})`));

        // Add all items to character inventory first
        const updatedInventory = [...character.inventory, ...lootResult.items];
        console.log(`Inventory - Adding ${lootResult.items.length} items to inventory. New size: ${updatedInventory.length}`);

        // Show notifications for dropped items
        lootResult.items.forEach(item => {
          console.log(`Inventory - Item added to inventory: ${item.name} (${item.type}, ID: ${item.id})`);

          // Show special notification for gem drops
          if (item.type === 'gem') {
            const gem = item as any; // Gem type
            console.log(`Gem Drop - Gem dropped: ${gem.name} (${gem.gemType}, ${gem.gemTier})`);
            addNotification({
              type: 'gem_drop',
              title: 'Rare Gem Found!',
              message: `${spawnedMonster.monster.name} dropped a ${gem.name}! This valuable gem can boost your stats or be fused with others for greater power.`,
              duration: 5000
            });
          } else {
            console.log(`Item Drop - Regular item dropped: ${item.name} (${item.type})`);
            // Show notification for regular item drop
          addNotification({
            type: 'item_drop',
            title: 'Item Found!',
            message: `${spawnedMonster.monster.name} dropped an item!`,
            itemDetails: {
              name: item.name,
              level: item.level,
              rarity: item.rarity
            },
            duration: 3000
          });
          }
        });

        // Update rewards with actual loot
        rewards = {
          experience: lootResult.experience,
          gold: lootResult.gold,
          items: lootResult.items.map(item => item.name) // Convert to names for display
        };

        // Add to monsters killed list
        monstersKilled.push({
          name: spawnedMonster.monster.name,
          level: spawnedMonster.monster.level,
          experience: rewards.experience,
          gold: rewards.gold
        });

        // Apply rewards and update character (including the new inventory)
        let updatedCharacter = {
          ...character,
          inventory: updatedInventory,
          experience: character.experience + rewards.experience,
          gold: character.gold + rewards.gold,
          currentHealth: playerHealthAfter,
          wins: character.wins + 1
        };
        


        // Update gem effects after combat (reduce duration)
        try {
          const { updateGemEffectsAfterCombat } = require('../utils/combatEngine');
          updatedCharacter = updateGemEffectsAfterCombat(updatedCharacter);
        } catch (error) {
          console.error('Failed to update gem effects after combat:', error);
        }

        updateCharacter(updatedCharacter);
        removeDeadMonster(spawnedMonsterId);

        // Save the game after successful combat
        setTimeout(() => saveGame(), 200);
      } else {
        // Apply defeat penalty
        let updatedCharacter = {
          ...character,
          currentHealth: playerHealthAfter,
          losses: character.losses + 1
        };

        // Update gem effects after combat (reduce duration) even on defeat
        try {
          const { updateGemEffectsAfterCombat } = require('../utils/combatEngine');
          updatedCharacter = updateGemEffectsAfterCombat(updatedCharacter);
        } catch (error) {
          console.error('Failed to update gem effects after combat:', error);
        }

        updateCharacter(updatedCharacter);

        // Save the game after defeat
        setTimeout(() => saveGame(), 200);
      }

      // Generate clean, detailed combat log
      const combatLog: string[] = [];
      combatLog.push(`-= COMBAT: ${character.name} (Lvl ${character.level}) vs ${spawnedMonster.monster.name} (Lvl ${spawnedMonster.monster.level}) =-`);
      combatLog.push('');

      // Add combat rounds with clean formatting
      combatResult.rounds.forEach((round) => {
        // Use the description directly from the combat engine
        combatLog.push(round.description);
      });

      combatLog.push('');

      // Final result
      if (victory) {
        combatLog.push(`VICTORY! ${spawnedMonster.monster.name} defeated!`);
        combatLog.push(`Rewards:
          +${rewards.experience} XP,
          +${rewards.gold} Gold,
          ${rewards.items.length > 0 ? `Items: ${rewards.items.join(', ')}` : 'No items found'}`);

        if (rewards.items.length > 0) {
          combatLog.push(`Items found: ${rewards.items.join(', ')}`);
        }
      } else {
        if (playerHealthAfter === 0) {
          combatLog.push(`DEFEAT! You were slain by ${spawnedMonster.monster.name}!`);
        } else {
          combatLog.push(`DEFEAT! You were defeated by ${spawnedMonster.monster.name}`);
        }
      }

      return {
        id: combatResult.id,
        playerName: character.name,
        playerHealthBefore,
        playerHealthAfter,
        playerMaxHealth: character.maxHealth,
        victory,
        monstersKilled,
        totalRewards: rewards,
        combatLog,
        timestamp: battleStartTime,
        battleDuration: Date.now() - battleStartTime,
        weaponName: character.equipment.mainHand?.name || 'fists',
        weaponRarity: character.equipment.mainHand?.rarity || 'common',
        offHandWeaponName: character.equipment.offHand?.type === 'weapon' ? character.equipment.offHand?.name : undefined,
        offHandWeaponRarity: character.equipment.offHand?.type === 'weapon' ? character.equipment.offHand?.rarity : undefined,
        monsterName: spawnedMonster.monster.name,
        monsterMaxHealth: monsterMaxHealth,
      };
    } catch (error) {
      console.error('Combat error:', error);
      return {
        id: `battle_error_${Date.now()}`,
        playerName: character.name,
        playerHealthBefore,
        playerHealthAfter: playerHealthBefore,
        playerMaxHealth: character.maxHealth,
        victory: false,
        monstersKilled: [],
        totalRewards: { experience: 0, gold: 0, items: [] },
        combatLog: ['Combat error occurred'],
        timestamp: battleStartTime,
        battleDuration: Date.now() - battleStartTime,
        weaponName: character.equipment.mainHand?.name || 'fists',
        weaponRarity: character.equipment.mainHand?.rarity || 'common',
        offHandWeaponName: undefined,
        offHandWeaponRarity: undefined,
        monsterName: spawnedMonster?.monster?.name,
        monsterMaxHealth: spawnedMonster?.monster?.baseStats?.health,
      };
    }
  };

  const battleAllMonsters = async (tileId: string): Promise<DetailedBattleResult> => {
    const battleStartTime = Date.now();

    if (!wildernessState || !gameState.currentCharacter) {
      return {
        id: `battle_${Date.now()}`,
        playerName: 'Unknown',
        playerHealthBefore: 0,
        playerHealthAfter: 0,
        playerMaxHealth: 0,
        victory: false,
        monstersKilled: [],
        totalRewards: { experience: 0, gold: 0, items: [] },
        combatLog: ['No character or wilderness available'],
        timestamp: battleStartTime,
        battleDuration: Date.now() - battleStartTime,
        weaponName: 'fists',
        weaponRarity: 'common',
        offHandWeaponName: undefined,
        offHandWeaponRarity: undefined
      };
    }

    const character = gameState.currentCharacter;
    const playerHealthBefore = character.currentHealth;

    // Find the tile and get all alive monsters
    let targetTile = null;
    for (const row of wildernessState.currentMap.tiles) {
      for (const tile of row) {
        if (tile.id === tileId) {
          targetTile = tile;
          break;
        }
      }
      if (targetTile) break;
    }

    if (!targetTile) {
      return {
        id: `battle_${Date.now()}`,
        playerName: character.name,
        playerHealthBefore,
        playerHealthAfter: playerHealthBefore,
        playerMaxHealth: character.maxHealth,
        victory: false,
        monstersKilled: [],
        totalRewards: { experience: 0, gold: 0, items: [] },
        combatLog: ['Tile not found'],
        timestamp: battleStartTime,
        battleDuration: Date.now() - battleStartTime,
        weaponName: character.equipment.mainHand?.name || 'fists',
        weaponRarity: character.equipment.mainHand?.rarity || 'common',
        offHandWeaponName: undefined,
        offHandWeaponRarity: undefined
      };
    }

    const aliveMonsters = targetTile.spawnedMonsters.filter(m => m.isAlive);
    if (aliveMonsters.length === 0) {
      return {
        id: `battle_${Date.now()}`,
        playerName: character.name,
        playerHealthBefore,
        playerHealthAfter: playerHealthBefore,
        playerMaxHealth: character.maxHealth,
        victory: false,
        monstersKilled: [],
        totalRewards: { experience: 0, gold: 0, items: [] },
        combatLog: ['No monsters to fight'],
        timestamp: battleStartTime,
        battleDuration: Date.now() - battleStartTime,
        weaponName: character.equipment.mainHand?.name || 'fists',
        weaponRarity: character.equipment.mainHand?.rarity || 'common',
        offHandWeaponName: undefined,
        offHandWeaponRarity: undefined
      };
    }

    let victories = 0;
    let defeats = 0;
    let totalRewards = { experience: 0, gold: 0, items: [] as string[] };
    let combatLog: string[] = [];
    let monstersKilled: DetailedBattleResult['monstersKilled'] = [];
    let currentPlayerHealth = character.currentHealth;

    combatLog.push(`=== MULTI-MONSTER BATTLE ===`);
    combatLog.push(`Facing ${aliveMonsters.length} monsters in sequence`);
    combatLog.push(`Starting Health: ${currentPlayerHealth}/${character.maxHealth} HP`);
    combatLog.push('');

    // Fight each monster sequentially until player dies or all monsters defeated
    for (let i = 0; i < aliveMonsters.length && currentPlayerHealth > 0; i++) {
      const monster = aliveMonsters[i];
      combatLog.push(`--- Battle ${i + 1}/${aliveMonsters.length}: ${monster.monster.name} (Level ${monster.monster.level}) ---`);

      try {
        // Temporarily update character health for this battle
        const tempCharacter = { ...character, currentHealth: currentPlayerHealth };
        setGameState(prev => ({
          ...prev,
          currentCharacter: tempCharacter
        }));

        const result = await fightMonster(monster.id);

        if (result.victory) {
          victories++;
          currentPlayerHealth = result.playerHealthAfter;
          totalRewards.experience += result.totalRewards.experience;
          totalRewards.gold += result.totalRewards.gold;
          totalRewards.items.push(...result.totalRewards.items);
          monstersKilled.push(...result.monstersKilled);

          combatLog.push(`Victory! ${monster.monster.name} defeated`);
          combatLog.push(`Health: ${currentPlayerHealth}/${character.maxHealth} HP`);
          combatLog.push(`Gained: +${result.totalRewards.experience} XP, +${result.totalRewards.gold} Gold`);

          if (result.totalRewards.items.length > 0) {
            combatLog.push(`Items: ${result.totalRewards.items.join(', ')}`);
          }
        } else {
          defeats++;
          currentPlayerHealth = result.playerHealthAfter;

          if (currentPlayerHealth <= 0) {
            combatLog.push(`Defeated! You were slain by ${monster.monster.name}`);
            combatLog.push(`Health: 0/${character.maxHealth} HP - DEAD`);

            // Add death notification for multi-monster battles
            addNotification({
              type: 'death',
              title: 'You have died!',
              message: `You were slain by ${monster.monster.name} during multi-monster battle.`,
              duration: 5000
            });
            break;
          } else {
            combatLog.push(`Defeated by ${monster.monster.name}`);
            combatLog.push(`Health: ${currentPlayerHealth}/${character.maxHealth} HP`);
          }
        }
      } catch (error) {
        defeats++;
        combatLog.push(`Combat error with ${monster.monster.name}`);
      }

      combatLog.push('');
    }

    // Update final character state
    const finalCharacter = {
      ...character,
      currentHealth: currentPlayerHealth,
      experience: character.experience + totalRewards.experience,
      gold: character.gold + totalRewards.gold,
      wins: character.wins + victories,
      losses: character.losses + defeats
    };
    updateCharacter(finalCharacter);

    // Add final results to log
    combatLog.push('=== BATTLE SUMMARY ===');
    combatLog.push(`Victories: ${victories}/${aliveMonsters.length}`);
    combatLog.push(`Defeats: ${defeats}/${aliveMonsters.length}`);
    combatLog.push(`Final Health: ${currentPlayerHealth}/${character.maxHealth} HP`);
    combatLog.push('');
    combatLog.push('Total Rewards:');
    combatLog.push(`Experience: +${totalRewards.experience} XP`);
    combatLog.push(`Gold: +${totalRewards.gold}`);

    if (totalRewards.items.length > 0) {
      combatLog.push(`Items Found: ${totalRewards.items.join(', ')}`);
    }

    const overallVictory = victories > defeats && currentPlayerHealth > 0;

    return {
      id: `battle_all_${Date.now()}`,
      playerName: character.name,
      playerHealthBefore,
      playerHealthAfter: currentPlayerHealth,
      playerMaxHealth: character.maxHealth,
      victory: overallVictory,
      monstersKilled,
      totalRewards,
      combatLog,
      timestamp: battleStartTime,
      battleDuration: Date.now() - battleStartTime,
      weaponName: character.equipment.mainHand?.name || 'fists',
      weaponRarity: character.equipment.mainHand?.rarity || 'common',
      offHandWeaponName: undefined,
      offHandWeaponRarity: undefined
    };
  };

  const removeDeadMonster = (spawnedMonsterId: string): void => {
    if (!wildernessState) return;

    // Find and remove the monster from its tile
    for (const row of wildernessState.currentMap.tiles) {
      for (const tile of row) {
        const monsterIndex = tile.spawnedMonsters.findIndex(m => m.id === spawnedMonsterId);
        if (monsterIndex !== -1) {
          tile.spawnedMonsters.splice(monsterIndex, 1);
          // Update wilderness state to trigger re-render
          setWildernessState(prev => prev ? { ...prev } : null);
          return;
        }
      }
    }
  };

  const getAvailableMoves = (): { x: number; y: number }[] => {
    if (!wildernessState) return [];

    const { playerPosition, currentMap } = wildernessState;
    const moves: { x: number; y: number }[] = [];

    // Check all adjacent tiles (including diagonals)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip current position

        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;

        // Check bounds
        if (newX >= 0 && newX < currentMap.width && newY >= 0 && newY < currentMap.height) {
          moves.push({ x: newX, y: newY });
        }
      }
    }

    return moves;
  };

  // Health system functions
  const healCharacter = (amount?: number) => {
    if (!gameState.currentCharacter) return;

    const character = gameState.currentCharacter;
    const newHealth = amount ?
      Math.min(character.maxHealth, character.currentHealth + amount) :
      character.maxHealth; // Full heal if no amount specified

    const updatedCharacter = {
      ...character,
      currentHealth: newHealth
    };

    updateCharacter(updatedCharacter);
  };

  const getHealthPercentage = (): number => {
    if (!gameState.currentCharacter) return 0;

    const character = gameState.currentCharacter;
    return Math.floor((character.currentHealth / character.maxHealth) * 100);
  };

  const isPlayerDead = (): boolean => {
    return gameState.currentCharacter?.currentHealth === 0;
  };

  // Notification system functions
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setNotifications(prev => [...prev, newNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const debugSaveData = async () => {
    try {
      const dataToSave = {
        ...gameState,
        wildernessState,
        lastSave: Date.now()
      };
      console.log('=== DEBUG SAVE DATA ===');
      console.log('Current Character:', gameState.currentCharacter?.name);
      console.log('Character Inventory Length:', gameState.currentCharacter?.inventory?.length || 0);
      console.log('Character Inventory Items:', gameState.currentCharacter?.inventory?.map(i => i.name) || []);
      console.log('Character Gold:', gameState.currentCharacter?.gold);
      console.log('Character Experience:', gameState.currentCharacter?.experience);
      console.log('Wilderness State:', wildernessState ? 'exists' : 'null');
      console.log('Save Data Size:', JSON.stringify(dataToSave).length, 'characters');
      console.log('=== END DEBUG ===');
    } catch (err) {
      console.error('Debug save data error:', err);
    }
  };

  // TEST FUNCTION: Add a test item to inventory
  const addTestItem = () => {
    if (!gameState.currentCharacter) {
      console.error('❌ No current character for test');
      return;
    }

    console.log('Test - Creating test item...');
    const testItem = generateItem(baseItems[0], 5); // Generate a level 5 iron sword
    console.log('Test - Test item created:', testItem.name, testItem.id);

    addItemToInventory(testItem);
    console.log('Test - Test item added to inventory');

    // Test new gem drop system
    const { createGem, generateGemDrop, getGemDropInfo } = require('../data/gems');

    // Add some new gem types for testing
    const citrineGem = createGem('citrine', 'normal', 5);
    const amberGem = createGem('amber', 'greater', 5);
    const rubyGem = createGem('ruby', 'perfect', 5);

    console.log('Test - Test gems created:', citrineGem.name, amberGem.name, rubyGem.name);

    addItemToInventory(citrineGem);
    addItemToInventory(amberGem);
    addItemToInventory(rubyGem);

    // Test the new drop system
    console.log('Test - Testing gem drop system...');

    // Test different monster rarities
    const testMonsters = [
      { level: 10, rarity: 'common' as const },
      { level: 20, rarity: 'rare' as const },
      { level: 35, rarity: 'elite' as const }
    ];

    testMonsters.forEach(monster => {
      const dropInfo = getGemDropInfo(monster.level, monster.rarity);
      console.log(`Test - Level ${monster.level} ${monster.rarity} monster:`);
      console.log(`   Total gem drop chance: ${(dropInfo.totalChance * 100).toFixed(1)}%`);
      console.log(`   Top drops:`, dropInfo.topDrops.map((d: { tier: string; name: string; chance: number }) =>
        `${d.tier} ${d.name} (${(d.chance * 100).toFixed(2)}%)`
      ).join(', '));

      // Generate a test drop
      const testDrop = generateGemDrop(monster.level, monster.rarity);
      if (testDrop) {
        console.log(`   Test drop: ${testDrop.name}`);
        addItemToInventory(testDrop);
      } else {
        console.log(`   No gem dropped`);
      }
    });

    console.log('Test - Test gems and drops added to inventory');
  };

  // Portal/Map system functions
  const getAvailableMaps = () => {
    if (!gameState.currentCharacter) return [];

    try {
      if (!mapConfigs || !Array.isArray(mapConfigs) || mapConfigs.length === 0) {
        console.error('mapConfigs is invalid:', mapConfigs);
        return [];
      }
      
    return mapConfigs;
    } catch (error) {
      console.error('Error in getAvailableMaps:', error);
      return [];
    }
  };

  const canAccessMap = (mapId: string): boolean => {
    if (!gameState.currentCharacter) return false;

    const map = getMapById(mapId);
    if (!map) return false;

    // First map is always accessible
    if (map.id === 'greenwood_valley') return true;

    // For other maps, check level requirement only (ignore boss requirements for now)
    if (map.portalRequirement?.minLevel) {
      return gameState.currentCharacter.level >= map.portalRequirement.minLevel;
    }

    return true;
  };

  const switchToMap = async (mapId: string): Promise<void> => {
    if (!gameState.currentCharacter || !canAccessMap(mapId)) {
      throw new Error('Cannot access this map');
    }

    const mapConfig = getMapById(mapId);
    if (!mapConfig) {
      throw new Error('Map not found');
    }

    // Create the new wilderness map
    const newMap = createWildernessMap(mapConfig);

    // Update wilderness state
    setWildernessState({
      currentMap: newMap,
      playerPosition: {
        x: newMap.startingPosition.x,
        y: newMap.startingPosition.y,
        mapId: newMap.id,
        lastMoved: Date.now()
      },
      encounters: [],
      exploredTiles: new Set([`tile_${newMap.id}_${newMap.startingPosition.x}_${newMap.startingPosition.y}`]),
      activeEncounter: undefined
    });

    // Save the game after switching maps
    setTimeout(() => saveGame(), 100);
  };

  // Experience system functions
  const getExperienceForLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  const getExperiencePercentage = (character?: Character): number => {
    const char = character || gameState.currentCharacter;
    if (!char) return 0;
    const nextLevelExp = getExperienceForLevel(char.level + 1);
    const percentage = (char.experience / nextLevelExp) * 100;
    return Math.max(0, Math.min(100, percentage)); // Clamp between 0-100
  };

  const getExperienceToNextLevel = (character?: Character): number => {
    const char = character || gameState.currentCharacter;
    if (!char) return 0;
    const nextLevelExp = getExperienceForLevel(char.level + 1);
    return Math.max(0, nextLevelExp - char.experience);
  };

  // Gem system functions
  const consumeGem = (gemId: string): boolean => {
    if (!gameState.currentCharacter) return false;

    const character = gameState.currentCharacter;
    const gem = character.inventory.find(item => item.id === gemId && item.type === 'gem');

    if (!gem) return false;

    try {
      const { consumeGem: consumeGemUtil } = require('../utils/combatEngine');
      const updatedCharacter = consumeGemUtil(character, gem);

      updateCharacter(updatedCharacter);

      addNotification({
        type: 'gem_drop',
        title: 'Gem Broken!',
        message: `${gem.name} broken, releasing its power. ${(gem as any).consumeEffect?.description || 'Effect applied!'}`,
        duration: 3000,
        gemDetails: {
          name: gem.name,
          gemType: (gem as any).gemType
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to consume gem:', error);
      return false;
    }
  };

  const fuseGems = (gemIds: string[]): boolean => {
    if (!gameState.currentCharacter) return false;

    const character = gameState.currentCharacter;
    const gems = gemIds.map(id => character.inventory.find(item => item.id === id && item.type === 'gem')).filter(Boolean) as any[];

    if (gems.length < 2) return false;

    try {
      const { fuseGems: fuseGemsUtil } = require('../data/gems');
      const fusionResult = fuseGemsUtil(gems);

      // Remove consumed gems regardless of success/failure (they are destroyed)
      const updatedCharacter = {
        ...character,
        inventory: character.inventory.filter(item => !gemIds.includes(item.id))
      };

      if (!fusionResult.success) {
        // Fusion failed - gems are destroyed
        updateCharacter(updatedCharacter);

        addNotification({
          type: 'gem_drop',
          title: 'Fusion Failed!',
          message: `Fusion failed (${(fusionResult.failureChance * 100).toFixed(0)}% chance)! Your ${gems.length} ${gems[0].name}s were destroyed in the process.`,
          duration: 4000,
          gemDetails: {
            name: gems[0].name,
            gemType: gems[0].gemType
          }
        });

        return false;
      }

      // Fusion succeeded - add the result gem
      updatedCharacter.inventory.push(fusionResult.result!);
      updateCharacter(updatedCharacter);

      addNotification({
        type: 'gem_drop',
        title: 'Fusion Successful!',
        message: `${gems.length} ${gems[0].name}s successfully fused into ${fusionResult.result!.name}!`,
        duration: 3000,
        gemDetails: {
          name: fusionResult.result!.name,
          gemType: fusionResult.result!.gemType
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to fuse gems:', error);
      return false;
    }
  };

  const getActiveGemEffects = (): string[] => {
    if (!gameState.currentCharacter) return [];

    try {
      const { getActiveGemEffectsSummary } = require('../utils/combatEngine');
      return getActiveGemEffectsSummary(gameState.currentCharacter);
    } catch (error) {
      console.error('Failed to get gem effects:', error);
      return [];
    }
  };

  const contextValue: GameContextType = {
    gameState,
    currentCharacter: gameState.currentCharacter || null,
    createCharacter,
    selectCharacter,
    deleteCharacter,
    updateCharacter,
    startBattle,
    getBattleHistory,
    equipItem,
    unequipItem,
    addItemToInventory,
    removeItemFromInventory,
    sellItem,
    purchaseItem,
    consumeGem,
    fuseGems,
    getActiveGemEffects,
    regenerateEnergy,
    checkLevelUp,
    performLevelUp,
    wildernessState,
    moveToTile,
    fightMonster,
    battleAllMonsters,
    removeDeadMonster,
    getAvailableMoves,
    getAvailableMaps,
    switchToMap,
    canAccessMap,
    healCharacter,
    getHealthPercentage,
    isPlayerDead,
    notifications,
    addNotification,
    dismissNotification,
    saveGame,
    loadGame,
    debugSaveData,
    addTestItem,
    getExperienceForLevel,
    getExperiencePercentage,
    getExperienceToNextLevel,
    isLoading,
    error
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 