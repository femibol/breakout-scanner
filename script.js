
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

let userInteracted = false;

document.addEventListener("click", () => {
  userInteracted = true;
});

function playSound() {
  if (!userInteracted) return;
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  audio.play().catch(err => console.log("Blocked by browser:", err));
}

function toggleReplay() {
  const controls = document.getElementById("replay-controls");
  controls.style.display = controls.style.display === "none" ? "block" : "none";
}
