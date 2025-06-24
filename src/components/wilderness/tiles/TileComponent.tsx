import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, ColorUtils } from '../../../utils/colors';
import { WildernessTile } from '../../../types/wilderness';

interface TileComponentProps {
  tile: WildernessTile;
  isCurrentPosition: boolean;
  isAvailableMove: boolean;
  isVisited: boolean;
  opacity: number;
  size: number;
  onPress: () => void;
  disabled?: boolean;
}

export const TileComponent: React.FC<TileComponentProps> = ({
  tile,
  isCurrentPosition,
  isAvailableMove,
  isVisited,
  opacity,
  size,
  onPress,
  disabled = false
}) => {
  const getTileStyle = () => {
    return [
      styles.tile,
      { width: size, height: size },
      isCurrentPosition && styles.currentTile,
      isAvailableMove && !isCurrentPosition && styles.availableTile,
      !isVisited && styles.unexploredTile
    ];
  };

  const getTileIcon = () => {
    // Each tile type can have custom rendering logic
    switch (tile.type) {
      case 'village':
        return '🏘️';
      case 'forest':
        return '🌲';
      case 'mountain':
        return '⛰️';
      case 'water':
        return '🌊';
      case 'cave':
        return '🕳️';
      case 'ruins':
        return '🏛️';
      case 'grass':
        return '🌱';
      case 'road':
        return '🛤️';
      case 'portal':
        return '🌀';
      default:
        return '❓';
    }
  };

  const hasPortal = tile.features?.some(f => f.type === 'portal' && f.isActive);
  const hasNPCs = tile.npcs && tile.npcs.length > 0;

  return (
    <TouchableOpacity
      style={getTileStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.tileContent, { opacity }]}>
        <Text style={styles.tileIcon}>
          {getTileIcon()}
          {isCurrentPosition ? ' P' : ''}
        </Text>

        {/* Portal indicator */}
        {hasPortal && (
          <Text style={styles.portalIndicator}>🌀</Text>
        )}

        {/* NPC indicator */}
        {hasNPCs && (
          <Text style={styles.npcIndicator}>👤</Text>
        )}

        {/* Monster count indicator */}
        {tile.spawnedMonsters.filter(m => m.isAlive).length > 0 && (
          <View style={styles.monsterIndicator}>
            <Text style={styles.monsterCount}>
              {tile.spawnedMonsters.filter(m => m.isAlive).length}
            </Text>
          </View>
        )}

        {/* Fog overlay for unexplored tiles */}
        {!isVisited && (
          <View style={styles.fogOverlay}>
            <Text style={styles.fogText}>?</Text>
          </View>
        )}
      </View>

      <Text style={styles.tileName} numberOfLines={1}>
        {isVisited ? tile.name : '???'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
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
    width: '100%',
    position: 'relative',
  },
  tileIcon: {
    fontSize: 18,
    marginBottom: 2,
    color: Colors.text,
    fontWeight: 'bold',
  },
  portalIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 10,
  },
  npcIndicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: 10,
  },
  monsterIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monsterCount: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: 'bold',
  },
  tileName: {
    fontSize: 10,
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
    justifyContent: 'center',
  },
  fogText: {
    fontSize: 24,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
}); 