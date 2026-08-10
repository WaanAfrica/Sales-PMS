"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type TrendPoint = {
  label: string;
  value: number;
};

export default function SalesTrendChart({
  data,
  title = "Trend",
  subtitle = "This month",
}: {
  data: TrendPoint[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            {title}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {subtitle}
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          A simple view of your monthly impact.
        </p>
      </div>
      <div className="mt-8 h-75">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `KES ${Math.round(Number(value) / 1000)}k`
              }
            />
            <Tooltip
              formatter={(value: any) =>
                `KES ${Number(value).toLocaleString()}`
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
