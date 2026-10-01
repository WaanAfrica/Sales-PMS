import { prisma } from "../../lib/prisma";
import { requireRole } from "../../lib/auth";
import {
  calculateAchievementPercent,
  calculateCustomerGrowthPercent,
  calculateCustomerTotal,
  calculateDailyAcquisition,
  calculateDailyReportModel,
  calculateMonthlyReportModel,
} from "../../lib/calculations/reporting";
import {
  dateKeyToUtcDate,
  formatDateInEastAfrica,
  getEastAfricaDateKey,
  utcMonthStart,
} from "../../lib/dates";
import SalesShell from "../../components/sales/SalesShell";

export default async function DashboardPage() {
  const session = await requireRole("SALES");
  const todayDateKey = getEastAfricaDateKey();
  const [year, month] = todayDateKey.split("-").map(Number);
  const todayDate = dateKeyToUtcDate(todayDateKey);
  const startOfMonth = utcMonthStart(year, month);
  const startOfPreviousMonth = utcMonthStart(year, month - 1);
  const endOfToday = new Date(todayDate);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);

  const [
    allReports,
    monthlyTarget,
    monthToDateReports,
    previousMonthReports,
    previousReport,
  ] = await Promise.all([
    prisma.dailySales.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.monthlyTarget.findFirst({
      where: { userId: session.user.id, month, year },
    }),
    prisma.dailySales.findMany({
      where: {
        userId: session.user.id,
        status: "SUBMITTED",
        date: { gte: startOfMonth, lt: endOfToday },
      },
      orderBy: { date: "asc" },
    }),
    prisma.dailySales.findMany({
      where: {
        userId: session.user.id,
        status: "SUBMITTED",
        date: { gte: startOfPreviousMonth, lt: startOfMonth },
      },
    }),
    prisma.dailySales.findFirst({
      where: {
        userId: session.user.id,
        status: "SUBMITTED",
        date: { lt: todayDate },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const todaysRawReport = allReports.find(
    (report) => report.date.toISOString().slice(0, 10) === todayDateKey,
  );
  const activeUser = [{ id: session.user.id, name: session.user.name }];
  const dailyModel = calculateDailyReportModel({
    reportDate: todayDate,
    activeUsers: activeUser,
    reports: todaysRawReport ? [todaysRawReport] : [],
    monthToDateReports,
    targets: monthlyTarget ? [monthlyTarget] : [],
    previousReportsByUser: new Map([
      [session.user.id, previousReport ?? undefined],
    ]),
  });
  const monthlyModel = calculateMonthlyReportModel({
    month,
    year,
    activeUsers: activeUser,
    reports: monthToDateReports,
    targets: monthlyTarget ? [monthlyTarget] : [],
  });
  const todayRow = dailyModel.rows[0];
  const monthlyRow = monthlyModel.rows[0];
  const targetValue = monthlyRow.revenueSummary.target;
  const achievementPercent = calculateAchievementPercent(
    monthlyRow.revenueSummary.actual,
    targetValue,
  );

  const todaySummary = {
    revenue: todayRow.revenueSummary.dailyRevenue,
    salesRevenueMtd: todayRow.revenueSummary.monthToDateRevenue,
    target: todayRow.revenueSummary.target,
    varianceAmount: todayRow.revenueSummary.varianceAmount,
    variancePercentage: todayRow.revenueSummary.variancePercentage,
    previousDay: todayRow.revenueSummary.previousDay,
    changeAgainstPreviousDay:
      todayRow.revenueSummary.changeAgainstPreviousDay,
    customers: calculateCustomerTotal(
      todaysRawReport ? [todaysRawReport] : [],
    ),
    repeatCustomers: todayRow.customerSummary.repeat,
    newCustomers: todayRow.customerSummary.new,
    walkIns: todayRow.customerSummary.walkIns,
    dailyAcquisition: todayRow.customerSummary.dailyAcquisition,
    monthlyAcquisition: todayRow.customerSummary.monthlyAcquisition,
    quotations:
      todayRow.quotationSummary.new + todayRow.quotationSummary.cumulative,
    newQuotations: todayRow.quotationSummary.new,
    cumulativeQuotations: todayRow.quotationSummary.cumulative,
    averageQuotationAge: todayRow.quotationSummary.averageAge,
    winRate: todayRow.winRate,
    pipeline: todayRow.salesPipelineValue,
    hotQuotationValue: todayRow.hotQuotationValue,
    receivables: todayRow.accountReceivable,
  };
  const monthlySummary = {
    revenue: monthlyRow.revenueSummary.actual,
    target: monthlyRow.revenueSummary.target,
    varianceAmount: monthlyRow.revenueSummary.varianceAmount,
    variancePercentage: monthlyRow.revenueSummary.variancePercentage,
    customers: calculateCustomerTotal(monthToDateReports),
    dailyAcquisition: monthlyRow.customerSummary.dailyAcquisition,
    monthlyAcquisition: monthlyRow.customerSummary.monthlyAcquisition,
    quotations: monthlyRow.quotationSummary.total,
    averageQuotationAge: monthlyRow.quotationSummary.averageAge,
    winRate: monthlyRow.winRate,
    pipeline: monthlyRow.salesPipelineValue,
    hotQuotationValue: monthlyRow.hotQuotationValue,
    receivables: monthlyRow.accountReceivable,
  };

  const customerGrowthPercent = calculateCustomerGrowthPercent(
    monthToDateReports,
    previousMonthReports,
  );
  const revenueTrend = monthToDateReports.slice(-7).map((report) => ({
    label: formatDateInEastAfrica(report.date, {
      day: "numeric",
      month: "short",
    }),
    value: report.salesRevenue,
  }));
  const pipelineTrend = monthToDateReports.slice(-7).map((report) => ({
    label: formatDateInEastAfrica(report.date, {
      day: "numeric",
      month: "short",
    }),
    value: report.salesPipelineValue,
  }));

  const recentReports = allReports.map((report) => ({
    id: report.id,
    date: report.date.toISOString(),
    salesRevenue: report.salesRevenue,
    repeatCustomers: report.repeatCustomers,
    newCustomers: report.newCustomers,
    walkIns: report.walkIns,
    dailyAcquisition: calculateDailyAcquisition(
      report.newCustomers,
      report.walkIns,
    ),
    newQuotations: report.newQuotations,
    closedQuotations: report.closedQuotations,
    hotQuotationValue: report.hotQuotationValue,
    salesPipelineValue: report.salesPipelineValue,
    accountsReceivable: report.accountsReceivable,
    opportunities: report.opportunities,
    challenges: report.challenges,
    status:
      report.status === "SUBMITTED"
        ? "Submitted"
        : report.status === "DRAFT"
          ? "Draft"
          : "Pending",
  }));
  const todaysReport = todaysRawReport
    ? recentReports.find((report) => report.id === todaysRawReport.id)
    : undefined;

  return (
    <main className="h-screen overflow-hidden bg-slate-50 px-8 pb-8 pt-0 text-slate-900">
      <div className="mx-auto h-full max-w-7xl">
        <SalesShell
          userName={session.user.name}
          todayReported={todayRow.status === "Submitted"}
          todayRevenue={todaySummary.revenue}
          targetValue={targetValue}
          achievementPercent={achievementPercent}
          todaySummary={todaySummary}
          monthlySummary={monthlySummary}
          recentReports={recentReports}
          revenueTrend={revenueTrend}
          pipelineTrend={pipelineTrend}
          monthlyWinRate={monthlyRow.winRate}
          customerGrowthPercent={customerGrowthPercent}
          todaysReport={todaysReport}
        />
      </div>
    </main>
  );
}