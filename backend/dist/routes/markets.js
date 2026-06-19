"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketService_1 = require("../utils/marketService");
const mockData_1 = require("../utils/mockData");
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const yahooFinance = new yahoo_finance2_1.default();
const router = (0, express_1.Router)();
const symbols = [
    "NIFTY50",
    "SENSEX",
    "BANKNIFTY",
    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "ICICIBANK",
    "SBIN",
];
router.get("/", async (_req, res) => {
    try {
        const results = await Promise.all(symbols.map(async (symbol) => {
            try {
                const quote = await (0, marketService_1.fetchStockQuote)(symbol);
                return {
                    symbol,
                    price: quote.c,
                    change: quote.dp,
                };
            }
            catch (err) {
                console.error(`Error loading market quote for ${symbol}:`, err);
                return {
                    symbol,
                    price: 0,
                    change: 0,
                };
            }
        }));
        res.json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        console.error("Critical error in markets router:", error);
        // Absolute fallback
        const fallbackResults = symbols.map((symbol) => {
            return {
                symbol,
                price: 0,
                change: 0,
            };
        });
        res.json({
            success: true,
            data: fallbackResults,
        });
    }
});
// GET /api/markets/history/:symbol?timeframe=1M
router.get("/history/:symbol", async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const timeframe = req.query.timeframe || "1M";
    // Tickers mapping
    const tickers = {
        NIFTY50: "^NSEI",
        SENSEX: "^BSESN",
        BANKNIFTY: "^NSEBANK",
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
    const ticker = tickers[symbol] || `${symbol}.NS`;
    try {
        let historyPoints = [];
        const now = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        if (timeframe.toUpperCase() === "1D") {
            // Intraday Chart - 30m interval for the past 24 hours
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const chartResult = await yahooFinance.chart(ticker, {
                period1: Math.floor(oneDayAgo.getTime() / 1000),
                interval: "30m",
            });
            if (chartResult && chartResult.quotes && chartResult.quotes.length > 0) {
                historyPoints = chartResult.quotes
                    .filter((q) => q.close !== null && q.close !== undefined)
                    .map((q) => {
                    const date = new Date(q.date);
                    const label = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                    return {
                        date: label,
                        price: parseFloat(q.close.toFixed(2)),
                    };
                });
            }
        }
        else {
            // Historical chart - 1d interval
            let startDate = new Date();
            if (timeframe.toUpperCase() === "1W") {
                startDate.setDate(now.getDate() - 7);
            }
            else if (timeframe.toUpperCase() === "1M") {
                startDate.setMonth(now.getMonth() - 1);
            }
            else if (timeframe.toUpperCase() === "1Y") {
                startDate.setFullYear(now.getFullYear() - 1);
            }
            else {
                startDate.setMonth(now.getMonth() - 1);
            }
            const chartResult = await yahooFinance.chart(ticker, {
                period1: startDate,
                interval: "1d",
            });
            if (chartResult && chartResult.quotes && chartResult.quotes.length > 0) {
                historyPoints = chartResult.quotes
                    .filter((h) => h.close !== null && h.close !== undefined)
                    .map((h) => {
                    const d = new Date(h.date);
                    let label = `${d.getDate()} ${monthNames[d.getMonth()]}`;
                    if (timeframe.toUpperCase() === "1W") {
                        label = dayNames[d.getDay() % 7];
                    }
                    else if (timeframe.toUpperCase() === "1Y") {
                        label = monthNames[d.getMonth()];
                    }
                    return {
                        date: label,
                        price: parseFloat(h.close.toFixed(2)),
                    };
                });
            }
        }
        if (historyPoints.length > 0) {
            console.log(`📈 [Yahoo Finance History] Loaded ${historyPoints.length} points for ${symbol}`);
            return res.json({
                success: true,
                symbol,
                timeframe,
                data: historyPoints,
            });
        }
        console.warn(`⚠️ [Yahoo Finance History] Empty data. Falling back to mock history for ${symbol}`);
        const mockHist = (0, mockData_1.getMockHistory)(symbol, timeframe);
        return res.json({
            success: true,
            symbol,
            timeframe,
            data: mockHist,
        });
    }
    catch (error) {
        console.warn(`⚠️ [Yahoo Finance History] Failed for ${symbol}: ${error.message}. Serving mock fallback.`);
        const mockHist = (0, mockData_1.getMockHistory)(symbol, timeframe);
        return res.json({
            success: true,
            symbol,
            timeframe,
            data: mockHist,
        });
    }
});
exports.default = router;
