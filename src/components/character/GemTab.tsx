import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useGame } from '../../context/GameContext';
import Text from '../ui/DefaultText';
import { RPGText } from '../ui/RPGText';
import { Colors, ColorUtils } from '../../utils/colors';
import { gemBaseData, gemTierData, canFuseGems, getNextTier, calculateGemPrice } from '../../data/gems';
import { Gem, GemType, GemTier } from '../../types/index';
import { GemInventory } from './gems/GemInventory';
import { GemFusionLab } from './gems/GemFusionLab';
import { useCustomAlert } from '../ui/CustomAlert';

const { width } = Dimensions.get('window');

export const GemTab: React.FC = () => {
  const {
    gameState,
    fuseGems,
    getActiveGemEffects,
    addNotification
  } = useGame();

  const { showAlert, AlertComponent } = useCustomAlert();

  const [viewMode, setViewMode] = useState<'inventory' | 'effects' | 'guide' | 'fusion'>('inventory');

  const handlePerformFusion = async (gemType: GemType, currentTier: GemTier, gemsToFuse: Gem[]): Promise<{ success: boolean; result?: Gem; failureChance: number }> => {
    const gemIds = gemsToFuse.map(gem => gem.id);
    
    // Import the fusion function to get the failure chance
    const { fuseGems: fuseGemsUtil, gemTierData, getNextTier } = require('../../data/gems');
    const nextTier = getNextTier(currentTier);
    const failureChance = nextTier ? gemTierData[nextTier].fusionFailureChance : 0;
    
    // Perform the fusion
    const fusionResult = fuseGemsUtil(gemsToFuse);
    
    // Update the game state
    const success = fuseGems(gemIds);
    
    return {
      success: fusionResult.success && success,
      result: fusionResult.result,
      failureChance
    };
  };

  if (!gameState.currentCharacter) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No character selected</Text>
        </View>
      </View>
    );
  }

  const character = gameState.currentCharacter;
  const gems = character.inventory.filter(item => item.type === 'gem') as Gem[];
  const activeEffects = getActiveGemEffects();

  // Group gems by type and tier for better organization
  const groupedGems = gems.reduce((groups, gem) => {
    const key = `${gem.gemType}_${gem.gemTier}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(gem);
    return groups;
  }, {} as Record<string, Gem[]>);



  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'inventory', label: 'Inventory', color: Colors.primary },
        { key: 'effects', label: 'Active Effects', color: Colors.accent },
        { key: 'fusion', label: 'Fusion Lab', color: Colors.epic },
        { key: 'guide', label: 'Guide', color: Colors.textSecondary }
      ].map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            viewMode === tab.key && styles.activeTab
          ]}
          onPress={() => setViewMode(tab.key as any)}
        >
          <Text style={[
            styles.tabText,
            viewMode === tab.key && styles.activeTabText,
            { color: viewMode === tab.key ? tab.color : Colors.textSecondary }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEffectsView = () => {
    const character = gameState.currentCharacter;
    const activeGemEffects = character?.activeGemEffects || [];

    return (
      <ScrollView style={styles.container}>
        {activeGemEffects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active effects</Text>
            <Text style={styles.emptySubtext}>
              Break gems to release their power and gain temporary stat boosts!
            </Text>
          </View>
        ) : (
          <View style={styles.effectsList}>
            <Text style={styles.sectionTitle}>
              Active Gem Effects ({activeGemEffects.length})
            </Text>
            {activeGemEffects.map((effect, index) => {
              const gemData = gemBaseData[effect.gemType];
              const tierData = gemTierData[effect.gemTier];
              const remainingBattles = effect.battlesRemaining;
              const isExpiring = remainingBattles <= 5;
              
              return (
                <View key={index} style={[
                  styles.effectCard,
                  { borderLeftColor: gemData.color, borderLeftWidth: 4 }
                ]}>
                  {/* Header */}
                  <View style={styles.effectHeader}>
                    <View style={styles.effectTitle}>
                      <Text style={[styles.gemName, { color: gemData.color }]}>
                        {effect.gemName}
                      </Text>
                      <Text style={[styles.gemTier, { color: ColorUtils.getRarityColor(tierData.rarity) }]}>
                        {tierData.name}
                      </Text>
                    </View>
                    <View style={[
                      styles.battlesRemaining,
                      { backgroundColor: isExpiring ? Colors.error : Colors.primary }
                    ]}>
                      <Text style={styles.battlesText}>
                        {remainingBattles}
                      </Text>
                      <Text style={styles.battlesLabel}>
                        battles
                      </Text>
                    </View>
                  </View>

                  {/* Effect Description */}
                  <Text style={styles.effectDescription}>
                    {effect.description}
                  </Text>

                  {/* Stat Bonuses */}
                  <View style={styles.bonusesContainer}>
                    {Object.entries(effect.statBonus).map(([stat, bonus]) => (
                      bonus !== 0 && (
                        <View key={stat} style={styles.bonusItem}>
                          <Text style={styles.bonusLabel}>
                            {stat.charAt(0).toUpperCase() + stat.slice(1)}
                          </Text>
                          <Text style={[
                            styles.bonusValue,
                            { color: bonus > 0 ? Colors.success : Colors.error }
                          ]}>
                            {bonus > 0 ? '+' : ''}{bonus}
                          </Text>
                        </View>
                      )
                    ))}
                    
                    {/* Experience Bonus */}
                    {effect.experienceBonus && (
                      <View style={styles.bonusItem}>
                        <Text style={styles.bonusLabel}>Experience</Text>
                        <Text style={[styles.bonusValue, { color: Colors.accent }]}>
                          +{effect.experienceBonus}%
                        </Text>
                      </View>
                    )}
                    
                    {/* Gold Bonus */}
                    {effect.goldBonus && (
                      <View style={styles.bonusItem}>
                        <Text style={styles.bonusLabel}>Gold</Text>
                        <Text style={[styles.bonusValue, { color: Colors.gold }]}>
                          +{effect.goldBonus}%
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Duration Progress Bar */}
                  <View style={styles.durationContainer}>
                    <View style={styles.durationBar}>
                      <View
                        style={[
                          styles.durationFill,
                          {
                            width: `${(remainingBattles / tierData.duration) * 100}%`,
                            backgroundColor: isExpiring ? Colors.error : Colors.primary
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.durationText}>
                      {remainingBattles} / {tierData.duration} battles remaining
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderGuideView = () => (
    <ScrollView style={styles.container}>
      <View style={styles.guideSection}>
        <Text style={styles.sectionTitle}>Gem Guide</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tip}>
            <Text style={styles.tipBold}>Break</Text> gems to release their power and gain stat boosts
          </Text>
          <Text style={styles.tip}>
            <Text style={styles.tipBold}>Fuse</Text> identical gems to create more powerful versions
          </Text>
          <Text style={styles.tip}>
            Higher tier gems provide stronger effects for longer durations
          </Text>
        </View>
      </View>

      <View style={styles.guideSection}>
        <Text style={styles.sectionTitle}>Gem Types</Text>
        <View style={styles.gemTypesList}>
          {Object.entries(gemBaseData).map(([type, data]) => (
            <View key={type} style={styles.gemTypeItem}>
              <Text style={[styles.gemTypeName, { color: data.color }]}>
                {data.name}
              </Text>
              <Text style={styles.gemTypeDescription}>
                {data.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <>
      <View style={styles.container}>
        {renderTabBar()}

        {viewMode === 'inventory' && (
          <GemInventory
            gems={gems}
            groupedGems={groupedGems}
          />
        )}

        {viewMode === 'effects' && renderEffectsView()}

        {viewMode === 'fusion' && (
          <GemFusionLab
            gems={gems}
            onPerformFusion={handlePerformFusion}
          />
        )}

        {viewMode === 'guide' && renderGuideView()}
      </View>
      <AlertComponent />
    </>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  tabBar: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  activeTab: {
    backgroundColor: Colors.surfaceElevated,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },

  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold' as const,
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

  effectsList: {
    padding: 16,
  },

  effectCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

     effectHeader: {
     flexDirection: 'row' as const,
     alignItems: 'center' as const,
     justifyContent: 'space-between' as const,
     marginBottom: 8,
   },

   effectTitle: {
     flexDirection: 'row' as const,
     alignItems: 'center' as const,
     flex: 1,
   },

  gemName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginRight: 8,
  },

  gemTier: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

     battlesRemaining: {
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 6,
     alignItems: 'center' as const,
   },

   battlesText: {
     fontSize: 16,
     color: Colors.background,
     fontWeight: 'bold' as const,
   },

   battlesLabel: {
     fontSize: 10,
     color: Colors.background,
     opacity: 0.8,
   },

  effectDescription: {
    fontSize: 14,
    color: Colors.text,
  },

     bonusesContainer: {
     flexDirection: 'row' as const,
     flexWrap: 'wrap' as const,
     gap: 8,
     marginTop: 8,
     marginBottom: 8,
   },

   bonusItem: {
     backgroundColor: Colors.background,
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 4,
     borderWidth: 1,
     borderColor: Colors.border,
   },

   bonusLabel: {
     fontSize: 10,
     color: Colors.textSecondary,
     textTransform: 'uppercase' as const,
     fontWeight: '600' as const,
   },

   bonusValue: {
     fontSize: 14,
     fontWeight: 'bold' as const,
     marginTop: 2,
   },

  durationContainer: {
    marginTop: 8,
  },

  durationBar: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
    marginBottom: 4,
  },

     durationFill: {
     height: 12,
     borderRadius: 6,
   },

  durationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  guideSection: {
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 16,
  },

  tipsList: {
    gap: 12,
  },

  tip: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  tipBold: {
    fontWeight: 'bold' as const,
    color: Colors.text,
  },

  gemTypesList: {
    gap: 12,
  },

  gemTypeItem: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
  },

  gemTypeName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },

  gemTypeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
}; 