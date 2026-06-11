function DashboardPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">
            AI Trading Dashboard
          </h2>

          <span className="rounded-full bg-emerald-500/20 px-4 py-1 text-sm text-emerald-300">
            ● Live Demo
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-slate-800 p-6">
            <p className="text-slate-400">Portfolio Value</p>
            <h3 className="mt-2 text-3xl font-bold text-emerald-400">
              ₹10,25,430
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-6">
            <p className="text-slate-400">Today's P&amp;L</p>
            <h3 className="mt-2 text-3xl font-bold text-green-400">
              +₹12,540
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-6">
            <p className="text-slate-400">AI Confidence</p>
            <h3 className="mt-2 text-3xl font-bold text-sky-400">
              92%
            </h3>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-slate-800 p-6">
          <h3 className="text-xl font-semibold text-white">
            Gemini AI Insight
          </h3>

          <p className="mt-3 text-slate-300">
            “Current market momentum appears positive. Consider diversified,
            long-term investing and evaluate risk before making decisions.”
          </p>
        </div>
      </div>
    </section>
  );
}

export default DashboardPreview;