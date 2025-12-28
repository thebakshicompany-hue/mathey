import { Room, Client, Delayed } from "colyseus";
import { MathGameState, Player, MathQuestion, GameRound } from "./schema/MathGameState";

interface JoinOptions {
  name: string;
  level: number;
  gameMode: string;
}

interface AnswerMessage {
  answer: string;
  timeSpent: number;
}

export class MathGameRoom extends Room<MathGameState> {
  maxClients = 8;
  private roundTimer?: Delayed;
  private gameStartTimer?: Delayed;

  onCreate(options: any) {
    this.setState(new MathGameState());
    
    // Configure room based on options
    this.state.gameMode = options.gameMode || "speed";
    this.state.maxPlayers = options.maxPlayers || 4;
    this.state.minLevel = options.minLevel || 1;
    this.state.maxLevel = options.maxLevel || 8;
    this.state.totalRounds = options.totalRounds || 10;

    console.log(`MathGameRoom created with mode: ${this.state.gameMode}`);

    // Handle player messages
    this.onMessage("answer", (client, message: AnswerMessage) => {
      this.handlePlayerAnswer(client, message);
    });

    this.onMessage("ready", (client) => {
      this.handlePlayerReady(client);
    });

    this.onMessage("request_hint", (client) => {
      this.sendHint(client);
    });
  }

  onJoin(client: Client, options: JoinOptions) {
    console.log(`Player ${client.sessionId} joined with name: ${options.name}`);
    
    const player = new Player();
    player.id = client.sessionId;
    player.name = options.name || `Player ${this.clients.length}`;
    player.level = options.level || 1;
    player.score = 0;
    player.ready = false;
    player.connected = true;

    this.state.players.set(client.sessionId, player);

    // Send welcome message
    client.send("welcome", {
      message: `Welcome to Mathey ${this.state.gameMode} mode!`,
      gameMode: this.state.gameMode,
      totalRounds: this.state.totalRounds
    });

    // Check if we can start the game
    this.checkGameStart();
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Player ${client.sessionId} left`);
    
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = false;
      
      // Remove player after 30 seconds if they don't reconnect
      this.clock.setTimeout(() => {
        if (!player.connected) {
          this.state.players.delete(client.sessionId);
          this.checkGameStart();
        }
      }, 30000);
    }
  }

  onDispose() {
    console.log("MathGameRoom disposed");
    if (this.roundTimer) {
      this.roundTimer.clear();
    }
    if (this.gameStartTimer) {
      this.gameStartTimer.clear();
    }
  }

  private checkGameStart() {
    const connectedPlayers = Array.from(this.state.players.values()).filter(p => p.connected);
    const readyPlayers = connectedPlayers.filter(p => p.ready);

    if (this.state.status === "waiting" && connectedPlayers.length >= 2) {
      if (readyPlayers.length === connectedPlayers.length) {
        this.startGame();
      } else {
        this.broadcast("waiting_for_players", {
          ready: readyPlayers.length,
          total: connectedPlayers.length
        });
      }
    }
  }

  private startGame() {
    this.state.status = "starting";
    this.state.currentRoundNumber = 0;
    
    this.broadcast("game_starting", { countdown: 3 });
    
    this.gameStartTimer = this.clock.setTimeout(() => {
      this.state.status = "playing";
      this.startNewRound();
    }, 3000);
  }

  private startNewRound() {
    this.state.currentRoundNumber++;
    
    if (this.state.currentRoundNumber > this.state.totalRounds) {
      this.endGame();
      return;
    }

    // Reset player states for new round
    this.state.players.forEach(player => {
      player.answered = false;
      player.answer = "";
      player.answerTime = 0;
    });

    // Generate new question
    const question = this.generateMathQuestion();
    this.state.currentRound.currentQuestion = question;
    this.state.currentRound.roundNumber = this.state.currentRoundNumber;
    this.state.currentRound.timeRemaining = question.timeLimit;
    this.state.currentRound.active = true;
    this.state.currentRound.winner = "";

    this.broadcast("new_round", {
      roundNumber: this.state.currentRoundNumber,
      totalRounds: this.state.totalRounds,
      question: {
        id: question.id,
        question: question.question,
        options: question.options,
        timeLimit: question.timeLimit,
        gameMode: question.gameMode,
        type: question.type
      }
    });

    // Start round timer
    this.startRoundTimer();
  }

  private startRoundTimer() {
    const updateInterval = this.clock.setInterval(() => {
      if (this.state.currentRound.timeRemaining > 0) {
        this.state.currentRound.timeRemaining--;
      } else {
        this.endRound();
        updateInterval.clear();
      }
    }, 1000);
  }

  private generateMathQuestion(): MathQuestion {
    const question = new MathQuestion();
    question.id = Math.random().toString(36).substr(2, 9);
    question.gameMode = this.state.gameMode;
    
    // Determine difficulty based on player levels
    const avgLevel = this.getAveragePlayerLevel();
    question.difficulty = Math.max(1, Math.min(8, avgLevel));
    
    // Generate question based on game mode
    switch (this.state.gameMode) {
      case "chess":
        return this.generateChessMathQuestion(question);
      case "minecraft":
        return this.generateMinecraftMathQuestion(question);
      default:
        return this.generateSpeedMathQuestion(question);
    }
  }

  private generateChessMathQuestion(question: MathQuestion): MathQuestion {
    const operations = ["addition", "subtraction", "multiplication"];
    question.type = operations[Math.floor(Math.random() * operations.length)];
    
    const a = Math.floor(Math.random() * (question.difficulty * 10)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 5)) + 1;
    
    switch (question.type) {
      case "addition":
        question.question = `A chess knight moves ${a} squares forward and ${b} squares right. How many total squares did it move?`;
        question.correctAnswer = (a + b).toString();
        break;
      case "subtraction":
        question.question = `You have ${a} chess pieces and lose ${b} in battle. How many pieces remain?`;
        question.correctAnswer = (a - b).toString();
        break;
      case "multiplication":
        question.question = `Each chess board row has ${a} squares. With ${b} rows, how many squares total?`;
        question.correctAnswer = (a * b).toString();
        break;
    }
    
    question.timeLimit = 45;
    this.generateMultipleChoiceOptions(question);
    return question;
  }

  private generateMinecraftMathQuestion(question: MathQuestion): MathQuestion {
    const operations = ["addition", "subtraction", "multiplication", "division"];
    question.type = operations[Math.floor(Math.random() * operations.length)];
    
    const a = Math.floor(Math.random() * (question.difficulty * 8)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 4)) + 1;
    
    switch (question.type) {
      case "addition":
        question.question = `You mine ${a} diamonds and find ${b} more. How many diamonds do you have?`;
        question.correctAnswer = (a + b).toString();
        break;
      case "subtraction":
        question.question = `You have ${a} blocks and use ${b} to build. How many blocks are left?`;
        question.correctAnswer = (a - b).toString();
        break;
      case "multiplication":
        question.question = `Each chest holds ${a} items. With ${b} chests, how many items total?`;
        question.correctAnswer = (a * b).toString();
        break;
      case "division":
        const total = a * b;
        question.question = `You have ${total} emeralds to split equally among ${b} players. How many does each get?`;
        question.correctAnswer = a.toString();
        break;
    }
    
    question.timeLimit = 40;
    this.generateMultipleChoiceOptions(question);
    return question;
  }

  private generateSpeedMathQuestion(question: MathQuestion): MathQuestion {
    const operations = ["addition", "subtraction", "multiplication", "division"];
    question.type = operations[Math.floor(Math.random() * operations.length)];
    
    const a = Math.floor(Math.random() * (question.difficulty * 12)) + 1;
    const b = Math.floor(Math.random() * (question.difficulty * 6)) + 1;
    
    switch (question.type) {
      case "addition":
        question.question = `${a} + ${b} = ?`;
        question.correctAnswer = (a + b).toString();
        break;
      case "subtraction":
        question.question = `${a} - ${b} = ?`;
        question.correctAnswer = (a - b).toString();
        break;
      case "multiplication":
        question.question = `${a} × ${b} = ?`;
        question.correctAnswer = (a * b).toString();
        break;
      case "division":
        const total = a * b;
        question.question = `${total} ÷ ${b} = ?`;
        question.correctAnswer = a.toString();
        break;
    }
    
    question.timeLimit = 30;
    this.generateMultipleChoiceOptions(question);
    return question;
  }

  private generateMultipleChoiceOptions(question: MathQuestion) {
    const correct = parseInt(question.correctAnswer);
    const options = [question.correctAnswer];
    
    // Generate 3 wrong answers
    for (let i = 0; i < 3; i++) {
      let wrong: number;
      do {
        const variance = Math.max(1, Math.floor(correct * 0.3));
        wrong = correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * variance) + 1);
      } while (wrong <= 0 || options.includes(wrong.toString()));
      
      options.push(wrong.toString());
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    question.options.clear();
    options.forEach(option => question.options.push(option));
  }

  private handlePlayerAnswer(client: Client, message: AnswerMessage) {
    const player = this.state.players.get(client.sessionId);
    if (!player || player.answered || !this.state.currentRound.active) {
      return;
    }

    player.answered = true;
    player.answer = message.answer;
    player.answerTime = message.timeSpent;

    const isCorrect = message.answer === this.state.currentRound.currentQuestion.correctAnswer;
    
    if (isCorrect) {
      // Calculate score based on speed and difficulty
      const timeBonus = Math.max(0, this.state.currentRound.currentQuestion.timeLimit - message.timeSpent);
      const difficultyMultiplier = this.state.currentRound.currentQuestion.difficulty;
      const points = (10 + timeBonus) * difficultyMultiplier;
      
      player.score += points;
      
      // Set round winner if first correct answer
      if (!this.state.currentRound.winner) {
        this.state.currentRound.winner = client.sessionId;
      }
    }

    client.send("answer_result", {
      correct: isCorrect,
      correctAnswer: this.state.currentRound.currentQuestion.correctAnswer,
      points: isCorrect ? player.score : 0,
      timeSpent: message.timeSpent
    });

    // Check if all players have answered
    const allAnswered = Array.from(this.state.players.values())
      .filter(p => p.connected)
      .every(p => p.answered);
    
    if (allAnswered) {
      this.endRound();
    }
  }

  private handlePlayerReady(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.ready = true;
      this.checkGameStart();
    }
  }

  private sendHint(client: Client) {
    const question = this.state.currentRound.currentQuestion;
    let hint = "";
    
    switch (question.type) {
      case "addition":
        hint = "Try breaking down the numbers into smaller parts and adding them step by step.";
        break;
      case "subtraction":
        hint = "Think about counting backwards or what you need to add to get the first number.";
        break;
      case "multiplication":
        hint = "Remember that multiplication is repeated addition. Try skip counting!";
        break;
      case "division":
        hint = "Think about how many groups you can make or use the opposite of multiplication.";
        break;
      default:
        hint = "Take your time and think through the problem step by step.";
    }
    
    client.send("hint", { hint, questionId: question.id });
  }

  private endRound() {
    this.state.currentRound.active = false;
    
    // Update leaderboard
    this.updateLeaderboard();
    
    this.broadcast("round_ended", {
      correctAnswer: this.state.currentRound.currentQuestion.correctAnswer,
      winner: this.state.currentRound.winner,
      leaderboard: this.getLeaderboardData(),
      nextRoundIn: 5
    });

    // Start next round after delay
    this.clock.setTimeout(() => {
      this.startNewRound();
    }, 5000);
  }

  private endGame() {
    this.state.status = "finished";
    this.updateLeaderboard();
    
    const finalResults = this.getLeaderboardData();
    
    this.broadcast("game_ended", {
      finalResults,
      winner: finalResults[0],
      playAgain: true
    });

    // Auto-dispose room after 2 minutes
    this.clock.setTimeout(() => {
      this.disconnect();
    }, 120000);
  }

  private getAveragePlayerLevel(): number {
    const players = Array.from(this.state.players.values()).filter(p => p.connected);
    if (players.length === 0) return 1;
    
    const totalLevel = players.reduce((sum, player) => sum + player.level, 0);
    return Math.round(totalLevel / players.length);
  }

  private updateLeaderboard() {
    const sortedPlayers = Array.from(this.state.players.values())
      .filter(p => p.connected)
      .sort((a, b) => b.score - a.score);
    
    this.state.leaderboard.clear();
    sortedPlayers.forEach(player => {
      this.state.leaderboard.push(player.id);
    });
  }

  private getLeaderboardData() {
    return Array.from(this.state.players.values())
      .filter(p => p.connected)
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        id: player.id,
        name: player.name,
        score: player.score,
        level: player.level
      }));
  }
}