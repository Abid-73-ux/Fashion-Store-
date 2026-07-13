# AWS RDS Security Group Fix Required

## 🔴 Problem

Connection to AWS RDS timing out. This means the security group is blocking access.

---

## ✅ Solution - Update Security Group

### Step 1: Go to AWS Console

1. https://console.aws.amazon.com
2. Search: "RDS"
3. Click: "Databases"
4. Click: "fashion-store-db"

### Step 2: Find Security Group

- Scroll to "Connectivity & security"
- Under "VPC security groups", click the security group link
- Example: `default (sg-096368413ee026c25)`

### Step 3: Edit Inbound Rules

1. Click the security group
2. Tab: "Inbound rules"
3. Button: "Edit inbound rules"
4. **Add this rule:**
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: 0.0.0.0/0 (Allow from anywhere)
5. **Save rules**

---

## 📋 Why This Needed?

- AWS RDS by default blocks ALL external connections
- Security group acts as firewall
- Need to explicitly allow MySQL port 3306

---

## ⏱️ After Update

Takes 30 seconds for rules to apply.

Then test:
```
https://fashion-store-p5m9.onrender.com/api/products
```

---

## 🚀 Once Security Group Fixed

Database will auto-create tables and products will load! ✅

Date: July 13, 2026
