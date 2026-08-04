'use client';

import { CircleDollarSign, Goal, HandCoins, Percent, ReceiptText, TrendingUp, Users, WalletCards } from 'lucide-react';

type CardData = {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
};

export default function DashboardOverview({ cards }: { cards: CardData[] }) {
  const icons = [CircleDollarSign, WalletCards, Goal, Percent, Users, ReceiptText, TrendingUp, HandCoins];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = icons[index] ?? CircleDollarSign;
        const positive = !card.trend.startsWith('-');
        return (
          <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Icon className="h-[18px] w-[18px]" /></span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
                <p className="mt-1 whitespace-nowrap text-lg font-bold tracking-tight text-slate-900">{card.value}</p>
                <p className={`mt-1 text-[11px] font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{card.trend} <span className="text-slate-400">vs yesterday</span></p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
