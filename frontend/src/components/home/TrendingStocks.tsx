import { API_BASE_URL } from "../../config";
import { useEffect, useState } from "react";

const stocks = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "SBIN",
];

function TrendingStocks() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function loadStocks() {
      try {
        const results = await Promise.all(
          stocks.map(async (symbol) => {
            const res = await fetch(
              `${API_BASE_URL}/api/search/${symbol}`
            );

            const json = await res.json();

            return {
              symbol,
              price: json?.data?.c ?? 0,
              change: json?.data?.dp ?? 0,
            };
          })
        );

        setData(results);
      } catch (err) {
        console.error(err);
      }
    }

    loadStocks();
  }, []);

  return (
    <section className="mx-auto mt-20 max-w-7xl px-6 w-full text-left">
      <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">
        Trending Equities (NSE)
      </h2>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
        {data.map((stock) => (
          <div
            key={stock.symbol}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{stock.symbol}</h3>

            <p className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-200">
              ₹{stock.price.toFixed(2)}
            </p>

            <p
              className={`mt-2 text-sm font-medium ${
                stock.change >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {stock.change >= 0 ? "+" : ""}
              {stock.change.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrendingStocks;