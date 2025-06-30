import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';
import { characterClasses } from '../data/classes';
import { CharacterClass } from '../types';
import { Colors, ColorUtils } from '../utils/colors';
import RPGText from '../components/ui/RPGText';
import { useCustomAlert } from '../components/ui/CustomAlert';

interface CharacterCreationScreenProps {
  onCharacterCreated: () => void;
}

const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({ onCharacterCreated }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { createCharacter } = useGame();
  const { showAlert, AlertComponent } = useCustomAlert();

  const handleCreateCharacter = async () => {
    if (!name.trim()) {
      showAlert(
        'Name Required',
        'Every hero needs a name. What shall yours be?',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (!selectedClass) {
      showAlert(
        'Class Required',
        'Choose your path before beginning your journey.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      setIsCreating(true);
      await createCharacter(name.trim(), selectedClass.id);
      onCharacterCreated();
    } catch (error) {
      showAlert(
        'Creation Failed',
        'The fates have intervened. Please try again.',
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  const getStatColor = (statType: string): string => {
    switch (statType) {
      case 'strength': return Colors.damage;
      case 'dexterity': return Colors.uncommon;
      case 'constitution': return Colors.health;
      case 'intelligence': return Colors.mana;
      case 'speed': return Colors.stamina;
      default: return Colors.textSecondary;
    }
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

  const getStatDescription = (stat: string): string => {
    switch (stat) {
      case 'strength': return 'Physical damage';
      case 'dexterity': return 'Accuracy and Critical hit chance';
      case 'constitution': return 'Health points and Defense';
      case 'intelligence': return 'Magic damage';
      case 'speed': return 'Action speed and Evasion';
      default: return '';
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <RPGText variant="title" style={styles.title}>Forge Your Destiny</RPGText>
            <RPGText variant="subtitle" style={styles.subtitle}>The path to legend begins with a choice</RPGText>
          </View>

          {/* Character Name Input */}
          <View style={styles.section}>
            <RPGText variant="h2" style={styles.sectionTitle}>Name Your Hero</RPGText>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="What shall they call you?"
                placeholderTextColor={Colors.textMuted}
                maxLength={20}
              />
              <RPGText variant="caption" style={styles.characterCount}>{name.length}/20</RPGText>
            </View>
          </View>

          {/* Class Selection */}
          <View style={styles.section}>
            <RPGText variant="h2" style={styles.sectionTitle}>Choose Your Path</RPGText>
            <RPGText variant="subtitle" style={styles.sectionSubtitle}>
              Your calling awaits
            </RPGText>

            {/* Stats Legend */}
            <View style={styles.statsLegend}>
              <RPGText variant="medieval" style={styles.statsLegendTitle}>Combat Attributes</RPGText>
              {Object.keys(characterClasses[0].startingStats).map((stat) => (
                <View key={stat} style={styles.legendItem}>
                  <RPGText variant="caption" style={[styles.legendLabel, { color: getStatColor(stat) }]}>
                    {stat.charAt(0).toUpperCase() + stat.slice(1, 3)}
                  </RPGText>
                  <RPGText variant="caption" style={styles.legendDescription}>
                    {getStatDescription(stat)}
                  </RPGText>
                </View>
              ))}
            </View>

            <View style={styles.classGrid}>
              {characterClasses.map((characterClass) => {
                const classColor = ColorUtils.getClassColor(characterClass.id);
                const isSelected = selectedClass?.id === characterClass.id;

                return (
                  <TouchableOpacity
                    key={characterClass.id}
                    style={[
                      styles.classCard,
                      {
                        borderColor: isSelected ? classColor : Colors.border,
                        backgroundColor: isSelected ? ColorUtils.withOpacity(classColor, 0.1) : Colors.surface,
                      }
                    ]}
                    onPress={() => setSelectedClass(characterClass)}
                  >
                    {/* Class Header and Description */}
                    <View style={styles.classHeader}>
                      <View style={styles.classNameContainer}>
                        <RPGText variant="h3" style={[styles.className, { color: classColor }]}>
                          {characterClass.name}
                        </RPGText>
                        <RPGText variant="caption" style={styles.classPlaystyle}>
                          {getPlaystyleDescription(characterClass.id)}
                        </RPGText>
                      </View>
                    </View>

                    {/* Stats in a Row */}
                    <View style={styles.cardContent}>
                      {/* Starting Stats */}
                      <View style={styles.statsContainer}>
                        <View style={styles.statsGrid}>
                          {Object.entries(characterClass.startingStats).map(([stat, value]) => (
                            <View key={stat} style={styles.statItem}>
                              <RPGText variant="caption" style={[
                                styles.statLabel,
                                characterClass.primaryStat === stat && styles.primaryStatLabel
                              ]}>
                                {stat.charAt(0).toUpperCase() + stat.slice(1, 3)}
                              </RPGText>
                              <RPGText variant="stat" style={[
                                styles.statValue,
                                { color: getStatColor(stat) }
                              ]}>
                                {value}
                              </RPGText>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: classColor }]}>
                        <RPGText variant="caption" style={styles.selectedText}>✓</RPGText>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Create Character Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: selectedClass ? ColorUtils.getClassColor(selectedClass.id) : Colors.disabled,
                opacity: isCreating ? 0.7 : 1
              }
            ]}
            onPress={handleCreateCharacter}
            disabled={!selectedClass || !name.trim() || isCreating}
          >
            <RPGText variant="medieval" style={styles.createButtonText}>
              {isCreating ? 'Forging Legend...' : 'Begin Your Saga'}
            </RPGText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AlertComponent />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,

  },
  content: {
    padding: 12,
    paddingVertical: 26,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 36,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: 4,
    fontSize: 18,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
    marginBottom: 8,
  },
  nameInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'System',
  },
  characterCount: {
    color: Colors.textMuted,
    marginLeft: 8,
  },
  classGrid: {
    gap: 8,
  },
  classCard: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  classNameContainer: {
    flex: 1,
  },
  className: {
    marginBottom: 2,
    fontSize: 16,
  },
  classPlaystyle: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  statItem: {
    alignItems: 'center',
    width: '18%',
  },
  statLabel: {
    color: Colors.textMuted,
    marginBottom: 2,
    fontSize: 10,
    textAlign: 'center',
  },
  primaryStatLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 14,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: Colors.text,
    fontSize: 14,
  },
  createButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: Colors.text,
    fontSize: 18,
  },
  statsLegend: {
    backgroundColor: ColorUtils.withOpacity(Colors.surface, 0.5),
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendLabel: {
    width: 30,
    fontSize: 11,
    fontWeight: '700',
  },
  legendDescription: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statsLegendTitle: {
    color: Colors.primary,
    marginBottom: 6,
    fontSize: 12,
  },
});

export default CharacterCreationScreen; 