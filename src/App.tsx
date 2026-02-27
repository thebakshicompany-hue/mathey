import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import LandingPage from './LandingPage';
import { CharacterSelection } from './components/CharacterSelection';
import { GameModeSelection } from './components/GameModeSelection';
import { EnhancedMultiplayerLobby } from './components/Multiplayer/EnhancedMultiplayerLobby';
import { MultiplayerGame } from './components/Multiplayer/MultiplayerGame';
import { SinglePlayerGame } from './components/SinglePlayer/SinglePlayerGame';
import { Character, GameMode, DifficultyLevel } from './types/game';
import { Room } from 'colyseus.js';

type GameState = 'landing' | 'character-selection' | 'mode-selection' | 'lobby' | 'game';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [playerName, setPlayerName] = useState('OPERATOR_X');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);

  const handleGameStart = (room: Room) => {
    setActiveRoom(room);
    setGameState('game');
  };

  const renderScreen = () => {
    switch (gameState) {
      case 'landing':
        return (
          <LandingPage
            playerName={playerName}
            setGameState={(state) => setGameState(state as GameState)}
            setSinglePlayerFlow={setIsSinglePlayer}
          />
        );
      case 'character-selection':
        return (
          <CharacterSelection
            selectedCharacter={selectedCharacter}
            onCharacterSelect={setSelectedCharacter}
            onNext={(name) => {
              setPlayerName(name);
              setGameState('mode-selection');
            }}
            onBack={() => setGameState('landing')}
            playerName={playerName}
            setPlayerName={setPlayerName}
          />
        );
      case 'mode-selection':
        return (
          <GameModeSelection
            selectedMode={selectedMode}
            selectedDifficulty={selectedDifficulty}
            onModeSelect={setSelectedMode}
            onDifficultySelect={setSelectedDifficulty}
            onNext={() => {
              if (isSinglePlayer) {
                setGameState('game');
              } else {
                setGameState('lobby');
              }
            }}
            onBack={() => setGameState('character-selection')}
          />
        );
      case 'lobby':
        if (!selectedCharacter || !selectedMode || !selectedDifficulty) {
          setGameState('landing');
          return null;
        }
        return (
          <EnhancedMultiplayerLobby
            character={selectedCharacter}
            gameMode={selectedMode}
            difficulty={selectedDifficulty}
            playerName={playerName}
            setPlayerName={setPlayerName}
            onGameStart={handleGameStart}
            onBack={() => setGameState('mode-selection')}
          />
        );
      case 'game':
        if (isSinglePlayer) {
          if (!selectedCharacter || !selectedMode || !selectedDifficulty) {
            setGameState('landing');
            return null;
          }
          return (
            <SinglePlayerGame
              character={selectedCharacter}
              gameMode={selectedMode}
              difficulty={selectedDifficulty}
              onGameEnd={() => setGameState('landing')}
            />
          );
        }

        if (!activeRoom) {
          setGameState('landing');
          return null;
        }
        return (
          <MultiplayerGame
            room={activeRoom}
            onGameEnd={() => {
              setActiveRoom(null);
              setGameState('landing');
            }}
          />
        );
      default:
        return <LandingPage playerName={playerName} setGameState={setGameState} setSinglePlayerFlow={setIsSinglePlayer} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      {renderScreen()}
    </>
  );
};

export default App;
