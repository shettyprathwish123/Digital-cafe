const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('SEED DATABASE_URL:', process.env.DATABASE_URL);
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.username);

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menuItem.deleteMany({});
  console.log('✅ Data cleared');

  // Create menu items
  const menuItems = [
    // Hot Beverages
    {
      name: 'Masala Chai',
      price: 25.00,
      description: 'Traditional Indian spiced tea with milk',
      category: 'Hot Beverages',
      imageUrl: '/images/masala_chai_1765712105527.png',
    },
    {
      name: 'Filter Coffee',
      price: 35.00,
      description: 'South Indian style coffee',
      category: 'Hot Beverages',
      imageUrl: '/images/filter_coffee_1765712133185.png',
    },
    {
      name: 'Cappuccino',
      price: 120.00,
      description: 'Espresso with steamed milk and foam',
      category: 'Hot Beverages',
      imageUrl: '/images/cappuccino_1765712385690.png',
    },
    // Cold Beverages
    {
      name: 'Lassi',
      price: 60.00,
      description: 'Sweet and refreshing yogurt drink',
      category: 'Cold Beverages',
      imageUrl: '/images/lassi_1765712161101.png',
    },
    {
      name: 'Cold Coffee',
      price: 140.00,
      description: 'Chilled coffee blend with ice cream',
      category: 'Cold Beverages',
      imageUrl: '/images/cold_coffee_1765712178878.png',
    },
    {
      name: 'Nimbu Pani',
      price: 40.00,
      description: 'Fresh lime soda with spices',
      category: 'Cold Beverages',
      imageUrl: '/images/nimbu_pani_1765712197131.png',
    },
    // Snacks
    {
      name: 'Vada Pav',
      price: 20.00,
      description: 'Spicy potato fritter in a bun',
      category: 'Snacks',
      imageUrl: '/images/vada_pav_1765712235336.png',
    },
    {
      name: 'Samosa',
      price: 25.00,
      description: 'Fried pastry with spiced potato filling',
      category: 'Snacks',
      imageUrl: '/images/samosa_1765712255386.png',
    },
    {
      name: 'Bun Maska',
      price: 30.00,
      description: 'Fresh bun with generous butter',
      category: 'Snacks',
      imageUrl: '/images/bun_maska_1765712275398.png',
    },
    // Food
    {
      name: 'Paneer Tikka Sandwich',
      price: 150.00,
      description: 'Grilled sandwich with paneer tikka filling',
      category: 'Food',
      imageUrl: '/images/paneer_tikka_sandwich_1765712294516.png',
    },
    {
      name: 'Veg Burger',
      price: 120.00,
      description: 'Classic vegetable patty burger',
      category: 'Food',
      imageUrl: '/images/veg_burger_1765712315879.png',
    },
    {
      name: 'Masala Dosa',
      price: 80.00,
      description: 'Crispy rice crepe with potato masala',
      category: 'Food',
      imageUrl: '/images/masala_dosa_1765712364005.png',
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item,
    });
    console.log(`✅ Created: ${item.name}`);
  }

  console.log(`✅ Created/Updated ${menuItems.length} menu items`);

  // Create a sample order
  const chai = await prisma.menuItem.findFirst({ where: { name: 'Masala Chai' } });
  const samosa = await prisma.menuItem.findFirst({ where: { name: 'Samosa' } });

  if (chai && samosa) {
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: 1,
        customerName: 'Rahul Kumar',
        totalPrice: (chai.price * 2) + samosa.price,
        status: 'NEW',
        items: {
          create: [
            {
              menuItemId: chai.id,
              quantity: 2,
              price: chai.price,
            },
            {
              menuItemId: samosa.id,
              quantity: 1,
              price: samosa.price,
            },
          ],
        },
      },
    });

    console.log('✅ Sample order created:', sampleOrder.orderNumber);
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
