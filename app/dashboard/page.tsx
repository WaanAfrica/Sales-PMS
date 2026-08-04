import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import SalesShell from "@/components/sales/SalesShell";

type DailyReport = {
  id: string;
  date: string | Date;
  salesRevenue: number;
  repeatCustomers: number;
  newCustomers: number;
  walkIns: number;
  newQuotations: number;
  closedQuotations: number;
  quotationAge: number;
  salesPipelineValue: number;
  hotQuotationValue: number;
  accountsReceivable: number;
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const now = new Date();
  const [allReports, monthlyTarget] = await Promise.all([
    prisma.dailySales.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.monthlyTarget.findFirst({
      where: {
        userId: session.user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    }),
  ]);

  const todaysReport = allReports.find(
    (report) => new Date(report.date).toDateString() === now.toDateString(),
  );

  const monthlyReports = allReports.filter(
    (report) => {
      const date = new Date(report.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    },
  );

  const todaySummary = {
    revenue: todaysReport?.salesRevenue ?? 0,
    customers: todaysReport ? todaysReport.repeatCustomers + todaysReport.newCustomers + todaysReport.walkIns : 0,
    quotations: todaysReport ? todaysReport.newQuotations + todaysReport.closedQuotations : 0,
    pipeline: todaysReport?.salesPipelineValue ?? 0,
  };

  const monthlySummary = {
    revenue: monthlyReports.reduce((sum, item) => sum + item.salesRevenue, 0),
    customers: monthlyReports.reduce(
      (sum, item) => sum + item.repeatCustomers + item.newCustomers + item.walkIns,
      0,
    ),
    quotations: monthlyReports.reduce((sum, item) => sum + item.newQuotations + item.closedQuotations, 0),
    pipeline: monthlyReports.reduce((sum, item) => sum + item.salesPipelineValue, 0),
  };

  const targetValue = monthlyTarget?.salesRevenueTarget ?? 0;
  const achievementPercent = targetValue
    ? Math.min(100, Math.round((monthlySummary.revenue / targetValue) * 100))
    : 0;

  const revenueTrend = monthlyReports
    .slice(0, 7)
    .reverse()
    .map((report) => ({
      label: new Date(report.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      revenue: report.salesRevenue,
    }));

  const recentReports = allReports.map((report) => ({
    id: report.id,
    date: report.date,
    salesRevenue: report.salesRevenue,
    repeatCustomers: report.repeatCustomers,
    newCustomers: report.newCustomers,
    walkIns: report.walkIns,
    newQuotations: report.newQuotations,
    closedQuotations: report.closedQuotations,
    salesPipelineValue: report.salesPipelineValue,
    accountsReceivable: report.accountsReceivable,
    status: report.closedQuotations > 0 ? 'Submitted' : 'Pending',
  }));

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <SalesShell
          userName={session.user.name}
          todayReported={Boolean(todaysReport)}
          todayRevenue={todaySummary.revenue}
          targetValue={targetValue}
          achievementPercent={achievementPercent}
          todaySummary={todaySummary}
          monthlySummary={monthlySummary}
          recentReports={recentReports}
          revenueTrend={revenueTrend}
          todaysReport={todaysReport ?? undefined}
        />
      </div>
    </main>
  );
}
