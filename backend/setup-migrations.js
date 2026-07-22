const sequelize = require('./database/sequelize');

/**
 * Setup database migrations
 * Runs on server startup to ensure all required tables and types exist
 * All operations are idempotent (safe to run multiple times)
 */
async function setupMigrations() {
  try {
    console.log('🔧 Starting database migrations...');

    // Step 1: Create ENUM types if they don't exist
    console.log('📝 Setting up ENUM types...');

    // payment_method_enum
    try {
      await sequelize.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
            CREATE TYPE payment_method_enum AS ENUM('COD', 'Bank_Transfer');
            RAISE NOTICE 'Created payment_method_enum type';
          END IF;
        END $$;
      `);
      console.log('✅ payment_method_enum type ensured');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✅ payment_method_enum type already exists');
      } else {
        throw err;
      }
    }

    // payment_status_enum
    try {
      await sequelize.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
            CREATE TYPE payment_status_enum AS ENUM('pending', 'verified', 'failed');
            RAISE NOTICE 'Created payment_status_enum type';
          END IF;
        END $$;
      `);
      console.log('✅ payment_status_enum type ensured');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✅ payment_status_enum type already exists');
      } else {
        throw err;
      }
    }

    // order_status_enum
    try {
      await sequelize.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
            CREATE TYPE order_status_enum AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
            RAISE NOTICE 'Created order_status_enum type';
          END IF;
        END $$;
      `);
      console.log('✅ order_status_enum type ensured');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✅ order_status_enum type already exists');
      } else {
        throw err;
      }
    }

    // Step 2: Extend orders table with payment fields
    console.log('📝 Extending orders table...');

    // Check if columns exist before adding them
    const columns = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'orders'
    `);
    const columnNames = columns[0].map(col => col.column_name);

    // Add paymentMethod column if it doesn't exist
    if (!columnNames.includes('paymentMethod')) {
      try {
        await sequelize.query(`
          ALTER TABLE orders 
          ADD COLUMN paymentMethod VARCHAR(50) DEFAULT 'COD'
        `);
        console.log('✅ Added paymentMethod column');
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('✅ paymentMethod column already exists');
        } else {
          throw err;
        }
      }
    } else {
      console.log('✅ paymentMethod column already exists');
    }

    // Add orderStatus column if it doesn't exist
    if (!columnNames.includes('orderStatus')) {
      try {
        await sequelize.query(`
          ALTER TABLE orders 
          ADD COLUMN orderStatus VARCHAR(50) DEFAULT 'pending'
        `);
        console.log('✅ Added orderStatus column');
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('✅ orderStatus column already exists');
        } else {
          throw err;
        }
      }
    } else {
      console.log('✅ orderStatus column already exists');
    }

    // Update paymentStatus ENUM if needed (Sequelize may have created it with different values)
    if (!columnNames.includes('verifiedAt')) {
      try {
        await sequelize.query(`
          ALTER TABLE orders 
          ADD COLUMN verifiedAt TIMESTAMP NULL
        `);
        console.log('✅ Added verifiedAt column');
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('✅ verifiedAt column already exists');
        } else {
          throw err;
        }
      }
    } else {
      console.log('✅ verifiedAt column already exists');
    }

    // Step 3: Create indexes
    console.log('📝 Creating indexes...');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_paymentStatus ON orders(paymentStatus)
    `);
    console.log('✅ Created idx_orders_paymentStatus index');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_orderStatus ON orders(orderStatus)
    `);
    console.log('✅ Created idx_orders_orderStatus index');

    console.log('✅ Database migrations completed successfully');
    return true;

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

module.exports = setupMigrations;
