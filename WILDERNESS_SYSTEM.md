# Wilderness & Tile System Guide

## Overview
The wilderness system provides a flexible, extensible framework for creating interactive maps with unique tiles, NPCs, features, and dynamic events. Each map can have its own monsters, terrain, and special mechanics.

## Architecture

### Core Components
- **WildernessMap**: Contains tiles, monsters, and map metadata
- **WildernessTile**: Individual map locations with features, NPCs, and spawned monsters
- **TileFeature**: Extensible features like portals, shops, shrines
- **TileNPC**: Interactive characters with dialogue and services
- **MapConfig**: Configuration for each map including monsters and requirements

## Adding New Tile Features

### 1. Define Feature Type
Add your feature type to `src/types/wilderness.ts`:

```typescript
export type TileFeatureType = 
  | 'portal'
  | 'shop'
  | 'shrine'
  | 'treasure'
  | 'trap'
  | 'resource'
  | 'quest_marker'
  | 'rest_area'
  | 'blacksmith'     // ← Add new types here
  | 'tavern'
  | 'training_ground';
```

### 2. Create Feature Data
Add features to tiles in map generation functions (`src/data/wilderness.ts`):

```typescript
// Example: Adding a blacksmith to a village
const tile: WildernessTile = {
  // ... other tile properties
  features: [
    {
      id: 'village_blacksmith',
      type: 'blacksmith',
      name: 'Village Forge',
      description: 'A skilled blacksmith who can upgrade your equipment.',
      isActive: true,
      data: {
        upgradeChance: 0.8,
        costMultiplier: 1.5,
        maxUpgradeLevel: 3
      }
    }
  ]
};
```

### 3. Handle Feature Interactions
Add interaction logic in `WildernessTab.tsx`:

```typescript
const handleTilePress = async (x: number, y: number) => {
  // ... existing code
  
  const blacksmith = tile.features?.find(f => f.type === 'blacksmith' && f.isActive);
  if (blacksmith) {
    showAlert(
      'Blacksmith Available',
      'Would you like to upgrade your equipment?',
      [
        { text: 'Upgrade Equipment', onPress: () => handleBlacksmithUpgrade(blacksmith) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  }
};
```

## Adding NPCs

### 1. Define NPC Type
Add NPC types to `src/types/wilderness.ts`:

```typescript
export type NPCType = 
  | 'merchant'
  | 'healer'
  | 'guard'
  | 'quest_giver'
  | 'portal_keeper'
  | 'villager'
  | 'trainer'        // ← Add new NPC types
  | 'informant'
  | 'collector';
```

### 2. Create NPCs
Add NPCs to tiles during map generation:

```typescript
// Example: Adding a trainer NPC
npcs: [{
  id: 'combat_trainer',
  name: 'Master Swordsman',
  type: 'trainer',
  dialogue: [
    'I can teach you advanced combat techniques.',
    'Training costs gold but grants permanent stat bonuses.',
    'Are you ready to become stronger?'
  ],
  services: [
    {
      id: 'strength_training',
      name: 'Strength Training',
      type: 'training',
      cost: 500,
      data: { statType: 'strength', bonus: 2 }
    },
    {
      id: 'speed_training', 
      name: 'Agility Training',
      type: 'training',
      cost: 400,
      data: { statType: 'speed', bonus: 1 }
    }
  ]
}]
```

### 3. Handle NPC Services
Implement service handlers in `GameContext.tsx`:

```typescript
const handleNPCService = (npc: TileNPC, service: NPCService) => {
  switch (service.type) {
    case 'training':
      return handleTrainingService(service);
    case 'shop':
      return handleShopService(service);
    case 'heal':
      return handleHealService(service);
    // Add new service types here
  }
};
```

## Creating Dynamic Events

### 1. Define Event System
Create `src/types/events.ts`:

```typescript
export interface DynamicEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  duration: number; // milliseconds
  startTime: number;
  endTime: number;
  conditions: EventCondition[];
  effects: EventEffect[];
  isActive: boolean;
}

export type EventType = 
  | 'monster_surge'
  | 'treasure_spawn'
  | 'merchant_visit'
  | 'weather_change'
  | 'bonus_experience';

export interface EventCondition {
  type: 'time' | 'level' | 'location' | 'random';
  value: any;
}

export interface EventEffect {
  type: 'spawn_rate' | 'loot_bonus' | 'experience_bonus';
  multiplier: number;
  duration?: number;
}
```

### 2. Event Manager
Create `src/utils/eventManager.ts`:

```typescript
export class EventManager {
  private events: DynamicEvent[] = [];
  
  startEvent(event: DynamicEvent) {
    event.isActive = true;
    event.startTime = Date.now();
    event.endTime = Date.now() + event.duration;
    this.events.push(event);
  }
  
  updateEvents() {
    const now = Date.now();
    this.events = this.events.filter(event => {
      if (event.endTime <= now) {
        this.endEvent(event);
        return false;
      }
      return true;
    });
  }
  
  getActiveEvents(tileId?: string): DynamicEvent[] {
    return this.events.filter(event => 
      event.isActive && this.checkConditions(event, tileId)
    );
  }
}
```

### 3. Integrate Events
Add event handling to tiles:

```typescript
// In wilderness generation or update logic
const activeEvents = eventManager.getActiveEvents(tile.id);

// Apply event effects
activeEvents.forEach(event => {
  event.effects.forEach(effect => {
    switch (effect.type) {
      case 'spawn_rate':
        tile.spawnRate *= effect.multiplier;
        break;
      case 'loot_bonus':
        // Modify loot generation
        break;
    }
  });
});
```

## Map-Specific Mechanics

### 1. Create Map-Specific Terrain
In `src/data/wilderness.ts`, create unique terrain functions:

```typescript
const getVolcanicTerrain = (x: number, y: number) => {
  // Volcanic-specific logic
  const hasLavaFlow = Math.random() < 0.3;
  
  return {
    type: hasLavaFlow ? 'lava' : 'mountain',
    features: hasLavaFlow ? [{
      id: 'lava_flow',
      type: 'trap',
      name: 'Lava Flow',
      description: 'Dangerous molten rock that damages players.',
      isActive: true,
      data: { damage: 10, damageType: 'fire' }
    }] : undefined
  };
};
```

### 2. Custom Tile Rendering
Extend `TileComponent.tsx` for map-specific visuals:

```typescript
const getTileIcon = () => {
  // Map-specific tile rendering
  if (tile.mapId === 'volcanic_peaks') {
    switch (tile.type) {
      case 'lava': return '🌋';
      case 'mountain': return '⛰️';
    }
  }
  
  // Default rendering...
};
```

## Best Practices

### Performance
- Use lazy loading for large maps
- Cache frequently accessed tile data
- Batch update operations

### Extensibility
- Keep feature data flexible with `any` type
- Use composition over inheritance
- Make features toggleable with `isActive`

### User Experience
- Provide clear visual indicators for interactive elements
- Show tooltips for complex features
- Implement smooth transitions between maps

## Example: Complete Feature Implementation

```typescript
// 1. Add to types
export type TileFeatureType = 'mining_node';

// 2. Create feature
const miningNode: TileFeature = {
  id: 'iron_vein',
  type: 'mining_node',
  name: 'Iron Vein',
  description: 'A rich deposit of iron ore.',
  isActive: true,
  data: {
    resource: 'iron_ore',
    quantity: 5,
    respawnTime: 300000, // 5 minutes
    lastMined: 0
  }
};

// 3. Handle interaction
const handleMining = (feature: TileFeature) => {
  const now = Date.now();
  const canMine = now - feature.data.lastMined > feature.data.respawnTime;
  
  if (canMine) {
    addItemToInventory({
      id: 'iron_ore',
      name: 'Iron Ore',
      type: 'resource',
      quantity: feature.data.quantity
    });
    feature.data.lastMined = now;
  }
};

// 4. Visual indicator
const getMiningIcon = () => feature.data.lastMined === 0 ? '⛏️' : '🕳️';
```

This system provides infinite extensibility while maintaining clean, organized code. Each feature is self-contained and can be easily added, modified, or removed without affecting other systems. 