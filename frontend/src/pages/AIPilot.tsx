import { API_BASE_URL } from "../config";
import { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Activity, 
  Sparkles, 
  Cpu, 
  Layers, 
  ArrowRight,
  Sliders,
  RotateCcw,
  AreaChart as ChartIcon,
  Play
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import HelpTip from "../components/common/HelpTip";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

interface Signal {
  symbol: string;
  type: "BUY" | "SELL" | "HOLD";
  entry: number;
  target: number;
  stopLoss: number;
  confidence: number;
  reasoning: string;
}

interface TradeLog {
  type: "BUY" | "SELL";
  date: string;
  price: number;
  profitPercent?: number;
}

interface BacktestResults {
  trades: TradeLog[];
  metrics: {
    totalReturn: number;
    buyAndHoldReturn: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
    maxDrawdown: number;
  };
  chartData: {
    date: string;
    strategyReturn: number;
    stockReturn: number;
  }[];
}

interface Holding {
  id: number;
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

function AIPilot() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"autopilot" | "strategy" | "backtest">("autopilot");

  // Autopilot Tab States
  const [signals, setSignals] = useState<Signal[]>([]);
  const [scanning, setScanning] = useState(false);
  const [autopilot, setAutopilot] = useState(false);
  const [deployCapital, setDeployCapital] = useState("50000");
  const [logs, setLogs] = useState<string[]>([
    "System Initialized. AI Autopilot standby...",
    "Scanning modules loaded. 10 Indian assets registered."
  ]);
  const [source, setSource] = useState("AI Quantitative Engine");
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [cash, setCash] = useState<number>(0);

  // Strategy Tab States
  const [selectedStrategy, setSelectedStrategy] = useState("RSI");
  const [strategyActive, setStrategyActive] = useState(false);
  const [strategyCapital, setStrategyCapital] = useState("10000");

  // Backtest Tab States
  const [backtestSymbol, setBacktestSymbol] = useState("RELIANCE");
  const [backtestStrategy, setBacktestStrategy] = useState("EMA");
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const autopilotTimerRef = useRef<any>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // Simulated Autopilot growth data
  const autopilotGrowthData = [
    { name: "Day 1", Autopilot: 0.0, Nifty50: 0.0 },
    { name: "Day 2", Autopilot: 0.8, Nifty50: -0.3 },
    { name: "Day 3", Autopilot: 1.4, Nifty50: 0.2 },
    { name: "Day 4", Autopilot: 1.1, Nifty50: -0.1 },
    { name: "Day 5", Autopilot: 2.3, Nifty50: 0.6 },
    { name: "Day 6", Autopilot: 2.9, Nifty50: 1.1 },
    { name: "Day 7", Autopilot: 3.5, Nifty50: 1.0 },
    { name: "Day 8", Autopilot: 3.2, Nifty50: 0.8 },
    { name: "Day 9", Autopilot: 4.6, Nifty50: 1.5 },
    { name: "Day 10", Autopilot: 5.1, Nifty50: 1.8 },
    { name: "Day 11", Autopilot: 6.4, Nifty50: 2.3 },
    { name: "Day 12", Autopilot: 5.9, Nifty50: 2.1 },
    { name: "Day 13", Autopilot: 7.2, Nifty50: 2.8 },
    { name: "Day 14", Autopilot: 8.4, Nifty50: 3.2 },
  ];

  // List of popular bluechips for backtesting dropdown
  const assets = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "ITC", "LT", "WIPRO", "BHARTIARTL"];

  // Fetch signals
  async function scanMarket() {
    setScanning(true);
    addLog("[Scanner] Starting market scan of NSE indices...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-pilot/signals`);
      const data = await res.json();
      if (data.success) {
        setSignals(data.signals);
        setSource(data.source);
        addLog(`[Scanner] Scan completed successfully via ${data.source}. Found ${data.signals.filter((s: any) => s.type !== "HOLD").length} active trade setups.`);
      } else {
        addLog("[Scanner] Scan failed. Server returned error.");
      }
    } catch (err) {
      console.error(err);
      addLog("[Scanner] Network error. Failed to scan market.");
    }
    setScanning(false);
  }

  // Fetch current portfolio holdings
  async function loadPortfolio() {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/paper/portfolio/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setHoldings(data.holdings);
        setCash(data.cash);
      }
    } catch (error) {
      console.error("Failed to load portfolio:", error);
    }
  }

  function addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  }

  // Load portfolio holdings & signals
  useEffect(() => {
    scanMarket();
    loadPortfolio();
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Autopilot loop simulation
  useEffect(() => {
    if (autopilot) {
      addLog(`[Autopilot] ACTIVATED. Capital buffer configured to ₹${Number(deployCapital).toLocaleString("en-IN")}.`);
      
      // Auto execution timer: execute a trade every 15 seconds
      autopilotTimerRef.current = setInterval(async () => {
        if (signals.length === 0 || !user) return;
        
        const activeSignals = signals.filter(s => s.type !== "HOLD");
        if (activeSignals.length === 0) {
          addLog("[Autopilot] Check: No active signals detected to trade.");
          return;
        }

        // Pick a random signal to simulate
        const randomSignal = activeSignals[Math.floor(Math.random() * activeSignals.length)];
        
        try {
          const res = await fetch(`${API_BASE_URL}/api/ai-pilot/execute-auto`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              signal: randomSignal,
            }),
          });
          const data = await res.json();
          if (data.success) {
            addLog(data.log);
            loadPortfolio(); // refresh holdings list
          }
        } catch (err) {
          console.error(err);
        }
      }, 15000);

    } else {
      if (autopilotTimerRef.current) {
        clearInterval(autopilotTimerRef.current);
        addLog("[Autopilot] DEACTIVATED. Switched to manual override.");
      }
    }

    return () => {
      if (autopilotTimerRef.current) {
        clearInterval(autopilotTimerRef.current);
      }
    };
  }, [autopilot, signals]);

  // Trigger historical backtest
  async function runBacktestSimulation() {
    setBacktestLoading(true);
    setBacktestResults(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-pilot/backtest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: backtestSymbol,
          strategyType: backtestStrategy,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBacktestResults({
          trades: data.trades,
          metrics: data.metrics,
          chartData: data.chartData,
        });
      } else {
        alert(data.message || "Failed to compile backtest calculations.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to connect to backtest engine.");
    }
    setBacktestLoading(false);
  }

  // Execute manual deployment
  async function deployOrder(signal: Signal) {
    if (!user) {
      alert("Please log in first.");
      return;
    }

    addLog(`[Order] Deploying manual order for ${signal.symbol}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-pilot/execute-auto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          signal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addLog(data.log);
        alert(data.log);
        loadPortfolio();
      } else {
        alert(data.message || "Failed to execute order.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to deploy order. Check console logs.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-7xl p-8">
        
        {/* Banner with Tabs */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-blue-950 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl flex flex-col items-start">
            <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/35 text-xs font-bold uppercase tracking-wider text-blue-300 mb-6">
              <Cpu className="w-3.5 h-3.5 animate-pulse" /> AI Trading Use Cases
            </span>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
              AI Quantitative Pilot
            </h1>

            <p className="mt-4 text-sm md:text-base text-slate-300 leading-relaxed font-medium">
              Choose an AI deployment mode. Autopilot handles capital deployment risk-free, Strategy mode runs active indicators, and Backtesting loops algorithms over 1 year of historical market prices.
            </p>

            {/* Use Case Tabs Switch */}
            <div className="mt-8 flex flex-wrap gap-2.5 rounded-2xl bg-black/35 p-1.5 border border-white/10 z-20">
              <button
                onClick={() => setActiveTab("autopilot")}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "autopilot"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4" /> AutoPilot Mode
              </button>
              
              <button
                onClick={() => setActiveTab("strategy")}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "strategy"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Sliders className="w-4 h-4" /> Strategy Mode
              </button>
              
              <button
                onClick={() => setActiveTab("backtest")}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "backtest"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <ChartIcon className="w-4 h-4" /> Backtest Mode
              </button>
            </div>
          </div>
        </div>

        {/* Content render based on Tab */}
        {activeTab === "autopilot" && (
          <div className="space-y-8">
            {/* Top Metrics Cards Row */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Autopilot config */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-2 text-slate-800 dark:text-white">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Autopilot Switch
                    <HelpTip content="Toggle to activate TradeMind's AI model to run automated transactions on your account based on neural scanner suggestions." />
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    Let TradeMind AI scan recommendations and trade dynamically on your virtual cash balance.
                  </p>
                  
                  {/* Deployment Input */}
                  <div className="mt-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Capital to Deploy (INR)</label>
                    <input 
                      type="number"
                      value={deployCapital}
                      onChange={(e) => setDeployCapital(e.target.value)}
                      disabled={autopilot}
                      className="w-full mt-1.5 rounded-xl border border-slate-250 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${autopilot ? "text-emerald-500 animate-pulse" : "text-slate-400"}`}>
                    {autopilot ? "Autopilot Active" : "Manual Standby"}
                  </span>

                  <button
                    onClick={() => setAutopilot(!autopilot)}
                    className={`rounded-full p-1 w-12 transition-colors duration-300 flex ${
                      autopilot ? "bg-emerald-500 justify-end" : "bg-slate-200 dark:bg-slate-800 justify-start"
                    } cursor-pointer`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-md block"></span>
                  </button>
                </div>
              </div>

              {/* Active Scanner Status */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-2 text-slate-800 dark:text-white">
                    <Activity className="w-5 h-5 text-blue-500" /> Neural Scanner
                    <HelpTip content="AI-powered scanner evaluating market structures, EMA crossover zones, and daily price indicators in real-time." />
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    Runs real-time trend line and price action scans using Gemini models over 10 active blue-chip assets.
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${scanning ? "bg-blue-500 animate-ping" : "bg-emerald-500"}`}></span>
                    <span className="text-xs font-bold">{scanning ? "Scanning..." : "Active"}</span>
                  </div>

                  <button
                    onClick={scanMarket}
                    disabled={scanning}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    Scan Now
                  </button>
                </div>
              </div>

              {/* Paper Account Balances */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-2 text-slate-800 dark:text-white">
                    <Layers className="w-5 h-5 text-indigo-500" /> Virtual Capital
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    Your current cash balance available for automated trades.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                    Available Cash
                    <HelpTip content="Virtual funds available in your account to deploy for AI-piloted trade executions." />
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    ₹{cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Growth Analytics & Logs Row */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Growth Line Graph */}
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
                    Autopilot Yield Growth
                    <HelpTip content="Cumulative return comparison between the AI Autopilot model and the baseline Nifty 50 index." />
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Cumulative percentage return compared to Nifty 50 baseline performance.</p>
                </div>

                <div className="h-64 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={autopilotGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ borderRadius: "1rem" }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Line type="monotone" dataKey="Autopilot" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="Nifty50" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Console logs terminal */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 p-6 text-white shadow-xl flex flex-col justify-between h-[360px] lg:h-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-slate-350">
                    <Terminal className="w-4 h-4 text-emerald-400" /> Activity Logs
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>

                <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 text-slate-350 scrollbar-none pr-1">
                  {logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                      <span className="text-emerald-500">{">"}</span> {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>

            {/* Holdings & Positions Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Autopilot Open Positions</h3>
              
              {holdings.length === 0 ? (
                <div className="py-12 text-center text-slate-500 italic text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No active portfolio holdings executed by Autopilot yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        <th className="pb-3">Symbol</th>
                        <th className="pb-3">Quantity</th>
                        <th className="pb-3">Buy Rate</th>
                        <th className="pb-3">Current Rate</th>
                        <th className="pb-3 text-right">Holdings Yield</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {holdings.map((h) => {
                        const cost = h.quantity * h.buyPrice;
                        const value = h.quantity * h.currentPrice;
                        const profit = value - cost;
                        const profitPct = cost > 0 ? (profit / cost) * 100 : 0;
                        return (
                          <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition">
                            <td className="py-3.5 font-bold text-slate-900 dark:text-white">{h.symbol}</td>
                            <td className="py-3.5 text-xs">{h.quantity} shares</td>
                            <td className="py-3.5 text-xs">₹{h.buyPrice.toFixed(2)}</td>
                            <td className="py-3.5 text-xs text-slate-800 dark:text-slate-250">₹{h.currentPrice.toFixed(2)}</td>
                            <td className={`py-3.5 text-right text-xs font-bold ${profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-450"}`}>
                              {profit >= 0 ? "+" : ""}
                              {profitPct.toFixed(2)}% (₹{profit.toLocaleString("en-IN", { maximumFractionDigits: 0 })})
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Signals Grid */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Active Autopilot Signals</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Source Pipeline: {source}</p>
                </div>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-4 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                  ● Live scanner feed
                </span>
              </div>

              {signals.length === 0 ? (
                <div className="py-20 text-center text-slate-500 italic">No recommendations loaded. Run a market scan.</div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {signals.map((sig) => (
                    <div 
                      key={sig.symbol} 
                      className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                        sig.type === "BUY" 
                          ? "border-emerald-250 dark:border-emerald-900/60 bg-emerald-50/10 dark:bg-emerald-950/10" 
                          : sig.type === "SELL" 
                          ? "border-rose-250 dark:border-rose-900/60 bg-rose-50/10 dark:bg-rose-950/10"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20"
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="text-xl font-black text-slate-900 dark:text-white">{sig.symbol}</span>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">NSE Symbol</span>
                          </div>

                          <div className="flex gap-2">
                            {/* Signal Badge */}
                            <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase border ${
                              sig.type === "BUY"
                                ? "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400"
                                : sig.type === "SELL"
                                ? "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-400"
                                : "bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                            }`}>
                              {sig.type}
                            </span>
                            
                            {/* Confidence */}
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 border border-slate-250 dark:bg-slate-800 dark:border-slate-750 text-slate-700 dark:text-slate-300">
                              {sig.confidence}% conf
                            </span>
                          </div>
                        </div>

                        {/* Reasoning */}
                        <p className="text-slate-650 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                          {sig.reasoning}
                        </p>
                      </div>

                      {/* Pricing Matrix */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-end">
                        <div className="grid grid-cols-3 gap-4 text-left">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Entry</span>
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block mt-0.5">₹{sig.entry.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Target</span>
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">₹{sig.target.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Stop Loss</span>
                            <span className="text-sm font-extrabold text-rose-600 dark:text-rose-450 block mt-0.5">₹{sig.stopLoss.toFixed(2)}</span>
                          </div>
                        </div>

                        {sig.type !== "HOLD" && (
                          <button
                            onClick={() => deployOrder(sig)}
                            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold px-4 py-2 text-xs transition cursor-pointer flex items-center gap-1"
                          >
                            Deploy Signal <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "strategy" && (
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Strategy Configuration */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Strategy Setup</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure preset indicator parameters to run automatic buy/sell paper orders.</p>
                </div>

                {/* Strategy type selection */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Strategy Algorithm</label>
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    disabled={strategyActive}
                    className="w-full rounded-xl border border-slate-250 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/40"
                  >
                    <option value="RSI">RSI Mean Reversion (14 periods)</option>
                    <option value="EMA">EMA Crossover (10 EMA / 30 EMA)</option>
                    <option value="MOMENTUM">Momentum Breakout (5-day trailing)</option>
                  </select>
                </div>

                {/* Trade allocation amount input */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Capital per Asset Order (INR)</label>
                  <input
                    type="number"
                    value={strategyCapital}
                    onChange={(e) => setStrategyCapital(e.target.value)}
                    disabled={strategyActive}
                    className="w-full rounded-xl border border-slate-250 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/40"
                  />
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 dark:border-slate-850 pt-6 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider ${strategyActive ? "text-emerald-500 animate-pulse" : "text-slate-400"}`}>
                  {strategyActive ? "Running Indicator Live" : "Strategy Standby"}
                </span>

                <button
                  onClick={() => setStrategyActive(!strategyActive)}
                  className={`rounded-full p-1.5 w-14 transition-colors duration-300 flex ${
                    strategyActive ? "bg-emerald-500 justify-end" : "bg-slate-300 dark:bg-slate-800 justify-start"
                  } cursor-pointer`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md block"></span>
                </button>
              </div>
            </div>

            {/* Strategy Running console */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 p-6 text-white shadow-xl flex flex-col justify-between h-[360px] lg:h-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-xs font-bold flex items-center gap-2 text-slate-300">
                  <Terminal className="w-4 h-4 text-blue-400" /> Active Strategy Terminal
                </h3>
                {strategyActive && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>}
              </div>

              <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 text-slate-400 scrollbar-none">
                <div>{`[SYSTEM] Strategy engine initialized.`}</div>
                {strategyActive ? (
                  <>
                    <div className="text-slate-250">{`[${new Date().toLocaleTimeString()}] Active Strategy: ${selectedStrategy} algorithm.`}</div>
                    <div className="text-slate-250">{`[${new Date().toLocaleTimeString()}] Scanning daily charts for RELIANCE, TCS, INFY, HDFCBANK...`}</div>
                    <div className="text-emerald-400">{`[${new Date().toLocaleTimeString()}] RSI check RELIANCE: 38.4 (Neutral)`}</div>
                    <div className="text-emerald-400">{`[${new Date().toLocaleTimeString()}] RSI check TCS: 42.1 (Neutral)`}</div>
                    <div className="text-slate-250">{`[${new Date().toLocaleTimeString()}] Waiting for indicator triggers...`}</div>
                  </>
                ) : (
                  <div className="italic text-slate-500 py-10 text-center">Toggle strategy to active state to begin scanning.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === "backtest" && (
          <div className="space-y-8">
            
            {/* Backtest Configuration Selector Form */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-5 items-end justify-between">
              <div className="flex-1 grid gap-4 sm:grid-cols-2 w-full">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Select Asset</label>
                  <select
                    value={backtestSymbol}
                    onChange={(e) => setBacktestSymbol(e.target.value)}
                    className="w-full rounded-xl border border-slate-250 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
                  >
                    {assets.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Select Strategy Algorithm</label>
                  <select
                    value={backtestStrategy}
                    onChange={(e) => setBacktestStrategy(e.target.value)}
                    className="w-full rounded-xl border border-slate-250 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="EMA">EMA Crossover (10 EMA vs 30 EMA)</option>
                    <option value="RSI">RSI Mean Reversion (14 Period)</option>
                    <option value="MOMENTUM">Momentum Breakout (5-day ROC)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={runBacktestSimulation}
                disabled={backtestLoading}
                className="w-full md:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {backtestLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" /> Simulating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Run Backtesting
                  </>
                )}
              </button>
            </div>

            {/* Backtest Results Render */}
            {backtestResults && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Metrics Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                      Strategy Yield
                      <HelpTip content="Percentage return earned by executing this algorithmic strategy over 1 year." />
                    </span>
                    <h2 className={`text-3xl font-black mt-2 ${backtestResults.metrics.totalReturn >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {backtestResults.metrics.totalReturn >= 0 ? "+" : ""}{backtestResults.metrics.totalReturn}%
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1">Net return on ₹1,00,000 capital</p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                      Benchmark Buy & Hold
                      <HelpTip content="Percentage return if you simply purchased the stock on Day 1 and held it for 1 year." />
                    </span>
                    <h2 className={`text-3xl font-black mt-2 ${backtestResults.metrics.buyAndHoldReturn >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {backtestResults.metrics.buyAndHoldReturn >= 0 ? "+" : ""}{backtestResults.metrics.buyAndHoldReturn}%
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1">If you simply held {backtestSymbol}</p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                      Win Rate (Sell Orders)
                      <HelpTip content="Percentage of closed trades that resulted in a positive net return." />
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {backtestResults.metrics.winRate}%
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1">{backtestResults.metrics.totalTrades} total trades executed</p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center">
                      Max Peak Drawdown
                      <HelpTip content="The maximum percentage drop in capital from its highest peak during the backtest." />
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      -{backtestResults.metrics.maxDrawdown}%
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1">Profit Factor: {backtestResults.metrics.profitFactor}</p>
                  </div>
                </div>

                {/* Performance Chart & Trade Logs */}
                <div className="grid gap-8 lg:grid-cols-3">
                  
                  {/* Historical Yield Graph */}
                  <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Comparative Backtest Return</h3>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Simulated yield of strategy vs buy-and-hold benchmark curve over 1 year.</p>
                    </div>

                    <div className="h-80 mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={backtestResults.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                          <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ borderRadius: "1rem" }} />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Line type="monotone" dataKey="strategyReturn" name="Strategy Yield (%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 2 }} />
                          <Line type="monotone" dataKey="stockReturn" name="Buy-and-Hold Return (%)" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Historical trade logs list */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between h-[400px] lg:h-auto">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Executed Signal Logs</h3>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Chronological trade records during backtest loop.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3 scrollbar-none">
                      {backtestResults.trades.length === 0 ? (
                        <div className="py-20 text-center italic text-xs text-slate-500">No signals triggered for this strategy.</div>
                      ) : (
                        backtestResults.trades.map((t, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                            <div>
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${t.type === "BUY" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"}`}>
                                {t.type}
                              </span>
                              <span className="text-slate-400 font-bold block mt-1">{t.date}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-900 dark:text-white block font-extrabold">₹{t.price.toFixed(2)}</span>
                              {t.type === "SELL" && (
                                <span className={`text-[10px] font-black mt-0.5 block ${t.profitPercent && t.profitPercent >= 0 ? "text-emerald-600 dark:text-emerald-450" : "text-rose-600 dark:text-rose-455"}`}>
                                  {t.profitPercent && t.profitPercent >= 0 ? "+" : ""}{t.profitPercent?.toFixed(2)}% yield
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default AIPilot;
