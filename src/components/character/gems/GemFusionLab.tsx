import React, { useRef } from 'react';
import { View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import Text from '../../ui/DefaultText';
import { Colors } from '../../../utils/colors';
import { gemBaseData, gemTierData, getNextTier, calculateGemPrice } from '../../../data/gems';
import { Gem, GemType, GemTier } from '../../../types/index';

interface FusionMode {
  active: boolean;
  gemType?: GemType;
  gemTier?: GemTier;
  availableGems?: Gem[];
}

interface GemFusionLabProps {
  fusionMode: FusionMode;
  sourceGemsAnim: Animated.Value;
  arrowAnim: Animated.Value;
  resultGemAnim: Animated.Value;
  glowAnim: Animated.Value;
  onRunFusionAnimation: () => void;
  onCancelFusion: () => void;
}

export const GemFusionLab: React.FC<GemFusionLabProps> = ({
  fusionMode,
  sourceGemsAnim,
  arrowAnim,
  resultGemAnim,
  glowAnim,
  onRunFusionAnimation,
  onCancelFusion
}) => {
  if (!fusionMode.active || !fusionMode.gemType || !fusionMode.gemTier || !fusionMode.availableGems) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Fusion Lab</Text>
          <Text style={styles.emptySubtext}>
            Select gems of the same type and tier to begin fusion.{'\n'}
            Fusing gems creates a more powerful gem of the next tier!
          </Text>
          <View style={styles.fusionGuide}>
            <Text style={styles.fusionGuideTitle}>Fusion Guide:</Text>
            <Text style={styles.fusionGuideText}>
              • 2 Flawed → 1 Normal{'\n'}
              • 2 Normal → 1 Greater{'\n'}
              • 2 Greater → 1 Perfect{'\n'}
              • 2 Perfect → 1 Legendary
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const gemData = gemBaseData[fusionMode.gemType];
  const tierData = gemTierData[fusionMode.gemTier];
  const nextTier = getNextTier(fusionMode.gemTier);
  const nextTierData = nextTier ? gemTierData[nextTier] : null;
  const requiredCount = tierData.fusionCost;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.fusionInfo}>
        <Text style={[styles.fusionTitle, { color: gemData.color }]}>
          {gemData.name} Fusion
        </Text>
        <Text style={styles.fusionDescription}>
          {gemData.description}
        </Text>
      </View>

      <View style={styles.fusionContainer}>
        {/* Source Gems */}
        <Animated.View
          style={[
            styles.fusionSourceContainer,
            { opacity: sourceGemsAnim }
          ]}
        >
          {Array.from({ length: requiredCount }).map((_, index) => (
            <View
              key={`source_${index}`}
              style={[
                styles.fusionGem,
                { borderColor: gemData.color }
              ]}
            >
              <Text style={[styles.fusionGemText, { color: gemData.color }]}>
                {tierData.name || 'Normal'}
              </Text>
              <Text style={[styles.fusionGemName, { color: gemData.color }]}>
                {gemData.name}
              </Text>
              <Text style={styles.fusionGemStats}>
                Power: {tierData.multiplier}x{'\n'}
                Duration: {tierData.duration} battles
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Arrow */}
        <Animated.View
          style={[
            styles.fusionArrowContainer,
            {
              transform: [{ scale: arrowAnim }],
            }
          ]}
        >
          <Text style={[styles.fusionArrow, { color: gemData.color }]}>→</Text>
        </Animated.View>

        {/* Result Gem */}
        <Animated.View
          style={[
            styles.fusionResultContainer,
            {
              opacity: resultGemAnim,
            }
          ]}
        >
          <Animated.View
            style={[
              styles.fusionGem,
              styles.fusionResultGem,
              {
                borderColor: gemData.color,
                shadowColor: gemData.color,
                shadowOpacity: glowAnim,
              }
            ]}
          >
            <Text style={[styles.fusionGemText, { color: gemData.color }]}>
              {nextTierData?.name}
            </Text>
            <Text style={[styles.fusionGemName, { color: gemData.color }]}>
              {gemData.name}
            </Text>
            <Text style={styles.fusionGemStats}>
              Power: {nextTierData?.multiplier}x{'\n'}
              Duration: {nextTierData?.duration} battles{'\n'}
              Value: {calculateGemPrice(fusionMode.gemType, nextTier!, 1)} gold
            </Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.fusionStatsContainer}>
        <Text style={styles.fusionStatsTitle}>Fusion Details</Text>
        <Text style={styles.fusionStats}>
          • Required: {requiredCount}x {tierData.name || 'Normal'} {gemData.name}{'\n'}
          • Power Increase: {tierData.multiplier}x → {nextTierData?.multiplier}x{'\n'}
          • Duration Increase: {tierData.duration} → {nextTierData?.duration} battles{'\n'}
          • Effect: {gemData.baseEffect.statType} +{Math.floor(gemData.baseEffect.baseValue * tierData.multiplier)} → +{Math.floor(gemData.baseEffect.baseValue * (nextTierData?.multiplier || 0))}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.fusionButton,
          { backgroundColor: gemData.color }
        ]}
        onPress={onRunFusionAnimation}
      >
        <Text style={styles.fusionButtonText}>
          Fuse Gems ({fusionMode.availableGems.length} available)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancelFusion}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
  },

  fusionGuide: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },

  fusionGuideTitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: 'bold' as const,
  },

  fusionGuideText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  fusionInfo: {
    padding: 16,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    marginBottom: 16,
  },

  fusionTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },

  fusionDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 8,
  },

  fusionContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 16,
  },

  fusionSourceContainer: {
    flex: 2,
  },

  fusionArrowContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  fusionResultContainer: {
    flex: 2,
    alignItems: 'center' as const,
  },

  fusionGem: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center' as const,
  },

  fusionResultGem: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },

  fusionGemText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },

  fusionGemName: {
    fontSize: 14,
    marginBottom: 8,
  },

  fusionGemStats: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },

  fusionArrow: {
    fontSize: 32,
    fontWeight: 'bold' as const,
  },

  fusionStatsContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 16,
  },

  fusionStatsTitle: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: 'bold' as const,
  },

  fusionStats: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  fusionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginBottom: 8,
  },

  fusionButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },

  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },

  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
}; 