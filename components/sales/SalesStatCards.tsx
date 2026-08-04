'use client';

import { ArrowUpRight, ChartNoAxesCombined, CircleDollarSign, Goal, WalletCards } from 'lucide-react';

type StatCard = {
  title: string;
  value: string;
  subtitle: string;
};

export default function SalesStatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = [CircleDollarSign, Goal, ChartNoAxesCombined, WalletCards][index] ?? CircleDollarSign;
        return (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon className="h-5 w-5" /></span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><ArrowUpRight className="h-3.5 w-3.5" />12.4%</span>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">{card.title}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
            <p className="mt-1.5 text-xs text-slate-500">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
