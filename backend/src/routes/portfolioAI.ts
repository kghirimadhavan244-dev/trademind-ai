import { Router } from "express";
import prisma from "../lib/prisma";
import { askGemini } from "../services/gemini";
import { fetchStockQuote } from "../utils/marketService";

const router = Router();

// Sector mapping for Indian stocks
const stockSectors: Record<string, string> = {
  RELIANCE: "Conglomerate & Energy",
  TCS: "Information Technology",
  INFY: "Information Technology",
  WIPRO: "Information Technology",
  HDFCBANK: "Financial Services & Banking",
  ICICIBANK: "Financial Services & Banking",
  SBIN: "Financial Services & Banking",
  ITC: "FMCG & Conglomerate",
  LT: "Infrastructure & Engineering",
  BHARTIARTL: "Telecommunications",
};

// GET /api/portfolio-ai/:userId
router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const isBeginner = req.query.beginner === "true";

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cash: true, name: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const holdings = await prisma.holding.findMany({
      where: { userId },
    });

    const cash = user.cash;
    let portfolioValue = cash;
    const holdingsDetails = holdings.map((h) => {
      const value = h.quantity * h.buyPrice;
      portfolioValue += value;
      return {
        symbol: h.symbol,
        quantity: h.quantity,
        buyPrice: h.buyPrice,
        totalValue: value,
        sector: stockSectors[h.symbol] || "Other",
      };
    });

    if (holdings.length === 0) {
      const emptyPrompt = `
You are TradeMind AI, a patient educational financial advisor.
Explain to a beginner named ${user.name} that their paper trading portfolio is currently empty (only has ₹${cash.toLocaleString("en-IN")} in cash).
Give them some beginner-friendly, educational guidance on how to get started. Specifically:
- Briefly mention 2-3 prominent Indian sectors (like IT, Banking, or Energy).
- Give them a quick tip on diversification.
- Remind them that paper trading is risk-free and a great place to practice.
Keep the response clear, structured, and under 250 words. End with a standard educational disclaimer. Do not use any emojis in the content or headings.
`;
      const reply = await askGemini(emptyPrompt);
      return res.json({
        success: true,
        analysis: reply,
        summary: {
          cash,
          totalValue: cash,
          holdingsCount: 0,
        },
      });
    }

    // Construct prompt for Gemini
    const holdingsSummary = holdingsDetails
      .map(
        (h) =>
          `- ${h.symbol}: ${h.quantity} shares, Avg buy price ₹${h.buyPrice.toFixed(
            2
          )} (Total Value: ₹${h.totalValue.toFixed(2)}, Sector: ${h.sector})`
      )
      .join("\n");

    const analysisPrompt = `
You are TradeMind AI, a ${isBeginner ? "patient educational" : "seasoned analytical"} financial advisor.
Provide a portfolio analysis for ${isBeginner ? "a beginner investor" : "an experienced investor"} named ${user.name}:

Current Portfolio Metrics (in Indian Rupees - INR):
- Available Cash: ₹${cash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Total Portfolio Value: ₹${portfolioValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Stock Holdings:
${holdingsSummary}

Please analyze this portfolio across these areas:
1. **Asset Allocation**: Balance between Cash and Equities. (Are they holding too much cash or fully invested?)
2. **Sector Exposure**: Check if they are concentrated in a single sector (e.g., too much IT or Banking) or well-diversified.
3. **Diversification Score & Risks**: Give a subjective evaluation (e.g., High Concentration Risk, Balanced, Well Diversified) and explain why.
4. **Educational Suggestions**: Actionable, risk-aware steps they can take in this paper trading account to improve their portfolio health (e.g., adding sector X, rebalancing, dollar-cost averaging).

${
  isBeginner
    ? "Since the user is in Beginner Mode: Use simple, conversational language. Avoid complex financial jargon without explaining it immediately. Explain terms like diversification, volatility, or allocation if you use them. Make the tone friendly, accessible, and highly educational."
    : "Since the user is in Pro Mode: Use sophisticated professional financial terms, concise metrics, and deeper analytical depth. Skip elementary definitions."
}

Format the output cleanly in markdown with headings, bold text, and bullet points. Do not provide specific buy/sell stock recommendations. End with a standard educational disclaimer. Do not use any emojis in the headings or text.
`;

    const analysis = await askGemini(analysisPrompt);

    return res.json({
      success: true,
      analysis,
      summary: {
        cash,
        totalValue: portfolioValue,
        holdingsCount: holdings.length,
      },
    });
  } catch (error) {
    console.error("Error generating portfolio AI analysis:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI portfolio analysis.",
    });
  }
});

// GET /api/portfolio-ai/brief/:userId
router.get("/brief/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cash: true, name: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const holdings = await prisma.holding.findMany({
      where: { userId },
    });

    // Fetch Nifty 50 quote
    const niftyQuote = await fetchStockQuote("NIFTY50");
    const niftyChange = niftyQuote.dp || 0;

    let mood = "Neutral";
    if (niftyChange > 0.5) {
      mood = "Bullish";
    } else if (niftyChange < -0.5) {
      mood = "Bearish";
    }

    // Calculate portfolio metrics
    const totalHoldingsCost = holdings.reduce((sum, h) => sum + h.quantity * h.buyPrice, 0);
    
    // Fetch live prices for all owned symbols
    const holdingsWithCurrentQuotes = await Promise.all(
      holdings.map(async (h) => {
        try {
          const q = await fetchStockQuote(h.symbol);
          return {
            ...h,
            currentPrice: q.c || h.buyPrice,
          };
        } catch {
          return {
            ...h,
            currentPrice: h.buyPrice,
          };
        }
      })
    );

    const totalHoldingsValue = holdingsWithCurrentQuotes.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
    const totalPortfolioValue = user.cash + totalHoldingsValue;
    const netGainLoss = totalHoldingsValue - totalHoldingsCost;
    const netGainLossPercent = totalHoldingsCost > 0 ? (netGainLoss / totalHoldingsCost) * 100 : 0;

    const briefPrompt = `
You are TradeMind AI, a helpful virtual assistant.
Write a personalized 2-sentence market and portfolio briefing for the user ${user.name}.
Today, NIFTY 50 is changing by ${niftyChange.toFixed(2)}% (Market mood is ${mood}).
The user has a paper trading portfolio with a total value of ₹${totalPortfolioValue.toLocaleString("en-IN")} and their holdings' net performance is ${netGainLossPercent.toFixed(2)}%.
${
  holdings.length > 0
    ? `They currently hold shares in: ${holdings.map((h) => h.symbol).join(", ")}.`
    : "They currently have no active stock holdings and are keeping all capital in cash."
}

Instructions:
1. Provide a quick summary of the market direction and the user's portfolio.
2. Limit the briefing strictly to exactly 2 sentences.
3. DO NOT use any emojis.
4. Keep the tone helpful, encouraging, and professional.
`;

    const briefText = await askGemini(briefPrompt);

    return res.json({
      success: true,
      brief: briefText.trim(),
      marketMood: mood,
      niftyChange,
      niftyPrice: niftyQuote.c,
    });
  } catch (error) {
    console.error("Error generating daily AI brief:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate daily AI brief.",
    });
  }
});

// GET /api/portfolio-ai/notifications/:userId
router.get("/notifications/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const notifications = await prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
    });
    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
});

// POST /api/portfolio-ai/notifications/read/:userId
router.post("/notifications/read/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read.",
    });
  }
});

export default router;




