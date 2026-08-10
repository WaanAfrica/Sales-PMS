"use client";

type CardData = {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
};

export default function DashboardOverview({ cards }: { cards: CardData[] }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex min-h-45 min-w-0 flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm wrap-break-word"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              {card.title}
            </p>
            <p className="mt-4 text-3xl font-semibold text-slate-900 wrap-break-word">
              {card.value}
            </p>
            <p className="mt-3 text-sm text-slate-500 wrap-break-word">
              {card.subtitle}
            </p>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700 wrap-break-word">
            {card.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
