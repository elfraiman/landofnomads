import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

interface MapConfig {
  id: string;
  name: string;
  description: string;
  levelRange: { min: number; max: number };
  portalRequirement?: {
    minLevel: number;
    bossDefeated?: string;
  };
}

interface PortalModalProps {
  visible: boolean;
  availableMaps: MapConfig[];
  currentMapId: string;
  playerLevel: number;
  onSelectMap: (mapId: string) => void;
  onClose: () => void;
  canAccessMap: (mapId: string) => boolean;
}

export const PortalModal: React.FC<PortalModalProps> = ({
  visible,
  availableMaps,
  currentMapId,
  playerLevel,
  onSelectMap,
  onClose,
  canAccessMap
}) => {
  const handleMapSelect = (mapId: string) => {
    if (mapId === currentMapId) {
      onClose();
      return;
    }

    if (canAccessMap(mapId)) {
      onSelectMap(mapId);
      onClose();
    }
  };

  const getMapStatusText = (map: MapConfig): string => {
    if (map.id === currentMapId) return '📍 Current Location';
    if (!canAccessMap(map.id)) {
      if (map.portalRequirement?.minLevel && playerLevel < map.portalRequirement.minLevel) {
        return `🔒 Level ${map.portalRequirement.minLevel} Required`;
      }
      if (map.portalRequirement?.bossDefeated) {
        return `⚔️ Defeat ${map.portalRequirement.bossDefeated}`;
      }
      return '🔒 Locked';
    }
    return '✅ Available';
  };

  const getMapEmoji = (mapId: string): string => {
    const emojiMap: Record<string, string> = {
      'greenwood_valley': '🌲',
      'shadowmere_swamps': '🐊',
      'crystal_caverns': '💎',
      'volcanic_peaks': '🌋',
      'frozen_wastes': '❄️'
    };
    return emojiMap[mapId] || '🗺️';
  };

  const getMapStyle = (map: MapConfig) => {
    if (map.id === currentMapId) return [styles.mapItem, styles.currentMap];
    if (!canAccessMap(map.id)) return [styles.mapItem, styles.lockedMap];
    return [styles.mapItem, styles.availableMap];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Portal Hub</Text>
            <Text style={styles.subtitle}>Choose your destination</Text>
          </View>

          <ScrollView style={styles.mapList} showsVerticalScrollIndicator={false}>
            {availableMaps.map((map) => (
              <TouchableOpacity
                key={map.id}
                style={getMapStyle(map)}
                onPress={() => handleMapSelect(map.id)}
                disabled={!canAccessMap(map.id) && map.id !== currentMapId}
                activeOpacity={0.7}
              >
                <View style={styles.mapHeader}>
                  <View style={styles.mapNameContainer}>
                    <Text style={styles.mapEmoji}>{getMapEmoji(map.id)}</Text>
                    <Text style={styles.mapName}>{map.name}</Text>
                  </View>
                  <Text style={[
                    styles.statusText,
                    map.id === currentMapId ? styles.currentStatus :
                      canAccessMap(map.id) ? styles.availableStatus : styles.lockedStatus
                  ]}>
                    {getMapStatusText(map)}
                  </Text>
                </View>

                <Text style={styles.mapDescription}>{map.description}</Text>

                <View style={styles.mapDetails}>
                  <Text style={styles.levelRange}>
                    Level Range: {map.levelRange.min}-{map.levelRange.max}
                  </Text>
                  {map.portalRequirement && (
                    <Text style={styles.requirements}>
                      Requirements: Level {map.portalRequirement.minLevel}
                      {map.portalRequirement.bossDefeated && `, Defeat ${map.portalRequirement.bossDefeated}`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close Portal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  mapList: {
    flex: 1,
  },
  mapItem: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  currentMap: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  availableMap: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  lockedMap: {
    backgroundColor: Colors.textSecondary + '10',
    borderColor: Colors.textSecondary + '40',
    opacity: 0.6,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mapEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  mapName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  currentStatus: {
    backgroundColor: Colors.success,
    color: Colors.text,
  },
  availableStatus: {
    backgroundColor: Colors.primary,
    color: Colors.text,
  },
  lockedStatus: {
    backgroundColor: Colors.textSecondary,
    color: Colors.text,
  },
  mapDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  mapDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  levelRange: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  requirements: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: Colors.error,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
}); 