"use client";

type StatCard = {
  title: string;
  value: string;
  subtitle: string;
};

export default function SalesStatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            {card.title}
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {card.value}
          </p>
          <p className="mt-2 text-sm text-slate-600">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
