function Features() {
  const features = [
    {
      title: "🤖 AI Trading Assistant",
      description:
        "Get instant market analysis, explanations, and trading ideas powered by Gemini AI.",
    },
    {
      title: "📈 Live Market Insights",
      description:
        "Track stocks, indices, and crypto markets with real-time updates and trends.",
    },
    {
      title: "🧪 Paper Trading",
      description:
        "Practice your strategies with virtual money before risking real capital.",
    },
    {
      title: "💼 Portfolio Tracking",
      description:
        "Monitor your investments, profits, and performance in one dashboard.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white">
          Everything You Need to Trade Smarter
        </h2>
        <p className="mt-4 text-slate-400">
          Built for beginners, investors, and experienced traders.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-500"
          >
            <h3 className="text-xl font-semibold text-emerald-400">
              {feature.title}
            </h3>

            <p className="mt-4 text-slate-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;