import { useState } from "react";

function Search() {
  const [symbol, setSymbol] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function searchStock() {
    if (!symbol.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/search/${symbol.toUpperCase()}`
      );

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult(null);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 p-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">
            🔍 Stock Search
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Search live market data and instantly analyze your favorite stocks.
          </p>
        </div>

        {/* Search Box */}
        <div className="mt-12 flex flex-col gap-4 md:flex-row">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchStock();
              }
            }}
            placeholder="Enter symbol (AAPL, TSLA, MSFT...)"
            className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={searchStock}
            disabled={loading}
            className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-slate-600">⏳ Fetching live market data...</p>
          </div>
        )}

        {/* Result */}
        {result?.success && (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">
                  Stock Symbol
                </p>
                <h2 className="mt-1 text-4xl font-bold text-slate-900">
                  {result.symbol}
                </h2>
              </div>

              <div
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  result.data.dp >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {result.data.dp >= 0 ? "+" : ""}
                {result.data.dp.toFixed(2)}%
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-6">
                <p className="text-slate-500">Current Price</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  ${result.data.c}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6">
                <p className="text-slate-500">Day High</p>
                <h3 className="mt-2 text-3xl font-bold text-blue-600">
                  ${result.data.h}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6">
                <p className="text-slate-500">Day Low</p>
                <h3 className="mt-2 text-3xl font-bold text-red-500">
                  ${result.data.l}
                </h3>
              </div>
            </div>

            {/* Future AI Button */}
            <div className="mt-8">
              <button className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">
                🤖 Analyze with AI (Coming Next)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;