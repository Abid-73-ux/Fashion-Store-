# Neon PostgreSQL + Render Setup - Final Steps

## ✅ DATABASE CONNECTED!

Neon PostgreSQL database ready with connection string.

---

## 🎯 RENDER DASHBOARD - UPDATE ENVIRONMENT

Go to: **https://render.com → Dashboard → Fashion-Store- Service**

### Left Sidebar: Click "Environment"

Update/Add these variables:

```
PORT = 5000
NODE_ENV = production
DATABASE_URL = postgresql://neondb_owner:npg_QBp9gfPes1jt@ep-tiny-bird-ater6xco-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET = fashion_store_secret_key_2024
JWT_EXPIRE = 7d
CORS_ORIGIN = https://fashionstorea.netlify.app
GMAIL_USER = muhammadabid5067hgg@gmail.com
GMAIL_PASSWORD = lrdaxfqexrgzpeyj
ADMIN_EMAIL = muhammadabid5067hgg@gmail.com
```

### Click: "Save"

Service will auto-restart (2-3 minutes)

---

## ✅ VERIFY

Once restart complete, test:

```
https://fashion-store-p5m9.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "PostgreSQL"
}
```

Test products:
```
https://fashion-store-p5m9.onrender.com/api/products
```

Should return products array ✅

---

## 📊 STATUS

- ✅ Backend code deployed
- ✅ Neon PostgreSQL ready
- ⏳ Render env vars (need update)
- ⏳ Service restart

---

## 🚀 After All Done

1. Frontend automatically loads products ✅
2. Website fully functional on production ✅
3. Products persist in Neon database ✅

---

Date: July 13, 2026
