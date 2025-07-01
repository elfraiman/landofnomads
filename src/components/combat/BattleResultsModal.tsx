import React, { useEffect, useRef } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { Character, DetailedBattleResult, Item, GemType, ItemRarity, Gem, QuestProgress } from '../../types';
import { Colors, ColorUtils } from '../../utils/colors';
import { getStatAbbreviation } from '../../utils/stats';
import { useGame } from '../../context/GameContext';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';
import { StatusBar } from '../ui/StatusBar';
import { CombatLog } from '../ui/CombatLog';
import { RPGTextStyles } from '../../utils/colors';

interface BattleResultsModalProps {
  isVisible: boolean;
  onClose: () => void;
  result: DetailedBattleResult;
}

interface TotalRewards {
  experience: number;
  gold: number;
  items: Item[];
}

export const BattleResultsModal: React.FC<BattleResultsModalProps> = ({
  isVisible,
  onClose,
  result,
}) => {
  const { currentCharacter, getExperiencePercentage, getExperienceToNextLevel, getActiveGemEffects, getQuestDefinition } = useGame();
  
  // Animation for gem drops
  const borderAnimValue = useRef(new Animated.Value(0)).current;
  const glowAnimValue = useRef(new Animated.Value(0)).current;

  // Always call useEffect to maintain hook order
  useEffect(() => {
    if (!isVisible || !result) return;

    const totalRewards = result.totalRewards || { experience: 0, gold: 0, items: [] };
    
    // Check if any gems were dropped
    const hasGemDrop = totalRewards.items && totalRewards.items.some((item: any) => 
      (typeof item === 'string' && (item.includes('gem_') || item.includes('Ruby') || item.includes('Sapphire') || 
      item.includes('Emerald') || item.includes('Diamond') || item.includes('Opal') || 
      item.includes('Citrine') || item.includes('Amber'))) ||
      (typeof item === 'object' && item?.type === 'gem')
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
  }, [isVisible, result, borderAnimValue, glowAnimValue]);

  if (!isVisible || !result) return null;

  const playerHealthAfter = result.playerHealthAfter || 0;
  const playerMaxHealth = result.playerMaxHealth || 100;
  const totalRewards = result.totalRewards || { experience: 0, gold: 0, items: [] };
  const combatLog = result.combatLog || ['No combat log available'];

  const healthPercentage = (playerHealthAfter / playerMaxHealth) * 100;
  const healthColor = ColorUtils.getHealthColor(healthPercentage);

  // Check if any gems were dropped
  const hasGemDrop = totalRewards.items && totalRewards.items.some((item: any) => 
    (typeof item === 'string' && (item.includes('gem_') || item.includes('Ruby') || item.includes('Sapphire') || 
    item.includes('Emerald') || item.includes('Diamond') || item.includes('Opal') || 
    item.includes('Citrine') || item.includes('Amber'))) ||
    (typeof item === 'object' && item?.type === 'gem')
  );

  // Get item display data with colors
  const getItemDisplayData = (item: any) => {
    // Handle string items (legacy format)
    if (typeof item === 'string') {
      const isGem = item.includes('gem_') || item.includes('Ruby') || item.includes('Sapphire') || 
                   item.includes('Emerald') || item.includes('Diamond') || item.includes('Opal') || 
                   item.includes('Citrine') || item.includes('Amber');
      return { 
        name: item, 
        color: isGem ? Colors.gold : Colors.text, 
        isGem 
      };
    }

    // Handle object items
    if (item && typeof item === 'object') {
      // Check if it's a gem
      if (item.type === 'gem') {
        const gemType = (item as Gem).gemType;
        return { name: item.name, color: ColorUtils.getGemTypeColor(gemType), isGem: true };
      }

      // Regular items - use rarity colors
      return {
        name: item.name,
        color: ColorUtils.getRarityColor(item.rarity),
        isGem: false
      };
    }

    // Fallback
    return { name: String(item), color: Colors.text, isGem: false };
  };

  const itemDisplayData = totalRewards.items.map(item => getItemDisplayData(item));

  // Get active gem effects for display
  const activeGemEffects = currentCharacter?.activeGemEffects || [];

  // Get experience data
  const experiencePercentage = currentCharacter ? getExperiencePercentage(currentCharacter) : 0;
  const experienceToNext = currentCharacter ? getExperienceToNextLevel(currentCharacter) : 0;

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

  // Use quest progress updates from battle result (more accurate than calculating from current state)
  const progressedQuests = result.questProgressUpdates || [];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, animatedModalStyle]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: result.victory ? Colors.victory : Colors.defeat }]}>
              {result.victory ? 'Victory!' : 'Defeat'}
              </Text>
            <Text style={styles.subtitle}>{result.playerName}</Text>
          </View>

          <ScrollView 
            style={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            bounces={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Health Status & Experience Progress */}
            <View style={styles.healthContainer}>
              <Text style={styles.sectionTitle}>Battle Result</Text>
              <View style={styles.healthBar}>
                <View 
                  style={[
                    styles.healthFill, 
                    { 
                      width: `${healthPercentage}%`, 
                      backgroundColor: healthColor 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.healthText}>
                {playerHealthAfter}/{playerMaxHealth} HP ({Math.round(healthPercentage)}%)
              </Text>
              
              {/* Experience Progress */}
              {currentCharacter && (
                <>
                  <View style={styles.experienceBar}>
                    <View 
                      style={[
                        styles.experienceFill, 
                        { width: `${experiencePercentage}%` }
                      ]} 
                    />
                          </View>
                  <Text style={styles.experienceText}>
                    Level {currentCharacter.level} • {experienceToNext} XP to next level
                  </Text>
                </>
              )}
                        </View>

            {/* Active Gem Effects */}
            {activeGemEffects.length > 0 && (
              <View style={styles.gemEffectsContainer}>
                <Text style={styles.sectionTitle}>Active Buffs & Auras</Text>
                {activeGemEffects.map((effect, index) => (
                  <View key={index} style={styles.gemEffectItem}>
                    <View style={styles.gemEffectHeader}>
                      <Text style={[styles.gemEffectName, { color: ColorUtils.getGemTypeColor(effect.gemType) }]} numberOfLines={2}>
                         {effect.gemName}
                      </Text>
                      <Text style={styles.gemEffectDuration}>
                        {effect.battlesRemaining} battles left
                      </Text>
                    </View>
                    <Text style={styles.gemEffectDescription} numberOfLines={3}>
                      {effect.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Combat Log */}
            <View style={styles.combatLogContainer}>
              <Text style={styles.sectionTitle}>Combat Log</Text>
              <CombatLog
                result={result}
                maxHeight={200}
                showScrollIndicator={true}
                nestedScrollEnabled={true}
              />
            </View>

            {/* Rewards */}
              <View style={styles.rewardsContainer}>
              <Text style={styles.sectionTitle}>Rewards</Text>
              <Text style={[styles.rewardText, { color: Colors.experience }]}>Experience: +{totalRewards.experience}</Text>
              <Text style={[styles.rewardText, { color: Colors.gold }]}>Gold: +{totalRewards.gold}</Text>
              {itemDisplayData.length > 0 && (
                <View style={styles.itemsContainer}>
                  <Text style={styles.itemsTitle}>Items Found:</Text>
                  {itemDisplayData.map((item, index) => (
                    <Text key={index} style={[styles.itemText, { color: item.color }]} numberOfLines={2}>
                      {item.isGem ? '💎 ' : ''}{item.name}
                  </Text>
                  ))}
                  </View>
                )}
            </View>

            {/* Quest Progress Updates */}
            {progressedQuests.length > 0 && (
              <View style={styles.questProgressContainer}>
                <Text style={styles.sectionTitle}>Quest Progress</Text>
                {/* Filter out duplicate quests by quest name and only show the latest progress */}
                {progressedQuests
                  .reduce((unique, q) => {
                    // Keep only the latest progress for each quest
                    const existing = unique.find(u => u.questName === q.questName);
                    if (!existing) {
                      unique.push(q);
                    } else if (q.progress > existing.progress) {
                      // Replace with higher progress
                      unique[unique.indexOf(existing)] = q;
                    }
                    return unique;
                  }, [] as typeof progressedQuests)
                  .map((q, idx) => (
                    <Text key={idx} style={styles.questProgressText} numberOfLines={2}>
                      {q.questName}: {q.progress}/{q.goal} ({Math.floor((q.progress / q.goal) * 100)}%)
                    </Text>
                  ))
                }
              </View>
            )}
          </ScrollView>

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 16,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    height: '95%',
    borderWidth: 3,
    borderColor: Colors.border,
    flexDirection: 'column',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollContent: {
    flex: 1,
    minHeight: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
    marginTop: 4,
  },
  healthContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: Colors.overlay,
    borderRadius: 8,
  },
  healthBar: {
    height: 7,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  healthFill: {
    height: '100%',
    borderRadius: 3,
  },
  healthText: {
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  gemEffectsContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: Colors.overlay,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  gemEffectItem: {
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  gemEffectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  gemEffectName: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  gemEffectDuration: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  gemEffectDescription: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
  experienceBar: {
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  experienceFill: {
    height: '100%',
    backgroundColor: Colors.experience,
    borderRadius: 2.5,
  },
  experienceText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  weaponText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  combatLogContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: Colors.overlay,
    borderRadius: 8,
  },
  rewardsContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: Colors.overlay,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 13,
    color: Colors.success,
    marginBottom: 3,
  },
  itemsContainer: {
    marginTop: 6,
  },
  itemsTitle: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 3,
  },
  itemText: {
    fontSize: 12,
    marginBottom: 2,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 44, // Ensure touch target is large enough
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.background,
    fontWeight: 'bold',
  },
  weaponUsedText: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 3,
  },
  questProgressContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: Colors.overlay,
    borderRadius: 8,
  },
  questProgressText: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 3,
  },
}); 