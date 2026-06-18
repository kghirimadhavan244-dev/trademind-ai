import { Router } from "express";
import { fetchStockQuote } from "../utils/marketService";
import { getMockHistory } from "../utils/mockData";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new (YahooFinance as any)();
const router = Router();

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
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await fetchStockQuote(symbol);
          return {
            symbol,
            price: quote.c,
            change: quote.dp,
          };
        } catch (err) {
          console.error(`Error loading market quote for ${symbol}:`, err);
          return {
            symbol,
            price: 0,
            change: 0,
          };
        }
      })
    );

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
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
  const timeframe = (req.query.timeframe as string) || "1M";
  
  // Tickers mapping
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

  const ticker = tickers[symbol] || `${symbol}.NS`;

  try {
    let historyPoints: { date: string; price: number }[] = [];
    const now = new Date();
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    if (timeframe.toUpperCase() === "1D") {
      // Intraday Chart - 30m interval for the past 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const chartResult = await (yahooFinance as any).chart(ticker, {
        period1: Math.floor(oneDayAgo.getTime() / 1000),
        interval: "30m",
      });

      if (chartResult && chartResult.quotes && chartResult.quotes.length > 0) {
        historyPoints = chartResult.quotes
          .filter((q: any) => q.close !== null && q.close !== undefined)
          .map((q: any) => {
            const date = new Date(q.date);
            const label = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
            return {
              date: label,
              price: parseFloat((q.close as number).toFixed(2)),
            };
          });
      }
    } else {
      // Historical chart - 1d interval
      let startDate = new Date();
      if (timeframe.toUpperCase() === "1W") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe.toUpperCase() === "1M") {
        startDate.setMonth(now.getMonth() - 1);
      } else if (timeframe.toUpperCase() === "1Y") {
        startDate.setFullYear(now.getFullYear() - 1);
      } else {
        startDate.setMonth(now.getMonth() - 1);
      }

      const chartResult = await (yahooFinance as any).chart(ticker, {
        period1: startDate,
        interval: "1d",
      });

      if (chartResult && chartResult.quotes && chartResult.quotes.length > 0) {
        historyPoints = chartResult.quotes
          .filter((h: any) => h.close !== null && h.close !== undefined)
          .map((h: any) => {
            const d = new Date(h.date);
            let label = `${d.getDate()} ${monthNames[d.getMonth()]}`;
            if (timeframe.toUpperCase() === "1W") {
              label = dayNames[d.getDay() % 7];
            } else if (timeframe.toUpperCase() === "1Y") {
              label = monthNames[d.getMonth()];
            }
            return {
              date: label,
              price: parseFloat((h.close as number).toFixed(2)),
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
    const mockHist = getMockHistory(symbol, timeframe);
    return res.json({
      success: true,
      symbol,
      timeframe,
      data: mockHist,
    });

  } catch (error: any) {
    console.warn(`⚠️ [Yahoo Finance History] Failed for ${symbol}: ${error.message}. Serving mock fallback.`);
    const mockHist = getMockHistory(symbol, timeframe);
    return res.json({
      success: true,
      symbol,
      timeframe,
      data: mockHist,
    });
  }
});

export default router;