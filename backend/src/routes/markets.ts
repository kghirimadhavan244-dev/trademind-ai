import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "FINNHUB_API_KEY is missing.",
      });
    }

    const symbols = ["AAPL", "MSFT", "GOOGL"];

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const response = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
        );

        return {
          symbol,
          price: response.data.c,
          change: response.data.dp,
        };
      })
    );

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch market data.",
    });
  }
});

export default router;