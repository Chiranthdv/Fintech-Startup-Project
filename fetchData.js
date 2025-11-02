// import axios from "axios";
// import fs from "fs";
// import path from "path";

// const URL = "https://dipsip.co/api/market/candlesDaily";

// const folderPath = path.join(process.cwd(), "stock_data");
// if (!fs.existsSync(folderPath)) {
//   fs.mkdirSync(folderPath);
// }
// const fromDate = "2024-01-01";
// const toDate = "2025-10-31";
// const symbols = [
//   "BAJFINANCE", "BHARTIARTL", "ITC", "NTPC", "NESTLEIND", "ONGC",
//   "TATASTEEL", "ADANIENT", "APOLLOHOSP", "ASIANPAINT", "BEL",
//   "CIPLA", "SHRIRAMFIN", "SBIN", "TATAMOTORS", "TECHM", "TITAN",
//   "TRENT", "ULTRACEMCO", "WIPRO", "GRASIM", "HCLTECH", "HDFCBANK",
//   "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "ICICIBANK", "INFY", "JSWSTEEL",
//   "LT", "M&M", "MARUTI", "POWERGRID", "RELIANCE", "AXISBANK", "DRREDDY"
// ];
// const nseSymbols = symbols.map(sym => sym + ".NS");
// async function fetchData(symbol) {
//   const payload = {
//     symbols: [symbol],
//     fromDate,
//     toDate
//   };
//   try {
//     const response = await axios.post(URL, payload);
//     const data = response.data;
//     const fileName = path.join(folderPath, `${symbol.replace(".NS", "")}.json`);
//     fs.writeFileSync(fileName, JSON.stringify(data, null, 2));

//     console.log(`✅ Saved data for ${symbol}`);
//   } catch (error) {
//     console.error(`Error fetching ${symbol}:`, error.message);
//   }
// }
// async function main() {
//   console.log("Starting download...");
//   for (const symbol of nseSymbols) {
//     await fetchData(symbol);
//   }
//   console.log("\n✅ All downloads completed!");
// }

// main();

// DownloadData.js
import axios from "axios";
import fs from "fs";
import path from "path";

const URL = "https://dipsip.co/api/market/candlesDaily";

// Folder to store JSON data
const folderPath = path.join(process.cwd(), "stock_data");
if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

// Date range
const fromDate = "2024-01-01";
const toDate = "2025-10-31";

// Symbols list
const symbols = [
  "BAJFINANCE", "BHARTIARTL", "ITC", "NTPC", "NESTLEIND", "ONGC",
  "TATASTEEL", "ADANIENT", "APOLLOHOSP", "ASIANPAINT", "BEL",
  "CIPLA", "SHRIRAMFIN", "SBIN", "TATAMOTORS", "TECHM", "TITAN",
  "TRENT", "ULTRACEMCO", "WIPRO", "GRASIM", "HCLTECH", "HDFCBANK",
  "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "ICICIBANK", "INFY", "JSWSTEEL",
  "LT", "M&M", "MARUTI", "POWERGRID", "RELIANCE", "AXISBANK", "DRREDDY"
];

const nseSymbols = symbols.map(sym => sym + ".NS");

async function fetchData(symbol) {
  const payload = {
    symbols: [symbol],
    fromDate,
    toDate,
  };

  try {
    const response = await axios.post(URL, payload);
    const data = response.data;

    // Save file
    const fileName = path.join(folderPath, `${symbol.replace(".NS", "")}.json`);
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    console.log(`✅ Saved data for ${symbol}`);
  } catch (error) {
    console.error(`❌ Error fetching ${symbol}:`, error.message);
  }
}

async function main() {
  console.log("🚀 Starting data download...");
  for (const symbol of nseSymbols) {
    await fetchData(symbol);
  }
  console.log("\n✅ All downloads completed!");
}

main();
