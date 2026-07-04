const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'fashionstore',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'admin123',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`✅ PostgreSQL Connected: ${process.env.DB_HOST || 'localhost'}`);
        
        // Sync all models
        await sequelize.sync();
        console.log(`✅ Database synced`);
        
        return sequelize;
    } catch (error) {
        console.error(`❌ PostgreSQL Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
