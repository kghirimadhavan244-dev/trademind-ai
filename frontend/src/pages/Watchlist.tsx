import { API_BASE_URL } from "../config";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

function Watchlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function loadWatchlist() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/watchlist/${user.id}`
      );

      const data = await res.json();

      if (data.success) {
        // Fetch detailed quotes for each watchlist symbol in parallel
        const itemsWithDetails = await Promise.all(
          data.items.map(async (item: any) => {
            try {
              const quoteRes = await fetch(
                `${API_BASE_URL}/api/search/${item.symbol}`
              );
              const quoteData = await quoteRes.json();
              if (quoteData.success) {
                return {
                  ...item,
                  price: quoteData.data.c,
                  change: quoteData.data.dp,
                  high: quoteData.data.h,
                  low: quoteData.data.l,
                };
              }
            } catch (err) {
              console.error(`Error loading quote for ${item.symbol}:`, err);
            }
            return {
              ...item,
              price: null,
              change: 0,
              high: null,
              low: null,
            };
          })
        );
        setItems(itemsWithDetails);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function removeItem(id: number) {
    try {
      await fetch(`${API_BASE_URL}/api/watchlist/${id}`, {
        method: "DELETE",
      });
      loadWatchlist();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          My Watchlist
        </h1>

        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Track your favorite Indian equities and monitor their daily performance.
        </p>

        {loading && items.length === 0 ? (
          <p className="mt-12 text-slate-500 text-center animate-pulse">Syncing watchlist quotes...</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {item.symbol}
                    </h2>
                    {item.price !== null && (
                      <span
                        className={`rounded-full px-3 py-1 font-bold text-xs ${
                          item.change >= 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item.change >= 0 ? "+" : ""}
                        {item.change.toFixed(2)}%
                      </span>
                    )}
                  </div>

                  {item.price !== null ? (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">Last Price:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{item.price.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">Day High:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-450">₹{item.high.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">Day Low:</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-455">₹{item.low.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400 italic">No quote data available</p>
                  )}
                </div>

                <div className="mt-6 flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    onClick={() => navigate(`/paper-trading?symbol=${item.symbol}`)}
                    className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Trade
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="mt-12 rounded-3xl bg-white dark:bg-slate-900 p-12 text-center shadow-sm max-w-xl mx-auto border border-slate-200 dark:border-slate-800">
            <p className="text-lg text-slate-500 font-medium">
              Your watchlist is empty.
            </p>
            <button
              onClick={() => navigate("/search")}
              className="mt-6 rounded-xl bg-slate-900 dark:bg-slate-800 px-6 py-3 font-semibold text-white dark:text-slate-200 hover:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
              Search Stocks to Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;

