"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gemini_1 = require("../services/gemini");
const marketService_1 = require("../utils/marketService");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        const { prompt, userId } = req.body;
        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({
                success: false,
                message: "Prompt is required.",
            });
        }
        const trackedSymbols = [
            "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "ITC", "LT", "WIPRO", "BHARTIARTL"
        ];
        const quotes = await Promise.all(trackedSymbols.map(async (symbol) => {
            try {
                const quote = await (0, marketService_1.fetchStockQuote)(symbol);
                return { symbol, price: quote.c };
            }
            catch {
                return { symbol, price: 0 };
            }
        }));
        const quotesContext = `Live Stock Market Prices (INR):\n${quotes.map(q => `- ${q.symbol}: ₹${q.price.toFixed(2)}`).join("\n")}`;
        let context = "";
        if (userId) {
            const parsedUserId = Number(userId);
            if (!isNaN(parsedUserId)) {
                const user = await prisma_1.default.user.findUnique({
                    where: { id: parsedUserId },
                    select: {
                        cash: true,
                        name: true,
                        riskProfile: true,
                        investmentGoal: true,
                        monthlyBudget: true,
                        timeHorizon: true,
                        sectorPreference: true,
                    }
                });
                if (user) {
                    const holdings = await prisma_1.default.holding.findMany({
                        where: { userId: parsedUserId }
                    });
                    const watchlist = await prisma_1.default.watchlist.findMany({
                        where: { userId: parsedUserId }
                    });
                    context = `
User Profile:
- Name: ${user.name}
- Available Cash Balance: ₹${user.cash.toLocaleString("en-IN")}
- Risk Profile: ${user.riskProfile}
- Investment Goal: ${user.investmentGoal}
- Monthly Budget: ₹${user.monthlyBudget.toLocaleString("en-IN")}
- Time Horizon: ${user.timeHorizon}
- Preferred Sectors: ${user.sectorPreference}
- Current Stock Holdings: ${holdings.length > 0 ? holdings.map(h => `${h.quantity} shares of ${h.symbol} (bought at avg price ₹${h.buyPrice})`).join(", ") : "No stocks purchased yet."}
- Watchlisted Stocks: ${watchlist.length > 0 ? watchlist.map(w => w.symbol).join(", ") : "No stocks added to watchlist."}
`;
                }
            }
        }
        context = `${context}\n${quotesContext}`;
        console.log("📩 Prompt received:", prompt);
        const reply = await (0, gemini_1.askGemini)(prompt, context);
        console.log("🤖 Gemini reply generated");
        res.json({
            success: true,
            reply,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to generate AI response.",
        });
    }
});
exports.default = router;
