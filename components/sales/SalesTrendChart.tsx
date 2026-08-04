'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

type TrendPoint = {
  label: string;
  revenue: number;
};

export default function SalesTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Revenue trend</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">This month</h2>
        </div>
        <button type="button" onClick={() => toast.info('Showing revenue performance for the last 30 days.')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Last 30 days</button>
      </div>
      <div className="mt-8 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `KES ${Math.round(value / 1000)}k`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(15,23,42,.10)' }} formatter={(value) => `KES ${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString()}`} />
            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
