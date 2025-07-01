import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Character, Item, ItemRarity } from '../../types';
import { useGame } from '../../context/GameContext';
import { generateShopInventory, getWeaponsByBuildType } from '../../data/items';
import { useCustomAlert } from '../ui/CustomAlert';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';
import { Colors, ColorUtils, RPGTextStyles } from '../../utils/colors';

interface ShopTabProps {
  character: Character;
}

interface ShopState {
  inventory: Item[];
  lastRefresh: number;
  refreshCost: number;
  selectedCategory: 'all' | 'weapons' | 'armor' | 'accessories';
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 items per row with margins

const ShopTab: React.FC<ShopTabProps> = ({ character }) => {
  const { purchaseItem, saveGame } = useGame();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [shopState, setShopState] = useState<ShopState>({
    inventory: [],
    lastRefresh: 0,
    refreshCost: 50,
    selectedCategory: 'all'
  });

  // Initialize shop inventory
  useEffect(() => {
    refreshShop(true); // Free first refresh
  }, []);

  const refreshShop = (isFree: boolean = false) => {
    if (!isFree && character.gold < shopState.refreshCost) {
      showAlert('Insufficient Gold', `The merchant requires ${shopState.refreshCost} gold to restock the shop.`);
      return;
    }

    // Deduct refresh cost if not free
    if (!isFree) {
      // Update character gold through the game context
      const updatedCharacter = { ...character, gold: character.gold - shopState.refreshCost };
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

  const handlePurchase = (item: Item) => {
    const success = purchaseItem(item);
    if (success) {
      // Remove item from shop inventory
      setShopState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(shopItem => shopItem.id !== item.id)
      }));
      showAlert('Purchase Successful!', `${item.name} has been added to your inventory!`);
    } else {
      showAlert('Insufficient Gold', `You need ${item.price} gold to purchase this item.`);
    }
  };

  const getFilteredInventory = () => {
    if (shopState.selectedCategory === 'all') {
      return shopState.inventory;
    }
    
    switch (shopState.selectedCategory) {
      case 'weapons':
        return shopState.inventory.filter(item => item.type === 'weapon' || item.type === 'shield');
      case 'armor':
        return shopState.inventory.filter(item => 
          item.type === 'armor' || item.type === 'helmet' || item.type === 'boots'
        );
      case 'accessories':
        return shopState.inventory.filter(item => item.type === 'accessory');
      default:
        return shopState.inventory;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'all': return 'Shop';
      case 'weapons': return 'Weapons';
      case 'armor': return 'Armor';
      case 'accessories': return 'Accessories';
      default: return 'Items';
    }
  };

  const getItemIcon = (item: Item) => {
    switch (item.type) {
      case 'weapon': return 'Weapon';
      case 'shield': return 'Shield';
      case 'armor': return 'Armor';
      case 'helmet': return 'Helmet';
      case 'boots': return 'Boots';
      case 'accessory': return 'Accessory';
      case 'gem': return 'Gem';
      default: return 'Item';
    }
  };

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'weapons', name: 'Weapons' },
    { id: 'armor', name: 'Armor' },
    { id: 'accessories', name: 'Accessories' },
  ];

  const filteredInventory = getFilteredInventory();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Merchant Header */}
      <View style={styles.merchantHeader}>
        <View style={styles.merchantAvatar}>
          <Text style={styles.merchantInitial}>E</Text>
        </View>
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName}>Eldric's Emporium</Text>
          <Text style={styles.merchantQuote}>"Quality gear for brave adventurers!"</Text>
        </View>
        <View style={styles.goldDisplay}>
          <Text style={styles.goldLabel}>Gold:</Text>
          <Text style={styles.goldAmount}>{character.gold}</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                shopState.selectedCategory === category.id && styles.categoryTabActive
              ]}
              onPress={() => setShopState(prev => ({ ...prev, selectedCategory: category.id as any }))}
            >
              <Text style={[
                styles.categoryText,
                shopState.selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Shop Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.refreshButton,
            character.gold < shopState.refreshCost && styles.refreshButtonDisabled
          ]}
          onPress={() => refreshShop(false)}
          disabled={character.gold < shopState.refreshCost}
        >
          <Text style={styles.refreshText}>
            Restock ({shopState.refreshCost} Gold)
          </Text>
        </TouchableOpacity>
        
        <View style={styles.itemCounter}>
          <Text style={styles.itemCountText}>
            {filteredInventory.length} items in stock
          </Text>
        </View>
      </View>

      {/* Shop Inventory */}
      <View style={styles.inventoryGrid}>
        {filteredInventory.length === 0 ? (
          <View style={styles.emptyShop}>
            <Text style={styles.emptyTitle}>No Items Available</Text>
            <Text style={styles.emptySubtitle}>
              The merchant is out of stock in this category.
            </Text>
            <TouchableOpacity
              style={styles.restockSuggestion}
              onPress={() => refreshShop(false)}
            >
              <Text style={styles.restockText}>Ask for Restock</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemsContainer}>
            {filteredInventory.map((item, index) => (
              <View key={item.id} style={styles.itemCard}>
                {/* Item Header */}
                <View style={styles.itemHeader}>
                  <Text style={styles.itemType}>{getItemIcon(item)}</Text>
                  <View style={styles.rarityBadge}>
                    <View style={[
                      styles.rarityIndicator, 
                      { backgroundColor: ColorUtils.getRarityColor(item.rarity) }
                    ]} />
                  </View>
                </View>

                {/* Item Info */}
                <Text style={[styles.itemName, { color: ColorUtils.getRarityColor(item.rarity) }]} numberOfLines={2}>
                  {item.name}
                </Text>
                
                <Text style={styles.itemLevel}>Level {item.level}</Text>
                
                {/* Item Stats Preview */}
                <View style={styles.statsPreview}>
                  {item.damage && (
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>DMG</Text>
                      <Text style={styles.statValue}>{item.damage}</Text>
                    </View>
                  )}
                  {item.armor && (
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>ARM</Text>
                      <Text style={styles.statValue}>{item.armor}</Text>
                    </View>
                  )}
                  {Object.entries(item.statBonus).slice(0, 2).map(([stat, value]) => (
                    value && value !== 0 && (
                      <View key={stat} style={styles.statItem}>
                        <Text style={styles.statLabel}>{stat.slice(0, 3).toUpperCase()}</Text>
                        <Text style={[styles.statValue, value > 0 ? styles.statPositive : styles.statNegative]}>
                          {value > 0 ? '+' : ''}{value}
                        </Text>
                      </View>
                    )
                  ))}
                </View>

                {/* Purchase Section */}
                <View style={styles.purchaseSection}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Price:</Text>
                    <Text style={styles.priceAmount}>{item.price}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      character.gold < item.price && styles.buyButtonDisabled
                    ]}
                    onPress={() => handlePurchase(item)}
                    disabled={character.gold < item.price}
                  >
                    <Text style={[
                      styles.buyButtonText,
                      character.gold < item.price && styles.buyButtonTextDisabled
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

      {/* Merchant Footer */}
      <View style={styles.merchantFooter}>
        <Text style={styles.footerText}>
          Higher levels unlock better gear • Refresh cost increases with each use
        </Text>
      </View>

      <AlertComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  merchantAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.gold,
  },
  merchantInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.background,
  },
  merchantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  merchantName: {
    ...RPGTextStyles.h2,
    color: Colors.primary,
    marginBottom: 4,
  },
  merchantQuote: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  goldDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  goldLabel: {
    fontSize: 16,
    marginRight: 4,
  },
  goldAmount: {
    ...RPGTextStyles.stat,
    color: Colors.background,
    fontWeight: 'bold',
  },
  categoryContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.overlay,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    ...RPGTextStyles.label,
    color: Colors.text,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.background,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.overlay,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  refreshButtonDisabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.border,
  },
  refreshText: {
    ...RPGTextStyles.label,
    color: Colors.background,
    fontWeight: 'bold',
  },
  itemCounter: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemCountText: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  inventoryGrid: {
    flex: 1,
    padding: 16,
  },
  emptyShop: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    ...RPGTextStyles.h3,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...RPGTextStyles.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  restockSuggestion: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  restockText: {
    ...RPGTextStyles.label,
    color: Colors.background,
    fontWeight: 'bold',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemType: {
    fontSize: 24,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  itemName: {
    ...RPGTextStyles.body,
    fontWeight: 'bold',
    marginBottom: 4,
    minHeight: 32,
  },
  itemLevel: {
    ...RPGTextStyles.caption,
    color: Colors.info,
    marginBottom: 8,
  },
  statsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statItem: {
    backgroundColor: Colors.overlay,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: 'bold',
  },
  statPositive: {
    color: Colors.success,
  },
  statNegative: {
    color: Colors.error,
  },
  purchaseSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  priceAmount: {
    ...RPGTextStyles.stat,
    color: Colors.gold,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  buyButtonDisabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.border,
  },
  buyButtonText: {
    ...RPGTextStyles.label,
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  buyButtonTextDisabled: {
    color: Colors.textMuted,
  },
  merchantFooter: {
    backgroundColor: Colors.overlay,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ShopTab; 