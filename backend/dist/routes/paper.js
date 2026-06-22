"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const mockData_1 = require("../utils/mockData");
const router = (0, express_1.Router)();
/**
 * Buy Stock
 */
router.post("/buy", async (req, res) => {
    try {
        const { userId, symbol, quantity, buyPrice } = req.body;
        if (!userId || !symbol || !quantity || !buyPrice) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields.",
            });
        }
        const qty = Number(quantity);
        const price = Number(buyPrice);
        const cost = qty * price;
        // Get user
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: Number(userId),
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        if (user.cash < cost) {
            return res.status(400).json({
                success: false,
                message: "Insufficient virtual balance.",
            });
        }
        // Check if holding already exists
        const existingHolding = await prisma_1.default.holding.findFirst({
            where: {
                userId: Number(userId),
                symbol: symbol.toUpperCase(),
            },
        });
        if (existingHolding) {
            const newQuantity = existingHolding.quantity + qty;
            const averagePrice = (existingHolding.buyPrice * existingHolding.quantity +
                price * qty) / newQuantity;
            await prisma_1.default.holding.update({
                where: {
                    id: existingHolding.id,
                },
                data: {
                    quantity: newQuantity,
                    buyPrice: averagePrice,
                },
            });
        }
        else {
            await prisma_1.default.holding.create({
                data: {
                    userId: Number(userId),
                    symbol: symbol.toUpperCase(),
                    quantity: qty,
                    buyPrice: price,
                },
            });
        }
        // Deduct virtual cash
        await prisma_1.default.user.update({
            where: {
                id: Number(userId),
            },
            data: {
                cash: {
                    decrement: cost,
                },
            },
        });
        // Save transaction history
        await prisma_1.default.transaction.create({
            data: {
                userId: Number(userId),
                type: "BUY",
                symbol: symbol.toUpperCase(),
                quantity: qty,
                price,
            },
        });
        return res.json({
            success: true,
            message: "Stock purchased successfully.",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to buy stock.",
        });
    }
});
/**
 * Sell Stock
 */
router.post("/sell", async (req, res) => {
    try {
        const { userId, symbol, quantity, sellPrice } = req.body;
        if (!userId || !symbol || !quantity || !sellPrice) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields.",
            });
        }
        const qty = Number(quantity);
        const price = Number(sellPrice);
        const holding = await prisma_1.default.holding.findFirst({
            where: {
                userId: Number(userId),
                symbol: symbol.toUpperCase(),
            },
        });
        if (!holding) {
            return res.status(404).json({
                success: false,
                message: "Holding not found.",
            });
        }
        if (holding.quantity < qty) {
            return res.status(400).json({
                success: false,
                message: "Not enough shares to sell.",
            });
        }
        const proceeds = qty * price;
        if (holding.quantity === qty) {
            await prisma_1.default.holding.delete({
                where: {
                    id: holding.id,
                },
            });
        }
        else {
            await prisma_1.default.holding.update({
                where: {
                    id: holding.id,
                },
                data: {
                    quantity: {
                        decrement: qty,
                    },
                },
            });
        }
        await prisma_1.default.user.update({
            where: {
                id: Number(userId),
            },
            data: {
                cash: {
                    increment: proceeds,
                },
            },
        });
        await prisma_1.default.transaction.create({
            data: {
                userId: Number(userId),
                type: "SELL",
                symbol: symbol.toUpperCase(),
                quantity: qty,
                price,
            },
        });
        res.json({
            success: true,
            message: "Stock sold successfully.",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to sell stock.",
        });
    }
});
/**
 * Get Portfolio
 */
router.get("/portfolio/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const holdings = await prisma_1.default.holding.findMany({
            where: {
                userId,
            },
            orderBy: {
                symbol: "asc",
            },
        });
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                cash: true,
            },
        });
        const holdingsWithCurrentPrice = holdings.map((h) => {
            const quote = (0, mockData_1.getMockQuote)(h.symbol);
            return {
                ...h,
                currentPrice: quote.c,
            };
        });
        return res.json({
            success: true,
            cash: user?.cash ?? 0,
            holdings: holdingsWithCurrentPrice,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to load portfolio.",
        });
    }
});
/**
 * Get Transaction History
 */
router.get("/transactions/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const transactions = await prisma_1.default.transaction.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json({
            success: true,
            transactions,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to load transactions.",
        });
    }
});
router.get("/summary/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        const holdings = await prisma_1.default.holding.findMany({
            where: { userId },
        });
        const holdingsWithCurrentPrice = holdings.map((h) => {
            const quote = (0, mockData_1.getMockQuote)(h.symbol);
            return {
                ...h,
                currentPrice: quote.c,
            };
        });
        const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.buyPrice, 0);
        const currentEquityValue = holdingsWithCurrentPrice.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
        const totalShares = holdings.reduce((sum, h) => sum + h.quantity, 0);
        res.json({
            success: true,
            cash: user?.cash ?? 0,
            holdings: holdingsWithCurrentPrice,
            totalInvested,
            currentEquityValue,
            totalShares,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to load portfolio summary.",
        });
    }
});
/**
 * Reset Paper Account
 */
router.post("/reset", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
        }
        // Reset user cash to 1,000,000
        await prisma_1.default.user.update({
            where: { id: Number(userId) },
            data: { cash: 1000000 },
        });
        // Delete all holdings for this user
        await prisma_1.default.holding.deleteMany({
            where: { userId: Number(userId) },
        });
        // Delete all transactions for this user
        await prisma_1.default.transaction.deleteMany({
            where: { userId: Number(userId) },
        });
        return res.json({
            success: true,
            message: "Paper trading account reset successfully. Cash set to ₹10,00,000.",
        });
    }
    catch (error) {
        console.error("Failed to reset paper account:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reset paper account.",
        });
    }
});
exports.default = router;
