import prisma from "../lib/prisma";
import { fetchStockQuote } from "../utils/marketService";
import { askGemini } from "./gemini";

const STOCKS = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "SBIN",
  "ITC",
  "LT",
  "WIPRO",
  "BHARTIARTL",
];

interface Signal {
  symbol: string;
  type: "BUY" | "SELL" | "HOLD";
  entry: number;
  target: number;
  stopLoss: number;
  confidence: number;
  reasoning: string;
}

const stockSectors: Record<string, string> = {
  RELIANCE: "Conglomerate & Energy",
  TCS: "IT Services",
  INFY: "IT Services",
  WIPRO: "IT Services",
  HDFCBANK: "Banking & Financials",
  ICICIBANK: "Banking & Financials",
  SBIN: "Banking & Financials",
  ITC: "FMCG",
  LT: "Infrastructure",
  BHARTIARTL: "Telecom",
};

// Generates daily trading signals
async function getSignals(): Promise<Signal[]> {
  const quotes: Record<string, any> = {};
  await Promise.all(
    STOCKS.map(async (symbol) => {
      try {
        const quote = await fetchStockQuote(symbol);
        quotes[symbol] = quote;
      } catch (err) {
        console.error(`Error loading quote for ${symbol} in Daemon:`, err);
      }
    })
  );

  const stockDataString = STOCKS.map((symbol) => {
    const q = quotes[symbol];
    if (!q) return `${symbol}: Data unavailable`;
    return `${symbol} - Price: ₹${q.c}, Daily Change: ${q.dp}%, High: ₹${q.h}, Low: ₹${q.l}`;
  }).join("\n");

  const prompt = `
You are TradeMind AI Autopilot, an automated quantitative scanning system for the Indian stock market.
Analyze the following stock market data for major NSE equities and output active trading signals.

For each stock, decide if the signal is "BUY" (positive momentum, value support), "SELL" (breakdown, overbought), or "HOLD" (consolidating).
Calculate appropriate Entry Price, Target Price, Stop Loss, and Confidence level (0-100%).
Provide a brief quantitative reasoning (e.g. key technical levels, EMA cross, RSI status) for each decision.

Here is the stock data:
${stockDataString}

You MUST reply ONLY with a valid, parsable JSON array of objects with the exact schema below, and NO other text, markdown formatting, or HTML tags.

Schema:
[
  {
    "symbol": "TCS",
    "type": "BUY",
    "entry": 4120.50,
    "target": 4250.00,
    "stopLoss": 4050.00,
    "confidence": 85,
    "reasoning": "Golden cross on 15m EMA with heavy buying volume near day low support."
  }
]
`;

  try {
    const responseText = await askGemini(prompt);
    let text = responseText.trim();
    if (text.startsWith("```")) {
      const firstNewLine = text.indexOf("\n");
      text = text.substring(firstNewLine + 1);
    }
    if (text.endsWith("```")) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();
    const signals: Signal[] = JSON.parse(text);
    if (Array.isArray(signals) && signals.length > 0) {
      return signals;
    }
  } catch (err) {
    console.warn("⚠️ [Autopilot Daemon] Gemini signals failed. Using algorithmic generator.", err);
  }

  // Fallback to algorithmic generator
  return STOCKS.map((symbol, idx) => {
    const quote = quotes[symbol] || { c: 1500, dp: 0.5 };
    const price = quote.c;
    const dp = quote.dp;
    let type: "BUY" | "SELL" | "HOLD" = "HOLD";

    if (dp > 1.2) {
      type = "BUY";
    } else if (dp < -1.2) {
      type = "SELL";
    } else {
      const rand = (idx + Math.floor(Math.random() * 10)) % 3;
      type = rand === 0 ? "BUY" : rand === 1 ? "SELL" : "HOLD";
    }

    const target = parseFloat((type === "BUY" ? price * 1.03 : price * 0.97).toFixed(2));
    const stopLoss = parseFloat((type === "BUY" ? price * 0.985 : price * 1.015).toFixed(2));

    return {
      symbol,
      type,
      entry: price,
      target,
      stopLoss,
      confidence: 60,
      reasoning: "Algorithmic trend following indicator.",
    };
  });
}

export function startAutopilotDaemon() {
  console.log("🤖 [Autopilot Daemon] Background scanning service started.");

  // Execute scan and trades every 30 seconds
  setInterval(async () => {
    try {
      // 1. Get all users who have autopilot enabled
      const users = await prisma.user.findMany({
        where: { autopilotEnabled: true },
      });

      if (users.length === 0) return;

      console.log(`🤖 [Autopilot Daemon] Running background trade check for ${users.length} user(s).`);

      // Get current market signals for this interval
      const signals = await getSignals();
      const activeSignals = signals.filter((s) => s.type !== "HOLD");

      for (const user of users) {
        try {
          const tpThreshold = user.autopilotTakeProfit;
          const slThreshold = user.autopilotStopLoss > 0 ? -user.autopilotStopLoss : user.autopilotStopLoss;
          const maxCapital = user.autopilotCapital;

          // A. Risk Management Engine (check TP/SL for user's existing holdings)
          const holdings = await prisma.holding.findMany({
            where: { userId: user.id },
          });

          for (const holding of holdings) {
            try {
              const quote = await fetchStockQuote(holding.symbol);
              if (quote && quote.c) {
                const currentPrice = quote.c;
                const yieldPct = ((currentPrice - holding.buyPrice) / holding.buyPrice) * 100;

                if (yieldPct >= tpThreshold || yieldPct <= slThreshold) {
                  const proceeds = holding.quantity * currentPrice;

                  // Liquidate
                  await prisma.holding.delete({
                    where: { id: holding.id },
                  });

                  await prisma.user.update({
                    where: { id: user.id },
                    data: { cash: { increment: proceeds } },
                  });

                  await prisma.transaction.create({
                    data: {
                      userId: user.id,
                      type: "SELL",
                      symbol: holding.symbol.toUpperCase(),
                      quantity: holding.quantity,
                      price: currentPrice,
                    },
                  });

                  const typeLabel = yieldPct >= tpThreshold ? "Take-Profit" : "Stop-Loss";
                  const msg = `[Autopilot] ${typeLabel} triggered for ${holding.symbol}. Sold ${holding.quantity} shares at ₹${currentPrice.toFixed(2)} (${yieldPct >= 0 ? "+" : ""}${yieldPct.toFixed(2)}%).`;

                  // Save persistent notification
                  await prisma.notification.create({
                    data: {
                      userId: user.id,
                      message: msg,
                    },
                  });
                  console.log(`🤖 [Autopilot Daemon] User ${user.id}: ${msg}`);
                }
              }
            } catch (err) {
              console.error(`Error checking holding ${holding.symbol} for user ${user.id}:`, err);
            }
          }

          // B. Execute new trades if active signals exist and user has cash
          if (activeSignals.length > 0) {
            const signal = activeSignals[Math.floor(Math.random() * activeSignals.length)];
            const { symbol, type, entry } = signal;

            const qty = 5 + Math.floor(Math.random() * 45);
            const price = Number(entry);
            const cost = qty * price;

            // Re-fetch user to get updated cash balance
            const freshUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { cash: true },
            });

            if (freshUser && type === "BUY" && freshUser.cash >= cost && cost <= maxCapital) {
              const existingHolding = await prisma.holding.findFirst({
                where: {
                  userId: user.id,
                  symbol: symbol.toUpperCase(),
                },
              });

              if (existingHolding) {
                const newQty = existingHolding.quantity + qty;
                const avgPrice = (existingHolding.buyPrice * existingHolding.quantity + price * qty) / newQty;

                await prisma.holding.update({
                  where: { id: existingHolding.id },
                  data: {
                    quantity: newQty,
                    buyPrice: avgPrice,
                  },
                });
              } else {
                await prisma.holding.create({
                  data: {
                    userId: user.id,
                    symbol: symbol.toUpperCase(),
                    quantity: qty,
                    buyPrice: price,
                  },
                });
              }

              // Update user cash balance
              await prisma.user.update({
                where: { id: user.id },
                data: { cash: { decrement: cost } },
              });

              // Create transaction log
              await prisma.transaction.create({
                data: {
                  userId: user.id,
                  type: "BUY",
                  symbol: symbol.toUpperCase(),
                  quantity: qty,
                  price,
                },
              });

              const msg = `[Autopilot] BUY: Purchased ${qty} shares of ${symbol} at ₹${price.toFixed(2)}.`;
              await prisma.notification.create({
                data: {
                  userId: user.id,
                  message: msg,
                },
              });
              console.log(`🤖 [Autopilot Daemon] User ${user.id}: ${msg}`);
            } else if (freshUser && type === "SELL") {
              const holding = await prisma.holding.findFirst({
                where: {
                  userId: user.id,
                  symbol: symbol.toUpperCase(),
                },
              });

              if (holding && holding.quantity > 0) {
                const sellQty = Math.min(holding.quantity, qty);
                const proceeds = sellQty * price;

                if (holding.quantity === sellQty) {
                  await prisma.holding.delete({
                    where: { id: holding.id },
                  });
                } else {
                  await prisma.holding.update({
                    where: { id: holding.id },
                    data: { quantity: { decrement: sellQty } },
                  });
                }

                // Update cash balance
                await prisma.user.update({
                  where: { id: user.id },
                  data: { cash: { increment: proceeds } },
                });

                // Create transaction log
                await prisma.transaction.create({
                  data: {
                    userId: user.id,
                    type: "SELL",
                    symbol: symbol.toUpperCase(),
                    quantity: sellQty,
                    price,
                  },
                });

                const msg = `[Autopilot] SELL: Liquidated ${sellQty} shares of ${symbol} at ₹${price.toFixed(2)}.`;
                await prisma.notification.create({
                  data: {
                    userId: user.id,
                    message: msg,
                  },
                });
                console.log(`🤖 [Autopilot Daemon] User ${user.id}: ${msg}`);
              }
            }
          }
        } catch (userErr) {
          console.error(`Error processing background autopilot for user ${user.id}:`, userErr);
        }
      }
    } catch (daemonErr) {
      console.error("Autopilot Daemon loop error:", daemonErr);
    }
  }, 30000);
}
