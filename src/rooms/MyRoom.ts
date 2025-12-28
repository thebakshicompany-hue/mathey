import { Room, Client } from 'colyseus';
import { Schema, MapSchema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("number") score: number = 0;
  @type("number") level: number;
  @type("boolean") ready: boolean = false;
  @type("boolean") answered: boolean = false;
  @type("boolean") connected: boolean = true;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("string") status: 'waiting' | 'starting' | 'playing' | 'finished' = 'waiting';
  @type("number") currentRoundNumber: number = 0;
  @type("number") totalRounds: number = 10;
  @type("string") gameMode: string;
}

export class MyRoom extends Room<MyRoomState> {
  maxClients = 6;

  onCreate(options: any) {
    this.setState(new MyRoomState());
    this.state.gameMode = options.gameMode;

    this.onMessage("ready", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.ready = true;
        this.broadcast("waiting_for_players", { ready: this.getReadyPlayersCount(), total: this.clients.length });
        this.checkGameStart();
      }
    });

    this.onMessage("chat_message", (client, message) => {
      this.broadcast("chat_message", { playerId: client.sessionId, playerName: this.state.players.get(client.sessionId)?.name, message: message.message });
    });

    console.log("Room created:", options);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!", options);

    const player = new Player();
    player.id = client.sessionId;
    player.name = options.name;
    player.level = options.level;
    this.state.players.set(client.sessionId, player);

    this.broadcast("player_joined", { playerId: client.sessionId, playerName: options.name });
    this.broadcast("welcome", { message: `Welcome ${options.name}!` });

    this.checkGameStart();
  }

  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = false;
      this.broadcast("player_left", { playerId: client.sessionId, playerName: player.name });
    }
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("Room disposed");
  }

  getReadyPlayersCount() {
    let readyPlayers = 0;
    this.state.players.forEach(player => {
      if (player.ready) {
        readyPlayers++;
      }
    });
    return readyPlayers;
  }

  checkGameStart() {
    if (this.state.players.size > 1 && this.getReadyPlayersCount() === this.state.players.size) {
      this.state.status = 'starting';
      this.broadcast("game_starting", { countdown: 3 });
      setTimeout(() => {
        this.state.status = 'playing';
        // Here you would typically start the game logic, e.g., generate first question
        this.broadcast("game_started");
      }, 3000);
    }
  }
}