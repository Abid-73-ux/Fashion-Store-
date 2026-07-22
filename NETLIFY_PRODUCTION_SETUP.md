# Netlify Production Setup Guide

## Problem
Products weren't loading on Netlify because the frontend was trying to reach `http://127.0.0.1:5000` which is a local address.

## Solution
Created a dynamic API configuration system that automatically switches between local and production URLs.

---

## How It Works

### File: `frontend/assets/js/config.js`
This file detects your environment and returns the appropriate API URL:

```javascript
- If running on localhost/127.0.0.1 → Use local API (127.0.0.1:5000)
- If running on production (Netlify) → Use production API URL
```

---

## Setup for Production

### Step 1: Update config.js with Your Backend URL

Open: `d:\A Kiro Project\frontend\assets\js\config.js`

Find this line (line 15):
```javascript
return 'https://takanj-backend.onrender.com/api'; // UPDATE THIS WITH YOUR BACKEND URL
```

Replace with your actual backend URL. Options:

**Option A: If using Render**
```javascript
return 'https://your-app-name.onrender.com/api';
```

**Option B: If using GoDaddy/Heroku/Other**
```javascript
return 'https://your-domain.com/api';
```

**Option C: If using IP Address**
```javascript
return 'https://your-ip-address:5000/api';
```

### Step 2: Deploy to Netlify

Push your changes to GitHub:
```bash
git add frontend/assets/js/config.js
git commit -m "Update API URL for production"
git push origin main
```

Netlify will auto-deploy (if you have it connected to GitHub).

### Step 3: Test on Production

1. Visit your Netlify URL: `https://your-site.netlify.app`
2. Check if products load
3. Open DevTools (F12) → Console → Check for errors
4. If API errors, verify the URL in config.js

---

## Files Updated

All frontend files now use the config:

1. ✅ `frontend/assets/js/config.js` - NEW (environment detection)
2. ✅ `frontend/assets/js/services/productService.js` - Uses config
3. ✅ `frontend/assets/js/services/categoryService.js` - Uses config
4. ✅ `frontend/assets/js/services/storeSettings.js` - Uses config
5. ✅ `frontend/assets/js/main.js` - Uses config
6. ✅ `frontend/assets/js/checkout.js` - Uses config
7. ✅ `frontend/assets/js/cart.js` - Uses config
8. ✅ `frontend/index.html` - Added config.js script
9. ✅ `frontend/shop.html` - Added config.js script
10. ✅ `frontend/cart.html` - Added config.js script
11. ✅ `frontend/checkout.html` - Added config.js script

---

## Environment Detection Logic

```javascript
// In config.js:
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes(':5500');

if (isDevelopment) {
  // Use local API
  return 'http://127.0.0.1:5000/api';
} else {
  // Use production API (from your config)
  return 'https://your-backend-url/api';
}
```

---

## Testing Locally vs Production

### Local Testing (Localhost/127.0.0.1)
```
Frontend: http://127.0.0.1:5500
Backend: http://127.0.0.1:5000
✅ Products load from local API
```

### Production Testing (Netlify)
```
Frontend: https://your-site.netlify.app
Backend: https://your-backend-url
✅ Products load from production API
```

---

## Troubleshooting

### Problem: Still getting 404 or "Cannot reach API"

**Check 1**: Verify your backend URL is correct
```javascript
// Open browser console (F12)
console.log(API_CONFIG.getBaseUrl());
// Should show your correct backend URL
```

**Check 2**: Verify backend is running
```bash
curl https://your-backend-url/api/products
# Should return JSON, not error
```

**Check 3**: Check CORS settings on backend
```javascript
// backend/index.js should allow Netlify domain
cors({
  origin: ['http://127.0.0.1:5500', 'https://your-site.netlify.app']
})
```

**Check 4**: Hard refresh browser (Ctrl+F5)

---

## Backend Deployment Options

### Option 1: Render (Recommended - Free Tier)
1. Go to https://render.com
2. Create account
3. Deploy Node.js backend
4. Get URL: `https://your-app.onrender.com`
5. Update config.js with this URL

### Option 2: GoDaddy (Paid)
1. Use your GoDaddy hosting
2. Deploy backend there
3. Get URL: `https://your-domain.com`
4. Update config.js with this URL

### Option 3: Heroku (Paid - no free tier anymore)
1. Go to https://heroku.com
2. Deploy backend
3. Get URL: `https://your-app.herokuapp.com`
4. Update config.js with this URL

---

## Quick Checklist

- [ ] Backend is deployed and running
- [ ] Backend URL is known (e.g., https://your-backend.onrender.com)
- [ ] Updated config.js with backend URL
- [ ] Pushed changes to GitHub
- [ ] Netlify deployed the latest code
- [ ] Visited Netlify URL and checked products load
- [ ] Checked browser console for errors
- [ ] CORS is enabled on backend for your Netlify domain

---

## Example Production Setup

**Backend URL**: `https://takanj-backend.onrender.com`

**config.js Update**:
```javascript
getBaseUrl: function() {
  if (this.isDevelopment) {
    return 'http://127.0.0.1:5000/api';
  } else {
    return 'https://takanj-backend.onrender.com/api'; // ← Your backend URL
  }
}
```

**Result**:
- Local: `http://127.0.0.1:5000/api/products` ✅
- Production: `https://takanj-backend.onrender.com/api/products` ✅

---

## Need Help?

If products still don't load:

1. Check browser console (F12) for error messages
2. Verify backend is running and accessible
3. Double-check backend URL in config.js
4. Test API directly: `curl https://your-backend-url/api/products`
5. Check CORS headers in response

---

**Status**: ✅ Ready for production deployment!

Update config.js and deploy to Netlify.
