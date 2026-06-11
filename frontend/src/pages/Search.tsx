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
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold text-emerald-400 mb-8">
        🔍 Stock Search
      </h1>

      <div className="flex gap-3 mb-8">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter symbol (AAPL, TSLA, MSFT...)"
          className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-3"
        />

        <button
          onClick={searchStock}
          className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {result?.success && (
        <div className="rounded-xl bg-slate-900 p-6 border border-slate-800">
          <h2 className="text-2xl font-bold">{result.symbol}</h2>

          <p className="mt-3">
            💲 Current Price: <strong>{result.data.c}</strong>
          </p>

          <p>
            📈 Change: <strong>{result.data.dp}%</strong>
          </p>

          <p>
            📊 High: <strong>{result.data.h}</strong>
          </p>

          <p>
            📉 Low: <strong>{result.data.l}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default Search;