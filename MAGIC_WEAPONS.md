# Magic Weapon System

## Overview
The Land of Nomads features a sophisticated weapon system with a special focus on magical weapons. This document outlines the various aspects of weapons, their properties, and how they interact with character stats and combat mechanics.

## Weapon Categories

### 1. Physical Weapons
- **Strength-based**: High damage, slower speed (e.g., Berserker Axe)
- **Critical-focused**: High crit chance, medium damage (e.g., Assassin's Dagger)
- **Speed-based**: Fast attack speed, lower damage (e.g., Twin Blades)

### 2. Magical Weapons
Magical weapons are special armaments that scale with the Intelligence stat. They are identified by the `isMagicWeapon` property and often come with unique properties:

#### Notable Magical Weapons:
- **Mystic Staff**: Two-handed staff with pure Intelligence scaling
- **Crystal Wand**: One-handed wand with Intelligence and Speed scaling
- **Archmage's Rod**: Advanced magical weapon with Constitution bonus
- **Staff of Eternal Fire**: Legendary staff with both Intelligence and Strength scaling

## Weapon Properties

### Core Stats
- `damage`: Base damage of the weapon
- `weaponSpeed`: Attack speed modifier (higher = faster)
- `criticalChance`: Chance to land critical hits
- `handedness`: Can be 'one-handed' or 'two-handed'

### Magic-Specific Properties
- `isMagicWeapon`: Boolean flag indicating magical scaling
- `magicDamageBonus`: Additional magical damage modifier
- `statBonus`: Stat modifications (particularly Intelligence for magic weapons)

## Rarity System
Weapons come in five rarity tiers, each offering progressively better stats:
1. Common
2. Uncommon
3. Rare
4. Epic
5. Legendary

## Build Synergies

### Intelligence Builds
- Focus on magical weapons
- High Intelligence stat scaling
- Often include secondary bonuses to Constitution or Speed
- Best with magic-enhancing gems

### Hybrid Builds
Some weapons support hybrid builds:
- Staff of Eternal Fire (Intelligence + Strength)
- Crystal Wand (Intelligence + Speed)
- Archmage's Rod (Intelligence + Constitution)

## Weapon Enhancement

### Gem System Integration
- Weapons can be enhanced with gems
- Different gem types provide various bonuses
- Gem effects stack with weapon's inherent properties

## Combat Mechanics

### Damage Calculation
For magic weapons:
- Base damage is modified by Intelligence stat
- Additional magic damage bonus applies
- Critical hits multiply final damage

### Speed System
- Weapon speed affects turn order in combat
- Faster weapons allow more frequent attacks
- Two-handed weapons generally slower but more powerful

## Tips for Players
1. Match weapon type to your build focus
2. Consider handedness when planning equipment loadout
3. Balance speed vs damage based on playstyle
4. Use gems to enhance weapon strengths

## Example Builds

### Pure Mage
- Main hand: Staff of Eternal Fire
- Focus: Maximum Intelligence scaling
- Gems: Intelligence/Magic damage focus

### Battle Mage
- Main hand: Archmage's Rod
- Off hand: Magic-enhancing shield/book
- Focus: Balance of damage and survivability

### Speed Caster
- Main hand: Crystal Wand
- Focus: Quick casting and mobility
- Gems: Speed/Intelligence combination 