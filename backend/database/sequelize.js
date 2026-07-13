const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Check if using PostgreSQL (Neon) or MySQL
if (process.env.DATABASE_URL) {
  // PostgreSQL (Neon) connection
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    }
  });
  console.log('🔌 Using PostgreSQL (Neon) connection');
} else {
  // MySQL connection (fallback)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'takanj',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: false
      }
    }
  );
  console.log('🔌 Using MySQL connection');
}

// Test connection
sequelize.authenticate()
  .then(() => {
    const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'MySQL';
    console.log(`✅ ${dbType} Database connected successfully`);
  })
  .catch(err => {
    const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'MySQL';
    console.error(`❌ ${dbType} Database connection failed:`, err.message);
  });

module.exports = sequelize;
