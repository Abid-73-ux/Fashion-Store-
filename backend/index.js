const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./database/sequelize');
const setupMigrations = require('./setup-migrations');

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

// Setup associations
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow all origins in development
        const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(null, true); // Allow anyway for development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Database: PostgreSQL (Neon)`);
    console.log(`🔗 Connection: DATABASE_URL configured`);
});

