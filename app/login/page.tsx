import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <section className="relative flex flex-col justify-center gap-8 overflow-hidden bg-linear-to-b from-blue-700 via-slate-900 to-slate-950 px-8 py-16 text-white lg:px-16">
          <div className="absolute inset-x-0 top-0 h-40 bg-radial-[at_top_left] from-sky-400/20 to-transparent to-30%" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-radial-[at_bottom_right] from-blue-500/20 to-transparent to-30%" />
          <div className="relative z-10 max-w-xl space-y-6">
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-sky-200 shadow-sm shadow-slate-900/10">
              Sales Performance Management
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Together We CREATE IT, Together We Win.
              </h1>
              <p className="max-w-lg text-slate-200/90 text-lg leading-8">
                Experience a secure and polished login built to reflect the same
                corporate identity that guides daily sales work in your
                organization.
              </p>
            </div>
          </div>
          <div className="relative z-10 rounded-4xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-slate-950/20 sm:p-6">
            <div className="relative aspect-4/3 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 p-3">
              <Image
                src="/assets/company/company-values.jpeg"
                alt="Company values poster"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 px-6 py-16 lg:px-20">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
                Welcome back
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                Sign in to Sales PMS
              </h2>
              <p className="text-sm text-slate-500">
                Enter your company email and password to continue to your
                dashboard.
              </p>
            </div>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
