"use client";

import { Bell, Menu, Search, UserCircle2 } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { assignTargets, createUser } from "@/actions/daily-report";
import DashboardOverview from "./DashboardOverview";
import DashboardChart from "./DashboardChart";
import DashboardTable from "./DashboardTable";
import AdminSidebar from "./AdminSidebar";

type SummaryCard = {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
};

type RevenuePoint = {
  label: string;
  revenue: number;
};

type SalesPersonData = {
  name: string;
  revenue: number;
};

type TargetAchievementItem = {
  name: string;
  achievement: number;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

type ReportItem = {
  id: string;
  date: string | Date;
  salesRevenue: number;
  repeatCustomers: number;
  newCustomers: number;
  walkIns: number;
  newQuotations: number;
  closedQuotations: number;
  quotationAge: number;
  hotQuotationValue: number;
  salesPipelineValue: number;
  accountsReceivable: number;
  opportunities: string | null;
  challenges: string | null;
  user: {
    name: string;
  };
};

type TargetItem = {
  id: string;
  salesRevenueTarget: number;
  pipelineTarget: number;
  repeatCustomerTarget: number;
  newCustomerTarget: number;
  walkInTarget: number;
  quotationTarget: number;
  user: {
    name: string;
  };
};

type AdminShellProps = {
  summaryCards: SummaryCard[];
  dailyRevenueTrend: RevenuePoint[];
  salesByPersonnel: SalesPersonData[];
  targetAchievement: TargetAchievementItem[];
  users: UserItem[];
  reports: ReportItem[];
  monthlyReports: ReportItem[];
  targets: TargetItem[];
};

const sections = [
  "Dashboard",
  "Daily Reports",
  "Users",
  "Targets",
  "Reports",
  "Settings",
] as const;

type Section = (typeof sections)[number];

export default function AdminShell({
  summaryCards,
  dailyRevenueTrend,
  salesByPersonnel,
  targetAchievement,
  users,
  reports,
  monthlyReports,
  targets,
}: AdminShellProps) {
  const [activeSection, setActiveSection] = useState<Section>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "SALES";
    active: boolean;
  }>({
    name: "",
    email: "",
    password: "",
    role: "SALES",
    active: true,
  });
  const [targetForm, setTargetForm] = useState({
    userId: users[0]?.id ?? "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    salesRevenueTarget: 0,
    repeatCustomerTarget: 0,
    newCustomerTarget: 0,
    walkInTarget: 0,
    quotationTarget: 0,
    pipelineTarget: 0,
  });
  const [actionMessage, setActionMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const performanceRows = useMemo(
    () =>
      targets.map((target) => {
        const revenue =
          salesByPersonnel.find((person) => person.name === target.user.name)
            ?.revenue ?? 0;
        const achievement = target.salesRevenueTarget
          ? Math.round((revenue / target.salesRevenueTarget) * 100)
          : 0;
        const status =
          achievement >= 95
            ? "on-track"
            : achievement >= 75
              ? "near-target"
              : "behind";
        return {
          name: target.user.name,
          revenue: revenue.toLocaleString(),
          target: target.salesRevenueTarget.toLocaleString(),
          status: status as "on-track" | "near-target" | "behind",
        };
      }),
    [salesByPersonnel, targets],
  );

  const handleExportExcel = useCallback(() => {
    const reportRows = monthlyReports.map((report) => ({
      Date:
        report.date instanceof Date
          ? report.date.toLocaleDateString("en-GB")
          : new Date(report.date).toLocaleDateString("en-GB"),
      Salesperson: report.user.name,
      "Sales Revenue": report.salesRevenue,
      "Repeat Customers": report.repeatCustomers,
      "New Customers": report.newCustomers,
      "Walk-ins": report.walkIns,
      "New Quotations": report.newQuotations,
      "Closed Quotations": report.closedQuotations,
      "Quotation Age": report.quotationAge,
      "Hot Quotation Value": report.hotQuotationValue,
      "Pipeline Value": report.salesPipelineValue,
      "Accounts Receivable": report.accountsReceivable,
      Opportunities: report.opportunities ?? "",
      Challenges: report.challenges ?? "",
      "Monthly Revenue Target":
        targets.find((target) => target.user.name === report.user.name)
          ?.salesRevenueTarget ?? "",
      "Monthly Pipeline Target":
        targets.find((target) => target.user.name === report.user.name)
          ?.pipelineTarget ?? "",
    }));

    const targetRows = targets.map((target) => ({
      Salesperson: target.user.name,
      "Revenue Target": target.salesRevenueTarget,
      "Pipeline Target": target.pipelineTarget,
      "Repeat Customer Target": target.repeatCustomerTarget,
      "New Customer Target": target.newCustomerTarget,
      "Walk-in Target": target.walkInTarget,
      "Quotation Target": target.quotationTarget,
    }));

    const workbook = XLSX.utils.book_new();
    const reportsSheet = XLSX.utils.json_to_sheet(reportRows, {
      header: [
        "Date",
        "Salesperson",
        "Sales Revenue",
        "Repeat Customers",
        "New Customers",
        "Walk-ins",
        "New Quotations",
        "Closed Quotations",
        "Quotation Age",
        "Hot Quotation Value",
        "Pipeline Value",
        "Accounts Receivable",
        "Opportunities",
        "Challenges",
        "Monthly Revenue Target",
        "Monthly Pipeline Target",
      ],
    });
    XLSX.utils.book_append_sheet(workbook, reportsSheet, "Sales Records");

    const targetsSheet = XLSX.utils.json_to_sheet(targetRows, {
      header: [
        "Salesperson",
        "Revenue Target",
        "Pipeline Target",
        "Repeat Customer Target",
        "New Customer Target",
        "Walk-in Target",
        "Quotation Target",
      ],
    });
    XLSX.utils.book_append_sheet(workbook, targetsSheet, "Targets");

    XLSX.writeFile(
      workbook,
      `sales-report-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  }, [monthlyReports, targets]);

  const sectionContent = useMemo(() => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <>
            <DashboardOverview cards={summaryCards} />
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <DashboardChart data={dailyRevenueTrend} />
              <div className="space-y-6">
                <DashboardTable rows={performanceRows} />
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                        Sales by personnel
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        Top sellers
                      </h2>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    {salesByPersonnel.map((person) => (
                      <div
                        key={person.name}
                        className="flex items-center justify-between rounded-3xl bg-slate-50 p-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {person.name}
                          </p>
                          <p className="text-sm text-slate-500">Revenue</p>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">
                          KES {person.revenue.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        );
      case "Daily Reports":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Daily Reports
                </h2>
                <p className="mt-2 text-slate-600">
                  Filter and view today’s submitted reports.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <input
                  placeholder="Search salesperson"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Date
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Name
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {reports.map((report) => {
                      const status =
                        report.closedQuotations > 0 ? "Submitted" : "Pending";
                      return (
                        <tr key={report.id}>
                          <td className="px-4 py-4 text-slate-700">
                            {new Date(report.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {report.user.name}
                          </td>
                          <td className="px-4 py-4 text-slate-700">{status}</td>
                          <td className="px-4 py-4">
                            <button className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                              {status === "Submitted" ? "View" : "Reminder"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "Users":
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Users
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Manage user accounts and permissions.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">
                    Create salesperson
                  </p>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      startTransition(async () => {
                        try {
                          await createUser(userForm);
                          setActionMessage("Salesperson created.");
                          setUserForm({
                            name: "",
                            email: "",
                            password: "",
                            role: "SALES",
                            active: true,
                          });
                        } catch (error) {
                          setActionMessage("Unable to create salesperson.");
                        }
                      });
                    }}
                    className="space-y-4 pt-4"
                  >
                    <label className="block text-sm text-slate-700">
                      Name
                      <input
                        value={userForm.name}
                        onChange={(event) =>
                          setUserForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      />
                    </label>
                    <label className="block text-sm text-slate-700">
                      Email
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(event) =>
                          setUserForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      />
                    </label>
                    <label className="block text-sm text-slate-700">
                      Password
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(event) =>
                          setUserForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="mt-2 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {isPending ? "Saving..." : "Create salesperson"}
                    </button>
                    {actionMessage ? (
                      <p className="text-sm text-slate-600">{actionMessage}</p>
                    ) : null}
                  </form>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Role
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Email
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {user.name}
                      </td>
                      <td className="px-4 py-4 text-slate-700">{user.role}</td>
                      <td className="px-4 py-4 text-slate-700">{user.email}</td>
                      <td className="px-4 py-4 text-slate-700">
                        {user.active ? "Active" : "Inactive"}
                      </td>
                      <td className="px-4 py-4 space-x-2">
                        <button className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
                          Edit
                        </button>
                        <button className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Targets":
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Monthly Targets
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Set monthly goals for each salesperson.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm w-full lg:w-[420px]">
                  <p className="text-sm font-semibold text-slate-900">
                    Assign target
                  </p>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      startTransition(async () => {
                        try {
                          await assignTargets(targetForm);
                          setActionMessage("Target assigned successfully.");
                        } catch (error) {
                          setActionMessage("Unable to assign target.");
                        }
                      });
                    }}
                    className="space-y-4 pt-4"
                  >
                    <label className="block text-sm text-slate-700">
                      Salesperson
                      <select
                        value={targetForm.userId}
                        onChange={(event) =>
                          setTargetForm((current) => ({
                            ...current,
                            userId: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm text-slate-700">
                      Revenue target
                      <input
                        type="number"
                        value={targetForm.salesRevenueTarget}
                        onChange={(event) =>
                          setTargetForm((current) => ({
                            ...current,
                            salesRevenueTarget: Number(event.target.value),
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      />
                    </label>
                    <label className="block text-sm text-slate-700">
                      Pipeline target
                      <input
                        type="number"
                        value={targetForm.pipelineTarget}
                        onChange={(event) =>
                          setTargetForm((current) => ({
                            ...current,
                            pipelineTarget: Number(event.target.value),
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="mt-2 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {isPending ? "Saving..." : "Save target"}
                    </button>
                    {actionMessage ? (
                      <p className="text-sm text-slate-600">{actionMessage}</p>
                    ) : null}
                  </form>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Revenue Target
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Pipeline Target
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {targets.map((target) => (
                    <tr key={target.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {target.user.name}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        KES {target.salesRevenueTarget.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        KES {target.pipelineTarget.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <button className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Reports":
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Reports
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Generate and export executive summaries.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                    Generate Report
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Export Excel
                  </button>
                  <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    Export PDF
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {summaryCards.slice(0, 4).map((card) => (
                  <div
                    key={card.title}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                      {card.title}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {card.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "Settings":
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
            <p className="mt-2 text-slate-600">
              Keep settings minimal and focused.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                <span>Company Name</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  defaultValue="Sales Performance System"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>Currency</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  defaultValue="KES"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>Fiscal Year</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  defaultValue="2026"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>Change Password</span>
                <button className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200">
                  Change
                </button>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [
    activeSection,
    summaryCards,
    dailyRevenueTrend,
    salesByPersonnel,
    targetAchievement,
    users,
    reports,
    targets,
  ]);

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      <div className="md:grid md:grid-cols-[auto_1fr] md:gap-8">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCollapseToggle={() => setSidebarCollapsed((prev) => !prev)}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="min-h-screen pt-[72px]">
          <div className="fixed inset-x-0 top-0 z-30 h-[72px] border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
            <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-slate-700 shadow-sm lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-600">
                    Admin
                  </p>
                  <h1 className="text-3xl font-semibold text-slate-950">
                    {activeSection}
                  </h1>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-end gap-3">
                <div className="relative hidden w-full max-w-[360px] md:block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    type="search"
                    placeholder="Search admin"
                    className="w-full rounded-full border border-[#E5E7EB] bg-white px-4 py-3 pl-11 text-sm text-[#111827] shadow-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                      3
                    </span>
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100">
                    <UserCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1440px] px-8 py-8">
            {sectionContent}
          </div>
        </main>
      </div>
    </div>
  );
}
