"use client";

import { useMemo, useState } from "react";
import { Bell, Menu, Search, UserCircle2, X } from "lucide-react";
import SalesSidebar from "./SalesSidebar";
import SalesStatCards from "./SalesStatCards";
import SalesTrendChart from "./SalesTrendChart";
import SalesDailyReportForm from "./SalesDailyReportForm";
import CompanyValuesSection from "../CompanyValuesSection";
import { formatDateInEastAfrica } from "../../lib/dates";

type SalesReportItem = {
  id: string;
  date: string;
  salesRevenue: number;
  repeatCustomers: number;
  newCustomers: number;
  walkIns: number;
  dailyAcquisition: number;
  newQuotations: number;
  closedQuotations: number;
  hotQuotationValue: number;
  salesPipelineValue: number;
  accountsReceivable: number;
  opportunities: string | null;
  challenges: string | null;
  status: string;
};

type SalesShellProps = {
  userName: string;
  todayReported: boolean;
  todayRevenue: number;
  targetValue: number;
  achievementPercent: number | string;
  todaySummary: {
    revenue: number;
    salesRevenueMtd: number;
    target: number;
    varianceAmount: number;
    variancePercentage: number | string;
    previousDay: number | string;
    changeAgainstPreviousDay: number | string;
    customers: number;
    repeatCustomers: number;
    newCustomers: number;
    walkIns: number;
    dailyAcquisition: number;
    monthlyAcquisition: number;
    quotations: number;
    newQuotations: number;
    cumulativeQuotations: number;
    averageQuotationAge: number | string;
    winRate: string | number;
    pipeline: number;
    hotQuotationValue: number;
    receivables: number;
  };
  monthlySummary: {
    revenue: number;
    target: number;
    varianceAmount: number;
    variancePercentage: number | string;
    customers: number;
    dailyAcquisition: number;
    monthlyAcquisition: number;
    quotations: number;
    averageQuotationAge: number | string;
    winRate: string | number;
    pipeline: number;
    hotQuotationValue: number;
    receivables: number;
  };
  recentReports: SalesReportItem[];
  revenueTrend: Array<{ label: string; value: number }>;
  pipelineTrend: Array<{ label: string; value: number }>;
  monthlyWinRate: string | number;
  customerGrowthPercent: string | number;
  todaysReport?: SalesReportItem;
};

type Section =
  | "Dashboard"
  | "Daily Report"
  | "My Reports"
  | "My Performance"
  | "Company Values"
  | "Profile";

export default function SalesShell({
  userName,
  todayReported,
  todayRevenue,
  targetValue,
  achievementPercent,
  todaySummary,
  monthlySummary,
  recentReports,
  revenueTrend,
  pipelineTrend,
  monthlyWinRate,
  customerGrowthPercent,
  todaysReport,
}: SalesShellProps) {
  const [activeSection, setActiveSection] = useState<Section>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SalesReportItem | null>(
    null,
  );
  const [editingReport, setEditingReport] = useState<SalesReportItem | null>(
    null,
  );
  const [submissionLocked, setSubmissionLocked] = useState(todayReported);

  const formattedTodayRevenue = useMemo(
    () =>
      todayRevenue.toLocaleString("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }),
    [todayRevenue],
  );

  const formattedTarget = useMemo(
    () =>
      targetValue.toLocaleString("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }),
    [targetValue],
  );

  const formattedPipeline = useMemo(
    () =>
      monthlySummary.pipeline.toLocaleString("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }),
    [monthlySummary.pipeline],
  );
  const achievementDisplay =
    typeof achievementPercent === "number" ? `${achievementPercent}%` : "-";

  const sectionContent = useMemo(() => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <div className="space-y-6">
            <SalesStatCards
              cards={[
                {
                  title: "Today's revenue",
                  value: formattedTodayRevenue,
                  subtitle: "Daily revenue",
                },
                {
                  title: "Sales Revenue (MTD)",
                  value: monthlySummary.revenue.toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                    maximumFractionDigits: 0,
                  }),
                  subtitle: "Revenue this month",
                },
                {
                  title: "Target progress",
                  value: achievementDisplay,
                  subtitle: "Monthly goal achieved",
                },
                {
                  title: "Customers",
                  value: monthlySummary.customers.toLocaleString(),
                  subtitle: "Customers this month",
                },
                {
                  title: "Pipeline",
                  value: formattedPipeline,
                  subtitle: "Open pipeline value",
                },
                {
                  title: "Receivables",
                  value: monthlySummary.receivables.toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                    maximumFractionDigits: 0,
                  }),
                  subtitle: "Outstanding receivables",
                },
              ]}
            />

            <div className="grid gap-6 xl:grid-cols-2">
              <SalesTrendChart
                data={revenueTrend}
                title="Revenue trend"
                subtitle="Monthly revenue"
              />
              <SalesTrendChart
                data={pipelineTrend}
                title="Pipeline trend"
                subtitle="Monthly pipeline"
              />
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Today&apos;s summary
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Key metrics
                  </h2>
                </div>
                <span
                  className={`rounded-full px-3 py-2 text-sm font-semibold ${todayReported ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {todayReported ? "Submitted" : "Pending"}
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Revenue</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {todaySummary.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Repeat / New / Walk-ins
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {todaySummary.repeatCustomers} / {todaySummary.newCustomers}{" "}
                    / {todaySummary.walkIns}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Daily acquisition</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {todaySummary.dailyAcquisition}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Monthly acquisition</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {todaySummary.monthlyAcquisition}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Quotations (New / Cumulative)
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {todaySummary.newQuotations} /{" "}
                    {todaySummary.cumulativeQuotations}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Win Rate</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {todaySummary.winRate}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Hot Quotations Value</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {todaySummary.hotQuotationValue.toLocaleString("en-KE")}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Sales Pipeline Value</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {todaySummary.pipeline.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Account Receivable</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {todaySummary.receivables.toLocaleString("en-KE")}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Recent reports
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Latest activity
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {recentReports.slice(0, 4).map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatDateInEastAfrica(report.date)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Revenue KES {report.salesRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        {report.status}
                      </span>
                      <button
                        type="button"
                        disabled={report.status !== "Submitted"}
                        onClick={() => setSelectedReport(report)}
                        className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case "Daily Report":
        return (
          <div className="space-y-6">
            <SalesDailyReportForm
              key={editingReport?.id ?? todaysReport?.id ?? "new-daily-report"}
              report={editingReport ?? todaysReport}
              isSubmitted={submissionLocked || todayReported}
              isEditing={editingReport !== null}
              onSubmitted={() => {
                if (!editingReport || editingReport.id === todaysReport?.id) {
                  setSubmissionLocked(true);
                }
                setEditingReport(null);
              }}
              onCancelEdit={() => setEditingReport(null)}
            />
          </div>
        );
      case "My Reports":
        return (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                    My Reports
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Past submissions
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="search"
                    placeholder="Search"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                  <input
                    type="date"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Date
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Revenue
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Customers
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {recentReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-4 py-4 text-slate-700">
                          {formatDateInEastAfrica(report.date)}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          KES {report.salesRevenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {report.repeatCustomers +
                            report.newCustomers +
                            report.walkIns}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {report.status}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            disabled={report.status !== "Submitted"}
                            onClick={() => setSelectedReport(report)}
                            className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        );
      case "My Performance":
        return (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Sales Revenue (MTD)
                  </p>
                  <p className="mt-3 text-4xl font-semibold text-slate-900">
                    {monthlySummary.revenue.toLocaleString("en-KE", {
                      style: "currency",
                      currency: "KES",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Target progress
                  </p>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width:
                          typeof achievementPercent === "number"
                            ? `${achievementPercent}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {achievementDisplay}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Monthly target: {formattedTarget}
                  </p>
                </div>
              </div>
            </section>
            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Customer growth
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {typeof customerGrowthPercent === "number"
                    ? `${customerGrowthPercent}%`
                    : customerGrowthPercent}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Compared to last month
                </p>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Win rate
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {typeof monthlyWinRate === "number"
                    ? `${monthlyWinRate}%`
                    : monthlyWinRate}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Quotation close ratio
                </p>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Receivables
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {monthlySummary.receivables.toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Outstanding balance
                </p>
              </section>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Variance (MTD)</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">
                  KES {monthlySummary.varianceAmount.toLocaleString("en-KE")}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {monthlySummary.variancePercentage === "-"
                    ? "-"
                    : `${monthlySummary.variancePercentage}%`}
                </p>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Previous Day Revenue</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">
                  {typeof todaySummary.previousDay === "number"
                    ? `KES ${todaySummary.previousDay.toLocaleString("en-KE")}`
                    : todaySummary.previousDay}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Change: {todaySummary.changeAgainstPreviousDay}
                </p>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Average Quotation Age</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">
                  {todaySummary.averageQuotationAge}
                </p>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Monthly Acquisition</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">
                  {monthlySummary.monthlyAcquisition}
                </p>
              </section>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <SalesTrendChart
                data={revenueTrend}
                title="Revenue trend"
                subtitle="This month"
              />
              <SalesTrendChart
                data={pipelineTrend}
                title="Pipeline trend"
                subtitle="This month"
              />
            </div>
          </div>
        );
      case "Company Values":
        return <CompanyValuesSection />;
      case "Profile":
        return (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-3xl text-white">
                    {userName.charAt(0)}
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    {userName}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">Salesperson</p>
                </div>
                <div className="space-y-4 rounded-3xl bg-slate-50 p-6">
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="mt-2 text-slate-900">
                      {userName.toLowerCase().replace(" ", ".")}@company.com
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="mt-2 text-slate-900">0725406058</p>
                  </div>
                </div>
                <div className="space-y-4 rounded-3xl bg-slate-50 p-6">
                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="mt-2 text-slate-900">Sales</p>
                  </div>
                  <button className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                    Update Profile
                  </button>
                  <button className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                    Change Password
                  </button>
                </div>
              </div>
            </section>
          </div>
        );
      default:
        return null;
    }
  }, [
    activeSection,
    formattedTarget,
    formattedTodayRevenue,
    formattedPipeline,
    todayReported,
    submissionLocked,
    todaySummary,
    monthlySummary,
    recentReports,
    revenueTrend,
    achievementPercent,
    todaysReport,
    userName,
    setSelectedReport,
    achievementDisplay,
    customerGrowthPercent,
    editingReport,
    monthlyWinRate,
    pipelineTrend,
  ]);

  const sidebarWidthClass = sidebarCollapsed ? "md:ml-20" : "md:ml-[280px]";

  return (
    <div className="h-full overflow-hidden bg-[#F8FAFC]">
      <SalesSidebar
        userName={userName}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed((prev) => !prev)}
        onClose={() => setSidebarOpen(false)}
      />
      <main className={`${sidebarWidthClass} h-screen overflow-hidden`}>
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <section className="sticky top-0 z-10 border-b border-slate-200/70 bg-linear-to-r from-slate-50 via-sky-50 to-white px-4 py-2 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">
                    Sales
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                    {activeSection}
                  </h1>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-slate-700 shadow-sm md:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="relative hidden w-full max-w-md md:block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="search"
                      placeholder="Search reports"
                      className="w-full rounded-full border border-[#E5E7EB] bg-white px-4 py-3 pl-11 text-sm text-[#111827] shadow-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                        3
                      </span>
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100">
                      <UserCircle2 className="h-5 w-5 text-blue-600" />
                      <span className="hidden sm:inline">{userName}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {sectionContent}
            </div>
          </div>
        </div>
      </main>
      {selectedReport ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedReport(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="submitted-report-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase text-emerald-700">
                  Submitted report
                </p>
                <h2
                  id="submitted-report-title"
                  className="mt-1 text-xl font-semibold text-slate-950"
                >
                  {formatDateInEastAfrica(selectedReport.date, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Close report"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {[
                [
                  "Daily Revenue",
                  `KES ${selectedReport.salesRevenue.toLocaleString("en-KE")}`,
                ],
                ["Repeat Customers", String(selectedReport.repeatCustomers)],
                ["New Customers", String(selectedReport.newCustomers)],
                ["Walk-ins", String(selectedReport.walkIns)],
                ["Daily Acquisition", String(selectedReport.dailyAcquisition)],
                ["New Quotations", String(selectedReport.newQuotations)],
                [
                  "Cumulative Quotations",
                  String(selectedReport.closedQuotations),
                ],
                ["Average Quotation Age", "-"],
                [
                  "Hot Quotations Value",
                  `KES ${selectedReport.hotQuotationValue.toLocaleString("en-KE")}`,
                ],
                [
                  "Sales Pipeline Value",
                  `KES ${selectedReport.salesPipelineValue.toLocaleString("en-KE")}`,
                ],
                [
                  "Account Receivable",
                  `KES ${selectedReport.accountsReceivable.toLocaleString("en-KE")}`,
                ],
                ["Status", selectedReport.status],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-slate-100 pb-3">
                  <dt className="text-sm text-slate-500">{label}</dt>
                  <dd className="mt-1 font-medium text-slate-900">{value}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-500">Opportunities</dt>
                <dd className="mt-1 whitespace-pre-wrap text-slate-900">
                  {selectedReport.opportunities || "-"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-500">Challenges</dt>
                <dd className="mt-1 whitespace-pre-wrap text-slate-900">
                  {selectedReport.challenges || "-"}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingReport(selectedReport);
                  setSelectedReport(null);
                  setActiveSection("Daily Report");
                }}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Edit report
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
