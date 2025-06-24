import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Item } from '../../types';
import { Colors, ColorUtils } from '../../utils/colors';

interface ItemStatsDisplayProps {
  item: Item;
  showSlotInfo?: boolean;
  compact?: boolean;
}

const getSlotText = (item: Item) => {
  if (item.type === 'weapon') {
    const handedness = item.handedness === 'two-handed' ? '2H' : '1H';
    return `${handedness} Weapon`;
  }
  return item.type.charAt(0).toUpperCase() + item.type.slice(1);
};

const getSlotColor = (item: Item) => {
  if (item.type === 'weapon') return Colors.weapon;
  if (item.type === 'armor') return Colors.armor;
  if (item.type === 'accessory') return Colors.accessory;
  return Colors.secondary;
};

export const ItemStatsDisplay: React.FC<ItemStatsDisplayProps> = ({
  item,
  showSlotInfo = true,
  compact = false
}) => {
  const rarityColor = ColorUtils.getRarityColor(item.rarity);
  const slotColor = getSlotColor(item);

  return (
    <View style={[
      styles.container,
      compact && styles.compact,
      {
        borderColor: rarityColor,
        shadowColor: rarityColor,
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 3,
      }
    ]}>
      {/* Header Row - Name, Level, Rarity, Slot */}
      <View style={styles.headerRow}>
        <View style={styles.nameSection}>
          <Text style={[styles.itemName, { color: rarityColor }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemLevel}>Lv.{item.level}</Text>
        </View>

        <View style={styles.badgeSection}>
          <View style={[styles.rarityBadge, { backgroundColor: ColorUtils.withOpacity(rarityColor, 0.15) }]}>
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {item.rarity.toUpperCase()}
            </Text>
          </View>

          {showSlotInfo && (
            <View style={[styles.slotBadge, { backgroundColor: ColorUtils.withOpacity(slotColor, 0.15) }]}>
              <Text style={[styles.slotText, { color: slotColor }]}>
                {getSlotText(item)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Stats Row */}
      <View style={styles.mainStatsRow}>
        {item.damage && (
          <View style={styles.mainStat}>
            <Text style={[styles.mainStatValue, { color: Colors.weapon }]}>{item.damage}</Text>
            <Text style={styles.mainStatLabel}>ATK</Text>
          </View>
        )}

        {item.armor && (
          <View style={styles.mainStat}>
            <Text style={[styles.mainStatValue, { color: Colors.armor }]}>{item.armor}</Text>
            <Text style={styles.mainStatLabel}>DEF</Text>
          </View>
        )}

        {item.weaponSpeed && (
          <View style={styles.mainStat}>
            <Text style={[styles.mainStatValue, { color: Colors.lightning }]}>{item.weaponSpeed}</Text>
            <Text style={styles.mainStatLabel}>SPD</Text>
          </View>
        )}

        {item.criticalChance && (
          <View style={styles.mainStat}>
            <Text style={[styles.mainStatValue, { color: Colors.criticalDamage }]}>{item.criticalChance}%</Text>
            <Text style={styles.mainStatLabel}>CRIT</Text>
          </View>
        )}

        {item.dodgeChance && (
          <View style={styles.mainStat}>
            <Text style={[styles.mainStatValue, { color: Colors.dodge }]}>{item.dodgeChance}%</Text>
            <Text style={styles.mainStatLabel}>DODGE</Text>
          </View>
        )}

        {/* Gold Value */}
        <View style={styles.goldStat}>
          <Text style={[styles.goldValue, { color: Colors.gold }]}>{item.price}</Text>
          <Text style={styles.goldLabel}>GOLD</Text>
        </View>
      </View>

      {/* Stat Bonuses Row (if any) */}
      {Object.entries(item.statBonus || {}).some(([_, bonus]) => bonus > 0) && (
        <View style={styles.bonusRow}>
          <Text style={styles.bonusLabel}>Bonuses:</Text>
          <View style={styles.bonusContainer}>
            {Object.entries(item.statBonus).map(([stat, bonus]) => (
              bonus > 0 && (
                <Text key={stat} style={styles.bonusText}>
                  +{bonus} {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </Text>
              )
            ))}
          </View>
        </View>
      )}

      {/* Durability Bar */}
      <View style={styles.durabilityRow}>
        <View style={styles.durabilityBar}>
          <View
            style={[
              styles.durabilityFill,
              {
                width: `${(item.durability / item.maxDurability) * 100}%`,
                backgroundColor: item.durability > item.maxDurability * 0.5 ? Colors.success :
                  item.durability > item.maxDurability * 0.25 ? Colors.warning : Colors.error
              }
            ]}
          />
        </View>
        <Text style={styles.durabilityText}>{item.durability}/{item.maxDurability}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    padding: 10,
    minWidth: 250,
  },
  compact: {
    padding: 8,
    minWidth: 200,
  },

  // Header Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameSection: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  itemLevel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  badgeSection: {
    flexDirection: 'row',
    gap: 6,
  },
  rarityBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  slotBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slotText: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Main Stats Row
  mainStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mainStat: {
    alignItems: 'center',
    minWidth: 35,
  },
  mainStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  mainStatLabel: {
    fontSize: 8,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  goldStat: {
    alignItems: 'center',
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  goldValue: {
    fontSize: 13,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  goldLabel: {
    fontSize: 8,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },

  // Bonus Row
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bonusLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginRight: 6,
  },
  bonusContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  bonusText: {
    fontSize: 9,
    color: Colors.success,
    fontWeight: '600',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },

  // Durability Row
  durabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durabilityBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.background,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durabilityFill: {
    height: '100%',
    borderRadius: 1,
  },
  durabilityText: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
}); 