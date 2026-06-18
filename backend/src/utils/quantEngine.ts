export interface ChartQuote {
  date: Date;
  close: number;
}

export interface TradeLog {
  type: "BUY" | "SELL";
  date: string;
  price: number;
  profitPercent?: number;
}

export interface BacktestResult {
  trades: TradeLog[];
  metrics: {
    totalReturn: number;
    buyAndHoldReturn: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
    maxDrawdown: number;
  };
  chartData: {
    date: string;
    strategyReturn: number;
    stockReturn: number;
  }[];
}

// EMA calculator
export function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  const ema: number[] = [];
  
  let prevEma = data[0];
  ema.push(prevEma);
  
  for (let i = 1; i < data.length; i++) {
    const currentEma = data[i] * k + prevEma * (1 - k);
    ema.push(currentEma);
    prevEma = currentEma;
  }
  return ema;
}

// RSI calculator
export function calculateRSI(data: number[], period: number = 14): number[] {
  if (data.length < period) {
    return new Array(data.length).fill(50);
  }
  
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = 0; i < period; i++) {
    rsi.push(50);
  }
  
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs));
  
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? -diff : 0;
    
    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs));
  }
  
  return rsi;
}

// Backtest simulator
export function runBacktest(
  quotes: ChartQuote[],
  strategyType: "EMA" | "RSI" | "MOMENTUM"
): BacktestResult {
  if (quotes.length < 15) {
    throw new Error("Insufficient historical data points for backtesting (minimum 15 required).");
  }

  const prices = quotes.map(q => q.close);
  const dates = quotes.map(q => {
    const d = new Date(q.date);
    return `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`;
  });

  const trades: TradeLog[] = [];
  let cash = 1000000; // Starting virtual balance
  let shares = 0;
  let lastBuyPrice = 0;

  // Track daily portfolio value changes for the chart
  const portfolioValues: number[] = [];
  const stockValues: number[] = [];
  const startPrice = prices[0];
  const initialShares = 1000000 / startPrice;

  // Technical analysis indicator arrays
  const ema50 = calculateEMA(prices, 10); // shorter period for responsiveness in mock/chart data
  const ema200 = calculateEMA(prices, 30);
  const rsi = calculateRSI(prices, 14);

  // Simulation loop
  for (let i = 0; i < quotes.length; i++) {
    const price = prices[i];
    const date = dates[i];

    let triggerBuy = false;
    let triggerSell = false;

    if (strategyType === "EMA") {
      // EMA Golden/Death Cross trigger
      if (i > 1 && ema50[i] > ema200[i] && ema50[i - 1] <= ema200[i - 1]) {
        triggerBuy = true;
      } else if (i > 1 && ema50[i] < ema200[i] && ema50[i - 1] >= ema200[i - 1]) {
        triggerSell = true;
      }
    } else if (strategyType === "RSI") {
      // Oversold buy / Overbought sell
      if (rsi[i] < 30) {
        triggerBuy = true;
      } else if (rsi[i] > 70) {
        triggerSell = true;
      }
    } else {
      // Momentum Breakout (Closing price > 5-day high with trailing stop loss)
      const lookback = 5;
      if (i > lookback) {
        const slice = prices.slice(i - lookback, i);
        const maxPrev = Math.max(...slice);
        if (price > maxPrev) {
          triggerBuy = true;
        } else if (shares > 0 && price < lastBuyPrice * 0.95) { // 5% trailing stop-loss
          triggerSell = true;
        }
      }
    }

    // Execute trades
    if (triggerBuy && cash > 0) {
      shares = cash / price;
      cash = 0;
      lastBuyPrice = price;
      trades.push({ type: "BUY", date, price });
    } else if (triggerSell && shares > 0) {
      const revenue = shares * price;
      const profitPercent = ((price - lastBuyPrice) / lastBuyPrice) * 100;
      cash = revenue;
      shares = 0;
      trades.push({ type: "SELL", date, price, profitPercent });
    }

    // Record daily values
    const currentStratValue = cash + shares * price;
    const currentStockValue = initialShares * price;
    portfolioValues.push(currentStratValue);
    stockValues.push(currentStockValue);
  }

  // Close any outstanding position at the end of the period
  if (shares > 0) {
    const finalPrice = prices[prices.length - 1];
    const revenue = shares * finalPrice;
    const profitPercent = ((finalPrice - lastBuyPrice) / lastBuyPrice) * 100;
    cash = revenue;
    shares = 0;
    trades.push({ type: "SELL", date: dates[dates.length - 1], price: finalPrice, profitPercent });
  }

  // Calculate Metrics
  const totalReturn = ((cash - 1000000) / 1000000) * 100;
  const buyAndHoldReturn = ((prices[prices.length - 1] - startPrice) / startPrice) * 100;

  const sellTrades = trades.filter(t => t.type === "SELL");
  const winCount = sellTrades.filter(t => (t.profitPercent ?? 0) > 0).length;
  const winRate = sellTrades.length > 0 ? (winCount / sellTrades.length) * 100 : 0;

  // Profit Factor & Drawdown
  let grossProfits = 0;
  let grossLosses = 0;
  sellTrades.forEach(t => {
    const pPercent = t.profitPercent ?? 0;
    const amount = 1000000 * (pPercent / 100);
    if (amount > 0) {
      grossProfits += amount;
    } else {
      grossLosses -= amount;
    }
  });
  const profitFactor = grossLosses === 0 ? (grossProfits > 0 ? 99.9 : 1.0) : grossProfits / grossLosses;

  // Max Drawdown estimation
  let peak = 1000000;
  let maxDrawdown = 0;
  for (let i = 0; i < portfolioValues.length; i++) {
    const val = portfolioValues[i];
    if (val > peak) peak = val;
    const dd = ((peak - val) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // Sample chart data to ~15-20 points for smooth plotting
  const sampleInterval = Math.max(1, Math.floor(quotes.length / 15));
  const chartData = [];
  for (let i = 0; i < quotes.length; i += sampleInterval) {
    const date = dates[i];
    const stratRet = ((portfolioValues[i] - 1000000) / 1000000) * 100;
    const stockRet = ((stockValues[i] - 1000000) / 1000000) * 100;
    chartData.push({
      date,
      strategyReturn: parseFloat(stratRet.toFixed(2)),
      stockReturn: parseFloat(stockRet.toFixed(2)),
    });
  }

  // Ensure last point is always in the chart
  const lastIndex = quotes.length - 1;
  const finalStratRet = ((portfolioValues[lastIndex] - 1000000) / 1000000) * 100;
  const finalStockRet = ((stockValues[lastIndex] - 1000000) / 1000000) * 100;
  chartData.push({
    date: dates[lastIndex],
    strategyReturn: parseFloat(finalStratRet.toFixed(2)),
    stockReturn: parseFloat(finalStockRet.toFixed(2)),
  });

  return {
    trades: trades.reverse(), // latest trades first
    metrics: {
      totalReturn: parseFloat(totalReturn.toFixed(2)),
      buyAndHoldReturn: parseFloat(buyAndHoldReturn.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(2)),
      totalTrades: trades.length,
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    },
    chartData,
  };
}
