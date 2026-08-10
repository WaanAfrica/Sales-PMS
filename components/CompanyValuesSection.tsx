"use client";

import Image from "next/image";

const values = [
  {
    letter: "C",
    title: "Customer Focus",
    description:
      "We prioritize customer success in every interaction, delivering clarity, responsiveness, and value that earns lasting trust.",
  },
  {
    letter: "R",
    title: "Respect and Integrity",
    description:
      "We act with honesty, fairness, and professionalism, honoring commitments to customers, colleagues, and partners.",
  },
  {
    letter: "E",
    title: "Efficiency",
    description:
      "We work with focus and precision, optimizing processes so every effort contributes to timely, measurable outcomes.",
  },
  {
    letter: "A",
    title: "Accountability",
    description:
      "We own our commitments, learn from outcomes, and deliver progress with reliability and transparency.",
  },
  {
    letter: "T",
    title: "Timeliness",
    description:
      "We value prompt action and clear communication, ensuring teams and customers move forward without delay.",
  },
  {
    letter: "E",
    title: "Excellence",
    description:
      "We pursue quality in everything we do, setting professional standards that reflect confidence and care.",
  },
  {
    letter: "I",
    title: "Innovation",
    description:
      "We seek smarter ways to solve challenges, embracing new ideas that improve our work and customer outcomes.",
  },
  {
    letter: "T",
    title: "Teamwork",
    description:
      "We collaborate openly, support each other, and align around shared goals to deliver stronger results together.",
  },
];

export default function CompanyValuesSection() {
  return (
    <section className="space-y-8">
      <div className="grid gap-8 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full bg-blue-600/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-blue-700">
            Company values
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Together we CREATE IT, together we win.
            </h1>
            <p className="max-w-2xl text-slate-600 text-base leading-8 sm:text-lg">
              These values guide how we work with customers, colleagues, and
              partners. They shape our decisions, how we deliver results, and
              how we earn trust every day.
            </p>
          </div>
          <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              How this helps our teams
            </p>
            <ul className="grid gap-3 text-sm leading-7 text-slate-600 sm:grid-cols-2">
              <li>Aligns daily work with company purpose</li>
              <li>Supports dependable customer experiences</li>
              <li>Ensures clear communication and responsibility</li>
              <li>Drives disciplined, outcome-focused performance</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-500">
            <span>Company Values content shown here</span>
            <span className="before:mx-2 before:inline-block before:h-1 before:w-1 before:rounded-full before:bg-slate-300">
              Internal dashboard section
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-slate-50 sm:p-8">
          <div className="absolute inset-0 bg-radial-[at_top_left] from-sky-400/25 via-transparent to-transparent" />
          <div className="relative space-y-6">
            <div className="text-slate-300 text-sm uppercase tracking-[0.35em]">
              Official company visual
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <div className="aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
                <Image
                  src="/assets/company/company-values.jpeg"
                  alt="Company values poster"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-sm leading-7 text-slate-300">
              <p>
                This visual asset introduces the company values while the
                dashboard remains focused on operational sales activities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Value pillars
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              What each letter means for our work.
            </h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {values.map((value) => (
            <article
              key={`${value.letter}-${value.title}`}
              className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-2xl font-semibold text-white shadow-sm shadow-blue-500/20">
                  {value.letter}
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                    {value.title}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {value.title}
                  </p>
                </div>
              </div>
              <div className="mt-6 text-sm leading-7 text-slate-600">
                {value.description}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
