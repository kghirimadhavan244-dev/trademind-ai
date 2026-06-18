import { API_BASE_URL } from "../../config";
import { useEffect, useState } from "react";

type MarketItem = {
  symbol: string;
  price: number;
  change: number;
};

function MarketTicker() {
  const [markets, setMarkets] = useState<MarketItem[]>([]);

  useEffect(() => {
    async function loadMarkets() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/markets`);
        const data = await res.json();

        if (data.success) {
          setMarkets(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadMarkets();

    const interval = setInterval(loadMarkets, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-6 md:grid-cols-3">
        {markets.map((item) => (
          <div
            key={item.symbol}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              {item.symbol}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              ₹{item.price.toFixed(2)}
            </h2>

            <p
              className={`mt-2 text-lg font-semibold ${
                item.change >= 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {item.change >= 0 ? "+" : ""}
              {item.change.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MarketTicker;