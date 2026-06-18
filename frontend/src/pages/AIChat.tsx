import { API_BASE_URL } from "../config";
import { useState, useRef, useEffect } from "react";
import { Send, Brain, Cpu, RefreshCw } from "lucide-react";
import Navbar from "../components/layout/Navbar";

type Message = {
  role: "user" | "ai";
  text: string;
  action?: any;
  executed?: boolean;
};

function parseActionFromMessage(text: string) {
  const match = text.match(/\[ACTION:\s*({.*?})\s*\]/s);
  if (match) {
    try {
      const actionData = JSON.parse(match[1]);
      const cleanedText = text.replace(/\[ACTION:\s*{.*?}\s*\]/s, "").trim();
      return { cleanedText, action: actionData };
    } catch (e) {
      console.error("Failed to parse action JSON:", e);
    }
  }
  return { cleanedText: text, action: null };
}

function AIChat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!prompt.trim()) return;

    const userPrompt = prompt;
    setMessages((prev) => [...prev, { role: "user", text: userPrompt }]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userPrompt,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      const parsed = parseActionFromMessage(data.reply || "No response received.");

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: parsed.cleanedText,
          action: parsed.action,
          executed: false,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "❌ Unable to connect to the backend server. Please verify it is running on port 5000.",
        },
      ]);
    }

    setLoading(false);
  }

  async function handleExecuteAction(msgIndex: number) {
    if (!user) {
      alert("Please log in first to execute simulated paper trades.");
      return;
    }

    const msg = messages[msgIndex];
    if (!msg || !msg.action) return;

    const action = msg.action;

    try {
      if (action.type === "BUY") {
        const res = await fetch(`${API_BASE_URL}/api/paper/buy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            symbol: action.symbol,
            quantity: action.quantity,
            buyPrice: action.price,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert(`✅ Bought ${action.quantity} shares of ${action.symbol} successfully!`);
          markActionExecuted(msgIndex);
        } else {
          alert(`❌ Order failed: ${data.message}`);
        }
      } else if (action.type === "SELL") {
        let quantity = action.quantity;
        if (quantity === "ALL") {
          const portRes = await fetch(`${API_BASE_URL}/api/paper/portfolio/${user.id}`);
          const portData = await portRes.json();
          if (portData.success) {
            const holding = portData.holdings.find(
              (h: any) => h.symbol === action.symbol.toUpperCase()
            );
            if (holding) {
              quantity = holding.quantity;
            } else {
              alert(`❌ You don't hold any shares of ${action.symbol}.`);
              return;
            }
          } else {
            alert("❌ Failed to load holdings to resolve quantity.");
            return;
          }
        }

        const res = await fetch(`${API_BASE_URL}/api/paper/sell`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            symbol: action.symbol,
            quantity: quantity,
            sellPrice: action.price,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert(`✅ Sold ${quantity} shares of ${action.symbol} successfully!`);
          markActionExecuted(msgIndex);
        } else {
          alert(`❌ Order failed: ${data.message}`);
        }
      } else if (action.type === "INVEST") {
        let successCount = 0;
        let logs: string[] = [];

        for (const alloc of action.allocations) {
          const allocCost = action.amount * alloc.weight;
          const quantity = Math.floor(allocCost / alloc.price);
          if (quantity > 0) {
            const res = await fetch(`${API_BASE_URL}/api/paper/buy`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                symbol: alloc.symbol,
                quantity,
                buyPrice: alloc.price,
              }),
            });
            const data = await res.json();
            if (data.success) {
              successCount++;
              logs.push(`${quantity} shares of ${alloc.symbol}`);
            }
          }
        }

        if (successCount > 0) {
          alert(`✅ Portfolio Allocation Successful!\nPlaced orders for:\n${logs.join("\n")}`);
          markActionExecuted(msgIndex);
        } else {
          alert("❌ Portfolio allocation failed. Check if you have sufficient cash.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("❌ Trade execution failed due to a network error.");
    }
  }

  function markActionExecuted(msgIndex: number) {
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === msgIndex ? { ...msg, executed: true } : msg
      )
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-5 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Personalized AI Assistant
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
              Ask about NIFTY 50, RBI guidelines, SEBI codes, or instruct the autopilot (e.g. "invest ₹30k" or "buy 10 shares of RELIANCE").
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 max-w-5xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <div className="p-6 bg-slate-150 dark:bg-slate-900 rounded-full mb-4">
              <Brain className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350">
              Welcome to TradeMind AI Chat
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Ask questions like *"How is my portfolio doing?"*, *"Explain TCS fundamentals"*, or instruct autopilot *"invest ₹30k across bluechip stocks"* or *"buy 10 shares of reliance"*.
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const hasAction = msg.role === "ai" && msg.action;

          return (
            <div key={index} className="flex flex-col space-y-4 items-start w-full">
              <div
                className={`max-w-3xl rounded-3xl px-6 py-4 shadow-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-600 text-white font-semibold"
                    : "mr-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm md:text-base"
                }`}
              >
                {msg.text}
              </div>

              {hasAction && (
                <ActionCard
                  action={msg.action}
                  executed={msg.executed}
                  onExecute={() => handleExecuteAction(index)}
                />
              )}
            </div>
          );
        })}

        {loading && (
          <div className="mr-auto max-w-xs rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-sm font-semibold">TradeMind AI is thinking...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Tray */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="max-w-5xl mx-auto flex gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask anything or request actions (e.g. buy 5 Reliance)..."
            className="flex-1 rounded-2xl border border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-5 py-3 outline-none focus:border-blue-500 dark:focus:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950 font-medium"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold transition disabled:opacity-50 cursor-pointer flex items-center justify-center shadow-md shadow-blue-500/10"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  action,
  executed,
  onExecute,
}: {
  action: any;
  executed?: boolean;
  onExecute: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const isBuy = action.type === "BUY";
  const isSell = action.type === "SELL";
  const isInvest = action.type === "INVEST";

  return (
    <div className="mr-auto w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
          <Cpu className="w-4 h-4" />
        </span>
        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
          Autopilot Investment Order
        </h4>
      </div>

      {isBuy && (
        <div className="space-y-3">
          <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
            AI Autopilot has configured a buy setup based on your prompt:
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-750">
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white">{action.symbol}</span>
              <span className="text-[10px] font-bold text-slate-450 block uppercase">NSE Asset</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block">
                {action.quantity} Shares @ ₹{action.price?.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 mt-0.5 block">
                Total Cost: ₹{(action.quantity * action.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {isSell && (
        <div className="space-y-3">
          <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
            AI Autopilot has configured a sell setup based on your prompt:
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-750">
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white">{action.symbol}</span>
              <span className="text-[10px] font-bold text-slate-450 block uppercase">NSE Asset</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block">
                {action.quantity === "ALL" ? "Sell All Shares" : `${action.quantity} Shares`} @ ₹{action.price?.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-450 mt-0.5 block">
                Simulated Market Exit
              </span>
            </div>
          </div>
        </div>
      )}

      {isInvest && (
        <div className="space-y-3">
          <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
            AI recommends allocating a total investment budget of <strong className="text-slate-800 dark:text-white">₹{action.amount?.toLocaleString("en-IN")}</strong>:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
            {action.allocations?.map((item: any, idx: number) => {
              const allocatedCost = action.amount * item.weight;
              const sharesCount = Math.floor(allocatedCost / item.price);
              return (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs font-semibold border border-slate-100 dark:border-slate-750">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white">{item.symbol}</span>
                    <span className="text-[10px] text-slate-450 block">{(item.weight * 100).toFixed(0)}% weight</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-800 dark:text-slate-200 block">₹{allocatedCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">~{sharesCount} shares</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end">
        {executed ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl px-4 py-2">
            ✓ Transaction Executed
          </span>
        ) : (
          <button
            onClick={async () => {
              setLoading(true);
              await onExecute();
              setLoading(false);
            }}
            disabled={loading}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-500/10"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" /> Processing...
              </>
            ) : isInvest ? (
              "Deploy Portfolio Allocation"
            ) : (
              "Place Simulated Order"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default AIChat;