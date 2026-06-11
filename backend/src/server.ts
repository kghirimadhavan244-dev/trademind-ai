import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import chatRouter from "./routes/chat";
import marketsRouter from "./routes/markets";
import searchRouter from "./routes/search";
import analyzeRouter from "./routes/analyze";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/analyze", analyzeRouter);
// Register all routes AFTER app is created
app.use("/api/chat", chatRouter);
app.use("/api/markets", marketsRouter);
app.use("/api/search", searchRouter);

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