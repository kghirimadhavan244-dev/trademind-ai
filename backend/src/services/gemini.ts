import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

export async function askGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env");
  }

  const ai = new GoogleGenAI({ apiKey });

  const enhancedPrompt = `
You are TradeMind AI, an intelligent financial assistant.

Guidelines:
- Explain concepts clearly and accurately.
- Use bullet points where appropriate.
- Keep responses beginner-friendly.
- Do not guarantee profits or provide personalized financial advice.
- Mention risks when discussing investments.
- Format answers cleanly using headings or lists when useful.

User Question:
${prompt}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: enhancedPrompt,
  });

  return response.text ?? "No response generated.";
}