# 🚀 Railway Deployment Guide

## Prerequisites
- GitHub repository (already set up ✅)
- Railway account (free tier available)

---

## Backend Deployment

### 1. Create PostgreSQL Database
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Provision PostgreSQL"**
4. Railway auto-generates `DATABASE_URL` ✅

### 2. Deploy Backend Service
1. In the same project, click **"New Service"**
2. Select **"GitHub Repo"**
3. Choose `hav-project-management`
4. **IMPORTANT:** Set **Root Directory** to `apps/backend`

### 3. Configure Backend Environment Variables
Add these in Railway dashboard → Backend Service → Variables:

```bash
# Auto-provided by Railway (don't add manually)
DATABASE_URL=postgresql://...

# Generate this with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-64-char-random-secret-here

# Standard settings
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production

# Add after frontend is deployed
FRONTEND_URL=https://your-frontend.up.railway.app
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Backend will auto-deploy
Railway detects `railway.json` and:
- Runs migrations automatically (`prisma migrate deploy`)
- Starts the server

---

## Frontend Deployment

### 1. Deploy Frontend Service
1. In the same Railway project, click **"New Service"**
2. Select **"GitHub Repo"**
3. Choose `hav-project-management`
4. **IMPORTANT:** Set **Root Directory** to `apps/frontend`

### 2. Configure Frontend Environment Variables
Add in Railway dashboard → Frontend Service → Variables:

```bash
# Replace with your actual backend URL from Railway
VITE_API_URL=https://your-backend.up.railway.app/api
```

### 3. Get Your Backend URL
1. Go to Backend Service → Settings
2. Copy the **Public Domain** (e.g., `https://your-backend.up.railway.app`)
3. Add `/api` at the end for `VITE_API_URL`

---

## Final Steps

### 1. Update Backend CORS
Once frontend is deployed:
1. Get frontend URL from Railway (e.g., `https://your-frontend.up.railway.app`)
2. Add to Backend → Variables:
   ```bash
   FRONTEND_URL=https://your-frontend.up.railway.app
   ```
3. Backend will auto-redeploy

### 2. Verify Deployment
1. Visit your frontend URL
2. Try logging in with test accounts:
   - `admin@hav.com / password123`
   - `alice@hav.com / password123`
   - `bob@hav.com / password123`
   - `charlie@hav.com / password123`

---

## 📋 Environment Variables Checklist

### Backend (Railway)
- [x] `DATABASE_URL` - Auto-provided by PostgreSQL
- [ ] `JWT_SECRET` - Generate random 64-char string
- [ ] `JWT_EXPIRES_IN` - Set to `7d`
- [ ] `PORT` - Set to `3001`
- [ ] `NODE_ENV` - Set to `production`
- [ ] `FRONTEND_URL` - Add after frontend deploys

### Frontend (Railway)
- [ ] `VITE_API_URL` - Your backend URL + `/api`

---

## 🔧 Troubleshooting

### Backend won't start
- Check logs in Railway dashboard
- Ensure `DATABASE_URL` is set
- Verify migrations ran: Look for "All migrations have been applied"

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct (must include `/api`)
- Check backend is running (visit backend URL)
- Ensure `FRONTEND_URL` is set in backend (for CORS)

### Database migrations fail
- Check if PostgreSQL database is running
- View backend logs for migration errors
- Manually run: `npx prisma migrate deploy` in Railway console

---

## 🎉 Success!
Your HAV Project Management System is now live on Railway!

**Share your URLs:**
- Frontend: `https://your-frontend.up.railway.app`
- Backend API: `https://your-backend.up.railway.app/api`
