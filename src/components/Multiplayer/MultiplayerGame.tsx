import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Room } from 'colyseus.js';
import { Clock, Lightbulb, Trophy, Users, Shield, Target, Crosshair, Zap, Activity } from 'lucide-react';
import { colyseusClient } from '../../lib/colyseus-client';
import { Player, MathQuestion } from '../../types/game';

interface MultiplayerGameProps {
  room: Room;
  onGameEnd: () => void;
}

interface LeaderboardPlayer {
  id: string;
  name: string;
  score: number;
}

interface AnswerResult {
  correct: boolean;
  points: number;
}

const HUDCorner = () => (
  <>
    <div className="hud-corner hud-corner-tl" />
    <div className="hud-corner hud-corner-tr" />
    <div className="hud-corner hud-corner-bl" />
    <div className="hud-corner hud-corner-br" />
  </>
);

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ room, onGameEnd }) => {
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [roundNumber, setRoundNumber] = useState(0);
  const [totalRounds, setTotalRounds] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [gameStatus, setGameStatus] = useState<string>('waiting');
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);
  const [hint, setHint] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    room.onStateChange((state) => {
      setPlayers(new Map(state.players));
      setGameStatus(state.status);
      setRoundNumber(state.currentRoundNumber);
      setTotalRounds(state.totalRounds);

      if (state.currentRound) {
        setTimeRemaining(state.currentRound.timeRemaining);
        if (state.currentRound.currentQuestion && state.currentRound.currentQuestion.id) {
          if (!currentQuestion || currentQuestion.id !== state.currentRound.currentQuestion.id) {
            setCurrentQuestion(state.currentRound.currentQuestion);
            setHasAnswered(false);
            setSelectedAnswer('');
            setLastResult(null);
            setHint('');
            setShowResults(false);
            startTimeRef.current = Date.now();
          }
        }
      }
    });

    room.onMessage('new_round', (message) => {
      setCurrentQuestion(message.question);
      setRoundNumber(message.roundNumber);
      setTotalRounds(message.totalRounds);
      setHasAnswered(false);
      setSelectedAnswer('');
      setLastResult(null);
      setHint('');
      setShowResults(false);
      startTimeRef.current = Date.now();
    });

    room.onMessage('answer_result', (message) => {
      setLastResult(message);
      setHasAnswered(true);
    });

    room.onMessage('hint', (message) => {
      setHint(message.hint);
    });

    room.onMessage('round_ended', (message) => {
      setLeaderboard(message.leaderboard);
      setShowResults(true);
      setTimeout(() => setShowResults(false), 4000);
    });

    room.onMessage('game_ended', (message) => {
      setLeaderboard(message.finalResults);
      setTimeout(() => onGameEnd(), 10000);
    });

    return () => {
      room.removeAllListeners();
    };
  }, [room, onGameEnd]);

  const handleAnswerSubmit = (answer: string) => {
    if (hasAnswered || !currentQuestion) return;
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setSelectedAnswer(answer);
    room.send('answer', { answer, timeSpent });
  };

  const handleHintRequest = () => {
    room.send('request_hint');
  };

  if (gameStatus === 'finished') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden font-mono">
        <div className="scanline" />
        <div className="tactical-panel p-12 max-w-4xl w-full text-center border-orange-500/40">
          <HUDCorner />
          <Trophy className="w-24 h-24 text-orange-500 mx-auto mb-8 shadow-tactical-glow-xl" />
          <h1 className="text-6xl font-black uppercase italic italic text-white mb-4 glitch-text">Mission Summary</h1>
          <p className="text-orange-500 font-bold mb-12 uppercase tracking-[0.5em] italic">Final Tactical Debrief</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
            {leaderboard.map((player, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={player.id}
                className={`flex items-center justify-between p-6 border-l-4 ${index === 0 ? 'bg-orange-600/10 border-orange-500 shadow-tactical-glow-leader' : 'bg-white/5 border-white/10'
                  }`}
              >
                <div className="flex items-center space-x-6">
                  <span className={`text-2xl font-black italic italic ${index === 0 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase">Operator</p>
                    <p className="text-xl font-black uppercase italic">{player.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase">XP Gained</p>
                  <span className="text-3xl font-black italic text-orange-500">{player.score}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={onGameEnd}
            className="tactical-btn-primary w-full text-2xl py-6"
          >
            RETURN TO COMMAND HUB
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-mono text-orange-500">
        <div className="scanline" />
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-2 border-orange-500/20 border-t-orange-500 rounded-full mx-auto mb-8 flex items-center justify-center"
          >
            <Crosshair className="w-10 h-10 animate-pulse" />
          </motion.div>
          <h2 className="text-3xl font-black uppercase italic tracking-[0.5em] glitch-text italic">Loading Mission Parameters...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-mono">
      <div className="scanline" />
      <div className="max-w-7xl mx-auto h-full flex flex-col">

        {/* TOP HUD: SYSTEM TELEMETRY */}
        <div className="flex justify-between items-start mb-12">
          <div className="tactical-panel px-8 py-4 border-l-orange-500">
            <HUDCorner />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Engagement</span>
              <span className="text-3xl font-black italic uppercase italic tracking-tighter">Phase <span className="text-orange-500 bg-orange-500/10 px-2">{String(roundNumber).padStart(2, '0')}</span> <span className="text-gray-600 text-lg">/ {totalRounds}</span></span>
            </div>
          </div>

          <div className="flex space-x-6">
            <div className={`tactical-panel px-8 py-4 border-l-orange-500 bg-black/40 ${timeRemaining < 10 ? 'border-red-500' : ''}`}>
              <HUDCorner />
              <div className="flex items-center space-x-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Time Remaining</span>
                  <span className={`text-3xl font-black italic ${timeRemaining < 10 ? 'text-red-500 glitch-text' : 'text-white'}`}>{String(timeRemaining).padStart(2, '0')}s</span>
                </div>
                <Clock className={`w-10 h-10 ${timeRemaining < 10 ? 'text-red-500 animate-pulse' : 'text-orange-500/50'}`} />
              </div>
            </div>

            <div className="tactical-panel px-8 py-4 border-l-cyan-500 tactical-panel-cyan bg-black/40">
              <HUDCorner />
              <div className="flex items-center space-x-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Squad Connectivity</span>
                  <span className="text-3xl font-black italic text-cyan-500">{(Array.from(players.values()).filter(p => p.connected).length / 6 * 100).toFixed(0)} <span className="text-xs">%</span></span>
                </div>
                <Activity className="w-10 h-10 text-cyan-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: ENGAGEMENT INTERFACE */}
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl relative"
          >
            {/* Question Targeting Reticle */}
            <div className="absolute -inset-10 pointer-events-none opacity-20 flex items-center justify-center">
              <div className="w-full h-full border border-orange-500 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-[120%] h-[120%] border-t border-b border-orange-500/50 rotate-45" />
              <div className="absolute w-[120%] h-[120%] border-t border-b border-orange-500/50 -rotate-45" />
            </div>

            <div className="tactical-panel p-20 text-center bg-black/90 border-orange-500/40 relative">
              <HUDCorner />
              <div className="absolute top-4 left-4 flex items-center space-x-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                <Target className="w-3 h-3" />
                <span>Primary Objective Detected</span>
              </div>

              <h2 className="text-7xl font-black uppercase italic italic tracking-tight mb-16 glitch-text leading-none italic">
                {currentQuestion.question}
              </h2>

              {hint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mb-12 p-6 bg-cyan-500/5 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black uppercase italic italic tracking-widest text-lg"
                >
                  <Shield className="w-6 h-6 mr-4 animate-pulse" />
                  Tactical Intel: {hint}
                </motion.div>
              )}

              {/* Engagement Controls (Options) */}
              <div className="grid grid-cols-2 gap-8">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(option)}
                    disabled={hasAnswered}
                    className={`tactical-btn py-10 text-4xl font-black italic italic transition-all ${selectedAnswer === option
                        ? lastResult?.correct
                          ? 'bg-green-600/20 text-green-500 border-green-500/50 shadow-tactical-glow-green'
                          : 'bg-red-600/20 text-red-500 border-red-500/50 shadow-tactical-glow-red'
                        : hasAnswered
                          ? option === currentQuestion.correctAnswer
                            ? 'bg-green-600/10 text-green-500 border-green-500/30 border-dashed'
                            : 'opacity-10 scale-95'
                          : 'hover:bg-orange-500/10 hover:border-orange-500/50'
                      }`}
                  >
                    <span className="text-xs absolute top-2 left-4 text-gray-500 font-mono tracking-widest">INPUT_0{index + 1}</span>
                    {option}
                  </button>
                ))}
              </div>

              {!hasAnswered && !hint && (
                <button
                  onClick={handleHintRequest}
                  className="mt-12 flex items-center space-x-3 text-orange-500/40 hover:text-orange-500 font-black uppercase italic text-xs tracking-[0.4em] transition-all group"
                >
                  <Lightbulb className="w-4 h-4 group-hover:animate-bounce" />
                  <span>Request Intelligence Overlay</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SQUAD SENSORS */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-auto py-6">
          {Array.from(players.values()).map((player) => (
            <div
              key={player.id}
              className={`tactical-panel p-4 flex flex-col border-l-2 transition-all ${player.answered ? 'border-l-green-500 bg-green-500/5' : 'border-l-gray-800 bg-white/5 opacity-60'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-black text-gray-600 uppercase truncate pr-2">{player.name}</p>
                <div className={`w-1.5 h-1.5 rounded-full ${player.answered ? 'bg-green-500 shadow-tactical-glow-green-player' : 'bg-gray-800 animate-pulse'}`} />
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-black italic text-white leading-none">{player.score}</span>
                <span className="text-[8px] font-black text-gray-700 italic">XP_VAL</span>
              </div>
              <div className="h-0.5 bg-white/5 mt-2 w-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: player.answered ? '100%' : '0%' }}
                  className="h-full bg-green-500/40"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Results Overlay */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8"
            >
              <div className="scanline" />
              <div className="tactical-panel p-16 max-w-xl w-full border-orange-500 shadow-tactical-glow-xl text-center">
                <HUDCorner />
                <h3 className="text-4xl font-black uppercase italic italic text-center mb-10 glitch-text italic">Batch Debriefing</h3>
                <div className="space-y-4">
                  {leaderboard.slice(0, 5).map((p, i) => (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={p.id}
                      className="flex justify-between items-center p-4 bg-orange-600/5 border border-orange-500/20"
                    >
                      <span className="text-lg font-black italic italic italic flex items-center tracking-tight">
                        <span className="text-orange-500/60 mr-4 text-xs font-mono">#{i + 1}</span>
                        {p.name.toUpperCase()}
                      </span>
                      <span className="text-2xl font-black italic text-orange-500 tracking-tighter">{p.score} <span className="text-[10px] text-gray-500 uppercase">XP</span></span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};