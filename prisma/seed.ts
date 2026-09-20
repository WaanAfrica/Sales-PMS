import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.dailySales.deleteMany();
  await prisma.monthlyTarget.deleteMany();
  await prisma.user.deleteMany();

  const users = [
    {
      name: 'Kobia Kithinji',
      email: 'Kobiakithinji16@gmail.com',
      password: 'Kobia@2026.',
      role: 'ADMIN' as const,
    },
    {
      name: 'Kobia',
      email: 'kobia@matrixwater.co.ke',
      password: 'Kobia@2026.',
      role: 'SALES' as const,
    },
    {
      name: 'Munene',
      email: 'munene@matrixwater.co.ke',
      password: 'Munene@2026.',
      role: 'SALES' as const,
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        ...user,
        password: await bcrypt.hash(user.password, 10),
        active: true,
      },
    });
  }

  console.log('Database cleared and seeded with three users');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
