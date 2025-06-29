import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../../ui/DefaultText';
import { Colors, ColorUtils } from '../../../utils/colors';
import { gemBaseData, gemTierData, getNextTier, calculateGemPrice } from '../../../data/gems';
import { Gem, GemType, GemTier } from '../../../types/index';
import { FusionAnimationModal } from './FusionAnimationModal';

interface FusionRecipe {
  gemType: GemType;
  currentTier: GemTier;
  nextTier: GemTier;
  availableGems: Gem[];
  requiredCount: number;
  possibleFusions: number;
}

interface GemFusionLabProps {
  gems: Gem[];
  onPerformFusion: (gemType: GemType, currentTier: GemTier, gemsToFuse: Gem[]) => Promise<{ success: boolean; result?: Gem; failureChance: number }>;
}

export const GemFusionLab: React.FC<GemFusionLabProps> = ({
  gems,
  onPerformFusion
}) => {
  const [fusionModal, setFusionModal] = useState<{
    visible: boolean;
    gemType?: GemType;
    currentTier?: GemTier;
    nextTier?: GemTier;
    inputGems?: Gem[];
    resultGem?: Gem;
    fusionSuccess?: boolean;
    failureChance?: number;
  }>({ visible: false });

  // Calculate available fusion recipes
  const calculateFusionRecipes = (): FusionRecipe[] => {
    const recipes: FusionRecipe[] = [];
    
    // Group gems by type and tier
    const groupedGems = gems.reduce((acc, gem) => {
      const key = `${gem.gemType}_${gem.gemTier}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(gem);
      return acc;
    }, {} as Record<string, Gem[]>);

    // Check each group for fusion possibilities
    Object.entries(groupedGems).forEach(([key, gemsOfType]) => {
      const [gemType, gemTier] = key.split('_') as [GemType, GemTier];
      const nextTier = getNextTier(gemTier);
      
      if (nextTier) {
        const requiredCount = gemTierData[gemTier].fusionCost;
        const possibleFusions = Math.floor(gemsOfType.length / requiredCount);
        
        if (possibleFusions > 0) {
          recipes.push({
            gemType,
            currentTier: gemTier,
            nextTier,
            availableGems: gemsOfType,
            requiredCount,
            possibleFusions
          });
        }
      }
    });

    // Sort by gem type and tier
    return recipes.sort((a, b) => {
      if (a.gemType !== b.gemType) {
        return a.gemType.localeCompare(b.gemType);
      }
      const tierOrder = ['flawed', 'normal', 'greater', 'perfect'];
      return tierOrder.indexOf(a.currentTier) - tierOrder.indexOf(b.currentTier);
    });
  };

  const fusionRecipes = calculateFusionRecipes();

  const handleFusion = async (recipe: FusionRecipe) => {
    const gemsToFuse = recipe.availableGems.slice(0, recipe.requiredCount);
    
    // Perform the actual fusion first
    const fusionResult = await onPerformFusion(recipe.gemType, recipe.currentTier, gemsToFuse);
    
    // Create a mock result gem for the animation (even if fusion failed)
    const resultGem: Gem = {
      id: `fusion_result_${Date.now()}`,
      name: `${gemTierData[recipe.nextTier].name} ${gemBaseData[recipe.gemType].name}`,
      type: 'gem',
      gemType: recipe.gemType,
      gemTier: recipe.nextTier,
      rarity: gemTierData[recipe.nextTier].rarity,
      level: 1,
      price: calculateGemPrice(recipe.gemType, recipe.nextTier, 1),
      statBonus: {},
      durability: 1,
      maxDurability: 1,
      description: `${gemBaseData[recipe.gemType].description}`,
      consumeEffect: {
        statBonus: {},
        duration: gemTierData[recipe.nextTier].duration,
        description: `Power boost for ${gemTierData[recipe.nextTier].duration} battles`
      }
    } as Gem;

    // Show fusion animation modal with result
    setFusionModal({
      visible: true,
      gemType: recipe.gemType,
      currentTier: recipe.currentTier,
      nextTier: recipe.nextTier,
      inputGems: gemsToFuse,
      resultGem: fusionResult.success ? fusionResult.result || resultGem : resultGem,
      fusionSuccess: fusionResult.success,
      failureChance: fusionResult.failureChance
    });
  };

  const handleModalClose = () => {
    // Just close modal - fusion was already performed
    setFusionModal({ visible: false });
  };

  if (fusionRecipes.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Fusion Lab</Text>
          <Text style={styles.emptyText}>No fusion recipes available</Text>
          <Text style={styles.emptySubtext}>
            You need at least 2 gems of the same type and tier to create fusion recipes.
          </Text>
          
          <View style={styles.fusionGuide}>
            <Text style={styles.guideTitle}>Fusion Guide</Text>
            <View style={styles.guideItem}>
              <Text style={styles.guideRecipe}>2 Flawed → 1 Normal</Text>
              <Text style={styles.guideBonus}>2.4x power, 2.25x duration, 10% fail</Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideRecipe}>2 Normal → 1 Greater</Text>
              <Text style={styles.guideBonus}>2.5x power, 1.89x duration, 15% fail</Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideRecipe}>2 Greater → 1 Perfect</Text>
              <Text style={styles.guideBonus}>2.67x power, 2.12x duration, 20% fail</Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideRecipe}>2 Perfect → 1 Legendary</Text>
              <Text style={styles.guideBonus}>3x power, 1.67x duration, 25% fail</Text>
            </View>
            
            <Text style={styles.fusionWarning}>
              WARNING: Fusion can fail! Failed fusions destroy your gems permanently.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <>
    <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Available Fusion Recipes</Text>
          <Text style={styles.headerSubtitle}>
            {fusionRecipes.length} recipe{fusionRecipes.length !== 1 ? 's' : ''} available
        </Text>
      </View>

        <View style={styles.recipesList}>
          {fusionRecipes.map((recipe, index) => {
            const gemData = gemBaseData[recipe.gemType];
            const currentTierData = gemTierData[recipe.currentTier];
            const nextTierData = gemTierData[recipe.nextTier];
            const currentEffect = Math.floor(gemData.baseEffect.baseValue * currentTierData.multiplier * currentTierData.statMultiplier);
            const nextEffect = Math.floor(gemData.baseEffect.baseValue * nextTierData.multiplier * nextTierData.statMultiplier);
            const resultPrice = calculateGemPrice(recipe.gemType, recipe.nextTier, 1);

            return (
              <TouchableOpacity
                key={index}
                style={[styles.recipeCard, { borderLeftColor: gemData.color }]}
                onPress={() => handleFusion(recipe)}
              >
                {/* Recipe Header */}
                <View style={styles.recipeHeader}>
                  <View style={styles.recipeTitle}>
                    <Text style={[styles.gemTypeName, { color: gemData.color }]}>
                {gemData.name}
              </Text>
                    <Text style={styles.fusionArrow}>→</Text>
                    <Text style={[styles.resultTier, { color: ColorUtils.getRarityColor(nextTierData.rarity) }]}>
                      {nextTierData.name}
              </Text>
            </View>
                  <View style={styles.fusionCount}>
                    <Text style={styles.fusionCountText}>
                      {recipe.possibleFusions}x
            </Text>
                  </View>
      </View>

                {/* Recipe Details */}
                <View style={styles.recipeDetails}>
                  <View style={styles.inputSection}>
                    <Text style={styles.sectionLabel}>Input</Text>
                    <Text style={styles.inputText}>
                      {recipe.requiredCount}x {currentTierData.name} {gemData.name}
                    </Text>
                    <Text style={styles.inputStats}>
                      {gemData.baseEffect.statType === 'experienceBonus' ? `EXP +${currentEffect}%` :
                       gemData.baseEffect.statType === 'goldBonus' ? `GLD +${currentEffect}%` :
                       `${gemData.baseEffect.statType.toUpperCase()} +${currentEffect}`}
                      • {currentTierData.duration} battles
        </Text>
      </View>

                  <View style={styles.outputSection}>
                    <Text style={styles.sectionLabel}>Output</Text>
                    <Text style={styles.outputText}>
                      1x {nextTierData.name} {gemData.name}
                    </Text>
                    <Text style={styles.outputStats}>
                      {gemData.baseEffect.statType === 'experienceBonus' ? `EXP +${nextEffect}%` :
                       gemData.baseEffect.statType === 'goldBonus' ? `GLD +${nextEffect}%` :
                       `${gemData.baseEffect.statType.toUpperCase()} +${nextEffect}`}
                      • {nextTierData.duration} battles • {resultPrice}g
                    </Text>
                    <Text style={[styles.failureChance, { color: nextTierData.fusionFailureChance > 0.15 ? '#ff6b6b' : '#ffa500' }]}>
                      {(nextTierData.fusionFailureChance * 100).toFixed(0)}% failure chance
        </Text>
                  </View>
                </View>

                {/* Fusion Button */}
                <View style={styles.fusionButtonContainer}>
                  <Text style={[styles.fusionButtonText, { color: gemData.color }]}>
                    Fuse {recipe.requiredCount} → 1 ({recipe.availableGems.length} available)
                  </Text>
                </View>
      </TouchableOpacity>
            );
          })}
        </View>
    </ScrollView>

      {/* Fusion Animation Modal */}
      {fusionModal.visible && fusionModal.gemType && fusionModal.currentTier && fusionModal.nextTier && fusionModal.inputGems && fusionModal.resultGem && (
        <FusionAnimationModal
          visible={fusionModal.visible}
          gemType={fusionModal.gemType}
          currentTier={fusionModal.currentTier}
          nextTier={fusionModal.nextTier}
          inputGems={fusionModal.inputGems}
          resultGem={fusionModal.resultGem}
          fusionSuccess={fusionModal.fusionSuccess}
          failureChance={fusionModal.failureChance}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  emptyState: {
    padding: 20,
    alignItems: 'center' as const,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    marginBottom: 24,
  },

  fusionGuide: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    width: '100%' as const,
  },

  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },

  guideItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },

  guideRecipe: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },

  guideBonus: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  fusionWarning: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '500' as const,
    marginTop: 12,
    textAlign: 'center' as const,
  },

  header: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  recipesList: {
    padding: 16,
    gap: 12,
  },

  recipeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },

  recipeHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },

  recipeTitle: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },

  gemTypeName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },

  fusionArrow: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginHorizontal: 8,
  },

  resultTier: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },

  fusionCount: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  fusionCountText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },

  recipeDetails: {
    flexDirection: 'row' as const,
    gap: 16,
    marginBottom: 12,
  },

  inputSection: {
    flex: 1,
  },

  outputSection: {
    flex: 1,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },

  inputText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },

  inputStats: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  outputText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
    marginBottom: 2,
  },

  outputStats: {
    fontSize: 12,
    color: Colors.success,
  },

  failureChance: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 2,
  },

  fusionButtonContainer: {
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center' as const,
  },

  fusionButtonText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
}; 