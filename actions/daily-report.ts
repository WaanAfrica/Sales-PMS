'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../lib/auth';

const dailyReportSchema = z.object({
  date: z.string().min(1),
  salesRevenue: z.number().min(0),
  repeatCustomers: z.number().min(0),
  newCustomers: z.number().min(0),
  walkIns: z.number().min(0),
  dailyAcquisition: z.number().int().min(0),
  newQuotations: z.number().min(0),
  closedQuotations: z.number().min(0),
  quotationAge: z.number().min(0),
  hotQuotationValue: z.number().min(0),
  salesPipelineValue: z.number().min(0),
  accountsReceivable: z.number().min(0),
  opportunities: z.string().optional(),
  challenges: z.string().optional(),
});

export async function createDailyReport(
  input: z.infer<typeof dailyReportSchema>,
  options?: { submit?: boolean },
) {
  const session = await requireAuth();
  const parsed = dailyReportSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Invalid data');
  }

  const dto = parsed.data;
  const reportDate = new Date(dto.date);
  const existing = await prisma.dailySales.findFirst({
    where: { userId: session.user.id, date: reportDate },
  });

  if (existing) {
    throw new Error('A report for that date already exists');
  }

  const created = await prisma.dailySales.create({
    data: {
      userId: session.user.id,
      date: reportDate,
      salesRevenue: dto.salesRevenue,
      repeatCustomers: dto.repeatCustomers,
      newCustomers: dto.newCustomers,
      walkIns: dto.walkIns,
      dailyAcquisition: dto.dailyAcquisition,
      newQuotations: dto.newQuotations,
      closedQuotations: dto.closedQuotations,
      quotationAge: dto.quotationAge,
      hotQuotationValue: dto.hotQuotationValue,
      salesPipelineValue: dto.salesPipelineValue,
      accountsReceivable: dto.accountsReceivable,
      opportunities: dto.opportunities ?? null,
      challenges: dto.challenges ?? null,
      status: options?.submit ? 'SUBMITTED' : 'DRAFT',
      submittedAt: options?.submit ? new Date() : null,
    },
  });

  revalidatePath('/dashboard');
  return created;
}

export async function updateDailyReport(
  id: string,
  input: z.infer<typeof dailyReportSchema>,
  options?: { submit?: boolean },
) {
  const session = await requireAuth();
  const parsed = dailyReportSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid data');

  const existing = await prisma.dailySales.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    throw new Error('Report not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reportDate = new Date(parsed.data.date);
  reportDate.setHours(0, 0, 0, 0);
  if (reportDate.getTime() !== today.getTime()) {
    throw new Error('You can only edit today\'s report');
  }

  const updated = await prisma.dailySales.update({
    where: { id },
    data: {
      salesRevenue: parsed.data.salesRevenue,
      repeatCustomers: parsed.data.repeatCustomers,
      newCustomers: parsed.data.newCustomers,
      walkIns: parsed.data.walkIns,
      dailyAcquisition: parsed.data.dailyAcquisition,
      newQuotations: parsed.data.newQuotations,
      closedQuotations: parsed.data.closedQuotations,
      quotationAge: parsed.data.quotationAge,
      hotQuotationValue: parsed.data.hotQuotationValue,
      salesPipelineValue: parsed.data.salesPipelineValue,
      accountsReceivable: parsed.data.accountsReceivable,
      opportunities: parsed.data.opportunities ?? null,
      challenges: parsed.data.challenges ?? null,
      status: options?.submit ? 'SUBMITTED' : existing.status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT',
      submittedAt: options?.submit ? existing.submittedAt ?? new Date() : existing.submittedAt,
    },
  });

  revalidatePath('/dashboard');
  return updated;
}

export async function deleteDailyReport(id: string) {
  const session = await requireAuth();
  const report = await prisma.dailySales.findUnique({ where: { id } });
  if (!report || report.userId !== session.user.id) {
    throw new Error('Report not found');
  }

  await prisma.dailySales.delete({ where: { id } });
  revalidatePath('/dashboard');
}

export async function assignTargets(input: { userId: string; month: number; year: number; salesRevenueTarget: number; repeatCustomerTarget: number; newCustomerTarget: number; walkInTarget: number; quotationTarget: number; pipelineTarget: number }) {
  await requireRole('ADMIN');
  const existing = await prisma.monthlyTarget.findFirst({ where: { userId: input.userId, month: input.month, year: input.year } });
  const result = existing
    ? await prisma.monthlyTarget.update({ where: { id: existing.id }, data: input })
    : await prisma.monthlyTarget.create({ data: input });
  revalidatePath('/admin');
  return result;
}

export async function createUser(input: { name: string; email: string; password: string; role: 'ADMIN' | 'SALES'; active?: boolean }) {
  await requireRole('ADMIN');
  const hashed = await bcrypt.hash(input.password, 10);
  const result = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: input.role,
      active: input.active ?? true,
    },
  });
  revalidatePath('/admin');
  return result;
}

export async function updateUser(id: string, input: { name?: string; email?: string; password?: string; role?: 'ADMIN' | 'SALES'; active?: boolean }) {
  await requireRole('ADMIN');
  const data: Record<string, unknown> = {};
  if (input.name) data.name = input.name;
  if (input.email) data.email = input.email;
  if (input.password) data.password = await bcrypt.hash(input.password, 10);
  if (input.role) data.role = input.role;
  if (typeof input.active === 'boolean') data.active = input.active;
  const result = await prisma.user.update({ where: { id }, data });
  revalidatePath('/admin');
  return result;
}

export async function deactivateUser(id: string) {
  await requireRole('ADMIN');
  const result = await prisma.user.update({ where: { id }, data: { active: false } });
  revalidatePath('/admin');
  return result;
}
