"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketService_1 = require("../utils/marketService");
const router = (0, express_1.Router)();
router.get("/:symbol", async (req, res) => {
    const inputSymbol = req.params.symbol.toUpperCase();
    try {
        const data = await (0, marketService_1.fetchStockQuote)(inputSymbol);
        return res.json({
            success: true,
            symbol: inputSymbol,
            data,
        });
    }
    catch (error) {
        console.error(`Error in search route for ${inputSymbol}:`, error);
        return res.status(550).json({
            success: false,
            message: "Unable to fetch stock.",
        });
    }
});
exports.default = router;
