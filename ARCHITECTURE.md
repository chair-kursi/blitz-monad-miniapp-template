# 🏗️ TYPING TOURNAMENT - ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FARCASTER MINI APP                               │
│                    (Next.js Frontend - Port 3000)                        │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Game Lobby  │  │ Typing Area  │  │   Progress   │                  │
│  │              │  │              │  │     Bars     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Wallet       │  │  Socket.IO   │  │  Farcaster   │                  │
│  │ Integration  │  │   Client     │  │     SDK      │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                              │                    │
                              │ WebSocket          │ Wallet Actions
                              │ (Real-time)        │ (Blockchain)
                              ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER (Port 3001)                          │
│                    Node.js + TypeScript + Socket.IO                      │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    TOURNAMENT ENGINE                               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │  │
│  │  │ Game State   │  │   Player     │  │   Winner     │            │  │
│  │  │  Manager     │  │   Manager    │  │  Detection   │            │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Blockchain   │  │     Auth     │  │    Redis     │                  │
│  │   Service    │  │   Service    │  │   Service    │                  │
│  │   (Viem)     │  │  (Neynar)    │  │  (Upstash)   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
           │                    │                    │
           │ Smart Contract     │ User Verification  │ State Storage
           │ Calls              │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  MONAD TESTNET   │  │   NEYNAR API     │  │  UPSTASH REDIS   │
│                  │  │                  │  │                  │
│  Smart Contract: │  │  Farcaster       │  │  Game State      │
│  0x...           │  │  Authentication  │  │  Player Sessions │
│                  │  │                  │  │  Payment Cache   │
│  Entry Fee:      │  │  API Key:        │  │                  │
│  0.1 MON         │  │  8F4F204C...     │  │  URL: https://   │
│                  │  │                  │  │  choice-tarpon   │
│  Pool: Variable  │  │  Free Tier:      │  │                  │
│  Winner: Auto    │  │  1000 req/day    │  │  Free Tier:      │
│  Payout          │  │                  │  │  10k cmd/day     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 📊 DATA FLOW

### 1. Player Joins Game

```
Player (Frontend)
    │
    │ 1. Connect Wallet
    ├──────────────────────────────────────────────────────────┐
    │                                                            │
    ▼                                                            ▼
Farcaster SDK                                            Monad Testnet
    │                                                            │
    │ 2. Get Auth Token                                         │
    │                                                            │
    ▼                                                            │
Backend Server                                                  │
    │                                                            │
    │ 3. Verify Token (Neynar)                                  │
    │                                                            │
    │ 4. Create Game Session                                    │
    │                                                            │
    ▼                                                            │
Redis (Upstash)                                                 │
    │                                                            │
    │ 5. Store Player Session                                   │
    │                                                            │
    ▼                                                            │
Backend Server                                                  │
    │                                                            │
    │ 6. Request Payment                                        │
    │                                                            │
    ▼                                                            │
Player (Frontend)                                               │
    │                                                            │
    │ 7. Pay 0.1 MON ────────────────────────────────────────▶ │
    │                                                            │
    │                                                            ▼
    │                                                    Smart Contract
    │                                                            │
    │                                                            │ 8. Verify Payment
    │                                                            │
    │ 9. Payment Confirmed ◀─────────────────────────────────── │
    │                                                            │
    ▼                                                            │
Backend Server                                                  │
    │                                                            │
    │ 10. Add to Game                                           │
    │                                                            │
    ▼                                                            │
All Players (Socket.IO)                                         │
    │                                                            │
    │ 11. "Player Joined" Event                                 │
    │                                                            │
    ▼                                                            │
Game Starts (when 4 players)                                    │
```

---

### 2. Real-Time Gameplay

```
Player Types
    │
    │ Calculate WPM & Progress
    │
    ▼
Frontend
    │
    │ Socket.IO Emit
    │ { address, progress: 45, wpm: 65 }
    │
    ▼
Backend Server
    │
    │ Update Game State
    │
    ├──────────────────┬──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
Redis            Other Players      Check Winner
(Save State)     (Broadcast)        (Progress >= 100?)
```

---

### 3. Winner Payout

```
Player Reaches 100%
    │
    ▼
Backend Server
    │
    │ Detect Winner
    │
    ├──────────────────┬──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
Lock Game       Call Smart          Notify Players
                Contract            (Socket.IO)
                    │
                    │ declareWinner(gameId, winner)
                    │
                    ▼
            Monad Testnet
                    │
                    │ Transfer Pool to Winner
                    │
                    ▼
            Winner's Wallet
                    │
                    │ Receive MON
                    │
                    ▼
            Transaction Hash
                    │
                    │ Return to Server
                    │
                    ▼
            All Players
                    │
                    │ Show Winner + TX Hash
                    │
                    ▼
            Game Complete
```

---

## 🔐 SECURITY LAYERS

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. AUTHENTICATION                                           │
│     ├─ Farcaster token verification                         │
│     ├─ Neynar API validation                                │
│     └─ Session management (Redis)                           │
│                                                               │
│  2. PAYMENT VERIFICATION                                     │
│     ├─ Blockchain payment check                             │
│     ├─ Exact amount validation (0.1 MON)                    │
│     └─ No double-entry allowed                              │
│                                                               │
│  3. SMART CONTRACT SECURITY                                  │
│     ├─ Owner-only winner declaration                        │
│     ├─ Funds locked until game ends                         │
│     └─ One-time payout per game                             │
│                                                               │
│  4. SERVER SECURITY                                          │
│     ├─ Private keys in environment variables                │
│     ├─ CORS protection                                       │
│     └─ Input validation (Zod)                               │
│                                                               │
│  5. GAME INTEGRITY                                           │
│     ├─ Server-side progress validation                      │
│     ├─ Game state locked after start                        │
│     └─ Winner detection server-side                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 SCALABILITY

```
Current Setup (MVP):
├─ 4 players per game
├─ Unlimited concurrent games
├─ Redis for state management
└─ Socket.IO rooms for isolation

Production Scaling:
├─ Add load balancer
├─ Multiple server instances
├─ Redis cluster
├─ WebSocket sticky sessions
└─ Monitoring & logging
```

---

## 💾 DATA STORAGE

```
Redis (Upstash):
├─ game:{gameId}              → Game state
├─ player:{socketId}          → Player session
├─ payment:{gameId}:{address} → Payment cache
└─ active_games               → Set of active game IDs

Blockchain (Monad):
├─ gamePools[gameId]          → Prize pool amount
├─ playerPaid[gameId][player] → Payment status
├─ playerCount[gameId]        → Number of players
└─ gameFinished[gameId]       → Game completion status
```

---

## 🔄 EVENT FLOW

```
Socket.IO Events:

Client → Server:
├─ authenticate      → Login with Farcaster
├─ create_game       → Start new game
├─ join_game         → Join existing game
├─ typing_progress   → Send WPM updates
└─ leave_game        → Exit game

Server → Client:
├─ authenticated     → Login success
├─ game_created      → Game ready
├─ game_joined       → Joined successfully
├─ game_started      → Typing begins
├─ player_joined     → New player
├─ player_left       → Player left
├─ progress_update   → Opponent progress
├─ game_finished     → Winner declared
└─ error             → Error occurred
```

---

## 🎯 COMPONENT RESPONSIBILITIES

```
Smart Contract:
├─ Escrow entry fees
├─ Verify payments
├─ Pay winners
└─ Track game state

Backend Server:
├─ Authenticate users
├─ Manage game lifecycle
├─ Real-time updates
├─ Winner detection
└─ Blockchain interaction

Frontend:
├─ User interface
├─ Wallet connection
├─ Socket.IO client
├─ Game rendering
└─ Progress tracking

External Services:
├─ Neynar: User verification
├─ Upstash: State storage
└─ Monad: Blockchain
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

```
Production Setup:

┌──────────────┐
│   Vercel     │  ← Frontend (Next.js)
│  (Frontend)  │     - Static hosting
└──────────────┘     - Edge functions
       │             - Auto-scaling
       │
       ▼
┌──────────────┐
│   Render     │  ← Backend (Node.js)
│  (Backend)   │     - WebSocket support
└──────────────┘     - Auto-deploy
       │             - Health checks
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Monad   │  │  Neynar  │  │ Upstash  │  │   CDN    │
│ Testnet  │  │   API    │  │  Redis   │  │ (Images) │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

*This architecture is production-ready and scalable!* 🚀
