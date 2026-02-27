import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Crown, Trophy, Clock, Zap, Shield, Target, MessageSquare, LogOut, Plus, Search } from 'lucide-react';
import { Room } from 'colyseus.js';
import { colyseusClient, Player, getRoomId } from '../../lib/colyseus-client';
import { Character, GameMode, DifficultyLevel, Player as GamePlayer, ChatMessage } from '../../types/game';
import { ChatSystem } from '../Chat/ChatSystem';
import toast from 'react-hot-toast';

interface EnhancedMultiplayerLobbyProps {
  character: Character;
  gameMode: GameMode;
  difficulty: DifficultyLevel;
  playerName: string;
  setPlayerName: (name: string) => void;
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
    if (!room) {
      joinGame();
    }
    return () => {
      if (room) room.leave();
    };
  }, [room]);

  useEffect(() => {
    if (room) {
      room.onStateChange((state) => {
        setPlayers(new Map(state.players));
        setGameStatus(state.status);
      });

      room.onMessage('welcome', () => {
        toast.success(`CONNECTION ESTABLISHED: ${gameMode.name.toUpperCase()}`);
        addSystemMessage(`OPERATOR ${playerName.toUpperCase()} SYNCHRONIZED`);
      });

      room.onMessage('player_joined', (message) => {
        addSystemMessage(`NEW CONTACT: ${message.playerName.toUpperCase()}`);
      });

      room.onMessage('player_left', (message) => {
        addSystemMessage(`CONTACT LOST: ${message.playerName.toUpperCase()}`);
      });

      room.onMessage('game_starting', (message) => {
        setCountdown(message.countdown);
        toast.success('MISSION COMMENCING...');

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
      toast.error('UPLINK FAILED. SERVER OFFLINE.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleReady = () => {
    if (room) {
      colyseusClient.sendReady();
      setIsReady(true);
      toast.success('READY STATUS BROADCASTED');
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
      setCreatedRoomId(getRoomId(newRoom) || '');
      toast.success('ENCRYPTED ROOM GENERATED');
    } catch (error) {
      toast.error('GENERATION FAILED');
    }
  };

  const handleJoinRoomById = async () => {
    if (!roomIdToJoin.trim()) return;
    setIsJoining(true);
    try {
      const gameRoom = await colyseusClient.joinRoomById(roomIdToJoin, {
        name: playerName,
        level: 1,
        gameMode: gameMode.id as any,
        character: character.id
      });
      setRoom(gameRoom);
      toast.success('SECURE CHANNEL JOINED');
    } catch (error) {
      toast.error('INVALID FREQUENCY / ROOM ID');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGame = async () => {
    if (room) {
      await colyseusClient.leaveGame();
      setRoom(null);
      onBack();
    }
  };

  const addSystemMessage = (message: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      playerId: 'system',
      playerName: 'SYSTEM',
      message: '> ' + message,
      timestamp: Date.now(),
      type: 'system'
    }]);
  };

  const addChatMessage = (playerId: string, playerName: string, message: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      playerId,
      playerName,
      message,
      timestamp: Date.now(),
      type: 'message'
    }]);
  };

  if (isJoining) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="tactical-panel p-12 text-center max-w-lg w-full">
          <div className="scanline" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-black uppercase italic tracking-widest text-white mb-2">Establishing Uplink</h2>
          <p className="text-orange-500 font-bold animate-pulse">SYNCHRONIZING SECURE CHANNEL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/lobby-bg.png')] opacity-20 bg-cover bg-center" />
      <div className="scanline" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-12 gap-8 h-[calc(100vh-64px)]">

        {/* Left Sidebar: Room Info & Controls */}
        <div className="col-span-12 lg:col-span-3 flex flex-col space-y-6">
          <div className="tactical-panel p-6 border-l-orange-500">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-4">Channel Data</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-500 uppercase">Operation</span>
                <span className="text-sm font-black italic uppercase">{gameMode.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-500 uppercase">Intensity</span>
                <span className="text-sm font-black italic uppercase text-orange-500">{difficulty.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-500 uppercase">Status</span>
                <span className="text-sm font-black italic uppercase text-green-500 animate-pulse">Active</span>
              </div>
            </div>
            <div className="hud-line" />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-500 uppercase">Rounds</span>
                <span className="text-lg font-black italic">10</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-500 uppercase">Timer</span>
                <span className="text-lg font-black italic">{difficulty.timeLimit}s</span>
              </div>
            </div>
          </div>

          <div className="tactical-panel p-6 flex-1 flex flex-col">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Command Center</h2>
            <div className="space-y-3 flex-1">
              <button
                onClick={handleCreateRoom}
                className="w-full tactical-btn-primary flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Initialize Room</span>
              </button>

              <div className="relative mt-6">
                <input
                  type="text"
                  placeholder="FREQUENCY ID"
                  value={roomIdToJoin}
                  onChange={(e) => setRoomIdToJoin(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 text-xs font-bold focus:border-orange-500 outline-none uppercase placeholder:text-gray-700"
                />
                <button
                  onClick={handleJoinRoomById}
                  className="absolute right-2 top-2 p-1 hover:text-orange-500 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {createdRoomId && (
                <div
                  onClick={() => { navigator.clipboard.writeText(createdRoomId); toast.success('COPIED'); }}
                  className="tactical-panel bg-orange-500/10 p-3 mt-4 cursor-pointer border-dashed hover:border-orange-500 transition-colors"
                >
                  <p className="text-[10px] font-black text-orange-500 mb-1 uppercase">Share Frequency</p>
                  <p className="text-lg font-black tracking-widest text-white">{createdRoomId}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLeaveGame}
              className="w-full tactical-btn border-red-500/50 text-red-500 hover:bg-red-500/10 flex items-center justify-center space-x-2 mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Abort Mission</span>
            </button>
          </div>
        </div>

        {/* Center: Operator Showcase */}
        <div className="col-span-12 lg:col-span-6 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src="/images/character-tactical.png"
              className="max-h-[80%] object-contain"
            />
            <div className="absolute top-0 flex flex-col items-center">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter italic">Active Operator</h1>
              <p className="text-orange-500 font-black tracking-[0.4em] uppercase text-xs mt-2">{playerName}</p>
            </div>

            <div className="absolute bottom-10 w-full px-12">
              {!isReady ? (
                <button
                  onClick={handleReady}
                  className="w-full py-6 bg-orange-600 text-white font-black text-2xl uppercase italic tracking-widest shadow-tactical-glow-ready hover:bg-orange-500 transition-all active:scale-95"
                >
                  Confirm Readiness
                </button>
              ) : (
                <div className="w-full py-6 bg-green-600/20 border-2 border-green-500 text-green-500 font-black text-2xl uppercase italic tracking-widest text-center animate-pulse">
                  Ready Status: Confirmed
                </div>
              )}
            </div>

            {/* AI Injector Button */}
            <button
              onClick={() => room?.send('add_ai')}
              className="absolute right-0 bottom-40 tactical-btn bg-white/5 border-orange-500/30 text-orange-500 flex flex-col items-center p-4 hover:bg-orange-500/10"
            >
              <Shield className="w-8 h-8 mb-2" />
              <span className="text-[10px] font-black uppercase">Inject AI</span>
              <span className="text-[10px] font-black text-gray-500">SUPPORT UNIT</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar: Squad Status & Comms */}
        <div className="col-span-12 lg:col-span-3 flex flex-col space-y-6">
          <div className="tactical-panel p-6 flex flex-col h-[45%]">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-4 flex items-center justify-between">
              Squad Status
              <span className="text-orange-500">{Array.from(players.values()).length} / 6</span>
            </h2>
            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              {Array.from(players.values()).map((p) => (
                <div key={p.id} className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded">
                  <div className={`w-2 h-2 rounded-full ${p.ready ? 'bg-green-500' : 'bg-gray-700 animate-pulse'}`} />
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase">Operator</p>
                    <p className="text-sm font-black italic truncate">{p.name.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-500 uppercase">LV</p>
                    <p className="text-sm font-black italic">{p.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tactical-panel p-0 flex flex-col flex-1 overflow-hidden relative">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Comms Channel
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatSystem
                messages={chatMessages}
                onSendMessage={(msg) => room?.send('chat_message', { message: msg })}
                playerName={playerName}
                isGameActive={false}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <div className="scanline" />
            <p className="text-xs font-black tracking-[1em] text-orange-500 mb-8 uppercase animate-pulse">Initializing Engagement</p>
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="text-9xl font-black italic text-white drop-shadow-tactical-hud"
            >
              {countdown}
            </motion.div>
            <div className="mt-12 flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-12 h-1 bg-orange-500 shadow-tactical-glow-countdown"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};