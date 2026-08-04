import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@company.com',
      password: adminPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  const users = [] as Array<{ id: string }>;

  const salesUser = await prisma.user.upsert({
    where: { email: 'collins@company.com' },
    update: {},
    create: {
      name: 'Collins',
      email: 'collins@company.com',
      password: await bcrypt.hash('Sales@123', 10),
      role: 'SALES',
      active: true,
    },
  });
  users.push(salesUser);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  for (const user of users) {
    await prisma.monthlyTarget.upsert({
      where: { userId_month_year: { userId: user.id, month, year } },
      update: {},
      create: {
        userId: user.id,
        month,
        year,
        salesRevenueTarget: 120000 + Math.random() * 30000,
        repeatCustomerTarget: 25,
        newCustomerTarget: 20,
        walkInTarget: 15,
        quotationTarget: 45,
        pipelineTarget: 350000,
      },
    });
  }

  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let i = 0; i < 20; i += 1) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    for (const user of users) {
      await prisma.dailySales.create({
        data: {
          userId: user.id,
          date: currentDate,
          salesRevenue: 4000 + Math.random() * 2800,
          repeatCustomers: 5 + Math.floor(Math.random() * 6),
          newCustomers: 3 + Math.floor(Math.random() * 4),
          walkIns: 2 + Math.floor(Math.random() * 3),
          newQuotations: 5 + Math.floor(Math.random() * 5),
          closedQuotations: 2 + Math.floor(Math.random() * 3),
          quotationAge: 8 + Math.random() * 6,
          hotQuotationValue: 5000 + Math.random() * 4000,
          salesPipelineValue: 12000 + Math.random() * 22000,
          accountsReceivable: 1500 + Math.random() * 2500,
          opportunities: 'Growth opportunity',
          challenges: 'Market pricing pressure',
        },
      });
    }
  }

  console.log('Seeded admin and sales users');
}

main().finally(() => prisma.$disconnect());
