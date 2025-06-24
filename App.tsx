import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { GameProvider, useGame } from './src/context/GameContext';
import CharacterCreationScreen from './src/screens/CharacterCreationScreen';
import GameScreen from './src/screens/GameScreen';
import { Colors, ColorUtils } from './src/utils/colors';

type GameState = 'loading' | 'character-selection' | 'character-creation' | 'game';

const AppContent: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('loading');
  const { gameState: gameData, currentCharacter, selectCharacter, deleteCharacter, isLoading } = useGame();

  React.useEffect(() => {
    if (!isLoading) {
      if (gameData.characters.length === 0) {
        setGameState('character-creation');
      } else if (!currentCharacter) {
        setGameState('character-selection');
      } else {
        setGameState('game');
      }
    }
  }, [isLoading, gameData.characters.length, currentCharacter]);

  const handleCharacterCreated = () => {
    setGameState('game');
  };

  const handleCharacterSelected = (characterId: string) => {
    selectCharacter(characterId);
    setGameState('game');
  };

  const handleLogout = () => {
    setGameState('character-selection');
  };

  const handleDeleteCharacter = (characterId: string) => {
    Alert.alert(
      'Delete Character',
      'Are you sure you want to delete this character? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCharacter(characterId);
            if (gameData.characters.length <= 1) {
              setGameState('character-creation');
            }
          }
        }
      ]
    );
  };

  if (isLoading || gameState === 'loading') {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Auto-Battler RPG...</Text>
      </View>
    );
  }

  if (gameState === 'character-creation') {
    return <CharacterCreationScreen onCharacterCreated={handleCharacterCreated} />;
  }

  if (gameState === 'character-selection') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Auto-Battler RPG</Text>
          <Text style={styles.subtitle}>Select Your Champion</Text>
        </View>

        <ScrollView style={styles.characterList}>
          {gameData.characters.map((character) => (
            <TouchableOpacity
              key={character.id}
              style={styles.characterCard}
              onPress={() => handleCharacterSelected(character.id)}
            >
              <View style={styles.characterInfo}>
                <Text style={styles.characterName}>{character.name}</Text>
                <Text style={styles.characterClass}>
                  Level {character.level} {character.class.name}
                </Text>
                <View style={styles.characterStats}>
                  <Text style={styles.statText}>Gold: {character.gold}</Text>
                  <Text style={styles.statText}>
                    W/L: {character.wins}/{character.losses}
                  </Text>
                  <Text style={styles.statText}>
                    Energy: {character.energy}/{character.maxEnergy}
                  </Text>
                </View>
                <Text style={styles.lastActive}>
                  Last active: {new Date(character.lastActive).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteCharacter(character.id);
                }}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.createNewButton}
          onPress={() => setGameState('character-creation')}
        >
          <Text style={styles.createNewButtonText}>Create New Character</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gameState === 'game') {
    return <GameScreen onLogout={handleLogout} />;
  }

  return null;
};

export default function App() {
  return (
    <GameProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <AppContent />
      </View>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 100,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  characterList: {
    flex: 1,
    padding: 20,
  },
  characterCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterClass: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 8,
    fontWeight: '600',
  },
  characterStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  lastActive: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.error,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  deleteButtonText: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: 'bold',
  },
  createNewButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 18,
    margin: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  createNewButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.background,
    letterSpacing: 0.5,
  },
});
