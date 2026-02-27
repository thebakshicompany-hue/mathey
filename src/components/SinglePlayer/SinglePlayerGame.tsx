import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Lightbulb, Trophy, Target, Star, Zap, Home, RotateCcw, Shield, Activity, Crosshair } from 'lucide-react';
import { Character, GameMode, DifficultyLevel } from '../../types/game';
import toast from 'react-hot-toast';

interface MathQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  type: string;
  gameMode: string;
  timeLimit: number;
  hint: string;
}

interface SinglePlayerGameProps {
  character: Character;
  gameMode: GameMode;
  difficulty: DifficultyLevel;
  onGameEnd: () => void;
}

const HUDCorner = () => (
  <>
    <div className="hud-corner hud-corner-tl" />
    <div className="hud-corner hud-corner-tr" />
    <div className="hud-corner hud-corner-bl" />
    <div className="hud-corner hud-corner-br" />
  </>
);

export const SinglePlayerGame: React.FC<SinglePlayerGameProps> = ({
  character,
  gameMode,
  difficulty,
  onGameEnd
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hint, setHint] = useState('');
  const [gameComplete, setGameComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateNewQuestion();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeRemaining > 0 && !hasAnswered) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !hasAnswered) {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, hasAnswered]);

  const generateNewQuestion = () => {
    const question = createMathQuestion();
    setCurrentQuestion(question);
    setTimeRemaining(question.timeLimit);
    setSelectedAnswer('');
    setHasAnswered(false);
    setShowResult(false);
    setHint('');
    startTimeRef.current = Date.now();
  };

  const createMathQuestion = (): MathQuestion => {
    const difficultyNum = parseInt(difficulty.gradeRange.split(' ')[1].split('-')[0]);
    const question: MathQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      question: '',
      options: [],
      correctAnswer: '',
      explanation: '',
      difficulty: difficultyNum,
      type: '',
      gameMode: gameMode.id,
      timeLimit: difficulty.timeLimit,
      hint: ''
    };

    switch (gameMode.id) {
      case 'chess': return generateChessQuestion(question);
      case 'minecraft': return generateMinecraftQuestion(question);
      case 'space': return generateSpaceQuestion(question);
      case 'treasure': return generateTreasureQuestion(question);
      case 'mystery': return generateMysteryQuestion(question);
      default: return generateSpeedQuestion(question);
    }
  };

  const generateSpeedQuestion = (question: MathQuestion): MathQuestion => {
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    question.type = operations[Math.floor(Math.random() * operations.length)];
    const a = Math.floor(Math.random() * (question.difficulty * 12)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 6)) + 1;

    switch (question.type) {
      case 'addition':
        question.question = `${a} + ${b} = ?`;
        question.correctAnswer = (a + b).toString();
        question.explanation = `${a} + ${b} = ${a + b}`;
        question.hint = 'Try counting up from the larger number!';
        break;
      case 'subtraction':
        const larger = Math.max(a, b);
        const smaller = Math.min(a, b);
        question.question = `${larger} - ${smaller} = ?`;
        question.correctAnswer = (larger - smaller).toString();
        question.explanation = `${larger} - ${smaller} = ${larger - smaller}`;
        question.hint = 'Think about what you need to add to get the first number!';
        break;
      case 'multiplication':
        question.question = `${a} × ${b} = ?`;
        question.correctAnswer = (a * b).toString();
        question.explanation = `${a} × ${b} = ${a * b}`;
        question.hint = 'Remember: multiplication is repeated addition!';
        break;
      case 'division':
        const total = a * b;
        question.question = `${total} ÷ ${b} = ?`;
        question.correctAnswer = a.toString();
        question.explanation = `${total} ÷ ${b} = ${a}`;
        question.hint = 'Think: what times the second number gives the first?';
        break;
    }
    generateOptions(question);
    return question;
  };

  const generateChessQuestion = (question: MathQuestion): MathQuestion => {
    const a = Math.floor(Math.random() * (question.difficulty * 8)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 4)) + 1;
    question.question = `A knight moves ${a} squares forward and ${b} squares right. How many total squares?`;
    question.correctAnswer = (a + b).toString();
    question.hint = 'Add the forward and right movements together!';
    generateOptions(question);
    return question;
  };

  const generateMinecraftQuestion = (question: MathQuestion): MathQuestion => {
    const a = Math.floor(Math.random() * (question.difficulty * 10)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 5)) + 1;
    question.question = `You mine ${a} diamonds and find ${b} more. How many diamonds total?`;
    question.correctAnswer = (a + b).toString();
    question.hint = 'Add all the diamonds you collected!';
    generateOptions(question);
    return question;
  };

  const generateSpaceQuestion = (question: MathQuestion): MathQuestion => {
    const a = Math.floor(Math.random() * (question.difficulty * 15)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 8)) + 1;
    question.question = `Your spaceship travels ${a} light-years, then ${b} more. Total distance?`;
    question.correctAnswer = (a + b).toString();
    question.hint = 'Add both distances together!';
    generateOptions(question);
    return question;
  };

  const generateTreasureQuestion = (question: MathQuestion): MathQuestion => {
    const a = Math.floor(Math.random() * (question.difficulty * 20)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 10)) + 1;
    question.question = `You find ${a} gold coins and ${b} silver coins. How many coins total?`;
    question.correctAnswer = (a + b).toString();
    question.hint = 'Add all the coins together!';
    generateOptions(question);
    return question;
  };

  const generateMysteryQuestion = (question: MathQuestion): MathQuestion => {
    const a = Math.floor(Math.random() * (question.difficulty * 12)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 6)) + 1;
    question.question = `Detective finds ${a} clues in room A and ${b} clues in room B. Total clues?`;
    question.correctAnswer = (a + b).toString();
    question.hint = 'Add clues from both rooms!';
    generateOptions(question);
    return question;
  };

  const generateOptions = (question: MathQuestion) => {
    const correct = parseInt(question.correctAnswer);
    const options = [question.correctAnswer];
    for (let i = 0; i < 3; i++) {
      let wrong: number;
      do {
        const variance = Math.max(1, Math.floor(correct * 0.4));
        wrong = correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * variance) + 1);
      } while (wrong <= 0 || options.includes(wrong.toString()));
      options.push(wrong.toString());
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    question.options = options;
  };

  const handleAnswerSubmit = (answer: string) => {
    if (hasAnswered) return;
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setSelectedAnswer(answer);
    setHasAnswered(true);
    const correct = answer === currentQuestion?.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      const timeBonus = Math.max(0, (currentQuestion?.timeLimit || 30) - timeSpent);
      const basePoints = 10 * difficulty.pointMultiplier;
      const streakBonus = character.id === 'wizard' ? streak * 2 : streak;
      const points = Math.floor(basePoints + timeBonus + streakBonus);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      toast.success(`Correct! +${points} points!`);
    } else {
      setStreak(0);
      toast.error('Incorrect answer');
    }
    setTimeout(() => {
      if (questionNumber >= totalQuestions) endGame();
      else { setQuestionNumber(prev => prev + 1); generateNewQuestion(); }
    }, 3000);
  };

  const handleTimeUp = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setIsCorrect(false);
    setShowResult(true);
    setStreak(0);
    toast.error('Time\'s up!');
    setTimeout(() => {
      if (questionNumber >= totalQuestions) endGame();
      else { setQuestionNumber(prev => prev + 1); generateNewQuestion(); }
    }, 3000);
  };

  const handleHintRequest = () => {
    if (currentQuestion && !hint) { setHint(currentQuestion.hint); toast.success('Hint revealed!'); }
  };

  const endGame = () => {
    setGameComplete(true);
    setFinalScore(score);
  };

  if (gameComplete) {
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const grade = accuracy >= 90 ? 'S+' : accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : 'C';
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden font-mono text-white">
        <div className="scanline" />
        <div className="tactical-panel p-12 max-w-4xl w-full text-center border-orange-500/40">
          <HUDCorner />
          <Trophy className="w-24 h-24 text-orange-500 mx-auto mb-8 shadow-tactical-glow-xl" />
          <h1 className="text-6xl font-black uppercase italic italic text-white mb-4 glitch-text italic">Simulation Finished</h1>
          <p className="text-orange-500 font-bold mb-12 uppercase tracking-[0.5em] italic">Tactical Performance Report</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Calculated XP', val: finalScore, color: 'text-orange-500' },
              { label: 'Accuracy', val: `${accuracy}%`, color: 'text-green-500' },
              { label: 'Resolved', val: `${correctAnswers}/${totalQuestions}`, color: 'text-blue-500' },
              { label: 'Grade', val: grade, color: 'text-purple-500' },
            ].map((stat, i) => (
              <div key={i} className="tactical-panel p-6 bg-white/5 border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-2">{stat.label}</p>
                <p className={`text-4xl font-black italic italic ${stat.color}`}>{stat.val}</p>
              </div>
            ))}
          </div>

          <div className="flex space-x-6">
            <button onClick={() => { setQuestionNumber(1); setScore(0); setStreak(0); setCorrectAnswers(0); setGameComplete(false); generateNewQuestion(); }} className="flex-1 tactical-btn py-6 text-xl">
              RE-BOOT MISSION
            </button>
            <button onClick={onGameEnd} className="flex-2 tactical-btn-primary py-6 text-xl">
              RETURN TO COMMAND HUB
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-mono">
      <div className="scanline" />
      <div className="max-w-7xl mx-auto h-full flex flex-col">

        {/* TOP HUD */}
        <div className="flex justify-between items-start mb-12">
          <div className="tactical-panel px-8 py-4 border-l-orange-500">
            <HUDCorner />
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Simulation</span>
            <span className="text-3xl font-black italic uppercase italic tracking-tighter block mt-1 italic">Phase <span className="text-orange-500">{String(questionNumber).padStart(2, '0')}</span> <span className="text-gray-600 text-lg">/ {totalQuestions}</span></span>
          </div>

          <div className="flex space-x-6">
            <div className={`tactical-panel px-8 py-4 border-l-orange-500 bg-black/40 ${timeRemaining < 10 ? 'border-red-500' : ''}`}>
              <HUDCorner />
              <div className="flex items-center space-x-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Time Buffer</span>
                  <span className={`text-3xl font-black italic ${timeRemaining < 10 ? 'text-red-500 glitch-text italic' : 'text-white'}`}>{String(timeRemaining).padStart(2, '0')}s</span>
                </div>
                <Clock className={`w-10 h-10 ${timeRemaining < 10 ? 'text-red-500 animate-pulse' : 'text-orange-500/50'}`} />
              </div>
            </div>

            <div className="tactical-panel px-8 py-4 border-l-cyan-500 tactical-panel-cyan bg-black/40">
              <HUDCorner />
              <div className="flex items-center space-x-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Calculated XP</span>
                  <span className="text-3xl font-black italic text-cyan-500 italic">{score}</span>
                </div>
                <Trophy className="w-10 h-10 text-cyan-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER QUESTION */}
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl relative"
          >
            <div className="absolute -inset-10 pointer-events-none opacity-20 flex items-center justify-center">
              <div className="w-full h-full border border-orange-500 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-[120%] h-[120%] border-t border-b border-orange-500/50 rotate-45" />
              <div className="absolute w-[120%] h-[120%] border-t border-b border-orange-500/50 -rotate-45" />
            </div>

            <div className="tactical-panel p-20 text-center bg-black/90 border-orange-500/40 relative">
              <HUDCorner />
              <div className="absolute top-4 left-4 flex items-center space-x-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                <Target className="w-3 h-3" />
                <span>Solo Training Objective</span>
              </div>

              <h2 className="text-7xl font-black uppercase italic italic tracking-tight mb-16 glitch-text leading-none italic">
                {currentQuestion.question}
              </h2>

              {hint && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-12 p-6 bg-cyan-500/5 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black uppercase italic italic tracking-widest text-lg italic">
                  Tactical Intel: {hint}
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-8">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(option)}
                    disabled={hasAnswered}
                    className={`tactical-btn py-10 text-4xl font-black italic italic transition-all ${selectedAnswer === option
                        ? isCorrect ? 'bg-green-600/20 text-green-500 border-green-500/50 shadow-tactical-glow-green' : 'bg-red-600/20 text-red-500 border-red-500/50 shadow-tactical-glow-red'
                        : hasAnswered ? option === currentQuestion.correctAnswer ? 'bg-green-600/10 text-green-500 border-green-500/30 border-dashed' : 'opacity-10 scale-95'
                          : 'hover:bg-orange-500/10 hover:border-orange-500/50'
                      }`}
                  >
                    <span className="text-xs absolute top-2 left-4 text-gray-500 font-mono tracking-widest">INPUT_0{index + 1}</span>
                    {option}
                  </button>
                ))}
              </div>

              {!hasAnswered && !hint && (
                <button onClick={handleHintRequest} className="mt-12 flex items-center space-x-3 text-orange-500/40 hover:text-orange-500 font-black uppercase italic text-xs tracking-[0.4em] transition-all group">
                  <Lightbulb className="w-4 h-4 group-hover:animate-bounce" />
                  <span>Request Intelligence Overlay</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* BOTTOM CHAR DISPLAY */}
        <div className="mt-auto py-8">
          <div className="tactical-panel p-6 max-w-md mx-auto flex items-center space-x-6 border-l-4 border-l-orange-500">
            <HUDCorner />
            <div className={`w-16 h-16 rounded-sm bg-gradient-to-r ${character.color} flex items-center justify-center text-3xl`}>
              {character.avatar}
            </div>
            <div>
              <h4 className="text-sm font-black uppercase italic italic italic">{character.name}</h4>
              <p className="text-[10px] font-black text-orange-500 animate-pulse uppercase tracking-[0.2em]">{character.specialAbility}</p>
            </div>
            <div className="ml-auto flex flex-col items-end">
              <span className="text-[9px] font-black text-gray-600 uppercase">Streak</span>
              <span className="text-2xl font-black italic text-orange-500 italic">{streak}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};