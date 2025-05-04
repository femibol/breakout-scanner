
const apiKey = "Gayp7WsTkSo7KKUXDC5QnoIQZr903eU5";
const tickers = ['FRGT', 'KIDZ', 'AAPL', 'MSFT', 'GOOGL'];

let userInteracted = false;
document.addEventListener("click", () => { userInteracted = true; });

function playSound() {
  if (!userInteracted) return;
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  audio.play().catch(err => console.log("Blocked by browser:", err));
}

function toggleReplay() {
  const controls = document.getElementById("replay-controls");
  controls.style.display = controls.style.display === "none" ? "block" : "none";
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    await delay(3000);
  }

  results.sort((a, b) => b.gain - a.gain);
  renderReplayRace(results);
}

function renderReplayRace(stocks) {
  const raceTrack = document.getElementById("race-track");
  raceTrack.innerHTML = "";
  stocks.forEach(stock => {
    const bar = document.createElement("div");
    const gainWidth = Math.min(stock.gain, 100);
    bar.style.width = "0%";
    bar.style.background = "#4caf50";
    bar.style.color = "#fff";
    bar.style.padding = "10px";
    bar.style.margin = "5px 0";
    bar.style.transition = "width 0.8s ease";
    bar.style.borderRadius = "5px";
    bar.innerText = `${stock.ticker} - Gain: ${stock.gain}% | Open: $${stock.open} → Close: $${stock.close}`;
    raceTrack.appendChild(bar);
    setTimeout(() => {
      bar.style.width = gainWidth + "%";
    }, 100);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  debug("Lite Replay Mode: 5 tickers with delay");
  fetchLastTradingDayGainers();
});
