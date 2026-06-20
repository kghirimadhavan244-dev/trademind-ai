import { API_BASE_URL } from "../../config";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sun, Moon, Bell, User, Menu, X } from "lucide-react";

type TickerItem = {
  symbol: string;
  price: number;
  change: number;
};

type AppNotification = {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
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

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("app_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Listen for custom notifications event
  useEffect(() => {
    function handleNewNotification(e: Event) {
      const customEvent = e as CustomEvent<{ message: string }>;
      const msg = customEvent.detail?.message;
      if (!msg) return;

      const newNotif: AppNotification = {
        id: Date.now().toString(),
        message: msg,
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setToast(msg);

      // Auto-hide toast after 4 seconds
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }

    window.addEventListener("new-notification" as any, handleNewNotification);
    return () => {
      window.removeEventListener("new-notification" as any, handleNewNotification);
    };
  }, []);

  // Save notifications to localStorage when changed
  useEffect(() => {
    localStorage.setItem("app_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // Double list for seamless looping marquee
  const marqueeItems = [...tickerData, ...tickerData, ...tickerData];

  return (
    <div className="w-full flex flex-col z-50 relative">
      {/* Toast Alert Popup */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] flex items-center gap-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 transition-all duration-300 transform translate-x-0 font-semibold text-sm max-w-sm">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Bell className="w-4 h-4" />
          </div>
          <span>{toast}</span>
        </div>
      )}

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

        {/* Desktop Navigation Link Menu */}
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
              to="/guide"
              className="text-slate-600 dark:text-slate-300 transition hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm"
            >
              Guide
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
        <div className="flex items-center gap-3">
          {/* Notifications Bell (Desktop/Mobile) */}
          {token && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-slate-700 dark:text-slate-300"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 shadow-xl z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 pb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-6">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex flex-col gap-1 border-b border-slate-50 dark:border-slate-800 last:border-b-0 ${
                            !n.read ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                          }`}
                        >
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{n.message}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-slate-700 dark:text-slate-300"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {!token ? (
            <div className="hidden items-center gap-3 md:flex">
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
            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/profile"
                className="font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center gap-1.5 transition"
              >
                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>{user?.name ?? "Profile"}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 px-5 py-2 font-semibold text-white dark:text-slate-200 transition text-sm cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}

          {/* Hamburger Mobile Menu Toggle Button */}
          {token && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition md:hidden cursor-pointer text-slate-700 dark:text-slate-300"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {token && mobileMenuOpen && (
        <div className="md:hidden w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex flex-col gap-3 transition-all duration-300 z-40">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600 font-medium text-sm border-b border-slate-100 dark:border-slate-800/50"
          >
            Dashboard
          </Link>
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600 font-medium text-sm border-b border-slate-100 dark:border-slate-800/50"
          >
            Search
          </Link>
          <Link
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600 font-medium text-sm border-b border-slate-100 dark:border-slate-800/50"
          >
            AI Chat
          </Link>
          <Link
            to="/paper-trading"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600 font-medium text-sm border-b border-slate-100 dark:border-slate-800/50"
          >
            Paper Trading
          </Link>
          <Link
            to="/watchlist"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600 font-medium text-sm border-b border-slate-100 dark:border-slate-800/50"
          >
            Watchlist
          </Link>
          <Link
            to="/portfolio-ai"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600 font-medium text-sm border-b border-slate-100 dark:border-slate-800/50"
          >
            Portfolio AI
          </Link>
          <Link
            to="/ai-pilot"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600 font-medium text-sm border-b border-slate-100 dark:border-slate-800/50"
          >
            AI Pilot
          </Link>
          <Link
            to="/guide"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600 font-medium text-sm border-b border-slate-100 dark:border-slate-800/50"
          >
            Guide
          </Link>
          <Link
            to="/transactions"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600 font-medium text-sm border-b border-slate-100 dark:border-slate-800/50"
          >
            Transactions
          </Link>

          <div className="flex items-center justify-between py-2 mt-2">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 text-sm flex items-center gap-1.5 transition"
            >
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{user?.name ?? "Profile"}</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 px-4 py-2 font-semibold text-white text-xs cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
