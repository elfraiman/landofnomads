import { QuestDefinition } from '../types';

export const questDefinitions: QuestDefinition[] = [
  // Greenwood Valley quests
  {
    id: 'gv_kill_50_wolves',
    mapId: 'greenwood_valley',
    name: 'Wolf Menace',
    description: 'The villagers are troubled by aggressive wolves. Defeat 50 Wolves to ensure their safety.',
    type: 'kill',
    target: 'gray_wolf', // Monster id assumed
    goal: 50,
    rewards: [
      { type: 'experience', amount: 500 },
      { type: 'gold', amount: 300 },
    ],
  },
  {
    id: 'gv_kill_20_orcs',
    mapId: 'greenwood_valley',
    name: 'Orc Rampage',
    description: 'Orc raiders haunt the outskirts. Eliminate 20 Orcs to restore peace.',
    type: 'kill',
    target: 'orc_warrior',
    goal: 20,
    rewards: [
      { type: 'experience', amount: 800 },
      { type: 'gold', amount: 500 },
    ],
  }
];

export const getQuestsForMap = (mapId: string): QuestDefinition[] => {
  return questDefinitions.filter(q => q.mapId === mapId);
}; 