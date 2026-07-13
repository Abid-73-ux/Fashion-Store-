# RDS Security Group - Correct Fix

## 🔴 Problem

You created a NEW security group instead of editing the EXISTING one attached to RDS.

---

## ✅ Correct Steps

### Step 1: Go to RDS Database

1. AWS Console → RDS → Databases
2. Click: **fashion-store-db**
3. Scroll down to: **Connectivity & security**

### Step 2: Find Current Security Group

Look for section: **"VPC security groups"**

You'll see: `default (sg-096368413ee026c25)` with status "Active"

**Click this link** (the sg-... ID with "Active" status)

---

### Step 3: Edit This Security Group

1. You're now in EC2 Security Groups
2. Make sure you're viewing the **"default"** security group (the one currently attached)
3. Tab: **"Inbound rules"**
4. Button: **"Edit inbound rules"**

### Step 4: Add Rule to EXISTING Group

Click: **"Add rule"**

Fill in:
- **Type:** MySQL/Aurora
- **Protocol:** TCP (auto)
- **Port range:** 3306
- **Source:** 0.0.0.0/0

Click: **"Save rules"**

---

## ⏱️ Wait 1 Minute

Rules apply automatically.

---

## ✅ Verify

Test again:
```
https://fashion-store-p5m9.onrender.com/api/products
```

Should load products! ✅

---

## 📋 Summary

- ❌ DON'T create new security group
- ✅ DO edit the EXISTING "default" one attached to RDS
- ✅ The one with "Active" status next to fashion-store-db

Date: July 13, 2026
