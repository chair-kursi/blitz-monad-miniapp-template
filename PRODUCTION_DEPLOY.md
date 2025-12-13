# 🚀 Production Deployment Guide

## 📋 **Overview**

You need to deploy:
1. **Backend Server** (Node.js + Socket.IO) → Render/Railway
2. **Frontend** (Next.js) → Vercel
3. **Update Environment Variables** for production URLs

---

## 🎯 **Deployment Strategy**

```
Backend (Render) ← Socket.IO ← Frontend (Vercel) ← Users
     ↓
Smart Contract (Already deployed on Monad Testnet)
```

---

# 1️⃣ **Deploy Backend Server (Render)**

## **Why Render?**
- ✅ Free tier available
- ✅ Supports WebSockets (Socket.IO)
- ✅ Easy deployment from GitHub
- ✅ Auto-deploys on push

## **Step-by-Step:**

### **A. Prepare Backend for Deployment**

1. **Create `server/.env.production` file:**
```bash
# Copy from your .env.local
UPSTASH_REDIS_REST_URL=https://choice-tarpon-27967.upstash.io
UPSTASH_REDIS_REST_TOKEN=AW0_AAIncDIwYmE4ODMyMjMwZjg0OTBiODg3ZmUzM2RkZjRiMmZlZXAyMjc5Njc
NEYNAR_API_KEY=8F4F204C-C2A2-4EF8-8BD9-8D1718B12D61
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
SERVER_PRIVATE_KEY=59e26d2e7b79d077a7ac3be3773a0aab20fce09a14468f13d15bfa9791775be8
SERVER_ADDRESS=0xda856f9f453780a9b6faef0824c12301b5126665
CONTRACT_ADDRESS=0x90577AFd04F23c783De10FD87956a77FDe5e9792
ENTRY_FEE_MON=0.01
MAX_PLAYERS_PER_GAME=2
GAME_DURATION_SECONDS=60
PORT=3001
```

2. **Update `server/package.json` scripts:**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### **B. Deploy to Render**

1. **Go to https://render.com**
   - Sign up/Login (use GitHub)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repo: `blitz-monad-miniapp-template`

3. **Configure Service:**
   ```
   Name: typing-tournament-server
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables:**
   - Click "Environment" tab
   - Add each variable from `.env.production`:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `NEYNAR_API_KEY`
     - `MONAD_RPC_URL`
     - `MONAD_CHAIN_ID`
     - `SERVER_PRIVATE_KEY`
     - `SERVER_ADDRESS`
     - `CONTRACT_ADDRESS`
     - `ENTRY_FEE_MON`
     - `MAX_PLAYERS_PER_GAME`
     - `GAME_DURATION_SECONDS`
     - `PORT` = `3001`

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://typing-tournament-server.onrender.com`

6. **Test Backend:**
```bash
curl https://typing-tournament-server.onrender.com/health
curl https://typing-tournament-server.onrender.com/api/info
```

---

# 2️⃣ **Deploy Frontend (Vercel)**

## **Why Vercel?**
- ✅ Made for Next.js
- ✅ Free tier
- ✅ Auto-deploys from GitHub
- ✅ Global CDN

## **Step-by-Step:**

### **A. Prepare Frontend**

1. **Update `.env.production` in root:**
```bash
NEXT_PUBLIC_URL=https://your-app.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://typing-tournament-server.onrender.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x90577AFd04F23c783De10FD87956a77FDe5e9792
```

2. **Commit and push to GitHub:**
```bash
git add .
git commit -m "Production deployment setup"
git push origin main
```

### **B. Deploy to Vercel**

1. **Go to https://vercel.com**
   - Sign up/Login with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repo
   - Click "Import"

3. **Configure Project:**
   ```
   Framework Preset: Next.js (auto-detected)
   Root Directory: ./
   Build Command: pnpm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: pnpm install (auto-detected)
   ```

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these:
     ```
     NEXT_PUBLIC_URL = https://your-app.vercel.app (will update after deploy)
     NEXT_PUBLIC_SOCKET_URL = https://typing-tournament-server.onrender.com
     NEXT_PUBLIC_CONTRACT_ADDRESS = 0x90577AFd04F23c783De10FD87956a77FDe5e9792
     ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment (3-5 minutes)
   - Note your frontend URL: `https://your-app.vercel.app`

6. **Update NEXT_PUBLIC_URL:**
   - Go to Settings → Environment Variables
   - Update `NEXT_PUBLIC_URL` with your actual Vercel URL
   - Redeploy

---

# 3️⃣ **Update Farcaster Manifest**

After deployment, update your Farcaster manifest:

1. **Edit `app/.well-known/farcaster.json/route.ts`:**
```typescript
const appUrl = "https://your-app.vercel.app"; // Your Vercel URL

const farcasterConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  frame: {
    version: "1",
    name: "Typing Tournament",
    iconUrl: `${appUrl}/images/icon.png`,
    homeUrl: `${appUrl}/game`,
    imageUrl: `${appUrl}/images/feed.png`,
    screenshotUrls: [],
    tags: ["game", "typing", "monad", "tournament"],
    primaryCategory: "games",
    buttonTitle: "Play Now",
    splashImageUrl: `${appUrl}/images/splash.png`,
    splashBackgroundColor: "#0F172A",
  }
};
```

2. **Commit and push:**
```bash
git add .
git commit -m "Update Farcaster manifest with production URL"
git push origin main
```

Vercel will auto-deploy.

---

# 4️⃣ **Testing Production Deployment**

## **A. Test Backend**

```bash
# Health check
curl https://typing-tournament-server.onrender.com/health

# Server info
curl https://typing-tournament-server.onrender.com/api/info

# Expected response:
{
  "serverAddress": "0xda856f9f...",
  "contractAddress": "0x90577AFd...",
  "serverBalance": "2",
  "entryFee": "0.01",
  "maxPlayers": 2,
  "gameDuration": 60
}
```

## **B. Test Frontend**

1. **Open in browser:**
   ```
   https://your-app.vercel.app/game
   ```

2. **Check:**
   - ✅ Page loads
   - ✅ No console errors
   - ✅ Socket.IO connects
   - ✅ "Connected" status shows

## **C. Test Full Flow**

1. **Create Game:**
   - Open `https://your-app.vercel.app/game`
   - Click "Create New Game"
   - Confirm payment (0.01 MON)
   - Wait in lobby

2. **Join Game (Incognito):**
   - Open `https://your-app.vercel.app/game` in incognito
   - Click "Join Game"
   - Enter game ID
   - Confirm payment (0.01 MON)

3. **Play Game:**
   - Game should start automatically
   - Type the text
   - Winner should be declared
   - Prize should be paid

---

# 5️⃣ **Farcaster Mini App Testing**

## **A. Use Warpcast Embed Tool**

1. **Go to:**
   ```
   https://warpcast.com/~/developers/mini-apps/embed
   ```

2. **Enter your URL:**
   ```
   https://your-app.vercel.app
   ```

3. **Test in preview:**
   - Click "Refetch" to update
   - Click "Launch" to test
   - Verify game works in Farcaster

## **B. Share in Farcaster**

1. **Create a cast:**
   ```
   Check out my typing tournament game! 🎮
   https://your-app.vercel.app
   ```

2. **Test:**
   - Click the embed
   - Game should open
   - Test full flow

---

# 6️⃣ **Monitoring & Logs**

## **Backend Logs (Render)**

1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. Monitor real-time logs

## **Frontend Logs (Vercel)**

1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments"
4. Click latest deployment
5. View logs

---

# 7️⃣ **Troubleshooting**

## **Backend Issues**

### **"Service won't start"**
```bash
# Check Render logs
# Verify all environment variables set
# Ensure PORT is 3001
# Check build logs for errors
```

### **"Socket.IO not connecting"**
```bash
# Verify CORS settings in server/src/index.ts
# Check if WebSocket upgrade working
# Test with: curl https://your-backend.onrender.com/socket.io/
```

## **Frontend Issues**

### **"Can't connect to backend"**
```bash
# Verify NEXT_PUBLIC_SOCKET_URL is correct
# Check browser console for errors
# Ensure backend is running
```

### **"Payment not working"**
```bash
# Verify NEXT_PUBLIC_CONTRACT_ADDRESS is correct
# Check MetaMask network (Monad Testnet)
# Ensure sufficient MON balance
```

---

# 8️⃣ **Production Checklist**

## **Before Going Live:**

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] All environment variables set
- [ ] Backend health check passing
- [ ] Frontend loads without errors
- [ ] Socket.IO connects
- [ ] Can create game
- [ ] Can join game
- [ ] Payment works
- [ ] Game plays correctly
- [ ] Winner declared
- [ ] Prize paid
- [ ] Farcaster manifest updated
- [ ] Tested in Warpcast embed tool

---

# 9️⃣ **Cost Breakdown**

## **Free Tier (Recommended for MVP)**

| Service | Cost | Limits |
|---------|------|--------|
| **Render** | $0 | 750 hours/month, sleeps after 15min inactive |
| **Vercel** | $0 | 100GB bandwidth, unlimited requests |
| **Upstash Redis** | $0 | 10k commands/day |
| **Neynar API** | $0 | 1000 requests/day |
| **Total** | **$0/month** | Perfect for MVP |

## **Paid Tier (For Scale)**

| Service | Cost | Benefits |
|---------|------|----------|
| **Render** | $7/month | Always on, no sleep |
| **Vercel** | $20/month | More bandwidth, analytics |
| **Total** | **$27/month** | Production ready |

---

# 🎯 **Quick Deploy Commands**

```bash
# 1. Commit everything
git add .
git commit -m "Production deployment"
git push origin main

# 2. Deploy backend (Render)
# - Go to render.com
# - Connect repo
# - Deploy

# 3. Deploy frontend (Vercel)
# - Go to vercel.com
# - Import repo
# - Deploy

# 4. Test
curl https://your-backend.onrender.com/health
open https://your-frontend.vercel.app/game
```

---

# ✅ **Success Indicators**

When everything is working:

1. ✅ Backend health check returns 200
2. ✅ Frontend loads without errors
3. ✅ Socket.IO connects (green "Connected")
4. ✅ Can create and join games
5. ✅ Payments work
6. ✅ Game plays smoothly
7. ✅ Winner gets paid
8. ✅ Works in Farcaster embed

---

# 📞 **Need Help?**

If you encounter issues:

1. **Check Render logs** - Backend errors
2. **Check Vercel logs** - Frontend errors
3. **Check browser console** - Client errors
4. **Check backend health** - `curl /health`
5. **Verify environment variables** - All set correctly

---

**Ready to deploy! Follow the steps above and you'll have a production app in ~30 minutes!** 🚀
