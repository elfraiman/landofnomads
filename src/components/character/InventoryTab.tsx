import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Character, Item, ItemType, ItemRarity } from '../../types';
import { useGame } from '../../context/GameContext';
import { useCustomAlert } from '../ui/CustomAlert';
import { ItemStatsDisplay } from '../ui/ItemStatsDisplay';
import { Colors } from '../../utils/colors';

interface InventoryTabProps {
  character: Character;
}

const InventoryTab: React.FC<InventoryTabProps> = ({ character }) => {
  const { equipItem, unequipItem, sellItem, saveGame, currentCharacter } = useGame();
  const [selectedFilter, setSelectedFilter] = useState<'all' | ItemType>('all');
  const { showAlert, AlertComponent } = useCustomAlert();

  // Use currentCharacter from context instead of prop to ensure we get the latest data
  const activeCharacter = currentCharacter || character;

  useEffect(() => {
    console.log('InventoryTab: Character updated');
    console.log('Prop character inventory length:', (character.inventory || []).length);
    console.log('Context character inventory length:', (currentCharacter?.inventory || []).length);
    console.log('Active character equipment:', activeCharacter.equipment);

    // Log each equipment slot
    Object.entries(activeCharacter.equipment).forEach(([slot, item]) => {
      console.log(`Equipment slot ${slot}:`, item ? item.name : 'empty');
    });
  }, [character, currentCharacter, activeCharacter]);

  const handleEquipItem = (item: Item) => {
    if (item.type === 'weapon') {
      // For weapons, check both hands and show choice if needed
      const mainHand = activeCharacter.equipment.mainHand;
      const offHand = activeCharacter.equipment.offHand;

      if (!mainHand) {
        // Main hand is empty, equip there
        equipItem(item);
        showAlert('Success!', `${item.name} equipped in main hand!`);
      } else if (!offHand && item.handedness === 'one-handed') {
        // Off hand is empty and item is one-handed, give choice
        showAlert(
          'Choose Hand',
          `Equip ${item.name} in main hand (replacing ${mainHand.name}) or off hand?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Main Hand',
              style: 'default',
              onPress: () => {
                equipItem(item);
                showAlert('Success!', `${item.name} equipped in main hand!`);
              }
            },
            {
              text: 'Off Hand',
              style: 'default',
              onPress: () => {
                // We'll need to update the equipItem function to handle slot specification
                equipItem(item);
                showAlert('Success!', `${item.name} equipped in off hand!`);
              }
            }
          ]
        );
      } else {
        // Replace main hand weapon
        showAlert(
          'Replace Weapon?',
          `Replace ${mainHand.name} with ${item.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Replace',
              style: 'default',
              onPress: () => {
                equipItem(item);
                showAlert('Success!', `${item.name} equipped!`);
              }
            }
          ]
        );
      }
    } else {
      // For non-weapons, use the existing logic
      const slotMap: Record<ItemType, keyof Character['equipment']> = {
        weapon: 'mainHand', // This won't be used due to above check
        armor: 'armor',
        helmet: 'helmet',
        boots: 'boots',
        accessory: 'accessory'
      };

      const slot = slotMap[item.type];
      const currentEquipped = activeCharacter.equipment[slot];

      if (currentEquipped) {
        showAlert(
          'Replace Equipment?',
          `Replace ${currentEquipped.name} with ${item.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Replace',
              style: 'default',
              onPress: () => {
                equipItem(item);
                showAlert('Success!', `${item.name} equipped!`);
              }
            }
          ]
        );
      } else {
        equipItem(item);
        showAlert('Success!', `${item.name} equipped!`);
      }
    }
  };

  const handleUnequipItem = (slot: keyof Character['equipment']) => {
    console.log('handleUnequipItem called with slot:', slot);
    const item = activeCharacter.equipment[slot];
    console.log('Item found in slot:', item?.name || 'none');
    if (!item) return;

    showAlert(
      'Unequip Item?',
      `Unequip ${item.name} and move it to inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unequip',
          style: 'default',
          onPress: () => {
            console.log('About to call unequipItem from context');
            unequipItem(slot);
            console.log('Called unequipItem, showing success alert');
            showAlert('Success!', `${item.name} moved to inventory!`);
          }
        }
      ]
    );
  };

  const handleSellItem = (item: Item) => {
    const sellPrice = Math.floor(item.price * 0.5);

    showAlert(
      'Sell Item?',
      `Sell ${item.name} for ${sellPrice} gold?\n\n(50% of original price)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sell',
          style: 'destructive',
          onPress: () => {
            sellItem(item.id);
            showAlert('Sold!', `${item.name} sold for ${sellPrice} gold!`);
          }
        }
      ]
    );
  };



  const getFilteredInventory = () => {
    const inventory = activeCharacter.inventory || [];
    if (selectedFilter === 'all') {
      return inventory;
    }
    return inventory.filter(item => item.type === selectedFilter);
  };

  const getEquipmentSlots = () => {
    const slots: Array<{ key: keyof Character['equipment']; name: string }> = [
      { key: 'mainHand', name: 'Main Hand' },
      { key: 'offHand', name: 'Off Hand' },
      { key: 'armor', name: 'Armor' },
      { key: 'helmet', name: 'Helmet' },
      { key: 'boots', name: 'Boots' },
      { key: 'accessory', name: 'Accessory' },
    ];
    return slots;
  };

  const filterOptions = [
    { key: 'all', name: 'All Items' },
    { key: 'weapon', name: 'Weapons' },
    { key: 'armor', name: 'Armor' },
    { key: 'helmet', name: 'Helmets' },
    { key: 'boots', name: 'Boots' },
    { key: 'accessory', name: 'Accessories' },
  ] as const;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Inventory & Equipment</Text>
          <View style={styles.goldContainer}>
            <Text style={styles.goldText}>Gold: {activeCharacter.gold}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Manage your equipment and inventory items
        </Text>

        {/* Currently Equipped */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currently Equipped</Text>

          <View style={styles.equipmentGrid}>
            {getEquipmentSlots().map(slot => {
              const item = activeCharacter.equipment[slot.key];

              return (
                <View key={slot.key} style={styles.equipmentSlot}>
                  <View style={styles.slotHeader}>
                    <Text style={styles.slotName}>{slot.name}</Text>
                  </View>

                  {item ? (
                    <View style={styles.equippedItem}>
                      <ItemStatsDisplay
                        item={item}
                        compact={true}
                        showSlotInfo={false}
                      />

                      <TouchableOpacity
                        style={styles.unequipButton}
                        onPress={() => {
                          console.log('Unequip button pressed for slot:', slot.key);
                          handleUnequipItem(slot.key);
                        }}
                      >
                        <Text style={styles.unequipButtonText}>Unequip</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.emptySlot}>
                      <Text style={styles.emptySlotText}>Empty</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Inventory Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory ({(activeCharacter.inventory || []).length} items)</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filterOptions.map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.activeFilterButton
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.activeFilterText
                ]}>
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Inventory Items */}
        <View style={styles.section}>
          {getFilteredInventory().length === 0 ? (
            <View style={styles.emptyInventory}>
              <Text style={styles.emptyInventoryIcon}></Text>
              <Text style={styles.emptyInventoryText}>
                {selectedFilter === 'all' ? 'Your inventory is empty' : `No ${selectedFilter}s in inventory`}
              </Text>
              <Text style={styles.emptyInventorySubtext}>
                Visit the shop to purchase items!
              </Text>
            </View>
          ) : (
            <View style={styles.inventoryGrid}>
              {getFilteredInventory().map(item => (
                <View key={item.id} style={styles.inventoryItem}>
                  <ItemStatsDisplay
                    item={item}
                    showSlotInfo={true}
                  />

                  {/* Item Description */}
                  <Text style={styles.itemDescription}>
                    {item.description}
                  </Text>

                  {/* Item Actions */}
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.equipButton}
                      onPress={() => handleEquipItem(item)}
                    >
                      <Text style={styles.equipButtonText}>Equip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sellButton}
                      onPress={() => handleSellItem(item)}
                    >
                      <Text style={styles.sellButtonText}>
                        Sell ({Math.floor(item.price * 0.5)})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Inventory Tips */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Inventory Tips</Text>
          <Text style={styles.infoText}>
            • Equip items to gain their stat bonuses{'\n'}
            • Sell items for 50% of their purchase price{'\n'}
            • Higher rarity items provide better bonuses{'\n'}
            • You can replace equipped items directly{'\n'}
            • Unequipped items return to your inventory
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

  // Header
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
    marginBottom: 24,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },

  // Equipment Slots
  equipmentGrid: {
    gap: 12,
  },
  equipmentSlot: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  slotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  equippedItem: {
    gap: 8,
  },
  equippedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equippedItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  equippedItemRarity: {
    fontSize: 16,
  },
  equippedItemStats: {
    fontSize: 12,
    color: '#2ea043',
    fontWeight: '500',
  },
  unequipButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    minHeight: 32,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unequipButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  emptySlot: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.overlay,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptySlotText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // Filter
  filterScroll: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 80,
    shadowColor: Colors.background,
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.accent,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  filterEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  filterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: Colors.background,
  },

  // Inventory
  emptyInventory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyInventoryIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyInventoryText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptyInventorySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  inventoryGrid: {
    gap: 12,
  },
  inventoryItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  rarityBadge: {
    alignItems: 'center',
  },
  rarityEmoji: {
    fontSize: 16,
  },
  itemLevel: {
    fontSize: 12,
    color: '#79c0ff',
    marginBottom: 6,
  },
  itemStats: {
    fontSize: 13,
    color: '#2ea043',
    fontWeight: '500',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  equipButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    shadowColor: Colors.success,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  equipButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  sellButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    shadowColor: Colors.error,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sellButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },

  // Info Box
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.info,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default InventoryTab;