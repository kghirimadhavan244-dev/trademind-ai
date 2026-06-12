
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5 shadow-sm">
      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-bold text-slate-900 hover:text-blue-600"
      >
        TradeMind AI
      </Link>

      {/* Navigation */}
      <div className="hidden items-center gap-8 md:flex">
        <Link to="/search" className="text-slate-600 hover:text-blue-600">
          Markets
        </Link>

        <Link to="/chat" className="text-slate-600 hover:text-blue-600">
          AI Chat
        </Link>

        <Link
          to="/paper-trading"
          className="text-slate-600 hover:text-blue-600"
        >
          Paper Trading
        </Link>

        <Link to="/dashboard" className="text-slate-600 hover:text-blue-600">
          Dashboard
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="rounded-xl border border-slate-300 px-5 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
