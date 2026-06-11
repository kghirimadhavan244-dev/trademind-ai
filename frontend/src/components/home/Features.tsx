function Features() {
  const features = [
    {
      icon: "🤖",
      title: "AI Trading Assistant",
      description:
        "Get intelligent market explanations, financial insights, and trading guidance powered by Gemini AI.",
    },
    {
      icon: "📈",
      title: "Live Market Data",
      description:
        "Track stocks and markets in real time with reliable financial data integrations.",
    },
    {
      icon: "🧪",
      title: "Paper Trading",
      description:
        "Practice investing with virtual funds before putting real money on the line.",
    },
    {
      icon: "💼",
      title: "Portfolio Tracking",
      description:
        "Monitor performance, positions, and growth from one elegant dashboard.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tight text-slate-900">
          Everything You Need
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Built for students, investors, and traders who want AI-powered
          financial intelligence in one seamless platform.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="text-5xl">{feature.icon}</div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              {feature.title}
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;