import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Lightbulb, Trophy, Target, Star, Zap, Home, RotateCcw } from 'lucide-react';
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

    // Generate question based on game mode
    switch (gameMode.id) {
      case 'chess':
        return generateChessQuestion(question);
      case 'minecraft':
        return generateMinecraftQuestion(question);
      case 'space':
        return generateSpaceQuestion(question);
      case 'treasure':
        return generateTreasureQuestion(question);
      case 'mystery':
        return generateMysteryQuestion(question);
      default:
        return generateSpeedQuestion(question);
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
    const operations = ['addition', 'subtraction', 'multiplication'];
    question.type = operations[Math.floor(Math.random() * operations.length)];
    
    const a = Math.floor(Math.random() * (question.difficulty * 8)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 4)) + 1;
    
    switch (question.type) {
      case 'addition':
        question.question = `A knight moves ${a} squares forward and ${b} squares right. How many total squares?`;
        question.correctAnswer = (a + b).toString();
        question.hint = 'Add the forward and right movements together!';
        break;
      case 'subtraction':
        question.question = `You have ${a} chess pieces and lose ${b} in battle. How many remain?`;
        question.correctAnswer = (a - b).toString();
        question.hint = 'Subtract the pieces lost from your total!';
        break;
      case 'multiplication':
        question.question = `Each chess row has ${a} squares. With ${b} rows, how many squares total?`;
        question.correctAnswer = (a * b).toString();
        question.hint = 'Multiply squares per row by number of rows!';
        break;
    }
    
    generateOptions(question);
    return question;
  };

  const generateMinecraftQuestion = (question: MathQuestion): MathQuestion => {
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    question.type = operations[Math.floor(Math.random() * operations.length)];
    
    const a = Math.floor(Math.random() * (question.difficulty * 10)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 5)) + 1;
    
    switch (question.type) {
      case 'addition':
        question.question = `You mine ${a} diamonds and find ${b} more. How many diamonds total?`;
        question.correctAnswer = (a + b).toString();
        question.hint = 'Add all the diamonds you collected!';
        break;
      case 'subtraction':
        question.question = `You have ${a} blocks and use ${b} to build. How many blocks left?`;
        question.correctAnswer = (a - b).toString();
        question.hint = 'Subtract the blocks used from your total!';
        break;
      case 'multiplication':
        question.question = `Each chest holds ${a} items. With ${b} chests, how many items total?`;
        question.correctAnswer = (a * b).toString();
        question.hint = 'Multiply items per chest by number of chests!';
        break;
      case 'division':
        const total = a * b;
        question.question = `You have ${total} emeralds to split among ${b} players. How many each?`;
        question.correctAnswer = a.toString();
        question.hint = 'Divide the total emeralds by the number of players!';
        break;
    }
    
    generateOptions(question);
    return question;
  };

  const generateSpaceQuestion = (question: MathQuestion): MathQuestion => {
    const operations = ['addition', 'subtraction', 'multiplication'];
    question.type = operations[Math.floor(Math.random() * operations.length)];
    
    const a = Math.floor(Math.random() * (question.difficulty * 15)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 8)) + 1;
    
    switch (question.type) {
      case 'addition':
        question.question = `Your spaceship travels ${a} light-years, then ${b} more. Total distance?`;
        question.correctAnswer = (a + b).toString();
        question.hint = 'Add both distances together!';
        break;
      case 'subtraction':
        question.question = `You have ${a} fuel units and use ${b} for takeoff. How many left?`;
        question.correctAnswer = (a - b).toString();
        question.hint = 'Subtract fuel used from your total!';
        break;
      case 'multiplication':
        question.question = `Each planet has ${a} moons. With ${b} planets, how many moons total?`;
        question.correctAnswer = (a * b).toString();
        question.hint = 'Multiply moons per planet by number of planets!';
        break;
    }
    
    generateOptions(question);
    return question;
  };

  const generateTreasureQuestion = (question: MathQuestion): MathQuestion => {
    const operations = ['addition', 'subtraction', 'multiplication'];
    question.type = operations[Math.floor(Math.random() * operations.length)];
    
    const a = Math.floor(Math.random() * (question.difficulty * 20)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 10)) + 1;
    
    switch (question.type) {
      case 'addition':
        question.question = `You find ${a} gold coins and ${b} silver coins. How many coins total?`;
        question.correctAnswer = (a + b).toString();
        question.hint = 'Add all the coins together!';
        break;
      case 'subtraction':
        question.question = `Your treasure chest has ${a} gems but ${b} are fake. How many real gems?`;
        question.correctAnswer = (a - b).toString();
        question.hint = 'Subtract the fake gems from the total!';
        break;
      case 'multiplication':
        question.question = `Each treasure map leads to ${a} gold pieces. With ${b} maps, how much gold?`;
        question.correctAnswer = (a * b).toString();
        question.hint = 'Multiply gold per map by number of maps!';
        break;
    }
    
    generateOptions(question);
    return question;
  };

  const generateMysteryQuestion = (question: MathQuestion): MathQuestion => {
    const operations = ['addition', 'subtraction', 'multiplication'];
    question.type = operations[Math.floor(Math.random() * operations.length)];
    
    const a = Math.floor(Math.random() * (question.difficulty * 12)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 6)) + 1;
    
    switch (question.type) {
      case 'addition':
        question.question = `Detective finds ${a} clues in room A and ${b} clues in room B. Total clues?`;
        question.correctAnswer = (a + b).toString();
        question.hint = 'Add clues from both rooms!';
        break;
      case 'subtraction':
        question.question = `There were ${a} suspects, but ${b} have alibis. How many remain?`;
        question.correctAnswer = (a - b).toString();
        question.hint = 'Subtract suspects with alibis from the total!';
        break;
      case 'multiplication':
        question.question = `Each witness saw ${a} suspicious people. With ${b} witnesses, how many sightings?`;
        question.correctAnswer = (a * b).toString();
        question.hint = 'Multiply sightings per witness by number of witnesses!';
        break;
    }
    
    generateOptions(question);
    return question;
  };

  const generateOptions = (question: MathQuestion) => {
    const correct = parseInt(question.correctAnswer);
    const options = [question.correctAnswer];
    
    // Generate 3 wrong answers
    for (let i = 0; i < 3; i++) {
      let wrong: number;
      do {
        const variance = Math.max(1, Math.floor(correct * 0.4));
        wrong = correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * variance) + 1);
      } while (wrong <= 0 || options.includes(wrong.toString()));
      
      options.push(wrong.toString());
    }
    
    // Shuffle options
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
    
    // Move to next question after delay
    setTimeout(() => {
      if (questionNumber >= totalQuestions) {
        endGame();
      } else {
        setQuestionNumber(prev => prev + 1);
        generateNewQuestion();
      }
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
      if (questionNumber >= totalQuestions) {
        endGame();
      } else {
        setQuestionNumber(prev => prev + 1);
        generateNewQuestion();
      }
    }, 3000);
  };

  const handleHintRequest = () => {
    if (currentQuestion && !hint) {
      setHint(currentQuestion.hint);
      toast.success('Hint revealed!');
    }
  };

  const endGame = () => {
    setGameComplete(true);
    setFinalScore(score);
    
    // Calculate performance
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    if (accuracy >= 90) {
      toast.success('🏆 Perfect Performance!');
    } else if (accuracy >= 70) {
      toast.success('🎉 Great Job!');
    } else {
      toast('Keep practicing!');
    }
  };

  const restartGame = () => {
    setQuestionNumber(1);
    setScore(0);
    setStreak(0);
    setCorrectAnswers(0);
    setGameComplete(false);
    generateNewQuestion();
  };

  const getGameModeTheme = () => {
    switch (gameMode.id) {
      case 'chess':
        return { bg: 'from-purple-500 to-indigo-600', icon: '♟️' };
      case 'minecraft':
        return { bg: 'from-green-500 to-emerald-600', icon: '🧱' };
      case 'space':
        return { bg: 'from-indigo-500 to-purple-600', icon: '🚀' };
      case 'treasure':
        return { bg: 'from-amber-500 to-yellow-600', icon: '💰' };
      case 'mystery':
        return { bg: 'from-gray-600 to-slate-700', icon: '🔍' };
      default:
        return { bg: 'from-yellow-500 to-orange-600', icon: '⚡' };
    }
  };

  const theme = getGameModeTheme();

  if (gameComplete) {
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const grade = accuracy >= 90 ? 'A+' : accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 60 ? 'C' : 'D';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${character.color} flex items-center justify-center text-4xl`}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {character.avatar}
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-2">Game Complete!</h1>
          <p className="text-xl text-gray-300 mb-6">{character.name} has finished the challenge!</p>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-yellow-400">{finalScore}</div>
              <div className="text-gray-300">Final Score</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-400">{accuracy}%</div>
              <div className="text-gray-300">Accuracy</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-400">{correctAnswers}/{totalQuestions}</div>
              <div className="text-gray-300">Correct</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400">{grade}</div>
              <div className="text-gray-300">Grade</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={restartGame}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </motion.button>
            
            <motion.button
              onClick={onGameEnd}
              className="flex items-center px-6 py-3 bg-gray-500/20 border border-gray-400 text-gray-300 font-semibold rounded-xl hover:bg-gray-500/30 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5 mr-2" />
              Main Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">Generating question...</h2>
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
            Question {questionNumber}/{totalQuestions}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center px-4 py-2 bg-white/10 rounded-full text-white">
              <Clock className="w-5 h-5 mr-2" />
              {timeRemaining}s
            </div>
            <div className="flex items-center px-4 py-2 bg-white/10 rounded-full text-white">
              <Trophy className="w-5 h-5 mr-2" />
              {score} pts
            </div>
            {streak > 0 && (
              <div className="flex items-center px-4 py-2 bg-yellow-500/20 border border-yellow-400 rounded-full text-yellow-400">
                <Zap className="w-5 h-5 mr-2" />
                {streak} streak
              </div>
            )}
          </div>
        </div>

        {/* Character Display */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${character.color} flex items-center justify-center text-2xl`}>
              {character.avatar}
            </div>
            <div>
              <p className="text-white font-semibold">{character.name}</p>
              <p className="text-gray-300 text-sm">{character.specialAbility}</p>
            </div>
          </div>
        </div>

        {/* Question */}
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6"
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">{currentQuestion.question}</h2>
            {hint && (
              <motion.div 
                className="bg-yellow-500/20 border border-yellow-400 rounded-xl p-4 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center justify-center text-yellow-400 font-semibold">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Hint: {hint}
                </div>
              </motion.div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswerSubmit(option)}
                disabled={hasAnswered}
                className={`p-6 rounded-xl text-xl font-bold transition-all duration-200 ${
                  selectedAnswer === option
                    ? isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : hasAnswered
                    ? option === currentQuestion.correctAnswer
                      ? 'bg-green-500/50 text-white'
                      : 'bg-white/10 text-gray-400'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
              >
                {option}
              </motion.button>
            ))}
          </div>

          {/* Hint Button */}
          {!hasAnswered && !hint && (
            <div className="text-center mb-4">
              <motion.button
                onClick={handleHintRequest}
                className="flex items-center px-6 py-3 bg-yellow-500/20 border border-yellow-400 text-yellow-400 font-semibold rounded-xl hover:bg-yellow-500/30 transition-all duration-200 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Get Hint
              </motion.button>
            </div>
          )}

          {/* Answer Result */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                className={`text-center p-4 rounded-xl ${
                  isCorrect ? 'bg-green-500/20 border border-green-400' : 'bg-red-500/20 border border-red-400'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <p className={`text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                </p>
                {currentQuestion.explanation && (
                  <p className="text-white mt-2">{currentQuestion.explanation}</p>
                )}
                <p className="text-gray-300 text-sm mt-2">
                  {questionNumber < totalQuestions ? 'Next question in 3 seconds...' : 'Calculating final score...'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress Bar */}
        <div className="bg-white/10 rounded-full h-3 mb-4">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${theme.bg}`}
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{score}</div>
            <div className="text-gray-300 text-sm">Score</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
            <div className="text-gray-300 text-sm">Correct</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{streak}</div>
            <div className="text-gray-300 text-sm">Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};