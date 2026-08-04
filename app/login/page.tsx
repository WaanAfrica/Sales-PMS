import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <section className="flex flex-col justify-center gap-8 bg-gradient-to-b from-blue-700 via-slate-900 to-slate-950 px-8 py-16 text-white lg:px-16">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-sky-200 shadow-sm shadow-slate-900/10">
              Sales Performance Management
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight">
                Monitor. Measure. Grow.
              </h1>
              <p className="max-w-lg text-slate-200/90 text-lg leading-8">
                Enterprise-grade sales analytics for your team, built to help
                your company move faster with clear daily reporting, performance
                insights, and target tracking.
              </p>
            </div>
            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/20">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
                  Trusted by
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  Your internal sales operations team
                </p>
              </div>
              <div className="grid gap-1 text-slate-300 text-sm">
                <p>• Modern sales dashboards</p>
                <p>• Daily report automation</p>
                <p>• Role-based access control</p>
              </div>
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
                Sign in to your account
              </h2>
              <p className="text-sm text-slate-500">
                Enter your company email and password to continue.
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
