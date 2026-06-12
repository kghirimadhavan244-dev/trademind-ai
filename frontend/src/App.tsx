
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AIChat from "./pages/AIChat";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import PaperTrading from "./pages/PaperTrading";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/search" element={<Search />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/paper-trading" element={<PaperTrading />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

