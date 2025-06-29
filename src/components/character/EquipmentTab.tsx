import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Character } from '../../types';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';
import { Colors, ColorUtils, RPGTextStyles } from '../../utils/colors';
import { calculateEquipmentBonuses } from '../../utils/combatEngine';

interface EquipmentTabProps {
  character: Character;
}

const EquipmentTab: React.FC<EquipmentTabProps> = ({ character }) => {
  // Get equipment bonuses from the centralized function
  const equipmentBreakdown = calculateEquipmentBonuses(character);
  
  // Combine stat bonuses and combat bonuses for display
  const totalBonuses = {
    ...equipmentBreakdown.equipmentStats,
    ...equipmentBreakdown.equipmentBonuses,
    weaponSpeed: 0, // This isn't currently tracked in the centralized function
  };

  // Calculate weapon speed separately for now (this could be added to the centralized function later)
  Object.values(character.equipment).forEach(item => {
    if (item && item.weaponSpeed) {
      totalBonuses.weaponSpeed += item.weaponSpeed;
    }
  });

  // Format equipment slot names
  const formatSlotName = (slot: string) => {
    return slot === 'mainHand' ? 'Main Hand' :
           slot === 'offHand' ? 'Off Hand' :
           slot.charAt(0).toUpperCase() + slot.slice(1);
  };

  // Get equipped items for the benefits table
  const getEquippedItems = () => {
    return Object.entries(character.equipment)
      .filter(([_, item]) => item !== undefined)
      .map(([slot, item]) => ({ slot, item: item! }));
  };

  const equippedItems = getEquippedItems();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {/* Total Benefits Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Total Equipment Bonuses</Text>
          <View style={styles.summaryGrid}>
            {/* Stat Bonuses */}
            {totalBonuses.strength > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.warrior }]}>Strength</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>+{totalBonuses.strength}</Text>
              </View>
            )}
            {totalBonuses.dexterity > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.rogue }]}>Dexterity</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>+{totalBonuses.dexterity}</Text>
              </View>
            )}
            {totalBonuses.constitution > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.health }]}>Constitution</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>+{totalBonuses.constitution}</Text>
              </View>
            )}
            {totalBonuses.intelligence > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.mage }]}>Intelligence</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>+{totalBonuses.intelligence}</Text>
              </View>
            )}
            {totalBonuses.speed > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.lightning }]}>Speed</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>+{totalBonuses.speed}</Text>
              </View>
            )}
            
            {/* Combat Bonuses */}
            {totalBonuses.damage > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.weapon }]}>Damage</Text>
                <Text style={[styles.summaryValue, { color: Colors.damage }]}>+{totalBonuses.damage}</Text>
              </View>
            )}
            {totalBonuses.armor > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.armor }]}>Armor</Text>
                <Text style={[styles.summaryValue, { color: Colors.info }]}>+{totalBonuses.armor}</Text>
              </View>
            )}
            {totalBonuses.criticalChance > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.criticalDamage }]}>Critical</Text>
                <Text style={[styles.summaryValue, { color: Colors.criticalDamage }]}>+{totalBonuses.criticalChance}%</Text>
              </View>
            )}
            {totalBonuses.dodgeChance > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.dodge }]}>Dodge</Text>
                <Text style={[styles.summaryValue, { color: Colors.dodge }]}>+{totalBonuses.dodgeChance}%</Text>
              </View>
            )}
            {totalBonuses.blockChance > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.shield }]}>Block</Text>
                <Text style={[styles.summaryValue, { color: Colors.shield }]}>+{totalBonuses.blockChance}%</Text>
              </View>
            )}
            {totalBonuses.weaponSpeed > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: Colors.lightning }]}>Weapon Speed</Text>
                <Text style={[styles.summaryValue, { color: Colors.warning }]}>+{totalBonuses.weaponSpeed}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Detailed Equipment Table */}
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Equipment Details</Text>
          
          {equippedItems.length > 0 ? (
            <View style={styles.equipmentTable}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
  
                <Text style={[styles.headerCell, { flex: 2 }]}>Slot</Text>
                <Text style={[styles.headerCell, { flex: 2 }]}>Benefits</Text>

              </View>

              {/* Table Rows */}
              {equippedItems.map(({ slot, item }) => {

                // Build benefits list with color information
                const benefits: { text: string; isNegative: boolean }[] = [];
                
                // Add stat bonuses (including negative ones)
                Object.entries(item.statBonus || {}).forEach(([stat, bonus]) => {
                  if (typeof bonus === 'number' && bonus !== 0) {
                    const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
                    const text = bonus > 0 ? `+${bonus} ${statName}` : `${bonus} ${statName}`;
                    benefits.push({ text, isNegative: bonus < 0 });
                  }
                });

                // Add combat bonuses (including negative ones)
                if (item.damage) {
                  const text = item.damage > 0 ? `+${item.damage} Damage` : `${item.damage} Damage`;
                  benefits.push({ text, isNegative: item.damage < 0 });
                }
                if (item.armor) {
                  const text = item.armor > 0 ? `+${item.armor} Armor` : `${item.armor} Armor`;
                  benefits.push({ text, isNegative: item.armor < 0 });
                }
                if (item.criticalChance) {
                  const text = item.criticalChance > 0 ? `+${item.criticalChance}% Critical` : `${item.criticalChance}% Critical`;
                  benefits.push({ text, isNegative: item.criticalChance < 0 });
                }
                if (item.dodgeChance) {
                  const text = item.dodgeChance > 0 ? `+${item.dodgeChance}% Dodge` : `${item.dodgeChance}% Dodge`;
                  benefits.push({ text, isNegative: item.dodgeChance < 0 });
                }
                if (item.blockChance) {
                  const text = item.blockChance > 0 ? `+${item.blockChance}% Block` : `${item.blockChance}% Block`;
                  benefits.push({ text, isNegative: item.blockChance < 0 });
                }
                if (item.weaponSpeed) {
                  const text = item.weaponSpeed > 0 ? `+${item.weaponSpeed} Speed` : `${item.weaponSpeed} Speed`;
                  benefits.push({ text, isNegative: item.weaponSpeed < 0 });
                }

                return (
                  <View key={slot} style={styles.tableRow}>
    
                    {/* Slot Column */}
                    <View style={[styles.tableCell, { flex: 2 }]}>
                      <Text style={styles.slotText}>{formatSlotName(slot)}</Text>
                    </View>

                    {/* Benefits Column */}
                    <View style={[styles.tableCell, { flex: 2 }]}>
                      {benefits.length > 0 ? (
                        benefits.map((benefit, index) => (
                          <Text key={index} style={[
                            styles.benefitText,
                            benefit.isNegative ? { color: Colors.error } : {}
                          ]} numberOfLines={1}>
                            • {benefit.text}
        </Text>
                        ))
                      ) : (
                        <Text style={styles.noBenefitText}>No bonuses</Text>
                      )}
                    </View>

                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noEquipmentText}>No equipment equipped</Text>
          )}
        </View>

        {/* Equipment Slots */}
        <View style={styles.equipmentList}>
          {Object.entries(character.equipment).map(([slot, item]) => (
            <View key={slot} style={styles.equipmentSlot}>
              <Text style={styles.slotName}>
                {formatSlotName(slot)}
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
    ...RPGTextStyles.h1,
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...RPGTextStyles.body,
    color: Colors.textSecondary,
    marginBottom: 25,
    lineHeight: 20,
    textAlign: 'center',
  },
  
  // Summary Box Styles
  summaryBox: {
    backgroundColor: Colors.surface,
    borderRadius: 0,
    padding: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  summaryTitle: {
    ...RPGTextStyles.h3,
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  summaryItem: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 0,
    padding: 6,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  summaryLabel: {
    ...RPGTextStyles.caption,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  summaryValue: {
    ...RPGTextStyles.stat,
    textAlign: 'center',
    fontWeight: '700',
  },

  // Details Table Styles
  detailsBox: {
    backgroundColor: Colors.surface,
    borderRadius: 0,
    padding: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  detailsTitle: {
    ...RPGTextStyles.h3,
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  equipmentTable: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 0,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  headerCell: {
    ...RPGTextStyles.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableCell: {
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  itemName: {
    ...RPGTextStyles.bodySmall,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemLevel: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  itemRarity: {
    ...RPGTextStyles.caption,
    fontWeight: '700',
  },
  slotText: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  benefitText: {
    ...RPGTextStyles.caption,
    color: Colors.success,
    marginBottom: 2,
  },
  noBenefitText: {
    ...RPGTextStyles.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  durabilityContainer: {
    alignItems: 'center',
  },
  durabilityText: {
    ...RPGTextStyles.caption,
    fontWeight: '600',
    marginBottom: 4,
  },
  durabilityBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.background,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  durabilityFill: {
    height: '100%',
    borderRadius: 1,
  },
  noEquipmentText: {
    ...RPGTextStyles.body,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },

  // Original equipment list styles
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
    ...RPGTextStyles.body,
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    fontWeight: '700',
  },
  emptySlot: {
    ...RPGTextStyles.bodySmall,
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
    ...RPGTextStyles.body,
    color: Colors.primary,
    marginBottom: 10,
    fontWeight: '700',
  },
  infoText: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default EquipmentTab; 