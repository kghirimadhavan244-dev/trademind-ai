
import { Router } from "express";
import axios from "axios";

const router = Router();

const mockIndianNews = [
  {
    title: "RBI keeps repo rate unchanged at 6.5%, maintains 'withdrawal of accommodation' stance",
    description: "The Reserve Bank of India (RBI) Monetary Policy Committee (MPC) decided to keep the policy repo rate unchanged at 6.50% to align inflation with the 4% medium-term target.",
    url: "https://www.rbi.org.in",
    source: { name: "Reserve Bank of India" },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    title: "SEBI tightens derivatives trading rules to protect retail investors from F&O losses",
    description: "Market regulator SEBI has introduced fresh compliance guidelines and higher margin requirements for equity index derivatives (F&O) trading to curb speculative retail trading volumes.",
    url: "https://www.sebi.gov.in",
    source: { name: "SEBI Board" },
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    title: "Reliance Industries announces ₹25,000 Crore investment in solar panels and green hydrogen",
    description: "Reliance Industries Chairman Mukesh Ambani detailed the roadmap for their new energy giga-factory in Jamnagar, aiming to start production of green energy modules by next quarter.",
    url: "https://www.ril.com",
    source: { name: "Mint Business" },
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    title: "TCS bags $1.2 Billion IT infrastructure modernization contract from European retail giant",
    description: "Tata Consultancy Services (TCS) announced a multi-year partnership with a major European retailer to shift their legacy ERP systems to cloud and AI-driven automation systems.",
    url: "https://www.tcs.com",
    source: { name: "Economic Times" },
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    title: "IPO Market Boom: Four tech startups receive SEBI nod for initial public offerings in July",
    description: "The primary market in India is heating up as four consumer tech companies got approval from SEBI to float their public IPOs, looking to aggregate over ₹8,000 Crores in capital.",
    url: "https://www.moneycontrol.com",
    source: { name: "Moneycontrol" },
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    title: "HDFC Bank shares surge 3.5% after posting strong double-digit loan book growth in Q1",
    description: "India's largest private sector bank HDFC Bank reported a healthy growth in deposits and loans in its quarterly corporate update, boosting investor sentiment on banking indices.",
    url: "https://www.hdfcbank.com",
    source: { name: "Financial Express" },
    publishedAt: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    title: "Infosys raises FY27 revenue growth guidance on strong pipeline of generative AI projects",
    description: "Bengaluru-based IT bellwether Infosys revised its annual revenue guidance upwards as clients accelerate cloud migrations and commit to enterprise-level GenAI models.",
    url: "https://www.infosys.com",
    source: { name: "CNBC TV18" },
    publishedAt: new Date(Date.now() - 43200000).toISOString(),
  }
];

router.get("/", async (_req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      console.log("ℹ️ [News Fallback] NEWS_API_KEY not set. Serving Indian mock financial news.");
      return res.json({
        success: true,
        articles: mockIndianNews,
      });
    }

    // Try fetching India business news
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=in&category=business&pageSize=10&apiKey=${apiKey}`
    );

    if (response.data && response.data.articles && response.data.articles.length > 0) {
      return res.json({
        success: true,
        articles: response.data.articles,
      });
    }

    // Fall back if response is empty
    return res.json({
      success: true,
      articles: mockIndianNews,
    });
  } catch (error) {
    console.warn("⚠️ [News Fallback] Error loading external news. Serving Indian mock financial news:", (error as Error).message);
    return res.json({
      success: true,
      articles: mockIndianNews,
    });
  }
});

export default router;

