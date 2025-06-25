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

const getItemIcon = (item: Item) => {
  if (item.type === 'weapon') {
    if (item.handedness === 'two-handed') return '⚔️';
    return '🗡️';
  }
  if (item.type === 'armor') return '🛡️';
  if (item.type === 'boots') return '👢';
  if (item.type === 'accessory') return '💍';
  return '📦';
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
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 6,
      }
    ]}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: ColorUtils.withOpacity(rarityColor, 0.1) }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.itemIcon}>{getItemIcon(item)}</Text>
          <View style={styles.titleSection}>
            <Text style={[styles.itemName, { color: rarityColor }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.itemLevel}>Level {item.level}</Text>
              {showSlotInfo && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text style={[styles.slotText, { color: slotColor }]}>
                    {getSlotText(item)}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
          <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
        </View>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Primary Stats Row */}
        <View style={styles.primaryStatsRow}>
          {item.damage && (
            <View style={[styles.primaryStat, { backgroundColor: ColorUtils.withOpacity(Colors.weapon, 0.1) }]}>
              <Text style={[styles.primaryStatValue, { color: Colors.weapon }]}>{item.damage}</Text>
              <Text style={styles.primaryStatLabel}>Attack</Text>
            </View>
          )}

          {item.armor && (
            <View style={[styles.primaryStat, { backgroundColor: ColorUtils.withOpacity(Colors.armor, 0.1) }]}>
              <Text style={[styles.primaryStatValue, { color: Colors.armor }]}>{item.armor}</Text>
              <Text style={styles.primaryStatLabel}>Defense</Text>
            </View>
          )}

          {item.weaponSpeed && (
            <View style={[styles.primaryStat, { backgroundColor: ColorUtils.withOpacity(Colors.lightning, 0.1) }]}>
              <Text style={[styles.primaryStatValue, { color: Colors.lightning }]}>{item.weaponSpeed}</Text>
              <Text style={styles.primaryStatLabel}>Speed</Text>
            </View>
          )}
        </View>

        {/* Secondary Stats Row */}
        {(item.criticalChance || item.dodgeChance) && (
          <View style={styles.secondaryStatsRow}>
            {item.criticalChance && (
              <View style={styles.secondaryStat}>
                <Text style={styles.secondaryStatLabel}>Critical Chance</Text>
                <Text style={[styles.secondaryStatValue, { color: Colors.criticalDamage }]}>
                  {item.criticalChance}%
                </Text>
              </View>
            )}

            {item.dodgeChance && (
              <View style={styles.secondaryStat}>
                <Text style={styles.secondaryStatLabel}>Dodge Chance</Text>
                <Text style={[styles.secondaryStatValue, { color: Colors.dodge }]}>
                  {item.dodgeChance}%
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Stat Bonuses */}
        {Object.entries(item.statBonus || {}).some(([_, bonus]) => bonus > 0) && (
          <View style={styles.bonusSection}>
            <Text style={styles.bonusSectionTitle}>Stat Bonuses</Text>
            <View style={styles.bonusGrid}>
              {Object.entries(item.statBonus).map(([stat, bonus]) => (
                bonus > 0 && (
                  <View key={stat} style={styles.bonusItem}>
                    <Text style={styles.bonusValue}>+{bonus}</Text>
                    <Text style={styles.bonusLabel}>
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </Text>
                  </View>
                )
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        {/* Durability Bar */}
        <View style={styles.durabilitySection}>
          <View style={styles.durabilityHeader}>
            <Text style={styles.durabilityLabel}>Durability</Text>
            <Text style={styles.durabilityValue}>
              {item.durability}/{item.maxDurability}
            </Text>
          </View>
          <View style={styles.durabilityBar}>
            <View
              style={[
                styles.durabilityFill,
                {
                  width: `${(item.durability / item.maxDurability) * 100}%`,
                  backgroundColor: item.durability > item.maxDurability * 0.7 ? Colors.success :
                    item.durability > item.maxDurability * 0.3 ? Colors.warning : Colors.error
                }
              ]}
            />
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Value</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>{item.price.toLocaleString()}</Text>
            <Text style={styles.goldIcon}>🪙</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    minWidth: 280,
    maxWidth: 320,
  },
  compact: {
    minWidth: 240,
    maxWidth: 280,
  },

  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  titleSection: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLevel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  separator: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 6,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rarityBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.background,
    letterSpacing: 0.5,
  },

  // Stats Grid
  statsGrid: {
    padding: 12,
  },
  primaryStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  primaryStat: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  primaryStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  secondaryStat: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  secondaryStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Bonus Section
  bonusSection: {
    marginBottom: 12,
  },
  bonusSectionTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  bonusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorUtils.withOpacity(Colors.success, 0.1),
    borderWidth: 1,
    borderColor: ColorUtils.withOpacity(Colors.success, 0.3),
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bonusValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.success,
    marginRight: 4,
  },
  bonusLabel: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },

  // Footer Section
  footer: {
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 12,
  },
  durabilitySection: {
    marginBottom: 10,
  },
  durabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  durabilityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  durabilityValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  durabilityBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  durabilityFill: {
    height: '100%',
    borderRadius: 2,
  },

  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gold,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  goldIcon: {
    fontSize: 14,
    marginLeft: 4,
  },
}); 