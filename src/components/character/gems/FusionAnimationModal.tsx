import React, { useEffect, useRef } from 'react';
import { Modal, View, TouchableOpacity, Animated, Easing } from 'react-native';
import Text from '../../ui/DefaultText';
import { Colors, ColorUtils } from '../../../utils/colors';
import { gemBaseData, gemTierData, calculateGemPrice } from '../../../data/gems';
import { Gem, GemType, GemTier } from '../../../types/index';

interface FusionAnimationModalProps {
  visible: boolean;
  gemType: GemType;
  currentTier: GemTier;
  nextTier: GemTier;
  inputGems: Gem[];
  resultGem: Gem;
  fusionSuccess?: boolean;
  failureChance?: number;
  onClose: () => void;
}

export const FusionAnimationModal: React.FC<FusionAnimationModalProps> = ({
  visible,
  gemType,
  currentTier,
  nextTier,
  inputGems,
  resultGem,
  fusionSuccess = true,
  failureChance = 0,
  onClose
}) => {
  // Animation values
  const sourceGemsAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(1)).current;
  const resultGemAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset all animations
      sourceGemsAnim.setValue(1);
      arrowAnim.setValue(1);
      resultGemAnim.setValue(0);
      glowAnim.setValue(0);
      scaleAnim.setValue(0.8);
      sparkleAnim.setValue(0);

      if (fusionSuccess) {
        // SUCCESS ANIMATION: Normal fusion sequence
        Animated.sequence([
          // Phase 1: Source gems glow and shrink
          Animated.parallel([
            Animated.timing(sourceGemsAnim, {
              toValue: 0.3,
              duration: 800,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          
          // Phase 2: Arrow pulses and energy flows
          Animated.sequence([
            Animated.timing(arrowAnim, {
              toValue: 1.5,
              duration: 400,
              easing: Easing.out(Easing.back(1.5)),
              useNativeDriver: true,
            }),
            Animated.timing(arrowAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          
          // Phase 3: Result gem appears with dramatic effect
          Animated.parallel([
            Animated.timing(resultGemAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(glowAnim, {
                  toValue: 1,
                  duration: 600,
                  useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                  toValue: 0.3,
                  duration: 600,
                  useNativeDriver: true,
                }),
              ]),
              { iterations: 3 }
            ),
          ]),
        ]).start();
      } else {
        // FAILURE ANIMATION: Gems shake and explode
        Animated.sequence([
          // Phase 1: Source gems shake violently
          Animated.loop(
            Animated.sequence([
              Animated.timing(sparkleAnim, {
                toValue: 0.1,
                duration: 80,
                useNativeDriver: true,
              }),
              Animated.timing(sparkleAnim, {
                toValue: -0.1,
                duration: 80,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 6 }
          ),

          // Phase 2: Arrow turns red and shrinks
          Animated.timing(arrowAnim, {
            toValue: 0.5,
            duration: 500,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),

          // Phase 3: Gems explode/disappear with red flash
          Animated.parallel([
            Animated.timing(sourceGemsAnim, {
              toValue: 0,
              duration: 800,
              easing: Easing.bezier(0.55, 0.055, 0.675, 0.19),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]).start();
      }
    }
  }, [visible, fusionSuccess]);

  if (!visible) return null;

  const gemData = gemBaseData[gemType];
  const currentTierData = gemTierData[currentTier];
  const nextTierData = gemTierData[nextTier];
  const currentEffect = Math.floor(gemData.baseEffect.baseValue * currentTierData.multiplier * currentTierData.statMultiplier);
  const nextEffect = Math.floor(gemData.baseEffect.baseValue * nextTierData.multiplier * nextTierData.statMultiplier);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: fusionSuccess ? gemData.color : '#ff6b6b' }]}>
              {fusionSuccess ? 'Gem Fusion' : 'Fusion Failed!'}
            </Text>
            <Text style={styles.subtitle}>
              {gemData.name} • {currentTierData.name} {fusionSuccess ? '→' : 'X'} {fusionSuccess ? nextTierData.name : 'Destroyed'}
            </Text>
          </View>

          {/* Animation Container */}
          <View style={styles.animationContainer}>
            {/* Source Gems */}
            <View style={styles.sourceContainer}>
              {inputGems.map((gem, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.sourceGem,
                    {
                      borderColor: gemData.color,
                      opacity: sourceGemsAnim,
                      transform: [
                        { scale: sourceGemsAnim },
                        {
                          rotate: sparkleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={[styles.gemTierText, { color: gemData.color }]}>
                    {currentTierData.name}
                  </Text>
                  <Text style={[styles.gemNameText, { color: gemData.color }]}>
                    {gemData.name}
                  </Text>
                </Animated.View>
              ))}
            </View>

            {/* Arrow */}
            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  transform: [{ scale: arrowAnim }],
                },
              ]}
            >
              <Text style={[styles.arrow, { color: fusionSuccess ? gemData.color : '#ff6b6b' }]}>
                {fusionSuccess ? '→' : 'X'}
              </Text>
            </Animated.View>

            {/* Result Gem */}
            <View style={styles.resultContainer}>
              {fusionSuccess ? (
                <Animated.View
                  style={[
                    styles.resultGem,
                    {
                      borderColor: gemData.color,
                      opacity: resultGemAnim,
                      transform: [{ scale: scaleAnim }],
                      shadowColor: gemData.color,
                      shadowOpacity: glowAnim,
                      shadowRadius: 20,
                      elevation: 10,
                    },
                  ]}
                >
                  <Text style={[styles.resultTierText, { color: gemData.color }]}>
                    {nextTierData.name}
                  </Text>
                  <Text style={[styles.resultNameText, { color: gemData.color }]}>
                    {gemData.name}
                  </Text>
                  <View style={styles.resultStats}>
                    <Text style={styles.resultStatsText}>
                      {gemData.baseEffect.statType === 'experienceBonus' ? `EXP +${nextEffect}%` :
                       gemData.baseEffect.statType === 'goldBonus' ? `GLD +${nextEffect}%` :
                       `${gemData.baseEffect.statType.toUpperCase()} +${nextEffect}`}
                    </Text>
                    <Text style={styles.resultDuration}>
                      {nextTierData.duration} battles
                    </Text>
                    <Text style={styles.resultValue}>
                      {calculateGemPrice(gemType, nextTier, 1)}g
                    </Text>
                  </View>
                </Animated.View>
              ) : (
                <Animated.View
                  style={[
                    styles.failureResult,
                    {
                      opacity: glowAnim,
                      transform: [{ scale: scaleAnim }],
                      shadowColor: '#ff6b6b',
                      shadowOpacity: glowAnim,
                      shadowRadius: 15,
                      elevation: 8,
                    },
                  ]}
                >
                  <Text style={styles.failureIcon}>X</Text>
                  <Text style={styles.failureText}>DESTROYED</Text>
                  <Text style={styles.failureSubtext}>
                    All gems lost!
                  </Text>
                </Animated.View>
              )}
            </View>
          </View>

          {/* Fusion Summary */}
          <View style={styles.summaryContainer}>
            <Text style={[styles.summaryTitle, { color: fusionSuccess ? Colors.text : '#ff6b6b' }]}>
              {fusionSuccess ? 'Fusion Complete!' : 'Fusion Failed!'}
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Input:</Text>
              <Text style={styles.summaryValue}>
                {inputGems.length}x {currentTierData.name} {gemData.name}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Output:</Text>
              <Text style={[styles.summaryValue, { color: fusionSuccess ? gemData.color : '#ff6b6b' }]}>
                {fusionSuccess ? `1x ${nextTierData.name} ${gemData.name}` : 'Nothing - All gems destroyed!'}
              </Text>
            </View>
            {fusionSuccess ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Power:</Text>
                <Text style={styles.summaryValue}>
                  {currentEffect} → {nextEffect} ({Math.round(((nextEffect - currentEffect) / currentEffect) * 100)}% increase)
                </Text>
              </View>
            ) : (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Failure Chance:</Text>
                <Text style={[styles.summaryValue, { color: '#ff6b6b' }]}>
                  {(failureChance * 100).toFixed(0)}% (You were unlucky!)
                </Text>
              </View>
            )}
          </View>

          {/* Close Button */}
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: fusionSuccess ? gemData.color : '#ff6b6b' }]} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>
              {fusionSuccess ? 'Continue' : 'Accept Loss'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },

  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%' as const,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  header: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },

  animationContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 24,
    minHeight: 120,
  },

  sourceContainer: {
    flex: 1,
    alignItems: 'center' as const,
  },

  sourceGem: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center' as const,
    minWidth: 80,
  },

  gemTierText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    marginBottom: 2,
  },

  gemNameText: {
    fontSize: 10,
    textAlign: 'center' as const,
  },

  arrowContainer: {
    flex: 0.5,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  arrow: {
    fontSize: 32,
    fontWeight: 'bold' as const,
  },

  resultContainer: {
    flex: 1,
    alignItems: 'center' as const,
  },

  resultGem: {
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    minWidth: 100,
    shadowOffset: { width: 0, height: 0 },
  },

  resultTierText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },

  resultNameText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center' as const,
  },

  resultStats: {
    alignItems: 'center' as const,
  },

  resultStatsText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: 'bold' as const,
    marginBottom: 2,
  },

  resultDuration: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  resultValue: {
    fontSize: 10,
    color: Colors.gold,
    fontWeight: 'bold' as const,
  },

  summaryContainer: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 6,
  },

  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },

  summaryValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold' as const,
    textAlign: 'right' as const,
    flex: 1,
    marginLeft: 8,
  },

  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center' as const,
  },

  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },

  failureResult: {
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderColor: '#ff6b6b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    minWidth: 100,
    shadowOffset: { width: 0, height: 0 },
  },

  failureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  failureText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#ff6b6b',
    marginBottom: 4,
  },

  failureSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
}; 