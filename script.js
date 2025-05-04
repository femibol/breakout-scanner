
const apiKey = "Gayp7WsTkSo7KKUXDC5QnoIQZr903eU5";
const tickers = ["AAPL", "MSFT", "GOOGL", "FRGT", "KIDZ", "AMZN", "TSLA", "META", "NVDA", "PLTR", "BBAI", "LCID", "RIVN", "AI", "SOFI", "GME", "AMC", "TOP", "SNTI", "BBBYQ"];

document.addEventListener("DOMContentLoaded", () => {
  if (isMarketOpen()) {
    debug("Market is open. Fetching live top gainers...");
    fetchLiveTopGainers();
  } else {
    debug("Market is closed. Showing replay from last trading day...");
    fetchLastTradingDayGainers();
  }
});

function isMarketOpen() {
  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  return day >= 1 && day <= 5 && hour >= 13 && hour < 20;
}

async function fetchLiveTopGainers() {
  try {
    const res = await fetch(`https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${apiKey}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      const top20 = data.slice(0, 20).map(stock => ({
        ticker: stock.symbol,
        open: stock.open,
        close: stock.price,
        gain: parseFloat(stock.changesPercentage.replace("%", ""))
      }));
      renderReplayRace(top20);
    } else {
      debug("Live data response not in expected format.");
    }
  } catch (err) {
    debug("Error fetching live data: " + err);
  }
}

async function fetchLastTradingDayGainers() {
  const results = [];

  for (let i = 0; i < tickers.length; i++) {
    const symbol = tickers[i];
    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?serietype=line&timeseries=2&apikey=${apiKey}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const prices = json.historical;
      if (prices && prices.length >= 2) {
        const gain = ((prices[0].close - prices[1].close) / prices[1].close * 100).toFixed(2);
        results.push({
          ticker: symbol,
          open: prices[1].close,
          close: prices[0].close,
          gain: parseFloat(gain)
        });
      }
    } catch (err) {
      debug("Error fetching " + symbol + ": " + err);
    }
  }

  results.sort((a, b) => b.gain - a.gain);
  renderReplayRace(results.slice(0, 20));
}

function renderReplayRace(stocks) {
  const raceTrack = document.getElementById("race-track");
  raceTrack.innerHTML = "";
  stocks.forEach(stock => {
    const bar = document.createElement("div");
    const gainWidth = Math.min(stock.gain, 100);
    bar.style.width = gainWidth + "%";
    bar.style.background = "#28a745";
    bar.style.color = "#fff";
    bar.style.padding = "8px";
    bar.style.margin = "4px 0";
    bar.innerText = `${stock.ticker} - Gain: ${stock.gain}% | Open: $${stock.open} → Close: $${stock.close}`;
    raceTrack.appendChild(bar);
  });
}

function debug(message) {
  let debugBox = document.getElementById("debug-log");
  if (!debugBox) {
    debugBox = document.createElement("div");
    debugBox.id = "debug-log";
    debugBox.style.background = "#222";
    debugBox.style.color = "#0f0";
    debugBox.style.padding = "10px";
    debugBox.style.fontFamily = "monospace";
    debugBox.style.margin = "10px";
    debugBox.style.whiteSpace = "pre-wrap";
    document.body.insertBefore(debugBox, document.body.firstChild);
  }
  debugBox.innerText = message + "\n" + debugBox.innerText;
}


const top3Positions = {};
const leaderboard = {};
let currentTop3 = [];

document.addEventListener("click", () => {
  window.userHasClicked = true;
}, { once: true });

function playSound() {
  if (!window.userHasClicked) return;
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  audio.play().catch(e => console.log("Sound error:", e));
}

function toggleReplay() {
  const controls = document.getElementById("replay-controls");
  controls.style.display = controls.style.display === "none" ? "block" : "none";
}

function renderReplayRace(stocks) {
  const raceTrack = document.getElementById("race-track");
  raceTrack.innerHTML = "";
  stocks.sort((a, b) => b.gain - a.gain);

  const topNow = stocks.slice(0, 3).map(s => s.ticker);
  const newEntry = topNow.filter(t => !currentTop3.includes(t));
  currentTop3 = topNow;

  stocks.forEach((stock, index) => {
    if (!top3Positions[stock.ticker]) {
      top3Positions[stock.ticker] = {
        entryPrice: stock.open,
        shares: 5000
      };
    }

    if (!leaderboard[stock.ticker]) {
      leaderboard[stock.ticker] = {
        maxGain: stock.gain,
        maxPL: 0,
        timeTop3: 0
      };
    }

    if (index < 3) leaderboard[stock.ticker].timeTop3 += 1;
    if (stock.gain > leaderboard[stock.ticker].maxGain) leaderboard[stock.ticker].maxGain = stock.gain;

    const entry = top3Positions[stock.ticker].entryPrice;
    const shares = top3Positions[stock.ticker].shares;
    const profit = ((stock.close - entry) * shares).toFixed(2);
    if (parseFloat(profit) > leaderboard[stock.ticker].maxPL) leaderboard[stock.ticker].maxPL = parseFloat(profit);

    const bar = document.createElement("div");
    bar.className = "race-bar";
    bar.style.transition = "width 1s ease-out";
    bar.style.width = "0%";
    bar.style.background = "#28a745";
    bar.style.color = "#fff";
    bar.style.padding = "8px";
    bar.style.margin = "4px 0";
    bar.innerText = `${stock.ticker} - ${stock.gain}% | P/L: $${profit}`;

    raceTrack.appendChild(bar);
    setTimeout(() => {
      bar.style.width = Math.min(stock.gain, 100) + "%";
    }, 100);
  });

  if (newEntry.length > 0) {
    debug("New stock(s) entered Top 3: " + newEntry.join(", "));
    playSound();
  }
}
