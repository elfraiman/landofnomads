import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGame } from '../../context/GameContext';
import { DetailedBattleResult } from '../../types';
import { BattleResultsModal } from '../combat/BattleResultsModal';
import { useCustomAlert } from '../ui/CustomAlert';
import { Colors, ColorUtils, RPGTextStyles, MapGradients } from '../../utils/colors';
import { PortalModal } from './PortalModal';
import { MerchantModal } from './MerchantModal';
import { getTileEmoji } from '../../data/wilderness';

const { width: screenWidth } = Dimensions.get('window');
const TILE_SIZE = Math.min((screenWidth - 60) / 4, 80); // Responsive tile size

export const WildernessTab: React.FC = () => {
  const { wildernessState, moveToTile, fightMonster, getAvailableMoves, currentCharacter, updateCharacter, isPlayerDead, getAvailableMaps, switchToMap, canAccessMap } = useGame();
  const [isMoving, setIsMoving] = useState(false);
  const [isFighting, setIsFighting] = useState(false);
  const [battleResult, setBattleResult] = useState<DetailedBattleResult | null>(null);
  const [showBattleResults, setShowBattleResults] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<{
    name: string;
    description: string;
    mapId: string;
  } | null>(null);
  const { showAlert } = useCustomAlert();

  if (!wildernessState || !currentCharacter) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Wilderness not available</Text>
      </View>
    );
  }

  const { currentMap, playerPosition } = wildernessState;
  const availableMoves = getAvailableMoves();
  const currentTile = currentMap.tiles[playerPosition.y][playerPosition.x];

  const handleTilePress = async (x: number, y: number) => {
    if (isMoving || isFighting) return;

    // Check if player is dead
    if (isPlayerDead()) {
      showAlert(
        'You are Dead',
        'You have died and cannot move. You must heal before you can take any actions.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Check if this is a valid move
    const isValidMove = availableMoves.some(move => move.x === x && move.y === y);
    if (!isValidMove && !(x === playerPosition.x && y === playerPosition.y)) {
      showAlert(
        'Invalid Move',
        'You can only move to adjacent tiles!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (x === playerPosition.x && y === playerPosition.y) {
      // Show current tile info
      const tile = currentMap.tiles[y][x];
      const monsterCount = tile.spawnedMonsters.filter(m => m.isAlive).length;

      // Check if this tile has a portal
      const hasPortal = tile.features?.some(feature => feature.type === 'portal' && feature.isActive);

      // Check if this tile has a merchant
      const hasMerchant = tile.type === 'merchant' || tile.npcs?.some(npc => npc.type === 'merchant');

      if (hasPortal) {
        showAlert(
          tile.name,
          `${tile.description}\n\nSpawn Rate: ${Math.round(tile.spawnRate * 100)}%\nLevel Range: ${tile.minLevel}-${tile.maxLevel}\nMonsters: ${monsterCount}\n\n🌀 Portal Hub Available!`,
          [
            { text: 'Use Portal', style: 'default', onPress: () => setShowPortalModal(true) },
            { text: 'Close', style: 'cancel' }
          ]
        );
      } else if (hasMerchant) {
        const merchant = tile.npcs?.find(npc => npc.type === 'merchant');
        showAlert(
          tile.name,
          `${tile.description}\n\nSpawn Rate: ${Math.round(tile.spawnRate * 100)}%\nLevel Range: ${tile.minLevel}-${tile.maxLevel}\nMonsters: ${monsterCount}\n\n🏪 Merchant Available!`,
          [
            {
              text: 'Visit Merchant',
              style: 'default',
              onPress: () => {
                setSelectedMerchant({
                  name: merchant?.name || tile.name,
                  description: merchant?.dialogue[0] || 'A traveling merchant with quality goods.',
                  mapId: currentMap.id
                });
                setShowMerchantModal(true);
              }
            },
            { text: 'Close', style: 'cancel' }
          ]
        );
      } else {
        showAlert(
          tile.name,
          `${tile.description}\n\nSpawn Rate: ${Math.round(tile.spawnRate * 100)}%\nLevel Range: ${tile.minLevel}-${tile.maxLevel}\nMonsters: ${monsterCount}`,
          [{ text: 'OK', style: 'default' }]
        );
      }
      return;
    }

    setIsMoving(true);

    try {
      await moveToTile(x, y);
      const tile = currentMap.tiles[y][x];
      const newMonsters = tile.spawnedMonsters.filter(m => m.isAlive);

      if (newMonsters.length > 0) {
        showAlert(
          'Moved to ' + tile.name,
          `${tile.description}\n\n${newMonsters.length} monster(s) spotted! Click on them to fight.`,
          [{ text: 'Continue', style: 'default' }]
        );
      } else {
        showAlert(
          'Moved to ' + tile.name,
          tile.description + '\n\nNo monsters here...',
          [{ text: 'Continue', style: 'default' }]
        );
      }
    } catch (error) {
      showAlert(
        'Movement Failed',
        'Unable to move to that location.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsMoving(false);
    }
  };

  const handleMonsterClick = (spawnedMonsterId: string) => {

    if (isFighting) {
      return;
    }

    // Check if player is dead
    if (isPlayerDead()) {
      showAlert(
        'You are Dead',
        'You have died and cannot fight. You must heal before you can take any actions.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Find the monster
    let monster = null;
    for (const row of currentMap.tiles) {
      for (const tile of row) {
        const found = tile.spawnedMonsters.find(m => m.id === spawnedMonsterId && m.isAlive);
        if (found) {
          monster = found;
          break;
        }
      }
      if (monster) break;
    }

    if (!monster) {
      console.log('Monster not found!');
      return;
    }

    // Directly start combat - no confirmation needed
    handleCombat(spawnedMonsterId);
  };

  const handleCombat = async (spawnedMonsterId: string) => {
    if (!currentCharacter || isFighting) return;

    setIsFighting(true);

    try {
      const result = await fightMonster(spawnedMonsterId);

      // Show detailed battle results
      setBattleResult(result);
      setShowBattleResults(true);
    } catch (error) {
      console.error('Combat error:', error);
      // Combat error - just log it for now
    } finally {
      setIsFighting(false);
    }
  };

  const handlePortalSwitch = async (mapId: string) => {
    try {
      setIsMoving(true);
      await switchToMap(mapId);

      showAlert(
        'Portal Travel Complete',
        `You have successfully traveled to a new realm!`,
        [{ text: 'Explore', style: 'default' }]
      );
    } catch (error) {
      showAlert(
        'Portal Travel Failed',
        error instanceof Error ? error.message : 'Unable to travel to that realm.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsMoving(false);
    }
  };

  const getTileStyle = (x: number, y: number) => {
    const tile = currentMap.tiles[y][x];
    const isCurrentPosition = x === playerPosition.x && y === playerPosition.y;
    const isAvailableMove = availableMoves.some(move => move.x === x && move.y === y);
    const isVisited = tile.visited;

    // Get map-specific colors
    const tileColors = ColorUtils.getTileColors(
      currentMap.id, 
      tile.type, 
      isCurrentPosition, 
      isAvailableMove && !isCurrentPosition, 
      isVisited
    );

    return [
      styles.tile,
      {
        backgroundColor: tileColors.backgroundColor,
        borderColor: tileColors.borderColor,
      },
      isCurrentPosition && styles.currentTile,
      isAvailableMove && !isCurrentPosition && styles.availableTile,
      !isVisited && styles.unexploredTile
    ];
  };

  const getTileOpacity = (x: number, y: number) => {
    const tile = currentMap.tiles[y][x];
    if (!tile.visited) return 0.3;
    if (x === playerPosition.x && y === playerPosition.y) return 1;
    if (availableMoves.some(move => move.x === x && move.y === y)) return 0.8;
    return 0.6;
  };

  const renderLegend = () => (
    <View style={styles.legend}>
      <Text style={styles.legendTitle}>Tile Legend</Text>
      <View style={styles.legendGrid}>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>P</Text>
          <Text style={styles.legendText}>Player</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>G</Text>
          <Text style={styles.legendText}>Grass</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>F</Text>
          <Text style={styles.legendText}>Forest</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>M</Text>
          <Text style={styles.legendText}>Mountain</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>C</Text>
          <Text style={styles.legendText}>Cave</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>V</Text>
          <Text style={styles.legendText}>Village</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>O</Text>
          <Text style={styles.legendText}>Portal</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>S</Text>
          <Text style={styles.legendText}>Shop</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Map Header */}
      <View style={[styles.header, ColorUtils.createMapGradientStyle(currentMap.id)]}>
        <Text style={styles.title}>{currentMap.name}</Text>
        <Text style={styles.subtitle}>{currentMap.description}</Text>
        <Text style={styles.atmosphereText}>
          {ColorUtils.getMapGradient(currentMap.id).atmosphere}
        </Text>
        <View style={styles.positionInfo}>
          <Text style={styles.positionText}>
            Position: ({playerPosition.x}, {playerPosition.y})
          </Text>
          <Text style={styles.positionText}>
            Location: {currentMap.tiles[playerPosition.y][playerPosition.x].name}
          </Text>
          <Text style={[styles.positionText, currentTile.spawnedMonsters.filter(m => m.isAlive).length > 0 ? styles.monsterCountActive : styles.monsterCountInactive]}>
            Monsters: {currentTile.spawnedMonsters.filter(m => m.isAlive).length}
          </Text>
          {__DEV__ && (
            <Text style={styles.devInfo}>
              DEV MODE | Level: {currentCharacter?.level || 1} | Check Character Stats for dev tools
            </Text>
          )}
        </View>
      </View>

      {/* Health Status */}
      {/*     <View style={styles.healthSection}>
        <View style={styles.healthInfo}>
          <Text style={styles.healthTitle}>Health Status</Text>
          <View style={styles.healthBarContainer}>
            <View style={styles.healthBar}>
              <View style={[
                styles.healthFill,
                {
                  width: `${healthPercentage}%`,
                  backgroundColor: healthPercentage > 60 ? '#28a745' : healthPercentage > 30 ? '#ffc107' : '#dc3545'
                }
              ]} />
            </View>
            <Text style={styles.healthText}>
              {currentCharacter?.currentHealth}/{currentCharacter?.maxHealth} HP ({healthPercentage}%)
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.restButton,
            (currentCharacter?.currentHealth >= currentCharacter?.maxHealth ||
              currentCharacter?.energy < 20 ||
              isFighting ||
              isMoving) && styles.restButtonDisabled
          ]}
          onPress={handleRest}
          disabled={
            currentCharacter?.currentHealth >= currentCharacter?.maxHealth ||
            currentCharacter?.energy < 20 ||
            isFighting ||
            isMoving
          }
        >
          <Text style={[
            styles.restButtonText,
            (currentCharacter?.currentHealth >= currentCharacter?.maxHealth ||
              currentCharacter?.energy < 20 ||
              isFighting ||
              isMoving) && styles.restButtonTextDisabled
          ]}>
            Rest (20 Energy)
          </Text>
        </TouchableOpacity>
      </View> */}


      {/* Map Grid */}
      <View style={[styles.mapContainer, { borderColor: ColorUtils.getMapGradient(currentMap.id).secondary }]}>
        <View style={styles.mapGrid}>
          {currentMap.tiles.map((row, y) => (
            <View key={y} style={styles.mapRow}>
              {row.map((tile, x) => (
                <View key={`${x}-${y}`} style={styles.tileWrapper}>
                  <TouchableOpacity
                    style={getTileStyle(x, y)}
                    onPress={() => handleTilePress(x, y)}
                    disabled={isMoving || isFighting}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.tileContent, { opacity: getTileOpacity(x, y) }]}>
                      <Text style={styles.tileEmoji}>
                        {getTileEmoji(tile.type)}
                        {x === playerPosition.x && y === playerPosition.y ? ' 👤' : ''}
                      </Text>
                      {tile.features?.some(f => f.type === 'portal' && f.isActive) && (
                        <Text style={styles.portalIndicator}>🌀</Text>
                      )}
                      {tile.npcs && tile.npcs.length > 0 && (
                        <Text style={styles.npcIndicator}>👤</Text>
                      )}
                      {!tile.visited && (
                        <View style={styles.fogOverlay}>
                          <Text style={styles.fogText}>?</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.tileName} numberOfLines={1}>
                      {tile.visited ? tile.name : '???'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>


      {/* Portal Section - Show when on a portal tile */}
      {currentTile.features?.some(f => f.type === 'portal' && f.isActive) && (
        <View style={[styles.portalSection, { borderColor: ColorUtils.getMapGradient(currentMap.id).accent }]}>
          <Text style={styles.sectionTitle}>🌀 Portal Hub</Text>
          <Text style={styles.portalDescription}>
            A mystical portal that can transport you to other realms. Each realm offers unique challenges and rewards!
          </Text>
          <Text style={styles.playerLevelText}>
            Your Level: {currentCharacter?.level || 1} | Higher levels unlock new realms!
          </Text>

          {/* Quick preview of available maps */}
          <View style={styles.mapPreview}>
            <Text style={styles.mapPreviewTitle}>Available Destinations:</Text>
            <View style={styles.mapPreviewList}>
              {getAvailableMaps().map((map) => (
                <Text key={map.id} style={[
                  styles.mapPreviewItem,
                  canAccessMap(map.id) ? styles.mapPreviewAvailable : styles.mapPreviewLocked
                ]}>
                  [{map.id === 'greenwood_valley' ? 'FOREST' :
                    map.id === 'shadowmere_swamps' ? 'SWAMP' :
                      map.id === 'crystal_caverns' ? 'CAVES' :
                        map.id === 'volcanic_peaks' ? 'VOLCANO' :
                          map.id === 'frozen_wastes' ? 'FROZEN' : 'MAP'}] {map.name}
                  {!canAccessMap(map.id) && ' [LOCKED]'}
                </Text>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.portalButton, (isMoving || isFighting) && styles.portalButtonDisabled]}
            onPress={() => setShowPortalModal(true)}
            disabled={isMoving || isFighting}
            activeOpacity={0.7}
          >
            <Text style={[styles.portalButtonText, (isMoving || isFighting) && styles.portalButtonTextDisabled]}>
              Open Portal
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Merchant Section - Show when on a merchant tile */}
      {(currentTile.type === 'merchant' || currentTile.npcs?.some(npc => npc.type === 'merchant')) && (
        <View style={[styles.merchantSection, { borderColor: ColorUtils.getMapGradient(currentMap.id).accent }]}>
          <Text style={styles.merchantSectionTitle}>Merchant</Text>
          <Text style={styles.merchantDescription}>
            A traveling merchant has set up shop here with goods suited to this region. Browse their wares to find equipment perfect for the challenges ahead!
          </Text>
          <Text style={styles.playerLevelText}>
            Your Level: {currentCharacter?.level || 1} | Higher level items available!
          </Text>

          <TouchableOpacity
            style={[styles.merchantButton, (isMoving || isFighting) && styles.merchantButtonDisabled]}
            onPress={() => {
              const merchant = currentTile.npcs?.find(npc => npc.type === 'merchant');
              setSelectedMerchant({
                name: merchant?.name || currentTile.name,
                description: merchant?.dialogue[0] || 'A traveling merchant with quality goods.',
                mapId: currentMap.id
              });
              setShowMerchantModal(true);
            }}
            disabled={isMoving || isFighting}
            activeOpacity={0.7}
          >
            <Text style={[styles.merchantButtonText, (isMoving || isFighting) && styles.merchantButtonTextDisabled]}>
              Browse Wares
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current Tile Monsters */}
      <View style={styles.monstersSection}>
        {currentTile.spawnedMonsters.filter(m => m.isAlive).length > 0 ? (
          <>
            <View style={styles.monstersSectionHeader}>
              <Text style={styles.monstersSectionTitle}>
                Monsters in {currentTile.name}
              </Text>
              <Text style={styles.monstersCount}>
                ({currentTile.spawnedMonsters.filter(m => m.isAlive).length})
              </Text>
            </View>
            <Text style={styles.scrollHint}>
              Scroll to see all monsters • Tap to fight
            </Text>
            <ScrollView 
              style={styles.monstersScrollView}
              contentContainerStyle={styles.monstersScrollContent}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {currentTile.spawnedMonsters
                .filter(m => m.isAlive)
                .map((spawnedMonster) => (
                  <TouchableOpacity
                    key={spawnedMonster.id}
                    style={styles.monsterCard}
                    onPress={() => handleMonsterClick(spawnedMonster.id)}
                    disabled={isFighting}
                    activeOpacity={0.7}
                  >
                    <View style={styles.monsterCardContent}>
                      <View style={styles.monsterMainInfo}>
                        <Text style={styles.monsterName}>
                          {spawnedMonster.monster.name}
                        </Text>
                        <Text style={styles.monsterLevel}>
                          Lv.{spawnedMonster.monster.level}
                        </Text>
                      </View>
                      <View style={styles.monsterStats}>
                        <Text style={styles.monsterStat}>
                          Tap to Fight
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </>
        ) : (
          <Text style={styles.noMonstersText}>No monsters in this area</Text>
        )}
      </View>
      {/* Legend */}
      {renderLegend()}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Explore & Grind</Text>
        <Text style={styles.instructionsText}>
          • Tap adjacent tiles to move{'\n'}
          • Green tiles are available moves{'\n'}
          • Red circles are spawned monsters{'\n'}
          • Click monster names to fight them{'\n'}
          • Move around to spawn more monsters{'\n'}
          • Fight monsters for experience and gold{'\n'}
          • Rest to recover health (costs energy){'\n'}
          • Perfect for grinding and exploration!
        </Text>
      </View>

      {/* Battle Results Modal */}
      <BattleResultsModal
        battleResult={battleResult}
        visible={showBattleResults}
        currentCharacter={currentCharacter}
        onHealCharacter={(cost: number) => {
          if (currentCharacter && currentCharacter.gold >= cost) {
            const updatedCharacter = {
              ...currentCharacter,
              currentHealth: currentCharacter.maxHealth, // Set to full health
              gold: currentCharacter.gold - cost
            };
            updateCharacter(updatedCharacter);

            // Show confirmation
            showAlert(
              'Healed Successfully',
              `You have been fully healed for ${cost} gold!`,
              [{ text: 'OK', style: 'default' }]
            );
          }
        }}
        onClose={() => {
          setShowBattleResults(false);
          setBattleResult(null);
        }}
      />

      {/* Portal Modal */}
      <PortalModal
        visible={showPortalModal}
        availableMaps={getAvailableMaps()}
        currentMapId={currentMap.id}
        playerLevel={currentCharacter?.level || 1}
        onSelectMap={handlePortalSwitch}
        onClose={() => setShowPortalModal(false)}
        canAccessMap={canAccessMap}
      />

      {/* Merchant Modal */}
      {selectedMerchant && (
        <MerchantModal
          visible={showMerchantModal}
          merchantName={selectedMerchant.name}
          merchantDescription={selectedMerchant.description}
          mapId={selectedMerchant.mapId}
          playerLevel={currentCharacter?.level || 1}
          onClose={() => {
            setShowMerchantModal(false);
            setSelectedMerchant(null);
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  contentContainer: {
    padding: 16
  },
  header: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  title: {
    ...RPGTextStyles.h1,
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...RPGTextStyles.body,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  atmosphereText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  positionInfo: {
    alignItems: 'center'
  },
  positionText: {
    fontSize: 14,
    color: Colors.info,
    marginBottom: 4,
    fontWeight: '600',
  },
  monsterCountActive: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  monsterCountInactive: {
    color: Colors.info
  },
  devInfo: {
    fontSize: 11,
    color: Colors.warning,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  portalSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.info,
    shadowColor: Colors.info,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  sectionTitle: {
    ...RPGTextStyles.h2,
    color: Colors.primary,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 5,
  },
  portalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20
  },
  playerLevelText: {
    fontSize: 12,
    color: Colors.info,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  portalButton: {
    backgroundColor: Colors.info,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.info,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  portalButtonDisabled: {
    backgroundColor: Colors.surfaceElevated,
    shadowOpacity: 0.1,
  },
  portalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  portalButtonTextDisabled: {
    color: Colors.textMuted,
  },
  mapPreview: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  mapPreviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  mapPreviewList: {
    gap: 4,
  },
  mapPreviewItem: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 2,
  },
  mapPreviewAvailable: {
    color: Colors.success,
  },
  mapPreviewLocked: {
    color: Colors.textMuted,
  },
  monstersSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.error,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  monstersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  monstersSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  monstersCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  scrollHint: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  monstersScrollView: {
    height: 200,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  monstersScrollContent: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  monsterCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 8,
    marginVertical: 4,
    shadowColor: Colors.error,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  monsterCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  monsterMainInfo: {
    flex: 1
  },
  monsterName: {
    ...RPGTextStyles.bodySmall,
    color: Colors.text,
    fontWeight: '700',
  },
  monsterLevel: {
    ...RPGTextStyles.caption,
    color: Colors.error,
    fontWeight: '600',
  },
  monsterStats: {
    flexDirection: 'row',
    gap: 8
  },
  monsterStat: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  noMonstersText: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mapContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  mapGrid: {
    alignItems: 'center'
  },
  mapRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: 2,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: Colors.background,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  currentTile: {
    borderColor: Colors.info,
    borderWidth: 3,
    backgroundColor: ColorUtils.withOpacity(Colors.info, 0.2),
    shadowColor: Colors.info,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  availableTile: {
    borderColor: Colors.success,
    backgroundColor: ColorUtils.withOpacity(Colors.success, 0.15),
    shadowColor: Colors.success,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  unexploredTile: {
    backgroundColor: Colors.surface,
    opacity: 0.6,
  },
  tileContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%'
  },
  tileEmoji: {
    fontSize: 18,
    marginBottom: 2,
    color: Colors.text,
    fontWeight: 'bold',
  },
  portalIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 12,
  },
  npcIndicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: 12,
  },
  tileName: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  fogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ColorUtils.withOpacity(Colors.background, 0.8),
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fogText: {
    ...RPGTextStyles.h1,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  legend: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  legendTitle: {
    ...RPGTextStyles.h3,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8
  },
  legendItem: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    padding: 6,
    minWidth: 45,
    flex: 1,
    maxWidth: '22%',
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  legendEmoji: {
    fontSize: 12,
    marginBottom: 2,
    color: Colors.text,
    fontWeight: 'bold',
  },
  legendText: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  instructions: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  instructionsTitle: {
    ...RPGTextStyles.h3,
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  instructionsText: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  errorText: {
    ...RPGTextStyles.body,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '700',
  },
  tileWrapper: {
    position: 'relative'
  },
  merchantSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  merchantSectionTitle: {
    ...RPGTextStyles.h3,
    color: Colors.accent,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  merchantDescription: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  merchantButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  merchantButtonDisabled: {
    backgroundColor: Colors.surfaceElevated,
    shadowOpacity: 0.1,
  },
  merchantButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  merchantButtonTextDisabled: {
    color: Colors.textMuted,
  },
}); 