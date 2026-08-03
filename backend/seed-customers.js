/**
 * Seed test customers to database
 */

const User = require('./models/User');
const sequelize = require('./database/sequelize');

const seedCustomers = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected!');

    console.log('\n➕ Adding test customers...');
    
    const customers = [
      { name: 'Ahmed Khan', email: 'ahmed@example.com', password: 'test123', role: 'user' },
      { name: 'Fatima Ali', email: 'fatima@example.com', password: 'test123', role: 'user' },
      { name: 'Hassan Muhammad', email: 'hassan@example.com', password: 'test123', role: 'user' },
      { name: 'Aisha Malik', email: 'aisha@example.com', password: 'test123', role: 'user' },
      { name: 'Omar Saeed', email: 'omar@example.com', password: 'test123', role: 'user' },
      { name: 'Zainab Abbas', email: 'zainab@example.com', password: 'test123', role: 'user' },
      { name: 'Ibrahim Hassan', email: 'ibrahim@example.com', password: 'test123', role: 'user' },
      { name: 'Noor Ahmed', email: 'noor@example.com', password: 'test123', role: 'user' },
      { name: 'Karim Rashid', email: 'karim@example.com', password: 'test123', role: 'user' },
      { name: 'Leila Farooq', email: 'leila@example.com', password: 'test123', role: 'user' },
    ];

    for (const customerData of customers) {
      try {
        const [user, created] = await User.findOrCreate({
          where: { email: customerData.email },
          defaults: customerData
        });
        
        if (created) {
          console.log(`  ✅ Created: ${user.name} (${user.email})`);
        } else {
          console.log(`  ⏭️  Already exists: ${user.name}`);
        }
      } catch (err) {
        console.error(`  ❌ Error with ${customerData.name}:`, err.message);
      }
    }

    console.log('\n🎉 Seeding complete!');
    const count = await User.count({ where: { role: 'user' } });
    console.log(`📊 Total customers: ${count}`);

    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedCustomers();
