import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const apiKey = process.env.FINNHUB_API_KEY;

    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    );

    res.json({
      success: true,
      symbol,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch stock.",
    });
  }
});

export default router;