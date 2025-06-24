import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Character, Item, ItemRarity } from '../../types';
import { useGame } from '../../context/GameContext';
import { generateShopInventory, getWeaponsByBuildType, RARITY_WEIGHTS } from '../../data/items';
import { useCustomAlert } from '../ui/CustomAlert';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';
import { Colors, ColorUtils } from '../../utils/colors';

interface ShopTabProps {
  character: Character;
}

interface ShopState {
  inventory: Item[];
  lastRefresh: number;
  refreshCost: number;
  filter: 'all' | 'strength' | 'critical' | 'speed' | 'intelligence' | 'balanced' | 'tank' | 'ranged' | 'glass-cannon' | 'utility';
}

const ShopTab: React.FC<ShopTabProps> = ({ character }) => {
  const { addItemToInventory, saveGame } = useGame();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [shopState, setShopState] = useState<ShopState>({
    inventory: [],
    lastRefresh: 0,
    refreshCost: 50,
    filter: 'all'
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Initialize shop inventory
  useEffect(() => {
    refreshShop(true); // Free first refresh
  }, []);

  const refreshShop = (isFree: boolean = false) => {
    if (!isFree && character.gold < shopState.refreshCost) {
      showAlert('Insufficient Gold', `You need ${shopState.refreshCost} gold to refresh the shop.`);
      return;
    }

    // Deduct refresh cost if not free
    if (!isFree) {
      character.gold -= shopState.refreshCost;
    }

    // Generate new inventory based on character level
    const newInventory = generateShopInventory(character.level);

    setShopState(prev => ({
      ...prev,
      inventory: newInventory,
      lastRefresh: Date.now(),
      refreshCost: isFree ? prev.refreshCost : Math.min(prev.refreshCost + 25, 200) // Increase cost, cap at 200
    }));

    if (!isFree) {
      saveGame();
    }
  };

  const purchaseItem = (item: Item) => {
    if (character.gold < item.price) {
      showAlert('Insufficient Gold', `You need ${item.price} gold to purchase this item.`);
      return;
    }

    // Deduct gold and add to inventory
    character.gold -= item.price;
    addItemToInventory(item);

    // Remove item from shop inventory
    setShopState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(shopItem => shopItem.id !== item.id)
    }));

    showAlert('Purchase Successful!', `${item.name} added to your inventory!`);
    saveGame();
  };

  const getRarityColor = (rarity: ItemRarity): string => {
    return ColorUtils.getRarityColor(rarity);
  };

  const getRarityEmoji = (rarity: ItemRarity): string => {
    return '';
  };

  const getItemTypeEmoji = (type: string): string => {
    return '';
  };

  const getStatBonusText = (item: Item): string => {
    const bonuses: string[] = [];
    Object.entries(item.statBonus).forEach(([stat, value]) => {
      if (value && value !== 0) {
        const sign = value > 0 ? '+' : '';
        bonuses.push(`${sign}${value} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
      }
    });

    if (item.damage) bonuses.push(`${item.damage} DMG`);
    if (item.armor) bonuses.push(`${item.armor} ARM`);
    if (item.criticalChance) bonuses.push(`${item.criticalChance}% CRIT`);
    if (item.dodgeChance) bonuses.push(`${item.dodgeChance}% DODGE`);

    return bonuses.join(', ');
  };

  const getBuildTypeColor = (buildType: string): string => {
    return ColorUtils.getClassColor(buildType as any) || Colors.secondary;
  };

  const categories = [
    { id: 'all', name: 'All Items', emoji: '' },
    { id: 'strength', name: 'Strength', emoji: '' },
    { id: 'critical', name: 'Critical', emoji: '' },
    { id: 'speed', name: 'Speed', emoji: '' },
    { id: 'intelligence', name: 'Magic', emoji: '' },
    { id: 'balanced', name: 'Balanced', emoji: '' },
    { id: 'tank', name: 'Tank', emoji: '' },
    { id: 'ranged', name: 'Ranged', emoji: '' },
    { id: 'glass-cannon', name: 'Glass Cannon', emoji: '' },
    { id: 'utility', name: 'Utility', emoji: '' },
  ];

  const getFilteredInventory = () => {
    if (selectedCategory === 'all') {
      return shopState.inventory;
    }

    // Filter weapons by build type
    const buildWeapons = getWeaponsByBuildType(selectedCategory as any);
    const buildWeaponNames = buildWeapons.map(w => w.name);

    return shopState.inventory.filter(item =>
      item.type === 'weapon' ? buildWeaponNames.includes(item.name.replace(/ \+\d+$/, '')) : true
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Weapon & Gear Shop</Text>
          <View style={styles.goldContainer}>
            <Text style={styles.goldText}>Gold: {character.gold}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Discover weapons for every build and playstyle!
        </Text>

        {/* Shop Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.refreshButton, character.gold < shopState.refreshCost && styles.disabledButton]}
            onPress={() => refreshShop(false)}
            disabled={character.gold < shopState.refreshCost}
          >
            <Text style={styles.refreshButtonText}>
              Refresh ({shopState.refreshCost} Gold)
            </Text>
          </TouchableOpacity>

          <Text style={styles.itemCount}>
            {getFilteredInventory().length} items available
          </Text>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Build Categories:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category.id ? getBuildTypeColor(category.id) : Colors.surface,
                    borderColor: getBuildTypeColor(category.id)
                  }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? Colors.background : getBuildTypeColor(category.id) }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Shop Inventory */}
        <View style={styles.inventoryContainer}>
          {getFilteredInventory().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items available in this category.</Text>
              <Text style={styles.emptySubtext}>Try refreshing the shop or check another category!</Text>
            </View>
          ) : (
            <View style={styles.itemGrid}>
              {getFilteredInventory().map((item, index) => (
                <View key={item.id} style={styles.itemCard}>
                  <ItemStatsDisplay
                    item={item}
                    showSlotInfo={true}
                  />

                  {/* Item Description */}
                  <Text style={styles.itemDescription}>{item.description}</Text>

                  {/* Price and Purchase */}
                  <View style={styles.itemFooter}>
                    <TouchableOpacity
                      style={[
                        styles.purchaseButton,
                        character.gold < item.price && styles.disabledPurchaseButton
                      ]}
                      onPress={() => purchaseItem(item)}
                      disabled={character.gold < item.price}
                    >
                      <Text style={[
                        styles.purchaseButtonText,
                        character.gold < item.price && styles.disabledPurchaseText
                      ]}>
                        {character.gold >= item.price ? 'Buy' : 'Too Expensive'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Shop Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Shop Information</Text>
          <Text style={styles.infoText}>
            • Items are generated based on your level{'\n'}
            • Higher levels unlock better gear{'\n'}
            • Refresh cost increases with each use{'\n'}
            • Different build types focus on different stats{'\n'}
            • Legendary items are extremely rare!
          </Text>
        </View>
      </View>

      {/* Custom Alert Component */}
      <AlertComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  goldContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  goldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gold,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  refreshButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  itemCount: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: Colors.background,
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inventoryContainer: {
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  itemGrid: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: Colors.text,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemLevel: {
    fontSize: 12,
    color: Colors.info,
    marginBottom: 6,
    fontWeight: '600',
  },
  itemStats: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  purchaseButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.error,
    shadowColor: Colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  disabledPurchaseButton: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  purchaseButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  disabledPurchaseText: {
    color: Colors.textMuted,
  },
  infoBox: {
    backgroundColor: Colors.overlay,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default ShopTab; 