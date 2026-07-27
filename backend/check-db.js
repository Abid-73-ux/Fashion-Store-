require('dotenv').config();
const sequelize = require('./database/sequelize');
const Category = require('./models/Category');

async function seedCategories() {
    try {
        console.log('🌱 Seeding categories...');
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Check if categories already exist
        const existingCount = await Category.count();
        if (existingCount > 0) {
            console.log('✅ Categories already exist:', existingCount);
            process.exit(0);
        }

        // Create default categories
        const defaultCategories = [
            { name: 'Men', slug: 'men', description: 'Men\'s clothing and accessories', isActive: true },
            { name: 'Women', slug: 'women', description: 'Women\'s clothing and accessories', isActive: true },
            { name: 'Children', slug: 'children', description: 'Children\'s clothing and accessories', isActive: true },
            { name: 'Accessories', slug: 'accessories', description: 'Clothing accessories', isActive: true }
        ];

        console.log('📝 Creating', defaultCategories.length, 'default categories...');
        const created = await Category.bulkCreate(defaultCategories);
        console.log('✅ Created categories:');
        created.forEach((cat, i) => {
            console.log(`  ${i + 1}. ${cat.name} (ID: ${cat.id})`);
        });

        console.log('\n✅ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedCategories();
