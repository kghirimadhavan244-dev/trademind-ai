
import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

// Add stock to watchlist
router.post("/add", async (req, res) => {
  try {
    const { userId, symbol } = req.body;

    const exists = await prisma.watchlist.findFirst({
      where: {
        userId: Number(userId),
        symbol: symbol.toUpperCase(),
      },
    });

    if (exists) {
      return res.json({
        success: true,
        message: "Already in watchlist.",
      });
    }

    await prisma.watchlist.create({
      data: {
        userId: Number(userId),
        symbol: symbol.toUpperCase(),
      },
    });

    res.json({
      success: true,
      message: "Added to watchlist.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add watchlist item.",
    });
  }
});

// Get watchlist
router.get("/:userId", async (req, res) => {
  try {
    const items = await prisma.watchlist.findMany({
      where: {
        userId: Number(req.params.userId),
      },
    });

    res.json({
      success: true,
      items,
    });
  } catch {
    res.status(500).json({
      success: false,
    });
  }
});

// Remove from watchlist
router.delete("/:id", async (req, res) => {
  try {
    await prisma.watchlist.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      success: true,
    });
  } catch {
    res.status(500).json({
      success: false,
    });
  }
});

export default router;

