import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Character, Item } from '../../types';
import { Colors, ColorUtils } from '../../utils/colors';
import { useGame } from '../../context/GameContext';
import { useCustomAlert } from '../ui/CustomAlert';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';
import { getMerchantInventory } from '../../data/wilderness';

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
  const { currentCharacter, addItemToInventory, updateCharacter, saveGame } = useGame();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [merchantState, setMerchantState] = useState<MerchantState>({
    inventory: [],
    lastRefresh: 0
  });

  // Initialize merchant inventory when modal opens
  useEffect(() => {
    if (visible) {
      refreshMerchantInventory();
    }
  }, [visible, mapId, playerLevel]);

  const refreshMerchantInventory = () => {
    const now = Date.now();

    // Check if we need to refresh (first time or 20 minutes passed)
    if (merchantState.lastRefresh === 0 || (now - merchantState.lastRefresh) >= REFRESH_INTERVAL) {
      // Get map-specific inventory
      const newInventory = getMerchantInventory(mapId, playerLevel);

      setMerchantState({
        inventory: newInventory,
        lastRefresh: now
      });
    }
  };

  const purchaseItem = (item: Item) => {
    if (!currentCharacter) return;

    if (currentCharacter.gold < item.price) {
      showAlert('Insufficient Gold', `You need ${item.price} gold to purchase this item.`);
      return;
    }

    // Deduct gold and add to inventory
    const updatedCharacter = {
      ...currentCharacter,
      gold: currentCharacter.gold - item.price
    };
    updateCharacter(updatedCharacter);
    addItemToInventory(item);

    // Remove item from merchant inventory
    setMerchantState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(merchantItem => merchantItem.id !== item.id)
    }));

    showAlert('Purchase Successful!', `${item.name} added to your inventory!`);
    saveGame();
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

          {/* Inventory */}
          <ScrollView style={styles.inventoryScroll} showsVerticalScrollIndicator={false}>
            {merchantState.inventory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>The merchant is out of stock!</Text>
                <Text style={styles.emptySubtext}>Come back later when they restock.</Text>
              </View>
            ) : (
              <View style={styles.itemGrid}>
                {merchantState.inventory.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <ItemStatsDisplay item={item} showSlotInfo={true} />

                    <Text style={styles.itemDescription}>{item.description}</Text>

                    <View style={styles.itemFooter}>
                      <Text style={styles.itemPrice}>{item.price} Gold</Text>
                      <TouchableOpacity
                        style={[
                          styles.purchaseButton,
                          currentCharacter.gold < item.price && styles.disabledPurchaseButton
                        ]}
                        onPress={() => purchaseItem(item)}
                        disabled={currentCharacter.gold < item.price}
                      >
                        <Text style={[
                          styles.purchaseButtonText,
                          currentCharacter.gold < item.price && styles.disabledPurchaseText
                        ]}>
                          {currentCharacter.gold >= item.price ? 'Buy' : 'Too Expensive'}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  merchantDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  merchantGreeting: {
    fontSize: 13,
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
    fontSize: 18,
    color: Colors.text,
    fontWeight: 'bold',
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
    fontSize: 16,
    fontWeight: 'bold',
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
    color: Colors.info,
    fontSize: 14,
    fontWeight: '600',
  },
  itemCount: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  inventoryScroll: {
    flex: 1,
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
    gap: 12,
    paddingBottom: 16,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginVertical: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  purchaseButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabledPurchaseButton: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.border,
  },
  purchaseButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledPurchaseText: {
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
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 