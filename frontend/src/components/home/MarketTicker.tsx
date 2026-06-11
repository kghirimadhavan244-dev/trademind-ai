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
        const res = await fetch("http://localhost:5000/api/markets");
        const data = await res.json();

        if (data.success) {
          setMarkets(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadMarkets();

    // Refresh every 30 seconds
    const interval = setInterval(loadMarkets, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-y border-slate-800 bg-slate-900 py-4">
      <div className="mx-auto flex max-w-7xl justify-center gap-8 overflow-x-auto px-4">
        {markets.map((item) => (
          <div
            key={item.symbol}
            className="rounded-xl bg-slate-800 px-5 py-3 text-center shadow"
          >
            <div className="text-sm text-slate-400">{item.symbol}</div>

            <div className="text-xl font-bold text-white">
              ${item.price.toFixed(2)}
            </div>

            <div
              className={`text-sm font-semibold ${
                item.change >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {item.change >= 0 ? "+" : ""}
              {item.change.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketTicker;