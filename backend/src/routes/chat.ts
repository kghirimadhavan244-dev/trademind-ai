import { Router } from "express";
import { askGemini } from "../services/gemini";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required.",
      });
    }
    console.log("📩 Prompt received:", prompt);
    const reply = await askGemini(prompt);
    console.log("🤖 Gemini reply:", reply);

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI response.",
    });
  }
});

export default router;