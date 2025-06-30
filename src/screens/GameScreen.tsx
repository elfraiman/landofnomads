import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import { useGame } from '../context/GameContext';
import { Colors, ColorUtils, RPGTextStyles } from '../utils/colors';
import CharacterStatsTab from '../components/character/CharacterStatsTab';
import CombatTab from '../components/combat/CombatTab';
import EquipmentTab from '../components/character/EquipmentTab';
import InventoryTab from '../components/character/InventoryTab';
import { GemTab } from '../components/character/GemTab';
import { WildernessTab } from '../components/wilderness/WildernessTab';
import LevelUpModal from '../components/character/LevelUpModal';
import { NotificationSystem } from '../components/ui/NotificationSystem';

const { width } = Dimensions.get('window');

type TabType = 'stats' | 'combat' | 'equipment' | 'inventory' | 'gems' | 'wilderness';

interface Tab {
  id: TabType;
  label: string;
  emoji: string;
}

interface GameScreenProps {
  onLogout: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const { currentCharacter, checkLevelUp, performLevelUp, error, notifications, dismissNotification, saveGame, debugSaveData, addTestItem } = useGame();

  // Tab configuration for easy management
  const tabs: Tab[] = [
    { id: 'stats', label: 'Stats', emoji: '' },
    { id: 'combat', label: 'Combat', emoji: '' },
    { id: 'equipment', label: 'Equipment', emoji: '' },
    { id: 'inventory', label: 'Inventory', emoji: '' },
    { id: 'gems', label: 'Gems', emoji: '' },
    { id: 'wilderness', label: 'Wilderness', emoji: '' },
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
      saveGame();
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
      case 'combat':
        return <CombatTab character={currentCharacter} />;
      case 'equipment':
        return <EquipmentTab character={currentCharacter} />;
      case 'inventory':
        return <InventoryTab character={currentCharacter} />;
      case 'gems':
        return <GemTab />;
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
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: Colors.success, marginRight: 10 }]}
            onPress={() => {
              console.log('Test button pressed');
              addTestItem();
              debugSaveData();
            }}
          >
            <Text style={styles.logoutButtonText}>TEST</Text>
          </TouchableOpacity>
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
          {tabs.map((tab) => {
            const gemCount = tab.id === 'gems' ? currentCharacter.inventory.filter(item => item.type === 'gem').length : 0;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <View style={styles.tabContent}>
                  <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                    {tab.emoji} {tab.label}
                  </Text>
                  {tab.id === 'gems' && gemCount > 0 && (
                    <View style={styles.gemBadge}>
                      <Text style={styles.gemBadgeText}>{gemCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
    marginTop: 20,
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
    ...RPGTextStyles.h2,
    color: Colors.text,
  },
  characterClass: {
    ...RPGTextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  resourcesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
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
    ...RPGTextStyles.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  resourceValue: {
    ...RPGTextStyles.caption,
    color: Colors.gold,
    fontWeight: '700',
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
    ...RPGTextStyles.caption,
    color: Colors.background,
    fontWeight: '700',
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
    ...RPGTextStyles.caption,
    color: Colors.background,
    fontWeight: '700',
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
    ...RPGTextStyles.caption,
    color: Colors.background,
    fontWeight: '700',
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
    ...RPGTextStyles.caption,
    color: Colors.background,
    fontWeight: '700',
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
    ...RPGTextStyles.label,
    color: Colors.background,
    fontWeight: '700',
  },
  tabContainer: {
    paddingTop: 6,
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
    ...RPGTextStyles.label,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  activeTabText: {
    ...RPGTextStyles.label,
    color: Colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    position: 'relative',
    alignItems: 'center',
  },
  gemBadge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  gemBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.background,
  },
  errorText: {
    ...RPGTextStyles.h3,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default GameScreen; 