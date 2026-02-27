import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Crown, Trophy, Clock, Zap, Shield, Target, MessageSquare, LogOut, Plus, Search, ChevronRight, Activity, Terminal } from 'lucide-react';
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

const HUDCorner = () => (
  <>
    <div className="hud-corner hud-corner-tl" />
    <div className="hud-corner hud-corner-tr" />
    <div className="hud-corner hud-corner-bl" />
    <div className="hud-corner hud-corner-br" />
  </>
);

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
        toast.success(`UPLINK SECURED: ${gameMode.name.toUpperCase()}`);
        addSystemMessage(`OPERATOR ${playerName.toUpperCase()} AUTHORIZED`);
      });

      room.onMessage('player_joined', (message) => {
        addSystemMessage(`REINFORCEMENT DETECTED: ${message.playerName.toUpperCase()}`);
      });

      room.onMessage('player_left', (message) => {
        addSystemMessage(`UPLINK LOST: ${message.playerName.toUpperCase()}`);
      });

      room.onMessage('game_starting', (message) => {
        setCountdown(message.countdown);
        toast.success('INITIATING DROP SEQUENCE...');

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
      toast.error('UPLINK DENIED: SERVER OFFLINE');
    } finally {
      setIsJoining(false);
    }
  };

  const handleReady = () => {
    if (room) {
      room.send('ready');
      setIsReady(true);
      toast.success('COMBAT READINESS CONFIRMED');
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
      toast.success('ENCRYPTED FREQUENCY GENERATED');
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
      toast.success('DECRYPTING CHANNEL... ACCESS GRANTED');
    } catch (error) {
      toast.error('INVALID FREQUENCY ID');
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 font-mono">
        <div className="tactical-panel p-16 text-center max-w-2xl w-full border-orange-500/40">
          <HUDCorner />
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 border-2 border-orange-500/20 border-t-orange-500 rounded-full mx-auto mb-10 flex items-center justify-center"
          >
            <Zap className="w-8 h-8 text-orange-500 animate-pulse" />
          </motion.div>
          <h2 className="text-4xl font-black uppercase italic italic text-white mb-4 glitch-text italic">Securing Uplink</h2>
          <p className="text-orange-500 font-black tracking-[0.5em] animate-pulse">AUTHORIZED ACCESS ONLY</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden font-mono">
      <div className="absolute inset-0 bg-[url('/images/lobby-bg.png')] opacity-10 bg-cover bg-center grayscale" />
      <div className="scanline" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-12 gap-8 h-[calc(100vh-64px)]">

        {/* LEFT: SQUAD MANIFEST & COMMS */}
        <div className="col-span-12 lg:col-span-4 flex flex-col space-y-6">
          <div className="tactical-panel p-6 flex flex-col h-[55%] border-l-2 border-l-orange-500">
            <HUDCorner />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-orange-500/80">Squad Manifest</h2>
                <p className="text-[10px] text-gray-600 font-bold uppercase">Combat Unit Beta-7</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black italic italic">{Array.from(players.values()).length} <span className="text-gray-600">/ 6</span></p>
                <div className="flex space-x-1 mt-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`w-3 h-1 ${i < Array.from(players.values()).length ? 'bg-orange-500' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-4 flex-1 custom-scrollbar">
              {Array.from(players.values()).map((p) => (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  key={p.id}
                  className="flex items-center space-x-4 p-4 bg-white/5 border border-white/5 hover:bg-white/10 transition-colors relative"
                >
                  <div className="relative">
                    <div className={`w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-sm`}>
                      <Activity className={`w-6 h-6 ${p.ready ? 'text-green-500' : 'text-gray-700'}`} />
                    </div>
                    {p.ready && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full shadow-tactical-glow-green-player animate-pulse" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black italic uppercase italic tracking-tight">{p.name.toUpperCase()}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-[9px] font-black text-gray-500 uppercase">LVL {p.level}</span>
                      <span className={`text-[9px] font-black uppercase ${p.ready ? 'text-green-500' : 'text-gray-700'}`}>{p.ready ? 'ONLINE' : 'SYNCING...'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="tactical-panel p-0 flex flex-col flex-1 overflow-hidden relative border-l-2 border-l-cyan-500 tactical-panel-cyan">
            <HUDCorner />
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-500 flex items-center">
                <Terminal className="w-4 h-4 mr-2" />
                COMMS TERMINAL
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

        {/* CENTER: DEPLOYMENT HUB */}
        <div className="col-span-12 lg:col-span-8 flex flex-col space-y-6">
          <div className="flex-1 tactical-panel flex flex-col items-center justify-center relative bg-gradient-to-br from-black/60 to-orange-950/20">
            <HUDCorner />

            {/* Deployment Map/Character */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-[80%] h-[80%] border border-orange-500 rounded-full pulse-glow" />
            </div>

            <div className="relative flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <img
                  src="/images/character-tactical.png"
                  className="max-h-[500px] object-contain drop-shadow-tactical-operator"
                />
                <div className="absolute top-1/2 -left-32 tactical-panel p-4 min-w-[180px] border border-orange-500/30">
                  <p className="text-[9px] font-black text-orange-500/60 uppercase">Operation Param</p>
                  <p className="text-base font-black italic italic">{gameMode.name.toUpperCase()}</p>
                </div>
                <div className="absolute top-1/3 -right-32 tactical-panel p-4 min-w-[180px] border border-cyan-500/30 tactical-panel-cyan">
                  <p className="text-[9px] font-black text-cyan-500/60 uppercase">Engagement Intensity</p>
                  <p className="text-base font-black italic italic">{difficulty.name.toUpperCase()}</p>
                </div>
              </motion.div>

              <div className="mt-12 text-center">
                <h1 className="text-5xl font-black uppercase italic italic tracking-tighter glitch-text leading-none italic">Deployment Ready</h1>
                <p className="text-orange-500 font-black tracking-[0.5em] uppercase text-xs mt-4">Authorized Operator: {playerName}</p>
              </div>
            </div>

            <div className="absolute bottom-10 w-full max-w-md px-12">
              {!isReady ? (
                <button
                  onClick={handleReady}
                  className="w-full py-8 bg-orange-600/20 border border-orange-600 text-orange-500 font-black text-3xl uppercase italic tracking-widest shadow-tactical-glow-ready hover:bg-orange-600 hover:text-white transition-all group overflow-hidden relative"
                >
                  <span className="relative z-10 transition-transform group-hover:scale-110 block italic">Initiate Combat Sync</span>
                  <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                </button>
              ) : (
                <div className="w-full py-8 bg-green-600/10 border-2 border-green-500/50 text-green-500 font-black text-3xl uppercase italic tracking-[0.3em] text-center animate-pulse shadow-tactical-glow-green italic">
                  Combat Link Secured
                </div>
              )}
            </div>

            {/* AI Injector */}
            <button
              onClick={() => room?.send('add_ai')}
              className="absolute right-10 bottom-10 tactical-btn-primary flex flex-col items-center p-6 !clip-path-none border-2 border-orange-500/40"
            >
              <Shield className="w-8 h-8 mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">Deploy Support Unit</span>
              <span className="text-[8px] font-black opacity-40 uppercase mt-1">AI-Assistance-V2</span>
            </button>
          </div>

          {/* CHANNEL CONTROLS */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 tactical-panel p-6 flex items-center justify-between border-t-2 border-t-orange-500/40">
              <HUDCorner />
              <div className="flex items-center space-x-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-600 uppercase">Channel Frequency</span>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-2xl font-black tracking-[0.2em] text-white italic italic">{createdRoomId || '--- ---'}</span>
                    {createdRoomId && (
                      <button
                        onClick={() => { navigator.clipboard.writeText(createdRoomId); toast.success('FREQUENCY COPIED'); }}
                        className="p-1 hover:text-orange-500"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div className="relative min-w-[200px]">
                  <input
                    type="text"
                    placeholder="OVERRIDE FREQUENCY"
                    value={roomIdToJoin}
                    onChange={(e) => setRoomIdToJoin(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 p-3 text-xs font-black focus:border-orange-500/50 outline-none uppercase placeholder:text-gray-800 tracking-widest"
                  />
                </div>
                <button
                  onClick={handleJoinRoomById}
                  className="tactical-panel px-4 py-2 hover:bg-orange-500/20 text-[10px] font-black uppercase tracking-widest"
                >
                  Execute Link
                </button>
              </div>

              <button
                onClick={handleCreateRoom}
                className="tactical-panel px-8 py-3 bg-white/5 hover:bg-white/10 border-white/10 text-xs font-black uppercase tracking-widest italic flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Frequency
              </button>
            </div>

            <div className="col-span-4 tactical-panel p-6 flex items-center justify-center border-t-2 border-t-red-500/40">
              <HUDCorner />
              <button
                onClick={handleLeaveGame}
                className="flex items-center space-x-4 text-red-500 group"
              >
                <LogOut className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xl font-black uppercase italic italic">Abort Engagement</span>
                  <span className="text-[9px] font-black opacity-40 uppercase mt-1">Return to Base</span>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* DROP SEQUENCE OVERLAY */}
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none" />
            <div className="scanline" />

            <motion.div
              animate={{ rotate: [0, 90, 180, 270, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute w-[800px] h-[800px] border border-red-600/10 rounded-full"
            />

            <p className="text-lg font-black tracking-[1.5em] text-red-600 mb-12 uppercase glitch-text">DROP SEQUENCE INITIATED</p>

            <motion.div
              key={countdown}
              initial={{ scale: 4, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              className="text-[250px] font-black italic text-white drop-shadow-[0_0_80px_rgba(239,68,68,0.5)] italic"
            >
              {countdown}
            </motion.div>

            <div className="absolute bottom-20 left-0 right-0 px-20">
              <div className="flex justify-between text-[10px] font-black text-red-600/60 uppercase tracking-[0.5em] mb-4">
                <span>Syncing Hardware</span>
                <span>{100 - (countdown * 33)}%</span>
              </div>
              <div className="h-1 bg-red-950 w-full">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${100 - (countdown * 33)}%` }}
                  className="h-full bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};