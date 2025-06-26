import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Character, StatType } from '../../types';
import { useGame } from '../../context/GameContext';
import { Colors, ColorUtils, RPGTextStyles } from '../../utils/colors';

interface TrainingTabProps {
  character: Character;
}

const TrainingTab: React.FC<TrainingTabProps> = ({ character }) => {
  const [isTraining, setIsTraining] = useState(false);
  const { trainStat, canTrain, getTrainingCost } = useGame();

  const handleTrain = async (statType: StatType) => {
    if (!canTrain(statType)) return;

    try {
      setIsTraining(true);
      const result = await trainStat(statType);

      if (result.success) {
        const message = result.criticalSuccess
          ? `Critical Success! ${statType} increased by 2 (${result.oldValue} → ${result.newValue})`
          : `Success! ${statType} increased by 1 (${result.oldValue} → ${result.newValue})`;
        Alert.alert('Training Complete', message);
      } else {
        Alert.alert('Training Failed', `Failed to improve ${statType}. Better luck next time!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const formatCooldown = (lastTrainingTime: number): string => {
    const cooldownTime = 30 * 60 * 1000; // 30 minutes
    const timeLeft = cooldownTime - (Date.now() - lastTrainingTime);

    if (timeLeft <= 0) return 'Ready';

    const minutes = Math.ceil(timeLeft / (60 * 1000));
    return `${minutes}m`;
  };

  const TrainingButton = ({ statType, label }: { statType: StatType; label: string }) => {
    const cost = getTrainingCost(statType);
    const canTrainStat = canTrain(statType);
    const cooldown = formatCooldown(character.lastTraining[statType]);
    const isReady = cooldown === 'Ready';

    return (
      <View style={styles.trainingItem}>
        <View style={styles.trainingHeader}>
          <Text style={styles.trainingLabel}>{label}</Text>
          <Text style={styles.currentValue}>{character.stats[statType]}</Text>
        </View>

        <View style={styles.trainingInfo}>
          <Text style={styles.trainingCost}>
            Cost: {cost.energy} energy, {cost.gold} gold
          </Text>
          <Text style={[styles.cooldownText, { color: isReady ? Colors.success : Colors.error }]}>
            {cooldown}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.trainButton,
            !canTrainStat && styles.disabledButton
          ]}
          onPress={() => handleTrain(statType)}
          disabled={!canTrainStat || isTraining}
        >
          <Text style={[
            styles.trainButtonText,
            !canTrainStat && styles.disabledButtonText
          ]}>
            {isTraining ? 'Training...' : 'Train'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Stat Training</Text>
        <Text style={styles.subtitle}>
          Train your stats to become stronger. Each training session has a cooldown period.
        </Text>

        <View style={styles.resourcesInfo}>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceLabel}>Energy:</Text>
            <Text style={styles.resourceValue}>
              {character.energy}/{character.maxEnergy}
            </Text>
          </View>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceLabel}>Gold:</Text>
            <Text style={styles.resourceValue}>{character.gold}</Text>
          </View>
        </View>

        <View style={styles.trainingList}>
          <TrainingButton statType="strength" label="Strength" />
          <TrainingButton statType="dexterity" label="Dexterity" />
          <TrainingButton statType="constitution" label="Constitution" />
          <TrainingButton statType="intelligence" label="Intelligence" />
          <TrainingButton statType="speed" label="Speed" />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Training Information</Text>
          <Text style={styles.infoText}>
            • Training costs increase with higher stat levels{'\n'}
            • Success rate decreases as stats get higher{'\n'}
            • 10% chance for critical success (double gain){'\n'}
            • 30-minute cooldown between training sessions{'\n'}
            • Energy regenerates 10 points every 5 minutes
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    ...RPGTextStyles.h1,
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...RPGTextStyles.body,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  resourcesInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  resourceItem: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  resourceLabel: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  resourceValue: {
    ...RPGTextStyles.body,
    color: Colors.text,
    fontWeight: '700',
  },
  trainingList: {
    gap: 15,
    marginBottom: 25,
  },
  trainingItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  trainingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trainingLabel: {
    ...RPGTextStyles.body,
    color: Colors.text,
    fontWeight: '600',
  },
  currentValue: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  trainingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trainingCost: {
    ...RPGTextStyles.bodySmall,
    color: Colors.warning,
    fontWeight: '600',
  },
  cooldownText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  trainButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  trainButtonText: {
    ...RPGTextStyles.bodySmall,
    color: Colors.background,
    fontWeight: '700',
    textAlign: 'center',
  },
  disabledButtonText: {
    color: Colors.textMuted,
  },
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  infoTitle: {
    ...RPGTextStyles.body,
    color: Colors.primary,
    marginBottom: 8,
    fontWeight: '700',
  },
  infoText: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default TrainingTab; 