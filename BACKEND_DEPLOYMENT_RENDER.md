# Deploy Backend to Render (Free) - Step by Step

## What is Render?
Render is a free cloud platform that hosts Node.js applications. Your backend will get a public URL like `https://takanj-backend.onrender.com`.

---

## Step 1: Prepare Backend for Deployment

### 1.1 Check backend/.env file
Your current `.env` has `DB_HOST: localhost` which won't work on Render.

**You need:**
- MySQL database hosted in cloud (or local that's accessible)
- OR use MongoDB instead

**For now, let's check what you have:**

Open `backend/.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=takanj
DB_USER=root
DB_PASSWORD=...
```

**Two Options:**

**Option A: Use Local MySQL (needs port forwarding)**
- Keep your local MySQL running on your computer
- Use port forwarding or ngrok to expose it

**Option B: Use Cloud Database (Recommended)**
- Use MongoDB Atlas (free, cloud)
- Or AWS RDS MySQL (free tier)

---

## Step 2: Push Code to GitHub

Make sure your backend code is pushed:

```bash
cd backend
git add .
git commit -m "Backend ready for deployment"
git push origin main
```

---

## Step 3: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (easiest)
3. Authorize Render to access your GitHub

---

## Step 4: Deploy Backend to Render

### 4.1 Connect Repository

1. Click "New +" → "Web Service"
2. Select your GitHub repository: `Fashion-Store-`
3. Click "Connect"

### 4.2 Configure Service

**Setting 1: Name**
```
Name: takanj-backend
```

**Setting 2: Runtime**
```
Environment: Node
```

**Setting 3: Build Command**
```
npm install
```

**Setting 4: Start Command**
```
node backend/index.js
```

**Setting 5: Environment Variables**

Add these one by one (click "Add Environment Variable"):

```
DB_HOST = your_mysql_host (or mongoDB connection string)
DB_PORT = 3306
DB_NAME = takanj
DB_USER = root
DB_PASSWORD = your_password
PORT = 5000
NODE_ENV = production
```

### 4.3 Deploy

Click "Create Web Service"

Wait 2-3 minutes... Your backend will be live!

You'll get a URL like: `https://takanj-backend.onrender.com`

---

## Step 5: Test Backend is Running

Open browser and visit:
```
https://takanj-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "MySQL"
}
```

If you see this → **Backend is deployed successfully!** ✅

---

## Step 6: Update Frontend config.js

Open `frontend/assets/js/config.js`

Change line 15 from:
```javascript
return 'https://takanj-backend.onrender.com/api';
```

To your actual Render URL (from Step 4):
```javascript
return 'https://your-app-name-here.onrender.com/api';
```

---

## Step 7: Push Frontend Changes to GitHub

```bash
git add frontend/assets/js/config.js
git commit -m "Update backend URL to Render production"
git push origin main
```

Netlify will auto-deploy → **Frontend + Backend connected!** ✅

---

## If Database Connection Fails

### Error: "Cannot connect to MySQL"

**Solution 1: Use MongoDB Atlas instead**

1. Go to https://mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string: `mongodb+srv://...`
5. Update `backend/.env`:
   ```
   DB_HOST = your_mongodb_connection_string
   ```
6. Restart Render service

**Solution 2: Use local MySQL with port forwarding**

1. Use ngrok to expose local MySQL
2. Get ngrok URL
3. Update `backend/.env` with ngrok URL

**Solution 3: Use AWS RDS free tier**

1. Create AWS account
2. Create RDS MySQL instance (free tier)
3. Get RDS endpoint
4. Update `backend/.env`

---

## Troubleshooting

### Problem: Render shows "Build failed"
- Check logs (Click service → Logs)
- Ensure all dependencies in `package.json` are installed
- Check Node version (use 16 or 18)

### Problem: Backend deployed but products don't load
- Check CORS settings in `backend/index.js`
- Add Netlify domain to CORS whitelist:
  ```javascript
  cors({
    origin: ['https://your-site.netlify.app', 'http://localhost:5500']
  })
  ```
- Restart service on Render

### Problem: Database connection error
- Verify credentials in `.env`
- Check if database is accessible from internet (not localhost-only)
- Use cloud database instead of local

---

## Quick Checklist

- [ ] Render account created
- [ ] Backend pushed to GitHub
- [ ] Web Service created on Render
- [ ] Environment variables added
- [ ] Backend deployed successfully
- [ ] Health check passes (`/api/health` returns OK)
- [ ] `frontend/assets/js/config.js` updated with Render URL
- [ ] Frontend pushed to GitHub
- [ ] Netlify auto-deployed
- [ ] Products loading on Netlify ✅

---

## Example: Complete Flow

1. **Local Development**
   ```
   Frontend: http://127.0.0.1:5500
   Backend: http://127.0.0.1:5000
   ✅ Products load
   ```

2. **After Render Deployment**
   ```
   Frontend: https://my-site.netlify.app
   Backend: https://takanj-backend.onrender.com
   ✅ Products load
   ```

---

## Important Notes

⚠️ **Render Free Tier Limitations**:
- Services spin down after 15 minutes of inactivity
- First request takes ~30 seconds (cold start)
- Limited to 1 concurrent service

✅ **Solution**: Upgrade to paid tier ($7/month) if needed

---

## Need Help?

If backend doesn't deploy:

1. Check Render logs for specific error
2. Verify `package.json` has all dependencies
3. Test backend locally: `npm start`
4. Ensure MySQL is accessible (or switch to MongoDB)

---

**Estimated Time**: 10-15 minutes total

Let's do this! 🚀
