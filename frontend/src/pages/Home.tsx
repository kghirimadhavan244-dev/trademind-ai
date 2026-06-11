import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import MarketTicker from "../components/home/MarketTicker";
import Features from "../components/home/Features";
import DashboardPreview from "../components/home/DashboardPreview";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Backend Connected:", data);
      })
      .catch((err) => {
        console.error("❌ Backend Connection Failed:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <main className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700 shadow-sm">
          ✨ Powered by Gemini AI
        </span>

        <h1 className="mt-8 max-w-5xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          Trade Smarter.
          <br />
          <span className="text-blue-600">Invest with Confidence.</span>
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
          Experience next-generation investing with AI-powered market
          intelligence, real-time stock insights, intelligent analysis, and
          paper trading—all in one elegant platform.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-5">
          <button
            onClick={() => navigate("/chat")}
            className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700"
          >
            🤖 Try AI Assistant
          </button>

          <button
            onClick={() => navigate("/search")}
            className="rounded-xl border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-100"
          >
            🔍 Explore Markets
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-3xl font-bold text-blue-600">🤖 AI</h3>
            <p className="mt-2 text-slate-600">
              Gemini-powered financial insights and analysis.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-3xl font-bold text-green-600">📈 Live</h3>
            <p className="mt-2 text-slate-600">
              Real-time market prices and stock information.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-3xl font-bold text-purple-600">💰 Practice</h3>
            <p className="mt-2 text-slate-600">
              Paper trading to learn and test strategies safely.
            </p>
          </div>
        </div>
      </main>

      {/* Existing Components */}
      <MarketTicker />
      <Features />
      <DashboardPreview />
    </div>
  );
}

export default Home;