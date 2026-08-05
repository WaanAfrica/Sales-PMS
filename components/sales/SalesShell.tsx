'use client';

import { useMemo, useState } from 'react';
import { Bell, Menu, Search, UserCircle2 } from 'lucide-react';
import SalesSidebar from './SalesSidebar';
import SalesStatCards from './SalesStatCards';
import SalesTrendChart from './SalesTrendChart';
import SalesDailyReportForm from './SalesDailyReportForm';

type SalesReportItem = {
  id: string;
  date: string;
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
  status: string;
};

type SalesShellProps = {
  userName: string;
  todayReported: boolean;
  todayRevenue: number;
  targetValue: number;
  achievementPercent: number;
  todaySummary: {
    revenue: number;
    customers: number;
    quotations: number;
    pipeline: number;
    receivables: number;
  };
  monthlySummary: {
    revenue: number;
    customers: number;
    quotations: number;
    pipeline: number;
    receivables: number;
  };
  recentReports: SalesReportItem[];
  revenueTrend: Array<{ label: string; value: number }>;
  pipelineTrend: Array<{ label: string; value: number }>;
  monthlyWinRate: number;
  customerGrowthPercent: number;
  todaysReport?: SalesReportItem;
};

const sections = ['Dashboard', 'Daily Report', 'My Reports', 'Performance', 'Profile'] as const;

type Section = (typeof sections)[number];

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
  const [activeSection, setActiveSection] = useState<Section>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const formattedTodayRevenue = useMemo(
    () => todayRevenue.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }),
    [todayRevenue],
  );

  const formattedTarget = useMemo(
    () => targetValue.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }),
    [targetValue],
  );

  const formattedPipeline = useMemo(
    () => monthlySummary.pipeline.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }),
    [monthlySummary.pipeline],
  );

  const sectionContent = useMemo(() => {
    switch (activeSection) {
      case 'Dashboard':
        return (
          <div className="space-y-6">
            <SalesStatCards
              cards={[
                {
                  title: "Today's revenue",
                  value: formattedTodayRevenue,
                  subtitle: 'Daily revenue',
                },
                {
                  title: 'Monthly revenue',
                  value: monthlySummary.revenue.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }),
                  subtitle: 'Revenue this month',
                },
                {
                  title: 'Target progress',
                  value: `${achievementPercent}%`,
                  subtitle: 'Monthly goal achieved',
                },
                {
                  title: 'Customers',
                  value: monthlySummary.customers.toLocaleString(),
                  subtitle: 'Customers this month',
                },
                {
                  title: 'Pipeline',
                  value: formattedPipeline,
                  subtitle: 'Open pipeline value',
                },
                {
                  title: 'Receivables',
                  value: monthlySummary.receivables.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }),
                  subtitle: 'Outstanding receivables',
                },
              ]}
            />

            <div className="grid gap-6 xl:grid-cols-2">
              <SalesTrendChart data={revenueTrend} title="Revenue trend" subtitle="Monthly revenue" />
              <SalesTrendChart data={pipelineTrend} title="Pipeline trend" subtitle="Monthly pipeline" />
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Today's summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Key metrics</h2>
                </div>
                <span className={`rounded-full px-3 py-2 text-sm font-semibold ${todayReported ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {todayReported ? 'Submitted' : 'Pending'}
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Revenue</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{todaySummary.revenue.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Customers</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{todaySummary.customers}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Quotations</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{todaySummary.quotations}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Pipeline</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{todaySummary.pipeline.toLocaleString()}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Recent reports</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Latest activity</h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {recentReports.slice(0, 4).map((report) => (
                  <div key={report.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{new Date(report.date).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-600">Revenue KES {report.salesRevenue.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{report.status}</span>
                      <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case 'Daily Report':
        return (
          <div className="space-y-6">
            <SalesDailyReportForm report={todaysReport} />
          </div>
        );
      case 'My Reports':
        return (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">My Reports</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Past submissions</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input type="search" placeholder="Search" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
                  <input type="date" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Revenue</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Customers</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {recentReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-4 py-4 text-slate-700">{new Date(report.date).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-slate-700">KES {report.salesRevenue.toLocaleString()}</td>
                        <td className="px-4 py-4 text-slate-700">{report.repeatCustomers + report.newCustomers + report.walkIns}</td>
                        <td className="px-4 py-4 text-slate-700">{report.status}</td>
                        <td className="px-4 py-4">
                          <button className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        );
      case 'Performance':
        return (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Monthly revenue</p>
                  <p className="mt-3 text-4xl font-semibold text-slate-900">{monthlySummary.revenue.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Target progress</p>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${achievementPercent}%` }} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{achievementPercent}%</p>
                </div>
              </div>
            </section>
            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Customer growth</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{customerGrowthPercent}%</p>
                <p className="mt-2 text-sm text-slate-500">Compared to last month</p>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Win rate</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{monthlyWinRate}%</p>
                <p className="mt-2 text-sm text-slate-500">Quotation close ratio</p>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Receivables</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{monthlySummary.receivables.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })}</p>
                <p className="mt-2 text-sm text-slate-500">Outstanding balance</p>
              </section>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <SalesTrendChart data={revenueTrend} title="Revenue trend" subtitle="This month" />
              <SalesTrendChart data={pipelineTrend} title="Pipeline trend" subtitle="This month" />
            </div>
          </div>
        );
      case 'Profile':
        return (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-3xl text-white">{userName.charAt(0)}</div>
                  <p className="text-xl font-semibold text-slate-900">{userName}</p>
                  <p className="mt-2 text-sm text-slate-500">Salesperson</p>
                </div>
                <div className="space-y-4 rounded-3xl bg-slate-50 p-6">
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="mt-2 text-slate-900">{userName.toLowerCase().replace(' ', '.')}@company.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="mt-2 text-slate-900">+254 700 000 000</p>
                  </div>
                </div>
                <div className="space-y-4 rounded-3xl bg-slate-50 p-6">
                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="mt-2 text-slate-900">Sales</p>
                  </div>
                  <button className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Update Profile</button>
                  <button className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">Change Password</button>
                </div>
              </div>
            </section>
          </div>
        );
      default:
        return null;
    }
  }, [activeSection, formattedTarget, formattedTodayRevenue, formattedPipeline, todayReported, todaySummary, monthlySummary, recentReports, revenueTrend, achievementPercent, todaysReport, userName]);

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      <div className="md:grid md:grid-cols-[auto_1fr] md:gap-8">
        <SalesSidebar
          userName={userName}
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
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-slate-700 shadow-sm md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-600">Sales</p>
                  <h1 className="text-3xl font-semibold text-slate-950">Sales dashboard</h1>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-end gap-3">
                <div className="relative hidden w-full max-w-[360px] md:block">
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
                    <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">3</span>
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100">
                    <UserCircle2 className="h-5 w-5 text-blue-600" />
                    <span className="hidden sm:inline">{userName}</span>
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
