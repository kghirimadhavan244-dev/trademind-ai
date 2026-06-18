import { Router } from "express";
import prisma from "../lib/prisma";
import { askGemini } from "../services/gemini";

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

router.get("/:userId", async (req, res) => {
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
You are TradeMind AI, a virtual financial advisor.
Explain to a beginner named ${user.name} that their paper trading portfolio is currently empty (only has ₹${cash.toLocaleString("en-IN")} in cash).
Give them some beginner-friendly, educational guidance on how to get started. Specifically:
- Briefly mention 2-3 prominent Indian sectors (like IT, Banking, or Energy).
- Give them a quick tip on diversification.
- Remind them that paper trading is risk-free and a great place to practice.
Keep the response clear, structured, and under 250 words. End with a standard disclaimer.
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
You are TradeMind AI, a seasoned financial advisor.
Provide a portfolio analysis for a beginner investor named ${user.name}:

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

Format the output cleanly in markdown with headings, bold text, and bullet points. Do not provide specific buy/sell stock recommendations. End with a standard educational disclaimer.
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

export default router;
