function DashboardPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">
              AI Trading Dashboard
            </h2>
            <p className="mt-2 text-slate-600">
              Intelligent insights powered by Gemini AI.
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            ● Live
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-slate-500">Portfolio Value</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              ₹10,25,430
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-slate-500">Today's P&amp;L</p>
            <h3 className="mt-2 text-3xl font-bold text-emerald-600">
              +₹12,540
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-slate-500">AI Confidence</p>
            <h3 className="mt-2 text-3xl font-bold text-blue-600">92%</h3>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <h3 className="text-xl font-semibold text-slate-900">
            🤖 Gemini AI Insight
          </h3>

          <p className="mt-3 leading-7 text-slate-700">
            Current market sentiment appears stable with positive long-term
            momentum. Diversification and disciplined investing remain key
            strategies for managing risk.
          </p>
        </div>
      </div>
    </section>
  );
}

export default DashboardPreview;