import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Text from '../../ui/DefaultText';
import { Colors } from '../../../utils/colors';
import { gemBaseData, gemTierData, getNextTier } from '../../../data/gems';
import { Gem, GemType, GemTier } from '../../../types/index';
import { useGame } from '../../../context/GameContext';
import { useCustomAlert } from '../../ui/CustomAlert';

interface GemStackProps {
  gemType: string;
  gemTier: string;
  gemsInStack: Gem[];
  onStartFusion: (gemType: GemType, gemTier: GemTier) => void;
}

export const GemStack: React.FC<GemStackProps> = ({
  gemType,
  gemTier,
  gemsInStack,
  onStartFusion
}) => {
  const { sellItem, addNotification, consumeGem } = useGame();
  const { showAlert, AlertComponent } = useCustomAlert();

  const gem = gemsInStack[0];
  const gemData = gemBaseData[gem.gemType as GemType];
  const tierData = gemTierData[gem.gemTier as GemTier];
  const count = gemsInStack.length;
  const canFuse = count >= tierData.fusionCost && getNextTier(gem.gemTier as GemTier);

  const handleBreakGem = (gemId: string) => {
    showAlert(
      'Break Gem',
      `Break ${gem.name} to release its power?\n\nEffect: ${gem.consumeEffect.description}\nDuration: ${gem.consumeEffect.duration} battles\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Break',
          style: 'destructive',
          onPress: () => {
            consumeGem(gemId);
          }
        }
      ]
    );
  };

  const handleSellGem = (gemId: string, gemName: string, price: number) => {
    showAlert(
      'Sell Gem',
      `Sell ${gemName} for ${price} gold?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sell',
          style: 'destructive',
          onPress: () => {
            sellItem(gemId);
            addNotification({
              type: 'success',
              title: 'Gem Sold',
              message: `Sold ${gemName} for ${price} gold!`,
              duration: 2000
            });
          }
        }
      ]
    );
  };

  return (
    <>
      <View
        style={[
          styles.gemStack,
          { borderColor: gemData.color }
        ]}
      >
        <View style={styles.gemMainInfo}>
          <View style={styles.gemTitleRow}>
            <Text style={[styles.gemName, { color: gemData.color }]}>
              {gem.name}
            </Text>
            {count > 1 && (
              <View style={[styles.countBadge, { backgroundColor: gemData.color }]}>
                <Text style={styles.countText}>×{count}</Text>
              </View>
            )}
          </View>

          <Text style={styles.gemCompactEffect}>
            {gem.consumeEffect.description} • {gem.consumeEffect.duration} battles • {tierData.multiplier}x
          </Text>
        </View>

        <View style={styles.gemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonCompact, { backgroundColor: Colors.surface }]}
            onPress={() => handleSellGem(gem.id, gem.name, gem.price)}
          >
            <Text style={[styles.actionButtonText, { color: Colors.gold }]}>
              {gem.price}g
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonCompact, { backgroundColor: Colors.surface }]}
            onPress={() => handleBreakGem(gem.id)}
          >
            <Text style={[styles.actionButtonText, { color: gemData.color }]}>Break</Text>
          </TouchableOpacity>

          {canFuse && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.actionButtonCompact,
                { backgroundColor: Colors.surface }
              ]}
              onPress={() => onStartFusion(gem.gemType as GemType, gem.gemTier as GemTier)}
            >
              <Text style={[styles.actionButtonText, { color: gemData.color }]}>
                Fuse ({count}/{tierData.fusionCost})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <AlertComponent />
    </>
  );
};

const styles = {
  gemStack: {
    width: '48%' as any,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },

  gemMainInfo: {
    flex: 1,
  },

  gemTitleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },

  gemName: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    flex: 1,
  },

  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },

  countText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },

  gemCompactEffect: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },

  gemActions: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    gap: 4,
  },

  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  actionButtonCompact: {
    minWidth: 50,
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
}; 