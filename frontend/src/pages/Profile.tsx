import { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Lock, 
  Settings, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2 
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import { API_BASE_URL } from "../config";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  cash: number;
  riskProfile: string;
  investmentGoal: string;
  monthlyBudget: number;
  timeHorizon: string;
  sectorPreference: string;
}

function Profile() {
  const localUser = JSON.parse(localStorage.getItem("user") || "null");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"details" | "investment" | "security">("details");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Investment Profile Form states
  const [riskProfile, setRiskProfile] = useState("Moderate");
  const [investmentGoal, setInvestmentGoal] = useState("Wealth Growth");
  const [monthlyBudget, setMonthlyBudget] = useState(10000);
  const [timeHorizon, setTimeHorizon] = useState("Medium (3-5 years)");
  const [sectorPreference, setSectorPreference] = useState("Technology, Finance");

  // Password Form states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localUser) {
      loadProfileData();
    }
  }, []);

  async function loadProfileData() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile/${localUser.id}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setRiskProfile(data.user.riskProfile);
        setInvestmentGoal(data.user.investmentGoal);
        setMonthlyBudget(data.user.monthlyBudget);
        setTimeHorizon(data.user.timeHorizon);
        setSectorPreference(data.user.sectorPreference);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }

  function triggerMessage(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          name,
          riskProfile,
          investmentGoal,
          monthlyBudget,
          timeHorizon,
          sectorPreference
        })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        // Sync local storage user name
        const updatedLocal = { ...localUser, name: data.user.name };
        localStorage.setItem("user", JSON.stringify(updatedLocal));
        triggerMessage("✅ Profile information updated successfully!", "success");
      } else {
        triggerMessage(data.message || "Failed to update profile.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerMessage("❌ Connection error. Failed to update profile.", "error");
    }
    setLoading(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerMessage("❌ New passwords do not match.", "error");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localUser.id,
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        triggerMessage("✅ Password changed successfully!", "success");
      } else {
        triggerMessage(data.message || "Failed to change password.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerMessage("❌ Connection error. Failed to change password.", "error");
    }
    setLoading(false);
  }

  if (!localUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-md p-8 text-center my-auto">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="mt-2 text-slate-650 dark:text-slate-400">Please sign in to view your profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-6xl p-6 md:p-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          Account Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
          Manage your personal information, security credentials, and AI risk thresholds.
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 font-semibold text-sm ${
            message.type === "success" 
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-400"
          }`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-4 items-start">
          
          {/* Profile Card Sidebar */}
          <div className="lg:col-span-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-4xl font-extrabold mb-4 shadow-inner">
              {profile ? profile.name.charAt(0).toUpperCase() : localUser.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              {profile ? profile.name : localUser.name}
            </h2>
            <p className="text-sm text-slate-400 truncate mb-4">
              {profile ? profile.email : localUser.email}
            </p>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-left space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Virtual Cash balance</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-450">
                  ₹{profile ? profile.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "1,00,000"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Risk profile</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile ? profile.riskProfile : "Moderate"}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Tab Panels */}
          <div className="lg:col-span-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
            
            {/* Tabs Selector Bar */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 gap-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-2 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "details"
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <UserIcon className="w-4 h-4" /> Personal Details
              </button>
              
              <button
                onClick={() => setActiveTab("investment")}
                className={`pb-2 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "investment"
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <TrendingUp className="w-4 h-4" /> AI Investment Profile
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`pb-2 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "security"
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Lock className="w-4 h-4" /> Security
              </button>
            </div>

            {/* TAB: Details */}
            {activeTab === "details" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-4 py-3 outline-none text-slate-400 font-semibold cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Email address cannot be changed once verified.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 transition disabled:opacity-50 text-sm cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {loading ? "Saving..." : "Save Profile Details"}
                </button>
              </form>
            )}

            {/* TAB: Investment Profile */}
            {activeTab === "investment" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Risk Appetite</label>
                    <select
                      value={riskProfile}
                      onChange={(e) => setRiskProfile(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                    >
                      <option value="Conservative">Conservative (Capital preservation, low risk)</option>
                      <option value="Moderate">Moderate (Balanced growth, moderate risk)</option>
                      <option value="Aggressive">Aggressive (High growth, high risk tolerance)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Investment Goal</label>
                    <select
                      value={investmentGoal}
                      onChange={(e) => setInvestmentGoal(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                    >
                      <option value="Capital Preservation">Capital Preservation</option>
                      <option value="Wealth Growth">Wealth Growth</option>
                      <option value="Retirement Wealth">Retirement Wealth</option>
                      <option value="Short-term gains">Short-term gains</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monthly Budget (INR)</label>
                    <input
                      type="number"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                      required
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Time Horizon</label>
                    <select
                      value={timeHorizon}
                      onChange={(e) => setTimeHorizon(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                    >
                      <option value="Short (0-1 years)">Short (0-1 years)</option>
                      <option value="Medium (3-5 years)">Medium (3-5 years)</option>
                      <option value="Long (5+ years)">Long (5+ years)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Preferred Industry Sectors</label>
                  <input
                    type="text"
                    value={sectorPreference}
                    onChange={(e) => setSectorPreference(e.target.value)}
                    placeholder="e.g. Technology, Healthcare, Energy, Banking"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Use commas to list multiple preferred sectors.</p>
                </div>

                <div className="rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 p-4 flex gap-3 text-xs text-blue-800 dark:text-blue-300">
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <p className="leading-relaxed">
                    <strong>AI Recommendation Customization:</strong> Saving these options updates the internal Gemini AI context so that chatbot answers, market review reports, and autopilot allocation logic adapt automatically to your targets!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 transition disabled:opacity-50 text-sm cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {loading ? "Updating..." : "Update AI Settings"}
                </button>
              </form>
            )}

            {/* TAB: Security */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 transition disabled:opacity-50 text-sm cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
