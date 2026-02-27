import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Room } from 'colyseus.js';
import { Clock, Lightbulb, Trophy, Users, Shield } from 'lucide-react';
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
    colyseusClient.sendAnswer(answer, timeSpent);
  };

  const handleHintRequest = () => {
    colyseusClient.requestHint();
  };

  if (gameStatus === 'finished') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8 relative overflow-hidden">
        <div className="scanline" />
        <div className="tactical-panel p-12 max-w-2xl w-full text-center bg-gradient-to-br from-black to-orange-950/20">
          <Trophy className="w-20 h-20 text-orange-500 mx-auto mb-6 shadow-[0_0_30px_rgba(234,88,12,0.5)]" />
          <h1 className="text-4xl font-black uppercase italic italic text-white mb-2">Operation Complete</h1>
          <p className="text-orange-500 font-bold mb-8 uppercase tracking-widest italic tracking-[0.3em]">Final Debriefing</p>

          <div className="space-y-4 mb-10 text-left">
            {leaderboard.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 border ${index === 0 ? 'bg-orange-600/20 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'bg-white/5 border-white/10'
                  }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`text-xl font-black italic italic ${index === 0 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-black uppercase italic">{player.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black italic">{player.score}</span>
                  <span className="text-[10px] font-black uppercase text-gray-500 block">POINTS</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onGameEnd}
            className="tactical-btn-primary w-full text-xl py-4"
          >
            Return to Command
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        <div className="scanline" />
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-black uppercase italic italic text-white tracking-widest">Awaiting Mission Data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 relative overflow-hidden">
      <div className="scanline" />
      <div className="max-w-5xl mx-auto h-full flex flex-col">

        {/* HUD Top Bar */}
        <div className="flex justify-between items-center mb-10">
          <div className="tactical-panel px-6 py-2 border-l-orange-500">
            <p className="text-[10px] font-black text-gray-500 uppercase">Engagement</p>
            <p className="text-xl font-black italic uppercase italic tracking-tighter italic">Phase {roundNumber} <span className="text-gray-600">/ {totalRounds}</span></p>
          </div>

          <div className="flex space-x-6">
            <div className={`tactical-panel px-6 py-2 border-l-orange-500 ${timeRemaining < 10 ? 'bg-red-500/10 border-red-500 animate-pulse' : ''}`}>
              <p className="text-[10px] font-black text-gray-500 uppercase">Timer</p>
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${timeRemaining < 10 ? 'text-red-500' : 'text-orange-500'}`} />
                <span className="text-xl font-black italic">{timeRemaining}s</span>
              </div>
            </div>
            <div className="tactical-panel px-6 py-2 border-l-blue-500 before:bg-blue-500/50">
              <p className="text-[10px] font-black text-gray-500 uppercase">Squaddies</p>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-xl font-black italic">{Array.from(players.values()).filter(p => p.connected).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Combat Objective (Question) */}
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl"
          >
            <div className="tactical-panel p-12 text-center bg-black/80 relative">
              <div className="absolute top-0 left-0 p-2 text-[10px] font-black text-gray-700 uppercase">Input Required</div>
              <h2 className="text-5xl font-black uppercase italic italic tracking-tight mb-8 leading-tight">
                {currentQuestion.question}
              </h2>

              {hint && (
                <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/50 flex items-center justify-center text-orange-500 font-bold uppercase italic text-sm">
                  <Shield className="w-5 h-5 mr-3" />
                  Intel: {hint}
                </div>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(option)}
                    disabled={hasAnswered}
                    className={`tactical-btn py-8 text-3xl font-black italic italic ${selectedAnswer === option
                      ? lastResult?.correct
                        ? 'bg-green-600 text-white border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                        : 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                      : hasAnswered
                        ? option === currentQuestion.correctAnswer
                          ? 'bg-green-600/20 text-green-500 border-green-500/50'
                          : 'opacity-20 translate-y-1'
                        : 'hover:bg-orange-500/10 hover:border-orange-500/50'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {!hasAnswered && !hint && (
                <button
                  onClick={handleHintRequest}
                  className="mt-10 flex items-center space-x-2 text-orange-500/60 hover:text-orange-500 font-black uppercase italic text-xs tracking-widest transition-all"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Request Intel Overlay</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Squad Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-auto">
          {Array.from(players.values()).map((player) => (
            <div
              key={player.id}
              className={`tactical-panel p-3 flex items-center justify-between border-l-2 ${player.answered ? 'border-l-green-500 bg-green-500/5' : 'border-l-gray-700 bg-white/5'
                }`}
            >
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase">{player.name}</p>
                <p className="text-sm font-black italic italic">{player.score} XP</p>
              </div>
              <div className={`w-3 h-3 ${player.answered ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-800 animate-pulse'}`} />
            </div>
          ))}
        </div>

        {/* Round Overlays */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="tactical-panel p-10 max-w-sm w-full border-orange-500 shadow-[0_0_50px_rgba(234,88,12,0.3)]">
                <h3 className="text-2xl font-black uppercase italic italic text-center mb-6">Engagement Results</h3>
                <div className="space-y-3">
                  {leaderboard.slice(0, 3).map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/10">
                      <span className="text-sm font-black italic italic">{i + 1}. {p.name.toUpperCase()}</span>
                      <span className="text-sm font-black italic italic text-orange-500">{p.score}</span>
                    </div>
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