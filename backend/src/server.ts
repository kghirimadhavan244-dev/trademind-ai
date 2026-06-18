import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import chatRouter from "./routes/chat";
import marketsRouter from "./routes/markets";
import searchRouter from "./routes/search";
import analyzeRouter from "./routes/analyze";
import authRouter from "./routes/auth";
import paperRouter from "./routes/paper";
import watchlistRoutes from "./routes/watchlist";
import newsRoutes from "./routes/news";
import portfolioAiRouter from "./routes/portfolioAI";
import aiPilotRouter from "./routes/aiPilot";
import aiPilotBacktestRouter from "./routes/aiPilotBacktest";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/analyze", analyzeRouter);
// Register all routes AFTER app is created
app.use("/api/chat", chatRouter);
app.use("/api/markets", marketsRouter);
app.use("/api/search", searchRouter);
app.use("/api/auth", authRouter);
app.use("/api/paper", paperRouter);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/portfolio-ai", portfolioAiRouter);
app.use("/api/ai-pilot", aiPilotRouter);
app.use("/api/ai-pilot", aiPilotBacktestRouter);
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