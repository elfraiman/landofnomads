import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Item } from '../../types';
import { Colors, ColorUtils, RPGTextStyles } from '../../utils/colors';

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

const getItemTypeIcon = (item: Item) => {
  switch (item.type) {
    case 'weapon': return 'W';
    case 'armor': return 'A';
    case 'shield': return 'S';
    case 'helmet': return 'H';
    case 'boots': return 'B';
    case 'accessory': return 'R';
    case 'gem': return 'G';
    default: return '?';
  }
};

export const ItemStatsDisplay: React.FC<ItemStatsDisplayProps> = ({
  item,
  showSlotInfo = true,
  compact = false
}) => {
  const rarityColor = ColorUtils.getRarityColor(item.rarity);
  const itemIcon = getItemTypeIcon(item);

  // Get primary stats to display
  const primaryStats = [];
  if (item.damage) primaryStats.push({ label: 'Damage', value: item.damage, color: Colors.weapon });
  if (item.armor) primaryStats.push({ label: 'Defense', value: item.armor, color: Colors.armor });
  if (item.criticalChance) primaryStats.push({ label: 'Critical', value: `${item.criticalChance}%`, color: Colors.criticalDamage });
  if (item.blockChance) primaryStats.push({ label: 'Block', value: `${item.blockChance}%`, color: Colors.block });
  if (item.dodgeChance) primaryStats.push({ label: 'Dodge', value: `${item.dodgeChance}%`, color: Colors.dodge });

  // Get stat bonuses
  const statBonuses = Object.entries(item.statBonus || {})
    .filter(([_, bonus]) => bonus !== 0)
    .map(([stat, bonus]) => {
      const statName = {
        strength: 'Strength',
        dexterity: 'Dexterity',
        constitution: 'Health',
        intelligence: 'Intelligence',
        speed: 'Speed'
      }[stat] || stat;
      return { 
        label: statName, 
        value: bonus > 0 ? `+${bonus}` : `${bonus}`, 
        color: bonus < 0 ? Colors.error : Colors.success 
      };
    });

  const durabilityPercentage = (item.durability / item.maxDurability) * 100;
  const durabilityColor = durabilityPercentage > 70 ? Colors.success : 
                         durabilityPercentage > 30 ? Colors.warning : Colors.error;

  return (
    <View style={[
      styles.container,
      {
        borderColor: rarityColor,
        backgroundColor: Colors.surface,
      }
    ]}>

      {/* Center - Item Info */}
      <View style={styles.infoContainer}>
        {/* Item Name and Type */}
        <View style={styles.nameRow}>
          <Text style={[styles.itemName, { color: rarityColor }]} numberOfLines={1}>
            {item.name}<Text style={styles.itemType}> - {getSlotText(item)}</Text>
          </Text>
     
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Primary Combat Stats */}
          {primaryStats.map((stat, index) => (
            <View key={index} style={styles.statGroup}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}

          {/* Stat Bonuses */}
          {statBonuses.map((bonus, index) => (
            <View key={`bonus-${index}`} style={styles.statGroup}>
              <Text style={styles.statLabel}>{bonus.label}</Text>
              <Text style={[styles.statValue, { color: bonus.color }]}>{bonus.value}</Text>
            </View>
          ))}
        </View>
      </View>

        {/* Right - Price */}
       <View style={styles.priceContainer}>
         <Text style={styles.priceValue}>{item.price.toLocaleString()}</Text>
         <Text style={styles.priceLabel}>G</Text>
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    padding: 8,
    minHeight: 60,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  itemIcon: {
    ...RPGTextStyles.h2,
    fontWeight: '700',
  },
  levelText: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    position: 'absolute',
    bottom: -2,
    fontSize: 10,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemName: {
    ...RPGTextStyles.body,
    fontWeight: '700',
    flex: 1,
  },
  itemType: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statGroup: {
    alignItems: 'center',
  },
  statLabel: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  statValue: {
    ...RPGTextStyles.bodySmall,
    fontWeight: '700',
    marginTop: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  priceValue: {
    ...RPGTextStyles.body,
    color: Colors.gold,
    fontWeight: '700',
  },
     priceLabel: {
     ...RPGTextStyles.caption,
     color: Colors.textSecondary,
     fontWeight: '600',
   },
}); 