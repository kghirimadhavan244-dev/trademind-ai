
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <h1 className="text-7xl font-bold text-slate-900">404</h1>

      <p className="mt-4 text-lg text-slate-600">
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Return to Home
      </Link>
    </div>
  );
}

export default NotFound;

