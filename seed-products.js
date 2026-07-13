/**
 * Seed demo products to Neon PostgreSQL
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

// Product model
const Product = sequelize.define('Product', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
  price: Sequelize.DECIMAL(10, 2),
  category: Sequelize.STRING,
  image: Sequelize.STRING,
  stock: Sequelize.INTEGER,
  rating: Sequelize.FLOAT,
  reviews: Sequelize.INTEGER
}, { tableName: 'Products', timestamps: true });

const seedProducts = async () => {
  try {
    console.log('🔌 Connecting to Neon PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connected!');

    console.log('\n📦 Creating tables...');
    await sequelize.sync({ force: false });
    console.log('✅ Tables ready!');

    console.log('\n➕ Adding demo products...');
    
    const demoProducts = [
      {
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality 100% cotton t-shirt',
        price: 1299,
        category: 'T-Shirts',
        image: '/img/products/tshirt-1.jpg',
        stock: 50,
        rating: 4.5,
        reviews: 12
      },
      {
        name: 'Casual Denim Jeans',
        description: 'Comfortable blue denim jeans',
        price: 2499,
        category: 'Jeans',
        image: '/img/products/jeans-1.jpg',
        stock: 30,
        rating: 4.7,
        reviews: 25
      },
      {
        name: 'Elegant Formal Shirt',
        description: 'Professional white formal shirt',
        price: 1999,
        category: 'Shirts',
        image: '/img/products/shirt-1.jpg',
        stock: 40,
        rating: 4.6,
        reviews: 18
      },
      {
        name: 'Stylish Polo Shirt',
        description: 'Classic polo shirt in multiple colors',
        price: 1499,
        category: 'Polo',
        image: '/img/products/polo-1.jpg',
        stock: 35,
        rating: 4.4,
        reviews: 9
      },
      {
        name: 'Summer Shorts',
        description: 'Comfortable cotton shorts for summer',
        price: 899,
        category: 'Shorts',
        image: '/img/products/shorts-1.jpg',
        stock: 60,
        rating: 4.3,
        reviews: 15
      },
      {
        name: 'Hoodie Sweatshirt',
        description: 'Warm and cozy hoodie',
        price: 2299,
        category: 'Hoodies',
        image: '/img/products/hoodie-1.jpg',
        stock: 25,
        rating: 4.8,
        reviews: 22
      }
    ];

    for (const product of demoProducts) {
      const existing = await Product.findOne({ where: { name: product.name } });
      if (!existing) {
        await Product.create(product);
        console.log(`  ✅ ${product.name}`);
      } else {
        console.log(`  ⏭️  ${product.name} (already exists)`);
      }
    }

    console.log('\n🎉 All products seeded successfully!');
    console.log('\n📊 Total products in database:');
    const count = await Product.count();
    console.log(`   Count: ${count}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedProducts();
