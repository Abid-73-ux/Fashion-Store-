/**
 * Seed demo products to Neon PostgreSQL
 */

const Product = require('./models/Product');
const sequelize = require('./database/sequelize');

const seedData = async () => {
  try {
    console.log('🔌 Syncing database...');
    await sequelize.sync();
    console.log('✅ Database synced!');

    console.log('\n➕ Adding demo products...');
    
    const products = [
      {
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality 100% cotton t-shirt, comfortable and durable',
        price: 1299,
        category: 'T-Shirts',
        sku: 'TSHIRT-001',
        stock: 50,
        rating: 4.5,
        reviews: 12,
        inStock: true,
        isNew: true
      },
      {
        name: 'Casual Denim Jeans',
        description: 'Comfortable blue denim jeans, perfect for daily wear',
        price: 2499,
        category: 'Jeans',
        sku: 'JEANS-001',
        stock: 30,
        rating: 4.7,
        reviews: 25,
        inStock: true,
        isBestseller: true
      },
      {
        name: 'Elegant Formal Shirt',
        description: 'Professional white formal shirt for office wear',
        price: 1999,
        category: 'Shirts',
        sku: 'SHIRT-001',
        stock: 40,
        rating: 4.6,
        reviews: 18,
        inStock: true
      },
      {
        name: 'Stylish Polo Shirt',
        description: 'Classic polo shirt available in multiple colors',
        price: 1499,
        category: 'Polo',
        sku: 'POLO-001',
        stock: 35,
        rating: 4.4,
        reviews: 9,
        inStock: true
      },
      {
        name: 'Summer Shorts',
        description: 'Comfortable cotton shorts perfect for summer',
        price: 899,
        category: 'Shorts',
        sku: 'SHORTS-001',
        stock: 60,
        rating: 4.3,
        reviews: 15,
        inStock: true,
        isSale: true
      },
      {
        name: 'Hoodie Sweatshirt',
        description: 'Warm and cozy hoodie for cold weather',
        price: 2299,
        category: 'Hoodies',
        sku: 'HOODIE-001',
        stock: 25,
        rating: 4.8,
        reviews: 22,
        inStock: true,
        isNew: true
      }
    ];

    for (const productData of products) {
      try {
        const [product, created] = await Product.findOrCreate({
          where: { sku: productData.sku },
          defaults: productData
        });
        
        if (created) {
          console.log(`  ✅ Created: ${product.name}`);
        } else {
          console.log(`  ⏭️  Already exists: ${product.name}`);
        }
      } catch (err) {
        console.error(`  ❌ Error with ${productData.name}:`, err.message);
      }
    }

    console.log('\n🎉 Seeding complete!');
    const count = await Product.count();
    console.log(`📊 Total products: ${count}`);

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedData();
