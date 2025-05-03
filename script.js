Let allStocks = [
  { ticker: "FRGT", price: 0.98, gain: 35, volume: 32000000, avgVol: 8000000 },
  { ticker: "KIDZ", price: 2.9, gain: 45, volume: 5000000, avgVol: 2000000 },
  { ticker: "VRAX", price: 1.7, gain: 12, volume: 1500000, avgVol: 900000 },
  { ticker: "TOP", price: 4.4, gain: 28, volume: 8000000, avgVol: 3000000 },
  { ticker: "SNTI", price: 2.4, gain: 18, volume: 2600000, avgVol: 1200000 },
  { ticker: "GME", price: 20.5, gain: 11.2, volume: 3400000, avgVol: 2000000 },
  { ticker: "AMC", price: 9.3, gain: 13.7, volume: 4200000, avgVol: 2800000 },
  { ticker: "AI", price: 28.9, gain: 14.1, volume: 3900000, avgVol: 3100000 },
  { ticker: "PLTR", price: 12.2, gain: 9.5, volume: 5300000, avgVol: 4600000 },
  { ticker: "BBAI", price: 1.85, gain: 22.6, volume: 1900000, avgVol: 1000000 },
  { ticker: "NVDA", price: 620.4, gain: 3.7, volume: 22000000, avgVol: 18000000 },
  { ticker: "TSLA", price: 178.5, gain: 5.9, volume: 31000000, avgVol: 25000000 },
  { ticker: "MSFT", price: 404.7, gain: 2.8, volume: 15000000, avgVol: 12000000 },
  { ticker: "AMZN", price: 185.6, gain: 4.3, volume: 18000000, avgVol: 16000000 },
  { ticker: "META", price: 480.2, gain: 2.1, volume: 14000000, avgVol: 10000000 },
  { ticker: "GOOG", price: 150.1, gain: 3.4, volume: 9000000, avgVol: 8800000 },
  { ticker: "SOFI", price: 6.9, gain: 7.1, volume: 7800000, avgVol: 5000000 },
  { ticker: "RIVN", price: 10.4, gain: 6.2, volume: 6100000, avgVol: 4500000 },
  { ticker: "LCID", price: 3.2, gain: 8.3, volume: 4600000, avgVol: 4200000 },
  { ticker: "BBBYQ", price: 0.33, gain: 15.2, volume: 990000, avgVol: 600000 }
];

document.addEventListener("DOMContentLoaded", () => {
  applyFilter();
});

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
