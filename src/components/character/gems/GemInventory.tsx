import React from 'react';
import { View, ScrollView } from 'react-native';
import Text from '../../ui/DefaultText';
import { Colors } from '../../../utils/colors';
import { Gem, GemType, GemTier } from '../../../types/index';
import { GemStack } from './GemStack';

interface GemInventoryProps {
  gems: Gem[];
  groupedGems: Record<string, Gem[]>;
}

export const GemInventory: React.FC<GemInventoryProps> = ({
  gems,
  groupedGems
}) => {
  return (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        {gems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No gems in inventory</Text>
            <Text style={styles.emptySubtext}>
              Break gems to release their power and gain temporary stat boosts!
            </Text>
          </View>
        ) : (
          <View style={styles.gemGrid}>
            {Object.entries(groupedGems).map(([key, gemsInStack]) => {
              const [gemType, gemTier] = key.split('_');
              return (
                <GemStack
                  key={key}
                  gemType={gemType}
                  gemTier={gemTier}
                  gemsInStack={gemsInStack}
                />
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = {
  content: {
    flex: 1,
  },

  section: {
    padding: 16,
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
  },
}; 