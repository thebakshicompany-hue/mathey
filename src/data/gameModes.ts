import { GameMode, DifficultyLevel } from '../types/game';

export const gameModes: GameMode[] = [
  {
    id: 'speed',
    name: 'Speed Lightning',
    description: 'Fast-paced arithmetic challenges that test your quick thinking',
    icon: '⚡',
    color: 'from-yellow-400 to-orange-500',
    features: ['Quick calculations', 'Time pressure', 'Streak bonuses', 'Lightning rounds']
  },
  {
    id: 'chess',
    name: 'Chess Master',
    description: 'Strategic mathematical puzzles with chess-themed challenges',
    icon: '♟️',
    color: 'from-purple-400 to-indigo-500',
    features: ['Strategic thinking', 'Pattern recognition', 'Chess scenarios', 'Logic puzzles']
  },
  {
    id: 'minecraft',
    name: 'Block Builder',
    description: 'Adventure-based math problems in a block-building world',
    icon: '🧱',
    color: 'from-green-400 to-emerald-500',
    features: ['Building scenarios', 'Resource counting', 'Crafting recipes', 'World exploration']
  },
  {
    id: 'space',
    name: 'Cosmic Quest',
    description: 'Explore the universe while solving astronomical math problems',
    icon: '🚀',
    color: 'from-indigo-500 to-purple-600',
    features: ['Space exploration', 'Planetary math', 'Rocket science', 'Galaxy adventures']
  },
  {
    id: 'treasure',
    name: 'Treasure Hunt',
    description: 'Pirate adventures with gold counting and treasure calculations',
    icon: '💰',
    color: 'from-amber-500 to-yellow-600',
    features: ['Treasure counting', 'Map coordinates', 'Pirate scenarios', 'Gold calculations']
  },
  {
    id: 'mystery',
    name: 'Math Detective',
    description: 'Solve mathematical mysteries and crack numerical codes',
    icon: '🔍',
    color: 'from-gray-600 to-slate-700',
    features: ['Code breaking', 'Pattern solving', 'Mystery scenarios', 'Logic deduction']
  }
];

export const difficultyLevels: DifficultyLevel[] = [
  {
    id: 'beginner',
    name: 'Beginner Explorer',
    description: 'Perfect for starting your math adventure',
    gradeRange: 'Grades 1-2',
    timeLimit: 45,
    pointMultiplier: 1,
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'elementary',
    name: 'Elementary Champion',
    description: 'Building strong foundations',
    gradeRange: 'Grades 3-4',
    timeLimit: 35,
    pointMultiplier: 1.2,
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'intermediate',
    name: 'Intermediate Master',
    description: 'Ready for bigger challenges',
    gradeRange: 'Grades 5-6',
    timeLimit: 30,
    pointMultiplier: 1.5,
    color: 'from-purple-400 to-indigo-500'
  },
  {
    id: 'advanced',
    name: 'Advanced Genius',
    description: 'For the mathematically gifted',
    gradeRange: 'Grades 7-8',
    timeLimit: 25,
    pointMultiplier: 2,
    color: 'from-red-400 to-pink-500'
  },
  {
    id: 'expert',
    name: 'Expert Legend',
    description: 'Ultimate mathematical challenge',
    gradeRange: 'High School+',
    timeLimit: 20,
    pointMultiplier: 3,
    color: 'from-amber-400 to-orange-500'
  }
];