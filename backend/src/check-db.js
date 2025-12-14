const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    const items = await prisma.menuItem.findMany();
    console.log('Total items:', items.length);
    console.log('Items:', JSON.stringify(items, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
