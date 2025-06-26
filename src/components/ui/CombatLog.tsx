import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, ColorUtils } from '../../utils/colors';

interface CombatLogProps {
  entries: string[];
  playerName: string;
  weaponName?: string;
  weaponRarity?: string;
}

interface CombatLogEntry {
  text: string;
  type: 'normal' | 'critical' | 'miss' | 'dodge' | 'victory' | 'defeat' | 'info' | 'header';
  playerAction?: boolean;
  damage?: number;
  weaponName?: string;
  weaponRarity?: string;
}

export const CombatLog: React.FC<CombatLogProps> = ({
  entries,
  playerName,
  weaponName,
  weaponRarity = 'common'
}) => {
  
  // Parse a single combat log entry into structured data
  const parseEntry = (entry: string): CombatLogEntry => {
    const lowerEntry = entry.toLowerCase();
    
    // Determine entry type
    let type: CombatLogEntry['type'] = 'normal';
    let playerAction = false;
    let damage: number | undefined;
    let entryWeaponName: string | undefined;
    let entryWeaponRarity: string | undefined;
    
    // Check for different combat actions
    if (lowerEntry.includes('critical hit') || lowerEntry.includes('devastating critical hit')) {
      type = 'critical';
    } else if (lowerEntry.includes('dodge')) {
      type = 'dodge';
    } else if (lowerEntry.includes('miss') || lowerEntry.includes('goes wide')) {
      type = 'miss';
    } else if (lowerEntry.includes('victory') || lowerEntry.includes('defeated!')) {
      type = 'victory';
    } else if (lowerEntry.includes('defeat') || lowerEntry.includes('slain')) {
      type = 'defeat';
    } else if (entry.startsWith('===') || entry.startsWith('---') || entry.startsWith('-=')) {
      type = 'header';
    } else if (lowerEntry.includes('rewards:') || lowerEntry.includes('experience') || lowerEntry.includes('gold') || lowerEntry.includes('items')) {
      type = 'info';
    }
    
    // Check if this is a player action
    if (entry.includes(playerName)) {
      playerAction = true;
      entryWeaponName = weaponName;
      entryWeaponRarity = weaponRarity;
    }
    
    // Extract damage numbers
    const damageMatch = entry.match(/(\d+)\s+damage/i);
    if (damageMatch) {
      damage = parseInt(damageMatch[1]);
    }
    
    return {
      text: entry,
      type,
      playerAction,
      damage,
      weaponName: entryWeaponName,
      weaponRarity: entryWeaponRarity
    };
  };

  // Render a single combat log entry with proper styling
  const renderEntry = (entry: string, index: number) => {
    const parsedEntry = parseEntry(entry);
    
    // Get base color for the entry type
    const getEntryColor = (): string => {
      switch (parsedEntry.type) {
        case 'critical':
          return Colors.criticalDamage;
        case 'miss':
          return Colors.miss;
        case 'dodge':
          return Colors.dodge;
        case 'victory':
          return Colors.success;
        case 'defeat':
          return Colors.error;
        case 'info':
          return Colors.info;
        case 'header':
          return Colors.accent;
        default:
          return Colors.neutral;
      }
    };

    // Split text into parts for coloring
    const renderColoredText = () => {
      let text = parsedEntry.text;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;

      // Helper to add text part
      const addTextPart = (content: string, color: string, bold: boolean = false, key?: string) => {
        if (content.trim()) {
          parts.push(
            <Text key={key || parts.length} style={[styles.logText, { color, fontWeight: bold ? 'bold' : 'normal' }]}>
              {content}
            </Text>
          );
        }
      };

      // Color player name
      const playerIndex = text.indexOf(playerName);
      if (playerIndex !== -1) {
        // Text before player name
        addTextPart(text.substring(0, playerIndex), getEntryColor());
        
        // Player name in player color
        addTextPart(playerName, Colors.player, true, 'player');
        
        text = text.substring(playerIndex + playerName.length);
        lastIndex = 0;
      }

      // Color weapon names if present
      if (parsedEntry.weaponName && parsedEntry.weaponRarity) {
        const weaponColor = ColorUtils.getRarityColor(parsedEntry.weaponRarity);
        const weaponIndex = text.indexOf(parsedEntry.weaponName);
        
        if (weaponIndex !== -1) {
          // Text before weapon
          addTextPart(text.substring(lastIndex, weaponIndex), getEntryColor());
          
          // Weapon name in rarity color
          addTextPart(parsedEntry.weaponName, weaponColor, true, 'weapon');
          
          lastIndex = weaponIndex + parsedEntry.weaponName.length;
        }
      }

      // Color damage numbers
      if (parsedEntry.damage) {
        const damagePattern = new RegExp(`\\b${parsedEntry.damage}\\s+damage`, 'i');
        const damageMatch = text.substring(lastIndex).match(damagePattern);
        
        if (damageMatch) {
          const damageIndex = text.indexOf(damageMatch[0], lastIndex);
          
          // Text before damage
          addTextPart(text.substring(lastIndex, damageIndex), getEntryColor());
          
          // Damage number
          const damageColor = parsedEntry.type === 'critical' ? Colors.criticalDamage : Colors.normalDamage;
          addTextPart(parsedEntry.damage.toString(), damageColor, true, 'damage');
          
          // " damage" text
          addTextPart(' damage', getEntryColor());
          
          lastIndex = damageIndex + damageMatch[0].length;
        }
      }

      // Add remaining text
      if (lastIndex < text.length) {
        addTextPart(text.substring(lastIndex), getEntryColor());
      }

      // If no parts were added, add the original text
      if (parts.length === 0) {
        addTextPart(text, getEntryColor());
      }

      return parts;
    };

    return (
      <View key={index} style={styles.logEntry}>
        <Text style={styles.logText}>
          {renderColoredText()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Combat Log</Text>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        decelerationRate="normal"
      >
        {entries.map((entry, index) => renderEntry(entry, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    margin: 8,
    height: 280, // Fixed height to ensure scrolling works
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,

  },
  scrollContent: {
    paddingBottom: 8,
  },
  logEntry: {
    marginBottom: 4,
    paddingVertical: 2,
  },
  logText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.neutral,
  },
}); 