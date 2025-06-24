import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Character, DetailedBattleResult, Item } from '../../types';
import { Colors, ColorUtils } from '../../utils/colors';
import { useGame } from '../../context/GameContext';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';

interface BattleResultsModalProps {
  battleResult: DetailedBattleResult | null;
  visible: boolean;
  onClose: () => void;
  currentCharacter?: Character;
  onHealCharacter?: (cost: number) => void;
}

export const BattleResultsModal: React.FC<BattleResultsModalProps> = ({
  battleResult,
  visible,
  onClose,
}) => {
  const { currentCharacter } = useGame();

  if (!visible || !battleResult) return null;

  const playerHealthAfter = battleResult.playerHealthAfter || 0;
  const playerMaxHealth = battleResult.playerMaxHealth || 100;
  const monstersKilled = battleResult.monstersKilled || [];
  const totalRewards = battleResult.totalRewards || { experience: 0, gold: 0, items: [] };
  const combatLog = battleResult.combatLog || ['No combat log available'];

  const healthPercentage = (playerHealthAfter / playerMaxHealth) * 100;
  const healthColor = ColorUtils.getHealthColor(healthPercentage);

  // Get detailed item information from inventory
  const getDroppedItemDetails = (): Item[] => {
    if (!currentCharacter || !totalRewards.items || totalRewards.items.length === 0) {
      return [];
    }

    // Get the most recently added items from inventory that match the dropped item count
    // This is a best-effort approach since we don't have direct item references
    const recentItems = currentCharacter.inventory.slice(-totalRewards.items.length);
    return recentItems;
  };

  // Get item names from loot IDs for display
  const getItemNamesFromLootIds = (): string[] => {
    if (!totalRewards.items || totalRewards.items.length === 0) {
      return [];
    }

    return totalRewards.items.map(itemId => {
      // Try to find the item in the findItemByLootId function scope
      const lootIdToName: Record<string, string> = {
        'bronze_dagger': 'Bronze Dagger',
        'iron_daggers': 'Iron Daggers',
        'iron_sword': 'Iron Sword',
        'iron_battle_axe': 'Iron Battle Axe',
        'steel_crossbow': 'Steel Crossbow',
        'oak_short_bow': 'Oak Short Bow',
        'willow_long_bow': 'Willow Long Bow',
        'dimension_sword': 'Dimension Sword',
        'arctic_blade': 'Arctic Blade',
        'assassin_blade': 'Assassin\'s Dagger',
        'dragon_sword': 'Dragon Sword',
        'burning_axe': 'Burning Axe',
        'dragonbone_sword': 'Dragonbone Sword',
        'mystic_staff': 'Mystic Staff',
        'fortress_hammer': 'Fortress Hammer',
        'elven_longbow': 'Elven Longbow',
        'crystal_wand': 'Crystal Wand',
        'poison_blade': 'Poison Blade',
        'berserker_axe': 'Berserker Axe',
        'steel_blade': 'Steel Blade',
        'knight_blade': 'Knight\'s Blade',
        'guardian_shield': 'Guardian Shield',
        'hunting_bow': 'Hunting Bow',
        'rapier': 'Rapier',
        // Armor items
        'padded_undershirt': 'Padded Undershirt',
        'field_jacket': 'Field Jacket',
        'lattuce_shirt': 'Lattuce Shirt',
        'tin_mail': 'Tin Mail',
        'splint_mail': 'Splint Mail',
        'fine_chain_mail': 'Fine Chain Mail',
        'woven_scale_mail': 'Woven Scale Mail',
        'mammoth_hide_armor': 'Mammoth Hide Armor',
        'crimson_plate_mail': 'Crimson Plate Mail',
        'kizmacs_training_mail': 'Kizmacs Training Mail',
        // Helmets
        'iron_helm': 'Iron Helm',
        'knight_helm': 'Knight Helm',
        'crown_of_wisdom': 'Crown of Wisdom'
      };

      return lootIdToName[itemId] || itemId;
    });
  };


  // Render a single combat log entry with proper coloring
  const renderCombatLogEntry = (entry: string, index: number) => {
    const playerName = battleResult?.playerName || 'Player';

    // Use colors from global Colors utility
    const hitColor = Colors.gold; // Yellow/gold for normal hits
    const criticalColor = Colors.criticalDamage; // Red for critical hits
    const missColor = Colors.miss; // Light gray for misses
    const dodgeColor = Colors.dodge; // Light blue for dodges

    // Check what type of action this is
    const isCritical = entry.includes('CRITICAL HIT') || entry.includes('DEVASTATING CRITICAL HIT');
    const isMiss = entry.includes('miss') || entry.includes('goes wide') || entry.includes('swings at');
    const isDodge = entry.includes('dodge');
    const hasAttack = entry.includes('strikes') || entry.includes('damage');

    // Function to highlight damage numbers
    const highlightDamageNumbers = (text: string, damageColor: string) => {
      const parts = [];
      const damagePattern = /(\d+)(\s+damage)/gi;
      let lastIndex = 0;
      let match;

      while ((match = damagePattern.exec(text)) !== null) {
        // Add text before the damage number
        if (match.index > lastIndex) {
          parts.push(
            <Text key={`before-${match.index}`} style={{ color: Colors.neutral }}>
              {text.substring(lastIndex, match.index)}
            </Text>
          );
        }

        // Add the damage number with special color
        parts.push(
          <Text key={`damage-${match.index}`} style={{ color: damageColor, fontWeight: 'bold' }}>
            {match[1]}
          </Text>
        );

        // Add " damage" part
        parts.push(
          <Text key={`damage-text-${match.index}`} style={{ color: Colors.neutral }}>
            {match[2]}
          </Text>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(
          <Text key={`remaining-${lastIndex}`} style={{ color: Colors.neutral }}>
            {text.substring(lastIndex)}
          </Text>
        );
      }

      // If no damage found, return original text
      if (parts.length === 0) {
        parts.push(
          <Text key="original" style={{ color: Colors.neutral }}>
            {text}
          </Text>
        );
      }

      return parts;
    };

    // Handle different combat action types
    if (isCritical) {
      // Critical hit - highlight with red damage and special text
      const critText = entry.includes('DEVASTATING CRITICAL HIT') ? 'DEVASTATING CRITICAL HIT' : 'CRITICAL HIT';
      const critIndex = entry.indexOf(critText);

      return (
        <Text key={index} style={styles.combatLogEntry}>
          {entry.includes(playerName) ? (
            <>
              <Text style={{ color: Colors.player, fontWeight: 'bold' }}>{playerName}</Text>
              <Text style={{ color: Colors.neutral }}>
                {entry.substring(playerName.length, critIndex)}
              </Text>
              <Text style={{ color: criticalColor, fontWeight: 'bold' }}>{critText}</Text>
              {highlightDamageNumbers(entry.substring(critIndex + critText.length), criticalColor)}
            </>
          ) : (
            <>
              <Text style={{ color: Colors.neutral }}>
                {entry.substring(0, critIndex)}
              </Text>
              <Text style={{ color: criticalColor, fontWeight: 'bold' }}>{critText}</Text>
              {highlightDamageNumbers(entry.substring(critIndex + critText.length), criticalColor)}
            </>
          )}
        </Text>
      );
    } else if (isMiss) {
      // Miss - light gray color
      return (
        <Text key={index} style={styles.combatLogEntry}>
          {entry.includes(playerName) ? (
            <>
              <Text style={{ color: Colors.player, fontWeight: 'bold' }}>{playerName}</Text>
              <Text style={{ color: missColor }}>
                {entry.substring(entry.indexOf(playerName) + playerName.length)}
              </Text>
            </>
          ) : (
            <Text style={{ color: missColor }}>{entry}</Text>
          )}
        </Text>
      );
    } else if (isDodge) {
      // Dodge - light blue color
      return (
        <Text key={index} style={styles.combatLogEntry}>
          {entry.includes(playerName) ? (
            <>
              <Text style={{ color: Colors.player, fontWeight: 'bold' }}>{playerName}</Text>
              <Text style={{ color: dodgeColor, fontWeight: 'bold' }}>
                {entry.substring(entry.indexOf(playerName) + playerName.length)}
              </Text>
            </>
          ) : (
            <Text style={{ color: dodgeColor, fontWeight: 'bold' }}>{entry}</Text>
          )}
        </Text>
      );
    } else if (hasAttack && entry.includes(playerName)) {
      // Normal hit with player name - highlight player name and damage numbers in yellow
      const playerIndex = entry.indexOf(playerName);
      const beforePlayer = entry.substring(0, playerIndex);
      const afterPlayer = entry.substring(playerIndex + playerName.length);

      return (
        <Text key={index} style={styles.combatLogEntry}>
          <Text style={{ color: Colors.neutral }}>{beforePlayer}</Text>
          <Text style={{ color: Colors.player, fontWeight: 'bold' }}>{playerName}</Text>
          {highlightDamageNumbers(afterPlayer, hitColor)}
        </Text>
      );
    } else if (hasAttack) {
      // Normal hit without player name (enemy attack) - highlight damage numbers in yellow
      return (
        <Text key={index} style={styles.combatLogEntry}>
          {highlightDamageNumbers(entry, hitColor)}
        </Text>
      );
    }

    // Default: render with player name highlighting if present
    if (entry.includes(playerName)) {
      const parts = entry.split(playerName);
      if (parts.length === 2) {
        return (
          <Text key={index} style={styles.combatLogEntry}>
            <Text style={{ color: Colors.neutral }}>{parts[0]}</Text>
            <Text style={{ color: Colors.player, fontWeight: 'bold' }}>{playerName}</Text>
            <Text style={{ color: Colors.neutral }}>{parts[1]}</Text>
          </Text>
        );
      }
    }

    // Default: render as is
    return (
      <Text key={index} style={[styles.combatLogEntry, { color: Colors.neutral }]}>
        {entry}
      </Text>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Battle Results</Text>
            <View style={[styles.resultBadge, { backgroundColor: battleResult.victory ? Colors.victory : Colors.defeat }]}>
              <Text style={styles.resultText}>
                {battleResult.victory ? 'VICTORY' : 'DEFEAT'}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Combat Log Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Combat Log</Text>
              <ScrollView style={styles.combatLogContainer} nestedScrollEnabled={true}>
                {combatLog.map((entry, index) => {
                  return renderCombatLogEntry(entry, index);
                })}
              </ScrollView>
            </View>

            {/* Monsters Defeated Section */}
            {/*    {monstersKilled.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Monsters Defeated</Text>
                {monstersKilled.map((monster, index) => (
                  <View key={index} style={styles.monsterItem}>
                    <Text style={styles.monsterName}>
                      {monster.name} (Level {monster.level})
                    </Text>
                    <View style={styles.monsterRewards}>
                      <Text style={[styles.rewardText, { color: Colors.experience }]}>
                        +{monster.experience} XP
                      </Text>
                      <Text style={[styles.rewardText, { color: Colors.gold }]}>
                        +{monster.gold} Gold
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )} */}

            {/* Health Status Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Status</Text>
              <View style={styles.healthContainer}>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>Current Health</Text>
                  <Text style={[styles.healthValue, { color: healthColor }]}>
                    {playerHealthAfter} / {playerMaxHealth} HP
                  </Text>
                  <View style={styles.healthBarContainer}>
                    <View style={styles.healthBarBackground}>
                      <View
                        style={[
                          styles.healthBarFill,
                          {
                            width: `${healthPercentage}%`,
                            backgroundColor: healthColor
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.healthPercentage}>{Math.round(healthPercentage)}%</Text>
                  </View>
                </View>
              </View>
            </View>


            {/* Rewards Summary Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rewards Summary</Text>
              <View style={styles.rewardsContainer}>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardLabel}>Experience Gained</Text>
                  <Text style={[styles.rewardValue, { color: Colors.experience }]}>
                    +{totalRewards.experience} XP
                  </Text>
                </View>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardLabel}>Gold Earned</Text>
                  <Text style={[styles.rewardValue, { color: Colors.gold }]}>
                    +{totalRewards.gold} Gold
                  </Text>
                </View>
                {totalRewards.items && totalRewards.items.length > 0 && (
                  <View style={styles.itemsSection}>
                    <Text style={styles.rewardLabel}>Items Found ({totalRewards.items.length})</Text>

                    {/* Show item names from loot IDs */}
                    <View style={styles.itemNamesContainer}>
                      {getItemNamesFromLootIds().map((itemName, index) => (
                        <View key={index} style={styles.itemNameChip}>
                          <Text style={styles.itemNameText}>{itemName}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Show detailed item stats if we can match them from inventory */}
                    {getDroppedItemDetails().length > 0 && (
                      <View style={styles.itemDetailsSection}>
                        <Text style={styles.itemDetailsLabel}>Item Details:</Text>
                        <View style={styles.itemsList}>
                          {getDroppedItemDetails().map((item, index) => (
                            <ItemStatsDisplay
                              key={index}
                              item={item}
                              compact={true}
                              showSlotInfo={true}
                            />
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
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
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resultText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 4,
  },
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthInfo: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  healthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    marginRight: 8,
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthPercentage: {
    fontSize: 12,
    color: Colors.textSecondary,
    minWidth: 35,
  },
  healButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 16,
  },
  healButtonDisabled: {
    backgroundColor: Colors.secondary,
  },
  healButtonText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  healButtonTextDisabled: {
    color: Colors.textMuted,
  },
  monsterItem: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  monsterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  monsterRewards: {
    flexDirection: 'row',
    gap: 16,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rewardsContainer: {
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 6,
  },
  rewardLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  combatLogContainer: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    maxHeight: 200,
    minHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  combatLogEntry: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemNamesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  itemNameChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  itemNameText: {
    fontSize: 12,
    color: Colors.background,
    fontWeight: '600',
  },
  itemDetailsSection: {
    marginTop: 8,
  },
  itemDetailsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  itemsList: {
    gap: 8,
    marginTop: 8,
  },
  itemCard: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  itemLevel: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  itemStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemStat: {
    fontSize: 11,
    color: Colors.success,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
}); 