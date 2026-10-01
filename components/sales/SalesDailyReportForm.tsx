"use client";

import { useMemo, useState, useTransition } from "react";
import { createDailyReport, updateDailyReport } from "../../actions/daily-report";
import { getEastAfricaDateKey } from "../../lib/dates";

type DailyReportFormData = {
  date: string;
  salesRevenue: string;
  repeatCustomers: string;
  newCustomers: string;
  walkIns: string;
  newQuotations: string;
  closedQuotations: string;
  quotationAge: string;
  salesPipelineValue: string;
  hotQuotationValue: string;
  accountsReceivable: string;
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
    const today = getEastAfricaDateKey();
    const reportDate = report?.date
      ? typeof report.date === "string"
        ? report.date.slice(0, 10)
        : getEastAfricaDateKey(report.date)
      : today;

    return {
      date: reportDate,
      salesRevenue: String(report?.salesRevenue ?? 0),
      repeatCustomers: String(report?.repeatCustomers ?? 0),
      newCustomers: String(report?.newCustomers ?? 0),
      walkIns: String(report?.walkIns ?? 0),
      newQuotations: String(report?.newQuotations ?? 0),
      closedQuotations: String(report?.closedQuotations ?? 0),
      quotationAge: String(report?.quotationAge ?? 0),
      salesPipelineValue: String(report?.salesPipelineValue ?? 0),
      hotQuotationValue: String(report?.hotQuotationValue ?? 0),
      accountsReceivable: String(report?.accountsReceivable ?? 0),
      opportunities: report?.opportunities ?? "",
      challenges: report?.challenges ?? "",
    };
  }, [report]);

  const [form, setForm] = useState<DailyReportFormData>(initialValues);

  const handleChange = (
    key: keyof DailyReportFormData,
    value: string | number,
  ) => {
    const numericKeys: Array<keyof DailyReportFormData> = [
      "salesRevenue",
      "repeatCustomers",
      "newCustomers",
      "walkIns",
      "newQuotations",
      "closedQuotations",
      "quotationAge",
      "salesPipelineValue",
      "hotQuotationValue",
      "accountsReceivable",
    ];

    setForm((current) => ({
      ...current,
      [key]:
        typeof value === "string" && numericKeys.includes(key)
          ? value.replace(/^0+(?=\d)/, "") || "0"
          : value,
    }));
  };

  const [isPending, startTransition] = useTransition();
  const [savedMessage, setSavedMessage] = useState("");

  const saveReport = async (submit: boolean) => {
    startTransition(async () => {
      try {
        if (report?.id) {
          await updateDailyReport(
            report.id,
            {
              date: form.date,
              salesRevenue: Number(form.salesRevenue),
              repeatCustomers: Number(form.repeatCustomers),
              newCustomers: Number(form.newCustomers),
              walkIns: Number(form.walkIns),
              newQuotations: Number(form.newQuotations),
              closedQuotations: Number(form.closedQuotations),
              quotationAge: Number(form.quotationAge),
              hotQuotationValue: Number(form.hotQuotationValue),
              salesPipelineValue: Number(form.salesPipelineValue),
              accountsReceivable: Number(form.accountsReceivable),
              opportunities: form.opportunities,
              challenges: form.challenges,
            },
            { submit },
          );
          setSavedMessage(
            submit
              ? "Report updated successfully."
              : "Draft updated successfully.",
          );
        } else {
          await createDailyReport(
            {
              date: form.date,
              salesRevenue: Number(form.salesRevenue),
              repeatCustomers: Number(form.repeatCustomers),
              newCustomers: Number(form.newCustomers),
              walkIns: Number(form.walkIns),
              newQuotations: Number(form.newQuotations),
              closedQuotations: Number(form.closedQuotations),
              quotationAge: Number(form.quotationAge),
              hotQuotationValue: Number(form.hotQuotationValue),
              salesPipelineValue: Number(form.salesPipelineValue),
              accountsReceivable: Number(form.accountsReceivable),
              opportunities: form.opportunities,
              challenges: form.challenges,
            },
            { submit },
          );
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            Daily Sales Report
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Today’s report
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-2 text-sm font-semibold ${report ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
        >
          {report ? "Existing submission" : "New report"}
        </span>
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
          <p className="font-semibold text-slate-900">Daily Revenue</p>
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
            min="0"
            step="1"
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
            min="0"
            step="1"
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
            min="0"
            step="1"
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
          <span>Avg. Open Quotation Age (Days)</span>
          <span className="block text-xs text-slate-500">
            Mean age of open quotations on this report date.
          </span>
          <input
            type="number"
            min={0}
            step="any"
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
            className="min-h-30 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Challenges</span>
          <textarea
            value={form.challenges}
            onChange={(event) => handleChange("challenges", event.target.value)}
            className="min-h-30 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
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
