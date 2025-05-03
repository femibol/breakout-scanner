let allStocks = [];
let top3Positions = {};

document.addEventListener("DOMContentLoaded", () => {
  fetchLiveData();
  setInterval(fetchLiveData, 60000); // refresh every 60s
});

function fetchLiveData() {
  const url = "https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=Gayp7WsTkSo7KKUXDC5QnoIQZr903eU5";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) throw new Error("Empty or invalid response from FMP");
      allStocks = data.map(stock => {
        return {
          ticker: stock.symbol,
          price: stock.price || 0,
          gain: parseFloat(stock.changesPercentage?.replace('%', '')) || 0,
          volume: stock.volume || 1,
          avgVol: stock.avgVolume || 1
        };
      });
      applyFilter();
    })
    .catch(err => {
      console.error("FMP fetch error:", err);
    });
}

function applyFilter() {
  const min = parseFloat(document.getElementById("minPrice").value);
  const max = parseFloat(document.getElementById("maxPrice").value);
  const filtered = allStocks.filter(s => s.price >= min && s.price <= max);
  updateTable(filtered);
  updateRace(filtered);
}

function updateTable(stocks) {
  const tbody = document.querySelector("#scanner-table tbody");
  tbody.innerHTML = "";
  stocks.sort((a, b) => b.gain - a.gain).forEach((stock, index) => {
    const relVol = (stock.volume / stock.avgVol).toFixed(2);
    const entry = (stock.price * 0.98).toFixed(2);
    const target1 = (entry * 1.05).toFixed(2);
    const target2 = (entry * 1.1).toFixed(2);
    const stop = (entry * 0.97).toFixed(2);
    let status = "Watching";
    if (stock.gain > 10 && relVol > 2) status = "Pre-Breakout";
    if (stock.gain > 20 && relVol > 3) status = "Breakout";

    const tr = document.createElement("tr");
    tr.className = status.toLowerCase().replace(" ", "-");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${stock.ticker}</td>
      <td>$${stock.price.toFixed(2)}</td>
      <td>${stock.gain}%</td>
      <td>${stock.volume.toLocaleString()}</td>
      <td>${stock.avgVol.toLocaleString()}</td>
      <td>${relVol}</td>
      <td>$${entry}</td>
      <td>$${target1}</td>
      <td>$${target2}</td>
      <td>$${stop}</td>
      <td>${status}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateRace(stocks) {
  const raceTrack = document.getElementById("race-track");
  raceTrack.innerHTML = "";
  const top3 = stocks.sort((a, b) => b.gain - a.gain).slice(0, 3);

  top3.forEach(stock => {
    const bar = document.createElement("div");
    bar.classList.add("race-bar");
    const ticker = stock.ticker;

    if (!top3Positions[ticker]) {
      top3Positions[ticker] = {
        entryPrice: stock.price,
        shares: 5000,
        lastSeen: Date.now()
      };
    }

    const entry = top3Positions[ticker].entryPrice;
    const shares = top3Positions[ticker].shares;
    const profit = ((stock.price - entry) * shares).toFixed(2);

    bar.innerHTML = `
      <strong>${ticker}</strong> (${stock.gain}%) - 
      <span style='background:yellow; color:black; padding:2px 6px;'>$${profit} P/L</span>
    `;
    bar.style.width = `${Math.min(stock.gain, 100)}%`;
    raceTrack.appendChild(bar);
  });
}
