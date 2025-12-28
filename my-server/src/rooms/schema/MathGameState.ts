import { Schema, Context, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("number") score: number = 0;
  @type("number") level: number = 1;
  @type("boolean") ready: boolean = false;
  @type("boolean") answered: boolean = false;
  @type("string") answer: string = "";
  @type("number") answerTime: number = 0;
  @type("boolean") connected: boolean = true;
}

export class MathQuestion extends Schema {
  @type("string") id: string = "";
  @type("string") question: string = "";
  @type("string") correctAnswer: string = "";
  @type("number") difficulty: number = 1;
  @type("string") type: string = ""; // "addition", "subtraction", "multiplication", "division"
  @type("string") gameMode: string = ""; // "chess", "minecraft", "speed"
  @type(["string"]) options: ArraySchema<string> = new ArraySchema<string>();
  @type("number") timeLimit: number = 30;
}

export class GameRound extends Schema {
  @type("number") roundNumber: number = 1;
  @type(MathQuestion) currentQuestion: MathQuestion = new MathQuestion();
  @type("number") timeRemaining: number = 30;
  @type("boolean") active: boolean = false;
  @type("string") winner: string = "";
}

export class MathGameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(GameRound) currentRound: GameRound = new GameRound();
  @type("string") gameMode: string = "speed"; // "chess", "minecraft", "speed"
  @type("number") maxPlayers: number = 4;
  @type("string") status: string = "waiting"; // "waiting", "starting", "playing", "finished"
  @type("number") minLevel: number = 1;
  @type("number") maxLevel: number = 8;
  @type("number") totalRounds: number = 10;
  @type("number") currentRoundNumber: number = 0;
  @type(["string"]) leaderboard: ArraySchema<string> = new ArraySchema<string>();
}