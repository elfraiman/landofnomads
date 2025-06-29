import React, { useEffect, useRef } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { Character, DetailedBattleResult, Item } from '../../types';
import { Colors, ColorUtils } from '../../utils/colors';
import { getStatAbbreviation } from '../../utils/stats';
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
  
  // Animation for gem drops
  const borderAnimValue = useRef(new Animated.Value(0)).current;
  const glowAnimValue = useRef(new Animated.Value(0)).current;

  // Always call useEffect to maintain hook order
  useEffect(() => {
    if (!visible || !battleResult) return;

    const totalRewards = battleResult.totalRewards || { experience: 0, gold: 0, items: [] };
    
    // Check if any gems were dropped
    const hasGemDrop = totalRewards.items && totalRewards.items.some(item => 
      typeof item === 'string' && (item.includes('gem_') || item.includes('Ruby') || item.includes('Sapphire') || 
      item.includes('Emerald') || item.includes('Diamond') || item.includes('Opal') || 
      item.includes('Citrine') || item.includes('Amber'))
    );

    if (hasGemDrop) {
      // Reset animations
      borderAnimValue.setValue(0);
      glowAnimValue.setValue(0);

      // Start pulsing border animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnimValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(borderAnimValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Start glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimValue, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // Stop animations if no gem drop
      borderAnimValue.stopAnimation();
      glowAnimValue.stopAnimation();
      borderAnimValue.setValue(0);
      glowAnimValue.setValue(0);
    }
  }, [visible, battleResult, borderAnimValue, glowAnimValue]);

  if (!visible || !battleResult) return null;

  const playerHealthAfter = battleResult.playerHealthAfter || 0;
  const playerMaxHealth = battleResult.playerMaxHealth || 100;
  const totalRewards = battleResult.totalRewards || { experience: 0, gold: 0, items: [] };
  const combatLog = battleResult.combatLog || ['No combat log available'];

  const healthPercentage = (playerHealthAfter / playerMaxHealth) * 100;
  const healthColor = ColorUtils.getHealthColor(healthPercentage);

  // Check if any gems were dropped
  const hasGemDrop = totalRewards.items && totalRewards.items.some(item => 
    typeof item === 'string' && (item.includes('gem_') || item.includes('Ruby') || item.includes('Sapphire') || 
    item.includes('Emerald') || item.includes('Diamond') || item.includes('Opal') || 
    item.includes('Citrine') || item.includes('Amber'))
  );

  // Get item display data with colors
  const getItemDisplayData = (): Array<{ name: string; color: string; isGem: boolean }> => {
    if (!totalRewards.items || totalRewards.items.length === 0) {
      return [];
    }

    return totalRewards.items.map(itemId => {
      const itemIdStr = String(itemId);
      
      // Check if it's a gem
      const isGem = itemIdStr.includes('gem_') || 
                   itemIdStr.includes('Ruby') || itemIdStr.includes('Sapphire') || 
                   itemIdStr.includes('Emerald') || itemIdStr.includes('Diamond') || 
                   itemIdStr.includes('Opal') || itemIdStr.includes('Citrine') || 
                   itemIdStr.includes('Amber');

      // Get gem colors
      if (isGem) {
        if (itemIdStr.includes('Ruby') || itemIdStr.includes('ruby')) {
          return { name: itemIdStr, color: '#e74c3c', isGem: true }; // Red
        } else if (itemIdStr.includes('Sapphire') || itemIdStr.includes('sapphire')) {
          return { name: itemIdStr, color: '#3498db', isGem: true }; // Blue
        } else if (itemIdStr.includes('Emerald') || itemIdStr.includes('emerald')) {
          return { name: itemIdStr, color: '#2ecc71', isGem: true }; // Green
        } else if (itemIdStr.includes('Diamond') || itemIdStr.includes('diamond')) {
          return { name: itemIdStr, color: '#ecf0f1', isGem: true }; // White/Silver
        } else if (itemIdStr.includes('Opal') || itemIdStr.includes('opal')) {
          return { name: itemIdStr, color: '#9b59b6', isGem: true }; // Purple
        } else if (itemIdStr.includes('Citrine') || itemIdStr.includes('citrine')) {
          return { name: itemIdStr, color: '#f39c12', isGem: true }; // Orange
        } else if (itemIdStr.includes('Amber') || itemIdStr.includes('amber')) {
          return { name: itemIdStr, color: '#e67e22', isGem: true }; // Amber
        }
      }

      // Regular items - use rarity colors or default
      const lootIdToData: Record<string, { name: string; color: string }> = {
        'bronze_dagger': { name: 'Bronze Dagger', color: Colors.common },
        'iron_daggers': { name: 'Iron Daggers', color: Colors.common },
        'iron_sword': { name: 'Iron Sword', color: Colors.common },
        'iron_battle_axe': { name: 'Iron Battle Axe', color: Colors.uncommon },
        'steel_crossbow': { name: 'Steel Crossbow', color: Colors.uncommon },
        'oak_short_bow': { name: 'Oak Short Bow', color: Colors.common },
        'willow_long_bow': { name: 'Willow Long Bow', color: Colors.uncommon },
        'dimension_sword': { name: 'Dimension Sword', color: Colors.epic },
        'arctic_blade': { name: 'Arctic Blade', color: Colors.rare },
        'assassin_blade': { name: 'Assassin\'s Dagger', color: Colors.rare },
        'dragon_sword': { name: 'Dragon Sword', color: Colors.legendary },
        'burning_axe': { name: 'Burning Axe', color: Colors.epic },
        'dragonbone_sword': { name: 'Dragonbone Sword', color: Colors.legendary },
        'mystic_staff': { name: 'Mystic Staff', color: Colors.epic },
        'fortress_hammer': { name: 'Fortress Hammer', color: Colors.epic },
        'elven_longbow': { name: 'Elven Longbow', color: Colors.rare },
        'crystal_wand': { name: 'Crystal Wand', color: Colors.rare },
        'poison_blade': { name: 'Poison Blade', color: Colors.rare },
        'berserker_axe': { name: 'Berserker Axe', color: Colors.epic },
        'steel_blade': { name: 'Steel Blade', color: Colors.uncommon },
        'knight_blade': { name: 'Knight\'s Blade', color: Colors.rare },
        'guardian_shield': { name: 'Guardian Shield', color: Colors.rare },
        'hunting_bow': { name: 'Hunting Bow', color: Colors.common },
        'rapier': { name: 'Rapier', color: Colors.uncommon },
        // Armor items
        'padded_undershirt': { name: 'Padded Undershirt', color: Colors.common },
        'field_jacket': { name: 'Field Jacket', color: Colors.common },
        'lattuce_shirt': { name: 'Lattuce Shirt', color: Colors.common },
        'tin_mail': { name: 'Tin Mail', color: Colors.common },
        'splint_mail': { name: 'Splint Mail', color: Colors.uncommon },
        'fine_chain_mail': { name: 'Fine Chain Mail', color: Colors.uncommon },
        'woven_scale_mail': { name: 'Woven Scale Mail', color: Colors.rare },
        'mammoth_hide_armor': { name: 'Mammoth Hide Armor', color: Colors.rare },
        'crimson_plate_mail': { name: 'Crimson Plate Mail', color: Colors.epic },
        'kizmacs_training_mail': { name: 'Kizmacs Training Mail', color: Colors.uncommon },
        // Helmets
        'iron_helm': { name: 'Iron Helm', color: Colors.common },
        'knight_helm': { name: 'Knight Helm', color: Colors.uncommon },
        'crown_of_wisdom': { name: 'Crown of Wisdom', color: Colors.legendary }
      };

      const itemData = lootIdToData[itemIdStr];
      return { 
        name: itemData?.name || itemIdStr, 
        color: itemData?.color || Colors.text, 
        isGem: false 
      };
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

  // Create animated styles for gem drop
  const animatedModalStyle = hasGemDrop ? {
    borderColor: borderAnimValue.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    }),
    borderWidth: 3,
    shadowColor: glowAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255, 215, 0, 0)', 'rgba(255, 215, 0, 0.8)']
    }),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: glowAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20]
    }),
    elevation: glowAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 15]
    }),
  } : {};

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, animatedModalStyle]}>
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
            {/* Active Buffs & Auras Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Effects</Text>
              <View style={styles.compactBuffsContainer}>
                {currentCharacter ? (
                  <>
                    {/* Active Gem Effects */}
                    {(() => {
                      const activeGemEffects = currentCharacter.activeGemEffects || [];
                      return activeGemEffects.length > 0 ? (
                        <View style={styles.compactEffectsList}>
                          {activeGemEffects.map((effect, index) => {
                            // Get gem type color
                            const gemData = require('../../data/gems').gemBaseData[effect.gemType];
                            const isExpiring = effect.battlesRemaining <= 5;
                            
                            // Build all bonuses text
                            const statBonuses = Object.entries(effect.statBonus)
                              .filter(([_, bonus]) => bonus !== 0)
                              .map(([stat, bonus]) => `${getStatAbbreviation(stat)} ${bonus > 0 ? '+' : ''}${bonus}`)
                              .join(' ');
                            
                            const experienceBonus = effect.experienceBonus ? `EXP +${effect.experienceBonus}%` : '';
                            const goldBonus = effect.goldBonus ? `GLD +${effect.goldBonus}%` : '';
                            
                            const allBonuses = [statBonuses, experienceBonus, goldBonus]
                              .filter(Boolean)
                              .join(' ');
                            
                            return (
                              <Text key={`gem-${index}`} style={styles.compactEffectText}>
                                <Text style={[styles.effectGemName, { color: gemData?.color || Colors.accent }]}>
                                  {effect.gemName}
                                </Text>
                                <Text style={styles.effectSeparator}> • </Text>
                                <Text style={[
                                  styles.effectBattles,
                                  { color: isExpiring ? Colors.error : Colors.textSecondary }
                                ]}>
                                  {effect.battlesRemaining}
                                </Text>
                                {allBonuses && (
                                  <>
                                    <Text style={styles.effectSeparator}> • </Text>
                                    <Text style={styles.effectBonuses}>{allBonuses}</Text>
                                  </>
                                )}
                              </Text>
                            );
                          })}
                        </View>
                      ) : (
                        <Text style={styles.noEffectsText}>
                          No active effects • Break gems to gain bonuses!
                        </Text>
                      );
                    })()}
                  </>
                ) : (
                  <Text style={styles.noEffectsText}>No character data available</Text>
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

                    {/* Show item names with proper colors */}
                    <View style={styles.itemNamesContainer}>
                      {getItemDisplayData().map((itemData, index) => (
                        <View key={index} style={[
                          styles.itemNameChip,
                          itemData.isGem && styles.gemItemChip
                        ]}>
                          <Text style={[
                            styles.itemNameText,
                            { color: itemData.color }
                          ]}>
                            {itemData.name}
                          </Text>
                        </View>
                      ))}
                    </View>
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
        </Animated.View>
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
  gemItemChip: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  // Ultra-compact effects styles
  compactBuffsContainer: {
    gap: 4,
  },
  compactEffectsList: {
    gap: 4,
  },
  compactEffectText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.text,
  },
  effectGemName: {
    fontWeight: 'bold',
  },
  effectSeparator: {
    color: Colors.textSecondary,
  },
  effectBattles: {
    fontWeight: '500',
  },
  effectBonuses: {
    color: Colors.success,
    fontWeight: '500',
  },
  noEffectsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});