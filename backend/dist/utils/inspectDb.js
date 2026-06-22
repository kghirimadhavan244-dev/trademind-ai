"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const marketService_1 = require("./marketService");
async function main() {
    try {
        const users = await prisma_1.default.user.findMany();
        console.log("=== USERS ===");
        for (const u of users) {
            console.log(`ID: ${u.id}, Name: ${u.name}, Cash: ₹${u.cash}`);
        }
        const holdings = await prisma_1.default.holding.findMany();
        console.log("\n=== HOLDINGS ===");
        for (const h of holdings) {
            const quote = await (0, marketService_1.fetchStockQuote)(h.symbol);
            const currentPrice = quote.c;
            const yieldPct = ((currentPrice - h.buyPrice) / h.buyPrice) * 100;
            console.log(`User ID: ${h.userId}, Symbol: ${h.symbol}, Qty: ${h.quantity}, Buy Price: ₹${h.buyPrice}, Current Yahoo Price: ₹${currentPrice}, Yield: ${yieldPct.toFixed(2)}%`);
        }
        const transactions = await prisma_1.default.transaction.findMany({
            take: 10,
            orderBy: { createdAt: "desc" }
        });
        console.log("\n=== LAST 10 TRANSACTIONS ===");
        for (const t of transactions) {
            console.log(`[${t.createdAt.toISOString()}] User ID: ${t.userId}, ${t.type} ${t.quantity} ${t.symbol} @ ₹${t.price}`);
        }
    }
    catch (error) {
        console.error("Error inspecting database:", error);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
main();
