const fs = require('fs');

const envContent = `DATABASE_URL="file:./prisma/dev.db"
`;

fs.writeFileSync('.env', envContent, 'utf8');
console.log('.env fixed with DATABASE_URL="file:./prisma/dev.db"');
