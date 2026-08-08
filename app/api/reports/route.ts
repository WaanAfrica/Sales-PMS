import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {
  calculateDailyReportModel,
  calculateMonthlyReportModel,
} from "@/lib/calculations/reporting";

export async function GET(request: Request) {
  await requireRole("ADMIN");
  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get("type") ?? "daily";

  if (reportType === "monthly") {
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!month || !year) {
      return NextResponse.json(
        { error: "month and year are required for monthly reports" },
        { status: 400 },
      );
    }

    const monthStart = new Date(year, month - 1, 1);
    const nextMonthStart = new Date(year, month, 1);

    const [activeUsers, reports, targets] = await Promise.all([
      prisma.user.findMany({
        where: { role: "SALES", active: true },
        orderBy: { name: "asc" },
      }),
      prisma.dailySales.findMany({
        where: {
          date: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
      }),
      prisma.monthlyTarget.findMany({ where: { month, year } }),
    ]);

    const model = calculateMonthlyReportModel({
      month,
      year,
      activeUsers: activeUsers.map((user) => ({
        id: user.id,
        name: user.name,
      })),
      reports,
      targets,
    });

    return NextResponse.json(model);
  }

  const reportDate = searchParams.get("date");
  if (!reportDate) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const selectedDate = new Date(reportDate);
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [activeUsers, reports, targets] = await Promise.all([
    prisma.user.findMany({
      where: { role: "SALES", active: true },
      orderBy: { name: "asc" },
    }),
    prisma.dailySales.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.monthlyTarget.findMany({
      where: {
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
      },
    }),
  ]);

  const previousReportsByUser = new Map<
    string,
    Awaited<typeof reports>[number] | undefined
  >();
  for (const user of activeUsers) {
    const previousReport = await prisma.dailySales.findFirst({
      where: {
        userId: user.id,
        date: { lt: startOfDay },
      },
      orderBy: { date: "desc" },
    });
    previousReportsByUser.set(user.id, previousReport ?? undefined);
  }

  const model = calculateDailyReportModel({
    reportDate: selectedDate,
    activeUsers: activeUsers.map((user) => ({ id: user.id, name: user.name })),
    reports,
    targets,
    previousReportsByUser,
  });

  return NextResponse.json(model);
}
