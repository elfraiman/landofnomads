import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Character, DetailedBattleResult, Item } from '../../types';
import { Colors, ColorUtils } from '../../utils/colors';
import { useGame } from '../../context/GameContext';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';
import { StatusBar } from '../ui/StatusBar';
import { CombatLog } from '../ui/CombatLog';

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
  const { currentCharacter, getExperiencePercentage, getExperienceToNextLevel, getActiveGemEffects } = useGame();

  if (!visible || !battleResult) return null;

  const playerHealthAfter = battleResult.playerHealthAfter || 0;
  const playerMaxHealth = battleResult.playerMaxHealth || 100;
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
    const weaponName = battleResult?.weaponName;
    const weaponRarity = battleResult?.weaponRarity || 'common';

    // Use colors from global Colors utility
    const hitColor = Colors.gold; // Yellow/gold for normal hits
    const criticalColor = Colors.criticalDamage; // Red for critical hits
    const missColor = Colors.miss; // Light gray for misses
    const dodgeColor = Colors.dodge; // Light blue for dodges
    const weaponColor = ColorUtils.getRarityColor(weaponRarity);

    // Check what type of action this is
    const isCritical = entry.includes('CRITICAL HIT') || entry.includes('DEVASTATING CRITICAL HIT');
    const isMiss = entry.includes('miss') || entry.includes('goes wide') || entry.includes('swings at');
    const isDodge = entry.includes('dodge');
    const hasAttack = entry.includes('strikes') || entry.includes('damage');

    // Function to highlight damage numbers and weapon name
    const highlightDamageNumbers = (text: string, damageColor: string) => {
      const parts = [];
      const damagePattern = /(\d+)(\s+damage)/gi;
      let lastIndex = 0;
      let match;

      // Find weapon name in text
      const withTheirPattern = /with their ([^!.]*?)(?=\s(?:at|to|for|but|and|[!.]))/i;
      const swingsTheirPattern = /swings their ([^!.]*?)(?=\s(?:at|to|for|but|and|[!.]))/i;
      const dodgesPattern = new RegExp(`dodges ${playerName}'s ([^!.]*?)(?=\\s(?:at|to|for|but|and|[!.]))`);
      // Fallback pattern for cases where "with their" might be missing
      const strikesPattern = new RegExp(`${playerName} strikes ([^!.]*?)(?=\\s(?:at|to|for|but|and|[!.]))`, 'i');

      // Try to find weapon name using any of the patterns
      const withTheirMatch = text.match(withTheirPattern);
      const swingsMatch = text.match(swingsTheirPattern);
      const dodgesMatch = text.match(dodgesPattern);
      const fallbackMatch = text.match(strikesPattern);
      
      const weaponMatch = withTheirMatch || swingsMatch || dodgesMatch || fallbackMatch;

      if (weaponMatch) {
        const beforeWeaponText = text.substring(0, weaponMatch.index);
        const afterWeaponText = text.substring(weaponMatch.index! + weaponMatch[0].length);

        // Add text before weapon name
        if (beforeWeaponText) {
          parts.push(
            <Text key={`before-weapon`} style={{ color: Colors.neutral }}>
              {beforeWeaponText}
            </Text>
          );
        }

        // Add the weapon name with rarity color
        parts.push(
          <Text key="weapon" style={{ color: weaponColor, fontWeight: 'bold' }}>
            {weaponMatch[1]}
          </Text>
        );

        // Process the rest of the text for damage numbers
        if (afterWeaponText) {
          let lastDamageIndex = 0;
          let damageMatch;
          const remainingText = afterWeaponText;

          while ((damageMatch = damagePattern.exec(remainingText)) !== null) {
            // Add text before damage number
            if (damageMatch.index > lastDamageIndex) {
              parts.push(
                <Text key={`after-weapon-${damageMatch.index}`} style={{ color: Colors.neutral }}>
                  {remainingText.substring(lastDamageIndex, damageMatch.index)}
                </Text>
              );
            }

            // Add damage number
            parts.push(
              <Text key={`damage-${damageMatch.index}`} style={{ color: damageColor, fontWeight: 'bold' }}>
                {damageMatch[1]}
              </Text>
            );

            // Add " damage" text
            parts.push(
              <Text key={`damage-text-${damageMatch.index}`} style={{ color: Colors.neutral }}>
                {damageMatch[2]}
              </Text>
            );

            lastDamageIndex = damageMatch.index + damageMatch[0].length;
          }

          // Add remaining text after last damage number
          if (lastDamageIndex < remainingText.length) {
            parts.push(
              <Text key="after-weapon-final" style={{ color: Colors.neutral }}>
                {remainingText.substring(lastDamageIndex)}
              </Text>
            );
          }
        }

        return parts;
      }

      // If no weapon pattern found, just process damage numbers as before
      while ((match = damagePattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            <Text key={`before-${match.index}`} style={{ color: Colors.neutral }}>
              {text.substring(lastIndex, match.index)}
            </Text>
          );
        }

        parts.push(
          <Text key={`damage-${match.index}`} style={{ color: damageColor, fontWeight: 'bold' }}>
            {match[1]}
          </Text>
        );

        parts.push(
          <Text key={`damage-text-${match.index}`} style={{ color: Colors.neutral }}>
            {match[2]}
          </Text>
        );

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        parts.push(
          <Text key={`remaining-${lastIndex}`} style={{ color: Colors.neutral }}>
            {text.substring(lastIndex)}
          </Text>
        );
      }

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
            {/* Active Buffs/Auras Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Buffs & Auras</Text>
              <View style={styles.buffsContainer}>
                {currentCharacter ? (
                  <>
                    {/* Active Gem Effects */}
                    {(() => {
                      const activeGemEffects = getActiveGemEffects();
                      return activeGemEffects.length > 0 ? (
                        activeGemEffects.map((effect: string, index: number) => {
                          // Parse the effect string: "Gem Name: Description (X battles left)"
                          const parts = effect.split(': ');
                          const gemName = parts[0];
                          const remainingPart = parts[1] || '';
                          const descriptionMatch = remainingPart.match(/^(.+)\s+\((\d+)\s+battles?\s+left\)$/);
                          const description = descriptionMatch ? descriptionMatch[1] : remainingPart;
                          const battlesLeft = descriptionMatch ? descriptionMatch[2] : '?';
                          
                          return (
                            <View key={`gem-${index}`} style={[styles.buffItem, styles.gemBuff]}>
                              <View style={styles.buffHeader}>
                                <Text style={styles.buffSource}>💎 {gemName}</Text>
                                <Text style={styles.buffDuration}>({battlesLeft} battles left)</Text>
                              </View>
                              <View style={styles.buffEffects}>
                                <View style={[styles.buffChip, styles.gemBuffChip]}>
                                  <Text style={styles.buffText}>{description}</Text>
                                </View>
                              </View>
                            </View>
                          );
                        })
                      ) : null;
                    })()}

                    {/* Active Auras - Future implementation */}
                    {/* This section will be populated with active auras that the player has acquired */}
                    {/* 
                    {currentCharacter.activeAuras && currentCharacter.activeAuras.length > 0 && (
                      currentCharacter.activeAuras.map((aura: any, index: number) => (
                        <View key={`aura-${index}`} style={[styles.buffItem, styles.auraItem]}>
                          <View style={styles.buffHeader}>
                            <Text style={styles.buffSource}>{aura.name}</Text>
                            <Text style={styles.buffSlot}>({aura.type})</Text>
                          </View>
                          <View style={styles.buffEffects}>
                            {aura.effects.map((effect: string, effectIndex: number) => (
                              <View key={effectIndex} style={[styles.buffChip, styles.auraChip]}>
                                <Text style={styles.buffText}>{effect}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))
                    )}
                    */}

                    {/* Temporary Buffs - Potions, Spells, etc. */}
                    {/* 
                    {currentCharacter.temporaryBuffs && currentCharacter.temporaryBuffs.length > 0 && (
                      currentCharacter.temporaryBuffs.map((buff: any, index: number) => (
                        <View key={`temp-${index}`} style={[styles.buffItem, styles.temporaryBuff]}>
                          <View style={styles.buffHeader}>
                            <Text style={styles.buffSource}>{buff.name}</Text>
                            <Text style={styles.buffSlot}>({buff.duration}s left)</Text>
                          </View>
                          <View style={styles.buffEffects}>
                            {buff.effects.map((effect: string, effectIndex: number) => (
                              <View key={effectIndex} style={[styles.buffChip, styles.temporaryBuffChip]}>
                                <Text style={styles.buffText}>{effect}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))
                    )}
                    */}

                    {/* Show message when no active buffs */}
                    {getActiveGemEffects().length === 0 && (
                      <View style={styles.noBuffsContainer}>
                        <Text style={styles.noBuffsText}>No active buffs or auras</Text>
                        <Text style={styles.noBuffsSubtext}>Consume gems or acquire auras to gain temporary bonuses!</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.noBuffsContainer}>
                    <Text style={styles.noBuffsText}>No character data available</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Combat Log Section */}
            <CombatLog
              entries={combatLog}
              playerName={battleResult?.playerName || 'Player'}
              weaponName={battleResult?.weaponName}
              weaponRarity={battleResult?.weaponRarity}
            />

            {/* Health Status Section */}
            <StatusBar
              title="Health"
              value={`${playerHealthAfter} / ${playerMaxHealth} HP`}
              valueColor={healthColor}
              percentage={healthPercentage}
              fillColor={healthColor}
              bottomText={`${Math.round(healthPercentage)}%`}
            />

            {/* Experience Progress Section */}
            {currentCharacter && (
              <StatusBar
                title="Experience"
                value={`Lv${currentCharacter.level} • ${currentCharacter.experience} XP${totalRewards.experience > 0 ? ` +${totalRewards.experience}` : ''}`}
                valueColor={Colors.experience}
                percentage={getExperiencePercentage(currentCharacter)}
                fillColor={Colors.experience}
                bottomText={`${getExperienceToNextLevel(currentCharacter)} XP to Lv${currentCharacter.level + 1}`}
              />
            )}

            {/* Rewards Summary Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rewards Summary</Text>
              <View style={styles.rewardsContainer}>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardLabel}>Experience Gained</Text>
                  <Text style={[styles.rewardValue, { color: Colors.experience }]}>
                    +{totalRewards.experience || 0} XP
                  </Text>
                </View>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardLabel}>Gold Earned</Text>
                  <Text style={[styles.rewardValue, { color: Colors.gold }]}>
                    +{totalRewards.gold || 0} Gold
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
    padding: 10,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '95%',
    minHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  resultText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 4,
  },
  healthContainer: {
    flexDirection: 'column',
    gap: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  healthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.background,
    borderRadius: 5,
    marginRight: 8,
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  healthPercentage: {
    fontSize: 12,
    color: Colors.textSecondary,
    minWidth: 40,
  },
  healButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  healButtonDisabled: {
    backgroundColor: Colors.secondary,
  },
  healButtonText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  monsterRewards: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rewardsContainer: {
    gap: 10,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 6,
    minHeight: 44,
  },
  rewardLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  combatLogEntry: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
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
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  itemNameChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.accent,
    minHeight: 32,
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
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  itemLevel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  itemType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
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
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  buffsContainer: {
    gap: 10,
  },
  buffItem: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 6,
    minHeight: 44,
  },
  buffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  buffSource: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  buffSlot: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  buffEffects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  buffChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.accent,
    minHeight: 32,
  },
  buffText: {
    fontSize: 12,
    color: Colors.background,
    fontWeight: '600',
  },
  noBuffsContainer: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  noBuffsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  noBuffsSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  temporaryBuff: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  temporaryBuffChip: {
    backgroundColor: Colors.warning,
  },
  auraItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.experience,
  },
  auraChip: {
    backgroundColor: Colors.experience,
  },
  // Gem buff styles
  gemBuff: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  buffDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  gemBuffChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  // Experience bar styles
  experienceContainer: {
    gap: 8,
  },
  experienceInfo: {
    alignItems: 'center',
    gap: 4,
  },
  experienceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  experienceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  experienceGain: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  experienceBarContainer: {
    marginTop: 8,
    gap: 4,
  },
  // Compact experience styles
  experienceInfoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  experienceLabelCompact: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  experienceValueCompact: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  experienceGainCompact: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  experienceBarCompact: {
    gap: 4,
  },
  experiencePercentageCompact: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  experienceBarBackground: {
    height: 20,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  experienceBarFill: {
    height: '100%',
    borderRadius: 10,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  experienceGainOverlay: {
    height: '100%',
    borderRadius: 10,
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.7,
  },
  experiencePercentage: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  nextLevelInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  nextLevelText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 