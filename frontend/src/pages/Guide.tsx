import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import {
  BookOpen,
  TrendingUp,
  LineChart,
  MessageSquare,
  DollarSign,
  Briefcase,
  Eye,
  PieChart,
  ShieldAlert,
  Calendar
} from "lucide-react";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "market-basics", label: "Market Basics", icon: TrendingUp },
  { id: "stock-data", label: "Stock Data", icon: LineChart },
  { id: "ai-assistant", label: "AI Assistant", icon: MessageSquare },
  { id: "paper-trading", label: "Paper Trading", icon: DollarSign },
  { id: "portfolio", label: "Portfolio Guide", icon: Briefcase },
  { id: "watchlist", label: "Watchlist Guide", icon: Eye },
  { id: "analysis", label: "Portfolio Analysis", icon: PieChart },
  { id: "safety-rules", label: "Safety Rules", icon: ShieldAlert },
  { id: "future-features", label: "Future Features", icon: Calendar }
];

export default function Guide() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-blue-950 mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold uppercase tracking-wider text-blue-300 mb-6">
              <BookOpen className="w-3.5 h-3.5" /> Education & Practice
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
              TradeMind AI Guide Center
            </h1>
            <p className="mt-4 text-sm md:text-base text-slate-300 leading-relaxed font-medium">
              Demystifying the stock market. Learn the basics of investing, explore data terms, understand portfolio concepts, and confidently practice virtual paper trading with the help of artificial intelligence.
            </p>
          </div>
        </div>

        {/* Desktop Sidebar & Grid Content */}
        <div className="grid gap-10 lg:grid-cols-4 items-start">
          
          {/* Quick Navigation Sidebar / Swipe bar on Mobile */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-sm overflow-x-auto lg:overflow-visible">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 lg:mb-4 px-2 hidden lg:block">Table of Contents</h3>
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1.5 lg:pb-0 scrollbar-none">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`flex items-center gap-2 lg:gap-3 px-3.5 lg:px-4 py-2.5 lg:py-3 text-[11px] lg:text-xs font-bold rounded-xl lg:rounded-2xl transition-all cursor-pointer whitespace-nowrap shrink-0 text-left ${
                      activeSection === sec.id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    {sec.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Guide Sections Detailed Content */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* 1. Getting Started */}
            <section id="getting-started" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">1. Getting Started with TradeMind AI</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-5">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">What is TradeMind AI?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  TradeMind AI is an intelligent stock market learning and analysis platform designed to help beginners explore investing. It combines **Artificial Intelligence**, **Real-Time Market Data**, **Portfolio Tracking**, and **Virtual Paper Trading** to provide a risk-free workspace where you can learn by doing.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  {[
                    "Explore Indian stock markets (NSE/BSE)",
                    "Analyze companies using AI Insights",
                    "Practice investing using virtual money",
                    "Track portfolio performance",
                    "Learn key investment concepts"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-6 h-6 rounded-full bg-blue-500/10 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Market Basics */}
            <section id="market-basics" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">2. Understanding Stock Market Basics</h2>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {/* What is a stock */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">What is a Stock?</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      A stock (also known as a share) represents a unit of partial ownership in a company. When you purchase a share of a company, you become a small shareholder.
                    </p>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-blue-500 block mb-0.5">Example:</span>
                      If you buy shares of **Reliance Industries**, you own a micro-portion of the company. If Reliance grows, the value of your shares may rise.
                    </div>
                  </div>
                </div>

                {/* NSE and BSE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">NSE & BSE</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      **NSE (National Stock Exchange)** is India's largest and most technologically advanced stock exchange. **BSE (Bombay Stock Exchange)** is India's and Asia's oldest stock exchange.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      These are the marketplaces where shares of companies like Reliance, TCS, Infosys, and HDFC Bank are traded.
                    </p>
                  </div>
                </div>

                {/* Nifty 50 and Sensex */}
                <div className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Stock Market Indices (NIFTY 50 & SENSEX)</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">NIFTY 50</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal font-medium">
                        Represents the weighted average of the **top 50 major companies** listed on the National Stock Exchange (NSE). It acts as a thermometer for the Indian economy.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">SENSEX</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal font-medium">
                        Tracks the performance of **30 financially sound, major companies** listed on the Bombay Stock Exchange (BSE).
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-550 dark:text-slate-350">
                    <strong>Market Trend Rule</strong>: If NIFTY 50 or SENSEX is rising, it generally indicates that the major companies are performing well, which typically boosts investor confidence.
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Stock Data */}
            <section id="stock-data" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <LineChart className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">3. Understanding Stock Data</h2>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    title: "Current Price",
                    desc: "The latest price at which a stock is transacting in the market.",
                    example: "If Reliance = ₹2,800, then one share costs ₹2,800 right now."
                  },
                  {
                    title: "Percentage Change (%)",
                    desc: "Indicates how much the stock price has risen or fallen compared to yesterday's closing price.",
                    example: "+2.5% means the stock has gained value, while -1.8% means it lost value."
                  },
                  {
                    title: "Day High",
                    desc: "The absolute highest price that the stock reached during today's market session.",
                    example: "If Reliance traded between ₹2,780 and ₹2,840 today, the Day High is ₹2,840."
                  },
                  {
                    title: "Day Low",
                    desc: "The lowest price at which the stock traded during today's market session.",
                    example: "In the above range, the Day Low is ₹2,780."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 tracking-wide block uppercase">Definition</span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{item.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] italic font-semibold text-slate-550 dark:text-slate-400">
                      Example: {item.example}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. AI Stock Assistant */}
            <section id="ai-assistant" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <MessageSquare className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">4. AI Stock Assistant Guide</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">What does the AI Assistant do?</h3>
                  <p className="text-sm text-slate-650 dark:text-slate-350 mt-1 leading-relaxed font-medium">
                    The TradeMind AI Assistant uses advanced Gemini large language models to help analyze stock data, translate complex jargon, and dissect your portfolio allocation.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">Ask the AI</span>
                    <ul className="text-xs font-bold text-slate-700 dark:text-slate-300 space-y-2">
                      <li className="flex items-center gap-2">"Explain Reliance's core products"</li>
                      <li className="flex items-center gap-2">"What does diversification mean?"</li>
                      <li className="flex items-center gap-2">"Compare TCS and Infosys performance"</li>
                      <li className="flex items-center gap-2">"Analyze my current portfolio risk"</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/10 dark:bg-amber-900/10 border border-amber-300/20 dark:border-amber-900/30 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Disclaimer</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold mt-2">
                        Our AI models provide educational quantitative analysis and information. It is designed to assist your learning process, not to provide guaranteed financial or investment advice.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Paper Trading */}
            <section id="paper-trading" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <DollarSign className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">5. Paper Trading Guide</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">What is Paper Trading?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                    Paper trading is a simulated trading environment where you can practice buying and selling stock shares. It mirrors live stock price movements but uses **virtual capital** instead of actual cash. It is the ultimate tool for beginners to gain market confidence risk-free.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="p-5 rounded-2xl bg-blue-50/20 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 text-center">
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Virtual Balance</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">₹10,00,000</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-normal">Loaded automatically in your demo account to start practice trading.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-center">
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Buying Stocks</span>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-2">Deducts Cash</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-normal">Exchanging virtual cash for company shares. Your holdings quantity increases.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-50/20 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-center">
                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Selling Stocks</span>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-2">Adds Cash</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-normal">Exchanging stock holdings back into virtual cash based on current price rates.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Portfolio */}
            <section id="portfolio" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Briefcase className="w-6 h-6 text-cyan-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">6. Portfolio Guide</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">What is a Portfolio?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                    A portfolio is the collection of all asset holdings owned by an investor. It displays your complete investment footprint in one consolidated dashboard view.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Portfolio Value</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      The total current worth of your stock holdings. It fluctuates in real-time as prices change.
                    </p>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Calculation: (Shares of Co. A * Price A) + (Shares of Co. B * Price B)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Profit / Loss (P&L)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Calculates whether your investments have increased or decreased in value relative to the rate at which you purchased them.
                    </p>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Calculation: Current Value - Cost of Purchase
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Watchlist */}
            <section id="watchlist" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Eye className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">7. Watchlist Guide</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-5">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">What is a Watchlist?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  A watchlist is your personalized bookmark list of stocks. It allows you to monitor price movements, daily gains, and analysis charts of companies you are interested in, without committing your virtual cash budget.
                </p>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  Use the watchlist to flag assets like Tata Motors, Infosys, or HDFC Bank to observe how their charts behave before deploying buy orders.
                </div>
              </div>
            </section>

            {/* 8. Portfolio Analysis Terms */}
            <section id="analysis" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <PieChart className="w-6 h-6 text-teal-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">8. Portfolio Analysis Terms</h2>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-3">
                {/* Diversification */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold text-[9px] uppercase tracking-wider inline-block">Diversification</span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Spreading Risk</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Avoid putting all your capital into a single company or sector. If one sector crashes, your other investments buffer the loss.
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-semibold">
                    **Risky**: 100% IT Stocks.<br/>
                    **Balanced**: 25% IT, 25% Banking, 25% Energy, 25% FMCG.
                  </div>
                </div>

                {/* Risk Level */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold text-[9px] uppercase tracking-wider inline-block">Risk Level</span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Volatility Scale</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Indicates how widely the value of your portfolio fluctuates. Higher volatility equals higher potential growth but also larger paper losses.
                    </p>
                  </div>
                  <div className="mt-4 text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                    High: Volatile stocks.<br/>
                    Low: Stable bluechips.
                  </div>
                </div>

                {/* Sector Allocation */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold text-[9px] uppercase tracking-wider inline-block">Sector Allocation</span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Industry Division</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      How your total capital is distributed across different industries (e.g. Technology, Healthcare, Utilities).
                    </p>
                  </div>
                  <div className="mt-4 text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                    Example allocation: IT 40%, Banking 30%, FMCG 30%.
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Investment Safety Rules */}
            <section id="safety-rules" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">9. Investment Safety Rules</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Rules of Thumb for Beginners</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                    To prevent costly mistakes, TradeMind AI advises every beginner to keep these core safety principles in mind:
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Learn Before You Invest", desc: "Never buy an asset you don't understand. Always research the core business first." },
                    { title: "Understand Risk Exposure", desc: "Never invest capital that you cannot afford to lose in the short term." },
                    { title: "Avoid Emotional Decisions", desc: "Don't sell in panic during minor dips. Rely on systematic calculations." },
                    { title: "Think Long Term", desc: "Short-term charts are highly speculative. Real wealth grows over years." }
                  ].map((rule, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-rose-50/10 dark:bg-rose-900/10 border border-rose-300/10 dark:border-rose-900/20 space-y-1.5">
                      <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide">● {rule.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{rule.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 10. Future Features */}
            <section id="future-features" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Calendar className="w-6 h-6 text-slate-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">10. Future Features Roadmap</h2>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Upcoming Enhancements</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  We are actively developing premium upgrades to make TradeMind AI even more powerful:
                </p>
                <div className="grid gap-3 sm:grid-cols-2 mt-4 font-bold text-xs text-slate-700 dark:text-slate-300">
                  {[
                    "Advanced AI Portfolio Advisor insights",
                    "Advanced stock price interactive charts",
                    "Real-time market news pipelines",
                    "SMS & Email price alerts",
                    "Personalized risk reports",
                    "Production brokerage integrations"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-blue-500 font-extrabold">✓</span> {feat}
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
