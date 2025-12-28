import React, { useState, useEffect, useRef } from 'react';
import { Room } from 'colyseus.js';
import { Clock, Lightbulb, Trophy, Users, Target } from 'lucide-react';
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
    // Listen for game state changes
    room.onStateChange((state) => {
      setPlayers(new Map(state.players));
      setGameStatus(state.status);
      setRoundNumber(state.currentRoundNumber);
      setTotalRounds(state.totalRounds);
      setTimeRemaining(state.currentRound.timeRemaining);
      
      if (state.currentRound.currentQuestion && state.currentRound.currentQuestion.id) {
        setCurrentQuestion(state.currentRound.currentQuestion);
        setHasAnswered(false);
        setSelectedAnswer('');
        setLastResult(null);
        setHint('');
        setShowResults(false);
        startTimeRef.current = Date.now();
      }
    });

    // Listen for game messages
    room.onMessage('new_round', (message) => {
      console.log('New round:', message);
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
      console.log('Answer result:', message);
      setLastResult(message);
      setHasAnswered(true);
    });

    room.onMessage('hint', (message) => {
      console.log('Hint received:', message);
      setHint(message.hint);
    });

    room.onMessage('round_ended', (message) => {
      console.log('Round ended:', message);
      setLeaderboard(message.leaderboard);
      setShowResults(true);
      setTimeout(() => setShowResults(false), 4000);
    });

    room.onMessage('game_ended', (message) => {
      console.log('Game ended:', message);
      setLeaderboard(message.finalResults);
      setTimeout(() => onGameEnd(), 5000);
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

  const getGameModeTheme = () => {
    if (!currentQuestion) return { bg: 'from-blue-500 to-purple-600', icon: '🎮' };
    
    switch (currentQuestion.gameMode) {
      case 'chess':
        return { bg: 'from-purple-500 to-indigo-600', icon: '♟️' };
      case 'minecraft':
        return { bg: 'from-green-500 to-emerald-600', icon: '🧱' };
      default:
        return { bg: 'from-yellow-500 to-orange-600', icon: '⚡' };
    }
  };

  const theme = getGameModeTheme();

  if (gameStatus === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-6">Game Complete!</h1>
          
          <div className="space-y-4 mb-8">
            {leaderboard.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  index === 0 ? 'bg-yellow-500/20 border border-yellow-400' :
                  index === 1 ? 'bg-gray-400/20 border border-gray-400' :
                  index === 2 ? 'bg-orange-500/20 border border-orange-400' :
                  'bg-white/5 border border-white/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="font-semibold text-white">{player.name}</span>
                </div>
                <span className="text-xl font-bold text-white">{player.score} pts</span>
              </div>
            ))}
          </div>
          
          <button
            onClick={onGameEnd}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">Waiting for next round...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className={`flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${theme.bg} text-white font-semibold`}>
            <span className="mr-2 text-xl">{theme.icon}</span>
            Round {roundNumber}/{totalRounds}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center px-4 py-2 bg-white/10 rounded-full text-white">
              <Clock className="w-5 h-5 mr-2" />
              {timeRemaining}s
            </div>
            <div className="flex items-center px-4 py-2 bg-white/10 rounded-full text-white">
              <Users className="w-5 h-5 mr-2" />
              {Array.from(players.values()).filter(p => p.connected).length} players
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">{currentQuestion.question}</h2>
            {hint && (
              <div className="bg-yellow-500/20 border border-yellow-400 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center text-yellow-400 font-semibold">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Hint: {hint}
                </div>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSubmit(option)}
                disabled={hasAnswered}
                className={`p-6 rounded-xl text-xl font-bold transition-all duration-200 ${
                  selectedAnswer === option
                    ? lastResult?.correct
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : hasAnswered
                    ? option === currentQuestion.correctAnswer
                      ? 'bg-green-500/50 text-white'
                      : 'bg-white/10 text-gray-400'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Hint Button */}
          {!hasAnswered && !hint && (
            <div className="text-center">
              <button
                onClick={handleHintRequest}
                className="flex items-center px-6 py-3 bg-yellow-500/20 border border-yellow-400 text-yellow-400 font-semibold rounded-xl hover:bg-yellow-500/30 transition-all duration-200 mx-auto"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Get Hint
              </button>
            </div>
          )}

          {/* Answer Result */}
          {lastResult && (
            <div className={`text-center p-4 rounded-xl ${
              lastResult.correct ? 'bg-green-500/20 border border-green-400' : 'bg-red-500/20 border border-red-400'
            }`}>
              <p className={`text-xl font-bold ${lastResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                {lastResult.correct ? '🎉 Correct!' : '❌ Incorrect'}
              </p>
              {lastResult.correct && (
                <p className="text-white mt-2">+{lastResult.points} points!</p>
              )}
            </div>
          )}
        </div>

        {/* Players Status */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2" />
            Player Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(players.values()).map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  player.answered ? 'bg-green-500/20 border border-green-400' : 'bg-white/5 border border-white/20'
                }`}
              >
                <div>
                  <p className="font-semibold text-white">{player.name}</p>
                  <p className="text-sm text-gray-300">{player.score} points</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  player.answered ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Round Results Overlay */}
        {showResults && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-white text-center mb-6">Round Complete!</h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      index === 0 ? 'bg-yellow-500/20 border border-yellow-400' :
                      'bg-white/10 border border-white/20'
                    }`}
                  >
                    <span className="text-white font-semibold">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {player.name}
                    </span>
                    <span className="text-white font-bold">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};