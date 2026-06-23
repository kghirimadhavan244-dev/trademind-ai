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
  Legend,
  AreaChart,
  Area
} from "recharts";

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Briefcase, 
  Layers, 
  Coins,
  Bookmark,
  Newspaper,
  Smile,
  Info
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import HelpTip from "../components/common/HelpTip";
import { useBeginnerMode } from "../hooks/useBeginnerMode";

type Holding = {
  id: number;
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
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

type TickerItem = {
  symbol: string;
  price: number;
  change: number;
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

// Sparkline component using Recharts AreaChart
function Sparkline({ data, isPositive }: { data: { date: string; price: number }[]; isPositive: boolean }) {
  if (!data || data.length === 0) {
    return <div className="h-8 w-20 flex items-center justify-center text-[10px] text-slate-400">Loading...</div>;
  }
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`colorSpark-${isPositive ? "green" : "red"}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth={1.5}
            fillOpacity={1}
            fill={`url(#colorSpark-${isPositive ? "green" : "red"})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Custom radial Portfolio Health Score Circle
function HealthScoreCircle({ score }: { score: number }) {
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "stroke-rose-500";
  if (score >= 80) {
    colorClass = "stroke-emerald-500";
  } else if (score >= 60) {
    colorClass = "stroke-amber-500";
  }

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-800 fill-none"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          className={`fill-none transition-all duration-1000 ease-out ${colorClass}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{score}</span>
        <span className="text-[9px] uppercase font-bold text-slate-400 mt-1">Health</span>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { isBeginner } = useBeginnerMode();

  const [cash, setCash] = useState(0);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  // Daily AI Brief state
  const [brief, setBrief] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [marketMood, setMarketMood] = useState<string>("Neutral");
  const [niftyChange, setNiftyChange] = useState<number>(0);

  // Sparkline histories state
  const [indexHistory, setIndexHistory] = useState<Record<string, { date: string; price: number }[]>>({});
  const [marketIndices, setMarketIndices] = useState<TickerItem[]>([]);

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
        setWatchlist(watchData.items.slice(0, 5));
      }

      // 3. Fetch news
      const newsRes = await fetch(`${API_BASE_URL}/api/news`);
      const newsData = await newsRes.json();
      if (newsData.success) {
        setNews(newsData.articles.slice(0, 4));
      }

      // 4. Fetch live market indices
      const marketsRes = await fetch(`${API_BASE_URL}/api/markets`);
      const marketsData = await marketsRes.json();
      if (marketsData.success) {
        const indices = marketsData.data.filter((item: TickerItem) =>
          ["NIFTY50", "SENSEX", "BANKNIFTY"].includes(item.symbol)
        );
        setMarketIndices(indices);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  }

  async function loadIndexHistory(symbol: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/markets/history/${symbol}?timeframe=1W`);
      const data = await res.json();
      if (data.success) {
        setIndexHistory(prev => ({ ...prev, [symbol]: data.data }));
      }
    } catch (error) {
      console.error(`Error loading history for ${symbol}:`, error);
    }
  }

  async function loadDailyBrief() {
    if (!user) return;
    setBriefLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio-ai/brief/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setBrief(data.brief);
        setMarketMood(data.marketMood);
        setNiftyChange(data.niftyChange);
      }
    } catch (error) {
      console.error("Error loading daily brief:", error);
    }
    setBriefLoading(false);
  }

  useEffect(() => {
    loadDashboardData();
    loadDailyBrief();
    loadIndexHistory("NIFTY50");
    loadIndexHistory("SENSEX");
    loadIndexHistory("BANKNIFTY");
  }, []);

  // 1. Portfolio Calculations
  const totalHoldingsCost = holdings.reduce((sum, h) => sum + h.quantity * h.buyPrice, 0);
  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const totalPortfolioValue = cash + totalHoldingsValue;
  const netGainLoss = totalHoldingsValue - totalHoldingsCost;
  const netGainLossPercent = totalHoldingsCost > 0 ? (netGainLoss / totalHoldingsCost) * 100 : 0;

  // Sector count & HHI
  const sectors = new Set(holdings.map(h => stockSectors[h.symbol] || "Other"));
  const sectorCount = sectors.size;
  
  let hhi = 0;
  if (totalHoldingsValue > 0) {
    holdings.forEach(h => {
      const weight = (h.quantity * h.currentPrice) / totalHoldingsValue;
      hhi += weight * weight;
    });
  }

  // Calculate Health Score (0-100)
  const healthScore = calculateHealthScore(cash, holdings);

  function calculateHealthScore(cashAmount: number, holdingsList: Holding[]) {
    if (holdingsList.length === 0) return 100;
    const totHoldingsVal = holdingsList.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
    const totPortVal = cashAmount + totHoldingsVal;
    if (totPortVal === 0) return 100;

    // 1. Sector count score (Max 45)
    const sectorSet = new Set(holdingsList.map(h => stockSectors[h.symbol] || "Other"));
    const sectorScore = Math.min(sectorSet.size * 15, 45);

    // 2. Cash Ratio score (Max 20)
    const cashRatio = cashAmount / totPortVal;
    let cashScore = 10;
    if (cashRatio >= 0.1 && cashRatio <= 0.4) {
      cashScore = 20; // optimal cushion
    } else if (cashRatio > 0.4 && cashRatio <= 0.7) {
      cashScore = 15;
    }

    // 3. Concentration HHI score (Max 35)
    let sumSqWeights = 0;
    holdingsList.forEach(h => {
      const weight = (h.quantity * h.currentPrice) / totHoldingsVal;
      sumSqWeights += weight * weight;
    });
    let concentrationScore = 5;
    if (sumSqWeights <= 0.35) {
      concentrationScore = 35; // highly diversified
    } else if (sumSqWeights <= 0.6) {
      concentrationScore = 22; // moderately diversified
    } else if (sumSqWeights <= 0.8) {
      concentrationScore = 12; // concentrated
    }

    return Math.round(sectorScore + cashScore + concentrationScore);
  }

  // HHI concentration category name
  const concentrationLabel = hhi <= 0.35 ? "Low" : hhi <= 0.6 ? "Moderate" : "High";

  // Recharts Asset Allocation Data
  const allocationData = [
    { name: "Equities Value", value: parseFloat(totalHoldingsValue.toFixed(2)) },
    { name: "Liquid Cash", value: parseFloat(cash.toFixed(2)) },
  ];

  // Recharts Sector Exposure Data
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

  // Market Mood Styling helper
  const moodColor = marketMood === "Bullish"
    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
    : marketMood === "Bearish"
    ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25"
    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";

  const moodDotColor = marketMood === "Bullish"
    ? "bg-emerald-500"
    : marketMood === "Bearish"
    ? "bg-rose-500"
    : "bg-amber-500";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        
        {/* Beginner Mode active badge banner */}
        {isBeginner && (
          <div className="mb-6 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl px-4 py-3 text-xs font-semibold">
            <Info className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Beginner Mode is enabled. Complex terms will show explaining subtitles, helper tooltips are visible, and the AI Portfolio Advisor will deliver simpler jargon-free reports.
            </span>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Console Dashboard
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
              Monitor your asset performance, review allocation charts, and execute risk-free trading strategies.
            </p>
          </div>
          <button
            onClick={() => {
              loadDashboardData();
              loadDailyBrief();
            }}
            disabled={loading || briefLoading}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 transition disabled:opacity-50 text-sm shadow-md shadow-blue-500/15 cursor-pointer"
          >
            {loading ? "Refreshing..." : "Sync Market Data"}
          </button>
        </div>

        {/* Live Market Indices row with sparklines */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {marketIndices.map((idxItem) => {
            const history = indexHistory[idxItem.symbol] || [];
            const isPos = idxItem.change >= 0;
            return (
              <div 
                key={idxItem.symbol}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex items-center justify-between transition hover:shadow-md"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {idxItem.symbol === "NIFTY50" ? "Nifty 50" : idxItem.symbol === "BANKNIFTY" ? "Bank Nifty" : idxItem.symbol}
                  </span>
                  <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white leading-none">
                    ₹{idxItem.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </h3>
                  <span className={`mt-1.5 inline-flex items-center text-xs font-bold ${isPos ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {isPos ? "▲ +" : "▼ "}
                    {idxItem.change.toFixed(2)}%
                  </span>
                </div>
                <Sparkline data={history} isPositive={isPos} />
              </div>
            );
          })}
        </div>

        {/* Daily AI Briefing & Portfolio Health Row */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          
          {/* Daily AI Brief Card */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smile className="w-5 h-5 text-blue-500" />
                  <span>Good Morning, {user?.name ?? "Ghiri"}</span>
                </h3>
                
                {/* Market Mood Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${moodColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${moodDotColor} ${marketMood !== "Neutral" ? "animate-pulse" : ""}`}></span>
                  <span>Market Mood: {marketMood}</span>
                </div>
              </div>

              {briefLoading ? (
                <div className="space-y-3 py-4">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6 animate-pulse"></div>
                </div>
              ) : brief ? (
                <p className="text-slate-700 dark:text-slate-350 text-sm leading-relaxed font-medium">
                  {brief}
                </p>
              ) : (
                <p className="text-slate-400 italic text-xs py-4">
                  No insight generated. Sync market data or make a trade to trigger an update.
                </p>
              )}
            </div>
            
            <div className="mt-4 flex gap-6 text-[11px] font-semibold text-slate-500">
              <span>Today's NIFTY change: <strong className={niftyChange >= 0 ? "text-emerald-500" : "text-rose-500"}>{niftyChange >= 0 ? "+" : ""}{niftyChange.toFixed(2)}%</strong></span>
              <span>Portfolio value status: <strong className={netGainLoss >= 0 ? "text-emerald-500" : "text-rose-500"}>{netGainLoss >= 0 ? "+" : ""}{netGainLossPercent.toFixed(2)}%</strong></span>
            </div>
          </div>

          {/* Portfolio Health Score Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center">
                Portfolio Health
                <HelpTip content="A score evaluating how balanced your paper portfolio is. It penalizes extreme stock concentration and high cash balances, rewarding clean sector diversification." />
              </h3>
              {isBeginner && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Auto-calculated</span>}
            </div>

            <div className="flex items-center gap-5">
              <HealthScoreCircle score={healthScore} />
              
              <div className="flex-1 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center">
                      Sectors Own
                      <HelpTip content="The number of separate sectors represented in your stock holdings." />
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sectorCount}</span>
                  </div>
                  {isBeginner && <p className="text-[9px] text-slate-550 leading-none mt-0.5">Diversifies your industrial risk exposure.</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center">
                      Concentration
                      <HelpTip content="Concentration index (HHI) evaluates if your assets are balanced or unsafely weighted in 1 or 2 stocks." />
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{concentrationLabel}</span>
                  </div>
                  {isBeginner && <p className="text-[9px] text-slate-550 leading-none mt-0.5">Lower concentration prevents single stock blowups.</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center">
                      Cash Ratio
                      <HelpTip content="The proportion of total portfolio value held in cash. A healthy ratio preserves liquidity." />
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {totalPortfolioValue > 0 ? `${((cash / totalPortfolioValue) * 100).toFixed(0)}%` : "100%"}
                    </span>
                  </div>
                  {isBeginner && <p className="text-[9px] text-slate-550 leading-none mt-0.5">Liquid reserves kept for market entries.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Key Metrics Row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Total Value */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center">
                Total Portfolio Value
                <HelpTip content="The combined total worth of your virtual cash and all your stock holdings." />
              </p>
              {isBeginner && <p className="text-[10px] text-slate-400 mt-0.5">Cash + Stock holdings value</p>}
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{totalPortfolioValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          {/* Cash */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-455 flex items-center">
                Available Liquid Cash
                <HelpTip content="Virtual funds available in your account to purchase new stock shares." />
              </p>
              {isBeginner && <p className="text-[10px] text-slate-400 mt-0.5">Idle money ready for buying</p>}
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Coins className="w-6 h-6" />
            </div>
          </div>

          {/* Invested Cost */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center">
                Amount Invested
                <HelpTip content="The total cost value deployed to purchase your current stock shares." />
              </p>
              {isBeginner && <p className="text-[10px] text-slate-400 mt-0.5">Your capital currently in stocks</p>}
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{totalHoldingsCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Profit/Loss */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center">
                Net Profit / Loss
                <HelpTip content="Current net profit or loss generated by your investments." />
              </p>
              {isBeginner && <p className="text-[10px] text-slate-400 mt-0.5">Total stock growth performance</p>}
              <div className="flex items-center gap-2 mt-1">
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
              <HelpTip content="Shows how your capital is divided between liquid cash and equity investments." />
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
              <HelpTip content="Displays the distribution of your stock investments across different industry sectors." />
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
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                No stock equities purchased yet. Try searching for stocks to paper trade.
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid Bottom */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          
          {/* Holdings Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Equities Portfolio
              </h2>

              {holdings.length === 0 ? (
                <div className="py-12 px-6 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="p-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full mb-4">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Start your investing journey</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-sm">
                    Search for prominent Indian stocks (like Reliance, TCS, or HDFC Bank) and make your first paper trade risk-free.
                  </p>
                  <button
                    onClick={() => navigate("/search")}
                    className="mt-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-blue-500/10 cursor-pointer transition"
                  >
                    Search Stocks
                  </button>
                </div>
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
                  className="rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold p-3 transition text-center cursor-pointer text-xs text-slate-700 dark:text-slate-350"
                >
                  Search Stock
                </button>

                <button
                  onClick={() => navigate("/paper-trading")}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold p-3 transition text-center cursor-pointer text-xs text-slate-700 dark:text-slate-350"
                >
                  Paper Trade
                </button>

                <button
                  onClick={() => navigate("/watchlist")}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold p-3 transition text-center cursor-pointer text-xs text-slate-700 dark:text-slate-350"
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
                  <p className="text-slate-550 text-sm">Your watchlist is empty.</p>
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
                      className="py-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-550/10 dark:hover:bg-slate-800/35 px-2 rounded-xl transition"
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
                      className="block p-3 border border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-750 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100/30 rounded-2xl transition"
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
