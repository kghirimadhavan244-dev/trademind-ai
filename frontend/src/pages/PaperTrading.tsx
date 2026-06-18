import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

type Holding = {
  symbol: string;
  quantity: number;
  price: number;
};

function PaperTrading() {
  const [searchParams] = useSearchParams();
  const urlSymbol = searchParams.get("symbol");

  const [cash, setCash] = useState(1000000);

  // Buy States
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Sell States
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellQuantity, setSellQuantity] = useState(1);

  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(false);

  // Logged-in user
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Load portfolio from backend
  async function loadPortfolio() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/paper/portfolio/${user.id}`
      );

      const data = await res.json();

      if (data.success) {
        setCash(data.cash);
        setPortfolio(
          data.holdings.map((item: any) => ({
            symbol: item.symbol,
            quantity: item.quantity,
            price: item.buyPrice,
          }))
        );
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  // Set symbol from URL parameter
  useEffect(() => {
    if (urlSymbol) {
      setSymbol(urlSymbol.toUpperCase());
    }
  }, [urlSymbol]);

  async function buyStock() {
    if (!user) {
      alert("Please log in first.");
      return;
    }

    const cleanSymbol = symbol.trim().toUpperCase();

    if (!cleanSymbol) {
      alert("Please enter a stock symbol.");
      return;
    }

    if (quantity <= 0) {
      alert("Invalid quantity.");
      return;
    }

    try {
      // Get live price
      const res = await fetch(
        `${API_BASE_URL}/api/search/${cleanSymbol}`
      );

      const data = await res.json();

      if (!data.success) {
        alert("Stock not found.");
        return;
      }

      const price = Number(data.data.c);

      if (!price || Number.isNaN(price)) {
        alert("Invalid stock price.");
        return;
      }

      const cost = price * quantity;

      if (cost > cash) {
        alert("Insufficient virtual balance.");
        return;
      }

      // Save to backend database
      const buyRes = await fetch(
        `${API_BASE_URL}/api/paper/buy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            symbol: cleanSymbol,
            quantity,
            buyPrice: price,
          }),
        }
      );

      const buyData = await buyRes.json();

      if (!buyData.success) {
        alert(buyData.message || "Failed to save trade.");
        return;
      }

      alert(
        `✅ Bought ${quantity} share(s) of ${cleanSymbol} at ₹${price.toFixed(2)}`
      );

      setSymbol("");
      setQuantity(1);
      
      // Reload portfolio to get synced state
      await loadPortfolio();
    } catch (error) {
      console.error(error);
      alert("Failed to complete trade.");
    }
  }

  async function sellStock() {
    if (!user) {
      alert("Please log in first.");
      return;
    }

    const cleanSymbol = sellSymbol.trim().toUpperCase();

    if (!cleanSymbol) {
      alert("Please enter a stock symbol to sell.");
      return;
    }

    if (sellQuantity <= 0) {
      alert("Invalid quantity.");
      return;
    }

    // Verify user owns enough of this stock
    const owned = portfolio.find((item) => item.symbol === cleanSymbol);
    if (!owned || owned.quantity < sellQuantity) {
      alert(`You do not own enough shares of ${cleanSymbol} to sell (Owned: ${owned?.quantity || 0}).`);
      return;
    }

    try {
      // Get live price
      const res = await fetch(
        `${API_BASE_URL}/api/search/${cleanSymbol}`
      );

      const data = await res.json();

      if (!data.success) {
        alert("Stock not found.");
        return;
      }

      const price = Number(data.data.c);

      if (!price || Number.isNaN(price)) {
        alert("Invalid stock price.");
        return;
      }

      // Save to backend database
      const sellRes = await fetch(
        `${API_BASE_URL}/api/paper/sell`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            symbol: cleanSymbol,
            quantity: sellQuantity,
            sellPrice: price,
          }),
        }
      );

      const sellData = await sellRes.json();

      if (!sellData.success) {
        alert(sellData.message || "Failed to save trade.");
        return;
      }

      alert(
        `✅ Sold ${sellQuantity} share(s) of ${cleanSymbol} at ₹${price.toFixed(2)}`
      );

      setSellSymbol("");
      setSellQuantity(1);

      // Reload portfolio to get synced state
      await loadPortfolio();
    } catch (error) {
      console.error(error);
      alert("Failed to complete trade.");
    }
  }

  // Pre-fill sell forms from table helper
  function initiateSell(sym: string, qty: number) {
    setSellSymbol(sym);
    setSellQuantity(qty);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-6xl p-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          📈 Paper Trading
        </h1>

        <p className="mt-3 text-lg text-slate-650 dark:text-slate-450">
          Simulate buy and sell transactions risk-free with virtual capital.
        </p>

        {/* Balance Card */}
        <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Virtual Cash Balance
          </h2>

          <p className="mt-2 text-4xl font-extrabold text-emerald-600">
            ₹
            {cash.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Trade Panels (Buy & Sell side-by-side) */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Buy Section */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-600">●</span> Buy Securities
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Stock Symbol</label>
                <input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. RELIANCE, TCS, INFY"
                  className="w-full rounded-xl border border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-355 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <button
                onClick={buyStock}
                className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 transition"
              >
                Execute Buy Order
              </button>
            </div>
          </div>

          {/* Sell Section */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-amber-500">●</span> Sell Securities
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Stock Symbol</label>
                <input
                  value={sellSymbol}
                  onChange={(e) => setSellSymbol(e.target.value)}
                  placeholder="e.g. RELIANCE, TCS, INFY"
                  className="w-full rounded-xl border border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-355 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <button
                onClick={sellStock}
                className="w-full rounded-xl bg-amber-500 p-3 font-semibold text-white hover:bg-amber-600 transition"
              >
                Execute Sell Order
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Holdings */}
        <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm overflow-hidden">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            Your Equities Portfolio
          </h2>

          {loading ? (
            <p className="text-slate-500 animate-pulse text-center py-6">Syncing portfolio holdings...</p>
          ) : portfolio.length === 0 ? (
            <p className="text-slate-500 py-6 text-center">No stock holdings in your portfolio yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Avg Buy Price</th>
                    <th className="pb-3">Invested Value</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {portfolio.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 font-bold text-slate-900 dark:text-white">{item.symbol}</td>
                      <td className="py-4 font-semibold">{item.quantity}</td>
                      <td className="py-4 font-semibold">₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 font-bold">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => initiateSell(item.symbol, item.quantity)}
                          className="rounded-xl border border-amber-500 px-4 py-1.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition"
                        >
                          Quick Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaperTrading;

