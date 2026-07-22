# Complete Deployment Guide
## TAKANJ Fashion Store - Checkout & Payment Verification System

---

## Prerequisites

### Software Requirements
- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **PostgreSQL**: v12 or higher (or Neon account)
- **Git**: Latest version

### Accounts Required
- **Render**: https://render.com (Backend hosting)
- **Netlify**: https://netlify.com (Frontend hosting)
- **Neon**: https://neon.tech (PostgreSQL database)
- **Twilio**: https://twilio.com (WhatsApp API)
- **SendGrid**: https://sendgrid.com (Email service)

### Credentials to Prepare
```
Neon:
- DATABASE_URL (connection string)
- Database password

Twilio:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WHATSAPP_NUMBER

SendGrid:
- SENDGRID_API_KEY

JWT Secret:
- JWT_SECRET (generate random 32-char string)
```

---

## Phase 1: Database Setup

### 1.1 Create Neon Database

1. Go to https://neon.tech and sign up
2. Create new project "TAKANJ-Fashion-Store"
3. Choose PostgreSQL 14
4. Copy connection string: `postgres://user:password@host/database`
5. Save for later use

### 1.2 Local Database Setup (for development)

```bash
# Create database locally
createdb takanj_fashion

# Connect to database
psql takanj_fashion

# Run migrations (automatic via Sequelize on backend startup)
```

### 1.3 Environment Variables

Create `backend/.env`:
```env
# Database
DATABASE_URL=postgres://user:password@host/database
DB_HOST=host
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=takanj_fashion

# JWT
JWT_SECRET=your_random_32_character_secret_here

# Server
NODE_ENV=production
PORT=3000
BACKEND_URL=https://fashion-store-p5m9.onrender.com

# Frontend
FRONTEND_URL=https://fashionstorea.netlify.app

# Twilio WhatsApp
WHATSAPP_API_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+1234567890

# SendGrid Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=support@takanj.com

# File Uploads
UPLOAD_DIR=/backend/uploads
MAX_FILE_SIZE=5242880

# Logging
DEBUG=false
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://fashionstorea.netlify.app
```

---

## Phase 2: Backend Deployment (Render)

### 2.1 Prepare Backend

```bash
cd backend

# Install dependencies
npm install

# Test locally
npm run dev

# Check for errors
npm run lint
```

### 2.2 Push to Git

```bash
git add -A
git commit -m "Prepare for production deployment"
git push origin main
```

### 2.3 Deploy to Render

1. Go to https://render.com and sign up
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - **Name**: fashion-store-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month) or higher

### 2.4 Add Environment Variables (Render)

1. Go to Settings → Environment
2. Add all variables from `backend/.env`
3. Save and redeploy

### 2.5 Verify Deployment

```bash
# Test health endpoint
curl https://fashion-store-p5m9.onrender.com/api/v1/health

# Should return:
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-07-22T...",
  "uptime": 123.45
}
```

---

## Phase 3: Frontend Deployment (Netlify)

### 3.1 Prepare Frontend

```bash
cd frontend

# Update API endpoint in config.js
# Change API_CONFIG.baseURL to production URL

# No build step needed (vanilla JS)
# Just ensure all files are committed to Git
```

### 3.2 Configure for Production

Edit `frontend/assets/js/config.js`:
```javascript
const API_CONFIG = {
    baseURL: 'https://fashion-store-p5m9.onrender.com/api',
    version: 'v1',
    timeout: 10000,
    // ... rest of config
};
```

### 3.3 Deploy to Netlify

1. Go to https://netlify.com and sign up
2. Click "New site from Git"
3. Connect GitHub repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: Leave empty (no build needed)
   - **Publish directory**: `frontend`
   - **Environment variables**: None required

5. Deploy site

### 3.4 Configure Custom Domain

1. Go to Site settings → Domain management
2. Add custom domain: fashionstorea.netlify.app
3. Or configure custom domain: takanj.com

### 3.5 Verify Deployment

```bash
# Test frontend
curl https://fashionstorea.netlify.app

# Test API integration
# Open browser console and verify API calls work
```

---

## Phase 4: Post-Deployment Configuration

### 4.1 SSL/TLS Certificates

Render and Netlify provide automatic SSL.
Verify: All URLs use `https://`

### 4.2 CORS Configuration

In `backend/index.js`:
```javascript
const cors = require('cors');

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4.3 Database Backups (Neon)

1. Go to Neon Dashboard
2. Go to Backups section
3. Enable automatic daily backups (if available in plan)

### 4.4 Monitor Logs

**Render**:
- Go to Dashboard
- Select Web Service
- View Logs tab

**Netlify**:
- Go to Site settings
- View Deploy logs

---

## Phase 5: Testing & Verification

### 5.1 API Testing

```bash
# Login
curl -X POST https://fashion-store-p5m9.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Create order
curl -X POST https://fashion-store-p5m9.onrender.com/api/v1/orders/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...order_data...}'

# Get order
curl https://fashion-store-p5m9.onrender.com/api/v1/orders/1 \
  -H "Authorization: Bearer <token>"
```

### 5.2 Frontend Testing

1. Open https://fashionstorea.netlify.app
2. Navigate to checkout
3. Create test order (COD)
4. Verify order appears in orders page
5. Test bank transfer flow
6. Upload payment proof
7. Login as admin
8. Verify payment in admin panel

### 5.3 Email Testing

1. Create test order
2. Check email inbox for confirmation
3. Verify HTML formatting
4. Test links work

### 5.4 WhatsApp Testing

1. Create test order
2. Check WhatsApp for notification
3. Verify message formatting
4. Test approval notification

### 5.5 Performance Testing

```bash
# Check page load time
curl -w "@curl-format.txt" \
  https://fashionstorea.netlify.app/checkout.html

# Check API response time
time curl https://fashion-store-p5m9.onrender.com/api/v1/health
```

---

## Phase 6: Security Hardening

### 6.1 Environment Variables Security

- ✅ Never commit `.env` to Git
- ✅ Use Render/Netlify environment variables
- ✅ Rotate secrets every 90 days

### 6.2 HTTPS Enforcement

Add to `backend/index.js`:
```javascript
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && 
        req.get('x-forwarded-proto') !== 'https') {
        res.redirect('https://' + req.get('host') + req.url);
    }
    next();
});
```

### 6.3 Security Headers

Add to `backend/index.js`:
```javascript
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
```

### 6.4 Rate Limiting

Configured in `backend/middleware/rateLimiter.js`
- Order creation: 10 requests/hour
- Admin endpoints: 60 requests/hour

### 6.5 Database Security

- ✅ Use strong password (32+ chars)
- ✅ Enable SSL connection
- ✅ Restrict IP access (if available)
- ✅ Regular backups
- ✅ Audit logging enabled

---

## Phase 7: Monitoring & Maintenance

### 7.1 Monitoring Setup

**Render Dashboard**:
- CPU usage
- Memory usage
- Network I/O
- Restart count

**Netlify Dashboard**:
- Deploy history
- Build logs
- Function logs

### 7.2 Error Tracking

Configure error logging:
```javascript
// backend/middleware/errorLogger.js
const logger = require('../utils/logger');

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        stack: err.stack
    });
    
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});
```

### 7.3 Uptime Monitoring

Use external service (e.g., UptimeRobot):
- Monitor: https://fashion-store-p5m9.onrender.com/api/v1/health
- Check interval: 5 minutes
- Alert email on downtime

### 7.4 Database Health Checks

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check table sizes
psql $DATABASE_URL -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables ORDER BY pg_total_relation_size DESC;"

# Check indexes
psql $DATABASE_URL -c "SELECT * FROM pg_indexes WHERE schemaname = 'public';"
```

---

## Phase 8: Scaling & Optimization

### 8.1 Render Upgrade Path

- **Starter** ($7/mo): 0.5 CPU, 512MB RAM
- **Standard** ($12/mo): 1 CPU, 1GB RAM
- **Pro** ($25/mo): 2 CPU, 4GB RAM

When to upgrade:
- CPU > 70% consistently
- Memory > 80% consistently
- Response time > 2 seconds

### 8.2 Database Optimization

```sql
-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Analyze tables
ANALYZE orders;
ANALYZE payment_proofs;
ANALYZE order_status_changes;

-- Reindex if needed
REINDEX TABLE orders;
```

### 8.3 CDN for Static Files

Configure Netlify CDN:
- Caching: 1 year for versioned files
- Compression: gzip, brotli enabled
- Minification: Auto-enabled

### 8.4 Database Connection Pooling

In `backend/database/sequelize.js`:
```javascript
pool: {
    max: 5,
    min: 2,
    acquire: 30000,
    idle: 10000
}
```

---

## Phase 9: Disaster Recovery

### 9.1 Backup Strategy

**Database**:
- Daily automatic backups (Neon)
- 30-day retention
- Test restore monthly

**Code**:
- Git repository as backup
- Multiple branches strategy

**Files**:
- Payment proofs: S3 or similar
- Regular backups: Weekly

### 9.2 Rollback Procedure

If deployment fails:

```bash
# Render
1. Go to Dashboard
2. Click "Manual Deploy" from previous commit
3. Select specific commit
4. Deploy

# Netlify
1. Go to Deploy history
2. Click on previous successful deploy
3. Click "Restore this deploy"
```

### 9.3 Database Restore

```bash
# Connect to target database
psql $DATABASE_URL

# Restore from backup
psql $DATABASE_URL < backup.sql

# Verify data
SELECT COUNT(*) FROM orders;
```

---

## Checklist Before Launch

- [ ] Database created and migrated
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Netlify
- [ ] All environment variables set
- [ ] SSL/TLS certificates valid
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Email service working
- [ ] WhatsApp service working
- [ ] API endpoints tested
- [ ] Frontend checkout tested
- [ ] Admin panel working
- [ ] Payment verification tested
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Security headers added
- [ ] Performance benchmarks met
- [ ] Load testing completed
- [ ] Security audit passed

---

## Post-Launch Checklist

- [ ] Monitor system for 24 hours
- [ ] Check error logs daily
- [ ] Verify notifications working
- [ ] Check payment processing
- [ ] Confirm database growth rate
- [ ] Update monitoring rules
- [ ] Schedule security audit
- [ ] Plan capacity expansion
- [ ] Document any issues
- [ ] Gather user feedback

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
tail -f backend/logs/app.log

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check environment variables
echo $DATABASE_URL
```

### API returns 500 error
```bash
# Check backend logs
# Look for database connection errors
# Verify JWT_SECRET is set
# Check file permissions on uploads directory
```

### Frontend not connecting to backend
```javascript
// Check in browser console
console.log(API_CONFIG.baseURL);

// Verify CORS headers
// Check API endpoint in network tab
```

### Emails not sending
```bash
# Check SendGrid API key
# Verify email address is whitelisted
# Check spam folder
# Review SendGrid logs
```

### WhatsApp messages not arriving
```bash
# Verify Twilio credentials
# Check WhatsApp number format
# Review Twilio logs
# Test with Twilio console
```

---

## Support Contacts

- **Backend Issues**: support@takanj.com
- **Frontend Issues**: support@takanj.com
- **Database Issues**: database@takanj.com
- **Billing**: billing@takanj.com

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Neon Documentation](https://neon.tech/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Deployment Date**: July 22, 2026
**Last Updated**: July 22, 2026
**Next Review**: After first week of operation

