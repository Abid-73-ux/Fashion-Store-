# Database Connection Setup - Action Required

## 🔴 Current Issue

Backend is running but database connection failing. This is likely due to:

1. **Security Group Issue** - AWS RDS is blocking Render's IP
2. **Database Not Initialized** - AWS RDS needs database/tables created

---

## ✅ SOLUTION - Two Steps Required

### STEP 1: Create Database & Tables

AWS RDS is created but empty. We need to create the database and tables.

**Option A: Using MySQL Workbench (Easiest)**

1. Download MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Connect to AWS RDS:
   - Host: `fashion-store-db.cp6keweambrh.eu-north-1.rds.amazonaws.com`
   - Port: `3306`
   - Username: `admin`
   - Password: `Takanj@2024!`
3. Create database:
   ```sql
   CREATE DATABASE IF NOT EXISTS takanj;
   USE takanj;
   ```
4. Backend will auto-create tables on first run

**Option B: Command Line (Quick)**

```bash
mysql -h fashion-store-db.cp6keweambrh.eu-north-1.rds.amazonaws.com \
       -u admin \
       -pTakanj@2024! \
       -e "CREATE DATABASE IF NOT EXISTS takanj;"
```

---

### STEP 2: Allow Render IP in Security Group

1. Go to AWS RDS Console
2. Click: fashion-store-db → Security
3. Under "Security group rules"
4. Click the security group link
5. Edit Inbound Rules:
   - Add Rule
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: 0.0.0.0/0 (or Render's IP if available)
   - Save

---

## 📝 BACKEND DATABASE CONFIG

Backend expects:
- **Database name:** `takanj` (auto-creates if not exists)
- **Tables:** Auto-created by Sequelize ORM
- **User:** admin
- **Password:** Takanj@2024!

---

## 🚀 After Setup

Once database created:
1. Render will auto-connect
2. Tables will auto-create
3. `/api/health` → ✅ Works
4. `/api/products` → ✅ Will return products
5. Frontend → ✅ Will load products

---

## 📋 RENDER STATUS

- ✅ Backend deployed
- ✅ Environment variables set
- ❌ Database connection (needs init)
- ⏳ Products endpoint (waiting for DB)

---

**After creating database, test will work immediately!**

Date: July 13, 2026
