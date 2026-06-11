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
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm text-emerald-300">
          🚀 Powered by Gemini AI
        </span>

        <h1 className="mt-8 max-w-5xl text-5xl font-extrabold leading-tight text-emerald-400 md:text-7xl">
          Trade Smarter. Learn Faster.
          <br />
          Build Wealth with AI.
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
          TradeMind AI combines intelligent market insights, AI-powered
          analysis, and paper trading into one modern platform designed
          for beginners and professionals alike.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate("/chat")}
            className="rounded-xl bg-emerald-500 px-7 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            🤖 Try AI Assistant
          </button>

          <button
            onClick={() => navigate("/paper-trading")}
            className="rounded-xl border border-slate-700 px-7 py-3 font-semibold transition hover:border-emerald-400 hover:text-emerald-400"
          >
            📈 Start Paper Trading
          </button>
        </div>
      </main>

      <MarketTicker />
      <Features />
      <DashboardPreview />
    </div>
  );
}

export default Home;