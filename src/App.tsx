import { useState } from 'react';
import { motion } from 'framer-motion';
import { Room } from 'colyseus.js';
import {
  Play, Users, Trophy, Zap, Crown, Sword,
  Settings, User, Shield, Target, Book,
  Layout, BarChart3, Backpack, ShoppingBag
} from 'lucide-react';
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
  const [playerName, setPlayerName] = useState('Operator');
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
  };

  if (gameState !== 'menu') {
    // Current flows (Character Selection, Lobby, etc.)
    if (gameState === 'character-selection') {
      return <CharacterSelection selectedCharacter={selectedCharacter} onCharacterSelect={setSelectedCharacter} onNext={(name) => { setPlayerName(name); setGameState('mode-selection'); }} onBack={handleBackToMenu} playerName={playerName} setPlayerName={setPlayerName} />;
    }
    if (gameState === 'mode-selection') {
      return <GameModeSelection selectedMode={selectedMode} selectedDifficulty={selectedDifficulty} onModeSelect={setSelectedMode} onDifficultySelect={setSelectedDifficulty} onNext={() => setGameState('explainer')} onBack={() => setGameState('character-selection')} />;
    }
    if (gameState === 'explainer') {
      return <GameExplainer onStart={() => setGameState(singlePlayerFlow ? 'single-player' : 'multiplayer-lobby')} onBack={() => setGameState('mode-selection')} />;
    }
    if (gameState === 'single-player' && selectedCharacter && selectedMode && selectedDifficulty) {
      return <SinglePlayerGame character={selectedCharacter} gameMode={selectedMode} difficulty={selectedDifficulty} onGameEnd={handleBackToMenu} />;
    }
    if (gameState === 'multiplayer-lobby' && selectedCharacter && selectedMode && selectedDifficulty) {
      return <EnhancedMultiplayerLobby character={selectedCharacter} gameMode={selectedMode} difficulty={selectedDifficulty} playerName={playerName} setPlayerName={setPlayerName} onGameStart={handleMultiplayerStart} onBack={handleBackToMenu} />;
    }
    if (gameState === 'multiplayer-game' && currentRoom) {
      return <MultiplayerGame room={currentRoom} onGameEnd={handleGameEnd} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30 relative overflow-hidden">
      <Toaster position="top-right" />

      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
        style={{ backgroundImage: 'url("/images/lobby-bg.png")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      <div className="scanline z-0" />

      {/* Top Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2 mr-8">
            <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center font-black text-xl italic shadow-tactical-glow-logo">M</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">Mathey <span className="text-orange-500">Ops</span></span>
          </div>
          <div className="hidden lg:flex items-center space-x-6 text-sm font-bold uppercase tracking-widest text-gray-400">
            <button className="text-white border-b-2 border-orange-500 pb-1 px-2">Play</button>
            <button className="hover:text-white transition-colors px-2">Adventurer Pass</button>
            <button className="hover:text-white transition-colors px-2">Challenges</button>
            <button className="hover:text-white transition-colors px-2">Appearance</button>
            <button className="hover:text-white transition-colors px-2">Store</button>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Currency</p>
              <p className="text-orange-500 font-black">2,450 M</p>
            </div>
            <ShoppingBag className="w-5 h-5 text-orange-500" />
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Settings className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      </nav>

      {/* Main UI Layout */}
      <main className="relative z-10 grid grid-cols-12 gap-8 p-8 h-[calc(100vh-80px)]">

        {/* Left Side: Game Modes */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col space-y-4">
          <div className="mb-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-2">Select Mission</h2>
            <div className="h-[2px] w-12 bg-orange-500" />
          </div>

          <button
            onClick={() => { setSinglePlayerFlow(true); setGameState('character-selection'); }}
            className="tactical-panel p-4 text-left group hover:bg-orange-600/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase text-gray-500">Scenario 01</p>
              <Shield className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="text-xl font-black uppercase italic group-hover:text-orange-500 transition-colors">Training (vs AI)</h3>
            <p className="text-xs text-gray-400 mt-1">Perfect your arithmetic drills against combat-ready bots.</p>
            <div className="mt-4 flex items-center space-x-2 text-[10px] font-bold text-orange-500/80">
              <Target className="w-3 h-3" />
              <span>XP BOOST ACTIVE</span>
            </div>
          </button>

          <button
            onClick={() => { setSinglePlayerFlow(false); setGameState('character-selection'); }}
            className="tactical-panel p-4 text-left group hover:bg-blue-600/10 transition-colors border-l-blue-500 before:bg-blue-500/50"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase text-gray-500">Scenario 02</p>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-xl font-black uppercase italic group-hover:text-blue-500 transition-colors">Multiplayer Ops</h3>
            <p className="text-xs text-gray-400 mt-1">Real-time tactical math engagement with other operators.</p>
            <div className="mt-4 flex items-center space-x-2 text-[10px] font-bold text-blue-500/80">
              <Zap className="w-3 h-3" />
              <span>STABLE CONNECTION</span>
            </div>
          </button>

          <button className="tactical-panel p-4 text-left opacity-60 cursor-not-allowed">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase text-gray-500">Scenario 03</p>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <h3 className="text-xl font-black uppercase italic">Ranked Circuit</h3>
            <p className="text-xs text-gray-400 mt-1">Competitive ladder for elite mathematicians.</p>
            <div className="mt-4 text-[10px] font-bold text-yellow-500">UNDER MAINTENANCE</div>
          </button>
        </aside>

        {/* Center: Character Showcase */}
        <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <img
              src="/images/character-tactical.png"
              alt="Tactical Operator"
              className="max-h-full object-contain drop-shadow-tactical-operator"
            />
            {/* HUD Elements around character */}
            <div className="absolute top-[20%] left-0 w-32 tactical-panel p-2 text-[10px]">
              <p className="text-gray-500 uppercase font-black">Sync Rate</p>
              <p className="text-orange-500 text-lg font-black italic">98.4%</p>
            </div>
            <div className="absolute top-[50%] right-0 w-40 tactical-panel p-2 text-[10px]">
              <p className="text-gray-500 uppercase font-black">Current Loadout</p>
              <p className="text-white text-base font-black italic">Advanced Calc-Mod v4</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Progress & Challenges */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col space-y-6">
          {/* Player Identity */}
          <div className="tactical-panel p-6 bg-gradient-to-br from-black/80 to-orange-950/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <Layout className="w-10 h-10 text-orange-500" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Season 04</h4>
                <p className="text-2xl font-black uppercase italic italic">{playerName}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black">
                <span className="text-gray-400">OPERATOR LEVEL 5</span>
                <span className="text-orange-500">12,450 / 15,000 XP</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-orange-600 w-[83%] shadow-tactical-glow-xp" />
              </div>
            </div>
          </div>

          {/* Daily Challenges */}
          <div className="flex-1 flex flex-col">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-4 px-2">Daily Objectives</h2>
            <div className="space-y-3 overflow-y-auto pr-2">
              <div className="tactical-panel p-3 border-l-orange-500">
                <p className="text-[10px] text-gray-500 font-bold mb-1">Combat Math</p>
                <p className="text-sm font-bold uppercase italic">Solve 50 Lightning Tasks</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex-1 h-1 bg-white/5 rounded-full mr-4">
                    <div className="h-full bg-orange-600 w-[60%]" />
                  </div>
                  <span className="text-[10px] font-black">30/50</span>
                </div>
              </div>

              <div className="tactical-panel p-3 border-l-blue-500 before:bg-blue-500/50">
                <p className="text-[10px] text-gray-500 font-bold mb-1">Tactical Genius</p>
                <p className="text-sm font-bold uppercase italic">Win 3 Chess Mode Games</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex-1 h-1 bg-white/5 rounded-full mr-4">
                    <div className="h-full bg-blue-600 w-[33%]" />
                  </div>
                  <span className="text-[10px] font-black">1/3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social / Battle Buddy */}
          <button className="tactical-panel p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-black uppercase tracking-widest italic">Battle Buddy</span>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </button>
        </aside>
      </main>

      {/* Footer / System Status */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between text-[10px] font-bold text-gray-600 tracking-[0.2em] pointer-events-none">
        <div className="flex items-center space-x-4">
          <span>REGION: ASIA-CENTRAL-01</span>
          <span>PING: 24MS</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-orange-500/50">SYSTEMS NOMINAL // MATHEY ENGINE v2.4.0</span>
          <span>© 2026 MATHEY OPS COMMAND</span>
        </div>
      </footer>
    </div>
  );
}

export default App;