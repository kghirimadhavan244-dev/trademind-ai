import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "./pages/Search";
import Home from "./pages/Home";
import AIChat from "./pages/AIChat";
import Dashboard from "./pages/Dashboard";
import PaperTrading from "./pages/PaperTrading";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/search" element={<Search />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/paper-trading" element={<PaperTrading />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;