import { API_BASE_URL } from "../../config";
import { useEffect, useState } from "react";

const indices = [
  { name: "Nifty 50 Index", symbol: "NIFTY50" },
  { name: "BSE Sensex Index", symbol: "SENSEX" },
  { name: "Reliance Industries", symbol: "RELIANCE" },
  { name: "Tata Consultancy Services", symbol: "TCS" },
];

function MarketOverview() {
  const [marketData, setMarketData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const results = await Promise.all(
        indices.map(async (item) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/api/search/${item.symbol}`
            );
            const json = await res.json();

            return {
              ...item,
              price: json.data.c,
              change: json.data.dp,
            };
          } catch {
            return {
              ...item,
              price: "-",
              change: 0,
            };
          }
        })
      );

      setMarketData(results);
    }

    loadData();
  }, []);

  const niftyItem = marketData.find((item) => item.symbol === "NIFTY50");
  const niftyChange = niftyItem && typeof niftyItem.change === "number" ? niftyItem.change : 0;

  let mood = "Neutral";
  let moodColor = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
  let moodDot = "bg-amber-500";

  if (niftyChange > 0.5) {
    mood = "Bullish";
    moodColor = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
    moodDot = "bg-emerald-500";
  } else if (niftyChange < -0.5) {
    mood = "Bearish";
    moodColor = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25";
    moodDot = "bg-rose-500";
  }

  return (
    <section className="mx-auto mt-16 max-w-7xl px-6 w-full text-left">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Indian Market Overview
        </h2>
        {marketData.length > 0 && (
          <div className={`self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-sm transition-colors duration-300 ${moodColor}`}>
            <span className={`w-2 h-2 rounded-full ${moodDot} ${mood !== "Neutral" ? "animate-pulse" : ""}`}></span>
            <span>Market Mood: {mood}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {marketData.map((item) => (
          <div
            key={item.symbol}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
          >
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{item.name}</h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {item.symbol}
            </p>

            <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{typeof item.price === "number" ? item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : item.price}
            </p>

            <p
              className={`mt-2 font-semibold ${
                item.change >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-500 dark:text-rose-400"
              }`}
            >
              {item.change >= 0 ? "▲ +" : "▼ "}
              {item.change?.toFixed?.(2)}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MarketOverview;