
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import AIChat from "./pages/AIChat";
import PaperTrading from "./pages/PaperTrading";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Watchlist from "./pages/Watchlist";
import PortfolioAI from "./pages/PortfolioAI";
import AIPilot from "./pages/AIPilot";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/watchlist"
  element={
    <ProtectedRoute>
      <Watchlist />
    </ProtectedRoute>
  }
/>
<Route
  path="/portfolio-ai"
  element={
    <ProtectedRoute>
      <PortfolioAI />
    </ProtectedRoute>
  }
/>
<Route
  path="/ai-pilot"
  element={
    <ProtectedRoute>
      <AIPilot />
    </ProtectedRoute>
  }
/>

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/paper-trading"
          element={
            <ProtectedRoute>
              <PaperTrading />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

