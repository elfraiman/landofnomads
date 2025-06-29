/**
 * Stat-related utilities and constants
 */

// Standard 3-letter abbreviations for character stats
export const STAT_ABBREVIATIONS: Record<string, string> = {
  'strength': 'STR',
  'agility': 'AGI',
  'intelligence': 'INT',
  'vitality': 'VIT',
  'luck': 'LCK',
  'defense': 'DEF',
  'speed': 'SPD',
  'health': 'HP',
  'mana': 'MP',
  'experience': 'EXP',
  'gold': 'GLD'
};

/**
 * Get the 3-letter abbreviation for a stat name
 * @param statName - The full stat name (case insensitive)
 * @returns The 3-letter abbreviation, or first 3 letters capitalized as fallback
 */
export const getStatAbbreviation = (statName: string): string => {
  const normalized = statName.toLowerCase();
  return STAT_ABBREVIATIONS[normalized] || statName.slice(0, 3).toUpperCase();
};

/**
 * Get multiple stat abbreviations at once
 * @param statNames - Array of stat names
 * @returns Array of corresponding abbreviations
 */
export const getStatAbbreviations = (statNames: string[]): string[] => {
  return statNames.map(getStatAbbreviation);
};

/**
 * Format a stat bonus with its abbreviation
 * @param statName - The stat name
 * @param bonus - The bonus value
 * @returns Formatted string like "STR +5" or "AGI -2"
 */
export const formatStatBonus = (statName: string, bonus: number): string => {
  const abbrev = getStatAbbreviation(statName);
  const sign = bonus >= 0 ? '+' : '';
  return `${abbrev} ${sign}${bonus}`;
}; 