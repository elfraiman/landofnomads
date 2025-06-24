import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Character, CharacterStats, StatType } from '../../types';
import { spendStatPoint } from '../../utils/combatEngine';
import { useGame } from '../../context/GameContext';
import { useCustomAlert } from '../ui/CustomAlert';
import { Colors } from '../../utils/colors';

interface LevelUpModalProps {
  character: Character;
  isVisible: boolean;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ character, isVisible, onClose }) => {
  const { updateCharacter, saveGame } = useGame();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [tempCharacter, setTempCharacter] = useState<Character>(character);
  const [remainingPoints, setRemainingPoints] = useState(0);

  // Initialize with all stat points available when modal opens
  useEffect(() => {
    if (isVisible && character.unspentStatPoints > 0) {
      setTempCharacter({ ...character });
      setRemainingPoints(character.unspentStatPoints);
    }
  }, [isVisible, character]);

  const handleStatIncrease = (statType: StatType) => {
    if (remainingPoints <= 0) return;

    const newCharacter = spendStatPoint(tempCharacter, statType);
    setTempCharacter(newCharacter);
    setRemainingPoints(remainingPoints - 1);
  };

  const handleStatDecrease = (statType: StatType) => {
    const currentIncrease = tempCharacter.stats[statType] - character.stats[statType];
    if (currentIncrease <= 0) return;

    const newCharacter = { ...tempCharacter };
    newCharacter.stats[statType] -= 1;
    newCharacter.unspentStatPoints += 1;

    setTempCharacter(newCharacter);
    setRemainingPoints(remainingPoints + 1);
  };

  const handleConfirm = () => {
    if (remainingPoints > 0) {
      showAlert(
        'Unspent Points',
        `You must allocate all ${remainingPoints} remaining stat points before continuing.`
      );
      return;
    }

    updateCharacter(tempCharacter);
    saveGame();
    onClose();
  };

  const getStatInfo = (statType: StatType) => {
    switch (statType) {
      case 'strength':
        return { name: 'Strength', desc: 'Physical damage & carrying capacity', icon: '' };
      case 'dexterity':
        return { name: 'Dexterity', desc: 'Accuracy, critical hits & dodge', icon: '' };
      case 'constitution':
        return { name: 'Constitution', desc: 'Health & survivability', icon: '' };
      case 'intelligence':
        return { name: 'Intelligence', desc: 'Magic damage & mana', icon: '' };
      case 'speed':
        return { name: 'Speed', desc: 'Turn order & movement', icon: '' };
      default:
        return { name: statType, desc: '', icon: '' };
    }
  };

  const getTotalStatIncrease = (statType: StatType): number => {
    return tempCharacter.stats[statType] - character.stats[statType];
  };

  const statTypes: StatType[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'speed'];

  return (
    <>
      <Modal visible={isVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Level Up!</Text>
              <Text style={styles.subtitle}>
                {character.name} reached Level {character.level}
              </Text>
            </View>

            {/* Points Counter */}
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsNumber}>{remainingPoints}</Text>
              <Text style={styles.pointsLabel}>Points Remaining</Text>
            </View>

            {/* Stats List */}
            <ScrollView style={styles.statsScrollView} showsVerticalScrollIndicator={false}>
              {statTypes.map((statType) => {
                const statInfo = getStatInfo(statType);
                const currentValue = character.stats[statType];
                const increase = getTotalStatIncrease(statType);
                const newValue = currentValue + increase;
                const canDecrease = increase > 0;
                const canIncrease = remainingPoints > 0;

                return (
                  <View key={statType} style={styles.statRow}>

                    {/* Stat Info */}
                    <View style={styles.statInfo}>
                      <View style={styles.statHeader}>
                        <View style={styles.statDetails}>
                          <Text style={styles.statName}>{statInfo.name}</Text>
                          <Text style={styles.statDesc}>{statInfo.desc}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                      <TouchableOpacity
                        style={[styles.button, !canDecrease && styles.buttonDisabled]}
                        onPress={() => handleStatDecrease(statType)}
                        disabled={!canDecrease}
                      >
                        <Text style={[styles.buttonText, !canDecrease && styles.buttonTextDisabled]}>
                          −
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.valueContainer}>
                        <Text style={styles.currentValue}>{currentValue}</Text>
                        {increase > 0 && (
                          <>
                            <Text style={styles.arrow}>→</Text>
                            <Text style={styles.newValue}>{newValue}</Text>
                          </>
                        )}
                      </View>

                      <TouchableOpacity
                        style={[styles.button, !canIncrease && styles.buttonDisabled]}
                        onPress={() => handleStatIncrease(statType)}
                        disabled={!canIncrease}
                      >
                        <Text style={[styles.buttonText, !canIncrease && styles.buttonTextDisabled]}>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                );
              })}
            </ScrollView>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((character.unspentStatPoints - remainingPoints) / character.unspentStatPoints) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {character.unspentStatPoints - remainingPoints} of {character.unspentStatPoints} points allocated
              </Text>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[styles.confirmButton, remainingPoints > 0 && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={remainingPoints > 0}
            >
              <Text style={[styles.confirmButtonText, remainingPoints > 0 && styles.confirmButtonTextDisabled]}>
                {remainingPoints > 0 ? `Allocate ${remainingPoints} More Points` : 'Confirm Changes'}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
      <AlertComponent />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  pointsContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.success,
    shadowColor: Colors.success,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  pointsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.success,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  statRow: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.background,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statInfo: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDetails: {
    flex: 1,
  },
  statName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  statDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.active,
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.borderAccent,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  buttonTextDisabled: {
    color: Colors.textDisabled,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    minWidth: 60,
    justifyContent: 'center',
  },
  currentValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  arrow: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 4,
  },
  newValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    height: 8,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressFill: {
    backgroundColor: Colors.success,
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.success,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  confirmButtonTextDisabled: {
    color: Colors.textDisabled,
  },
});

export default LevelUpModal; 