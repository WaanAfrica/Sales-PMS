import type { DailySalesRecord, MonthlyTargetRecord } from "@/types";

type ReportDate = string | Date;

type RawReport = Omit<DailySalesRecord, "date"> & { date: ReportDate };

export type DailySalesWithUser = RawReport & {
  user: {
    name: string;
  };
};

export type TargetWithUser = MonthlyTargetRecord & {
  user: {
    name: string;
  };
};

function parseReportDate(date: ReportDate): number {
  return typeof date === "string" ? new Date(date).getTime() : date.getTime();
}

function sameDay(dateA: ReportDate, dateB: ReportDate) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getLatestReport<T extends { date: ReportDate }>(reports: T[]): T | undefined {
  if (reports.length === 0) return undefined;
  return reports.reduce((latest, current) => {
    return parseReportDate(current.date) > parseReportDate(latest.date)
      ? current
      : latest;
  });
}

export function findReportByDate<T extends { date: ReportDate }>(
  reports: T[],
  targetDate: Date,
) {
  return reports.find((report) => sameDay(report.date, targetDate));
}

export function sumRevenue(reports: RawReport[]) {
  return reports.reduce((sum, report) => sum + report.salesRevenue, 0);
}

export function sumRepeatCustomers(reports: RawReport[]) {
  return reports.reduce((sum, report) => sum + report.repeatCustomers, 0);
}

export function sumNewCustomers(reports: RawReport[]) {
  return reports.reduce((sum, report) => sum + report.newCustomers, 0);
}

export function sumWalkIns(reports: RawReport[]) {
  return reports.reduce((sum, report) => sum + report.walkIns, 0);
}

export function sumCustomerTotal(reports: RawReport[]) {
  return sumRepeatCustomers(reports) + sumNewCustomers(reports) + sumWalkIns(reports);
}

export function sumNewQuotations(reports: RawReport[]) {
  return reports.reduce((sum, report) => sum + report.newQuotations, 0);
}

export function sumClosedQuotations(reports: RawReport[]) {
  return reports.reduce((sum, report) => sum + report.closedQuotations, 0);
}

export function calculateWinRate(reports: RawReport[]) {
  const totalNew = sumNewQuotations(reports);
  if (totalNew === 0) return 0;
  return Math.round((sumClosedQuotations(reports) / totalNew) * 100);
}

export function sumPipelineValue(reports: RawReport[]) {
  return reports.reduce((sum, report) => sum + report.salesPipelineValue, 0);
}

export function sumAccountsReceivable(reports: RawReport[]) {
  return reports.reduce((sum, report) => sum + report.accountsReceivable, 0);
}

export function getLatestPipelineValue(reports: RawReport[]) {
  return getLatestReport(reports)?.salesPipelineValue ?? 0;
}

export function getLatestHotQuotationValue(reports: RawReport[]) {
  return getLatestReport(reports)?.hotQuotationValue ?? 0;
}

export function getLatestAccountsReceivable(reports: RawReport[]) {
  return getLatestReport(reports)?.accountsReceivable ?? 0;
}

export function calculateVariance(actualRevenue: number, targetRevenue: number) {
  return actualRevenue - targetRevenue;
}

export function calculatePercentageChange(currentValue: number, previousValue: number) {
  if (previousValue === 0) return null;
  return Math.round(((currentValue - previousValue) / previousValue) * 100);
}

export function calculateChangeAgainstPreviousDay(
  reports: RawReport[],
  currentDate = new Date(),
) {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayReport = findReportByDate(reports, today);
  const yesterdayReport = findReportByDate(reports, yesterday);

  if (!todayReport || !yesterdayReport || yesterdayReport.salesRevenue === 0) {
    return null;
  }

  return calculatePercentageChange(todayReport.salesRevenue, yesterdayReport.salesRevenue);
}

export function sumMonthlyTargetRevenue(targets: MonthlyTargetRecord[]) {
  return targets.reduce((sum, target) => sum + target.salesRevenueTarget, 0);
}

export function calculateTargetAchievement(
  targets: TargetWithUser[],
  salesByPersonnel: Array<{ name: string; revenue: number }>,
) {
  return targets.map((target) => {
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
}

export function groupRevenueBySalesperson(
  reports: Array<RawReport & { user: { name: string } }>,
) {
  const byName = reports.reduce<Record<string, number>>((acc, report) => {
    const name = report.user.name;
    acc[name] = (acc[name] ?? 0) + report.salesRevenue;
    return acc;
  }, {});

  return Object.entries(byName)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}
