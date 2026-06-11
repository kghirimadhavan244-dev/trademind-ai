import Navbar from "../components/layout/Navbar";

function PaperTrading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            📈 Paper Trading
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Practice investing with virtual money, test strategies, and build
            confidence before entering real markets.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-500">Virtual Balance</p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              ₹10,00,000
            </h2>
            <p className="mt-2 text-emerald-600 font-medium">
              Ready to Invest
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-500">Open Positions</p>
            <h2 className="mt-3 text-4xl font-bold text-blue-600">0</h2>
            <p className="mt-2 text-slate-600">
              No active trades yet
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-500">Overall P&L</p>
            <h2 className="mt-3 text-4xl font-bold text-emerald-600">
              ₹0
            </h2>
            <p className="mt-2 text-slate-600">
              Start trading to see performance
            </p>
          </div>
        </div>

        {/* Quick Trade */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900">
            🚀 Quick Trade
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Stock Symbol (e.g. AAPL)"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <input
              type="number"
              placeholder="Quantity"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
              Buy (Coming Soon)
            </button>
          </div>
        </div>

        {/* Placeholder */}
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">
            💼 Portfolio is Empty
          </h3>

          <p className="mt-3 text-slate-600">
            Once you place virtual trades, your holdings and profit/loss
            analytics will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaperTrading;