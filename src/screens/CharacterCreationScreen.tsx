import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { characterClasses } from '../data/classes';
import { CharacterClass } from '../types';
import { Colors, ColorUtils, RPGTextStyles } from '../utils/colors';

interface CharacterCreationScreenProps {
  onCharacterCreated: () => void;
}

const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({ onCharacterCreated }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { createCharacter } = useGame();

  const handleCreateCharacter = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a character name');
      return;
    }

    if (!selectedClass) {
      Alert.alert('Error', 'Please select a character class');
      return;
    }

    try {
      setIsCreating(true);
      await createCharacter(name.trim(), selectedClass.id);
      onCharacterCreated();
    } catch (error) {
      Alert.alert('Error', 'Failed to create character');
    } finally {
      setIsCreating(false);
    }
  };

  const getClassIcon = (classId: string): string => {
    return '';
  };

  const getClassColor = (classId: string): string => {
    return ColorUtils.getClassColor(classId);
  };


  const getStatIcon = (statType: string): string => {
    return '';
  };

  const getStatColor = (statType: string): string => {
    switch (statType) {
      case 'strength': return '#E67E5C';
      case 'dexterity': return '#6AAF6A'; 
      case 'constitution': return '#C15B5B';
      case 'intelligence': return '#7FACD4';
      case 'speed': return '#D4B650';
      default: return '#8b949e';
    }
  };

  const getGrowthColor = (multiplier: number): string => {
    if (multiplier >= 1.3) return '#2ea043'; // Green for high growth
    if (multiplier >= 1.0) return '#FFD700'; // Yellow for normal growth
    return '#f85149'; // Red for low growth
  };

  const getPlaystyleDescription = (classId: string): string => {
    switch (classId) {
      case 'warrior': return 'Tank & Spank • High survivability with consistent damage';
      case 'rogue': return 'Hit & Run • Critical strikes and evasive maneuvers';
      case 'mage': return 'Glass Cannon • Devastating magic but fragile defense';
      case 'paladin': return 'Jack of All Trades • Balanced offense and defense';
      case 'berserker': return 'All or Nothing • Extreme damage with high risk';
      case 'archer': return 'Precision Strikes • Ranged attacks with high accuracy';
      default: return '';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Champion</Text>
          <Text style={styles.subtitle}>Choose your path to glory and forge your legend!</Text>
        </View>

        {/* Character Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Character Name</Text>
          <View style={styles.nameInputContainer}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your hero's name..."
              placeholderTextColor="#6e7681"
              maxLength={20}
            />
            <Text style={styles.characterCount}>{name.length}/20</Text>
          </View>
        </View>

        {/* Class Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Class</Text>
          <Text style={styles.sectionSubtitle}>
            Each class offers a unique playstyle and strengths
          </Text>

          <View style={styles.classGrid}>
            {characterClasses.map((characterClass) => {
              const classColor = getClassColor(characterClass.id);
              const isSelected = selectedClass?.id === characterClass.id;

              return (
                <TouchableOpacity
                  key={characterClass.id}
                  style={[
                    styles.classCard,
                    {
                      borderColor: isSelected ? classColor : '#21262d',
                      backgroundColor: isSelected ? `${classColor}15` : '#161b22',
                    }
                  ]}
                  onPress={() => setSelectedClass(characterClass)}
                >
                  {/* Class Header */}
                  <View style={styles.classHeader}>
                    <Text style={styles.classIcon}>
                      {getClassIcon(characterClass.id)}
                    </Text>
                    <View style={styles.classNameContainer}>
                      <Text style={[styles.className, { color: classColor }]}>
                        {characterClass.name}
                      </Text>
                      <Text style={styles.classPlaystyle}>
                        {getPlaystyleDescription(characterClass.id)}
                      </Text>
                    </View>
                  </View>

                  {/* Class Description */}
                  <Text style={styles.classDescription}>
                    {characterClass.description}
                  </Text>

                  {/* Starting Stats */}
                  <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Starting Stats</Text>
                    <View style={styles.statsGrid}>
                      {Object.entries(characterClass.startingStats).map(([stat, value]) => (
                        <View key={stat} style={styles.statItem}>
                          <Text style={styles.statIcon}>
                            {getStatIcon(stat)}
                          </Text>
                          <Text style={styles.statLabel}>
                            {stat.charAt(0).toUpperCase() + stat.slice(1, 3)}
                          </Text>
                          <Text style={[
                            styles.statValue,
                            { color: getStatColor(stat) }
                          ]}>
                            {value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Primary Stat */}
                  <View style={styles.primaryStatContainer}>
                    <Text style={styles.primaryStatLabel}>Primary Stat:</Text>
                    <Text style={[
                      styles.primaryStatValue,
                      { color: getStatColor(characterClass.primaryStat) }
                    ]}>
                      {characterClass.primaryStat.toUpperCase()}
                    </Text>
                  </View>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: classColor }]}>
                      <Text style={styles.selectedText}>✓ SELECTED</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Class Details */}
        {selectedClass && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedClass.name} Overview
            </Text>

            <View style={[
              styles.selectedClassDetails,
              { borderColor: getClassColor(selectedClass.id) }
            ]}>
              {/* Class Summary */}
              <View style={styles.classSummary}>
                <View style={styles.classOverviewHeader}>
                  <Text style={styles.selectedClassIcon}>
                    {getClassIcon(selectedClass.id)}
                  </Text>
                  <View>
                    <Text style={[
                      styles.selectedClassName,
                      { color: getClassColor(selectedClass.id) }
                    ]}>
                      {selectedClass.name}
                    </Text>
                    <Text style={styles.selectedClassPlaystyle}>
                      {getPlaystyleDescription(selectedClass.id)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.selectedClassDescription}>
                  {selectedClass.description}
                </Text>
              </View>

              {/* Stat Growth */}
              <View style={styles.growthSection}>
                <Text style={styles.growthTitle}>📈 Stat Growth Potential</Text>
                <Text style={styles.growthSubtitle}>
                  How well this class develops each stat over time
                </Text>

                <View style={styles.growthGrid}>
                  {Object.entries(selectedClass.statGrowth).map(([stat, multiplier]) => (
                    <View key={stat} style={styles.growthItem}>
                      <Text style={styles.growthIcon}>
                        {getStatIcon(stat)}
                      </Text>
                      <Text style={styles.growthLabel}>
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}
                      </Text>
                      <View style={styles.growthValueContainer}>
                        <Text style={[
                          styles.growthValue,
                          { color: getGrowthColor(multiplier) }
                        ]}>
                          {multiplier}x
                        </Text>
                        <Text style={styles.growthIndicator}>
                          {multiplier >= 1.3 ? 'High' : multiplier >= 1.0 ? 'Normal' : 'Low'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Recommended Builds */}
              <View style={styles.buildsSection}>
                <Text style={styles.buildsTitle}>Recommended Builds</Text>
                {selectedClass.id === 'warrior' && (
                  <Text style={styles.buildDescription}>
                    <Text style={styles.buildName}>Tank Build:</Text> Focus on Constitution + Strength{'\n'}
                    <Text style={styles.buildName}>Damage Build:</Text> Prioritize Strength + some Dexterity
                  </Text>
                )}
                {selectedClass.id === 'rogue' && (
                  <Text style={styles.buildDescription}>
                    <Text style={styles.buildName}>Assassin Build:</Text> Max Dexterity for critical hits{'\n'}
                    <Text style={styles.buildName}>Speed Build:</Text> Balance Dexterity + Speed for first strikes
                  </Text>
                )}
                {selectedClass.id === 'mage' && (
                  <Text style={styles.buildDescription}>
                    <Text style={styles.buildName}>Pure Mage:</Text> Max Intelligence for devastating spells{'\n'}
                    <Text style={styles.buildName}>Battle Mage:</Text> Intelligence + Constitution for survivability
                  </Text>
                )}
                {selectedClass.id === 'paladin' && (
                  <Text style={styles.buildDescription}>
                    <Text style={styles.buildName}>Balanced Build:</Text> Even distribution across all stats{'\n'}
                    <Text style={styles.buildName}>Holy Tank:</Text> Constitution + Strength with some Intelligence
                  </Text>
                )}
                {selectedClass.id === 'berserker' && (
                  <Text style={styles.buildDescription}>
                    <Text style={styles.buildName}>Pure Berserker:</Text> All-in on Strength for maximum damage{'\n'}
                    <Text style={styles.buildName}>Fury Build:</Text> Strength + Speed for devastating combos
                  </Text>
                )}
                {selectedClass.id === 'archer' && (
                  <Text style={styles.buildDescription}>
                    <Text style={styles.buildName}>Sniper Build:</Text> Max Dexterity for precision strikes{'\n'}
                    <Text style={styles.buildName}>Ranger Build:</Text> Dexterity + Speed + some Constitution
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              backgroundColor: selectedClass ? getClassColor(selectedClass.id) : '#21262d',
              borderColor: selectedClass ? getClassColor(selectedClass.id) : '#30363d',
            },
            (!name.trim() || !selectedClass || isCreating) && styles.disabledButton
          ]}
          onPress={handleCreateCharacter}
          disabled={!name.trim() || !selectedClass || isCreating}
        >
          <Text style={[
            styles.createButtonText,
            { color: (!name.trim() || !selectedClass || isCreating) ? '#6e7681' : '#fff' }
          ]}>
            {isCreating ? 'Creating Hero...' : selectedClass ? `Create ${selectedClass.name}` : 'Choose a Class First'}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tip: You can change your build strategy later by distributing stat points manually!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  content: {
    padding: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  title: {
    ...RPGTextStyles.heroTitle,
    color: '#f0f6fc',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...RPGTextStyles.bodyLarge,
    color: '#8b949e',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...RPGTextStyles.h2,
    color: '#f0f6fc',
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...RPGTextStyles.body,
    color: '#8b949e',
    marginBottom: 16,
  },

  // Name Input
  nameInputContainer: {
    position: 'relative',
  },
  nameInput: {
    ...RPGTextStyles.body,
    backgroundColor: '#21262d',
    borderWidth: 2,
    borderColor: '#30363d',
    borderRadius: 12,
    padding: 16,
    color: '#f0f6fc',
    fontWeight: '500',
  },
  characterCount: {
    ...RPGTextStyles.caption,
    position: 'absolute',
    right: 16,
    top: 16,
    color: '#6e7681',
  },

  // Class Grid
  classGrid: {
    gap: 16,
  },
  classCard: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    position: 'relative',
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classIcon: {
    ...RPGTextStyles.statLarge,
    marginRight: 12,
  },
  classNameContainer: {
    flex: 1,
  },
  className: {
    ...RPGTextStyles.h3,
    marginBottom: 2,
  },
  classPlaystyle: {
    ...RPGTextStyles.caption,
    color: '#8b949e',
    fontStyle: 'italic',
  },
  classDescription: {
    ...RPGTextStyles.bodySmall,
    color: '#8b949e',
    lineHeight: 20,
    marginBottom: 16,
  },

  // Stats
  statsContainer: {
    marginBottom: 12,
  },
  statsTitle: {
    ...RPGTextStyles.label,
    color: '#f0f6fc',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    ...RPGTextStyles.body,
    marginBottom: 2,
  },
  statLabel: {
    ...RPGTextStyles.caption,
    color: '#8b949e',
    marginBottom: 2,
  },
  statValue: {
    ...RPGTextStyles.stat,
  },

  // Primary Stat
  primaryStatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 8,
  },
  primaryStatLabel: {
    ...RPGTextStyles.caption,
    color: '#8b949e',
    marginRight: 6,
  },
  primaryStatValue: {
    ...RPGTextStyles.caption,
    fontWeight: '700',
  },

  // Selection Indicator
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedText: {
    ...RPGTextStyles.caption,
    fontWeight: '700',
    color: '#fff',
  },

  // Selected Class Details
  selectedClassDetails: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  classSummary: {
    marginBottom: 20,
  },
  classOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedClassIcon: {
    ...RPGTextStyles.statLarge,
    fontSize: 40,
    marginRight: 16,
  },
  selectedClassName: {
    ...RPGTextStyles.h1,
    marginBottom: 4,
  },
  selectedClassPlaystyle: {
    ...RPGTextStyles.body,
    color: '#8b949e',
    fontStyle: 'italic',
  },
  selectedClassDescription: {
    ...RPGTextStyles.body,
    color: '#8b949e',
    lineHeight: 20,
  },

  // Growth Section
  growthSection: {
    marginBottom: 20,
  },
  growthTitle: {
    ...RPGTextStyles.body,
    fontWeight: '700',
    color: '#f0f6fc',
    marginBottom: 4,
  },
  growthSubtitle: {
    ...RPGTextStyles.caption,
    color: '#8b949e',
    marginBottom: 12,
  },
  growthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  growthItem: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: '30%',
  },
  growthIcon: {
    ...RPGTextStyles.body,
    marginBottom: 4,
  },
  growthLabel: {
    ...RPGTextStyles.caption,
    color: '#8b949e',
    marginBottom: 4,
  },
  growthValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthValue: {
    ...RPGTextStyles.label,
    fontWeight: '700',
  },
  growthIndicator: {
    ...RPGTextStyles.caption,
  },

  // Builds Section
  buildsSection: {},
  buildsTitle: {
    ...RPGTextStyles.body,
    fontWeight: '700',
    color: '#f0f6fc',
    marginBottom: 8,
  },
  buildDescription: {
    ...RPGTextStyles.bodySmall,
    color: '#8b949e',
    lineHeight: 20,
  },
  buildName: {
    ...RPGTextStyles.bodySmall,
    fontWeight: '700',
    color: '#f0f6fc',
  },

  // Create Button
  createButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#21262d !important',
    borderColor: '#30363d !important',
  },
  createButtonText: {
    ...RPGTextStyles.button,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    ...RPGTextStyles.caption,
    color: '#6e7681',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CharacterCreationScreen; 