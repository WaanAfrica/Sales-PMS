"use client";

type CardData = {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
};

export default function DashboardOverview({ cards }: { cards: CardData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            {card.title}
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {card.value}
          </p>
          <p className="mt-3 text-sm text-slate-500">{card.subtitle}</p>
          <p className="mt-4 text-sm font-medium text-slate-700">
            {card.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
