import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import SalesShell from "@/components/sales/SalesShell";

type DailyReport = {
  id: string;
  date: string;
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
  opportunities: string | null;
  challenges: string | null;
};

export default async function DashboardPage() {
  const session = await requireRole("SALES");
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfPreviousMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  );

  const [allReports, monthlyTarget, previousReports] = await Promise.all([
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
    prisma.dailySales.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfPreviousMonth,
          lt: startOfMonth,
        },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const normalizedReports: DailyReport[] = allReports.map((report) => ({
    id: report.id,
    date:
      report.date instanceof Date
        ? report.date.toISOString()
        : new Date(report.date).toISOString(),
    salesRevenue: report.salesRevenue,
    repeatCustomers: report.repeatCustomers,
    newCustomers: report.newCustomers,
    walkIns: report.walkIns,
    newQuotations: report.newQuotations,
    closedQuotations: report.closedQuotations,
    quotationAge: report.quotationAge,
    hotQuotationValue: report.hotQuotationValue,
    salesPipelineValue: report.salesPipelineValue,
    accountsReceivable: report.accountsReceivable,
    opportunities: report.opportunities,
    challenges: report.challenges,
  }));

  const todaysReport = normalizedReports
    .map((report) => ({
      ...report,
      status:
        report.status === "SUBMITTED"
          ? "Submitted"
          : report.status === "DRAFT"
            ? "Draft"
            : "Pending",
    }))
    .find(
      (report) => new Date(report.date).toDateString() === now.toDateString(),
    );

  const monthlyReports = normalizedReports.filter((report) => {
    const date = new Date(report.date);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });

  const todaySummary = {
    revenue: todaysReport?.salesRevenue ?? 0,
    customers: todaysReport
      ? todaysReport.repeatCustomers +
        todaysReport.newCustomers +
        todaysReport.walkIns
      : 0,
    quotations: todaysReport
      ? todaysReport.newQuotations + todaysReport.closedQuotations
      : 0,
    pipeline: todaysReport?.salesPipelineValue ?? 0,
    receivables: todaysReport?.accountsReceivable ?? 0,
  };

  const monthlySummary = {
    revenue: monthlyReports.reduce((sum, item) => sum + item.salesRevenue, 0),
    customers: monthlyReports.reduce(
      (sum, item) =>
        sum + item.repeatCustomers + item.newCustomers + item.walkIns,
      0,
    ),
    quotations: monthlyReports.reduce(
      (sum, item) => sum + item.newQuotations + item.closedQuotations,
      0,
    ),
    pipeline: monthlyReports.reduce(
      (sum, item) => sum + item.salesPipelineValue,
      0,
    ),
    receivables: monthlyReports.reduce(
      (sum, item) => sum + item.accountsReceivable,
      0,
    ),
  };

  const targetValue = monthlyTarget?.salesRevenueTarget ?? 0;
  const achievementPercent = targetValue
    ? Math.min(100, Math.round((monthlySummary.revenue / targetValue) * 100))
    : 0;

  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthReports = await prisma.dailySales.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: previousMonthStart,
        lt: previousMonthEnd,
      },
    },
  });
  const previousCustomerCount = previousMonthReports.reduce(
    (sum, item) =>
      sum + item.repeatCustomers + item.newCustomers + item.walkIns,
    0,
  );
  const customerGrowthPercent = previousCustomerCount
    ? Math.round(
        ((monthlySummary.customers - previousCustomerCount) /
          previousCustomerCount) *
          100,
      )
    : 0;

  const revenueTrend = monthlyReports
    .slice(0, 7)
    .reverse()
    .map((report) => ({
      label: new Date(report.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      value: report.salesRevenue,
    }));

  const pipelineTrend = monthlyReports
    .slice(0, 7)
    .reverse()
    .map((report) => ({
      label: new Date(report.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      value: report.salesPipelineValue,
    }));

  const winRate = monthlyReports.reduce(
    (sum, item) => sum + item.closedQuotations,
    0,
  );
  const totalQuotations = monthlyReports.reduce(
    (sum, item) => sum + item.newQuotations,
    0,
  );
  const monthlyWinRate = totalQuotations
    ? Math.round((winRate / totalQuotations) * 100)
    : 0;

  const recentReports = allReports.map((report) => ({
    id: report.id,
    date: report.date.toISOString(),
    salesRevenue: report.salesRevenue,
    repeatCustomers: report.repeatCustomers,
    newCustomers: report.newCustomers,
    walkIns: report.walkIns,
    newQuotations: report.newQuotations,
    closedQuotations: report.closedQuotations,
    quotationAge: report.quotationAge,
    hotQuotationValue: report.hotQuotationValue,
    salesPipelineValue: report.salesPipelineValue,
    accountsReceivable: report.accountsReceivable,
    opportunities: report.opportunities,
    challenges: report.challenges,
    status: report.closedQuotations > 0 ? "Submitted" : "Pending",
  }));

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <SalesShell
          userName={session.user.name}
          todayReported={todaysReport?.status === "Submitted"}
          todayRevenue={todaySummary.revenue}
          targetValue={targetValue}
          achievementPercent={achievementPercent}
          todaySummary={todaySummary}
          monthlySummary={monthlySummary}
          recentReports={recentReports}
          revenueTrend={revenueTrend}
          pipelineTrend={pipelineTrend}
          monthlyWinRate={monthlyWinRate}
          customerGrowthPercent={customerGrowthPercent}
          todaysReport={todaysReport ?? undefined}
        />
      </div>
    </main>
  );
}
