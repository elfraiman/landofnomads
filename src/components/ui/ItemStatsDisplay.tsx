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



export const ItemStatsDisplay: React.FC<ItemStatsDisplayProps> = ({
  item,
  showSlotInfo = true,
  compact = false
}) => {
  const rarityColor = ColorUtils.getRarityColor(item.rarity);

  // Combine all stat bonuses into individual items with color info
  const statBonuses = Object.entries(item.statBonus || {})
    .filter(([_, bonus]) => bonus !== 0)
    .map(([stat, bonus]) => {
      const statName = {
        strength: 'Strength',
        dexterity: 'Dexterity',
        constitution: 'Constitution',
        intelligence: 'Intelligence',
        speed: 'Speed'
      }[stat] || stat;
      const text = bonus > 0 ? `+${bonus} ${statName}` : `${bonus} ${statName}`;
      return { text, isNegative: bonus < 0 };
    });

  return (
    <View style={[
      styles.container,
      {
        borderColor: rarityColor,
        shadowColor: rarityColor,
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 6,
      }
    ]}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Header with Name, Level, and Rarity */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={[styles.itemName, { color: rarityColor }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.itemLevel}>Lvl {item.level}</Text>
              {showSlotInfo && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.slotText}>
                    {getSlotText(item)}
                  </Text>
                </>
              )}
              <Text style={styles.separator}>•</Text>
              <Text style={[styles.rarityText, { color: rarityColor }]}>
                {item.rarity.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{item.price.toLocaleString()}</Text>
            <Text style={styles.priceLabel}>gold</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {/* Combat Stats */}
          <View style={styles.combatStats}>
            {item.damage && (
              <Text style={[styles.statText, { color: Colors.weapon }]}>
                {item.damage} Damage
              </Text>
            )}
            {item.armor && (
              <Text style={[styles.statText, { color: Colors.armor }]}>
                {item.armor} Armor
              </Text>
            )}
            {item.weaponSpeed && (
              <Text style={[styles.statText, { color: item.weaponSpeed < 0 ? Colors.error : Colors.lightning }]}>
                {item.weaponSpeed} Speed
              </Text>
            )}
            {item.criticalChance && (
              <Text style={[styles.statText, { color: Colors.criticalDamage }]}>
                {item.criticalChance}% Critical
              </Text>
            )}
            {item.dodgeChance && (
              <Text style={[styles.statText, { color: Colors.dodge }]}>
                {item.dodgeChance}% Dodge
              </Text>
            )}
            {item.blockChance && (
              <Text style={[styles.statText, { color: Colors.block }]}>
                {item.blockChance}% Block
              </Text>
            )}
          </View>

          {/* Stat Bonuses */}
          {statBonuses.length > 0 && (
            <View style={styles.bonusContainer}>
              {statBonuses.map((bonus, index) => (
                <Text 
                  key={index} 
                  style={[
                    styles.bonusText, 
                    { color: bonus.isNegative ? Colors.error : Colors.success }
                  ]}
                >
                  {bonus.text}
                  {index < statBonuses.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Footer with Durability */}
        <View style={styles.footer}>
          <View style={styles.durabilityContainer}>
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
            <Text style={styles.durabilityText}>
              {item.durability}/{item.maxDurability}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleSection: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    ...RPGTextStyles.h3,
    marginBottom: 2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLevel: {
    ...RPGTextStyles.label,
    color: Colors.textSecondary,
  },
  separator: {
    ...RPGTextStyles.caption,
    color: Colors.textMuted,
    marginHorizontal: 4,
  },
  slotText: {
    ...RPGTextStyles.label,
    color: Colors.textSecondary,
  },
  rarityText: {
    ...RPGTextStyles.label,
    fontWeight: '700',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    ...RPGTextStyles.stat,
    color: Colors.gold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  priceLabel: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
  },
  statsSection: {
    marginVertical: 6,

  },
  combatStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 3,
  
  },
  statText: {
    ...RPGTextStyles.body,
    fontWeight: '700',
  },
  bonusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  bonusText: {
    ...RPGTextStyles.bodySmall,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  durabilityContainer: {
    flex: 1,
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
    overflow: 'hidden',
  },
  durabilityFill: {
    height: '100%',
    borderRadius: 1,
  },
  durabilityText: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    minWidth: 45,
  },
}); 