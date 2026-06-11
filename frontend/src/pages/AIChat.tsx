import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "ai";
  text: string;
};

function AIChat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userPrompt,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || "No response received.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "❌ Unable to connect to the backend.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-3xl font-bold text-emerald-400">
          🤖 TradeMind AI Assistant
        </h1>
        <p className="text-slate-400 mt-1">
          Ask about stocks, crypto, investing, trading, or finance.
        </p>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-20">
            Start a conversation with TradeMind AI 🚀
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-4xl rounded-2xl px-5 py-4 whitespace-pre-wrap ${
              msg.role === "user"
                ? "ml-auto bg-emerald-600 text-white"
                : "mr-auto bg-slate-800 text-slate-100"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="mr-auto max-w-md rounded-2xl bg-slate-800 px-5 py-4 text-slate-300">
            🤖 Thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-5">
        <div className="flex gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask TradeMind AI anything..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-500"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIChat;