import { API_BASE_URL } from "../config";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save user info
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("✅ Login Successful!");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Unable to connect to server.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-6 transition-colors duration-300">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl transition-all duration-300">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Welcome Back 👋
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Sign in to continue using TradeMind AI.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
