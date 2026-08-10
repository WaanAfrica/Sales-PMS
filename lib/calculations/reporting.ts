import type { DailySalesRecord, MonthlyTargetRecord } from "../../types";

export type ReportStatus = "Pending" | "Draft" | "Submitted" | "Not Submitted";

export type DailyReportSummary = {
  target: number;
  actual: number;
  varianceAmount: number;
  variancePercentage: number | string;
  previousDay: number | string;
  changeAgainstPreviousDay: number | string;
};

export type CustomerSummary = {
  repeat: number;
  new: number;
  walkIns: number;
  dailyAcquisition: number;
  monthlyAcquisition: number;
};

export type QuotationSummary = {
  new: number;
  cumulative: number;
  averageAge: number;
};

export type SalespersonReportRow = {
  userId: string;
  name: string;
  status: ReportStatus;
  report?: DailySalesRecord;
  target?: MonthlyTargetRecord;
  revenueSummary: DailyReportSummary;
  customerSummary: CustomerSummary;
  quotationSummary: QuotationSummary;
  hotQuotationValue: number;
  salesPipelineValue: number;
  accountReceivable: number;
  winRate: string | number;
  opportunities: string;
  challenges: string;
  submittedAt: string | null;
  updatedAt: string;
};

export type DailyReportModel = {
  reportDate: string;
  activePersonnel: number;
  submitted: number;
  pending: number;
  drafts: number;
  rows: SalespersonReportRow[];
  teamTotals: {
    target: number;
    actual: number;
    varianceAmount: number;
    variancePercentage: number | string;
    customers: number;
    dailyAcquisition: number;
    quotations: number;
    pipeline: number;
    receivables: number;
    winRate: string | number;
  };
};

export type MonthlyReportRow = {
  userId: string;
  name: string;
  status: ReportStatus;
  reportCount: number;
  target?: MonthlyTargetRecord;
  revenueSummary: {
    target: number;
    actual: number;
    varianceAmount: number;
    variancePercentage: number | string;
    achievement: string | number;
  };
  customerSummary: CustomerSummary;
  quotationSummary: QuotationSummary & {
    total: number;
  };
  hotQuotationValue: number;
  salesPipelineValue: number;
  accountReceivable: number;
  winRate: string | number;
  opportunities: string[];
  challenges: string[];
};

export type MonthlyReportModel = {
  month: number;
  year: number;
  activePersonnel: number;
  submitted: number;
  pending: number;
  drafts: number;
  rows: MonthlyReportRow[];
  teamTotals: {
    target: number;
    actual: number;
    varianceAmount: number;
    variancePercentage: number | string;
    customers: number;
    dailyAcquisition: number;
    quotations: number;
    pipeline: number;
    receivables: number;
    winRate: string | number;
  };
};

export function calculateVariance(actual: number, target: number) {
  const amount = actual - target;
  const percentage = target === 0 ? "N/A" : Math.round((amount / target) * 100);
  return { amount, percentage };
}

export function calculateAchievement(actual: number, target: number) {
  if (target <= 0) return "N/A";
  return `${Math.min(100, Math.round((actual / target) * 100))}%`;
}

export function calculateChangeAgainstPreviousDay(
  currentValue: number,
  previousValue?: number,
) {
  if (typeof previousValue === "undefined" || previousValue === 0) return "N/A";
  return `${Math.round(((currentValue - previousValue) / previousValue) * 100)}%`;
}

export function calculateWinRate(
  closedQuotations: number,
  newQuotations: number,
) {
  if (newQuotations <= 0) return "N/A";
  return `${Math.round((closedQuotations / newQuotations) * 100)}%`;
}

export function calculateMonthlyAcquisition(
  repeatCustomers: number,
  newCustomers: number,
  walkIns: number,
) {
  return repeatCustomers + newCustomers + walkIns;
}

export function calculateStatus(
  status?: "PENDING" | "DRAFT" | "SUBMITTED",
): ReportStatus {
  if (!status) return "Not Submitted";
  if (status === "SUBMITTED") return "Submitted";
  if (status === "DRAFT") return "Draft";
  return "Pending";
}

export function calculateTeamTotals(rows: SalespersonReportRow[]) {
  const submittedRows = rows.filter((row) => row.status === "Submitted");
  const actual = submittedRows.reduce((sum, row) => sum + row.revenueSummary.actual, 0);
  const target = submittedRows.reduce(
    (sum, row) => sum + (row.target?.salesRevenueTarget ?? 0),
    0,
  );
  const variance = calculateVariance(actual, target);
  const customers = submittedRows.reduce(
    (sum, row) => sum + row.customerSummary.monthlyAcquisition,
    0,
  );
  const dailyAcquisition = submittedRows.reduce((sum, row) => sum + row.customerSummary.dailyAcquisition, 0);
  const quotations = submittedRows.reduce(
    (sum, row) =>
      sum + row.quotationSummary.new + row.quotationSummary.cumulative,
    0,
  );
  const pipeline = submittedRows.reduce((sum, row) => sum + row.salesPipelineValue, 0);
  const receivables = submittedRows.reduce((sum, row) => sum + row.accountReceivable, 0);
  const winRate = calculateWinRate(
    submittedRows.reduce((sum, row) => sum + (row.report?.closedQuotations ?? 0), 0),
    submittedRows.reduce((sum, row) => sum + (row.report?.newQuotations ?? 0), 0),
  );

  return {
    target,
    actual,
    varianceAmount: variance.amount,
    variancePercentage: variance.percentage,
    customers,
    dailyAcquisition,
    quotations,
    pipeline,
    receivables,
    winRate,
  };
}

export function calculateDailyReportModel(params: {
  reportDate: Date;
  activeUsers: Array<{ id: string; name: string }>;
  reports: DailySalesRecord[];
  targets: MonthlyTargetRecord[];
  previousReportsByUser: Map<string, DailySalesRecord | undefined>;
}): DailyReportModel {
  const rows: SalespersonReportRow[] = params.activeUsers.map((user) => {
    const report = params.reports.find((item) => item.userId === user.id);
    const target = params.targets.find((item) => item.userId === user.id);
    const previousReport = params.previousReportsByUser.get(user.id);
    const actual = report?.salesRevenue ?? 0;
    const targetRevenue = target?.salesRevenueTarget ?? 0;
    const variance = calculateVariance(actual, targetRevenue);
    const changeAgainstPreviousDay = calculateChangeAgainstPreviousDay(
      actual,
      previousReport?.salesRevenue,
    );
    const status = calculateStatus(report?.status);

    return {
      userId: user.id,
      name: user.name,
      status,
      report,
      target,
      revenueSummary: {
        target: targetRevenue,
        actual,
        varianceAmount: variance.amount,
        variancePercentage: variance.percentage,
        previousDay: previousReport?.salesRevenue ?? "N/A",
        changeAgainstPreviousDay,
      },
      customerSummary: {
        repeat: report?.repeatCustomers ?? 0,
        new: report?.newCustomers ?? 0,
        walkIns: report?.walkIns ?? 0,
        dailyAcquisition: report?.dailyAcquisition ?? 0,
        monthlyAcquisition: calculateMonthlyAcquisition(
          report?.repeatCustomers ?? 0,
          report?.newCustomers ?? 0,
          report?.walkIns ?? 0,
        ),
      },
      quotationSummary: {
        new: report?.newQuotations ?? 0,
        cumulative: report?.closedQuotations ?? 0,
        averageAge: report?.quotationAge ?? 0,
      },
      hotQuotationValue: report?.hotQuotationValue ?? 0,
      salesPipelineValue: report?.salesPipelineValue ?? 0,
      accountReceivable: report?.accountsReceivable ?? 0,
      winRate: calculateWinRate(
        report?.closedQuotations ?? 0,
        report?.newQuotations ?? 0,
      ),
      opportunities: report?.opportunities ?? "N/A",
      challenges: report?.challenges ?? "N/A",
      submittedAt: report?.submittedAt
        ? report.submittedAt.toISOString()
        : null,
      updatedAt: report?.updatedAt
        ? report.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  });

  return {
    reportDate: params.reportDate.toISOString().slice(0, 10),
    activePersonnel: rows.length,
    submitted: rows.filter((row) => row.status === "Submitted").length,
    pending: rows.filter((row) => row.status === "Not Submitted").length,
    drafts: rows.filter((row) => row.status === "Draft").length,
    rows,
    teamTotals: calculateTeamTotals(rows),
  };
}

function parseReportDate(date: string | Date): number {
  return typeof date === "string" ? new Date(date).getTime() : date.getTime();
}

function getLatestReport<T extends { date: string | Date }>(
  reports: T[],
): T | undefined {
  if (reports.length === 0) return undefined;
  return reports.reduce((latest, current) =>
    parseReportDate(current.date) > parseReportDate(latest.date)
      ? current
      : latest,
  );
}

export function calculateMonthlyReportModel(params: {
  month: number;
  year: number;
  activeUsers: Array<{ id: string; name: string }>;
  reports: DailySalesRecord[];
  targets: MonthlyTargetRecord[];
}): MonthlyReportModel {
  const rows: MonthlyReportRow[] = params.activeUsers.map((user) => {
    const userReports = params.reports.filter(
      (report) => report.userId === user.id,
    );
    const submittedReports = userReports.filter((report) => report.status === "SUBMITTED");
    const target = params.targets.find((item) => item.userId === user.id);
    const actualRevenue = submittedReports.reduce(
      (sum, report) => sum + report.salesRevenue,
      0,
    );
    const actualCustomers = submittedReports.reduce(
      (sum, report) =>
        sum + report.repeatCustomers + report.newCustomers + report.walkIns,
      0,
    );
    const newQuotations = submittedReports.reduce(
      (sum, report) => sum + report.newQuotations,
      0,
    );
    const closedQuotations = submittedReports.reduce(
      (sum, report) => sum + report.closedQuotations,
      0,
    );
    const averageAge = submittedReports.length
      ? Math.round(
          submittedReports.reduce((sum, report) => sum + report.quotationAge, 0) /
            submittedReports.length,
        )
      : 0;
    const latestPipelineValue =
      getLatestReport(submittedReports)?.salesPipelineValue ?? 0;
    const latestHotQuotationValue =
      getLatestReport(submittedReports)?.hotQuotationValue ?? 0;
    const latestAccountsReceivable =
      getLatestReport(submittedReports)?.accountsReceivable ?? 0;
    const variance = calculateVariance(
      actualRevenue,
      target?.salesRevenueTarget ?? 0,
    );
    const achievement = calculateAchievement(
      actualRevenue,
      target?.salesRevenueTarget ?? 0,
    );
    const winRate = calculateWinRate(closedQuotations, newQuotations);

    return {
      userId: user.id,
      name: user.name,
      status: submittedReports.length > 0 ? "Submitted" : userReports.length > 0 ? "Draft" : "Not Submitted",
      reportCount: submittedReports.length,
      target,
      revenueSummary: {
        target: target?.salesRevenueTarget ?? 0,
        actual: actualRevenue,
        varianceAmount: variance.amount,
        variancePercentage: variance.percentage,
        achievement,
      },
      customerSummary: {
        repeat: submittedReports.reduce(
          (sum, report) => sum + report.repeatCustomers,
          0,
        ),
        new: submittedReports.reduce((sum, report) => sum + report.newCustomers, 0),
        walkIns: submittedReports.reduce((sum, report) => sum + report.walkIns, 0),
        dailyAcquisition: submittedReports.reduce((sum, report) => sum + report.dailyAcquisition, 0),
        monthlyAcquisition: actualCustomers,
      },
      quotationSummary: {
        new: newQuotations,
        cumulative: closedQuotations,
        averageAge,
        total: newQuotations + closedQuotations,
      },
      hotQuotationValue: latestHotQuotationValue,
      salesPipelineValue: latestPipelineValue,
      accountReceivable: latestAccountsReceivable,
      winRate,
      opportunities: userReports
        .filter((report) => report.opportunities)
        .map((report) => report.opportunities ?? ""),
      challenges: userReports
        .filter((report) => report.challenges)
        .map((report) => report.challenges ?? ""),
    };
  });

  const teamTotals: MonthlyReportModel["teamTotals"] = {
    target: rows.reduce(
      (sum, row) => sum + (row.target?.salesRevenueTarget ?? 0),
      0,
    ),
    actual: rows.reduce((sum, row) => sum + row.revenueSummary.actual, 0),
    varianceAmount: rows.reduce(
      (sum, row) => sum + row.revenueSummary.varianceAmount,
      0,
    ),
    variancePercentage: "N/A",
    customers: rows.reduce(
      (sum, row) => sum + row.customerSummary.monthlyAcquisition,
      0,
    ),
    dailyAcquisition: rows.reduce((sum, row) => sum + row.customerSummary.dailyAcquisition, 0),
    quotations: rows.reduce((sum, row) => sum + row.quotationSummary.total, 0),
    pipeline: rows.reduce((sum, row) => sum + row.salesPipelineValue, 0),
    receivables: rows.reduce((sum, row) => sum + row.accountReceivable, 0),
    winRate: calculateWinRate(
      rows.reduce((sum, row) => sum + row.quotationSummary.cumulative, 0),
      rows.reduce((sum, row) => sum + row.quotationSummary.new, 0),
    ),
  };

  if (teamTotals.target > 0) {
    const teamVariance = calculateVariance(
      teamTotals.actual,
      teamTotals.target,
    );
    teamTotals.variancePercentage = teamVariance.percentage;
  }

  return {
    month: params.month,
    year: params.year,
    activePersonnel: rows.length,
    submitted: rows.filter((row) => row.status === "Submitted").length,
    pending: rows.filter((row) => row.status === "Not Submitted").length,
    drafts: rows.filter((row) => row.status === "Draft").length,
    rows,
    teamTotals,
  };
}
