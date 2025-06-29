import { Platform } from 'react-native';

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
  shield: '#3B82F6',              // Blue for shields
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

// Map-specific gradient themes for unique location atmosphere
export const MapGradients = {
  greenwood_valley: {
    name: 'Greenwood Valley',
    primary: '#2D5016',           // Deep forest green
    secondary: '#4A7C59',         // Lighter forest green
    accent: '#8FBC8F',            // Sage green
    tileBase: '#1A4D14',          // Dark green base
    tileBorder: '#2D5016',        // Primary as border
    atmosphere: 'Lush and peaceful forest atmosphere'
  },
  shadowmere_swamps: {
    name: 'Shadowmere Swamps',
    primary: '#2D4A22',           // Dark swamp green
    secondary: '#4A4A2D',         // Murky brown-green
    accent: '#6B8E23',            // Olive green
    tileBase: '#1C2E1C',          // Very dark green
    tileBorder: '#2D4A22',        // Primary as border
    atmosphere: 'Dark and mysterious swamp atmosphere'
  },
  crystal_caverns: {
    name: 'Crystal Caverns',
    primary: '#1E3A8A',           // Deep crystal blue
    secondary: '#3730A3',         // Rich purple-blue
    accent: '#60A5FA',            // Bright crystal blue
    tileBase: '#1E1B4B',          // Dark blue base
    tileBorder: '#1E3A8A',        // Primary as border
    atmosphere: 'Mystical underground crystal atmosphere'
  },
  volcanic_peaks: {
    name: 'Volcanic Peaks',
    primary: '#991B1B',           // Deep volcanic red
    secondary: '#DC2626',         // Bright red
    accent: '#F97316',            // Orange-red
    tileBase: '#7F1D1D',          // Dark red base
    tileBorder: '#991B1B',        // Primary as border
    atmosphere: 'Scorching volcanic atmosphere'
  },
  frozen_wastes: {
    name: 'Frozen Wastes',
    primary: '#1E40AF',           // Deep ice blue
    secondary: '#3B82F6',         // Bright blue
    accent: '#93C5FD',            // Light ice blue
    tileBase: '#1E3A8A',          // Dark blue base
    tileBorder: '#1E40AF',        // Primary as border
    atmosphere: 'Frigid arctic atmosphere'
  }
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

  // Get gem type color for visual distinction
  getGemTypeColor: (gemType: string): string => {
    switch (gemType.toLowerCase()) {
      case 'ruby':
        return '#DC2626'; // Red for Strength
      case 'sapphire':
        return '#2563EB'; // Blue for Constitution  
      case 'emerald':
        return '#059669'; // Green for Intelligence
      case 'diamond':
        return '#E5E7EB'; // White/Silver for Dexterity
      case 'opal':
        return '#A855F7'; // Purple for Speed
      default:
        return Colors.primary;
    }
  },

  // Get map gradient theme
  getMapGradient: (mapId: string) => {
    const validMapId = mapId as keyof typeof MapGradients;
    return MapGradients[validMapId] || MapGradients.greenwood_valley;
  },

  // Get tile colors based on map and tile type
  getTileColors: (mapId: string, tileType: string, isCurrentPosition: boolean = false, isAvailableMove: boolean = false, isVisited: boolean = true): { backgroundColor: string; borderColor: string } => {
    const gradient = ColorUtils.getMapGradient(mapId);
    
    let backgroundColor: string = gradient.tileBase;
    let borderColor: string = gradient.tileBorder;
    
    // Special states override base colors
    if (isCurrentPosition) {
      backgroundColor = ColorUtils.withOpacity(gradient.accent, 0.3);
      borderColor = gradient.accent;
    } else if (isAvailableMove) {
      backgroundColor = ColorUtils.withOpacity(gradient.secondary, 0.2);
      borderColor = gradient.secondary;
    }
    
    // Tile type variations within the map theme
    switch (tileType) {
      case 'portal':
        backgroundColor = ColorUtils.withOpacity(Colors.info, 0.2);
        borderColor = Colors.info;
        break;
      case 'merchant':
        backgroundColor = ColorUtils.withOpacity(Colors.accent, 0.2);
        borderColor = Colors.accent;
        break;
      case 'village':
        backgroundColor = ColorUtils.withOpacity(gradient.accent, 0.15);
        borderColor = gradient.accent;
        break;
      case 'cave':
      case 'ruins':
        backgroundColor = ColorUtils.withOpacity(gradient.primary, 0.8);
        borderColor = gradient.primary;
        break;
    }
    
    // Reduce opacity for unvisited tiles
    if (!isVisited) {
      backgroundColor = ColorUtils.withOpacity(backgroundColor, 0.3);
      borderColor = ColorUtils.withOpacity(borderColor, 0.3);
    }
    
    return { backgroundColor, borderColor };
  },

  // Create gradient style for backgrounds
  createMapGradientStyle: (mapId: string) => {
    const gradient = ColorUtils.getMapGradient(mapId);
    return {
      backgroundColor: ColorUtils.withOpacity(gradient.primary, 0.15),
      // For React Native, we can use a subtle gradient effect with borderColor
      borderTopColor: ColorUtils.withOpacity(gradient.secondary, 0.3),
      borderBottomColor: ColorUtils.withOpacity(gradient.primary, 0.15),
    };
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

// Typography System
export const Typography = {
  // Font families - using system fonts styled for RPG feel
  fonts: {
    // Primary display font - for titles and headers
    display: Platform.select({
      ios: 'Palatino', // Elegant serif with historical feel
      android: 'serif',
      default: 'serif'
    }),
    
    // Secondary font - for UI elements and body text
    body: Platform.select({
      ios: 'Georgia', // Readable serif with character
      android: 'serif',
      default: 'serif'
    }),
    
    // Accent font - for special elements
    accent: Platform.select({
      ios: 'Times New Roman', // Classic serif
      android: 'serif',
      default: 'serif'
    }),
    
    // Monospace font - for stats and numbers
    mono: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      default: 'monospace'
    })
  },

  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
    '7xl': 42,
    '8xl': 48,
    '9xl': 60
  },

  // Font weights
  weights: {
    light: '300' as '300',
    normal: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
    extrabold: '800' as '800',
    black: '900' as '900'
  },

  // Line heights
  lineHeights: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8
  }
};

// Default text style - used as base for all text in the app
// This ensures all Text components use our RPG typography by default
export const DefaultTextStyle = {
  fontFamily: Typography.fonts.body,
  fontSize: Typography.sizes.base,
  fontWeight: Typography.weights.normal,
  color: Colors.text,
  includeFontPadding: false, // Android-specific: removes extra padding
  textAlignVertical: 'center' as 'center', // Better alignment on Android
};

// RPG Text Styles - Pre-defined styles for common use cases
export const RPGTextStyles = {
  // Default/base style that matches our default
  default: {
    ...DefaultTextStyle,
  },
  // Display styles
  heroTitle: {
    fontFamily: Typography.fonts.display,
    fontSize: Typography.sizes['8xl'],
    fontWeight: Typography.weights.black,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },

  title: {
    fontFamily: Typography.fonts.display,
    fontSize: Typography.sizes['6xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  subtitle: {
    fontFamily: Typography.fonts.display,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.semibold,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Header styles
  h1: {
    fontFamily: Typography.fonts.display,
    fontSize: Typography.sizes['5xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },

  h2: {
    fontFamily: Typography.fonts.display,
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  h3: {
    fontFamily: Typography.fonts.display,
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
  },

  // Body text styles
  body: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.normal,
  },

  bodyLarge: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.normal,
  },

  bodySmall: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.normal,
  },

  // UI element styles
  button: {
    fontFamily: Typography.fonts.accent,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
  },

  label: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
  },

  caption: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.normal,
    letterSpacing: 0.25,
  },

  // Special styles
  stat: {
    fontFamily: Typography.fonts.mono,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },

  statLarge: {
    fontFamily: Typography.fonts.mono,
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  medieval: {
    fontFamily: Typography.fonts.accent,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as 'uppercase',
  },

  rune: {
    fontFamily: Typography.fonts.accent,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  }
};

// Helper function to create text styles with our default typography
export const createTextStyle = (overrides: any = {}) => ({
  ...DefaultTextStyle,
  ...overrides,
}); 