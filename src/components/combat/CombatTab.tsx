import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Character, CombatResult, CombatRound } from '../../types';
import { useGame } from '../../context/GameContext';
import BattleViewer from './BattleViewer';
import { Colors, ColorUtils, RPGTextStyles } from '../../utils/colors';

interface CombatTabProps {
  character: Character;
}

const CombatTab: React.FC<CombatTabProps> = ({ character }) => {
  const [isBattling, setIsBattling] = useState(false);
  const [currentBattle, setCurrentBattle] = useState<CombatResult | null>(null);

  const { startBattle, getBattleHistory } = useGame();
  const battleHistory = getBattleHistory();

  const handleBattleComplete = (result: CombatResult) => {
    const enemy = result.attacker.id === character.id ? result.defender : result.attacker;
    const isWinner = result.winner.id === character.id;
    const message = isWinner
      ? `Victory! You defeated ${enemy.name} and gained ${result.experienceGained} XP and ${result.goldGained} gold!`
      : `Defeat! You were defeated by ${enemy.name} but gained ${Math.floor(result.experienceGained * 0.5)} XP.`;

    Alert.alert(isWinner ? 'Victory!' : 'Defeat!', message);

    setCurrentBattle(null);
    setIsBattling(false);
  };

  const handleStartBattle = async () => {
    try {
      setIsBattling(true);
      const result = await startBattle();

      // Show the animated battle
      setCurrentBattle(result);
    } catch (error) {
      Alert.alert('Error', 'Battle failed to start');
      setIsBattling(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Combat Arena</Text>
        <Text style={styles.subtitle}>
          Test your strength against AI opponents and climb the ranks!
        </Text>

        {/* Battle Area */}
        <View style={styles.battleArea}>
          {currentBattle ? (
            <BattleViewer
              result={currentBattle}
              playerCharacter={character}
              onBattleComplete={handleBattleComplete}
            />
          ) : (
            /* Battle Button */
            <TouchableOpacity
              style={[styles.battleButton, isBattling && styles.disabledButton]}
              onPress={handleStartBattle}
              disabled={isBattling}
            >
              <Text style={styles.battleButtonText}>
                {isBattling ? 'Fighting...' : 'Start Battle'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Battle Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Wins</Text>
            <Text style={[styles.statValue, { color: Colors.success }]}>{character.wins}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Losses</Text>
            <Text style={[styles.statValue, { color: Colors.error }]}>{character.losses}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Win Rate</Text>
            <Text style={styles.statValue}>
              {character.wins + character.losses > 0
                ? `${Math.round((character.wins / (character.wins + character.losses)) * 100)}%`
                : '0%'
              }
            </Text>
          </View>
        </View>

        {/* Battle History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Battles</Text>
          {battleHistory.length === 0 ? (
            <Text style={styles.emptyText}>No battles yet. Start your first battle!</Text>
          ) : (
            <View style={styles.historyList}>
              {battleHistory.slice(0, 10).map((battle, index) => {
                const isWinner = battle.winner.id === character.id;
                const opponent = battle.attacker.id === character.id ? battle.defender : battle.attacker;

                return (
                  <View key={battle.id} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={[styles.historyResult, { color: isWinner ? Colors.success : Colors.error }]}>
                        {isWinner ? 'WIN' : 'LOSS'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(battle.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.historyOpponent}>vs {opponent.name}</Text>
                    <Text style={styles.historyDetails}>
                      {battle.rounds.length} rounds • {isWinner ? `+${battle.goldGained} gold` : 'No reward'}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Combat Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Combat Information</Text>
          <Text style={styles.infoText}>
            • Battles are automatic with live animation{'\n'}
            • Turn order determined by Speed stat{'\n'}
            • Winners gain experience and gold{'\n'}
            • Critical hits deal double damage{'\n'}
            • Equipment and stats affect performance
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
  battleArea: {
    marginBottom: 25,
  },
  battleButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  battleButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.background,
    letterSpacing: 1,
  },
  statsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
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
  statItem: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  statLabel: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    ...RPGTextStyles.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    ...RPGTextStyles.h2,
    color: Colors.text,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 8,
  },
  emptyText: {
    ...RPGTextStyles.body,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 30,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 15,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.background,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyResult: {
    ...RPGTextStyles.body,
    fontWeight: '700',
  },
  historyDate: {
    ...RPGTextStyles.caption,
    color: Colors.textMuted,
  },
  historyOpponent: {
    ...RPGTextStyles.body,
    color: Colors.text,
    marginBottom: 4,
    fontWeight: '600',
  },
  historyDetails: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
  },
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default CombatTab; 