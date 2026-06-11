import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            📊 Dashboard
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Welcome to TradeMind AI. Monitor markets, explore insights, and
            manage your investing journey from one place.
          </p>
        </div>

        {/* Top Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-500">Portfolio Value</p>

            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              ₹10,00,000
            </h2>

            <p className="mt-2 font-medium text-emerald-600">
              Virtual Portfolio
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-500">AI Assistant</p>

            <h2 className="mt-3 text-4xl font-bold text-blue-600">
              Online
            </h2>

            <p className="mt-2 text-slate-600">
              Gemini AI Connected
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-500">Market Feed</p>

            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              Live
            </h2>

            <p className="mt-2 text-slate-600">
              Finnhub Connected
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900">
            ⚡ Quick Actions
          </h2>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/chat")}
              className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              🤖 Open AI Chat
            </button>

            <button
              onClick={() => navigate("/search")}
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              🔍 Search Stocks
            </button>

            <button
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              📈 Paper Trading
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">
              🤖 AI Insight
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Markets are dynamic. Focus on diversification, long-term
              thinking, and disciplined investing rather than reacting to
              short-term price movements.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">
              🚀 Upcoming Features
            </h3>

            <ul className="mt-4 space-y-3 text-slate-600">
              <li>📊 Interactive Charts</li>
              <li>⭐ Smart Watchlist</li>
              <li>💰 Paper Trading Simulator</li>
              <li>📰 Live Financial News</li>
              <li>📈 Portfolio Analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;