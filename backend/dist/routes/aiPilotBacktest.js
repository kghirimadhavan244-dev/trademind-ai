"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const quantEngine_1 = require("../utils/quantEngine");
const yahooFinance = new yahoo_finance2_1.default();
const router = (0, express_1.Router)();
router.post("/backtest", async (req, res) => {
    try {
        const { symbol, strategyType } = req.body;
        if (!symbol || !strategyType) {
            return res.status(400).json({
                success: false,
                message: "Missing symbol or strategyType in request body.",
            });
        }
        const tickers = {
            RELIANCE: "RELIANCE.NS",
            TCS: "TCS.NS",
            INFY: "INFY.NS",
            HDFCBANK: "HDFCBANK.NS",
            ICICIBANK: "ICICIBANK.NS",
            SBIN: "SBIN.NS",
            ITC: "ITC.NS",
            LT: "LT.NS",
            WIPRO: "WIPRO.NS",
            BHARTIARTL: "BHARTIARTL.NS",
        };
        const cleanSymbol = symbol.toUpperCase().trim();
        const ticker = tickers[cleanSymbol] || `${cleanSymbol}.NS`;
        // Fetch 1 year of daily historical price points
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        const chartResult = await yahooFinance.chart(ticker, {
            period1: startDate,
            interval: "1d",
        });
        if (!chartResult || !chartResult.quotes || chartResult.quotes.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No historical quotes available for symbol: ${symbol}`,
            });
        }
        // Map to ChartQuote array, filtering out null closing prices
        const quotes = chartResult.quotes
            .filter((q) => q.close !== null && q.close !== undefined)
            .map((q) => ({
            date: new Date(q.date),
            close: q.close,
        }));
        if (quotes.length < 15) {
            return res.status(400).json({
                success: false,
                message: `Insufficient historical quotes data (${quotes.length} points) to run backtest.`,
            });
        }
        const backtest = (0, quantEngine_1.runBacktest)(quotes, strategyType);
        return res.json({
            success: true,
            symbol,
            strategyType,
            ...backtest,
        });
    }
    catch (error) {
        console.error(`Backtest failed: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: `Backtest computation failed: ${error.message}`,
        });
    }
});
exports.default = router;
