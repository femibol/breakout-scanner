let allStocks = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchLiveData();
  setInterval(fetchLiveData, 60000);
});

function fetchLiveData() {
  const proxy = "https://corsproxy.io/?";
  const yahooUrl = "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=day_gainers&count=25";
  const fullUrl = proxy + encodeURIComponent(yahooUrl);

  fetch(fullUrl)
    .then(res => res.json())
    .then(data => {
      const results = data.finance?.result?.[0]?.quotes || [];
      if (results.length === 0) throw new Error("Empty results from Yahoo");

      allStocks = results.map(stock => ({
        ticker: stock.symbol,
        price: stock.regularMarketPrice || 0,
        gain: parseFloat(stock.regularMarketChangePercent?.toFixed(2)) || 0,
        volume: stock.regularMarketVolume || 0,
        avgVol: stock.averageDailyVolume3Month || 1
      }));
      applyFilter();
    })
    .catch(err => {
      console.error("Live data failed, loading fallback", err);
      loadMockData(); // fallback to working mock data
      applyFilter();
    });
}

function loadMockData() {
  allStocks = [
    { ticker: "FRGT", price: 0.98, gain: 35, volume: 32000000, avgVol: 8000000 },
    { ticker: "KIDZ", price: 2.9, gain: 45, volume: 5000000, avgVol: 2000000 },
    { ticker: "VRAX", price: 1.7, gain: 12, volume: 1500000, avgVol: 900000 },
    { ticker: "TOP", price: 4.4, gain: 28, volume: 8000000, avgVol: 3000000 },
    { ticker: "SNTI", price: 2.4, gain: 18, volume: 2600000, avgVol: 1200000 }
  ];
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
