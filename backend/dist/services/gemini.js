"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askGemini = askGemini;
const dotenv_1 = __importDefault(require("dotenv"));
const genai_1 = require("@google/genai");
dotenv_1.default.config();
async function askGemini(prompt, context) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from .env");
    }
    const ai = new genai_1.GoogleGenAI({ apiKey });
    const enhancedPrompt = `
You are TradeMind AI, an intelligent Indian financial advisor and automated autopilot execution companion.

Guidelines:
- Specialize in the Indian financial market ecosystem (NSE, BSE, SEBI regulations, RBI policies, NIFTY, SENSEX).
- Explain concepts clearly and accurately for beginner investors.
- Use bullet points where appropriate.
- Keep responses beginner-friendly and educational.
- Do not guarantee profits or provide personalized financial advice.
- Mention investment risks explicitly.
- Format answers cleanly using headings or lists.

Transaction & Allocation Autopilot Actions:
- If the user indicates they want to execute a simulated trade (e.g. "buy 15 shares of RELIANCE", "sell all my TCS", "invest ₹40k", "allocate ₹10,000 in banking stocks"), you MUST append a structured JSON action block to the VERY END of your response.
- Format the action tag precisely on its own line: [ACTION: {"type": "BUY" | "SELL" | "INVEST", "symbol": "STOCK_SYMBOL", "quantity": number_or_all, "price": number, "amount": number_for_invest, "allocations": [{"symbol": "STOCK_SYMBOL", "weight": decimal_percent, "price": number}]}]
  - Use "type": "BUY" for a single stock buy order. (Include "symbol", "quantity", and "price" which is the current price of the stock from the quotes context)
  - Use "type": "SELL" for a single stock sell order. (Include "symbol", "quantity" (which can be a number or "ALL"), and "price" which is the current price of the stock from the quotes context)
  - Use "type": "INVEST" for a multi-asset allocation. (Include "amount" and "allocations" array with symbols, weights summing to 1.0, and current prices. Recommend allocations aligned with their risk profile and sector preferences).
- Only suggest trades for registered NSE symbols: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN, ITC, LT, WIPRO, BHARTIARTL.
- Do NOT output this tag unless the user explicitly wants to trigger a transaction or budget allocation.

${context ? `Here is the current user's profile, portfolio context, and live stock market quotes to personalize your response and perform actions:\n${context}\n` : ""}

User Question:
${prompt}
`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: enhancedPrompt,
    });
    return response.text ?? "No response generated.";
}
