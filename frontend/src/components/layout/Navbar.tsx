function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 bg-slate-950 border-b border-slate-800">
      {/* Logo */}
      <div className="text-2xl font-bold text-emerald-400">
        TradeMind AI
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 text-slate-300">
        <a href="#" className="hover:text-emerald-400 transition">
          Markets
        </a>
        <a href="#" className="hover:text-emerald-400 transition">
          AI Chat
        </a>
        <a href="#" className="hover:text-emerald-400 transition">
          Paper Trading
        </a>
        <a href="#" className="hover:text-emerald-400 transition">
          Features
        </a>
      </div>

      {/* Action Button */}
      <button className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-slate-950 hover:bg-emerald-400 transition">
        Get Started
      </button>
    </nav>
  );
}

export default Navbar;