import { API_BASE_URL } from "../config";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to initiate password reset.");
        setLoading(false);
        return;
      }

      if (data.otp) {
        alert(`Password reset code generated! (Demo Mode: Redirecting with code "${data.otp}")`);
        navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${data.otp}`);
      } else {
        alert("Password reset verification code has been sent to your email!");
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to connect to server.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-6 transition-colors duration-300">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl transition-all duration-300">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Forgot Password
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
            Enter your email address below, and we'll send you a 6-digit verification code to reset your password.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
            />
          </div>

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            {loading ? "Sending Code..." : "Send Verification Code"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
