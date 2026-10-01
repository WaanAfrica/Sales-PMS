"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createDailyReport,
  updateDailyReport,
} from "../../actions/daily-report";
import { calculateDailyAcquisition } from "../../lib/calculations/reporting";
import { getEastAfricaDateKey } from "../../lib/dates";

type DailyReportFormData = {
  date: string;
  salesRevenue: string;
  repeatCustomers: string;
  newCustomers: string;
  walkIns: string;
  newQuotations: string;
  closedQuotations: string;
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
  salesPipelineValue: number;
  hotQuotationValue: number;
  accountsReceivable: number;
  opportunities: string | null;
  challenges: string | null;
  status: string;
};

export default function SalesDailyReportForm({
  report,
  isSubmitted: submissionLocked = false,
  onSubmitted,
}: {
  report?: SalesReport;
  isSubmitted?: boolean;
  onSubmitted?: () => void;
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
      salesPipelineValue: String(report?.salesPipelineValue ?? 0),
      hotQuotationValue: String(report?.hotQuotationValue ?? 0),
      accountsReceivable: String(report?.accountsReceivable ?? 0),
      opportunities: report?.opportunities ?? "",
      challenges: report?.challenges ?? "",
    };
  }, [report]);

  const [form, setForm] = useState<DailyReportFormData>(initialValues);
  const isSubmitted =
    submissionLocked ||
    report?.status === "Submitted" ||
    report?.status === "SUBMITTED";

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues, report?.status]);

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
              hotQuotationValue: Number(form.hotQuotationValue),
              salesPipelineValue: Number(form.salesPipelineValue),
              accountsReceivable: Number(form.accountsReceivable),
              opportunities: form.opportunities,
              challenges: form.challenges,
            },
            { submit },
          );
          if (submit) {
            onSubmitted?.();
            window.alert("Report submitted successfully.");
          }
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
              hotQuotationValue: Number(form.hotQuotationValue),
              salesPipelineValue: Number(form.salesPipelineValue),
              accountsReceivable: Number(form.accountsReceivable),
              opportunities: form.opportunities,
              challenges: form.challenges,
            },
            { submit },
          );
          if (submit) {
            onSubmitted?.();
            window.alert("Report submitted successfully.");
          }
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
          className={`rounded-full px-3 py-2 text-sm font-semibold ${isSubmitted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
        >
          {isSubmitted ? "Submitted" : report ? "Draft saved" : "Not submitted"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Date</span>
          <input
            type="date"
            value={form.date}
            disabled={isSubmitted}
            onChange={(event) => handleChange("date", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <label className="space-y-3 text-sm text-slate-700">
          <span className="block font-semibold text-slate-900">
            Daily Revenue
          </span>
          <input
            type="number"
            value={form.salesRevenue}
            disabled={isSubmitted}
            onChange={(event) =>
              handleChange("salesRevenue", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Repeat Customers</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.repeatCustomers}
            disabled={isSubmitted}
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
            disabled={isSubmitted}
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
            disabled={isSubmitted}
            onChange={(event) => handleChange("walkIns", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
        <div>
          <p className="font-semibold text-slate-900">Daily Acquisition</p>
          <p className="mt-1 text-sm text-slate-600">
            Calculated from new customers and walk-ins
          </p>
        </div>
        <p className="text-2xl font-semibold text-blue-700" aria-live="polite">
          {calculateDailyAcquisition(
            Number(form.newCustomers),
            Number(form.walkIns),
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-700">
          <span>New Quotations</span>
          <input
            type="number"
            value={form.newQuotations}
            disabled={isSubmitted}
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
            disabled={isSubmitted}
            onChange={(event) =>
              handleChange("closedQuotations", event.target.value)
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
            disabled={isSubmitted}
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
            disabled={isSubmitted}
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
            disabled={isSubmitted}
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
            disabled={isSubmitted}
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
            disabled={isSubmitted}
            onChange={(event) => handleChange("challenges", event.target.value)}
            className="min-h-30 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      {isSubmitted ? (
        <p
          className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800"
          role="status"
        >
          Report submitted successfully. This report is locked and cannot be
          submitted again.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Submit Report
          </button>
        </div>
      )}
      {savedMessage && !isSubmitted ? (
        <p className="text-sm text-slate-600" role="status">
          {savedMessage}
        </p>
      ) : null}
    </div>
  );
}
