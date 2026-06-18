import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Bookmark, 
  ArrowLeftRight,
  TrendingUp as ChartIcon 
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

const popularStocks = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "SBIN",
  "ITC",
  "LT",
  "WIPRO",
  "BHARTIARTL",
];

function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSymbol = searchParams.get("symbol");

  const [symbol, setSymbol] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // AI analysis states
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Historical Charts States
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("1M");
  const [historyLoading, setHistoryLoading] = useState(false);

  // Search function
  async function searchStock(stock?: string) {
    const searchSymbol = (stock || symbol).trim().toUpperCase();

    if (!searchSymbol) return;

    setSymbol(searchSymbol);
    setLoading(true);
    setResult(null);
    setAnalysis(null);
    setHistoryData([]);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/search/${searchSymbol}`
      );
      const data = await res.json();
      setResult(data);

      if (data.success) {
        // Automatically load default 1M history for search result
        loadStockHistory(searchSymbol, "1M");
      }
    } catch (err) {
      console.error(err);
      setResult(null);
    }
    setLoading(false);
  }

  // Load History for Chart
  async function loadStockHistory(targetSymbol: string, targetTimeframe: string) {
    setHistoryLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/markets/history/${targetSymbol}?timeframe=${targetTimeframe}`
      );
      const data = await res.json();
      if (data.success) {
        setHistoryData(data.data);
      }
    } catch (err) {
      console.error("Failed to load historical charts:", err);
    }
    setHistoryLoading(false);
  }

  // Auto-search on URL parameter load
  useEffect(() => {
    if (urlSymbol) {
      searchStock(urlSymbol);
    }
  }, [urlSymbol]);

  // Handle timeframe tab click
  function changeTimeframe(newTimeframe: string) {
    if (!result || !result.symbol) return;
    setTimeframe(newTimeframe);
    loadStockHistory(result.symbol, newTimeframe);
  }

  async function runAiAnalysis() {
    if (!result || !result.symbol) return;
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/analyze/${result.symbol}`
      );
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setAnalysis("❌ Failed to generate AI analysis. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setAnalysis("❌ Unable to connect to AI server.");
    }
    setAnalyzing(false);
  }

  async function addToWatchlist() {
    if (!result || !result.symbol) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      alert("Please log in to manage your watchlist.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/watchlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          symbol: result.symbol,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ ${result.symbol} added to watchlist.`);
      } else {
        alert(data.message || "Failed to add to watchlist.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add to watchlist.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-6xl p-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Stock Research
          </h1>

          <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Search live market data, explore domestic charts, and analyze company foundations with Google Gemini.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="mt-8 flex gap-3 max-w-2xl mx-auto">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchStock();
              }
            }}
            placeholder="Enter symbol (e.g. RELIANCE, TCS, INFY)..."
            className="flex-1 rounded-2xl border border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-semibold"
          />
          <button
            onClick={() => searchStock()}
            disabled={loading}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-bold transition disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/10"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Popular Stocks */}
        <div className="mt-8 text-center">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Popular Stocks
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {popularStocks.map((stock) => (
              <button
                key={stock}
                onClick={() => searchStock(stock)}
                className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
              >
                {stock}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm max-w-2xl mx-auto">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">
              Fetching live market information...
            </p>
          </div>
        )}

        {/* Result Card */}
        {result?.success && (
          <div className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl max-w-4xl mx-auto">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  NSE India Ticker
                </p>

                <h2 className="mt-1 text-4xl font-extrabold text-slate-900 dark:text-white">
                  {result.symbol}
                </h2>
              </div>

              <div
                className={`rounded-full px-5 py-2 font-bold text-sm flex items-center gap-1.5 ${
                  result.data.dp >= 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                }`}
              >
                {result.data.dp >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {result.data.dp >= 0 ? "+" : ""}
                {result.data.dp.toFixed(2)}%
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Price</p>
                <h3 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
                  ₹{result.data.c.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Price</p>
                <h3 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
                  ₹{result.data.o.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Day High</p>
                <h3 className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{result.data.h.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Day Low</p>
                <h3 className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
                  ₹{result.data.l.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>

            {/* Historical Charts Segment */}
            <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <ChartIcon className="w-5 h-5 text-blue-600" /> Valuation Chart
                </h3>
                {/* Timeframe Selector Tab */}
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-800">
                  {["1D", "1W", "1M", "1Y"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => changeTimeframe(tf)}
                      className={`rounded-lg px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                        timeframe === tf
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {historyLoading ? (
                <div className="h-64 flex items-center justify-center text-slate-500 animate-pulse font-medium">
                  Plotting asset history points...
                </div>
              ) : historyData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#64748b" />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9 }} stroke="#64748b" />
                      <Tooltip
                        formatter={(value: any) => [`₹${value.toLocaleString("en-IN")}`, "Price"]}
                        contentStyle={{ 
                          borderRadius: "12px", 
                          border: "none", 
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          backgroundColor: "#1e293b",
                          color: "#fff"
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={result.data.dp >= 0 ? "#10b981" : "#f43f5e"}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 italic">
                  Failed to load historical values.
                </div>
              )}
            </div>

            {/* Actions for Searched Stock */}
            <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
              <button
                onClick={runAiAnalysis}
                disabled={analyzing}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 px-6 py-3 font-bold text-white transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Brain className="w-4 h-4 text-emerald-400 animate-bounce" /> {analyzing ? "AI Analysis..." : "Analyze with AI"}
              </button>

              <button
                onClick={addToWatchlist}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3 font-bold text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <Bookmark className="w-4 h-4" /> Add to Watchlist
              </button>

              <button
                onClick={() => navigate(`/paper-trading?symbol=${result.symbol}`)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 font-bold text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeftRight className="w-4 h-4" /> Trade Stock
              </button>
            </div>

            {/* AI Analysis Result Card */}
            {(analyzing || analysis) && (
              <div className="mt-8 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 text-white shadow-inner border border-slate-800">
                <h4 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  🤖 Gemini AI Analysis
                </h4>
                {analyzing ? (
                  <div className="mt-3 animate-pulse text-slate-400 font-semibold">
                    Structuring educational SWAT breakdown and metrics assessment...
                  </div>
                ) : (
                  <p className="mt-3 text-slate-200 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                    {analysis}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
