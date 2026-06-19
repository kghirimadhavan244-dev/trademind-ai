"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchStockQuote = fetchStockQuote;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const yahooFinance = new yahoo_finance2_1.default();
const mockData_1 = require("./mockData");
async function fetchStockQuote(symbol) {
    // Map to Yahoo Finance symbols for Indian stocks and indices
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
    const cleanSymbol = symbol.toUpperCase().trim();
    const ticker = tickers[cleanSymbol] || `${cleanSymbol}.NS`; // Default to NSE ticker suffix
    try {
        const result = await yahooFinance.quote(ticker);
        if (result && result.regularMarketPrice !== undefined) {
            return {
                c: result.regularMarketPrice ?? 0,
                o: result.regularMarketOpen ?? result.regularMarketPrice ?? 0,
                h: result.regularMarketDayHigh ?? result.regularMarketPrice ?? 0,
                l: result.regularMarketDayLow ?? result.regularMarketPrice ?? 0,
                dp: result.regularMarketChangePercent ?? 0,
                d: result.regularMarketChange ?? 0,
                pc: result.regularMarketPreviousClose ?? result.regularMarketPrice ?? 0,
            };
        }
        console.warn(`[Yahoo Finance] Returned empty results for ${ticker}. Falling back to mock data.`);
        return (0, mockData_1.getMockQuote)(symbol);
    }
    catch (error) {
        console.warn(`⚠️ [Yahoo Finance] Quote fetch failed for ${ticker}: ${error.message}. Serving mock data.`);
        return (0, mockData_1.getMockQuote)(symbol);
    }
}
