import { API_BASE_URL } from "../../config";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type TickerItem = {
  symbol: string;
  price: number;
  change: number;
};

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Ticker State
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);

  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return document.documentElement.classList.contains("dark");
  });

  // Apply Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  function toggleTheme() {
    setIsDark(!isDark);
  }

  // Load Ticker Quotes
  useEffect(() => {
    async function loadTicker() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/markets`);
        const data = await res.json();
        if (data.success) {
          // Limit to Nifty, Sensex, BankNifty, Reliance, TCS
          const filtered = data.data.filter((item: TickerItem) =>
            ["NIFTY50", "SENSEX", "BANKNIFTY", "RELIANCE", "TCS"].includes(item.symbol)
          );
          setTickerData(filtered);
        }
      } catch (err) {
        console.error("Failed to load ticker data:", err);
      }
    }

    loadTicker();
    const interval = setInterval(loadTicker, 30000); // 30s updates
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // Double list for seamless looping marquee
  const marqueeItems = [...tickerData, ...tickerData, ...tickerData];

  return (
    <div className="w-full flex flex-col z-50">
      {/* Auto-Scrolling Ticker Tape */}
      {tickerData.length > 0 && (
        <div className="w-full bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 py-2 overflow-hidden select-none text-xs font-semibold">
          <div className="flex w-full">
            <div className="animate-marquee flex items-center gap-12">
              {marqueeItems.map((item, idx) => (
                <div key={`${item.symbol}-${idx}`} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-slate-400 font-bold">
                    {item.symbol === "NIFTY50" ? "NIFTY 50" : item.symbol === "BANKNIFTY" ? "BANK NIFTY" : item.symbol}
                  </span>
                  <span className="font-semibold text-slate-100">
                    ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`font-bold ${
                      item.change >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {item.change >= 0 ? "▲ +" : "▼ "}
                    {item.change.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 shadow-sm text-slate-900 dark:text-white transition-colors duration-300">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black text-slate-900 dark:text-white transition hover:text-blue-600 dark:hover:text-blue-400 tracking-tight"
        >
          Trade<span className="text-blue-600 dark:text-blue-400">Mind</span> AI
        </Link>

        {/* Navigation */}
        {token && (
          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/dashboard"
              className="text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm"
            >
              Dashboard
            </Link>

            <Link
              to="/search"
              className="text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm"
            >
              Search
            </Link>

            <Link
              to="/chat"
              className="text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm"
            >
              AI Chat
            </Link>

            <Link
              to="/paper-trading"
              className="text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm"
            >
              Paper Trading
            </Link>

            <Link
              to="/watchlist"
              className="text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm"
            >
              Watchlist
            </Link>

            <Link
              to="/portfolio-ai"
              className="text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm"
            >
              Portfolio AI
            </Link>

            <Link
              to="/ai-pilot"
              className="text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm"
            >
              AI Pilot
            </Link>

            <Link
              to="/transactions"
              className="text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm"
            >
              Transactions
            </Link>
          </div>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-slate-700 dark:text-slate-300"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {!token ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2 font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 text-sm"
              >
                Create Account
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center gap-1.5 transition"
              >
                👤 {user?.name ?? "Profile"}
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 px-5 py-2 font-semibold text-white dark:text-slate-200 transition text-sm cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;

