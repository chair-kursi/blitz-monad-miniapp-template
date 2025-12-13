# 🚀 Quick Deployment Reference

## 📋 **What You Have**

```
✅ Smart Contract: 0x90577AFd04F23c783De10FD87956a77FDe5e9792
✅ Backend Code: /server (Node.js + Socket.IO)
✅ Frontend Code: / (Next.js)
✅ All working locally
```

---

## 🎯 **Deployment Steps (30 minutes)**

### **1. Deploy Backend (Render.com)**

```
1. Go to https://render.com
2. Sign up with GitHub
3. New Web Service → Connect repo
4. Settings:
   - Root Directory: server
   - Build: npm install && npm run build
   - Start: npm start
5. Add ALL environment variables from .env.local
6. Deploy
7. Save URL: https://your-app.onrender.com
```

### **2. Deploy Frontend (Vercel.com)**

```
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import Project → Select repo
4. Add environment variables:
   - NEXT_PUBLIC_SOCKET_URL=https://your-app.onrender.com
   - NEXT_PUBLIC_CONTRACT_ADDRESS=0x90577AFd...
   - NEXT_PUBLIC_URL=https://your-app.vercel.app
5. Deploy
6. Save URL: https://your-app.vercel.app
```

### **3. Test**

```bash
# Backend
curl https://your-app.onrender.com/health

# Frontend
open https://your-app.vercel.app/game

# Full flow
1. Create game
2. Join game (incognito)
3. Play
4. Winner gets paid
```

---

## 🔑 **Environment Variables**

### **Backend (Render)**
```
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

### **Frontend (Vercel)**
```
NEXT_PUBLIC_URL=https://your-app.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://your-app.onrender.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x90577AFd04F23c783De10FD87956a77FDe5e9792
```

---

## ✅ **Success Checklist**

- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Backend health check works
- [ ] Frontend loads
- [ ] Socket.IO connects
- [ ] Can create game
- [ ] Can join game
- [ ] Payment works
- [ ] Game plays
- [ ] Winner paid

---

## 💰 **Cost**

**Free Tier (Perfect for MVP):**
- Render: $0 (750 hours/month)
- Vercel: $0 (unlimited)
- Total: **$0/month**

---

## 📞 **Quick Links**

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Warpcast Embed Tool**: https://warpcast.com/~/developers/mini-apps/embed
- **Full Guide**: See PRODUCTION_DEPLOY.md

---

**Ready to deploy! Follow the 3 steps above.** 🚀
