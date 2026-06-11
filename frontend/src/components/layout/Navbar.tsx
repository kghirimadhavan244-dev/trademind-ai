import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-gray-900"
        >
          TradeMind <span className="text-blue-600">AI</span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/dashboard"
            className="text-gray-600 transition hover:text-blue-600"
          >
            Dashboard
          </Link>

          <Link
            to="/search"
            className="text-gray-600 transition hover:text-blue-600"
          >
            Search
          </Link>

          <Link
            to="/chat"
            className="text-gray-600 transition hover:text-blue-600"
          >
            AI Chat
          </Link>
        </div>

        {/* CTA */}
        <Link
          to="/chat"
          className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;