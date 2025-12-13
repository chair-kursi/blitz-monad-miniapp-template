# 🚀 Typing Tournament - Complete Deployment Guide

## 📋 Prerequisites Checklist

- ✅ Upstash Redis credentials
- ✅ Neynar API key  
- ✅ Deployer wallet with 7.89 MON
- ✅ Server wallet with 2 MON
- ✅ All credentials in `.env.local`

## 🎯 Deployment Steps

### Step 1: Deploy Smart Contract

```bash
# Navigate to contracts folder
cd contracts

# Install dependencies
npm install

# Deploy to Monad Testnet
npm run deploy
```

**Expected Output:**
```
🚀 Deploying TypingTournament contract to Monad Testnet...
📝 Deploying with account: 0xad7cd41d31bc72f8952a23f61c5170066570077c
💰 Account balance: 7.89 MON
🎮 Entry fee set to: 0.1 MON
⏳ Deploying contract...
✅ Contract deployed to: 0x...
🔑 Contract owner: 0xda856f9f453780a9b6faef0824c12301b5126665
🔄 Transferring ownership to server: 0xda856f9f453780a9b6faef0824c12301b5126665
✅ Ownership transferred!
📄 Deployment info saved to: ../deployment-info.json
📄 Contract ABI saved to: ../lib/contract-abi.json
✨ Deployment complete!
```

**Action Required:**
1. Copy the contract address from output
2. Add to `.env.local`:
   ```bash
   CONTRACT_ADDRESS=0x...paste-address-here
   ```

---

### Step 2: Start Backend Server

```bash
# Navigate to server folder
cd ../server

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
============================================================
🚀 Typing Tournament Server Started!
============================================================
📡 Server running on: http://localhost:3001
🔗 Socket.IO ready for connections
💼 Server Address: 0xda856f9f453780a9b6faef0824c12301b5126665
📝 Contract Address: 0x...
💰 Entry Fee: 0.1 MON
👥 Max Players: 4
⏱️  Game Duration: 60s
============================================================

🎮 Tournament Engine initialized
```

**Test Server:**
```bash
# In a new terminal
curl http://localhost:3001/health
curl http://localhost:3001/api/info
```

---

### Step 3: Install Frontend Dependencies

```bash
# Navigate back to root
cd ..

# Install dependencies (if not already done)
pnpm install

# Add Socket.IO client
pnpm add socket.io-client
```

---

### Step 4: Update Environment Variables

Make sure your `.env.local` has the contract address:

```bash
# Next.js
NEXT_PUBLIC_URL="http://localhost:3000"

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://choice-tarpon-27967.upstash.io
UPSTASH_REDIS_REST_TOKEN=AW0_AAIncDIwYmE4ODMyMjMwZjg0OTBiODg3ZmUzM2RkZjRiMmZlZXAyMjc5Njc

# Neynar API
NEYNAR_API_KEY=8F4F204C-C2A2-4EF8-8BD9-8D1718B12D61

# Monad Blockchain
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143

# Deployment
DEPLOYER_PRIVATE_KEY=967504f036f69e75313eee7d81ee43b3e8cf394f950c64ec71a379c8630f9a4c
DEPLOYER_ADDRESS=0xad7cd41d31bc72f8952a23f61c5170066570077c

# Server Backend
SERVER_PRIVATE_KEY=59e26d2e7b79d077a7ac3be3773a0aab20fce09a14468f13d15bfa9791775be8
SERVER_ADDRESS=0xda856f9f453780a9b6faef0824c12301b5126665

# Contract (ADD THIS AFTER DEPLOYMENT)
CONTRACT_ADDRESS=0x...your-deployed-contract-address

# Game Settings
ENTRY_FEE_MON=0.1
MAX_PLAYERS_PER_GAME=4
GAME_DURATION_SECONDS=60

# Server Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

### Step 5: Start Frontend (Next Step)

```bash
# In root directory
pnpm run dev
```

Server will start on `http://localhost:3000`

---

## 🧪 Testing Locally

### Test Flow:

1. **Open browser**: `http://localhost:3000`
2. **Connect wallet**: Use Warpcast wallet
3. **Create game**: Click "Create Game"
4. **Pay entry fee**: 0.1 MON transaction
5. **Wait for players**: Need 4 players total
6. **Start typing**: Game starts automatically when full
7. **Win**: First to 100% or highest progress after 60s
8. **Get prize**: Automatic payout to winner

### Multi-Player Testing:

Open multiple browser windows/tabs:
- Window 1: Player 1 creates game
- Window 2: Player 2 joins game  
- Window 3: Player 3 joins game
- Window 4: Player 4 joins game
- Game starts automatically!

---

## 📊 Monitoring

### Check Server Status
```bash
curl http://localhost:3001/health
```

### Check Server Info
```bash
curl http://localhost:3001/api/info
```

### View Server Logs
Server terminal shows:
- 🔌 Connections
- ✅ Authentication
- 🎮 Game events
- 🏆 Winners
- ❌ Errors

---

## 🐛 Troubleshooting

### Contract Deployment Failed
```bash
# Check deployer balance
# Should have at least 0.5 MON for gas

# Verify RPC connection
curl https://testnet-rpc.monad.xyz

# Check private key format
# Should be 64 characters (without 0x) or 66 (with 0x)
```

### Server Won't Start
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Check environment variables
cd server
npm run dev
# Look for validation errors
```

### Frontend Can't Connect to Server
```bash
# Verify server is running
curl http://localhost:3001/health

# Check NEXT_PUBLIC_SOCKET_URL in .env.local
# Should be: http://localhost:3001

# Check CORS settings in server/src/index.ts
```

### Payment Verification Failed
```bash
# Verify contract address is set
echo $CONTRACT_ADDRESS

# Check transaction on Monad explorer
# Make sure player paid exactly 0.1 MON

# Verify player address matches wallet address
```

---

## 🚀 Production Deployment

### Backend (Render/Railway)

1. **Create new service**
2. **Connect GitHub repo**
3. **Set build command**: `cd server && npm install && npm run build`
4. **Set start command**: `cd server && npm start`
5. **Add environment variables** (all from .env.local)
6. **Deploy**

### Frontend (Vercel)

1. **Import GitHub repo**
2. **Framework**: Next.js
3. **Root directory**: `.` (root)
4. **Add environment variables**:
   - `NEXT_PUBLIC_URL`: Your Vercel URL
   - `NEXT_PUBLIC_SOCKET_URL`: Your backend URL
   - All other public variables
5. **Deploy**

### Update Farcaster Manifest

After deployment, update `app/.well-known/farcaster.json/route.ts` with production URLs.

---

## 📈 Next Steps

After successful local testing:

1. ✅ Deploy backend to Render/Railway
2. ✅ Deploy frontend to Vercel  
3. ✅ Update environment variables with production URLs
4. ✅ Test with real Farcaster users
5. ✅ Publish to Farcaster Mini App store

---

## 💡 Tips

- **Gas Costs**: Each game costs ~0.02 MON in gas for winner payout
- **Server Balance**: Monitor SERVER_ADDRESS balance, refill when low
- **Redis**: Free tier handles 10k commands/day (plenty for MVP)
- **Neynar**: Free tier handles 1000 requests/day
- **Testing**: Use small entry fees (0.01 MON) for testing

---

## 🆘 Need Help?

Check the individual READMEs:
- `/contracts/README.md` - Smart contract help
- `/server/README.md` - Backend server help
- Main README.md - Frontend help

---

## ✅ Success Checklist

- [ ] Contract deployed successfully
- [ ] Contract address in `.env.local`
- [ ] Backend server running on :3001
- [ ] Health endpoint responding
- [ ] Frontend running on :3000
- [ ] Can create test game
- [ ] Can pay entry fee
- [ ] Can join game
- [ ] Real-time updates working
- [ ] Winner payout working

**You're ready to build the frontend! 🎉**
