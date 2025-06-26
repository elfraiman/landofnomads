# 💎 Gem System - Land of Nomads

## Overview

The Gem System adds valuable rare items that drop from monsters, providing temporary stat boosts and an exciting fusion mechanic. This system is designed to keep every gem drop valuable throughout the entire game progression.

## Core Mechanics

### 🎯 Gem Types
- **Ruby** 🔴 - Boosts Strength (Physical damage)
- **Sapphire** 🔵 - Boosts Constitution (Health)
- **Emerald** 🟢 - Boosts Intelligence (Magic power)
- **Diamond** ⚪ - Boosts Dexterity (Accuracy/dodge)
- **Opal** 🟣 - Boosts Speed (Turn frequency)

### ⭐ Gem Tiers
1. **Flawed** - 0.5x power, 5 battles duration
2. **Normal** - 1.0x power, 10 battles duration
3. **Greater** - 2.0x power, 15 battles duration
4. **Perfect** - 4.0x power, 25 battles duration
5. **Legendary** - 8.0x power, 50 battles duration

### 🔮 Fusion System
- **2 gems** of same type and tier → 1 gem of next tier
- Fusion preserves gem type but upgrades tier
- Higher tiers provide exponentially more power and duration
- No upper limit - gems remain valuable forever

## Drop Mechanics

### 📊 Drop Rates
- **Base Rate**: 5% per monster kill
- **Rare Monsters**: Up to 9% drop chance
- **Level Scaling**: Higher level monsters drop higher tier gems more frequently

### 🎲 Rarity Distribution
Gem tier chances scale with monster level:
- Low level monsters: Mostly Flawed/Normal gems
- High level monsters: Better chance for Greater/Perfect gems
- Boss monsters: Small chance for Legendary gems

## Consumption System

### ⚔️ Temporary Boosts
- Gems provide temporary stat increases for multiple battles
- Effects apply BEFORE diminishing returns calculation
- Multiple gem effects can stack
- Duration decreases after each battle

### 📈 Power Scaling
Each gem tier provides increasingly powerful effects:
- **Flawed Ruby**: +2 Strength for 5 battles
- **Normal Ruby**: +4 Strength for 10 battles
- **Perfect Ruby**: +16 Strength for 25 battles
- **Legendary Ruby**: +32 Strength for 50 battles

## UI Features

### 💎 Gem Tab
- **Inventory View**: Browse all gems, grouped by type/tier
- **Active Effects**: View currently active gem boosts
- **Guide**: Complete reference for gem types and mechanics

### 🔄 Fusion Interface
- Select multiple gems for fusion
- Visual feedback for valid fusion combinations
- Detailed preview of fusion results
- One-click fusion for gem stacks

### 🎨 Visual Design
- Rarity-based color coding
- Gem type-specific emoji icons
- Stack counters for multiple gems
- Glowing effects for special notifications

## Strategic Depth

### 🤔 Decision Making
Players must choose between:
- **Immediate Power**: Consume gems now for current battles
- **Long-term Investment**: Save gems for fusion into powerful upgrades
- **Build Optimization**: Match gem types to character strengths

### 📊 Progression Scaling
- Early game: Single gems provide meaningful boosts
- Mid game: Fusion becomes important for competitive advantages
- Late game: Legendary gems provide massive power spikes

## Technical Implementation

### 🏗️ Architecture
- **Type-safe**: Full TypeScript integration
- **Persistent**: Gems save/load with character data
- **Combat Integration**: Seamless stat modification system
- **Notification System**: Special alerts for gem drops and actions

### 🔧 Key Components
- `GemTab.tsx`: Main UI interface
- `gems.ts`: Data definitions and utility functions
- `combatEngine.ts`: Stat application and battle integration
- `GameContext.tsx`: State management and persistence

### 📱 Mobile Optimized
- Responsive grid layout
- Touch-friendly buttons
- Intuitive gesture support
- Performance optimized for large inventories

## Balance Philosophy

### 🎯 Design Goals
1. **Evergreen Value**: Every gem drop should feel rewarding
2. **Strategic Depth**: Meaningful choices between consumption and fusion
3. **Power Progression**: Clear upgrade paths throughout the game
4. **Build Diversity**: Support for different character builds

### ⚖️ Balance Considerations
- Gem effects are temporary to prevent permanent power creep
- Fusion requires resource investment (multiple gems)
- Drop rates balanced to feel rare but not frustrating
- Stat bonuses scale with existing character progression

## Future Enhancements

### 🚀 Potential Features
- **Gem Socketing**: Permanent gem slots in high-tier equipment
- **Set Bonuses**: Special effects for using multiple gem types
- **Gem Crafting**: Combine different gem types for unique effects
- **Gem Trading**: Player-to-player gem exchange system
- **Legendary Effects**: Special abilities for highest-tier gems

### 🎮 Content Expansions
- New gem types for additional stats
- Rare gem variants with special properties
- Gem-specific quests and achievements
- Seasonal gem events with unique rewards

## Conclusion

The Gem System adds a compelling layer of progression and decision-making to Land of Nomads. By ensuring every gem drop remains valuable through the fusion system, players always have reasons to engage with monster hunting and strategic resource management. The system scales elegantly from early game excitement to late game optimization, providing lasting engagement throughout the player's journey. 