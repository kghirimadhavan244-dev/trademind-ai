"use strict";
// Simulated Indian stock market quotes and historical data
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockQuote = getMockQuote;
exports.getMockHistory = getMockHistory;
const basePrices = {
    RELIANCE: { o: 2450.50, pc: 2435.20 },
    TCS: { o: 3410.00, pc: 3425.80 },
    INFY: { o: 1545.00, pc: 1532.40 },
    HDFCBANK: { o: 1612.00, pc: 1624.10 },
    ICICIBANK: { o: 955.00, pc: 951.20 },
    SBIN: { o: 578.50, pc: 566.20 },
    ITC: { o: 442.00, pc: 441.10 },
    LT: { o: 2360.00, pc: 2380.00 },
    WIPRO: { o: 405.00, pc: 399.80 },
    BHARTIARTL: { o: 848.00, pc: 842.50 },
    // Indices
    NIFTY50: { o: 18820.00, pc: 18758.30 },
    SENSEX: { o: 63520.00, pc: 63312.40 },
    BANKNIFTY: { o: 43500.00, pc: 43210.50 },
};
// Cache current price offsets to maintain a continuous random walk
const activePrices = {};
function getMockQuote(symbol) {
    const cleanSymbol = symbol.toUpperCase()
        .replace(".NS", "")
        .replace(" ", "")
        .replace("^NSEI", "NIFTY50")
        .replace("^BSESN", "SENSEX")
        .replace("^NSEBANK", "BANKNIFTY");
    const base = basePrices[cleanSymbol] || { o: 100.00, pc: 100.00 };
    if (activePrices[cleanSymbol] === undefined) {
        activePrices[cleanSymbol] = base.o;
    }
    // Generate a random walk step (-0.15% to +0.15%)
    const percentageChange = (Math.random() - 0.49) * 0.003;
    activePrices[cleanSymbol] = activePrices[cleanSymbol] * (1 + percentageChange);
    const current = activePrices[cleanSymbol];
    const change = current - base.pc;
    const percentChange = (change / base.pc) * 100;
    const h = Math.max(base.o * 1.015, current);
    const l = Math.min(base.o * 0.985, current);
    return {
        c: parseFloat(current.toFixed(2)),
        d: parseFloat(change.toFixed(2)),
        dp: parseFloat(percentChange.toFixed(2)),
        h: parseFloat(h.toFixed(2)),
        l: parseFloat(l.toFixed(2)),
        o: base.o,
        pc: base.pc,
        t: Math.floor(Date.now() / 1000),
    };
}
function getMockHistory(symbol, timeframe) {
    const quote = getMockQuote(symbol);
    const currentPrice = quote.c;
    let pointsCount = 30;
    let labelFormat = "Day";
    let drift = 0.0002; // general upwards drift
    switch (timeframe.toUpperCase()) {
        case "1D":
            pointsCount = 24; // 24 hours
            labelFormat = "Hour";
            drift = 0.00005;
            break;
        case "1W":
            pointsCount = 7; // 7 days
            labelFormat = "Day";
            drift = 0.0005;
            break;
        case "1M":
            pointsCount = 30; // 30 days
            labelFormat = "Day";
            drift = 0.0002;
            break;
        case "1Y":
            pointsCount = 12; // 12 months
            labelFormat = "Month";
            drift = 0.001;
            break;
    }
    const result = [];
    let priceTracker = currentPrice;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < pointsCount; i++) {
        let dateLabel = `${labelFormat} ${pointsCount - i}`;
        if (labelFormat === "Month") {
            const d = new Date();
            d.setMonth(d.getMonth() - (pointsCount - i - 1));
            dateLabel = monthNames[d.getMonth()];
        }
        else if (labelFormat === "Hour") {
            const hr = (9 + i) % 24; // start at 9:00 AM trading session
            dateLabel = `${hr.toString().padStart(2, "0")}:00`;
        }
        else if (labelFormat === "Day" && pointsCount === 7) {
            const d = new Date();
            d.setDate(d.getDate() - (pointsCount - i - 1));
            dateLabel = dayNames[d.getDay() % 7];
        }
        else if (labelFormat === "Day") {
            const d = new Date();
            d.setDate(d.getDate() - (pointsCount - i - 1));
            dateLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;
        }
        result.push({
            date: dateLabel,
            price: parseFloat(priceTracker.toFixed(2)),
        });
        // Walk backwards - subtract drift, add random walk
        const change = (Math.random() - 0.5) * 0.015 - drift;
        priceTracker = priceTracker * (1 + change);
    }
    // Reverse so chronological order is maintained (past to present)
    return result;
}
