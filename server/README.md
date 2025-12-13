# Typing Tournament - Backend Server

## Overview
Node.js + Socket.IO backend server for real-time typing tournament gameplay.

## Features
- ✅ Real-time multiplayer with Socket.IO
- ✅ Farcaster authentication
- ✅ Blockchain integration (Monad Testnet)
- ✅ Redis state management
- ✅ Automatic winner payout

## Architecture

### Classes
- **TournamentEngine**: Main game logic and Socket.IO event handling
- **BlockchainService**: Smart contract interaction via Viem
- **AuthService**: Farcaster user verification
- **RedisService**: Game state and session management

### Tech Stack
- **Runtime**: Node.js with TypeScript
- **WebSocket**: Socket.IO
- **Blockchain**: Viem (Ethereum library)
- **Database**: Upstash Redis
- **Auth**: Neynar API (Farcaster)

## Setup

### Prerequisites
1. `.env.local` configured in parent directory ✅
2. Smart contract deployed ✅ (run contracts deployment first)
3. Server wallet funded with 2 MON ✅

### Installation

```bash
# Install dependencies
npm install
```

### Running Locally

```bash
# Development mode (auto-reload)
npm run dev

# Production build
npm run build
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```bash
GET /health
```
Returns server status and configuration

### Server Info
```bash
GET /api/info
```
Returns:
- Server address
- Contract address
- Server balance
- Entry fee
- Game settings

## Socket.IO Events

### Client → Server

#### `authenticate`
Authenticate with Farcaster token
```typescript
socket.emit('authenticate', { token: 'base64-encoded-token' })
```

#### `create_game`
Create a new game
```typescript
socket.emit('create_game')
```

#### `join_game`
Join an existing game
```typescript
socket.emit('join_game', { gameId: '1234567890' })
```

#### `typing_progress`
Send typing progress update
```typescript
socket.emit('typing_progress', {
  address: '0x...',
  progress: 45, // 0-100
  wpm: 65,
  timestamp: Date.now()
})
```

#### `leave_game`
Leave current game
```typescript
socket.emit('leave_game')
```

### Server → Client

#### `authenticated`
Authentication successful
```typescript
{
  fid: 12345,
  username: 'alice',
  address: '0x...'
}
```

#### `game_created`
Game created successfully
```typescript
{
  gameId: '1234567890',
  textToType: 'The quick brown fox...',
  maxPlayers: 4,
  entryFee: '0.1'
}
```

#### `game_joined`
Successfully joined game
```typescript
{
  gameId: '1234567890',
  textToType: 'The quick brown fox...',
  players: [{ username: 'alice', address: '0x...' }]
}
```

#### `game_started`
Game has started
```typescript
{
  startTime: 1234567890,
  endTime: 1234567950,
  duration: 60
}
```

#### `player_joined`
Another player joined
```typescript
{
  username: 'bob',
  address: '0x...'
}
```

#### `progress_update`
Player progress update
```typescript
{
  address: '0x...',
  username: 'alice',
  progress: 45,
  wpm: 65
}
```

#### `game_finished`
Game ended, winner declared
```typescript
{
  winner: {
    username: 'alice',
    address: '0x...',
    progress: 100,
    wpm: 75
  },
  txHash: '0x...'
}
```

#### `error`
Error occurred
```typescript
{
  message: 'Error description'
}
```

## Game Flow

1. **Player connects** → Authenticates with Farcaster token
2. **Create/Join game** → Pay entry fee on blockchain
3. **Wait for players** → Game starts when full (4 players)
4. **Type race** → Real-time progress updates
5. **Game ends** → Winner declared, prize paid automatically

## Environment Variables

Required in `.env.local`:
```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
NEYNAR_API_KEY=...
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
SERVER_PRIVATE_KEY=0x...
SERVER_ADDRESS=0x...
CONTRACT_ADDRESS=0x...
ENTRY_FEE_MON=0.1
MAX_PLAYERS_PER_GAME=4
GAME_DURATION_SECONDS=60
```

## Testing

### Test Authentication
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/info
```

### Test Socket Connection
Use the frontend or a Socket.IO client to connect to `http://localhost:3001`

## Deployment

### Recommended Platforms
- **Render**: Easy deployment, free tier available
- **Railway**: Simple setup, good for Node.js
- **VPS**: Full control (DigitalOcean, AWS, etc.)

### Environment Variables
Make sure to set all variables from `.env.local` in your deployment platform

### Port
Default: 3001 (configurable via PORT env var)

## Troubleshooting

### "Contract address not set"
- Deploy the smart contract first
- Run `npm run deploy` in `/contracts` folder
- Contract address will be auto-loaded from `deployment-info.json`

### "Redis connection failed"
- Check UPSTASH_REDIS_REST_URL and TOKEN
- Verify Upstash Redis is active

### "Insufficient server balance"
- Server wallet needs MON for gas
- Check balance: Visit `/api/info` endpoint
- Send more MON to SERVER_ADDRESS

### "Payment verification failed"
- Player must pay entry fee on blockchain first
- Check transaction on Monad explorer
- Verify CONTRACT_ADDRESS is correct

## Security Notes

- ✅ Server private key stored in environment variables
- ✅ Only server can declare winners on blockchain
- ✅ Payment verification before joining games
- ✅ Redis session management
- ⚠️ For production: Implement rate limiting
- ⚠️ For production: Add proper Farcaster signature verification

## Monitoring

Server logs include:
- 🔌 Client connections/disconnections
- ✅ Authentication events
- 🎮 Game creation/joining
- 🏁 Game start/finish
- 🏆 Winner declarations
- ❌ Errors

## Next Steps

1. ✅ Deploy smart contract
2. ✅ Start server: `npm run dev`
3. ✅ Test with frontend
4. 🚀 Deploy to production when ready
