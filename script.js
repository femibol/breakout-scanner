let allStocks = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  setInterval(fetchData, 60000); // refresh every 60s
});

function fetchData() {
  fetch("https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=day_gainers&count=25")
    .then(res => res.json())
    .then(data => {
      const results = data.finance.result[0].quotes;
      allStocks = results.map(stock => ({
        ticker: stock.symbol,
        price: stock.regularMarketPrice || 0,
        gain: stock.regularMarketChangePercent?.toFixed(2) || 0,
        volume: stock.regularMarketVolume || 0,
        avgVol: stock.averageDailyVolume3Month || 1
      }));
      applyFilter();
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
  stocks.sort((a, b) => b.gain - a.gain).forEach(stock => {
    const bar = document.createElement("div");
    bar.textContent = `${stock.ticker} (${stock.gain}%)`;
    bar.style.width = `${Math.min(stock.gain, 100)}%`;
    raceTrack.appendChild(bar);
  });
}
