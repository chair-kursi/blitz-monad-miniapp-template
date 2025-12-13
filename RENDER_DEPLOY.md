# ✅ Deployment Checklist - Render

## 🔧 **Build Issue Fixed!**

The TypeScript build error has been resolved. The server now uses `FRONTEND_URL` instead of `NEXT_PUBLIC_URL`.

---

## 📋 **Render Deployment Steps**

### **1. Sign Up / Login**
- Go to https://render.com
- Sign up with GitHub

### **2. Create Web Service**
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select: `blitz-monad-miniapp-template`

### **3. Configure Service**

**Basic Settings:**
```
Name: typing-tournament-server
Region: Oregon (US West)
Branch: main
Root Directory: server
Runtime: Node
```

**Build & Start:**
```
Build Command: npm install && npm run build
Start Command: npm start
```

**Instance:**
```
Instance Type: Free
```

### **4. Environment Variables**

Click "Environment" tab and add these **13 variables**:

```bash
# Redis
UPSTASH_REDIS_REST_URL=https://choice-tarpon-27967.upstash.io
UPSTASH_REDIS_REST_TOKEN=AW0_AAIncDIwYmE4ODMyMjMwZjg0OTBiODg3ZmUzM2RkZjRiMmZlZXAyMjc5Njc

# Neynar
NEYNAR_API_KEY=8F4F204C-C2A2-4EF8-8BD9-8D1718B12D61

# Monad
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143

# Server Wallet
SERVER_PRIVATE_KEY=59e26d2e7b79d077a7ac3be3773a0aab20fce09a14468f13d15bfa9791775be8
SERVER_ADDRESS=0xda856f9f453780a9b6faef0824c12301b5126665

# Contract
CONTRACT_ADDRESS=0x90577AFd04F23c783De10FD87956a77FDe5e9792

# Game Settings
ENTRY_FEE_MON=0.01
MAX_PLAYERS_PER_GAME=2
GAME_DURATION_SECONDS=60

# Server Config
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
```

**Note:** You'll update `FRONTEND_URL` after deploying the frontend to Vercel.

### **5. Deploy**
- Click "Create Web Service"
- Wait 5-10 minutes for deployment
- Build should succeed now! ✅

### **6. Get Your Backend URL**
After deployment, your backend will be at:
```
https://typing-tournament-server.onrender.com
```

### **7. Test Backend**
```bash
# Health check
curl https://typing-tournament-server.onrender.com/health

# Server info
curl https://typing-tournament-server.onrender.com/api/info
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-13T...",
  "serverAddress": "0xda856f9f...",
  "contractAddress": "0x90577AFd..."
}
```

---

## 🎯 **Next: Deploy Frontend to Vercel**

### **1. Go to Vercel**
- https://vercel.com
- Sign up with GitHub

### **2. Import Project**
- Click "Add New..." → "Project"
- Select your repo
- Click "Import"

### **3. Add Environment Variables**
```bash
NEXT_PUBLIC_URL=https://your-app.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://typing-tournament-server.onrender.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x90577AFd04F23c783De10FD87956a77FDe5e9792
```

### **4. Deploy**
- Click "Deploy"
- Wait 3-5 minutes
- Get your URL: `https://your-app.vercel.app`

### **5. Update Backend FRONTEND_URL**
- Go back to Render dashboard
- Click your service
- Go to "Environment" tab
- Update `FRONTEND_URL` to your Vercel URL
- Click "Save Changes"
- Service will auto-redeploy

---

## ✅ **Verification**

### **Backend Health:**
```bash
curl https://typing-tournament-server.onrender.com/health
```

### **Frontend:**
```
https://your-app.vercel.app/game
```

### **Full Flow:**
1. Open frontend
2. Create game
3. Join game (incognito)
4. Play
5. Winner gets paid

---

## 🐛 **Common Issues**

### **Build fails on Render**
- ✅ **FIXED!** - Updated to use `FRONTEND_URL`
- Verify all 13 environment variables are set
- Check build logs for specific errors

### **CORS errors**
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- Include `https://` in the URL
- Redeploy backend after updating

### **Socket.IO won't connect**
- Check browser console for errors
- Verify `NEXT_PUBLIC_SOCKET_URL` in Vercel
- Test backend health endpoint

---

## 📊 **Deployment Timeline**

```
1. Render Backend: 5-10 minutes
2. Vercel Frontend: 3-5 minutes
3. Update FRONTEND_URL: 2-3 minutes
4. Testing: 5 minutes

Total: ~20-25 minutes
```

---

## 💰 **Cost**

**Free Tier:**
- Render: $0 (750 hours/month)
- Vercel: $0 (unlimited)
- **Total: $0/month**

**Note:** Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

## 🎉 **You're Ready!**

The build error is fixed. You can now deploy to Render successfully!

**Start here:** https://render.com

Follow the steps above and you'll have a production app in ~20 minutes! 🚀
