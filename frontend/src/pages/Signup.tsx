import { API_BASE_URL } from "../config";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  async function sendOtp() {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        setOtpLoading(false);
        return;
      }

      setOtpSent(true);
      if (data.otp) {
        alert(`Verification code generated! (Demo Mode: Autofilling code "${data.otp}")`);
        setOtp(data.otp);
      } else {
        alert("Verification code sent to your email.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send verification code.");
    }

    setOtpLoading(false);
  }

  async function verifyOtp() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      setVerified(true);
      alert("Email verified successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to verify OTP.");
    }
  }

  async function handleSignup() {
    if (!verified) {
      alert("Please verify your email first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Signup failed.");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-slate-50 to-blue-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-4xl font-bold">
          Create Account
        </h1>

        <div className="space-y-4">
          <input
            className="w-full rounded-xl border p-3"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={sendOtp}
            disabled={otpLoading}
            className="w-full rounded-xl bg-slate-800 py-3 font-semibold text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {otpLoading ? "Sending Code..." : "Send Verification Code"}
          </button>

          {otpSent && (
            <>
              <input
                className="w-full rounded-xl border p-3"
                placeholder="Enter Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                onClick={verifyOtp}
                className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
              >
                Verify Email
              </button>
            </>
          )}

          <input
            type="password"
            className="w-full rounded-xl border p-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSignup}
            disabled={!verified || loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {verified && (
            <p className="text-center text-sm text-green-600">
              Email verified successfully.
            </p>
          )}
        </div>

        <p className="mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;

