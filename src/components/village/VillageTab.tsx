import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useGame } from '../../context/GameContext';
import ShopTab from '../shop/ShopTab';
import { Colors, RPGTextStyles } from '../../utils/colors';
import { getQuestsForMap } from '../../data/quests';
import { QuestDefinition } from '../../types';

export const VillageTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'quests'>('shop');
  const { wildernessState, currentCharacter, acceptQuest, claimQuestReward } = useGame();

  if (!currentCharacter) {
    return <Text style={styles.error}>No character loaded.</Text>;
  }

  // Determine quests for current map (default to first map if missing)
  const currentMapId = wildernessState?.currentMap.id ?? 'greenwood_valley';
  const quests = getQuestsForMap(currentMapId);

  const renderQuests = () => {
    console.log(`[Village Debug] Rendering quests for character with ${currentCharacter.activeQuests.length} active quests`);
    currentCharacter.activeQuests.forEach(q => {
      console.log(`[Village Debug] Active quest: ${q.questId}, progress: ${q.progress}/${q.goal}`);
    });
    
    return (
      <ScrollView contentContainerStyle={styles.questContainer}>
        {quests.length === 0 && <Text style={styles.error}>No quests available.</Text>}
        {quests.map((quest: QuestDefinition) => {
          const progress = currentCharacter.activeQuests.find(q => q.questId === quest.id);
          const completed = currentCharacter.completedQuests.find(q => q.questId === quest.id);
          console.log(`[Village Debug] Quest ${quest.name}: progress found=${!!progress}, progress=${progress?.progress}/${progress?.goal}`);
          return (
            <View key={quest.id} style={styles.questCard}>
              <Text style={styles.questTitle}>{quest.name}</Text>
              <Text style={styles.questDescription}>{quest.description}</Text>
              {progress && (
                <Text style={styles.questProgress}>
                  Progress: {progress.progress}/{progress.goal}
                </Text>
              )}
              {completed && (
                <Text style={styles.questCompleted}>Completed ✓</Text>
              )}
              <View style={styles.questButtons}>
                {!progress && !completed && (
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptQuest(quest)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                )}
                {progress && progress.isCompleted && !progress.isClaimed && (
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => claimQuestReward(progress.id)}
                  >
                    <Text style={styles.buttonText}>Claim Reward</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Subtab navigation */}
      <View style={styles.subTabNav}>
        <TouchableOpacity
          style={[styles.subTabButton, activeSubTab === 'shop' && styles.subTabActive]}
          onPress={() => setActiveSubTab('shop')}
        >
          <Text style={styles.subTabText}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTabButton, activeSubTab === 'quests' && styles.subTabActive]}
          onPress={() => setActiveSubTab('quests')}
        >
          <Text style={styles.subTabText}>Quests</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeSubTab === 'shop' ? (
          <ShopTab character={currentCharacter} />
        ) : (
          renderQuests()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  subTabNav: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  subTabActive: {
    borderBottomColor: Colors.primary,
    backgroundColor: Colors.active,
  },
  subTabText: {
    ...RPGTextStyles.label,
    color: Colors.text,
  },
  content: { flex: 1 },
  questContainer: { padding: 16 },
  questCard: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  questTitle: { ...RPGTextStyles.h3, color: Colors.primary },
  questDescription: { ...RPGTextStyles.body, color: Colors.textSecondary, marginVertical: 4 },
  questProgress: { ...RPGTextStyles.caption, color: Colors.accent },
  questCompleted: { ...RPGTextStyles.caption, color: Colors.success },
  questButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  acceptButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  claimButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: { ...RPGTextStyles.label, color: Colors.background },
  error: { ...RPGTextStyles.body, color: Colors.error, textAlign: 'center', marginTop: 20 },
}); 