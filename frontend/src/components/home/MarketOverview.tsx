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

  return (
    <section className="mx-auto mt-16 max-w-7xl px-6 w-full text-left">
      <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">
        Indian Market Overview
      </h2>

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