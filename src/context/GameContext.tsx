import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character, GameState, StatType, TrainingResult, CombatResult, Item, ItemType, WildernessState, PlayerPosition, SpawnedMonster, DetailedBattleResult } from '../types';
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

  // Training system
  trainStat: (statType: StatType) => Promise<TrainingResult>;
  canTrain: (statType: StatType) => boolean;
  getTrainingCost: (statType: StatType) => { energy: number; gold: number };

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
        lastTraining: {
          strength: 0,
          dexterity: 0,
          constitution: 0,
          intelligence: 0,
          speed: 0
        },
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

  const getTrainingCost = (statType: StatType) => {
    if (!gameState.currentCharacter) return { energy: 0, gold: 0 };

    const character = gameState.currentCharacter;
    const currentStatValue = character.stats[statType];
    const baseEnergyCost = 20;
    const baseGoldCost = 50;

    // Cost increases with stat level
    const energyCost = Math.floor(baseEnergyCost * (1 + currentStatValue * 0.1));
    const goldCost = Math.floor(baseGoldCost * (1 + currentStatValue * 0.05));

    return { energy: energyCost, gold: goldCost };
  };

  const canTrain = (statType: StatType): boolean => {
    if (!gameState.currentCharacter) return false;

    const character = gameState.currentCharacter;
    const cost = getTrainingCost(statType);
    const cooldownTime = 30 * 60 * 1000; // 30 minutes
    const lastTrainingTime = character.lastTraining[statType];
    const now = Date.now();

    return (
      character.currentHealth > 0 && // Cannot train when dead
      character.energy >= cost.energy &&
      character.gold >= cost.gold &&
      (now - lastTrainingTime) >= cooldownTime
    );
  };

  const trainStat = async (statType: StatType): Promise<TrainingResult> => {
    if (!gameState.currentCharacter || !canTrain(statType)) {
      throw new Error('Cannot train this stat right now');
    }

    const character = gameState.currentCharacter;
    const cost = getTrainingCost(statType);
    const oldValue = character.stats[statType];

    // Training success rate (95% base, reduced by stat level)
    const successRate = Math.max(50, 95 - (oldValue * 2));
    const success = Math.random() * 100 < successRate;

    // Critical success (10% chance on success)
    const criticalSuccess = success && Math.random() * 100 < 10;

    let statGain = 0;
    if (success) {
      statGain = criticalSuccess ? 2 : 1;
    }

    const newValue = oldValue + statGain;

    // Update character
    const updatedCharacter = {
      ...character,
      stats: { ...character.stats, [statType]: newValue },
      energy: character.energy - cost.energy,
      gold: character.gold - cost.gold,
      lastTraining: { ...character.lastTraining, [statType]: Date.now() }
    };

    setGameState(prev => ({
      ...prev,
      currentCharacter: updatedCharacter,
      characters: prev.characters.map(c =>
        c.id === character.id ? updatedCharacter : c
      )
    }));

    const result: TrainingResult = {
      statType,
      oldValue,
      newValue,
      energyCost: cost.energy,
      goldCost: cost.gold,
      success,
      criticalSuccess
    };

    await saveGame();
    return result;
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

    const character = gameState.currentCharacter;
    console.log('Equipping item:', item.name, 'to character:', character.name);
    console.log('Character inventory before:', character.inventory?.length || 0, 'items');

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
    } else {
      // For non-weapons, use direct mapping
      const slotMap: Record<Exclude<ItemType, 'weapon'>, keyof Character['equipment']> = {
        armor: 'armor',
        helmet: 'helmet',
        boots: 'boots',
        accessory: 'accessory'
      };

      targetSlot = slotMap[item.type as Exclude<ItemType, 'weapon'>];
      currentEquipped = character.equipment[targetSlot];
    }

    console.log('Target slot:', targetSlot, 'Currently equipped:', currentEquipped?.name || 'none');

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

    console.log('Updated character inventory after:', updatedCharacter.inventory.length, 'items');

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
    if (!gameState.currentCharacter) return;

    const character = gameState.currentCharacter;
    const updatedCharacter = {
      ...character,
      inventory: [...character.inventory, item]
    };

    setGameState(prev => ({
      ...prev,
      currentCharacter: updatedCharacter,
      characters: prev.characters.map(c =>
        c.id === character.id ? updatedCharacter : c
      )
    }));
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

    // Check for monster spawn
    const now = Date.now();
    const timeSinceLastSpawn = now - targetTile.lastSpawnCheck;
    const minSpawnCooldown = 250; // 3 seconds minimum between spawn attempts

    if (timeSinceLastSpawn > minSpawnCooldown && Math.random() < targetTile.spawnRate) {
      spawnMonsterOnTile(targetTile);
      targetTile.lastSpawnCheck = now;
    }

    // Update wilderness state
    setWildernessState(prev => prev ? {
      ...prev,
      playerPosition: newPosition,
      exploredTiles: newExploredTiles
    } : null);

    // Save game after wilderness movement
    setTimeout(() => saveGame(), 100);
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

  const selectRandomMonster = (monsters: any[]) => {
    // Weighted selection based on rarity
    const weights = {
      common: 50,
      uncommon: 30,
      rare: 15,
      elite: 4,
      boss: 1
    };

    const totalWeight = monsters.reduce((sum, monster) => sum + (weights as any)[monster.rarity], 0);
    let random = Math.random() * totalWeight;

    for (const monster of monsters) {
      random -= (weights as any)[monster.rarity];
      if (random <= 0) return monster;
    }

    return monsters[0]; // Fallback
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

    // Calculate final guaranteed rewards
    totalExperience = Math.floor(baseXP * rarityMultiplier * levelMultiplier);
    totalGold = Math.floor(baseGold * rarityMultiplier * levelMultiplier);

    // BONUS REWARDS from loot table (in addition to guaranteed rewards)
    monster.lootTable.forEach(drop => {
      if (Math.random() <= drop.chance) {
        // Add bonus gold
        if (drop.gold) {
          totalGold += drop.gold;
        }

        // Add bonus experience
        if (drop.experience) {
          totalExperience += drop.experience;
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
        battleDuration: Date.now() - battleStartTime
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
        battleDuration: Date.now() - battleStartTime
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
        lastTraining: {
          strength: 0,
          dexterity: 0,
          constitution: 0,
          intelligence: 0,
          speed: 0
        },
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
        lootResult.items.forEach(item => {
          addItemToInventory(item);

          // Show notification for item drop
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
          emoji: spawnedMonster.monster.emoji,
          experience: rewards.experience,
          gold: rewards.gold
        });

        // Apply rewards and update character
        const updatedCharacter = {
          ...character,
          experience: character.experience + rewards.experience,
          gold: character.gold + rewards.gold,
          currentHealth: playerHealthAfter,
          wins: character.wins + 1
        };

        updateCharacter(updatedCharacter);
        removeDeadMonster(spawnedMonsterId);
      } else {
        // Apply defeat penalty
        const updatedCharacter = {
          ...character,
          currentHealth: playerHealthAfter,
          losses: character.losses + 1
        };
        updateCharacter(updatedCharacter);
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
        battleDuration: Date.now() - battleStartTime
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
        battleDuration: Date.now() - battleStartTime
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
        battleDuration: Date.now() - battleStartTime
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
        battleDuration: Date.now() - battleStartTime
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
        battleDuration: Date.now() - battleStartTime
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
      battleDuration: Date.now() - battleStartTime
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
      const savedData = await PlatformStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('=== SAVE DATA DEBUG ===');
        console.log('Platform:', PlatformStorage.getPlatformInfo());
        console.log('Characters:', parsedData.characters?.length || 0);
        console.log('Current Character:', parsedData.currentCharacter?.name || 'None');
        console.log('Wilderness State:', parsedData.wildernessState ? 'Present' : 'Missing');
        console.log('Last Save:', new Date(parsedData.lastSave).toLocaleString());
        console.log('Data size:', savedData.length, 'characters');
        console.log('======================');
      } else {
        console.log('No save data found');
      }
    } catch (err) {
      console.error('Failed to debug save data:', err);
    }
  };

  // Portal/Map system functions
  const getAvailableMaps = () => {
    if (!gameState.currentCharacter) return [];

    // For now, return all maps - we'll filter by level in the UI
    // TODO: Track defeated bosses in character data
    return mapConfigs;
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

  const contextValue: GameContextType = {
    gameState,
    currentCharacter: gameState.currentCharacter || null,
    createCharacter,
    selectCharacter,
    deleteCharacter,
    updateCharacter,
    trainStat,
    canTrain,
    getTrainingCost,
    startBattle,
    getBattleHistory,
    equipItem,
    unequipItem,
    addItemToInventory,
    removeItemFromInventory,
    sellItem,
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