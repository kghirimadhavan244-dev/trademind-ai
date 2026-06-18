import { API_BASE_URL } from "../config";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  TrendingUp, 
  Wallet, 
  Users, 
  Database, 
  MessageSquare, 
  ShieldCheck 
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import TrendingStocks from "../components/home/TrendingStocks";
import MarketOverview from "../components/home/MarketOverview";
import MarketNews from "../components/home/MarketNews";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend Connected:", data);
      })
      .catch((err) => {
        console.error("Backend Connection Failed:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full py-28 px-6 text-center flex flex-col items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full blur-[120px] opacity-20 dark:opacity-10 pointer-events-none z-0"></div>
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-emerald-400 rounded-full blur-[100px] opacity-15 dark:opacity-5 pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 px-5 py-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 shadow-sm animate-pulse">
            <Brain className="w-3.5 h-3.5" /> Next-Gen AI Investment Companion
          </span>

          <h1 className="mt-8 text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Research Smarter.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400">
              Practice Trading Risk-Free.
            </span>
          </h1>

          <p className="mt-8 max-w-3xl text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            TradeMind AI combines advanced generative intelligence, real-time paper trading simulations, and deep stock analytics. Tailored for Indian market participants to build wealth intelligence.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4 z-20">
            <button
              onClick={() => navigate("/chat")}
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-500/25 dark:shadow-none hover:-translate-y-0.5 transition cursor-pointer text-base"
            >
              Open AI Assistant
            </button>

            <button
              onClick={() => navigate("/search")}
            className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 transition cursor-pointer text-base shadow-sm"
            >
              Search NSE Stocks
            </button>
          </div>
        </div>
      </header>

      {/* Market Data Components */}
      <div className="relative z-10 w-full bg-gradient-to-b from-transparent via-white/50 to-white dark:via-slate-950/50 dark:to-slate-950 py-10">
        <TrendingStocks />
        <MarketOverview />
        <MarketNews />
      </div>

      {/* Why TradeMind AI Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Choose TradeMind AI?
          </h2>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to master stock market fundamentals without financial risk.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-6">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">AI-Powered Advisor</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
              Get detailed fundamental analyses, SWOT breakdown reports, and personalized portfolio diversification recommendations powered by Google Gemini AI.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-6">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Real-Time Simulation</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
              Execute buy and sell paper trading orders under realistic market conditions with ₹10,00,000 virtual capital to build confidence before risking real money.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-6">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Analytics</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
              Track allocation segments, sector concentrations, and current profit/loss curves. Experience institutional-grade portfolio tracking metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative z-10 bg-slate-900 dark:bg-slate-950 text-white border-y border-slate-800 py-20 px-6">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-4 text-center">
          <div>
            <div className="flex justify-center text-blue-500 mb-3"><Users className="w-8 h-8" /></div>
            <p className="text-4xl font-extrabold text-white">15,000+</p>
            <p className="mt-2 text-sm text-slate-400 font-semibold uppercase tracking-wider">Active Traders</p>
          </div>
          <div>
            <div className="flex justify-center text-emerald-500 mb-3"><TrendingUp className="w-8 h-8" /></div>
            <p className="text-4xl font-extrabold text-white">10+ Equities</p>
            <p className="mt-2 text-sm text-slate-400 font-semibold uppercase tracking-wider">NSE Stocks Tracked</p>
          </div>
          <div>
            <div className="flex justify-center text-indigo-500 mb-3"><Database className="w-8 h-8" /></div>
            <p className="text-4xl font-extrabold text-white">5+ Feeds</p>
            <p className="mt-2 text-sm text-slate-400 font-semibold uppercase tracking-wider">Data Integrations</p>
          </div>
          <div>
            <div className="flex justify-center text-purple-500 mb-3"><MessageSquare className="w-8 h-8" /></div>
            <p className="text-4xl font-extrabold text-white">250,000+</p>
            <p className="mt-2 text-sm text-slate-400 font-semibold uppercase tracking-wider">AI Queries Answered</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p className="font-bold text-slate-900 dark:text-white text-lg">TradeMind AI</p>
          <p className="mt-3 max-w-md mx-auto">
            AI-powered investment research and paper trading platform built for educational purposes in the Indian market.
          </p>
          <div className="mt-6 flex justify-center gap-4 text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> SEBI Simulator Mode</span>
          </div>
          <p className="mt-8 text-xs text-slate-400 dark:text-slate-550">
            © 2026 TradeMind AI. All rights reserved. Built with Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
