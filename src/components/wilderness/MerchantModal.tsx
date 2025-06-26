import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGame } from '../../context/GameContext';
import { getMerchantInventory } from '../../data/wilderness';
import { Item } from '../../types';
import { Colors, RPGTextStyles } from '../../utils/colors';
import { useCustomAlert } from '../ui/CustomAlert';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';

interface MerchantModalProps {
  visible: boolean;
  onClose: () => void;
  merchantName: string;
  merchantDescription: string;
  mapId: string;
  playerLevel: number;
}

interface MerchantState {
  inventory: Item[];
  lastRefresh: number;
}

const REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minutes in milliseconds

export const MerchantModal: React.FC<MerchantModalProps> = ({
  visible,
  onClose,
  merchantName,
  merchantDescription,
  mapId,
  playerLevel
}) => {
  const { currentCharacter, purchaseItem, saveGame } = useGame();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [merchantState, setMerchantState] = useState<MerchantState>({
    inventory: [],
    lastRefresh: 0
  });

  // Initialize merchant inventory when modal opens
  useEffect(() => {
    if (visible) {
      console.log('Modal opened, refreshing inventory...');
      refreshMerchantInventory();
    }
  }, [visible, mapId, playerLevel]);

  // Debug: Log merchant state changes
  useEffect(() => {
    console.log('Merchant state updated:', {
      inventoryCount: merchantState.inventory.length,
      lastRefresh: merchantState.lastRefresh,
      firstItem: merchantState.inventory[0]?.name || 'None'
    });
  }, [merchantState]);

    const refreshMerchantInventory = () => {
    const now = Date.now();

    // Check if we need to refresh (first time or 20 minutes passed)
    if (merchantState.lastRefresh === 0 || (now - merchantState.lastRefresh) >= REFRESH_INTERVAL) {
      try {
        // Get map-specific inventory
        const newInventory = getMerchantInventory(mapId, playerLevel);

        console.log('Merchant Debug:', {
          mapId,
          playerLevel,
          inventoryLength: newInventory.length,
          firstItem: newInventory.length > 0 ? { name: newInventory[0].name, price: newInventory[0].price } : 'None'
        });

        // Always create fallback inventory for testing
        const { generateItem, baseItems } = require('../../data/items');
        const testItems = ['Iron Sword', 'Steel Blade', 'Padded Undershirt', 'Leather Boots'];
        
        const fallbackInventory = testItems.map((itemName, index) => {
          const baseItem = baseItems.find((item: any) => item.name === itemName);
          if (baseItem) {
            return generateItem(baseItem, Math.max(1, playerLevel + index));
          }
          return null;
        }).filter((item): item is Item => item !== null);

        // Use original inventory if available, otherwise use fallback
        const finalInventory = newInventory.length > 0 ? newInventory : fallbackInventory;

        console.log('Final inventory:', finalInventory.length, 'items');

        setMerchantState({
          inventory: finalInventory,
          lastRefresh: now
        });
      } catch (error) {
        console.error('Error refreshing merchant inventory:', error);
        // Create minimal fallback on error
        setMerchantState({
          inventory: [],
          lastRefresh: now
        });
      }
    }
  };

  const handlePurchase = (item: Item) => {
    if (!currentCharacter) return;

    // Use the global purchaseItem function from context
    const success = purchaseItem(item);
    
    if (!success) {
      showAlert('Insufficient Gold', `You need ${item.price} gold to purchase this item.`);
      return;
    }

    // Remove item from merchant inventory
    setMerchantState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(merchantItem => merchantItem.id !== item.id)
    }));

    showAlert('Purchase Successful!', `${item.name} added to your inventory!`);
  };

  const getMerchantGreeting = () => {
    const greetings = [
      `Welcome to my shop, traveler! I have the finest gear for ${mapId.replace('_', ' ')}.`,
      `Ah, another adventurer! Looking for equipment suited to these lands?`,
      `Greetings! I've got just what you need to survive in this region.`,
      `Step right up! Quality gear for brave souls like yourself.`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const getTimeUntilRefresh = () => {
    if (merchantState.lastRefresh === 0) return "Ready to stock";

    const now = Date.now();
    const timeSinceRefresh = now - merchantState.lastRefresh;
    const timeUntilRefresh = REFRESH_INTERVAL - timeSinceRefresh;

    if (timeUntilRefresh <= 0) return "Ready to refresh";

    const minutes = Math.floor(timeUntilRefresh / (60 * 1000));
    const seconds = Math.floor((timeUntilRefresh % (60 * 1000)) / 1000);

    return `Restocks in: ${minutes}m ${seconds}s`;
  };

  if (!currentCharacter) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.merchantInfo}>
              <Text style={styles.merchantName}>{merchantName}</Text>
              <Text style={styles.merchantDescription}>{merchantDescription}</Text>
              <Text style={styles.merchantGreeting}>{getMerchantGreeting()}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Player Gold */}
          <View style={styles.goldContainer}>
            <Text style={styles.goldText}>Your Gold: {currentCharacter.gold}</Text>
          </View>

          {/* Refresh Timer */}
          <View style={styles.refreshContainer}>
            <Text style={styles.refreshText}>{getTimeUntilRefresh()}</Text>
            <Text style={styles.itemCount}>
              {merchantState.inventory.length} items available
            </Text>
          </View>

          {/* Debug Info */}
          {__DEV__ && (
            <View style={{ padding: 16, backgroundColor: Colors.surface, margin: 16, borderRadius: 8 }}>
              <Text style={{ color: Colors.warning, fontSize: 12 }}>
                Debug: MapID={mapId}, PlayerLevel={playerLevel}, InventoryLength={merchantState.inventory.length}
              </Text>
              <Text>Test</Text>
              {merchantState.inventory.length > 0 && (
                <Text style={{ color: Colors.info, fontSize: 10 }}>
                  First item: {merchantState.inventory[0]?.name || 'undefined'}
                </Text>
              )}
            </View>
          )}

          <ScrollView style={styles.inventoryScroll}>
            {merchantState.inventory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>The merchant is out of stock!</Text>
                <Text style={styles.emptySubtext}>Come back later when they restock.</Text>
              </View>
            ) : (
              <View style={styles.itemList}>
                {merchantState.inventory.map((item, index) => (
                  <View key={`merchant-item-${index}-${item.id}`} >
                    <ItemStatsDisplay item={item} showSlotInfo={true} />
                    <TouchableOpacity
                      style={[
                        styles.buyButton,
                        currentCharacter.gold < item.price && styles.disabledBuyButton
                      ]}
                      onPress={() => handlePurchase(item)}
                      disabled={currentCharacter.gold < item.price}
                    >
                      <Text style={[
                        styles.buyButtonText,
                        currentCharacter.gold < item.price && styles.disabledBuyText
                      ]}>
                        {currentCharacter.gold >= item.price ? 'Buy' : 'Too Expensive'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.leaveButton} onPress={onClose}>
              <Text style={styles.leaveButtonText}>Leave Shop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <AlertComponent />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    ...RPGTextStyles.h2,
    color: Colors.primary,
    marginBottom: 4,
  },
  merchantDescription: {
    ...RPGTextStyles.body,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  merchantGreeting: {
    ...RPGTextStyles.bodySmall,
    color: Colors.text,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeButtonText: {
    ...RPGTextStyles.body,
    color: Colors.text,
    fontWeight: '700',
  },
  goldContainer: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gold,
    alignItems: 'center',
  },
  goldText: {
    ...RPGTextStyles.body,
    fontWeight: '700',
    color: Colors.gold,
  },
  refreshContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  refreshText: {
    ...RPGTextStyles.label,
    color: Colors.info,
  },
  itemCount: {
    ...RPGTextStyles.label,
    color: Colors.textSecondary,
  },
  inventoryScroll: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    margin: 16,
  },
  emptyText: {
    ...RPGTextStyles.body,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  itemList: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    ...RPGTextStyles.body,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemPrice: {
    ...RPGTextStyles.caption,
    color: Colors.gold,
  },
  buyButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    marginTop: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.primary,
  },
  disabledBuyButton: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.border,
  },
  buyButtonText: {
    ...RPGTextStyles.button,
    color: Colors.background,

  },
  disabledBuyText: {
    ...RPGTextStyles.button,
    color: Colors.textMuted,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  leaveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  leaveButtonText: {
    ...RPGTextStyles.button,
    color: Colors.background,
  },
}); 