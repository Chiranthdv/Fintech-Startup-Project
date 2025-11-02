// import fs from "fs";
// import path from "path";

// const folderPath = path.join(process.cwd(), "stock_data");

// // ---- TEST PERIOD ----
// const TEST_START = "2025-01-01";
// const TEST_END = "2025-09-30";

// // ---- STRATEGY PARAMETERS ----
// const N = 20;  // shorter lookback to trigger trades easily
// const M = 5;   // 5% dip after new high
// const D = 10;  // wait max 10 days
// const X = 3;   // 3% trailing stop-loss
// const CAPITAL = 10000;

// function loadStock(symbol) {
//   const filePath = path.join(folderPath, `${symbol}.json`);
//   if (!fs.existsSync(filePath)) return [];
//   const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
//   const key = Object.keys(raw)[0];
//   const data = raw[key];
//   if (!Array.isArray(data)) return [];
//   return data.sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date));
// }

// function backtestOne(symbol, candles) {
//   let realized = 0, unrealized = 0;
//   let holding = false, buyPrice = 0, stopLoss = 0;

//   for (let i = 0; i < candles.length; i++) {
//     const { trade_date, close } = candles[i];
//     const date = new Date(trade_date);
//     if (isNaN(date)) continue;

//     const lookback = candles.slice(Math.max(0, i - N), i);
//     const pastHigh = lookback.length ? Math.max(...lookback.map(d => d.close)) : 0;
//     const hitHigh = close >= pastHigh && pastHigh > 0;

//     // --- Buy condition ---
//     if (hitHigh && !holding) {
//       const targetBuy = close * (1 - M / 100);
//       for (let j = i + 1; j < Math.min(i + D, candles.length); j++) {
//         const next = candles[j];
//         if (next.close <= targetBuy) {
//           buyPrice = next.close;
//           holding = true;
//           stopLoss = buyPrice * (1 - X / 100);
//           console.log(`🟢 ${symbol} BUY on ${next.trade_date} at ${buyPrice}`);
//           i = j;
//           break;
//         }
//       }
//     }

//     // --- Sell condition ---
//     if (holding) {
//       stopLoss = Math.max(stopLoss, close * (1 - X / 100)); // trailing
//       if (close <= stopLoss) {
//         const profit = ((close - buyPrice) / buyPrice) * CAPITAL;
//         realized += profit;
//         console.log(`🔴 ${symbol} SELL on ${trade_date} at ${close} | PnL=${profit.toFixed(2)}`);
//         holding = false;
//       } else if (trade_date === TEST_END) {
//         unrealized += ((close - buyPrice) / buyPrice) * CAPITAL;
//       }
//     }
//   }
//   return { realized, unrealized, total: realized + unrealized };
// }

// function runBacktest() {
//   const results = [];
//   const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
//   console.log(`Running backtest on ${files.length} stocks...\n`);

//   for (const file of files) {
//     const symbol = file.replace(".json", "");
//     const data = loadStock(symbol);
//     if (!data.length) continue;

//     const r = backtestOne(symbol, data);
//     results.push({ symbol, ...r });
//     console.log(`${symbol}: Total=${r.total.toFixed(2)} (Realized=${r.realized.toFixed(2)}, Unrealized=${r.unrealized.toFixed(2)})`);
//   }

//   fs.writeFileSync("monthly_backtest.json", JSON.stringify(results, null, 2));
//   console.log("\n✅ Backtest complete → monthly_backtest.json");
// }

// runBacktest();
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----- Command Line Params -----
const [,, startDateArg, endDateArg, symbolsArg, nArg, mArg, dArg] = process.argv;

const TEST_START = startDateArg || "2025-01-01";
const TEST_END = endDateArg || "2025-09-30";
const N = parseInt(nArg) || 20;  // lookback
const M = parseFloat(mArg) || 5; // % dip
const D = parseInt(dArg) || 10;  // hold days
const CAPITAL = 10000;

const folderPath = path.join(__dirname, "stock_data");

// ----- Load Stock Data -----
function loadStock(symbol) {
  const filePath = path.join(folderPath, `${symbol}.json`);
  if (!fs.existsSync(filePath)) return [];
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const key = Object.keys(raw)[0];
  const data = raw[key];
  if (!Array.isArray(data)) return [];
  return data.sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date));
}

// ----- Simplified Buy/Sell -----
function backtestOne(symbol, candles) {
  let realized = 0, unrealized = 0;
  let holding = false, buyPrice = 0, buyIndex = -1;

  for (let i = 0; i < candles.length; i++) {
    const { trade_date, close } = candles[i];
    const date = new Date(trade_date);
    if (date < new Date(TEST_START) || date > new Date(TEST_END)) continue;

    const lookback = candles.slice(Math.max(0, i - N), i);
    const pastHigh = lookback.length ? Math.max(...lookback.map(d => d.close)) : 0;

    // --- Buy condition ---
    if (!holding && close >= pastHigh && pastHigh > 0) {
      const targetBuy = close * (1 - M / 100);
      for (let j = i + 1; j < Math.min(i + D, candles.length); j++) {
        const next = candles[j];
        if (next.close <= targetBuy) {
          buyPrice = next.close;
          buyIndex = j;
          holding = true;
          console.log(`🟢 ${symbol} BUY on ${next.trade_date} at ${buyPrice}`);
          break;
        }
      }
    }

    // --- Sell condition ---
    if (holding && i >= buyIndex + D) {
      const sellPrice = close;
      const profit = ((sellPrice - buyPrice) / buyPrice) * CAPITAL;
      realized += profit;
      console.log(`🔴 ${symbol} SELL on ${trade_date} at ${sellPrice} | PnL=${profit.toFixed(2)}`);
      holding = false;
    }
  }

  // --- If still holding at end, count as unrealized ---
  if (holding) {
    const last = candles[candles.length - 1];
    const profit = ((last.close - buyPrice) / buyPrice) * CAPITAL;
    unrealized += profit;
    console.log(`💡 ${symbol} STILL HOLDING on ${last.trade_date} | Unrealized=${profit.toFixed(2)}`);
  }

  return { realized, unrealized, total: realized + unrealized };
}

// ----- Run for All Symbols -----
function runBacktest() {
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
  const symbols = symbolsArg ? symbolsArg.split(",") : files.map(f => f.replace(".json", ""));

  console.log(`\n📈 Running simplified backtest on ${symbols.length} stock(s)...`);
  const results = [];

  for (const symbol of symbols) {
    const data = loadStock(symbol);
    if (!data.length) {
      console.log(`⚠️ Skipping ${symbol} (no data)`);
      continue;
    }
    const result = backtestOne(symbol, data);
    results.push({ symbol, ...result });
    console.log(`${symbol}: Total=${result.total.toFixed(2)} | Realized=${result.realized.toFixed(2)} | Unrealized=${result.unrealized.toFixed(2)}\n`);
  }

  fs.writeFileSync("monthly_backtest.json", JSON.stringify(results, null, 2));
  console.log("✅ Backtest complete → monthly_backtest.json");
}

// ----- Run -----
runBacktest();
