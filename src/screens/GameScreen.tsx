import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { Colors, ColorUtils } from '../utils/colors';
import CharacterStatsTab from '../components/character/CharacterStatsTab';
import TrainingTab from '../components/character/TrainingTab';
import CombatTab from '../components/combat/CombatTab';
import EquipmentTab from '../components/character/EquipmentTab';
import InventoryTab from '../components/character/InventoryTab';

import { WildernessTab } from '../components/wilderness/WildernessTab';
import LevelUpModal from '../components/character/LevelUpModal';
import { NotificationSystem } from '../components/ui/NotificationSystem';

type TabType = 'stats' | 'training' | 'combat' | 'equipment' | 'inventory' | 'wilderness';

interface GameScreenProps {
  onLogout: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const { currentCharacter, checkLevelUp, performLevelUp, error, notifications, dismissNotification, saveGame, debugSaveData } = useGame();

  const testStorage = async () => {
    try {
      console.log('=== STORAGE TEST ===');
      await saveGame();
      console.log('Save completed, now testing load...');
      await debugSaveData();
      console.log('=== TEST COMPLETE ===');
    } catch (err) {
      console.error('Storage test failed:', err);
    }
  };

  // Tab configuration for easy management
  const tabs = [
    { id: 'stats' as TabType, label: 'Stats', emoji: '' },
    { id: 'training' as TabType, label: 'Training', emoji: '' },
    { id: 'combat' as TabType, label: 'Combat', emoji: '' },
    { id: 'equipment' as TabType, label: 'Equipment', emoji: '' },
    { id: 'inventory' as TabType, label: 'Inventory', emoji: '' },
    { id: 'wilderness' as TabType, label: 'Wilderness', emoji: '' },
  ];

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  useEffect(() => {
    // Check for level up when component mounts or character changes
    if (checkLevelUp()) {
      performLevelUp(); // This will give stat points
      setShowLevelUpModal(true);
    }
  }, [currentCharacter?.experience, checkLevelUp, performLevelUp]);

  if (!currentCharacter) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No character selected</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Back to Character Selection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return <CharacterStatsTab character={currentCharacter} />;
      case 'training':
        return <TrainingTab character={currentCharacter} />;
      case 'combat':
        return <CombatTab character={currentCharacter} />;
      case 'equipment':
        return <EquipmentTab character={currentCharacter} />;
      case 'inventory':
        return <InventoryTab character={currentCharacter} />;
      case 'wilderness':
        return <WildernessTab />;
      default:
        return <CharacterStatsTab character={currentCharacter} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{currentCharacter.name}</Text>
          <Text style={styles.characterClass}>
            Level {currentCharacter.level} {currentCharacter.class.name}
          </Text>
          <View style={styles.resourcesContainer}>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceLabel}>Gold:</Text>
              <Text style={styles.resourceValue}>{currentCharacter.gold}</Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceLabel}>Energy:</Text>
              <Text style={styles.resourceValue}>
                {currentCharacter.energy}/{currentCharacter.maxEnergy}
              </Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceLabel}>W/L:</Text>
              <Text style={styles.resourceValue}>
                {currentCharacter.wins}/{currentCharacter.losses}
              </Text>
            </View>
          </View>
          {currentCharacter.unspentStatPoints > 0 && (
            <View style={styles.unspentPointsBadge}>
              <Text style={styles.unspentPointsText}>
                {currentCharacter.unspentStatPoints} Stat Points Available!
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Switch</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          style={styles.tabScroll}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Level Up Modal */}
      <LevelUpModal
        character={currentCharacter}
        isVisible={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
      />

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterClass: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  resourcesContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resourceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 4,
    fontWeight: '500',
  },
  resourceValue: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: 'bold',
  },
  unspentPointsBadge: {
    backgroundColor: Colors.warning,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    shadowColor: Colors.warning,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  unspentPointsText: {
    fontSize: 11,
    color: Colors.background,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    backgroundColor: Colors.error,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  testButtonText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: Colors.info,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  debugButtonText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: Colors.success,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  logoutButtonText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    shadowColor: Colors.background,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    minWidth: 110,
    marginHorizontal: 2,
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: Colors.surfaceElevated,
  },
  activeTab: {
    borderBottomColor: Colors.primary,
    backgroundColor: Colors.active,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 50,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default GameScreen; 