import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

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
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const reports = await prisma.dailySales.findMany({
    where: { date: { gte: monthStart } },
    orderBy: { date: "desc" },
    include: { user: true },
  });
  const targets = await prisma.monthlyTarget.findMany({
    where: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
    include: { user: true },
  });

  const totalRevenue = reports.reduce(
    (sum, item) => sum + item.salesRevenue,
    0,
  );
  const totalPipeline = reports.reduce(
    (sum, item) => sum + item.salesPipelineValue,
    0,
  );
  const totalReceivables = reports.reduce(
    (sum, item) => sum + item.accountsReceivable,
    0,
  );
  const totalCustomers = reports.reduce(
    (sum, item) =>
      sum + item.repeatCustomers + item.newCustomers + item.walkIns,
    0,
  );
  const totalQuotes = reports.reduce(
    (sum, item) => sum + item.newQuotations,
    0,
  );
  const closedQuotes = reports.reduce(
    (sum, item) => sum + item.closedQuotations,
    0,
  );
  const winRate = totalQuotes
    ? Math.round((closedQuotes / totalQuotes) * 100)
    : 0;

  const dailyRevenueTrend = Object.values(reports.reduce<Record<string, { label: string; revenue: number; date: Date }>>((acc, report) => {
    const key = report.date.toISOString().slice(0, 10);
    acc[key] ??= { label: report.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), revenue: 0, date: report.date };
    acc[key].revenue += report.salesRevenue;
    return acc;
  }, {})).sort((a, b) => a.date.getTime() - b.date.getTime()).map(({ label, revenue }) => ({ label, revenue }));
  const revenueByUser = reports.reduce<Record<string, number>>((acc, report) => {
    acc[report.userId] = (acc[report.userId] ?? 0) + report.salesRevenue;
    return acc;
  }, {});
  const salesByPersonnel = users.filter((user) => user.active).map((user) => ({ name: user.name, revenue: revenueByUser[user.id] ?? 0 })).sort((a, b) => b.revenue - a.revenue);
  const targetAchievement = targets.map((target) => ({ name: target.user.name, achievement: target.salesRevenueTarget ? Math.round(((revenueByUser[target.userId] ?? 0) / target.salesRevenueTarget) * 100) : 0 })).sort((a, b) => b.achievement - a.achievement);

  const summaryCards = [
    {
      title: "Total revenue",
      value: formatKES(totalRevenue),
      subtitle: "Month-to-date total sales",
      trend: "Current month",
    },
    {
      title: "Pipeline value",
      value: formatKES(totalPipeline),
      subtitle: "Current sales pipeline",
      trend: "Current month",
    },
    {
      title: "Target achievement",
      value: `${targets.length ? Math.round(targetAchievement.reduce((sum, item) => sum + item.achievement, 0) / targets.length) : 0}%`,
      subtitle: "Team average progress",
      trend: "Current month",
    },
    {
      title: "Win rate",
      value: `${winRate}%`,
      subtitle: "Quote close rate",
      trend: "Current month",
    },
    {
      title: "Customers",
      value: totalCustomers.toLocaleString(),
      subtitle: "Customers served",
      trend: "Current month",
    },
    {
      title: "Open quotations",
      value: Math.max(totalQuotes - closedQuotes, 0).toLocaleString(),
      subtitle: "Quotations in progress",
      trend: "Current month",
    },
    {
      title: "Accounts receivable",
      value: formatKES(totalReceivables),
      subtitle: "Outstanding balances",
      trend: "Current month",
    },
    {
      title: "Active salespeople",
      value: `${users.filter((user) => user.active).length}/${users.length}`,
      subtitle: "Active team members",
      trend: "Current month",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1440px]">
        <AdminShell
          adminUserId={session.user.id}
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
