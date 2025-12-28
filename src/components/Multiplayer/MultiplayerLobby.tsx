import React, { useState, useEffect } from 'react';
import { Users, Play, Settings, Crown, Trophy, Clock } from 'lucide-react';
import { colyseusClient, GameOptions, Player } from '../../lib/colyseus-client';
import { Room } from 'colyseus.js';

interface MultiplayerLobbyProps {
  onGameStart: (room: Room) => void;
  onBack: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onGameStart, onBack }) => {
  const [gameMode, setGameMode] = useState<'speed' | 'chess' | 'minecraft'>('speed');
  const [playerLevel, setPlayerLevel] = useState(3);
  const [playerName, setPlayerName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [totalRounds, setTotalRounds] = useState(10);
  const [isJoining, setIsJoining] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [gameStatus, setGameStatus] = useState<string>('waiting');
  const [isReady, setIsReady] = useState(false);

  const gameModeInfo = {
    speed: {
      title: 'Speed Math',
      description: 'Fast-paced arithmetic challenges',
      icon: '⚡',
      color: 'from-yellow-400 to-orange-500'
    },
    chess: {
      title: 'Chess Math',
      description: 'Strategic math with chess themes',
      icon: '♟️',
      color: 'from-purple-400 to-indigo-500'
    },
    minecraft: {
      title: 'Minecraft Math',
      description: 'Adventure math in block world',
      icon: '🧱',
      color: 'from-green-400 to-emerald-500'
    }
  };

  useEffect(() => {
    if (room) {
      // Listen for game state changes
      room.onStateChange((state) => {
        setPlayers(new Map(state.players));
        setGameStatus(state.status);
      });

      // Listen for game messages
      room.onMessage('welcome', (message) => {
        console.log('Welcome:', message);
      });

      room.onMessage('waiting_for_players', (message) => {
        console.log(`Waiting: ${message.ready}/${message.total} players ready`);
      });

      room.onMessage('game_starting', (message) => {
        console.log(`Game starting in ${message.countdown} seconds`);
        setTimeout(() => onGameStart(room), message.countdown * 1000);
      });

      return () => {
        room.removeAllListeners();
      };
    }
  }, [room, onGameStart]);

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }

    setIsJoining(true);
    try {
      const gameOptions: GameOptions = {
        name: playerName,
        level: playerLevel,
        gameMode,
        maxPlayers,
        totalRounds
      };

      const gameRoom = await colyseusClient.joinGame(gameOptions);
      setRoom(gameRoom);
    } catch (error) {
      console.error('Failed to join game:', error);
      alert('Failed to join game. Make sure the server is running!');
    } finally {
      setIsJoining(false);
    }
  };

  const handleReady = () => {
    if (room) {
      colyseusClient.sendReady();
      setIsReady(true);
    }
  };

  const handleLeaveGame = async () => {
    if (room) {
      await colyseusClient.leaveGame();
      setRoom(null);
      setPlayers(new Map());
      setIsReady(false);
    }
  };

  if (room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${gameModeInfo[gameMode].color} text-white font-semibold`}>
              <span className="mr-2 text-xl">{gameModeInfo[gameMode].icon}</span>
              {gameModeInfo[gameMode].title}
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white">
                  {Array.from(players.values()).filter(p => p.connected).length}/{maxPlayers} Players
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white">{totalRounds} Rounds</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-white">Level {playerLevel}</span>
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Players in Lobby
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(players.values()).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    player.ready ? 'bg-green-500/20 border border-green-400' : 'bg-white/5 border border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                    <div>
                      <p className="font-semibold text-white">{player.name}</p>
                      <p className="text-sm text-gray-300">Level {player.level}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    player.ready ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'
                  }`}>
                    {player.ready ? 'Ready' : 'Waiting'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {!isReady ? (
              <button
                onClick={handleReady}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Ready to Play!
              </button>
            ) : (
              <div className="flex items-center px-8 py-3 bg-green-500/20 border border-green-400 text-green-400 font-bold rounded-xl">
                <Play className="w-5 h-5 mr-2" />
                Ready! Waiting for others...
              </div>
            )}
            
            <button
              onClick={handleLeaveGame}
              className="px-6 py-3 bg-red-500/20 border border-red-400 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-all duration-200"
            >
              Leave Lobby
            </button>
          </div>

          {gameStatus === 'starting' && (
            <div className="text-center mt-6">
              <div className="inline-flex items-center px-6 py-3 bg-yellow-500/20 border border-yellow-400 text-yellow-400 font-bold rounded-xl animate-pulse">
                🎮 Game Starting Soon...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Join Multiplayer Game</h1>
          <p className="text-gray-300">Compete with friends in real-time math challenges!</p>
        </div>

        {/* Setup Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          {/* Player Name */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              maxLength={20}
            />
          </div>

          {/* Game Mode Selection */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">Game Mode</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(gameModeInfo).map(([mode, info]) => (
                <button
                  key={mode}
                  onClick={() => setGameMode(mode as any)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    gameMode === mode
                      ? `bg-gradient-to-r ${info.color} border-white text-white`
                      : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
                  }`}
                >
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <div className="font-semibold">{info.title}</div>
                  <div className="text-sm opacity-80">{info.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-white font-semibold mb-2">Your Level</label>
              <select
                value={playerLevel}
                onChange={(e) => setPlayerLevel(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
              >
                {[1,2,3,4,5,6,7,8].map(level => (
                  <option key={level} value={level} className="bg-gray-800">Grade {level}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white font-semibold mb-2">Max Players</label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
              >
                {[2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num} className="bg-gray-800">{num} Players</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white font-semibold mb-2">Total Rounds</label>
              <select
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
              >
                {[5,10,15,20].map(num => (
                  <option key={num} value={num} className="bg-gray-800">{num} Rounds</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleJoinGame}
              disabled={isJoining || !playerName.trim()}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Joining...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 mr-2" />
                  Join Game
                </>
              )}
            </button>
            
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-500/20 border border-gray-400 text-gray-300 font-semibold rounded-xl hover:bg-gray-500/30 transition-all duration-200"
            >
              Back to Menu
            </button>
          </div>
        </div>

        {/* Server Status */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Make sure the Colyseus server is running on localhost:2567
          </p>
        </div>
      </div>
    </div>
  );
};