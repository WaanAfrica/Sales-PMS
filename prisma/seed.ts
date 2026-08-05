import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.dailySales.deleteMany();
  await prisma.monthlyTarget.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@company.com',
      password: adminPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  const salesPassword = await bcrypt.hash('Sales@123', 10);
  await prisma.user.create({
    data: {
      name: 'Collins',
      email: 'collins@company.com',
      password: salesPassword,
      role: 'SALES',
      active: true,
    },
  });

  console.log('Seeded admin and one sales user');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
