import YahooFinance from "yahoo-finance2";
const yahooFinance = new (YahooFinance as any)();
import { getMockQuote } from "./mockData";

export async function fetchStockQuote(symbol: string): Promise<{
  c: number;   // Current price
  o: number;   // Open price
  h: number;   // Day high
  l: number;   // Day low
  dp: number;  // Percentage change
  d: number;   // Change amount
  pc: number;  // Previous close
}> {
  // Map to Yahoo Finance symbols for Indian stocks and indices
  const tickers: Record<string, string> = {
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
    const result = await (yahooFinance as any).quote(ticker);

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
    return getMockQuote(symbol);
  } catch (error: any) {
    console.warn(`⚠️ [Yahoo Finance] Quote fetch failed for ${ticker}: ${error.message}. Serving mock data.`);
    return getMockQuote(symbol);
  }
}
