import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import HelpTip from "../components/common/HelpTip";

type PortfolioSummary = {
  cash: number;
  totalValue: number;
  holdingsCount: number;
};

function PortfolioAI() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  async function loadPortfolioAnalysis() {
    if (!user) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio-ai/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setSummary(data.summary);
      } else {
        setAnalysis("❌ Failed to load AI recommendations. Please make sure the backend server is running.");
      }
    } catch (err) {
      console.error(err);
      setAnalysis("❌ Failed to connect to server. Ensure your backend is running on ${API_BASE_URL}");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPortfolioAnalysis();
  }, []);

  const cashPercent = summary && summary.totalValue > 0
    ? (summary.cash / summary.totalValue) * 100
    : 100;
  const equityPercent = 100 - cashPercent;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              🤖 AI Portfolio Advisor
            </h1>
            <p className="mt-2 text-lg text-slate-650 dark:text-slate-450">
              Personalized risk analysis, diversification reviews, and educational recommendations for your paper portfolio.
            </p>
          </div>

          <button
            onClick={loadPortfolioAnalysis}
            disabled={loading}
            className="self-start md:self-auto rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 px-5 py-3 font-semibold text-white dark:text-slate-200 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Re-Analyzing..." : "Refresh Analysis"}
          </button>
        </div>

        {summary && (
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center">
                Total Portfolio Value
                <HelpTip content="The total worth of all your stock holdings plus your remaining virtual cash balance." />
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                ₹{summary.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center">
                Available Liquid Cash
                <HelpTip content="Virtual funds available in your account to purchase new stock shares." />
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                ₹{summary.cash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center">
                Active Stock Holdings
                <HelpTip content="The total number of different companies whose shares you currently own." />
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                {summary.holdingsCount} {summary.holdingsCount === 1 ? "Security" : "Securities"}
              </h2>
            </div>
          </div>
        )}

        {summary && summary.totalValue > 0 && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-3 flex items-center">
              Asset Allocation Breakdown
              <HelpTip content="Shows the proportion of your portfolio value in stock investments vs liquid cash." />
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden flex">
              <div
                style={{ width: `${equityPercent}%` }}
                className="bg-blue-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
              >
                {equityPercent > 10 && `Equities ${equityPercent.toFixed(1)}%`}
              </div>
              <div
                style={{ width: `${cashPercent}%` }}
                className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
              >
                {cashPercent > 10 && `Cash ${cashPercent.toFixed(1)}%`}
              </div>
            </div>
            <div className="flex gap-6 mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
                <span>Equities (₹{(summary.totalValue - summary.cash).toLocaleString("en-IN", { maximumFractionDigits: 0 })})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full"></span>
                <span>Cash (₹{summary.cash.toLocaleString("en-IN", { maximumFractionDigits: 0 })})</span>
              </div>
            </div>
          </div>
        )}

        {/* Advisor Output Box */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex items-center gap-2">
            📋 AI Portfolio Assessment
            <HelpTip content="AI-generated recommendations detailing your portfolio risk score, sector diversification, and suggested adjustments." />
          </h2>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-slate-900 border-t-emerald-400 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-semibold animate-pulse">
                TradeMind AI is reviewing your holdings and formulating recommendations...
              </p>
            </div>
          ) : analysis ? (
            <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base space-y-4">
              {/* Note: since response is formatted with markdown headings, we show it via standard line formatting */}
              {analysis}
            </div>
          ) : (
            <p className="text-slate-500 italic text-center py-10">No assessment loaded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PortfolioAI;