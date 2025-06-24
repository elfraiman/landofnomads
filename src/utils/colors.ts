// RPG Dark Fantasy Color System - Inspired by Path of Exile and Medieval Aesthetics
export const Colors = {
  // Core Background Colors
  background: '#0A0A0A',           // Deep black for main background
  surface: '#1A1A1A',             // Dark charcoal for cards and surfaces
  surfaceElevated: '#252525',     // Lighter surface for elevated elements
  overlay: '#0F0F0F',             // Overlay backgrounds

  // Border and Divider Colors
  border: '#3A3A3A',              // Subtle borders
  borderAccent: '#4A4A4A',        // More prominent borders
  borderGlow: '#5A5A5A',          // Glowing borders for special elements

  // Text Colors
  text: '#E8E8E8',                // Primary text - warm white
  textSecondary: '#B8B8B8',       // Secondary text - muted
  textMuted: '#888888',           // Muted text for less important info
  textDisabled: '#555555',        // Disabled text

  // RPG Themed UI Colors
  primary: '#C9AA71',             // Warm gold - primary actions
  primaryDark: '#A68B5B',         // Darker gold for hover states
  secondary: '#6B7280',           // Cool gray for secondary elements
  accent: '#D4AF37',              // Bright gold for highlights

  // Status Colors
  success: '#10B981',             // Emerald green for success
  warning: '#F59E0B',             // Amber for warnings
  error: '#EF4444',               // Red for errors
  info: '#3B82F6',                // Blue for information

  // Combat & Action Colors
  damage: '#DC2626',              // Bright red for damage
  criticalDamage: '#FF1744',      // Intense red for critical damage
  normalDamage: '#EF5350',        // Medium red for normal damage
  heal: '#22C55E',                // Green for healing
  miss: '#9CA3AF',                // Gray for misses
  dodge: '#60A5FA',               // Blue for dodges
  block: '#A855F7',               // Purple for blocks

  // Resource Colors
  health: '#DC2626',              // Red for health
  mana: '#3B82F6',                // Blue for mana/energy
  stamina: '#F59E0B',             // Orange for stamina
  experience: '#8B5CF6',          // Purple for experience
  gold: '#EAB308',                // Gold for currency

  // Rarity Colors (Classic RPG Style)
  common: '#9CA3AF',              // Gray - common items
  uncommon: '#22C55E',            // Green - uncommon items  
  rare: '#3B82F6',                // Blue - rare items
  epic: '#A855F7',                // Purple - epic items
  legendary: '#F59E0B',           // Orange - legendary items
  mythic: '#EF4444',              // Red - mythic items

  // Class Colors
  warrior: '#DC2626',             // Red - strength and combat
  paladin: '#EAB308',             // Gold - holy and divine
  mage: '#3B82F6',                // Blue - intelligence and magic
  rogue: '#22C55E',               // Green - stealth and agility
  archer: '#10B981',              // Teal - precision and focus
  berserker: '#F97316',           // Orange - rage and fury

  // Combat Result Colors
  victory: '#22C55E',             // Green for victory
  defeat: '#DC2626',              // Red for defeat

  // Special Effect Colors
  fire: '#F97316',                // Orange-red for fire effects
  ice: '#06B6D4',                 // Cyan for ice effects
  lightning: '#FACC15',           // Yellow for lightning
  poison: '#84CC16',              // Lime green for poison
  shadow: '#6B7280',              // Dark gray for shadow
  holy: '#FDE047',                // Bright yellow for holy

  // Interactive States
  hover: '#2A2A2A',               // Hover state background
  active: '#3A3A3A',              // Active state background
  focus: '#C9AA71',               // Focus outline color
  disabled: '#1F1F1F',            // Disabled background

  // Gradient Stops for Special Effects
  gradientStart: '#1A1A1A',
  gradientEnd: '#0A0A0A',

  // Equipment Slot Colors
  weapon: '#DC2626',              // Red for weapons
  armor: '#6B7280',               // Gray for armor
  accessory: '#A855F7',           // Purple for accessories

  // Environment Colors
  dungeon: '#1F2937',             // Dark blue-gray for dungeons
  forest: '#166534',              // Dark green for forests
  desert: '#A16207',              // Brown for deserts
  mountain: '#4B5563',            // Gray for mountains

  // Player vs Enemy colors
  player: '#22C55E',              // Green for player actions
  enemy: '#DC2626',               // Red for enemy actions
  neutral: '#9CA3AF',             // Gray for neutral text
} as const;

// Helper functions for color manipulation
export const ColorUtils = {
  // Add transparency to a color
  withOpacity: (color: string, opacity: number): string => {
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  },

  // Get color based on combat action
  getCombatActionColor: (action: string): string => {
    switch (action.toLowerCase()) {
      case 'critical':
        return Colors.criticalDamage;
      case 'miss':
        return Colors.miss;
      case 'dodge':
        return Colors.dodge;
      case 'block':
        return Colors.block;
      case 'heal':
        return Colors.heal;
      default:
        return Colors.damage;
    }
  },

  // Get color based on health percentage
  getHealthColor: (percentage: number): string => {
    if (percentage > 60) return Colors.success;
    if (percentage > 30) return Colors.warning;
    return Colors.error;
  },

  // Get rarity color
  getRarityColor: (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return Colors.common;
      case 'uncommon':
        return Colors.uncommon;
      case 'rare':
        return Colors.rare;
      case 'epic':
        return Colors.epic;
      case 'legendary':
        return Colors.legendary;
      case 'mythic':
        return Colors.mythic;
      default:
        return Colors.common;
    }
  },

  // Get rarity glow effect for special items
  getRarityGlow: (rarity: string): string => {
    const baseColor = ColorUtils.getRarityColor(rarity);
    return `0 0 8px ${ColorUtils.withOpacity(baseColor, 0.6)}`;
  },

  // Get class color
  getClassColor: (className: string): string => {
    switch (className.toLowerCase()) {
      case 'warrior':
        return Colors.warrior;
      case 'paladin':
        return Colors.paladin;
      case 'mage':
        return Colors.mage;
      case 'rogue':
        return Colors.rogue;
      case 'archer':
        return Colors.archer;
      case 'berserker':
        return Colors.berserker;
      default:
        return Colors.textSecondary;
    }
  },

  // Parse combat text for player vs enemy coloring with damage number highlighting
  parseCombatText: (text: string, playerName: string): Array<{ text: string, color: string, bold?: boolean }> => {
    const parts: Array<{ text: string, color: string, bold?: boolean }> = [];

    // Helper function to parse text and highlight damage numbers
    const parseTextWithDamage = (inputText: string, baseColor: string = Colors.neutral, isCritical: boolean = false): void => {
      // Pattern to match damage numbers like "for 25 damage" or "for 25 damage!"
      const damagePattern = /(\s+for\s+)(\d+)(\s+damage[^\w]*)/gi;
      let lastIndex = 0;
      let match;

      while ((match = damagePattern.exec(inputText)) !== null) {
        // Add text before the damage
        if (match.index > lastIndex) {
          const beforeText = inputText.substring(lastIndex, match.index);
          if (beforeText.trim()) {
            parts.push({ text: beforeText, color: baseColor });
          }
        }

        // Add the damage parts with special coloring
        parts.push({ text: match[1], color: baseColor }); // " for "
        parts.push({
          text: match[2],
          color: isCritical ? Colors.criticalDamage : Colors.normalDamage,
          bold: true
        }); // damage number in red
        parts.push({ text: match[3], color: baseColor }); // " damage"

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text after last damage match
      if (lastIndex < inputText.length) {
        const remainingText = inputText.substring(lastIndex);
        if (remainingText.trim()) {
          parts.push({ text: remainingText, color: baseColor });
        }
      }

      // If no damage patterns found, add the original text
      if (lastIndex === 0) {
        parts.push({ text: inputText, color: baseColor });
      }
    };

    // Simple approach: just highlight player name and damage numbers
    if (text.includes(playerName)) {
      // Find player name and color it
      const playerIndex = text.indexOf(playerName);

      // Add text before player name
      if (playerIndex > 0) {
        const beforePlayer = text.substring(0, playerIndex);
        parts.push({ text: beforePlayer, color: Colors.neutral });
      }

      // Add player name in green
      parts.push({ text: playerName, color: Colors.player, bold: true });

      // Parse the rest for damage numbers
      const afterPlayer = text.substring(playerIndex + playerName.length);
      parseTextWithDamage(afterPlayer, Colors.neutral, text.includes('DEVASTATING CRITICAL HIT'));
    } else {
      // No player name found, just parse for damage numbers
      parseTextWithDamage(text, Colors.neutral, text.includes('DEVASTATING CRITICAL HIT'));
    }

    return parts;
  },

  // Simple color extraction for single-color entries (fallback)
  getEntryColor: (entry: string, playerName: string): { color: string, bold: boolean } => {
    const lowerEntry = entry.toLowerCase();

    // Handle new battle log format entries
    if (lowerEntry.includes('victory')) {
      return { color: Colors.victory, bold: true };
    } else if (lowerEntry.includes('defeat')) {
      return { color: Colors.defeat, bold: true };
    } else if (lowerEntry.includes('defeated!')) {
      return { color: Colors.success, bold: true };
    } else if (lowerEntry.includes('gold')) {
      return { color: Colors.gold, bold: false };
    } else if (lowerEntry.includes('items')) {
      return { color: Colors.primary, bold: false };
    } else if (lowerEntry.includes('health:')) {
      return { color: Colors.health, bold: false };
    } else if (lowerEntry.includes('summary') || lowerEntry.includes('rewards:')) {
      return { color: Colors.info, bold: true };
    } else if (entry.startsWith('===') || entry.startsWith('---')) {
      return { color: Colors.accent, bold: true };
    } else if (lowerEntry.includes('critical')) {
      return { color: Colors.criticalDamage, bold: true };
    } else if (lowerEntry.includes('dodge')) {
      return { color: Colors.dodge, bold: false };
    } else if (lowerEntry.includes('miss')) {
      return { color: Colors.miss, bold: false };
    } else if (lowerEntry.includes('experience') || lowerEntry.includes('xp')) {
      return { color: Colors.experience, bold: false };
    } else if (lowerEntry.includes(playerName.toLowerCase())) {
      return { color: Colors.player, bold: true };
    } else if (lowerEntry.includes('damage') || lowerEntry.includes('attacks')) {
      // Check if it's a critical damage context
      if (lowerEntry.includes('critical')) {
        return { color: Colors.criticalDamage, bold: true };
      } else {
        return { color: Colors.normalDamage, bold: false };
      }
    } else {
      return { color: Colors.neutral, bold: false };
    }
  }
}; 