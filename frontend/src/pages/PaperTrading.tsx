
import { useState } from "react";
import Navbar from "../components/layout/Navbar";

type Holding = {
  symbol: string;
  quantity: number;
  price: number;
};

function PaperTrading() {
  const [cash, setCash] = useState(1000000);

  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [portfolio, setPortfolio] = useState<Holding[]>([]);

  async function buyStock() {
    if (!symbol.trim()) {
      alert("Please enter a stock symbol.");
      return;
    }

    if (quantity <= 0 || Number.isNaN(quantity)) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      console.log("Buying:", symbol.toUpperCase(), quantity);

      const res = await fetch(
        `http://localhost:5000/api/search/${symbol.toUpperCase()}`
      );

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      if (!data.success || !data.data) {
        alert("Stock not found.");
        return;
      }

      const price = Number(data.data.c);

      if (!price || Number.isNaN(price)) {
        alert("Invalid stock price received.");
        return;
      }

      const cost = price * quantity;

      if (cost > cash) {
        alert("Insufficient virtual balance.");
        return;
      }

      setCash((prev) => prev - cost);

      setPortfolio((prev) => [
        ...prev,
        {
          symbol: symbol.toUpperCase(),
          quantity,
          price,
        },
      ]);

      alert(
        `Bought ${quantity} share(s) of ${symbol.toUpperCase()} at $${price.toFixed(
          2
        )}`
      );

      setSymbol("");
      setQuantity(1);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch stock information.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50">
      <Navbar />

      <div className="mx-auto max-w-6xl p-8">
        <h1 className="text-5xl font-bold text-slate-900">
          📈 Paper Trading
        </h1>

        <p className="mt-3 text-slate-600">
          Practice trading with virtual money.
        </p>

        {/* Balance */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-700">
            Virtual Balance
          </h2>

          <p className="mt-2 text-4xl font-bold text-emerald-600">
            ₹{cash.toLocaleString()}
          </p>
        </div>

        {/* Buy Section */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Buy Stock
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter symbol (AAPL, MSFT...)"
              className="rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
            />

            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setQuantity(Number.isNaN(value) ? 1 : value);
              }}
              className="rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={buyStock}
              className="rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Buy
            </button>
          </div>
        </div>

        {/* Portfolio */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Portfolio
          </h2>

          {portfolio.length === 0 ? (
            <p className="text-slate-500">No holdings yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Buy Price</th>
                  <th className="pb-3">Total Cost</th>
                </tr>
              </thead>

              <tbody>
                {portfolio.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4 font-semibold">
                      {item.symbol}
                    </td>

                    <td>{item.quantity}</td>

                    <td>${item.price.toFixed(2)}</td>

                    <td>
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaperTrading;
