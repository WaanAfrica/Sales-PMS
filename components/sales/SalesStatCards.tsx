"use client";

type StatCard = {
  title: string;
  value: string;
  subtitle: string;
};

export default function SalesStatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex min-h-45 flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              {card.title}
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {card.value}
            </p>
          </div>
          <p className="mt-4 text-sm text-slate-600">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
