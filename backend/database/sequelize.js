const { Sequelize } = require('sequelize');
require('dotenv').config();

// PostgreSQL (Neon) connection - REQUIRED
const sequelize = new Sequelize(process.env.DATABASE_URL, {
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

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL (Neon) Database connected successfully');
  })
  .catch(err => {
    console.error('❌ PostgreSQL Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = sequelize;
