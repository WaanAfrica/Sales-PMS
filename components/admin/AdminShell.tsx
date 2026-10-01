"use client";

import {
  Bell,
  Eye,
  EyeOff,
  Menu,
  Search,
  Trash2,
  UserCircle2,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useEffect } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  assignTargets,
  createUser,
  deleteUser,
} from "../../actions/daily-report";
import { calculateAchievementPercent } from "../../lib/calculations/reporting";
import { formatDateInEastAfrica, getEastAfricaDateKey } from "../../lib/dates";
import DashboardOverview from "./DashboardOverview";
import DashboardChart from "./DashboardChart";
import DashboardTable from "./DashboardTable";
import AdminSidebar from "./AdminSidebar";
import CompanyValuesSection from "../CompanyValuesSection";

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
  currentUserId: string;
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
  "Performance",
  "Users",
  "Targets",
  "Reports",
  "Company Values",
  "Profile",
  "Settings",
] as const;

type Section = (typeof sections)[number];

export default function AdminShell({
  currentUserId,
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
  const sidebarWidthClass = sidebarCollapsed ? "md:ml-20" : "md:ml-72";
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
  const [showPassword, setShowPassword] = useState(false);
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
  const [selectedDate, setSelectedDate] = useState(getEastAfricaDateKey);
  const [reportType, setReportType] = useState<
    "Daily Report" | "Monthly Report"
  >("Daily Report");
  const [selectedMonth, setSelectedMonth] = useState(() =>
    Number(getEastAfricaDateKey().slice(5, 7)),
  );
  const [selectedYear, setSelectedYear] = useState(() =>
    Number(getEastAfricaDateKey().slice(0, 4)),
  );
  const [reportSummary, setReportSummary] = useState<{
    reportDate?: string;
    month?: number;
    year?: number;
    activePersonnel: number;
    submitted: number;
    pending: number;
    drafts: number;
    rows: Array<{
      userId: string;
      name: string;
      status: string;
      revenueSummary: {
        target: number;
        actual: number;
        dailyRevenue: number;
        varianceAmount: number;
        variancePercentage: number | string;
        previousDay?: number | string;
        changeAgainstPreviousDay?: number | string;
        achievement?: string | number;
      };
      customerSummary: {
        repeat: number;
        new: number;
        walkIns: number;
        dailyAcquisition: number;
        monthlyAcquisition: number;
      };
      quotationSummary: {
        new: number;
        cumulative: number;
        averageAge: number | string;
        total?: number;
      };
      hotQuotationValue: number;
      salesPipelineValue: number;
      accountReceivable: number;
      winRate: string | number;
      opportunities: string;
      challenges: string;
    }>;
    teamTotals: {
      target: number;
      actual: number;
      varianceAmount: number;
      variancePercentage: number | string;
      customers: number;
      dailyAcquisition: number;
      monthlyAcquisition: number;
      quotations: number;
      pipeline: number;
      receivables: number;
      winRate: string | number;
    };
  } | null>(null);
  const [selectedReport, setSelectedReport] = useState<
    NonNullable<typeof reportSummary>["rows"][number] | null
  >(null);

  const performanceRows = useMemo(
    () =>
      targets.map((target) => {
        const revenue =
          salesByPersonnel.find((person) => person.name === target.user.name)
            ?.revenue ?? 0;
        const calculatedAchievement = calculateAchievementPercent(
          revenue,
          target.salesRevenueTarget,
        );
        const achievement =
          typeof calculatedAchievement === "number" ? calculatedAchievement : 0;
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

  const refreshReportSummary = useCallback(() => {
    const controller = new AbortController();
    const queryParams = new URLSearchParams();
    if (reportType === "Monthly Report") {
      queryParams.set("type", "monthly");
      queryParams.set("month", String(selectedMonth));
      queryParams.set("year", String(selectedYear));
    } else {
      queryParams.set("type", "daily");
      queryParams.set("date", selectedDate);
    }

    fetch(`/api/reports?${queryParams.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => setReportSummary(data))
      .catch(() => setReportSummary(null));

    return () => controller.abort();
  }, [reportType, selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    const cleanup = refreshReportSummary();
    return () => cleanup?.();
  }, [refreshReportSummary]);

  const handleExportExcel = useCallback(() => {
    if (!reportSummary) return;

    const period =
      reportType === "Monthly Report"
        ? formatDateInEastAfrica(
            `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
            { month: "long", year: "numeric" },
          )
        : formatDateInEastAfrica(selectedDate, {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
    const title = `${reportType === "Monthly Report" ? "MONTHLY" : "DAILY"} SALES PERFORMANCE REPORT`;
    const money = (value: number) =>
      `KES ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
    const rows: Array<Array<string | number>> = [
      ["SALES PMS"],
      [title],
      [
        reportType === "Monthly Report"
          ? `Reporting Period: ${period}`
          : `Report Date: ${period}`,
      ],
      ["Generated By: ADMIN"],
      [
        `Active Personnel: ${reportSummary.activePersonnel}`,
        `Submitted: ${reportSummary.submitted}`,
        `Pending: ${reportSummary.pending}`,
        `Drafts: ${reportSummary.drafts}`,
      ],
      ["Together We CREATE IT, Together We Win."],
      [],
      ["TEAM PERFORMANCE SUMMARY"],
      ["Total Revenue (MTD)", money(reportSummary.teamTotals.actual)],
      ["Team Target", money(reportSummary.teamTotals.target)],
      ["Variance", money(reportSummary.teamTotals.varianceAmount)],
      [
        "Variance %",
        String(reportSummary.teamTotals.variancePercentage ?? "-"),
      ],
      ["Total Customers", reportSummary.teamTotals.customers],
      ["Total Daily Acquisition", reportSummary.teamTotals.dailyAcquisition],
      [
        "Total Monthly Acquisition",
        reportSummary.teamTotals.monthlyAcquisition,
      ],
      ["Total Quotations", reportSummary.teamTotals.quotations],
      ["Total Pipeline", money(reportSummary.teamTotals.pipeline)],
      ["Total Receivables", money(reportSummary.teamTotals.receivables)],
      ["Win Rate", String(reportSummary.teamTotals.winRate ?? "-")],
      [],
      ["SUBMISSION STATUS"],
      ...reportSummary.rows.map((row) => [row.name, row.status]),
      [],
    ];

    reportSummary.rows.forEach((row) => {
      rows.push([row.name.toUpperCase(), row.status]);
      if (row.status === "Not Submitted") {
        rows.push(["STATUS", "NOT SUBMITTED"], []);
        return;
      }
      rows.push(
        [
          "Metric",
          "Target",
          "Actual",
          "Variance",
          "Previous Day",
          "Change",
          "Monthly Acquisition",
        ],
        [
          "SALES REVENUE (MTD)",
          money(row.revenueSummary.target),
          money(row.revenueSummary.actual),
          money(row.revenueSummary.varianceAmount),
          row.revenueSummary.previousDay ?? "-",
          row.revenueSummary.changeAgainstPreviousDay ?? "-",
          "",
        ],
        [
          "CUSTOMERS - REPEAT",
          "",
          row.customerSummary.repeat,
          "",
          "",
          "",
          row.customerSummary.monthlyAcquisition,
        ],
        ["CUSTOMERS - NEW", "", row.customerSummary.new, "", "", "", ""],
        [
          "DAILY ACQUISITION",
          "",
          row.customerSummary.dailyAcquisition,
          "",
          "",
          "",
          "",
        ],
        [
          "MONTHLY ACQUISITION",
          "",
          row.customerSummary.monthlyAcquisition,
          "",
          "",
          "",
          "",
        ],
        [
          "CUSTOMERS - WALK INS",
          "",
          row.customerSummary.walkIns,
          "",
          "",
          "",
          "",
        ],
        ["QUOTATIONS - NEW", "", row.quotationSummary.new, "", "", "", ""],
        [
          "QUOTATIONS - CUMULATIVE",
          "",
          row.quotationSummary.cumulative,
          "",
          "",
          "",
          "",
        ],
        [
          "QUOTATIONS - AVG. AGE (DAYS)",
          "",
          row.quotationSummary.averageAge,
          "",
          "",
          "",
          "",
        ],
        [
          "HOT QUOTATIONS VALUE",
          "",
          money(row.hotQuotationValue),
          "",
          "",
          "",
          "",
        ],
        [
          "SALES PIPELINE VALUE",
          "",
          money(row.salesPipelineValue),
          "",
          "",
          "",
          "",
        ],
        [
          "ACCOUNT RECEIVABLE",
          "",
          money(row.accountReceivable),
          "",
          "",
          "",
          "",
        ],
        ["WIN RATE", "", String(row.winRate ?? "-"), "", "", "", ""],
        ["OPPORTUNITIES", row.opportunities || "-"],
        ["CHALLENGES", row.challenges || "-"],
        [],
      );
    });
    rows.push(
      ["TEAM TOTAL"],
      ["Revenue", money(reportSummary.teamTotals.actual)],
      ["Target", money(reportSummary.teamTotals.target)],
      ["Variance", money(reportSummary.teamTotals.varianceAmount)],
      ["Customers", reportSummary.teamTotals.customers],
      ["Daily Acquisition", reportSummary.teamTotals.dailyAcquisition],
      ["Monthly Acquisition", reportSummary.teamTotals.monthlyAcquisition],
      ["Quotations", reportSummary.teamTotals.quotations],
      ["Pipeline", money(reportSummary.teamTotals.pipeline)],
      ["Receivables", money(reportSummary.teamTotals.receivables)],
      ["Win Rate", String(reportSummary.teamTotals.winRate ?? "-")],
    );

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 30 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 22 },
    ];
    worksheet["!merges"] = [
      "A1:G1",
      "A2:G2",
      "A3:G3",
      "A4:G4",
      "A6:G6",
      "A8:G8",
    ].map((range) => XLSX.utils.decode_range(range));
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };
    worksheet["!pageSetup"] = {
      orientation: "landscape",
      paperSize: 9,
      fitToWidth: 1,
      fitToHeight: 0,
    };
    worksheet["!margins"] = {
      left: 0.3,
      right: 0.3,
      top: 0.45,
      bottom: 0.45,
      header: 0.2,
      footer: 0.2,
    };
    worksheet["!rows"] = rows.map((row) => ({
      hpt: row.length === 0 ? 8 : 20,
    }));

    const reportRange = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1:G1");
    const blue = "2563EB";
    const lightBlue = "DBEAFE";
    const darkText = "0F172A";
    const border = { style: "thin", color: { rgb: "CBD5E1" } };
    for (
      let rowIndex = reportRange.s.r;
      rowIndex <= reportRange.e.r;
      rowIndex += 1
    ) {
      const firstCell =
        worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })];
      const firstValue = String(firstCell?.v ?? "");
      const isTitle = rowIndex <= 5;
      const isSection =
        [
          "TEAM PERFORMANCE SUMMARY",
          "SUBMISSION STATUS",
          "TEAM TOTAL",
        ].includes(firstValue) || /^[A-Z][A-Z .'-]+$/.test(firstValue);
      const isTableHeader = firstValue === "Metric";
      for (
        let columnIndex = reportRange.s.c;
        columnIndex <= reportRange.e.c;
        columnIndex += 1
      ) {
        const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
        const cell = worksheet[address];
        if (!cell) continue;
        cell.s = {
          font: {
            name: "Aptos",
            sz: isTitle ? 14 : 10,
            bold: isTitle || isSection || isTableHeader,
            color: {
              rgb: isTitle || isSection || isTableHeader ? "FFFFFF" : darkText,
            },
          },
          fill: {
            patternType: "solid",
            fgColor: {
              rgb:
                isTitle || isSection
                  ? blue
                  : isTableHeader
                    ? lightBlue
                    : "FFFFFF",
            },
          },
          alignment: {
            horizontal: columnIndex === 0 ? "left" : "center",
            vertical: "center",
            wrapText: true,
          },
          border: { top: border, bottom: border, left: border, right: border },
        };
      }
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Sales Performance Report",
    );
    const filename =
      reportType === "Monthly Report"
        ? `Monthly_Sales_Performance_Report_${selectedYear}-${String(selectedMonth).padStart(2, "0")}.xlsx`
        : `Daily_Sales_Performance_Report_${selectedDate}.xlsx`;
    XLSX.writeFile(workbook, filename, {
      bookType: "xlsx",
      compression: true,
      bookSST: true,
    });
  }, [reportSummary, reportType, selectedDate, selectedMonth, selectedYear]);
  const handleExportPDF = useCallback(() => {
    if (!reportSummary) return;

    const period =
      reportType === "Monthly Report"
        ? formatDateInEastAfrica(
            `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
            { month: "long", year: "numeric" },
          )
        : formatDateInEastAfrica(selectedDate, {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
    const title = `${reportType === "Monthly Report" ? "MONTHLY" : "DAILY"} SALES PERFORMANCE REPORT`;
    const money = (value: number) =>
      `KES ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
    const moneyOrDash = (value: number | string) =>
      typeof value === "number" ? money(value) : value;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 68, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("SALES PMS", 40, 30);
    doc.setFontSize(13);
    doc.text(title, 40, 52);
    doc.setTextColor(15, 23, 42);

    const summaryMetrics: Array<[string, string]> = [
      ["Reporting Period", period],
      ["Generated By", "ADMIN"],
      ["Active Personnel", String(reportSummary.activePersonnel)],
      ["Submitted", String(reportSummary.submitted)],
      ["Pending", String(reportSummary.pending)],
      ["Drafts", String(reportSummary.drafts)],
      ["Total Revenue (MTD)", money(reportSummary.teamTotals.actual)],
      ["Team Target", money(reportSummary.teamTotals.target)],
      ["Variance", money(reportSummary.teamTotals.varianceAmount)],
      [
        "Variance %",
        String(reportSummary.teamTotals.variancePercentage ?? "-"),
      ],
      ["Total Customers", String(reportSummary.teamTotals.customers)],
      ["Daily Acquisition", String(reportSummary.teamTotals.dailyAcquisition)],
      [
        "Monthly Acquisition",
        String(reportSummary.teamTotals.monthlyAcquisition),
      ],
      ["Total Quotations", String(reportSummary.teamTotals.quotations)],
      ["Total Pipeline", money(reportSummary.teamTotals.pipeline)],
      ["Total Receivables", money(reportSummary.teamTotals.receivables)],
      ["Win Rate", String(reportSummary.teamTotals.winRate ?? "-")],
    ];
    const summaryRows = Array.from(
      { length: Math.ceil(summaryMetrics.length / 2) },
      (_, index) => {
        const first = summaryMetrics[index * 2];
        const second = summaryMetrics[index * 2 + 1] ?? ["", ""];
        return [...first, ...second];
      },
    );

    autoTable(doc, {
      startY: 82,
      head: [["Metric", "Value", "Metric", "Value"]],
      body: summaryRows,
      theme: "grid",
      tableWidth: pageWidth - 80,
      margin: { left: 40, right: 40 },
      styles: {
        fontSize: 7,
        cellPadding: 3,
        overflow: "linebreak",
        textColor: [15, 23, 42],
        lineColor: [203, 213, 225],
        lineWidth: 0.35,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      didParseCell: ({ cell, column }) => {
        if (
          cell.section === "body" &&
          (column.index === 1 || column.index === 3)
        ) {
          cell.styles.halign = "right";
        }
      },
      pageBreak: "avoid",
    });

    const summaryTableEndY =
      (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? 82;
    const personnelRows = reportSummary.rows.flatMap((row) => {
      const name = `${row.name} (${row.status})`;
      if (row.status !== "Submitted") {
        return [[name, "STATUS", "", "NOT SUBMITTED", "", "", "", ""]];
      }
      return [
        [
          name,
          "SALES REVENUE (MTD)",
          money(row.revenueSummary.target),
          money(row.revenueSummary.actual),
          money(row.revenueSummary.varianceAmount),
          moneyOrDash(row.revenueSummary.previousDay ?? "-"),
          String(row.revenueSummary.changeAgainstPreviousDay ?? "-"),
          "",
        ],
        [
          "",
          "DAILY REVENUE",
          "",
          money(row.revenueSummary.dailyRevenue),
          "",
          "",
          "",
          "",
        ],
        [
          "",
          "CUSTOMERS (REPEAT / NEW / WALK-INS)",
          "",
          `${row.customerSummary.repeat} / ${row.customerSummary.new} / ${row.customerSummary.walkIns}`,
          "",
          "",
          "",
          "",
        ],
        [
          "",
          "DAILY ACQUISITION",
          "",
          String(row.customerSummary.dailyAcquisition),
          "",
          "",
          "",
          "",
        ],
        [
          "",
          "MONTHLY ACQUISITION",
          "",
          String(row.customerSummary.monthlyAcquisition),
          "",
          "",
          "",
          "",
        ],
        [
          "",
          "QUOTATIONS (NEW / CUMULATIVE)",
          "",
          `${row.quotationSummary.new} / ${row.quotationSummary.cumulative}`,
          "",
          "",
          "",
          "",
        ],
        [
          "",
          "AVG. OPEN AGE (DAYS)",
          "",
          String(row.quotationSummary.averageAge),
          "",
          "",
          "",
          "",
        ],
        [
          "",
          "HOT QUOTATIONS VALUE",
          "",
          money(row.hotQuotationValue),
          "",
          "",
          "",
          "",
        ],
        [
          "",
          "SALES PIPELINE VALUE",
          "",
          money(row.salesPipelineValue),
          "",
          "",
          "",
          "",
        ],
        [
          "",
          "ACCOUNT RECEIVABLE",
          "",
          money(row.accountReceivable),
          "",
          "",
          "",
          "",
        ],
        ["", "WIN RATE", "", String(row.winRate ?? "-"), "", "", "", ""],
        ["", "OPPORTUNITIES", "", row.opportunities || "-", "", "", "", ""],
        ["", "CHALLENGES", "", row.challenges || "-", "", "", "", ""],
      ];
    });

    autoTable(doc, {
      startY: summaryTableEndY + 14,
      head: [
        [
          "Personnel",
          "Metric",
          "Target",
          "Actual",
          "Variance",
          "Prev Day",
          "Change",
          "Monthly Acq",
        ],
      ],
      body: personnelRows,
      theme: "grid",
      tableWidth: pageWidth - 80,
      margin: { left: 40, right: 40, bottom: 30 },
      styles: {
        fontSize: 6.5,
        cellPadding: 3,
        overflow: "linebreak",
        textColor: [15, 23, 42],
        lineColor: [203, 213, 225],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 94 },
        1: { cellWidth: 142 },
        2: { cellWidth: 82 },
        3: { cellWidth: 82 },
        4: { cellWidth: 82 },
        5: { cellWidth: 82 },
        6: { cellWidth: 72 },
        7: { cellWidth: 82 },
      },
      pageBreak: "avoid",
      rowPageBreak: "avoid",
    });

    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      doc.setPage(page);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Together We CREATE IT, Together We Win.", 40, pageHeight - 24);
      doc.text(`Page ${page} of ${pages}`, pageWidth - 92, pageHeight - 24);
    }
    const filename =
      reportType === "Monthly Report"
        ? `Monthly_Sales_Performance_Report_${selectedYear}-${String(selectedMonth).padStart(2, "0")}.pdf`
        : `Daily_Sales_Performance_Report_${selectedDate}.pdf`;
    doc.save(filename);
  }, [reportSummary, reportType, selectedDate, selectedMonth, selectedYear]);
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
                  Review all active sales personnel and their report status for
                  a selected date.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Active personnel
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {reportSummary?.activePersonnel ??
                    users.filter((user) => user.role === "SALES" && user.active)
                      .length}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Submitted
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {reportSummary?.submitted ?? 0}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Pending
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {reportSummary?.pending ?? 0}
                </p>
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
                        Revenue
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {(reportSummary?.rows ?? []).map((row) => (
                      <tr key={row.userId}>
                        <td className="px-4 py-4 text-slate-700">
                          {formatDateInEastAfrica(selectedDate)}
                        </td>
                        <td className="px-4 py-4 text-slate-700">{row.name}</td>
                        <td className="px-4 py-4 text-slate-700">
                          {row.status}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          KES {row.revenueSummary.actual.toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <button className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                            {row.status === "Submitted"
                              ? "View"
                              : "Not Submitted"}
                          </button>
                        </td>
                      </tr>
                    ))}
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
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block text-sm text-slate-700">
                      Password
                      <div className="relative mt-2">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={userForm.password}
                          onChange={(event) =>
                            setUserForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-950 outline-none shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute inset-y-0 right-3 flex items-center rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
                        <button
                          type="button"
                          disabled={isPending || user.id === currentUserId}
                          title={
                            user.id === currentUserId
                              ? "You cannot delete your own account"
                              : "Delete user and related reports and targets"
                          }
                          aria-label={`Delete ${user.name}`}
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Permanently delete ${user.name}, including their daily reports and targets? This cannot be undone.`,
                            );
                            if (!confirmed) return;

                            startTransition(async () => {
                              try {
                                await deleteUser(user.id);
                                setActionMessage(`${user.name} was deleted.`);
                              } catch (error) {
                                setActionMessage(
                                  error instanceof Error &&
                                    error.message ===
                                      "You cannot delete the last active administrator"
                                    ? error.message
                                    : `Unable to delete ${user.name}. Please try again.`,
                                );
                              }
                            });
                          }}
                          className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
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
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm w-full lg:w-105">
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
                    Generate and export executive summaries for the full active
                    team.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={refreshReportSummary}
                    className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Generate Report
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Export Excel
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <label className="space-y-2 text-sm text-slate-700 min-w-0">
                  <span>Report type</span>
                  <select
                    value={reportType}
                    onChange={(event) =>
                      setReportType(
                        event.target.value as "Daily Report" | "Monthly Report",
                      )
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  >
                    <option value="Daily Report">Daily Report</option>
                    <option value="Monthly Report">Monthly Report</option>
                  </select>
                </label>
                {reportType === "Daily Report" ? (
                  <label className="space-y-2 text-sm text-slate-700">
                    <span>Date</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                  </label>
                ) : (
                  <>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Month</span>
                      <select
                        value={selectedMonth}
                        onChange={(event) =>
                          setSelectedMonth(Number(event.target.value))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      >
                        {Array.from(
                          { length: 12 },
                          (_, index) => index + 1,
                        ).map((month) => (
                          <option key={month} value={month}>
                            {new Date(2024, month - 1).toLocaleString("en-GB", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Year</span>
                      <select
                        value={selectedYear}
                        onChange={(event) =>
                          setSelectedYear(Number(event.target.value))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      >
                        {Array.from(
                          { length: 3 },
                          (_, index) => new Date().getFullYear() - index,
                        ).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Personnel
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">
                    All active sales personnel
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Preview
                  </p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">
                    {reportType} preview
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    The report will include every active salesperson and the
                    calculated team totals for the selected period.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl bg-slate-50 p-4 min-w-0">
                      <p className="text-sm text-slate-500">Active personnel</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">
                        {reportSummary?.activePersonnel ??
                          users.filter(
                            (user) => user.role === "SALES" && user.active,
                          ).length}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 min-w-0">
                      <p className="text-sm text-slate-500">Submitted</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">
                        {reportSummary?.submitted ?? 0}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 min-w-0">
                      <p className="text-sm text-slate-500">Pending</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">
                        {reportSummary?.pending ?? 0}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 min-w-0">
                      <p className="text-sm text-slate-500">Drafts</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">
                        {reportSummary?.drafts ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                      Team totals
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                      Calculated summary
                    </h2>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
                  <div className="rounded-3xl bg-slate-50 p-4 min-w-0">
                    <p className="text-sm text-slate-500">Target</p>
                    <p className="mt-3 text-xl font-semibold text-slate-900">
                      KES{" "}
                      {reportSummary?.teamTotals.target.toLocaleString() ?? "0"}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 min-w-0">
                    <p className="text-sm text-slate-500">Actual</p>
                    <p className="mt-3 text-xl font-semibold text-slate-900">
                      KES{" "}
                      {reportSummary?.teamTotals.actual.toLocaleString() ?? "0"}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 min-w-0">
                    <p className="text-sm text-slate-500">Variance</p>
                    <p className="mt-3 text-xl font-semibold text-slate-900">
                      KES{" "}
                      {reportSummary?.teamTotals.varianceAmount.toLocaleString() ??
                        "0"}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 min-w-0">
                    <p className="text-sm text-slate-500">Win rate</p>
                    <p className="mt-3 text-xl font-semibold text-slate-900">
                      {reportSummary?.teamTotals.winRate ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-[1800px] divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Salesperson
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Status
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Sales Revenue (MTD)
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Target
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Variance
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Previous Day
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Change
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Repeat
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          New
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Walk-ins
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Daily Acquisition
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Monthly Acquisition
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          New Quotations
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Cumulative Quotations
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Avg. Age
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Hot Quotations
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Pipeline
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Receivables
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Win Rate
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {(reportSummary?.rows ?? []).map((row) => (
                        <tr key={row.userId}>
                          <td className="px-4 py-4 text-slate-700">
                            {row.name}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.status}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            KES {row.revenueSummary.actual.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            KES {row.revenueSummary.target.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            KES{" "}
                            {row.revenueSummary.varianceAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {typeof row.revenueSummary.previousDay === "number"
                              ? `KES ${row.revenueSummary.previousDay.toLocaleString()}`
                              : (row.revenueSummary.previousDay ?? "-")}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.revenueSummary.changeAgainstPreviousDay ?? "-"}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.customerSummary.repeat}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.customerSummary.new}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.customerSummary.walkIns}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.customerSummary.dailyAcquisition}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.customerSummary.monthlyAcquisition}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.quotationSummary.new}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.quotationSummary.cumulative}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.quotationSummary.averageAge}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            KES {row.hotQuotationValue.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            KES {row.salesPipelineValue.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            KES {row.accountReceivable.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.winRate}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              disabled={row.status !== "Submitted"}
                              onClick={() => setSelectedReport(row)}
                              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {selectedReport ? (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setSelectedReport(null);
                    }
                  }}
                >
                  <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="admin-submitted-report-title"
                    className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <p className="text-sm font-semibold uppercase text-emerald-700">
                          Submitted report · {reportType}
                        </p>
                        <h2
                          id="admin-submitted-report-title"
                          className="mt-1 text-xl font-semibold text-slate-950"
                        >
                          {selectedReport.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {reportType === "Daily Report"
                            ? formatDateInEastAfrica(selectedDate, {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            : formatDateInEastAfrica(
                                `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
                                { month: "long", year: "numeric" },
                              )}
                        </p>
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
                    <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ["Status", selectedReport.status],
                        [
                          "Sales Revenue (MTD)",
                          `KES ${selectedReport.revenueSummary.actual.toLocaleString("en-KE")}`,
                        ],
                        [
                          "Target",
                          `KES ${selectedReport.revenueSummary.target.toLocaleString("en-KE")}`,
                        ],
                        [
                          "Variance",
                          `KES ${selectedReport.revenueSummary.varianceAmount.toLocaleString("en-KE")}`,
                        ],
                        [
                          "Previous Day",
                          typeof selectedReport.revenueSummary.previousDay ===
                          "number"
                            ? `KES ${selectedReport.revenueSummary.previousDay.toLocaleString("en-KE")}`
                            : (selectedReport.revenueSummary.previousDay ??
                              "-"),
                        ],
                        [
                          "Change Against Previous Day",
                          selectedReport.revenueSummary
                            .changeAgainstPreviousDay ?? "-",
                        ],
                        [
                          "Repeat Customers",
                          String(selectedReport.customerSummary.repeat),
                        ],
                        [
                          "New Customers",
                          String(selectedReport.customerSummary.new),
                        ],
                        [
                          "Walk-ins",
                          String(selectedReport.customerSummary.walkIns),
                        ],
                        [
                          "Daily Acquisition",
                          String(
                            selectedReport.customerSummary.dailyAcquisition,
                          ),
                        ],
                        [
                          "Monthly Acquisition",
                          String(
                            selectedReport.customerSummary.monthlyAcquisition,
                          ),
                        ],
                        [
                          "New Quotations",
                          String(selectedReport.quotationSummary.new),
                        ],
                        [
                          "Cumulative Quotations",
                          String(selectedReport.quotationSummary.cumulative),
                        ],
                        [
                          "Average Open Quotation Age",
                          String(selectedReport.quotationSummary.averageAge),
                        ],
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
                          `KES ${selectedReport.accountReceivable.toLocaleString("en-KE")}`,
                        ],
                        ["Win Rate", String(selectedReport.winRate ?? "-")],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="border-b border-slate-100 pb-3"
                        >
                          <dt className="text-sm text-slate-500">{label}</dt>
                          <dd className="mt-1 font-medium text-slate-900">
                            {value}
                          </dd>
                        </div>
                      ))}
                      {["Opportunities", "Challenges"].map((label) => {
                        const value =
                          label === "Opportunities"
                            ? selectedReport.opportunities
                            : selectedReport.challenges;
                        return (
                          <div
                            key={label}
                            className="border-b border-slate-100 pb-3 sm:col-span-2 lg:col-span-3"
                          >
                            <dt className="text-sm text-slate-500">{label}</dt>
                            <dd className="mt-1 whitespace-pre-wrap font-medium text-slate-900">
                              {Array.isArray(value)
                                ? value.join("\n") || "-"
                                : value || "-"}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </section>
                </div>
              ) : null}
            </div>
          </div>
        );
      case "Performance":
        return (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Team performance
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Compare current month performance with team targets.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                    Average achievement
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {targetAchievement.length
                      ? `${Math.round(targetAchievement.reduce((sum, item) => sum + item.achievement, 0) / targetAchievement.length)}%`
                      : "N/A"}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                    Active sellers
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {salesByPersonnel.length}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                    Win rate
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {Math.round(
                      (salesByPersonnel.reduce(
                        (sum, item) => sum + item.revenue,
                        0,
                      ) /
                        (targets.reduce(
                          (sum, item) => sum + item.salesRevenueTarget,
                          0,
                        ) || 1)) *
                        100,
                    )}
                    %
                  </p>
                </div>
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">
                Top performers
              </h3>
              <div className="mt-6 space-y-3">
                {salesByPersonnel.slice(0, 5).map((person) => (
                  <div
                    key={person.name}
                    className="rounded-3xl bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
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
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case "Company Values":
        return <CompanyValuesSection />;
      case "Profile":
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-3xl text-white">
                    A
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    Administrator
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Access and manage the entire sales system.
                  </p>
                </div>
                <div className="space-y-4 rounded-3xl bg-slate-50 p-6">
                  <div>
                    <p className="text-sm text-slate-500">Company</p>
                    <p className="mt-2 text-slate-900">Sales PMS</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="mt-2 text-slate-900">admin@company.com</p>
                  </div>
                </div>
                <div className="space-y-4 rounded-3xl bg-slate-50 p-6">
                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="mt-2 text-slate-900">Admin</p>
                  </div>
                  <button className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                    Update profile
                  </button>
                </div>
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
    userForm,
    targetForm,
    actionMessage,
    showPassword,
  ]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed((prev) => !prev)}
        onClose={() => setSidebarOpen(false)}
      />
      <main
        className={`${sidebarWidthClass} flex-1 min-w-0 h-screen overflow-hidden`}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <section className="sticky top-0 z-10 border-b border-slate-200/70 bg-linear-to-r from-slate-50 via-slate-50 to-white px-4 py-2 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">
                    Admin
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                    {activeSection}
                  </h1>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-slate-700 shadow-sm lg:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="relative hidden w-full max-w-md md:block">
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
                      <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
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
            </section>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {sectionContent}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
