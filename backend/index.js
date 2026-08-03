const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const sequelize = require('./database/sequelize');
const setupMigrations = require('./setup-migrations');
const securityHeaders = require('./middleware/securityHeaders');
const { csrfProtection, csrfTokenGenerator, csrfCheck } = require('./middleware/csrfProtection');

// Load environment variables
dotenv.config();

// CRITICAL: Load all models BEFORE syncing database
// This ensures Sequelize knows about all table definitions
require('./models/User');
require('./models/Product');
require('./models/Order');
require('./models/Cart');
require('./models/Category');
require('./models/Coupon');
require('./models/PaymentProof');
require('./models/OrderStatusChange');
require('./models/WhatsAppInteraction');
require('./models/SupportEmail');
require('./models/StoreSettings');
require('./models/Review');

// Initialize Express app
const app = express();

// IMPORTANT: Set up model associations after all models are loaded
// This ensures foreign key relationships work properly
const Review = require('./models/Review');
const User = require('./models/User');
const Product = require('./models/Product');

// Setup associations (use different alias to avoid naming collision with Product.reviews field)
User.hasMany(Review, { foreignKey: 'userId', as: 'userReviews' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'productReviews' });
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// SECURITY: Setup security headers
securityHeaders.setupSecurityHeaders(app);

// SECURITY: Enable gzip compression for all responses
app.use(compression({
    threshold: 1024,  // Only compress responses > 1KB
    level: 6          // Compression level (1-9, 6 is good balance)
}));

// SECURITY: Cookie parser middleware (required for HttpOnly cookies)
app.use(cookieParser());

// SECURITY: CSRF protection - setup after cookie parser
app.use(csrfProtection);
app.use(csrfTokenGenerator);

// SECURITY: Configure CORS
const corsOptions = securityHeaders.configureCORS({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true  // Allow cookies in CORS requests
});
app.use(cors(corsOptions));

// SECURITY: Apply rate limiting to all routes
app.use(securityHeaders.rateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// SECURITY: Sanitize inputs
app.use(securityHeaders.sanitizeInput);

// Middleware
app.use(express.json({ limit: '1mb' }));  // SECURITY: Limit JSON body size
app.use(express.urlencoded({ limit: '1mb', extended: true }));  // SECURITY: Limit form data

// Initialize database on startup (run migrations first, then sync)
async function initializeDatabase() {
  try {
    console.log('🔧 Starting database initialization...');
    
    // Wait a bit to ensure models are loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Step 1: Run migrations
    await setupMigrations();
    
    // Step 2: Seed default categories if none exist
    await seedDefaultCategories();
    
    console.log('✅ Database initialization completed');
    
  } catch (err) {
    console.error('⚠️ Database initialization error:', err.message);
    // Continue startup - tables may already exist
  }
}

// Seed default categories
async function seedDefaultCategories() {
  try {
    const Category = require('./models/Category');
    
    const count = await Category.count();
    if (count > 0) {
      console.log('✅ Categories already exist:', count);
      return;
    }
    
    console.log('🌱 Seeding default categories...');
    const defaultCategories = [
      { name: 'Men', slug: 'men', description: 'Men\'s clothing and accessories', isActive: true },
      { name: 'Women', slug: 'women', description: 'Women\'s clothing and accessories', isActive: true },
      { name: 'Children', slug: 'children', description: 'Children\'s clothing and accessories', isActive: true },
      { name: 'Accessories', slug: 'accessories', description: 'Clothing accessories', isActive: true }
    ];
    
    const created = await Category.bulkCreate(defaultCategories);
    console.log('✅ Created', created.length, 'default categories');
    created.forEach((cat) => {
      console.log(`   - ${cat.name}`);
    });
    
  } catch (error) {
    console.error('⚠️ Error seeding categories:', error.message);
  }
}

// Initialize database before starting routes
initializeDatabase();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/support', require('./routes/support'));
app.use('/api/settings', require('./routes/storeSettings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/analytics', require('./routes/analytics'));

// File serving routes (for payment proofs and other uploads)
const path = require('path');
app.use('/files', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    etag: false
}));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running', database: 'PostgreSQL' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// SECURITY: Global error handler for all errors
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    // Log error details for debugging (but don't expose to client)
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    console.error(`Error ID: ${errorId}`, err.stack);
    
    // Determine status code
    const statusCode = err.status || err.statusCode || 500;
    
    // Determine error message (don't expose internal errors to client)
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction 
        ? (statusCode === 500 ? 'Internal server error' : err.message)
        : err.message;
    
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { errorId, stack: err.stack })
    });
});

// SECURITY: Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('🔴 UNCAUGHT EXCEPTION:', err);
    console.error(err.stack);
    // Log to error monitoring service in production
    // process.exit(1);  // Don't exit - let the app continue running
});

// SECURITY: Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔴 UNHANDLED REJECTION:', reason);
    console.error('Promise:', promise);
    // Log to error monitoring service in production
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Database: PostgreSQL (Neon)`);
    console.log(`🔗 Connection: DATABASE_URL configured`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

