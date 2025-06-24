# Auto-Battler RPG

A browser-based, text-only, auto-battler RPG inspired by bots2.net. Built with React Native Web and TypeScript.

## Features

### Core Gameplay
- **Character Creation**: Choose from 6 different classes (Warrior, Rogue, Mage, Paladin, Berserker, Archer)
- **Stat Training**: Train 5 core stats (Strength, Dexterity, Constitution, Intelligence, Speed)
- **Auto-Combat**: Fully automated turn-based battles against AI opponents
- **Equipment System**: Weapons, armor, and accessories with stat bonuses
- **Experience & Leveling**: Gain XP from battles and level up for stat increases

### Game Systems
- **Energy System**: Training costs energy, regenerates over time
- **Gold Economy**: Earn gold from victories, spend on training
- **Battle History**: Track your wins, losses, and combat records
- **Local Persistence**: All data saved locally using AsyncStorage

### Character Classes

#### Warrior
- **Focus**: High health and physical damage
- **Primary Stat**: Strength
- **Playstyle**: Tank/Melee fighter

#### Rogue
- **Focus**: Speed and critical hits
- **Primary Stat**: Dexterity  
- **Playstyle**: Fast assassin with high dodge

#### Mage
- **Focus**: High intelligence and magical damage
- **Primary Stat**: Intelligence
- **Playstyle**: Glass cannon spellcaster

#### Paladin
- **Focus**: Balanced offense and defense
- **Primary Stat**: Constitution
- **Playstyle**: Well-rounded holy warrior

#### Berserker
- **Focus**: Extreme damage, low defense
- **Primary Stat**: Strength
- **Playstyle**: High risk, high reward

#### Archer
- **Focus**: Ranged combat with high accuracy
- **Primary Stat**: Dexterity
- **Playstyle**: Precision striker

## Combat Mechanics

### Turn-Based System
- Turn order determined by Speed stat
- Each character attacks until one is defeated
- Maximum 100 rounds to prevent infinite battles

### Damage Calculation
- Base damage from Strength (or Intelligence for mages)
- Equipment provides additional damage bonuses
- Armor reduces incoming damage with diminishing returns
- Critical hits deal double damage

### Success Factors
- **Accuracy**: Base 50% + 2% per Dexterity point
- **Dodge**: 1% per 15 Dexterity points
- **Critical Chance**: 1% per 10 Dexterity points
- **Health**: 100 base + 5 per Constitution point

## Training System

### Stat Training
- Costs energy and gold (increases with stat level)
- 30-minute cooldown between training sessions
- Success rate decreases as stats get higher (95% base, -2% per stat point)
- 10% chance for critical success (double gain)

### Energy Management
- Training costs 20+ energy (scales with stat level)
- Maximum 100 energy
- Regenerates 10 energy every 5 minutes
- Strategic resource management required

## Technical Architecture

### Technology Stack
- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type-safe development
- **Expo**: Development and build tooling
- **AsyncStorage**: Local data persistence

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── character/      # Character-related components
│   ├── combat/         # Battle system components
│   └── ui/             # Basic UI elements
├── context/            # Global state management
├── data/               # Game data (classes, items)
├── screens/            # Main game screens
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

### Key Systems
- **GameContext**: Centralized state management with React Context
- **Combat Engine**: Turn-based battle simulation with detailed logging
- **Character System**: Stats, equipment, and progression
- **Persistence Layer**: Automatic saving/loading with AsyncStorage

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-battler-rpg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run web
   ```

4. **Open in browser**
   - Navigate to `http://localhost:8081` (or the port shown in terminal)

## Game Flow

1. **Character Creation**
   - Enter character name
   - Select class (view stats and growth multipliers)
   - Receive starter equipment

2. **Main Game Loop**
   - **Stats Tab**: View character overview and combat effectiveness
   - **Training Tab**: Improve stats using energy and gold
   - **Combat Tab**: Fight AI opponents for XP and gold
   - **Equipment Tab**: View current gear and bonuses

3. **Progression**
   - Win battles to gain experience and gold
   - Level up for automatic stat increases
   - Train specific stats for targeted growth
   - Manage energy and cooldowns strategically

## Future Enhancements

### Planned Features
- **Shop System**: Buy and sell equipment
- **Clan System**: Join guilds for bonuses and social features
- **Quest System**: Daily challenges and objectives
- **Leaderboards**: Compete with other players
- **Item Durability**: Equipment degrades with use
- **PvP Combat**: Battle other players' characters

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live features
- **Cloud Saves**: Cross-device character synchronization
- **Advanced Combat**: More complex battle mechanics
- **Mobile Optimization**: Enhanced mobile UI/UX

## Development

### Key Files
- `App.tsx`: Main application entry point
- `src/context/GameContext.tsx`: Central game state management
- `src/utils/combatEngine.ts`: Combat simulation logic
- `src/data/classes.ts`: Character class definitions
- `src/data/items.ts`: Equipment and item system

### Adding New Features
1. Define types in `src/types/index.ts`
2. Add data to appropriate files in `src/data/`
3. Implement logic in `src/utils/` or context
4. Create UI components in `src/components/`
5. Update screens as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. 