import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Briefcase, 
  Layers, 
  Coins,
  Bookmark,
  Newspaper 
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

type Holding = {
  id: number;
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number; // Injected by backend
};

type WatchlistItem = {
  id: number;
  symbol: string;
};

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  source: { name: string };
};

const stockSectors: Record<string, string> = {
  RELIANCE: "Conglomerate & Energy",
  TCS: "IT Services",
  INFY: "IT Services",
  WIPRO: "IT Services",
  HDFCBANK: "Banking & Financials",
  ICICIBANK: "Banking & Financials",
  SBIN: "Banking & Financials",
  ITC: "FMCG",
  LT: "Infrastructure",
  BHARTIARTL: "Telecom",
};

// Colors for charts
const PIE_COLORS = ["#3b82f6", "#10b981"]; // Equity (blue), Cash (emerald)
const BAR_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6"];

function Dashboard() {
  const navigate = useNavigate();

  const [cash, setCash] = useState(0);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  async function loadDashboardData() {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Fetch portfolio holdings
      const portRes = await fetch(`${API_BASE_URL}/api/paper/portfolio/${user.id}`);
      const portData = await portRes.json();
      if (portData.success) {
        setCash(portData.cash);
        setHoldings(portData.holdings);
      }

      // 2. Fetch watchlist quick view
      const watchRes = await fetch(`${API_BASE_URL}/api/watchlist/${user.id}`);
      const watchData = await watchRes.json();
      if (watchData.success) {
        setWatchlist(watchData.items.slice(0, 5)); // show top 5
      }

      // 3. Fetch news
      const newsRes = await fetch(`${API_BASE_URL}/api/news`);
      const newsData = await newsRes.json();
      if (newsData.success) {
        setNews(newsData.articles.slice(0, 4)); // show top 4
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 1. Portfolio Calculations
  const totalHoldingsCost = holdings.reduce((sum, h) => sum + h.quantity * h.buyPrice, 0);
  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const totalPortfolioValue = cash + totalHoldingsValue;
  const netGainLoss = totalHoldingsValue - totalHoldingsCost;
  const netGainLossPercent = totalHoldingsCost > 0 ? (netGainLoss / totalHoldingsCost) * 100 : 0;

  // 2. Recharts Asset Allocation Data
  const allocationData = [
    { name: "Equities Value", value: parseFloat(totalHoldingsValue.toFixed(2)) },
    { name: "Liquid Cash", value: parseFloat(cash.toFixed(2)) },
  ];

  // 3. Recharts Sector Exposure Data
  const sectorMap: Record<string, number> = {};
  holdings.forEach((h) => {
    const sector = stockSectors[h.symbol] || "Other Sectors";
    const value = h.quantity * h.currentPrice;
    sectorMap[sector] = (sectorMap[sector] || 0) + value;
  });

  const sectorData = Object.keys(sectorMap).map((sector) => ({
    name: sector,
    value: parseFloat(sectorMap[sector].toFixed(2)),
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Console Dashboard
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
              Monitor your asset performance, review allocation charts, and execute risk-free trading strategies.
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 transition disabled:opacity-50 text-sm shadow-md shadow-blue-500/15 cursor-pointer"
          >
            {loading ? "Refreshing..." : "Sync Market Data"}
          </button>
        </div>

        {/* Analytics Key Metrics Row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Portfolio Value</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{totalPortfolioValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Liquid Cash</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Coins className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Amount Invested</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{totalHoldingsCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Profit / Loss</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-2xl font-extrabold ${netGainLoss >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  ₹{netGainLoss.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${netGainLoss >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"}`}>
                  {netGainLoss >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {netGainLossPercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Asset Allocation Pie Chart */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Asset Allocation Breakdown
            </h3>
            {totalPortfolioValue > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`₹${value.toLocaleString("en-IN")}`, "Allocation"]} 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No portfolio value loaded.
              </div>
            )}
          </div>

          {/* Sector Allocation Bar Chart */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Sector Concentration Weights
            </h3>
            {sectorData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value: any) => [`₹${value.toLocaleString("en-IN")}`, "Market Value"]}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {sectorData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No stock equities purchased yet. Try searching for stocks to paper trade.
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid Bottom */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Holdings Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Equities Portfolio
              </h2>

              {holdings.length === 0 ? (
                <p className="text-slate-500 py-6 text-center">
                  No active holdings. Navigate to the Search tab to buy your first paper stock.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3">Symbol</th>
                        <th className="pb-3">Qty</th>
                        <th className="pb-3">Buy Price</th>
                        <th className="pb-3">Last Price</th>
                        <th className="pb-3">Current Value</th>
                        <th className="pb-3 text-right">P/L (%)</th>
                      </tr>
                    </thead>

                    <tbody>
                      {holdings.map((h) => {
                        const invested = h.quantity * h.buyPrice;
                        const value = h.quantity * h.currentPrice;
                        const gainLoss = value - invested;
                        const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

                        return (
                          <tr key={h.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors-300">
                            <td className="py-4 font-bold text-slate-900 dark:text-white">{h.symbol}</td>
                            <td className="py-4 font-semibold text-sm">{h.quantity}</td>
                            <td className="py-4 font-semibold text-sm">₹{h.buyPrice.toFixed(2)}</td>
                            <td className="py-4 font-semibold text-sm text-slate-800 dark:text-slate-200">₹{h.currentPrice.toFixed(2)}</td>
                            <td className="py-4 font-bold text-sm">₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className={`py-4 text-right font-bold text-sm ${gainLoss >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {gainLoss >= 0 ? "+" : ""}
                              {gainLossPercent.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                Quick Console Actions
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <button
                  onClick={() => navigate("/portfolio-ai")}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 transition text-center shadow-md shadow-emerald-500/15 cursor-pointer text-xs"
                >
                  AI Advisor
                </button>

                <button
                  onClick={() => navigate("/chat")}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 transition text-center shadow-md shadow-blue-500/15 cursor-pointer text-xs"
                >
                  AI Chat
                </button>

                <button
                  onClick={() => navigate("/search")}
                  className="rounded-xl border border-slate-350 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold p-3 transition text-center cursor-pointer text-xs"
                >
                  Search Stock
                </button>

                <button
                  onClick={() => navigate("/paper-trading")}
                  className="rounded-xl border border-slate-350 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold p-3 transition text-center cursor-pointer text-xs"
                >
                  Paper Trade
                </button>

                <button
                  onClick={() => navigate("/watchlist")}
                  className="rounded-xl border border-slate-350 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold p-3 transition text-center cursor-pointer text-xs"
                >
                  Watchlist
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Watchlist Quick View & RBI/SEBI News */}
          <div className="space-y-8">
            {/* Watchlist Panel */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" /> Watchlist Quick Access
              </h2>

              {watchlist.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-500 text-sm">Your watchlist is empty.</p>
                  <button
                    onClick={() => navigate("/search")}
                    className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Add stocks now
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {watchlist.map((item) => (
                    <div 
                      key={item.id} 
                      className="py-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/35 px-2 rounded-xl transition"
                      onClick={() => navigate(`/search?symbol=${item.symbol}`)}
                    >
                      <span className="font-bold text-slate-900 dark:text-white">{item.symbol}</span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Research →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Indian Markets News */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-purple-500" /> RBI & Markets News
              </h2>

              {news.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No recent financial updates available.</p>
              ) : (
                <div className="space-y-4">
                  {news.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/20 hover:bg-slate-100/30 rounded-2xl transition"
                    >
                      <span className="inline-block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {item.source.name}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                        {item.title}
                      </h4>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
