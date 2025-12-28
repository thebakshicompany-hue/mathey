# Mathey Multiplayer Server

A real-time multiplayer server for the Mathey math game built with Colyseus.

## 🎮 Features

### Game Modes
- **Speed Math**: Fast-paced arithmetic challenges
- **Chess Math**: Strategic math problems with chess themes
- **Minecraft Math**: Adventure-based math in a block-building context

### Multiplayer Features
- **Real-time Gameplay**: WebSocket-based instant communication
- **Room Management**: Automatic matchmaking and room creation
- **Player Management**: Handle connections, disconnections, and reconnections
- **Leaderboards**: Live scoring and ranking system
- **Hint System**: AI-powered contextual hints for players

### Game Mechanics
- **Adaptive Difficulty**: Questions scale based on player levels (grades 1-8)
- **Multiple Choice**: Auto-generated answer options
- **Time Limits**: Configurable per question type
- **Scoring System**: Points based on speed and difficulty
- **Round Management**: Structured gameplay with multiple rounds

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📡 Server Endpoints

### WebSocket Connection
```
ws://localhost:2567
```

### Room Creation
```javascript
// Join or create a math game room
const room = await client.joinOrCreate("math_game", {
  gameMode: "speed", // "speed", "chess", "minecraft"
  maxPlayers: 4,
  minLevel: 1,
  maxLevel: 8,
  totalRounds: 10
});
```

## 🎯 Room Types

### Math Game Room (`math_game`)
- **Max Players**: 2-8 players
- **Game Modes**: Speed, Chess, Minecraft
- **Difficulty Levels**: 1-8 (corresponding to school grades)
- **Round System**: Configurable number of rounds
- **Auto-matching**: Players matched by level and game mode

## 📨 Message Types

### Client → Server Messages

#### `ready`
Player indicates they're ready to start the game.
```javascript
room.send("ready");
```

#### `answer`
Submit an answer to the current question.
```javascript
room.send("answer", {
  answer: "42",
  timeSpent: 15 // seconds
});
```

#### `request_hint`
Request a hint for the current question.
```javascript
room.send("request_hint");
```

### Server → Client Messages

#### `welcome`
Sent when player joins a room.
```javascript
room.onMessage("welcome", (message) => {
  console.log(message.message); // "Welcome to Mathey speed mode!"
  console.log(message.gameMode); // "speed"
  console.log(message.totalRounds); // 10
});
```

#### `game_starting`
Game is about to begin.
```javascript
room.onMessage("game_starting", (message) => {
  console.log(`Game starting in ${message.countdown} seconds`);
});
```

#### `new_round`
New round has started with a question.
```javascript
room.onMessage("new_round", (message) => {
  console.log(`Round ${message.roundNumber}/${message.totalRounds}`);
  console.log(`Question: ${message.question.question}`);
  console.log(`Options:`, message.question.options);
  console.log(`Time limit: ${message.question.timeLimit}s`);
});
```

#### `answer_result`
Result of player's answer submission.
```javascript
room.onMessage("answer_result", (message) => {
  console.log(`Correct: ${message.correct}`);
  console.log(`Correct answer: ${message.correctAnswer}`);
  console.log(`Your score: ${message.points}`);
});
```

#### `hint`
AI-generated hint for current question.
```javascript
room.onMessage("hint", (message) => {
  console.log(`Hint: ${message.hint}`);
});
```

#### `round_ended`
Round has finished.
```javascript
room.onMessage("round_ended", (message) => {
  console.log(`Correct answer: ${message.correctAnswer}`);
  console.log(`Round winner: ${message.winner}`);
  console.log(`Leaderboard:`, message.leaderboard);
});
```

#### `game_ended`
Game has finished.
```javascript
room.onMessage("game_ended", (message) => {
  console.log(`Final results:`, message.finalResults);
  console.log(`Game winner: ${message.winner.name}`);
});
```

## 🏗️ Server Architecture

### Core Files
```
my-server/
├── src/
│   ├── rooms/
│   │   ├── schema/
│   │   │   └── MathGameState.ts    # Game state schema
│   │   └── MathGameRoom.ts         # Main game room logic
│   ├── app.config.ts               # Server configuration
│   └── index.ts                    # Entry point
├── package.json
└── README.md
```

### State Management
The game state is managed through Colyseus schemas:

- **MathGameState**: Root state containing players, rounds, and game settings
- **Player**: Individual player data (score, level, connection status)
- **GameRound**: Current round information and question data
- **MathQuestion**: Question details with multiple choice options

### Question Generation
Questions are dynamically generated based on:
- **Player Levels**: Average level of connected players
- **Game Mode**: Different themes and contexts
- **Difficulty Scaling**: Appropriate number ranges for each grade level
- **Question Types**: Addition, subtraction, multiplication, division

## 🔧 Configuration

### Environment Variables
```bash
# Server port (default: 2567)
PORT=2567

# Node environment
NODE_ENV=development
```

### Game Settings
Configurable per room:
- **Max Players**: 2-8 players per room
- **Time Limits**: 30-45 seconds per question
- **Total Rounds**: 5-20 rounds per game
- **Difficulty Range**: Grade levels 1-8
- **Game Modes**: Speed, Chess, Minecraft themes

## 🧪 Testing

### Local Testing
1. Start the server: `npm run dev`
2. Server runs on `http://localhost:2567`
3. WebSocket endpoint: `ws://localhost:2567`

### Testing with Multiple Clients
```javascript
// Create multiple client connections for testing
const client1 = new Client("ws://localhost:2567");
const client2 = new Client("ws://localhost:2567");

const room1 = await client1.joinOrCreate("math_game", {
  name: "Player 1",
  level: 3,
  gameMode: "speed"
});

const room2 = await client2.joinOrCreate("math_game", {
  name: "Player 2", 
  level: 3,
  gameMode: "speed"
});
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 2567
npx kill-port 2567
```

#### WebSocket Connection Failed
- Check firewall settings
- Verify server is running on correct port
- Ensure client is connecting to correct URL

#### Room Not Found
- Verify room name is "math_game"
- Check server logs for room registration
- Ensure server has started completely

### Debug Mode
Enable detailed logging:
```bash
DEBUG=colyseus:* npm run dev
```

## 📈 Performance

### Optimization Features
- **Room Filtering**: Automatic matchmaking by game mode and level
- **State Synchronization**: Efficient delta compression
- **Connection Management**: Graceful handling of disconnections
- **Memory Management**: Automatic room disposal after games end

### Scaling Considerations
- Each room supports up to 8 concurrent players
- Server can handle multiple rooms simultaneously
- Consider load balancing for high traffic
- Monitor memory usage with many concurrent games

## 🔐 Security

### Built-in Protections
- **Input Validation**: All player messages are validated
- **Rate Limiting**: Prevents spam and abuse
- **Session Management**: Secure client session handling
- **State Protection**: Server-authoritative game state

### Production Recommendations
- Use HTTPS/WSS in production
- Implement authentication integration
- Add rate limiting middleware
- Monitor for suspicious activity

This server provides a robust foundation for the Mathey multiplayer math game with real-time features, adaptive difficulty, and engaging gameplay mechanics!