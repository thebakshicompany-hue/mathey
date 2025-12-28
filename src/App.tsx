import { useState } from 'react';
import { motion } from 'framer-motion';
import { Room } from 'colyseus.js';
import { Play, Users, Trophy, Gamepad2, Zap, Crown, Sword, BookOpen } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Components
import { CharacterSelection } from './components/CharacterSelection';
import { GameModeSelection } from './components/GameModeSelection';
import { GameExplainer } from './components/GameExplainer';
import { SinglePlayerGame } from './components/SinglePlayer/SinglePlayerGame';
import { EnhancedMultiplayerLobby } from './components/Multiplayer/EnhancedMultiplayerLobby';
import { MultiplayerGame } from './components/Multiplayer/MultiplayerGame';

// Types
import { Character, GameMode, DifficultyLevel } from './types/game';

type GameState = 
  | 'menu' 
  | 'character-selection' 
  | 'mode-selection' 
  | 'explainer' 
  | 'multiplayer-lobby' 
  | 'multiplayer-game' 
  | 'single-player';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [singlePlayerFlow, setSinglePlayerFlow] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const handleMultiplayerStart = (room: Room) => {
    setCurrentRoom(room);
    setGameState('multiplayer-game');
  };

  const handleGameEnd = () => {
    setCurrentRoom(null);
    setGameState('menu');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
    setSelectedCharacter(null);
    setSelectedMode(null);
    setSelectedDifficulty(null);
    setSinglePlayerFlow(false);
    setPlayerName('');
  };

  // Character Selection Flow
  if (gameState === 'character-selection') {
    return (
      <CharacterSelection
        selectedCharacter={selectedCharacter}
        onCharacterSelect={setSelectedCharacter}
        onNext={(name) => {
          setPlayerName(name);
          setGameState('mode-selection');
        }}
        onBack={handleBackToMenu}
        playerName={playerName}
        setPlayerName={setPlayerName}
      />
    );
  }

  // Game Mode Selection Flow
  if (gameState === 'mode-selection') {
    return (
      <GameModeSelection
        selectedMode={selectedMode}
        selectedDifficulty={selectedDifficulty}
        onModeSelect={setSelectedMode}
        onDifficultySelect={setSelectedDifficulty}
        onNext={() => setGameState('explainer')}
        onBack={() => setGameState('character-selection')}
      />
    );
  }

  // Game Explainer Flow
  if (gameState === 'explainer') {
    return (
      <GameExplainer
        onStart={() => setGameState(singlePlayerFlow ? 'single-player' : 'multiplayer-lobby')}
        onBack={() => setGameState('mode-selection')}
      />
    );
  }

  // Single Player Game
  if (gameState === 'single-player' && selectedCharacter && selectedMode && selectedDifficulty) {
    return (
      <SinglePlayerGame
        character={selectedCharacter}
        gameMode={selectedMode}
        difficulty={selectedDifficulty}
        onGameEnd={handleBackToMenu}
      />
    );
  }

  // Multiplayer Lobby
  if (gameState === 'multiplayer-lobby' && selectedCharacter && selectedMode && selectedDifficulty) {
    return (
      <EnhancedMultiplayerLobby
        character={selectedCharacter}
        gameMode={selectedMode}
        difficulty={selectedDifficulty}
        playerName={playerName || selectedCharacter.name}
        setPlayerName={setPlayerName} // Pass the setter
        onGameStart={handleMultiplayerStart}
        onBack={handleBackToMenu}
      />
    );
  }

  // Multiplayer Game
  if (gameState === 'multiplayer-game' && currentRoom) {
    return (
      <MultiplayerGame
        room={currentRoom}
        onGameEnd={handleGameEnd}
      />
    );
  }

  // Main Menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="text-center">
            {/* Logo */}
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center transform rotate-12 shadow-2xl">
                  <span className="text-4xl font-bold text-white">M</span>
                </div>
                <motion.div 
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.h1 
              className="text-6xl md:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Mathey
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The Ultimate Multiplayer Math Adventure
            </motion.p>
            
            <motion.p 
              className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Choose your character, master different game modes, and battle friends in real-time math challenges!
            </motion.p>

            {/* Game Mode Previews */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Speed Lightning</h3>
                <p className="text-gray-300 text-sm">Lightning-fast arithmetic challenges that test your quick thinking skills</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Chess Master</h3>
                <p className="text-gray-300 text-sm">Strategic mathematical puzzles combined with chess-themed challenges</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sword className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Block Builder</h3>
                <p className="text-gray-300 text-sm">Adventure-based problems in a familiar block-building world</p>
              </motion.div>
            </motion.div>

            {/* Main Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <motion.button
                onClick={() => {
                  setPlayerName('Player');
                  setGameState('character-selection');
                }}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6" />
                  <span>Start Multiplayer Adventure</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setSinglePlayerFlow(true);
                  setGameState('character-selection');
                }}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-2xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center space-x-3">
                  <Play className="w-6 h-6" />
                  <span>Practice Mode</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </motion.button>
            </motion.div>

            {/* How to Play Button */}
            <motion.button
              onClick={() => {
                setSinglePlayerFlow(true);
                setGameState('character-selection');
              }}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              How to Play
            </motion.button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div 
        className="py-20 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Mathey?</h2>
            <p className="text-xl text-gray-300">Experience math like never before with our innovative features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-blue-400/30 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-Time Multiplayer</h3>
              <p className="text-gray-300">Compete with up to 6 players simultaneously in fast-paced math battles with live chat</p>
            </motion.div>
            
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Unique Characters</h3>
              <p className="text-gray-300">Choose from 8 unique characters, each with special abilities and personalities</p>
            </motion.div>
            
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-yellow-400/30 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Multiple Difficulty Levels</h3>
              <p className="text-gray-300">From beginner to expert - adaptive difficulty that grows with your skills</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Server Status */}
      <motion.div 
        className="pb-20 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
      >
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <motion.div 
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-white font-semibold">Multiplayer Server Status</span>
            </div>
            <p className="text-gray-300 text-sm">
              Server running on localhost:2567
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Make sure your Colyseus server is running to access multiplayer features
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default App;