
let allStocks = [];
let priceHistory = {};  // { "AAPL": [{time: epoch, price: 123.45}, ...] }
let top3Positions = {};
let snapshotLog = [];

const SNAPSHOT_INTERVAL = 5 * 60 * 1000; // 5 min
const SNAPSHOT_LIMIT = 24 * 60 / 5; // max 24h worth

document.addEventListener("DOMContentLoaded", () => {
  fetchLiveData();
  setInterval(fetchLiveData, 60000);
  setInterval(storeSnapshot, SNAPSHOT_INTERVAL);
  populateSnapshotDropdown();
});

function fetchLiveData() {
  const url = "https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=Gayp7WsTkSo7KKUXDC5QnoIQZr903eU5";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const timestamp = Date.now();
      allStocks = data.map(s => {
        if (!priceHistory[s.symbol]) priceHistory[s.symbol] = [];
        priceHistory[s.symbol].push({ time: timestamp, price: s.price });
        if (priceHistory[s.symbol].length > SNAPSHOT_LIMIT) {
          priceHistory[s.symbol].shift(); // keep history limited
        }
        return {
          ticker: s.symbol,
          price: s.price,
          open: s.open,
          gain: calcIntervalGain(s.symbol),
          volume: s.volume,
          avgVol: s.avgVolume || 1
        };
      });
      applyFilter();
    })
    .catch(err => console.error("Fetch error:", err));
}

function calcIntervalGain(ticker) {
  const interval = document.getElementById("intervalSelect").value;
  const now = Date.now();
  let pastTime = now;

  switch (interval) {
    case "15": pastTime -= 15 * 60 * 1000; break;
    case "30": pastTime -= 30 * 60 * 1000; break;
    case "60": pastTime -= 60 * 60 * 1000; break;
    default: return 0;
  }

  const history = priceHistory[ticker] || [];
  const pastPoint = history.find(p => p.time <= pastTime);
  if (!pastPoint) return 0;

  const change = ((priceHistory[ticker].slice(-1)[0].price - pastPoint.price) / pastPoint.price) * 100;
  return parseFloat(change.toFixed(2));
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
        shares: 5000
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

function storeSnapshot() {
  const snapshot = {
    time: new Date().toISOString(),
    data: allStocks.slice(0, 20)
  };
  snapshotLog.push(snapshot);
  localStorage.setItem("snapshots", JSON.stringify(snapshotLog));
  populateSnapshotDropdown();
}

function populateSnapshotDropdown() {
  const dropdown = document.getElementById("snapshotSelect");
  const saved = JSON.parse(localStorage.getItem("snapshots") || "[]");
  snapshotLog = saved;
  dropdown.innerHTML = "";
  saved.forEach((snap, idx) => {
    const option = document.createElement("option");
    option.value = idx;
    option.text = snap.time;
    dropdown.appendChild(option);
  });
}

function toggleReplay() {
  const panel = document.getElementById("replay-controls");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function playReplay() {
  const idx = document.getElementById("snapshotSelect").value;
  const snap = snapshotLog[idx];
  if (!snap) return;
  updateTable(snap.data);
  updateRace(snap.data);
}


function playReplay() {
  const idx = document.getElementById("snapshotSelect").value;
  const snap = snapshotLog[idx];
  if (!snap) return;

  let step = 0;
  const interval = setInterval(() => {
    if (step >= snapshotLog.length) {
      clearInterval(interval);
      return;
    }
    const snapStep = snapshotLog[step];
    updateTable(snapStep.data);
    updateRace(snapStep.data);
    step++;
  }, 5000); // 5 seconds per frame
}

function exportToCSV() {
  const saved = JSON.parse(localStorage.getItem("snapshots") || "[]");
  if (!saved.length) return alert("No snapshot data to export.");

  let csv = "Time,Ticker,Price,Change (%),Volume,AvgVolume\n";

  saved.forEach(snap => {
    const time = snap.time;
    snap.data.forEach(stock => {
      csv += `${time},${stock.ticker},${stock.price},${stock.gain},${stock.volume},${stock.avgVol}\n`;
    });
  });

  const blob = new Blob([csv], {{ type: 'text/csv;charset=utf-8;' }});
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "race_history.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
