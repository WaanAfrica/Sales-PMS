import { prisma } from "../../lib/prisma";
import { requireRole } from "../../lib/auth";
import {
  calculateAchievementPercent,
  calculateChangeAgainstPreviousDay,
  calculateMonthlyReportModel,
} from "../../lib/calculations/reporting";
import {
  formatDateInEastAfrica,
  getEastAfricaDateKey,
  utcMonthStart,
} from "../../lib/dates";
import AdminShell from "../../components/admin/AdminShell";

function formatKES(value: number) {
  return value.toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });
}

export default async function AdminPage() {
  const session = await requireRole("ADMIN");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();
  const todayDateKey = getEastAfricaDateKey(now);
  const [year, month] = todayDateKey.split("-").map(Number);
  const monthStart = utcMonthStart(year, month);
  const nextMonthStart = utcMonthStart(year, month + 1);
  const previousMonthStart = utcMonthStart(year, month - 1);
  const previousMonthEnd = monthStart;

  const [reports, monthlyReports, targets, previousMonthReports] =
    await Promise.all([
      prisma.dailySales.findMany({
        orderBy: { date: "desc" },
        take: 20,
        include: { user: true },
      }),
      prisma.dailySales.findMany({
        where: {
          date: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        orderBy: { date: "desc" },
        include: { user: true },
      }),
      prisma.monthlyTarget.findMany({
        where: {
          month,
          year,
        },
        include: { user: true },
      }),
      prisma.dailySales.findMany({
        where: {
          date: {
            gte: previousMonthStart,
            lt: previousMonthEnd,
          },
        },
        include: { user: true },
      }),
    ]);

  const activeSalespeople = users
    .filter((user) => user.role === "SALES" && user.active)
    .map((user) => ({ id: user.id, name: user.name }));
  const previousMonthDate = new Date(Date.UTC(year, month - 2, 1));
  const previousMonthModel = calculateMonthlyReportModel({
    month: previousMonthDate.getUTCMonth() + 1,
    year: previousMonthDate.getUTCFullYear(),
    activeUsers: activeSalespeople,
    reports: previousMonthReports,
    targets: [],
  });
  const currentMonthModel = calculateMonthlyReportModel({
    month,
    year,
    activeUsers: activeSalespeople,
    reports: monthlyReports,
    targets,
  });

  const totalRevenue = currentMonthModel.teamTotals.actual;
  const totalPipeline = currentMonthModel.teamTotals.pipeline;
  const totalReceivables = currentMonthModel.teamTotals.receivables;
  const totalCustomers = currentMonthModel.teamTotals.customers;
  const winRate = currentMonthModel.teamTotals.winRate;
  const salesByPersonnel = currentMonthModel.rows
    .map((row) => ({
      name: row.name,
      revenue: row.revenueSummary.actual,
    }))
    .sort((left, right) => right.revenue - left.revenue);
  const targetAchievement = currentMonthModel.rows.flatMap((row) => {
    if (!row.target) return [];
    const achievement = calculateAchievementPercent(
      row.revenueSummary.actual,
      row.target.salesRevenueTarget,
    );
    return [
      {
        name: row.name,
        achievement: typeof achievement === "number" ? achievement : 0,
      },
    ];
  });

  const revenueByDate = new Map<string, number>();
  [...monthlyReports]
    .filter((report) => report.status === "SUBMITTED")
    .reverse()
    .forEach((report) => {
      const dateKey =
        report.date instanceof Date
          ? report.date.toISOString().slice(0, 10)
          : new Date(report.date).toISOString().slice(0, 10);
      revenueByDate.set(
        dateKey,
        (revenueByDate.get(dateKey) ?? 0) + report.salesRevenue,
      );
    });

  const dailyRevenueTrend = Array.from(revenueByDate.entries())
    .slice(-7)
    .map(([iso, revenue]) => ({
      label: formatDateInEastAfrica(iso, {
        day: "numeric",
        month: "short",
      }),
      revenue,
    }));

  const previousRevenue = previousMonthModel.teamTotals.actual;
  const previousCustomers = previousMonthModel.teamTotals.customers;
  const previousPipeline = previousMonthModel.teamTotals.pipeline;
  const previousReceivables = previousMonthModel.teamTotals.receivables;
  const trendLabel = (current: number, previous: number) => {
    const change = calculateChangeAgainstPreviousDay(current, previous);
    if (change === "-") return "New";
    const percentage = Number.parseInt(change, 10);
    return `${percentage > 0 ? "+" : ""}${change}`;
  };

  const averageTargetAchievement = targetAchievement.length
    ? Math.round(
        targetAchievement.reduce((sum, item) => sum + item.achievement, 0) /
          targetAchievement.length,
      )
    : "-";

  const summaryCards = [
    {
      title: "Company revenue",
      value: formatKES(totalRevenue),
      subtitle: "Month-to-date total sales",
      trend: trendLabel(totalRevenue, previousRevenue),
    },
    {
      title: "Monthly target achievement",
      value:
        typeof averageTargetAchievement === "number"
          ? `${averageTargetAchievement}%`
          : averageTargetAchievement,
      subtitle: "Average team progress",
      trend: "Current month",
    },
    {
      title: "Total customers",
      value: totalCustomers.toLocaleString(),
      subtitle: "Customers served this month",
      trend: trendLabel(totalCustomers, previousCustomers),
    },
    {
      title: "Pipeline value",
      value: formatKES(totalPipeline),
      subtitle: "Current sales pipeline",
      trend: trendLabel(totalPipeline, previousPipeline),
    },
    {
      title: "Accounts receivable",
      value: formatKES(totalReceivables),
      subtitle: "Outstanding customer balance",
      trend: trendLabel(totalReceivables, previousReceivables),
    },
    {
      title: "Win rate",
      value: typeof winRate === "number" ? `${winRate}%` : winRate,
      subtitle: "Quote close rate",
      trend: "Current month",
    },
  ];

  return (
    <main className="h-screen overflow-hidden bg-slate-50 px-8 pb-8 pt-0 text-slate-900">
      <div className="h-full">
        <AdminShell
          currentUserId={session.user.id}
          summaryCards={summaryCards}
          dailyRevenueTrend={dailyRevenueTrend}
          salesByPersonnel={salesByPersonnel}
          targetAchievement={targetAchievement}
          users={users}
          reports={reports}
          targets={targets}
        />
      </div>
    </main>
  );
}
