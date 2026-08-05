"use client";

import { useMemo, useState, useTransition } from "react";
import { createDailyReport, updateDailyReport } from "@/actions/daily-report";

type DailyReportFormData = {
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
  opportunities: string;
  challenges: string;
};

type SalesReport = {
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
  opportunities: string | null;
  challenges: string | null;
};

export default function SalesDailyReportForm({
  report,
}: {
  report?: SalesReport;
}) {
  const initialValues = useMemo<DailyReportFormData>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const reportDate = report?.date
      ? typeof report.date === "string"
        ? report.date.slice(0, 10)
        : new Date(report.date).toISOString().slice(0, 10)
      : today;

    return {
      date: reportDate,
      salesRevenue: report?.salesRevenue ?? 0,
      repeatCustomers: report?.repeatCustomers ?? 0,
      newCustomers: report?.newCustomers ?? 0,
      walkIns: report?.walkIns ?? 0,
      newQuotations: report?.newQuotations ?? 0,
      closedQuotations: report?.closedQuotations ?? 0,
      quotationAge: report?.quotationAge ?? 0,
      salesPipelineValue: report?.salesPipelineValue ?? 0,
      hotQuotationValue: report?.hotQuotationValue ?? 0,
      accountsReceivable: report?.accountsReceivable ?? 0,
      opportunities: report?.opportunities ?? "",
      challenges: report?.challenges ?? "",
    };
  }, [report]);

  const [form, setForm] = useState<DailyReportFormData>(initialValues);

  const handleChange = (
    key: keyof DailyReportFormData,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [key]:
        typeof value === "string" && key !== "date" ? Number(value) : value,
    }));
  };

  const [isPending, startTransition] = useTransition();
  const [savedMessage, setSavedMessage] = useState("");

  const saveReport = async (submit: boolean) => {
    startTransition(async () => {
      try {
        if (report?.id) {
          await updateDailyReport(report.id, {
            date: form.date,
            salesRevenue: form.salesRevenue,
            repeatCustomers: form.repeatCustomers,
            newCustomers: form.newCustomers,
            walkIns: form.walkIns,
            newQuotations: form.newQuotations,
            closedQuotations: form.closedQuotations,
            quotationAge: form.quotationAge,
            hotQuotationValue: form.hotQuotationValue,
            salesPipelineValue: form.salesPipelineValue,
            accountsReceivable: form.accountsReceivable,
            opportunities: form.opportunities,
            challenges: form.challenges,
          });
          setSavedMessage(
            submit
              ? "Report updated successfully."
              : "Draft updated successfully.",
          );
        } else {
          await createDailyReport({
            date: form.date,
            salesRevenue: form.salesRevenue,
            repeatCustomers: form.repeatCustomers,
            newCustomers: form.newCustomers,
            walkIns: form.walkIns,
            newQuotations: form.newQuotations,
            closedQuotations: form.closedQuotations,
            quotationAge: form.quotationAge,
            hotQuotationValue: form.hotQuotationValue,
            salesPipelineValue: form.salesPipelineValue,
            accountsReceivable: form.accountsReceivable,
            opportunities: form.opportunities,
            challenges: form.challenges,
          });
          setSavedMessage(
            submit
              ? "Report submitted successfully."
              : "Draft saved successfully.",
          );
        }
      } catch (error) {
        setSavedMessage("Unable to save report. Please try again.");
      }
    });
  };

  const handleSave = () => {
    saveReport(false);
  };

  const handleSubmit = () => {
    saveReport(true);
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          Daily Sales Report
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Today’s report
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => handleChange("date", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div className="space-y-3">
          <p className="font-semibold text-slate-900">Sales Revenue</p>
          <input
            type="number"
            value={form.salesRevenue}
            onChange={(event) =>
              handleChange("salesRevenue", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Repeat Customers</span>
          <input
            type="number"
            value={form.repeatCustomers}
            onChange={(event) =>
              handleChange("repeatCustomers", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>New Customers</span>
          <input
            type="number"
            value={form.newCustomers}
            onChange={(event) =>
              handleChange("newCustomers", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Walk-ins</span>
          <input
            type="number"
            value={form.walkIns}
            onChange={(event) => handleChange("walkIns", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-700">
          <span>New Quotations</span>
          <input
            type="number"
            value={form.newQuotations}
            onChange={(event) =>
              handleChange("newQuotations", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Closed Quotations</span>
          <input
            type="number"
            value={form.closedQuotations}
            onChange={(event) =>
              handleChange("closedQuotations", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Average Age</span>
          <input
            type="number"
            value={form.quotationAge}
            onChange={(event) =>
              handleChange("quotationAge", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Pipeline Value</span>
          <input
            type="number"
            value={form.salesPipelineValue}
            onChange={(event) =>
              handleChange("salesPipelineValue", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Hot Quotations</span>
          <input
            type="number"
            value={form.hotQuotationValue}
            onChange={(event) =>
              handleChange("hotQuotationValue", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Accounts Receivable</span>
          <input
            type="number"
            value={form.accountsReceivable}
            onChange={(event) =>
              handleChange("accountsReceivable", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Opportunities</span>
          <textarea
            value={form.opportunities}
            onChange={(event) =>
              handleChange("opportunities", event.target.value)
            }
            className="min-h-[120px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Challenges</span>
          <textarea
            value={form.challenges}
            onChange={(event) => handleChange("challenges", event.target.value)}
            className="min-h-[120px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Submit Report
        </button>
      </div>
    </div>
  );
}
