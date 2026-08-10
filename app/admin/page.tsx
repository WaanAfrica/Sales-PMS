import { prisma } from "../../lib/prisma";
import { requireRole } from "../../lib/auth";
import AdminShell from "../../components/admin/AdminShell";

function formatKES(value: number) {
  return value.toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });
}

export default async function AdminPage() {
  await requireRole("ADMIN");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
          month: now.getMonth() + 1,
          year: now.getFullYear(),
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

  const totalRevenue = monthlyReports.reduce(
    (sum, item) => sum + item.salesRevenue,
    0,
  );
  const totalPipeline = monthlyReports.reduce(
    (sum, item) => sum + item.salesPipelineValue,
    0,
  );
  const totalReceivables = monthlyReports.reduce(
    (sum, item) => sum + item.accountsReceivable,
    0,
  );
  const totalCustomers = monthlyReports.reduce(
    (sum, item) =>
      sum + item.repeatCustomers + item.newCustomers + item.walkIns,
    0,
  );
  const totalQuotes = monthlyReports.reduce(
    (sum, item) => sum + item.newQuotations,
    0,
  );
  const closedQuotes = monthlyReports.reduce(
    (sum, item) => sum + item.closedQuotations,
    0,
  );
  const winRate = totalQuotes
    ? Math.round((closedQuotes / totalQuotes) * 100)
    : 0;

  const salesByPersonnel = monthlyReports
    .reduce(
      (acc, item) => {
        const existing = acc.find((person) => person.name === item.user.name);
        if (existing) {
          existing.revenue += item.salesRevenue;
        } else {
          acc.push({ name: item.user.name, revenue: item.salesRevenue });
        }
        return acc;
      },
      [] as Array<{ name: string; revenue: number }>,
    )
    .sort((a, b) => b.revenue - a.revenue);

  const targetAchievement = targets.map((target) => {
    const revenue =
      salesByPersonnel.find((person) => person.name === target.user.name)
        ?.revenue ?? 0;
    return {
      name: target.user.name,
      achievement: target.salesRevenueTarget
        ? Math.round((revenue / target.salesRevenueTarget) * 100)
        : 0,
    };
  });

  const revenueByDate = new Map<string, number>();
  [...monthlyReports].reverse().forEach((report) => {
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
      label: new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      revenue,
    }));

  const previousRevenue = previousMonthReports.reduce(
    (sum, item) => sum + item.salesRevenue,
    0,
  );
  const previousCustomers = previousMonthReports.reduce(
    (sum, item) =>
      sum + item.repeatCustomers + item.newCustomers + item.walkIns,
    0,
  );
  const previousPipeline = previousMonthReports.reduce(
    (sum, item) => sum + item.salesPipelineValue,
    0,
  );
  const previousReceivables = previousMonthReports.reduce(
    (sum, item) => sum + item.accountsReceivable,
    0,
  );

  const revenueTrendPercent = previousRevenue
    ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)
    : 0;
  const customerTrendPercent = previousCustomers
    ? Math.round(
        ((totalCustomers - previousCustomers) / previousCustomers) * 100,
      )
    : 0;
  const pipelineTrendPercent = previousPipeline
    ? Math.round(((totalPipeline - previousPipeline) / previousPipeline) * 100)
    : 0;
  const receivableTrendPercent = previousReceivables
    ? Math.round(
        ((totalReceivables - previousReceivables) / previousReceivables) * 100,
      )
    : 0;

  const averageTargetAchievement = targetAchievement.length
    ? Math.round(
        targetAchievement.reduce((sum, item) => sum + item.achievement, 0) /
          targetAchievement.length,
      )
    : 0;

  const summaryCards = [
    {
      title: "Company revenue",
      value: formatKES(totalRevenue),
      subtitle: "Month-to-date total sales",
      trend: previousRevenue
        ? `${revenueTrendPercent > 0 ? "+" : ""}${revenueTrendPercent}%`
        : "New",
    },
    {
      title: "Monthly target achievement",
      value: `${averageTargetAchievement}%`,
      subtitle: "Average team progress",
      trend: "Current month",
    },
    {
      title: "Total customers",
      value: totalCustomers.toLocaleString(),
      subtitle: "Customers served this month",
      trend: previousCustomers
        ? `${customerTrendPercent > 0 ? "+" : ""}${customerTrendPercent}%`
        : "New",
    },
    {
      title: "Pipeline value",
      value: formatKES(totalPipeline),
      subtitle: "Current sales pipeline",
      trend: previousPipeline
        ? `${pipelineTrendPercent > 0 ? "+" : ""}${pipelineTrendPercent}%`
        : "New",
    },
    {
      title: "Accounts receivable",
      value: formatKES(totalReceivables),
      subtitle: "Outstanding customer balance",
      trend: previousReceivables
        ? `${receivableTrendPercent > 0 ? "+" : ""}${receivableTrendPercent}%`
        : "New",
    },
    {
      title: "Win rate",
      value: `${winRate}%`,
      subtitle: "Quote close rate",
      trend: "Current month",
    },
  ];

  return (
    <main className="h-screen overflow-hidden bg-slate-50 px-8 pb-8 pt-0 text-slate-900">
      <div className="h-full">
        <AdminShell
          summaryCards={summaryCards}
          dailyRevenueTrend={dailyRevenueTrend}
          salesByPersonnel={salesByPersonnel}
          targetAchievement={targetAchievement}
          users={users}
          reports={reports}
          monthlyReports={monthlyReports}
          targets={targets}
        />
      </div>
    </main>
  );
}
