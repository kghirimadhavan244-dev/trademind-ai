
import { Router } from "express";
import { fetchStockQuote } from "../utils/marketService";

const router = Router();

router.get("/:symbol", async (req, res) => {
  const inputSymbol = req.params.symbol.toUpperCase();
  try {
    const data = await fetchStockQuote(inputSymbol);
    return res.json({
      success: true,
      symbol: inputSymbol,
      data,
    });
  } catch (error) {
    console.error(`Error in search route for ${inputSymbol}:`, error);
    return res.status(550).json({
      success: false,
      message: "Unable to fetch stock.",
    });
  }
});

export default router;

