import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Crown, Trophy, Clock, Zap } from 'lucide-react';
import { Room } from 'colyseus.js';
import { colyseusClient, GameOptions, Player, getRoomId } from '../../lib/colyseus-client';
import { Character, GameMode, DifficultyLevel, Player as GamePlayer, ChatMessage } from '../../types/game';
import { ChatSystem } from '../Chat/ChatSystem';
import toast from 'react-hot-toast';

interface EnhancedMultiplayerLobbyProps {
  character: Character;
  gameMode: GameMode;
  difficulty: DifficultyLevel;
  playerName: string;
  setPlayerName: (name: string) => void; // Add this prop
  onGameStart: (room: Room) => void;
  onBack: () => void;
}

export const EnhancedMultiplayerLobby: React.FC<EnhancedMultiplayerLobbyProps> = ({
  character,
  gameMode,
  difficulty,
  playerName,
  onGameStart,
  onBack
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [gameStatus, setGameStatus] = useState<string>('waiting');
  const [isReady, setIsReady] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Automatically join a game if no room is active
    if (!room) {
      joinGame();
    }
    return () => {
      if (room) {
        room.leave();
      }
    };
  }, [room]);

  useEffect(() => {
    if (room) {
      // Listen for game state changes
      room.onStateChange((state) => {
        setPlayers(new Map(state.players));
        setGameStatus(state.status);
      });

      // Listen for game messages
      room.onMessage('welcome', () => {
        toast.success(`Welcome to ${gameMode.name}!`);
        addSystemMessage(`${playerName} joined the game`);
      });

      room.onMessage('player_joined', (message) => {
        addSystemMessage(`${message.playerName} joined the game`);
      });

      room.onMessage('player_left', (message) => {
        addSystemMessage(`${message.playerName} left the game`);
      });

      room.onMessage('waiting_for_players', (message) => {
        console.log(`Waiting: ${message.ready}/${message.total} players ready`);
      });

      room.onMessage('game_starting', (message) => {
        setCountdown(message.countdown);
        toast.success('Game starting!');
        
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              onGameStart(room);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      });

      room.onMessage('chat_message', (message) => {
        addChatMessage(message.playerId, message.playerName, message.message);
      });

      return () => {
        room.removeAllListeners();
      };
    }
  }, [room, gameMode.name, playerName, onGameStart]);

  const joinGame = async () => {
    setIsJoining(true);
    try {
      const gameRoom = await colyseusClient.joinGame({
        name: playerName,
        level: parseInt(difficulty.gradeRange.split(' ')[1].split('-')[0]),
        gameMode: gameMode.id as 'speed' | 'chess' | 'minecraft',
        character: character.id,
        maxPlayers: 6,
        totalRounds: 10
      });
      setRoom(gameRoom);
    } catch (error) {
      console.error('Failed to join game:', error);
      toast.error('Failed to join game. Make sure the server is running!');
    } finally {
      setIsJoining(false);
    }
  };

  const handleReady = () => {
    if (room) {
      colyseusClient.sendReady();
      setIsReady(true);
      toast.success('You are ready!');
    }
  };

  const handleCreateRoom = async () => {
    try {
      const newRoom = await colyseusClient.createRoom({
        name: playerName,
        level: parseInt(difficulty.gradeRange.split(' ')[1].split('-')[0]),
        gameMode: gameMode.id as 'speed' | 'chess' | 'minecraft',
        character: character.id,
        maxPlayers: 6,
        totalRounds: 10
      });
      setRoom(newRoom);
      setCreatedRoomId(getRoomId(newRoom) || ''); // Set the created room ID robustly
      toast.success('Room created successfully!');
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room. Make sure the server is running!');
    }
  };

  const handleJoinRoomById = async () => {
    if (!roomIdToJoin.trim()) {
      toast.error('Please enter a Room ID to join.');
      return;
    }
    setIsJoining(true);
    try {
      const gameRoom = await colyseusClient.joinRoomById(roomIdToJoin, {
        name: playerName,
        level: parseInt(difficulty.gradeRange.split(' ')[1].split('-')[0]),
        gameMode: gameMode.id as 'speed' | 'chess' | 'minecraft',
        character: character.id,
        maxPlayers: 6,
        totalRounds: 10
      });
      setRoom(gameRoom);
      toast.success(`Joined room ${roomIdToJoin} successfully!`);
    } catch (error) {
      console.error(`Failed to join room by ID ${roomIdToJoin}:`, error);
      toast.error(`Failed to join room ${roomIdToJoin}. Make sure the ID is correct and the server is running!`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGame = async () => {
    if (room) {
      await colyseusClient.leaveGame();
      setRoom(null);
      setPlayers(new Map());
      setIsReady(false);
      onBack();
    }
  };

  const addSystemMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: 'system',
      playerName: 'System',
      message,
      timestamp: Date.now(),
      type: 'system'
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const addChatMessage = (playerId: string, playerName: string, message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId,
      playerName,
      message,
      timestamp: Date.now(),
      type: 'message'
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = (message: string) => {
    if (room) {
      room.send('chat_message', { message });
    }
  };

  if (isJoining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Joining Game...</h2>
          <p className="text-gray-300">Finding the perfect match for you!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${gameMode.color} text-white font-semibold`}>
            <span className="mr-2 text-xl">{gameMode.icon}</span>
            {gameMode.name} - {difficulty.name}
          </div>
        </motion.div>

        {/* Game Info */}
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white">
                {Array.from(players.values()).filter(p => p.connected).length}/6 Players
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white">10 Rounds</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-white">{difficulty.timeLimit}s per question</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-white">{difficulty.pointMultiplier}x points</span>
            </div>
          </div>
        </motion.div>

        {/* Your Character */}
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-yellow-400/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">Your Character</h3>
          <div className="flex items-center justify-center space-x-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${character.color} flex items-center justify-center text-3xl`}>
              {character.avatar}
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold text-white mb-1">{character.name}</h4>
              <p className="text-yellow-400 font-semibold">⚡ {character.specialAbility}</p>
            </div>
          </div>
        </motion.div>

        {/* Players List */}
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Players in Lobby
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {players.size > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Players in Lobby:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(players.values()).map((player: GamePlayer) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/10 p-4 rounded-lg flex items-center space-x-3"
                      >
                        <Users className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">{player.name}</p>
                          <p className="text-gray-400 text-sm">Level: {player.level}</p>
                          <p className="text-gray-400 text-sm">Status: {player.ready ? 'Ready' : 'Waiting'}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Countdown */}
        <AnimatePresence>
          {countdown > 0 && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <motion.div
                  className="text-8xl font-bold text-white mb-4"
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {countdown}
                </motion.div>
                <p className="text-2xl text-yellow-400 font-semibold">Game Starting...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {!isReady ? (
            <motion.button
              onClick={handleReady}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 mr-2" />
              Ready to Battle!
            </motion.button>
          ) : (
            <div className="flex items-center px-8 py-3 bg-green-500/20 border border-green-400 text-green-400 font-bold rounded-xl">
              <Play className="w-5 h-5 mr-2" />
              Ready! Waiting for others...
            </div>
          )}
          
          <motion.button
            onClick={handleCreateRoom}
            className="px-6 py-3 bg-blue-500/20 border border-blue-400 text-blue-400 font-semibold rounded-xl hover:bg-blue-500/30 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Room
          </motion.button>

          {createdRoomId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center px-4 py-2 bg-indigo-500/20 border border-indigo-400 text-indigo-300 font-semibold rounded-xl"
            >
              <span className="mr-2">Room ID:</span>
              <span className="font-bold text-white">{createdRoomId}</span>
              <motion.button
                onClick={() => {
                  navigator.clipboard.writeText(createdRoomId);
                  toast.success('Room ID copied to clipboard!');
                }}
                className="ml-2 px-3 py-1 bg-indigo-600/50 border border-indigo-500 text-white rounded-md hover:bg-indigo-600/70 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Copy
              </motion.button>
            </motion.div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter Room ID"
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={roomIdToJoin}
              onChange={(e) => setRoomIdToJoin(e.target.value)}
            />
            <motion.button
              onClick={handleJoinRoomById}
              className="px-6 py-3 bg-purple-500/20 border border-purple-400 text-purple-400 font-semibold rounded-xl hover:bg-purple-500/30 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join by ID
            </motion.button>
          </div>
          
          <motion.button
            onClick={handleLeaveGame}
            className="px-6 py-3 bg-red-500/20 border border-red-400 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Leave Lobby
          </motion.button>
        </div>

        {gameStatus === 'starting' && !countdown && (
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-flex items-center px-6 py-3 bg-yellow-500/20 border border-yellow-400 text-yellow-400 font-bold rounded-xl animate-pulse">
              🎮 Preparing Battle Arena...
            </div>
          </motion.div>
        )}
      </div>

      {/* Chat System */}
      <ChatSystem
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        playerName={playerName}
        isGameActive={false}
      />
    </div>
  );
};