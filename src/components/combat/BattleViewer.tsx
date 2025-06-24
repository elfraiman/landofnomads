import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
import { Character, CombatResult, CombatRound } from '../../types';

interface BattleViewerProps {
  result: CombatResult;
  playerCharacter: Character;
  onBattleComplete: (result: CombatResult) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const BattleViewer: React.FC<BattleViewerProps> = ({ result, playerCharacter, onBattleComplete }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [combatLog, setCombatLog] = useState<{ text: string; type: 'attack' | 'critical' | 'dodge' | 'miss' | 'info' }[]>([]);
  const [playerHealth, setPlayerHealth] = useState(0);
  const [enemyHealth, setEnemyHealth] = useState(0);
  const [maxPlayerHealth, setMaxPlayerHealth] = useState(0);
  const [maxEnemyHealth, setMaxEnemyHealth] = useState(0);

  // Animation refs
  const playerShake = useRef(new Animated.Value(0)).current;
  const enemyShake = useRef(new Animated.Value(0)).current;
  const playerHealthAnim = useRef(new Animated.Value(1)).current;
  const enemyHealthAnim = useRef(new Animated.Value(1)).current;
  const combatLogOpacity = useRef(new Animated.Value(0)).current;
  const damageTextAnim = useRef(new Animated.Value(0)).current;
  const battleStartAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentDamageText, setCurrentDamageText] = useState<{
    text: string;
    isPlayer: boolean;
    isCritical: boolean;
    position: number;
  } | null>(null);

  const enemy = result.attacker.id === playerCharacter.id ? result.defender : result.attacker;

  // Get class colors
  const getClassColor = (className: string): string => {
    switch (className.toLowerCase()) {
      case 'warrior': return '#FF6B35'; // Orange-red for strength
      case 'paladin': return '#FFD700'; // Gold for holy warrior
      case 'mage': return '#4A90E2'; // Blue for intelligence/magic
      case 'rogue': return '#32CD32'; // Green for stealth/agility
      case 'archer': return '#8FBC8F'; // Forest green for nature/ranged
      case 'berserker': return '#DC143C'; // Crimson for rage/fury
      default: return '#8b949e'; // Default gray
    }
  };

  // Get class emoji (now returns empty string)
  const getClassEmoji = (className: string): string => {
    return '';
  };

  // Parse combat log text to highlight character names with class colors
  const renderColoredLogText = (text: string, logType: string) => {
    // Split text to find character names
    const parts = text.split(' ');
    return parts.map((part, index) => {
      const cleanPart = part.replace(/[.,!]/g, ''); // Remove punctuation for matching

      // Check if this part is the player character name
      if (cleanPart === playerCharacter.name) {
        return (
          <Text key={index} style={{ color: getClassColor(playerCharacter.class.name), fontWeight: 'bold' }}>
            {part}
          </Text>
        );
      }

      // Check if this part is the enemy character name
      if (cleanPart === enemy.name) {
        return (
          <Text key={index} style={{ color: getClassColor(enemy.class.name), fontWeight: 'bold' }}>
            {part}
          </Text>
        );
      }

      // Return normal text
      return part;
    }).reduce((acc, part, index) => {
      if (index === 0) return [part];
      return [...acc, ' ', part];
    }, [] as any[]);
  };

  useEffect(() => {
    initializeBattle();
  }, [result]);

  const initializeBattle = async () => {
    // Get initial health values
    const firstRound = result.rounds[0];
    const playerMaxHP = result.attacker.id === playerCharacter.id ?
      firstRound.attackerHealthBefore : firstRound.defenderHealthBefore;
    const enemyMaxHP = result.defender.id === enemy.id ?
      firstRound.defenderHealthBefore : firstRound.attackerHealthBefore;

    setMaxPlayerHealth(playerMaxHP);
    setMaxEnemyHealth(enemyMaxHP);
    setPlayerHealth(playerMaxHP);
    setEnemyHealth(enemyMaxHP);

    // Reset animations
    playerHealthAnim.setValue(1);
    enemyHealthAnim.setValue(1);
    combatLogOpacity.setValue(0);
    battleStartAnim.setValue(0);

    // Add initial battle start message
    setCombatLog([{
      text: `${playerCharacter.name} (${playerCharacter.class.name}) vs ${enemy.name} (${enemy.class.name}) - Battle begins!`,
      type: 'info'
    }]);

    // Battle start animation
    Animated.sequence([
      Animated.timing(battleStartAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(combatLogOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      playBattle();
    });
  };

  const playBattle = async () => {
    for (let i = 0; i < result.rounds.length; i++) {
      const round = result.rounds[i];
      await playRound(round, i + 1);
    }

    // Battle complete
    setTimeout(() => {
      onBattleComplete(result);
    }, 1000);
  };

  const playRound = async (round: CombatRound, roundNumber: number) => {
    setCurrentRound(roundNumber);

    // Determine log entry type based on round action
    let logType: 'attack' | 'critical' | 'dodge' | 'miss' | 'info' = 'attack';
    if (round.action === 'critical') {
      logType = 'critical';
    } else if (round.action === 'dodge') {
      logType = 'dodge';
    } else if (round.action === 'miss') {
      logType = 'miss';
    }

    // Add to combat log with type
    setCombatLog(prev => [...prev, { text: round.description, type: logType }]);

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const isPlayerAttacking = round.attacker.id === playerCharacter.id;

    // Animate attack
    await animateAttack(isPlayerAttacking, round.damage, round.isCritical, round.isDodged);

    // Update health
    const playerNewHealth = round.attacker.id === playerCharacter.id ?
      round.attackerHealthAfter : round.defenderHealthAfter;
    const enemyNewHealth = round.defender.id === enemy.id ?
      round.defenderHealthAfter : round.attackerHealthAfter;

    setPlayerHealth(playerNewHealth);
    setEnemyHealth(enemyNewHealth);

    // Animate health bars
    animateHealthChange(true, Math.max(0, playerNewHealth / maxPlayerHealth));
    animateHealthChange(false, Math.max(0, enemyNewHealth / maxEnemyHealth));

    // Wait before next round
    await new Promise(resolve => setTimeout(resolve, 1200));
  };

  const animateAttack = (isPlayerAttacking: boolean, damage: number, isCritical: boolean, isDodged: boolean): Promise<void> => {
    return new Promise((resolve) => {
      const attackerShake = isPlayerAttacking ? playerShake : enemyShake;
      const defenderShake = isPlayerAttacking ? enemyShake : playerShake;

      // Show damage text
      if (!isDodged) {
        setCurrentDamageText({
          text: damage > 0 ? `-${damage}` : 'MISS',
          isPlayer: !isPlayerAttacking,
          isCritical,
          position: Math.random() * 0.3 + 0.35 // Random position between 35-65%
        });

        // Animate damage text
        damageTextAnim.setValue(0);
        Animated.sequence([
          Animated.timing(damageTextAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(700),
          Animated.timing(damageTextAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => setCurrentDamageText(null));
      }

      // Attack animation sequence
      Animated.sequence([
        // Attacker moves forward
        Animated.timing(attackerShake, {
          toValue: isPlayerAttacking ? 15 : -15,
          duration: 150,
          useNativeDriver: true,
        }),
        // Strike
        Animated.timing(attackerShake, {
          toValue: isPlayerAttacking ? 8 : -8,
          duration: 100,
          useNativeDriver: true,
        }),
        // Return to position
        Animated.timing(attackerShake, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();

      // Defender hit reaction (if not dodged)
      if (!isDodged && damage > 0) {
        setTimeout(() => {
          Animated.sequence([
            Animated.timing(defenderShake, {
              toValue: isPlayerAttacking ? -20 : 20,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(defenderShake, {
              toValue: isPlayerAttacking ? 10 : -10,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(defenderShake, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            })
          ]).start();
        }, 250);
      }

      setTimeout(resolve, 600);
    });
  };

  const animateHealthChange = (isPlayer: boolean, newHealthPercentage: number) => {
    const healthAnim = isPlayer ? playerHealthAnim : enemyHealthAnim;
    Animated.timing(healthAnim, {
      toValue: newHealthPercentage,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const renderCharacterAvatar = (char: Character, isPlayer: boolean, shakeAnim: Animated.Value) => {
    return (
      <Animated.View
        style={[
          styles.characterContainer,
          {
            transform: [{ translateX: shakeAnim }],
            opacity: battleStartAnim
          }
        ]}
      >
        <Animated.View
          style={[
            styles.characterAvatar,
            {
              backgroundColor: isPlayer ? '#4CAF50' : '#F44336',
              transform: [{ scaleX: isPlayer ? 1 : -1 }]
            }
          ]}
        >
          <Text style={[styles.characterEmoji, { transform: [{ scaleX: isPlayer ? 1 : -1 }] }]}>
            {isPlayer ? 'P' : 'E'}
          </Text>
        </Animated.View>
        <Text style={styles.characterName}>{char.name}</Text>
        <Text style={styles.characterLevel}>Level {char.level}</Text>
        <Text style={styles.characterClass}>{char.class.name}</Text>
      </Animated.View>
    );
  };

  const renderHealthBar = (current: number, max: number, isPlayer: boolean, animValue: Animated.Value) => {
    return (
      <Animated.View style={[styles.healthBarContainer, { opacity: battleStartAnim }]}>
        <View style={styles.healthBarBackground}>
          <Animated.View
            style={[
              styles.healthBarFill,
              {
                backgroundColor: isPlayer ? '#4CAF50' : '#F44336',
                width: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>
        <Text style={styles.healthText}>
          {Math.max(0, Math.round(current))} / {Math.round(max)}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Battle Arena */}
      <View style={styles.arena}>
        <View style={styles.fightersRow}>
          {/* Player */}
          <View style={styles.fighterSection}>
            {renderCharacterAvatar(playerCharacter, true, playerShake)}
            {renderHealthBar(playerHealth, maxPlayerHealth, true, playerHealthAnim)}
          </View>

          {/* VS Section */}
          <Animated.View style={[styles.vsContainer, { opacity: battleStartAnim }]}>
            <Text style={styles.vsText}>VS</Text>
            <Text style={styles.roundText}>Round {currentRound}</Text>
            <View style={styles.battleIndicator}>
              <Text style={styles.battleIndicatorText}>VS</Text>
            </View>
          </Animated.View>

          {/* Enemy */}
          <View style={styles.fighterSection}>
            {renderCharacterAvatar(enemy, false, enemyShake)}
            {renderHealthBar(enemyHealth, maxEnemyHealth, false, enemyHealthAnim)}
          </View>
        </View>

        {/* Damage Text Overlay */}
        {currentDamageText && (
          <Animated.View
            style={[
              styles.damageTextContainer,
              {
                left: `${(currentDamageText.position * 100)}%`,
                opacity: damageTextAnim,
                transform: [{
                  translateY: damageTextAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -40]
                  })
                }, {
                  scale: damageTextAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.2, 1]
                  })
                }]
              }
            ]}
          >
            <Text style={[
              styles.damageText,
              {
                color: currentDamageText.isCritical ? '#FFD700' : '#FF6B6B',
                fontSize: currentDamageText.isCritical ? 28 : 20,
                textShadowColor: '#000',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3
              }
            ]}>
              {currentDamageText.text}
              {currentDamageText.isCritical && ' CRIT!'}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Combat Log */}
      <Animated.View style={[styles.combatLogContainer, { opacity: combatLogOpacity }]}>
        <Text style={styles.combatLogTitle}>Battle Log</Text>
        <ScrollView
          ref={scrollViewRef}
          style={styles.combatLog}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.combatLogContent}
        >
          {combatLog.map((log, index) => {
            const getLogColor = () => {
              switch (log.type) {
                case 'critical': return '#FFD700'; // Gold for crits
                case 'dodge': return '#00BFFF'; // Light blue for dodges
                case 'miss': return '#888'; // Gray for misses
                case 'attack': return '#FF6B6B'; // Red for normal attacks
                case 'info': return '#8b949e'; // Default gray for info
                default: return '#8b949e';
              }
            };

            const getLogIcon = () => {
              switch (log.type) {
                case 'critical': return '[CRIT] ';
                case 'dodge': return '[DODGE] ';
                case 'miss': return '[MISS] ';
                case 'attack': return '[ATK] ';
                case 'info': return '[INFO] ';
                default: return '• ';
              }
            };

            return (
              <Text key={index} style={[styles.combatLogText, { color: getLogColor() }]}>
                <Text style={{ color: getLogColor() }}>{getLogIcon()}</Text>
                {renderColoredLogText(log.text, log.type)}
              </Text>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arena: {
    backgroundColor: '#0d1117',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#21262d',
    minHeight: 320,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fightersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },
  fighterSection: {
    flex: 1,
    alignItems: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  characterAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: '#21262d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  characterEmoji: {
    fontSize: 36,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f0f6fc',
    marginBottom: 4,
    textAlign: 'center',
  },
  characterLevel: {
    fontSize: 14,
    color: '#79c0ff',
    marginBottom: 2,
  },
  characterClass: {
    fontSize: 12,
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  roundText: {
    fontSize: 16,
    color: '#8b949e',
    marginBottom: 12,
  },
  battleIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#21262d',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  battleIndicatorText: {
    fontSize: 18,
  },
  healthBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  healthBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#21262d',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  healthText: {
    fontSize: 14,
    color: '#8b949e',
    fontWeight: '600',
  },
  damageTextContainer: {
    position: 'absolute',
    top: 120,
    alignItems: 'center',
  },
  damageText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  combatLogContainer: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  combatLogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f0f6fc',
    marginBottom: 12,
  },
  combatLog: {
    minHeight: 120,
    maxHeight: 120,
  },
  combatLogContent: {
    paddingBottom: 10,
  },
  combatLogText: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default BattleViewer; 