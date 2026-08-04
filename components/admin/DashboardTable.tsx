'use client';

import { toast } from 'sonner';

type Row = {
  name: string;
  revenue: string;
  target: string;
  status: 'on-track' | 'near-target' | 'behind';
};

const statusClasses = {
  'on-track': 'bg-emerald-100 text-emerald-700',
  'near-target': 'bg-amber-100 text-amber-700',
  behind: 'bg-red-100 text-red-700',
};

export default function DashboardTable({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Team performance</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Top performers</h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Revenue</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Target</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((row, index) => (
              <tr key={`${row.name}-${index}`}>
                <td className="px-4 py-4 font-medium text-slate-900">{row.name}</td>
                <td className="px-4 py-4 text-slate-700">KES {row.revenue}</td>
                <td className="px-4 py-4 text-slate-700">KES {row.target}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[row.status]}`}>
                    {row.status === 'on-track' ? 'On track' : row.status === 'near-target' ? 'Near target' : 'Behind'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={() => toast.info(`Opening ${row.name}'s performance details`)} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
