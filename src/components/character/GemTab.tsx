import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useGame } from '../../context/GameContext';
import Text from '../ui/DefaultText';
import { RPGText } from '../ui/RPGText';
import { Colors, ColorUtils } from '../../utils/colors';
import { gemBaseData, gemTierData, canFuseGems, getNextTier } from '../../data/gems';
import { Gem, GemType, GemTier } from '../../types/index';

const { width } = Dimensions.get('window');

export const GemTab: React.FC = () => {
  const { 
    gameState, 
    consumeGem, 
    fuseGems, 
    getActiveGemEffects,
    addNotification
  } = useGame();
  
  const [viewMode, setViewMode] = useState<'inventory' | 'effects' | 'guide' | 'fusion'>('inventory');
  const [fusionMode, setFusionMode] = useState<{
    active: boolean;
    gemType?: GemType;
    gemTier?: GemTier;
    availableGems?: Gem[];
  }>({
    active: false
  });
  
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

  // Removed gem selection - now using direct fusion from gem stacks

  const handleConsumeGem = (gemId: string) => {
    const gem = gems.find(g => g.id === gemId);
    if (!gem) return;

    Alert.alert(
      '💎 Consume Gem',
      `Consume ${gem.name}?\n\n✨ Effect: ${gem.consumeEffect.description}\n⚔️ Duration: ${gem.consumeEffect.duration} battles\n\n⚠️ This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Consume', 
          style: 'destructive',
          onPress: () => {
            consumeGem(gemId);
          }
        }
      ]
    );
  };

  const startFusion = (gemType: GemType, gemTier: GemTier) => {
    const availableGems = gems.filter(gem => 
      gem.gemType === gemType && gem.gemTier === gemTier
    );

    const nextTier = getNextTier(gemTier);
    if (!nextTier) {
      Alert.alert('❌ Error', 'These gems are already at maximum tier (Legendary)');
      return;
    }

    const requiredCount = gemTierData[gemTier].fusionCost;
    if (availableGems.length < requiredCount) {
      Alert.alert('❌ Error', `Need ${requiredCount} gems of same type and tier to fuse`);
      return;
    }

    setFusionMode({
      active: true,
      gemType,
      gemTier,
      availableGems
    });
    setViewMode('fusion');
  };

  const performFusion = () => {
    if (!fusionMode.gemType || !fusionMode.gemTier || !fusionMode.availableGems) return;

    const requiredCount = gemTierData[fusionMode.gemTier].fusionCost;
    
    if (fusionMode.availableGems.length < requiredCount) {
      Alert.alert('❌ Error', 'Not enough gems available for this fusion');
      return;
    }

    // Select the required number of gems for fusion (always just 1 fusion)
    const gemsToFuse = fusionMode.availableGems.slice(0, requiredCount);
    const gemIds = gemsToFuse.map(gem => gem.id);

    // Perform single fusion
    if (fuseGems(gemIds)) {
      const nextTier = getNextTier(fusionMode.gemTier);
      const nextTierName = gemTierData[nextTier!].name || nextTier;
      const gemName = gemBaseData[fusionMode.gemType].name;
      
      // Update available gems after fusion
      const remainingGems = fusionMode.availableGems.slice(requiredCount);
      
      // If we still have enough gems for another fusion, stay in fusion mode
      if (remainingGems.length >= requiredCount) {
        setFusionMode({
          ...fusionMode,
          availableGems: remainingGems
        });
      } else {
        // Not enough gems left, exit fusion mode
        setFusionMode({ active: false });
        setViewMode('inventory');
      }
      
      addNotification({
        type: 'success',
        title: '✨ Fusion Complete!',
        message: `Created 1 ${nextTierName} ${gemName}! Used ${requiredCount} gems.`,
        duration: 2000
      });
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'inventory', label: 'Inventory', icon: '💎' },
        { key: 'effects', label: 'Active Effects', icon: '✨' },
        { key: 'fusion', label: 'Fusion Lab', icon: '🔮' },
        { key: 'guide', label: 'Guide', icon: '📖' }
      ].map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            viewMode === tab.key && styles.activeTab
          ]}
          onPress={() => setViewMode(tab.key as any)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabText,
            viewMode === tab.key && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGemStack = (gemType: string, gemTier: string, gemsInStack: Gem[]) => {
    const gem = gemsInStack[0];
    const gemData = gemBaseData[gem.gemType as GemType];
    const tierData = gemTierData[gem.gemTier as GemTier];
    const count = gemsInStack.length;
    
    return (
      <TouchableOpacity
        key={`${gemType}_${gemTier}`}
        style={[
          styles.gemStack,
          { borderColor: ColorUtils.getRarityColor(gem.rarity) }
        ]}
        onPress={() => {
          // Gem stack press - could show details or do nothing
          console.log(`Pressed gem stack: ${gem.name} (${count} available)`);
        }}
      >
        <View style={styles.gemHeader}>
          <Text style={styles.gemEmoji}>{gemData.emoji}</Text>
          {count > 1 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          )}
        </View>
        
        <RPGText style={[
          styles.gemName,
          { color: ColorUtils.getRarityColor(gem.rarity) }
        ]}>
          {gem.name}
        </RPGText>
        
        <Text style={styles.gemLevel}>Level {gem.level}</Text>
        
        <View style={styles.gemEffect}>
          <Text style={styles.effectText}>{gem.consumeEffect.description}</Text>
        </View>
        
        <View style={styles.gemActions}>
          <TouchableOpacity
            style={styles.consumeButton}
            onPress={() => handleConsumeGem(gemsInStack[0].id)}
          >
            <Text style={styles.buttonText}>Consume</Text>
          </TouchableOpacity>
          
          {count >= gemTierData[gem.gemTier as GemTier].fusionCost && getNextTier(gem.gemTier as GemTier) && (
            <TouchableOpacity
              style={styles.fuseButton}
              onPress={() => {
                startFusion(gem.gemType as GemType, gem.gemTier as GemTier);
              }}
            >
              <Text style={styles.buttonText}>Fuse ({Math.floor(count / gemTierData[gem.gemTier as GemTier].fusionCost)}x)</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderInventoryView = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <RPGText style={styles.sectionTitle}>
          💎 Gem Inventory ({gems.length})
        </RPGText>
        
        {gems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No gems in inventory</Text>
            <Text style={styles.emptySubtext}>
              Defeat monsters to find rare gems!
            </Text>
          </View>
        ) : (
          <View style={styles.gemGrid}>
            {Object.entries(groupedGems).map(([key, gemsInStack]) => {
              const [gemType, gemTier] = key.split('_');
              return renderGemStack(gemType, gemTier, gemsInStack);
            })}
          </View>
        )}
      </View>


    </ScrollView>
  );

  const renderEffectsView = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <RPGText style={styles.sectionTitle}>
          ✨ Active Gem Effects
        </RPGText>
        
        {activeEffects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active effects</Text>
            <Text style={styles.emptySubtext}>
              Consume gems to gain temporary stat boosts!
            </Text>
          </View>
        ) : (
          <View style={styles.effectsList}>
            {activeEffects.map((effect, index) => (
              <View key={index} style={styles.effectItem}>
                <View style={styles.effectIcon}>
                  <Text style={styles.effectEmoji}>✨</Text>
                </View>
                <View style={styles.effectDetails}>
                  <Text style={styles.effectDescription}>{effect}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderGuideView = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <RPGText style={styles.sectionTitle}>📖 Gem Guide</RPGText>
        
        <View style={styles.guideSection}>
          <Text style={styles.guideTitle}>💎 Gem Types</Text>
          {Object.entries(gemBaseData).map(([type, data]) => (
            <View key={type} style={styles.guideItem}>
              <Text style={styles.guideEmoji}>{data.emoji}</Text>
              <View style={styles.guideText}>
                <Text style={styles.guideName}>{data.name}</Text>
                <Text style={styles.guideDescription}>{data.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.guideSection}>
          <Text style={styles.guideTitle}>⭐ Gem Tiers</Text>
          {Object.entries(gemTierData).map(([tier, data]) => (
            <View key={tier} style={styles.tierItem}>
              <View style={styles.tierHeader}>
                <Text style={[
                  styles.tierName,
                  { color: ColorUtils.getRarityColor(data.rarity) }
                ]}>
                  {data.name || 'Normal'} {tier}
                </Text>
                <Text style={styles.tierMultiplier}>
                  {data.multiplier}x power
                </Text>
              </View>
              <Text style={styles.tierDescription}>
                Duration: {data.duration} battles • Fusion: {data.fusionCost} gems
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.guideSection}>
          <Text style={styles.guideTitle}>🔮 How to Use Gems</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>
              💡 <Text style={styles.tipBold}>Consume</Text> gems for temporary stat boosts
            </Text>
            <Text style={styles.tip}>
              🔄 <Text style={styles.tipBold}>Fuse</Text> 2+ gems of same type/tier for upgrades
            </Text>
            <Text style={styles.tip}>
              ⚔️ Effects last for multiple battles - use strategically!
            </Text>
            <Text style={styles.tip}>
              📈 Higher tier gems = stronger effects + longer duration
            </Text>
            <Text style={styles.tip}>
              🎯 Match gems to your build: Ruby (STR), Sapphire (CON), etc.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderFusionView = () => {
    if (!fusionMode.active || !fusionMode.gemType || !fusionMode.gemTier || !fusionMode.availableGems) {
      return (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <RPGText style={styles.sectionTitle}>🔮 Fusion Lab</RPGText>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No fusion in progress</Text>
              <Text style={styles.emptySubtext}>
                Go to Inventory and tap "Fuse" on a gem stack to start!
              </Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    const gemData = gemBaseData[fusionMode.gemType];
    const tierData = gemTierData[fusionMode.gemTier];
    const nextTier = getNextTier(fusionMode.gemTier);
    const nextTierData = nextTier ? gemTierData[nextTier] : null;
    const requiredCount = tierData.fusionCost;
    const canFuse = fusionMode.availableGems.length >= requiredCount;

    return (
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <RPGText style={styles.sectionTitle}>🔮 Fusion Lab</RPGText>
          
          {/* Current Gem Display */}
          <View style={styles.fusionContainer}>
            <View style={styles.fusionHeader}>
              <Text style={styles.fusionTitle}>Fusing {gemData.name}s</Text>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setFusionMode({ active: false });
                  setViewMode('inventory');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Visual Fusion Display */}
            <View style={styles.fusionVisual}>
              {/* Input Gems */}
              <View style={styles.fusionSection}>
                <Text style={styles.fusionSectionTitle}>Input</Text>
                <View style={styles.fusionGems}>
                  {Array.from({ length: requiredCount }, (_, i) => (
                    <View key={i} style={[styles.fusionGem, styles.inputGem]}>
                      <Text style={styles.fusionGemEmoji}>{gemData.emoji}</Text>
                      <Text style={styles.fusionGemTier}>{tierData.name || 'Normal'}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.fusionCount}>
                  {requiredCount} gems needed
                </Text>
              </View>

              {/* Arrow */}
              <View style={styles.fusionArrow}>
                <Text style={styles.arrowText}>→</Text>
                <Text style={styles.arrowLabel}>FUSE</Text>
              </View>

              {/* Output Gems */}
              <View style={styles.fusionSection}>
                <Text style={styles.fusionSectionTitle}>Output</Text>
                <View style={styles.fusionGems}>
                  {nextTierData && (
                    <View style={[styles.fusionGem, styles.outputGem]}>
                      <Text style={styles.fusionGemEmoji}>{gemData.emoji}</Text>
                      <Text style={styles.fusionGemTier}>{nextTierData.name || 'Normal'}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.fusionCount}>
                  1 {nextTierData?.name || 'Unknown'} gem
                </Text>
              </View>
            </View>

            {/* Fusion Summary */}
            <View style={styles.fusionSummary}>
              <Text style={styles.summaryText}>
                💎 Available: {fusionMode.availableGems.length} {tierData.name || 'Normal'} {gemData.name}s
              </Text>
              <Text style={styles.summaryText}>
                ✨ Will create: 1 {nextTierData?.name || 'Normal'} {gemData.name}
              </Text>
              <Text style={styles.summaryText}>
                📦 Will remain: {fusionMode.availableGems.length - requiredCount} gems
              </Text>
            </View>

            {/* Fusion Button */}
            <TouchableOpacity
              style={[
                styles.performFusionButton,
                !canFuse && styles.disabledButton
              ]}
              onPress={performFusion}
              disabled={!canFuse}
            >
              <Text style={[
                styles.performFusionButtonText,
                !canFuse && styles.disabledButtonText
              ]}>
                🔮 Perform Fusion
              </Text>
            </TouchableOpacity>

            {!canFuse && (
              <Text style={styles.errorText}>
                Need {requiredCount} gems to fuse, but only have {fusionMode.availableGems.length}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderTabBar()}
      
      {viewMode === 'inventory' && renderInventoryView()}
      {viewMode === 'effects' && renderEffectsView()}
      {viewMode === 'fusion' && renderFusionView()}
      {viewMode === 'guide' && renderGuideView()}
    </View>
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
  
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold' as const,
  },
  
  content: {
    flex: 1,
  },
  
  section: {
    padding: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 16,
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
  
  gemGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    marginHorizontal: -4,
  },
  
  gemStack: {
    width: (width - 48) / 2,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    margin: 4,
    minHeight: 180,
  },
  
  gemHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  
  gemEmoji: {
    fontSize: 32,
  },
  
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center' as const,
  },
  
  countText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: Colors.background,
  },
  
  gemName: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  
  gemLevel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  
  gemEffect: {
    flex: 1,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  
  effectText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    lineHeight: 16,
  },
  
  gemActions: {
    gap: 6,
  },
  
  consumeButton: {
    backgroundColor: Colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center' as const,
  },
  
  fuseButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center' as const,
  },
  
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: Colors.background,
  },
  
  fusionPanel: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  
  fusionHeader: {
    marginBottom: 12,
  },
  
  fusionTitle: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold' as const,
  },
  
  fusionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  
  fusionActions: {
    gap: 8,
  },
  
  fusionButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  
  fusionButtonText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.background,
  },
  
  clearButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  
  clearButtonText: {
    fontSize: 12,
    color: Colors.text,
  },
  
  effectsList: {
    gap: 12,
  },
  
  effectItem: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  
  effectIcon: {
    marginRight: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  effectEmoji: {
    fontSize: 20,
  },
  
  effectDetails: {
    flex: 1,
  },
  
  effectDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  
  guideSection: {
    marginBottom: 24,
  },
  
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 12,
  },
  
  guideItem: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center' as const,
  },
  
  guideEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  
  guideText: {
    flex: 1,
  },
  
  guideName: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  
  guideDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  
  tierItem: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  tierHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  
  tierName: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    textTransform: 'capitalize' as const,
  },
  
  tierMultiplier: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: 'bold' as const,
  },
  
  tierDescription: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  
  tipsList: {
    gap: 8,
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

  // Fusion Lab Styles
  fusionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.accent,
  },

  cancelButton: {
    backgroundColor: Colors.error,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  cancelButtonText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: Colors.background,
  },

  fusionVisual: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginVertical: 20,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  fusionSection: {
    flex: 1,
    alignItems: 'center' as const,
  },

  fusionSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 8,
  },

  fusionGems: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },

  fusionGem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
  },

  inputGem: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
  },

  outputGem: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.accent,
  },

  fusionGemEmoji: {
    fontSize: 16,
  },

  fusionGemTier: {
    fontSize: 8,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  fusionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },

  fusionArrow: {
    alignItems: 'center' as const,
    marginHorizontal: 16,
  },

  arrowText: {
    fontSize: 24,
    color: Colors.accent,
    fontWeight: 'bold' as const,
  },

  arrowLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  fusionControls: {
    marginTop: 20,
  },

  controlsTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center' as const,
  },

  fusionOptions: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginBottom: 16,
  },

  fusionOption: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
  },

  selectedFusionOption: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },

  fusionOptionText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },

  selectedFusionOptionText: {
    color: Colors.background,
  },

  fusionOptionDetail: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  fusionSummary: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  summaryText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center' as const,
  },

  performFusionButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center' as const,
  },

  performFusionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.background,
  },

  disabledButton: {
    backgroundColor: Colors.secondary,
    opacity: 0.5,
  },

  disabledButtonText: {
    color: Colors.textMuted,
  },

  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center' as const,
    marginTop: 12,
    fontStyle: 'italic' as const,
  },
}; 