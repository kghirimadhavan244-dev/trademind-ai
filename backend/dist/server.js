"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const chat_1 = __importDefault(require("./routes/chat"));
const markets_1 = __importDefault(require("./routes/markets"));
const search_1 = __importDefault(require("./routes/search"));
const analyze_1 = __importDefault(require("./routes/analyze"));
const auth_1 = __importDefault(require("./routes/auth"));
const paper_1 = __importDefault(require("./routes/paper"));
const watchlist_1 = __importDefault(require("./routes/watchlist"));
const news_1 = __importDefault(require("./routes/news"));
const portfolioAI_1 = __importDefault(require("./routes/portfolioAI"));
const aiPilot_1 = __importDefault(require("./routes/aiPilot"));
const aiPilotBacktest_1 = __importDefault(require("./routes/aiPilotBacktest"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/analyze", analyze_1.default);
// Register all routes AFTER app is created
app.use("/api/chat", chat_1.default);
app.use("/api/markets", markets_1.default);
app.use("/api/search", search_1.default);
app.use("/api/auth", auth_1.default);
app.use("/api/paper", paper_1.default);
app.use("/api/watchlist", watchlist_1.default);
app.use("/api/news", news_1.default);
app.use("/api/portfolio-ai", portfolioAI_1.default);
app.use("/api/ai-pilot", aiPilot_1.default);
app.use("/api/ai-pilot", aiPilotBacktest_1.default);
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "🚀 TradeMind AI Backend is running!",
    });
});
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "TradeMind AI Backend",
        timestamp: new Date().toISOString(),
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
