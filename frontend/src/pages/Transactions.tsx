import { API_BASE_URL } from "../config";

import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";

type Transaction = {
  id: number;
  type: string;
  symbol: string;
  quantity: number;
  price: number;
  createdAt: string;
};

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    async function loadTransactions() {
      if (!user) return;

      const res = await fetch(
        `${API_BASE_URL}/api/paper/transactions/${user.id}`
      );

      const data = await res.json();

      if (data.success) {
        setTransactions(data.transactions);
      }
    }

    loadTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-6xl p-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Transaction History
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Review all paper trading activity associated with your account.
        </p>

        <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400">
                <th className="pb-3">Type</th>
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <td className="py-4 font-medium">{tx.type}</td>
                  <td>{tx.symbol}</td>
                  <td>{tx.quantity}</td>
                  <td>₹{tx.price.toFixed(2)}</td>
                  <td>
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <p className="py-6 text-center text-slate-500 dark:text-slate-400">
              No transactions available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;

