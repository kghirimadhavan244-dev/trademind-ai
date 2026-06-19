"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketService_1 = require("../utils/marketService");
const gemini_1 = require("../services/gemini");
const router = (0, express_1.Router)();
router.get("/:symbol", async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const quote = await (0, marketService_1.fetchStockQuote)(symbol);
        const { c, dp, h, l } = quote;
        const prompt = `
You are TradeMind AI, a financial assistant.

Analyze the following stock for a beginner:

Symbol: ${symbol}
Current Price: ${c}
Daily Change: ${dp}%
Day High: ${h}
Day Low: ${l}

Explain:
- What today's movement means
- Whether the stock is up or down today
- Any important observations
- End with a reminder that this is educational information, not financial advice

Keep the response under 200 words.
`;
        const analysis = await (0, gemini_1.askGemini)(prompt);
        res.json({
            success: true,
            symbol,
            analysis,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to analyze stock.",
        });
    }
});
exports.default = router;
