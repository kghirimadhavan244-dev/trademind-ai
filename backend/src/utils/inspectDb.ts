import prisma from "../lib/prisma";
import { fetchStockQuote } from "./marketService";

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("=== USERS ===");
    for (const u of users) {
      console.log(`ID: ${u.id}, Name: ${u.name}, Cash: ₹${u.cash}`);
    }

    const holdings = await prisma.holding.findMany();
    console.log("\n=== HOLDINGS ===");
    for (const h of holdings) {
      const quote = await fetchStockQuote(h.symbol);
      const currentPrice = quote.c;
      const yieldPct = ((currentPrice - h.buyPrice) / h.buyPrice) * 100;
      console.log(`User ID: ${h.userId}, Symbol: ${h.symbol}, Qty: ${h.quantity}, Buy Price: ₹${h.buyPrice}, Current Yahoo Price: ₹${currentPrice}, Yield: ${yieldPct.toFixed(2)}%`);
    }

    const transactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" }
    });
    console.log("\n=== LAST 10 TRANSACTIONS ===");
    for (const t of transactions) {
      console.log(`[${t.createdAt.toISOString()}] User ID: ${t.userId}, ${t.type} ${t.quantity} ${t.symbol} @ ₹${t.price}`);
    }

  } catch (error) {
    console.error("Error inspecting database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
