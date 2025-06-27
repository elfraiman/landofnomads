import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions, Animated, Easing } from 'react-native';
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
  const [fusionMode, setFusionMode] = useState<{
    active: boolean;
    gemType?: GemType;
    gemTier?: GemTier;
    availableGems?: Gem[];
  }>({
    active: false
  });

  // Animation refs at component level
  const sourceGemsAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(1)).current;
  const resultGemAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Reset animations when fusion mode changes
  React.useEffect(() => {
    if (fusionMode.active) {
      sourceGemsAnim.setValue(1);
      arrowAnim.setValue(1);
      resultGemAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [fusionMode.active]);

  const runFusionAnimation = () => {
    Animated.sequence([
      // Fade out source gems
      Animated.timing(sourceGemsAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      // Pulse arrow
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Show result gem with glow
      Animated.parallel([
        Animated.timing(resultGemAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // After animation completes, perform the actual fusion
      performFusion();
    });
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

  const startFusion = (gemType: GemType, gemTier: GemTier) => {
    const availableGems = gems.filter(gem =>
      gem.gemType === gemType && gem.gemTier === gemTier
    );

    const nextTier = getNextTier(gemTier);
    if (!nextTier) {
      showAlert('Error', 'These gems are already at maximum tier (Legendary)');
      return;
    }

    const requiredCount = gemTierData[gemTier].fusionCost;
    if (availableGems.length < requiredCount) {
      showAlert('Error', `Need ${requiredCount} gems of same type and tier to fuse`);
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
      showAlert('Error', 'Not enough gems available for this fusion');
      return;
    }

    // Select the required number of gems for fusion (always just 1 fusion)
    const gemsToFuse = fusionMode.availableGems.slice(0, requiredCount);
    const gemIds = gemsToFuse.map(gem => gem.id);

    // Perform single fusion
    if (fuseGems(gemIds)) {
      // Update available gems after fusion
      const remainingGems = fusionMode.availableGems.slice(requiredCount);

      // If we still have enough gems for another fusion, stay in fusion mode and reset animations
      if (remainingGems.length >= requiredCount) {
        setFusionMode({
          ...fusionMode,
          availableGems: remainingGems
        });

        // Reset animations for next fusion
        sourceGemsAnim.setValue(1);
        arrowAnim.setValue(1);
        resultGemAnim.setValue(0);
        glowAnim.setValue(0);
      } else {
        // Not enough gems left, exit fusion mode
        setFusionMode({ active: false });
        setViewMode('inventory');
      }
    }
  };

  const handleCancelFusion = () => {
    setFusionMode({ active: false });
    setViewMode('inventory');
  };

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

  const renderEffectsView = () => (
    <ScrollView style={styles.container}>
      {activeEffects.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active effects</Text>
          <Text style={styles.emptySubtext}>
            Break gems to release their power and gain temporary stat boosts!
          </Text>
        </View>
      ) : (
        <View style={styles.effectsList}>
          {activeEffects.map((effect, index) => (
            <View key={index} style={styles.effectItem}>
              <Text style={styles.effectText}>{effect}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

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
            onStartFusion={startFusion}
          />
        )}

        {viewMode === 'effects' && renderEffectsView()}

        {viewMode === 'fusion' && (
          <GemFusionLab
            fusionMode={fusionMode}
            sourceGemsAnim={sourceGemsAnim}
            arrowAnim={arrowAnim}
            resultGemAnim={resultGemAnim}
            glowAnim={glowAnim}
            onRunFusionAnimation={runFusionAnimation}
            onCancelFusion={handleCancelFusion}
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

  effectItem: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  effectText: {
    fontSize: 14,
    color: Colors.text,
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