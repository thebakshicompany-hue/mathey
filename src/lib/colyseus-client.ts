import { Client, Room } from 'colyseus.js';

export interface GameOptions {
  name: string;
  level: number;
  gameMode: 'speed' | 'chess' | 'minecraft';
  character: string; // Added character property
  maxPlayers?: number;
  totalRounds?: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  level: number;
  ready: boolean;
  answered: boolean;
  connected: boolean;
}

export interface MathQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  timeLimit: number;
  difficulty: number;
  type: string;
  gameMode: string;
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  score: number;
}

export interface GameState {
  players: Map<string, Player>;
  currentRound: {
    roundNumber: number;
    currentQuestion: MathQuestion;
    timeRemaining: number;
    active: boolean;
    winner: string;
  };
  gameMode: string;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  totalRounds: number;
  currentRoundNumber: number;
  leaderboard: LeaderboardPlayer[];
}

class ColyseusClient {
  private client: Client;
  private room: Room | null = null;

  constructor() {
    const shouldUseSecure = window.location.protocol === "https:";
    const defaultUrl = shouldUseSecure ? 'wss://vbnm1bbg-matheybackend.hf.space' : 'ws://localhost:2567';
    const serverUrl = import.meta.env.VITE_COLYSEUS_URL || defaultUrl;
    console.log('Connecting to Colyseus server at:', serverUrl);
    this.client = new Client(serverUrl);
  }

  async joinGame(options: GameOptions): Promise<Room> {
    try {
      console.log('Attempting to join or create room with options:', options);
      console.log('Options being sent to joinOrCreate:', options);
      this.room = await this.client.joinOrCreate('my_room', options);
      console.log('Successfully joined/created room:', getRoomId(this.room));
      console.log('Room ID:', getRoomId(this.room));
      console.log('Session ID:', (this.room as Room).sessionId);
      return this.room;
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    }
  }

  async createRoom(options: GameOptions): Promise<Room> {
    try {
      console.log('Attempting to create room with options:', options);
      const newRoom = await this.client.create('my_room', options);
      this.room = newRoom;
      console.log('Successfully created room:', getRoomId(this.room));
      return newRoom;
    } catch (error) {
      console.error('Error in createRoom:', error);
      throw error;
    }
  }

  async leaveGame(): Promise<void> {
    if (this.room) {
      console.log('Attempting to leave room:', getRoomId(this.room));
      await this.room.leave();
      this.room = null;
      console.log('Successfully left room.');
    }
  }

  async joinRoomById(roomId: string, options: GameOptions): Promise<Room> {
    try {
      console.log('Attempting to join room by ID:', roomId, 'with options:', options);
      this.room = await this.client.joinById(roomId, options);
      console.log('Successfully joined room by ID:', getRoomId(this.room));
      return this.room;
    } catch (error) {
      console.error(`Failed to join room by ID ${roomId}:`, error);
      throw error;
    }
  }

  sendReady(): void {
    if (this.room) {
      this.room.send('ready');
    }
  }

  sendAnswer(answer: string, timeSpent: number): void {
    if (this.room) {
      this.room.send('answer', { answer, timeSpent });
    }
  }

  requestHint(): void {
    if (this.room) {
      this.room.send('request_hint');
    }
  }

  getCurrentRoom(): Room | null {
    return this.room;
  }

  isConnected(): boolean {
    return this.room !== null;
  }
}

export const colyseusClient = new ColyseusClient();

export const getRoomId = (room: Room | null | undefined): string | undefined => {
  const r = room as any;
  return r?.roomId ?? r?.id;
};