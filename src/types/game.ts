export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  color: string;
  specialAbility: string;
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export interface DifficultyLevel {
  id: string;
  name: string;
  description: string;
  gradeRange: string;
  timeLimit: number;
  pointMultiplier: number;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  character: Character;
  score: number;
  level: number;
  ready: boolean;
  answered: boolean;
  connected: boolean;
  streak: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'message' | 'system' | 'achievement';
}

export interface MathQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  type: string;
  gameMode: string;
  timeLimit: number;
  hint: string;
}

export interface GameState {
  players: Map<string, Player>;
  currentQuestion: MathQuestion | null;
  gameMode: string;
  difficulty: string;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  roundNumber: number;
  totalRounds: number;
  timeRemaining: number;
  leaderboard: Player[];
  chatMessages: ChatMessage[];
}