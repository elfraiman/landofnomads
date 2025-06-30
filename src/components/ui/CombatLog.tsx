import React from 'react';
import { ScrollView, StyleSheet, Text, View, TextStyle } from 'react-native';
import { Colors } from '../../utils/colors';
import { DetailedBattleResult } from '../../types';

// Helper to push styled text
const pushText = (arr: React.ReactNode[], text: string, style: TextStyle): void => {
  if (text) arr.push(<Text key={arr.length} style={style}>{text}</Text>);
};

interface CombatLogProps {
  result: DetailedBattleResult;
  maxHeight?: number;
  showScrollIndicator?: boolean;
  nestedScrollEnabled?: boolean;
}

export const CombatLog: React.FC<CombatLogProps> = ({
  result,
  maxHeight = 180,
  showScrollIndicator = true,
  nestedScrollEnabled = true,
}) => {
  const {
    combatLog,
    playerName,
    weaponName,
    weaponRarity = 'common',
    offHandWeaponName,
    offHandWeaponRarity = 'common',
    monsterName,
    monsterMaxHealth,
  } = result;

  const renderCombatLogEntry = (entry: string, index: number) => {
    const playerNamePattern = new RegExp(`\\b${playerName}\\b`, 'g');
    const mainWeaponPattern = weaponName ? new RegExp(`\\b${weaponName}\\b`, 'gi') : null;
    const offHandWeaponPattern = offHandWeaponName ? new RegExp(`\\b${offHandWeaponName}\\b`, 'gi') : null;
    const damagePattern = /(\d+)( damage)/g;

    let parts: React.ReactNode[] = [];
    let working = entry;

    // Detect crit
    const isCrit = entry.includes('CRITICAL HIT') || entry.includes('DEVASTATING CRITICAL HIT');
    const damageColor = isCrit ? Colors.criticalDamage : Colors.gold;

    // Highlight player name
    working = working.replace(playerNamePattern, '%%PLAYER%%');
    // Highlight weapons
    if (mainWeaponPattern) working = working.replace(mainWeaponPattern, '%%MAINWEAPON%%');
    if (offHandWeaponPattern) working = working.replace(offHandWeaponPattern, '%%OFFHANDWEAPON%%');
    // Highlight damage numbers
    working = working.replace(damagePattern, '%%DMG%%$1%%DMGEND%%$2');

    // If this entry is the first mention of the monster, append HP info
    let isMonsterIntro = false;
    if (monsterName && monsterMaxHealth && entry.includes(monsterName)) {
      isMonsterIntro = combatLog.findIndex(e => e.includes(monsterName)) === index;
    }

    // Split on markers and build styled parts
    const tokens = working.split(/(%%PLAYER%%|%%MAINWEAPON%%|%%OFFHANDWEAPON%%|%%DMG%%|%%DMGEND%%)/);
    let inDamage = false;
    tokens.forEach(token => {
      if (token === '%%PLAYER%%') {
        pushText(parts, playerName, { color: Colors.player, fontWeight: 'bold' });
      } else if (token === '%%MAINWEAPON%%') {
        if (weaponName) pushText(parts, weaponName, { color: Colors[weaponRarity] as string, fontWeight: 'bold' });
      } else if (token === '%%OFFHANDWEAPON%%') {
        if (offHandWeaponName) pushText(parts, offHandWeaponName, { color: Colors[offHandWeaponRarity] as string, fontWeight: 'bold' });
      } else if (token === '%%DMG%%') {
        inDamage = true;
      } else if (token === '%%DMGEND%%') {
        inDamage = false;
      } else if (token) {
        if (inDamage) {
          pushText(parts, token, { color: damageColor, fontWeight: 'bold' });
        } else {
          if (/miss|dodge|goes wide/i.test(token)) {
            pushText(parts, token, { color: /dodge/i.test(token) ? Colors.dodge : Colors.miss });
          } else {
            pushText(parts, token, { color: Colors.neutral });
          }
        }
      }
    });

    // Append monster HP info if this is the monster intro
    if (isMonsterIntro) {
      parts.push(
        <Text key="monster-hp" style={{ color: Colors.neutral, fontStyle: 'italic', marginLeft: 4 }}>
          {` (HP: ${monsterMaxHealth})`}
        </Text>
      );
    }

    return (
      <Text key={index} style={styles.combatLogEntry}>
        {parts}
      </Text>
    );
  };

  return (
    <ScrollView
      style={[styles.combatLogContainer, { maxHeight }]}
      showsVerticalScrollIndicator={showScrollIndicator}
      nestedScrollEnabled={nestedScrollEnabled}
    >
      {combatLog.map(renderCombatLogEntry)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  combatLogContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  combatLogEntry: {
    fontSize: 15,
    marginBottom: 4,
    color: Colors.neutral,
    flexWrap: 'wrap',
  },
}); 