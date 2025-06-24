import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Character } from '../../types';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';
import { Colors, ColorUtils } from '../../utils/colors';

interface EquipmentTabProps {
  character: Character;
}

const EquipmentTab: React.FC<EquipmentTabProps> = ({ character }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Equipment</Text>
        <Text style={styles.subtitle}>
          Your current equipment and their bonuses.
        </Text>

        <View style={styles.equipmentList}>
          {Object.entries(character.equipment).map(([slot, item]) => (
            <View key={slot} style={styles.equipmentSlot}>
              <Text style={styles.slotName}>
                {slot === 'mainHand' ? 'Main Hand' :
                  slot === 'offHand' ? 'Off Hand' :
                    slot.charAt(0).toUpperCase() + slot.slice(1)}
              </Text>
              {item ? (
                <ItemStatsDisplay
                  item={item}
                  compact={true}
                  showSlotInfo={false}
                />
              ) : (
                <Text style={styles.emptySlot}>Empty</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Equipment System</Text>
          <Text style={styles.infoText}>
            • Equipment provides stat bonuses{'\n'}
            • Items have durability that decreases with use{'\n'}
            • Higher rarity items provide better bonuses{'\n'}
            • Visit the Inventory tab to manage your items{'\n'}
            • Buy new equipment from the Shop!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 25,
    lineHeight: 20,
    textAlign: 'center',
  },
  equipmentList: {
    gap: 15,
    marginBottom: 25,
  },
  equipmentSlot: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  slotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  itemInfo: {
    gap: 5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  itemDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  itemStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  statBonus: {
    fontSize: 11,
    color: Colors.success,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  weaponInfo: {
    fontSize: 11,
    color: Colors.warning,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  emptySlot: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default EquipmentTab; 