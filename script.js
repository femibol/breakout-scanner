
let previousGains = {};
let userInteracted = false;
let currentMode = "live";
let replayList = [];
let replayIndex = 0;
let replayInterval = null;

document.addEventListener("click", () => { userInteracted = true; });

function playSound() {
  if (!userInteracted) return;
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  audio.play().catch(err => console.log("Sound error:", err));
}

function fetchReplayList() {
  fetch("https://sever-cyc3.onrender.com/replays")
    .then(res => res.json())
    .then(replays => {
      replayList = replays;
      const selector = document.getElementById("replay-selector");
      replays.forEach(ts => {
        const opt = document.createElement("option");
        opt.value = ts;
        opt.text = ts;
        selector.appendChild(opt);
      });
    });
}

function fetchAndRenderRace() {
  const url = currentMode === "live"
    ? "https://sever-cyc3.onrender.com/race-feed"
    : `https://sever-cyc3.onrender.com/replay/${currentMode}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) return;
      renderRace(data);
    })
    .catch(err => console.error("Race fetch error:", err));
}

function renderRace(data) {
  const raceTrack = document.getElementById("race-track");
  raceTrack.innerHTML = "";

  data.sort((a, b) => b.gain - a.gain);
  let totalPL = 0;

  data.forEach((stock, index) => {
    const entryPrice = stock.open;
    const shares = 5000;
    const pl = ((stock.close - entryPrice) * shares).toFixed(2);
    totalPL += parseFloat(pl);

    const row = document.createElement("div");
    row.className = "race-row";

    const tvSymbol = `NASDAQ:${stock.ticker.toUpperCase()}`;
    const label = document.createElement("div");
    label.className = "race-label";
    label.innerHTML = \`
      <span onmouseover="showChart('${tvSymbol}', this)" onmouseout="hideChart()">
        <a href="https://www.tradingview.com/chart/?symbol=${tvSymbol}" 
        target="_blank" rel="noopener noreferrer">${stock.ticker}</a>
      </span>
      | ${stock.gain.toFixed(1)}% | $${pl}
    \`;

    const bar = document.createElement("div");
    bar.className = "race-bar";
    bar.style.width = stock.gain + "%";

    const prev = previousGains[stock.ticker] ?? stock.gain;
    const delta = stock.gain - prev;
    previousGains[stock.ticker] = stock.gain;

    let bg = "linear-gradient(to right, #607d8b, #455a64)";
    if (delta > 0.2) bg = "linear-gradient(to right, #66bb6a, #43a047)";
    else if (delta < -0.2) bg = "linear-gradient(to right, #ef5350, #e53935)";
    bar.style.background = bg;

    if (index === 0) {
      label.style.animation = "glow 1.2s ease-in-out infinite alternate";
    }

    row.appendChild(label);
    row.appendChild(bar);
    raceTrack.appendChild(row);
  });

  const summary = document.createElement("div");
  summary.className = "total-gain";
  summary.innerText = \`📈 Total Realized P/L: $\${totalPL.toFixed(2)}\`;
  raceTrack.appendChild(summary);

  playSound();
}

function autoStepReplay() {
  if (!replayList.length) return;
  if (replayIndex >= replayList.length) replayIndex = 0;
  currentMode = replayList[replayIndex];
  document.getElementById("replay-selector").value = currentMode;
  fetchAndRenderRace();
  replayIndex++;
}

function showChart(symbol, element) {
  let popup = document.getElementById("chart-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "chart-popup";
    popup.style.position = "absolute";
    popup.style.zIndex = 1000;
    popup.style.width = "360px";
    popup.style.height = "300px";
    popup.style.border = "2px solid #333";
    popup.style.background = "#111";
    popup.style.boxShadow = "0 0 12px rgba(0,255,255,0.3)";
    popup.style.borderRadius = "8px";
    popup.style.overflow = "hidden";
    popup.style.pointerEvents = "none";
    document.body.appendChild(popup);
  }

  const rect = element.getBoundingClientRect();
  popup.style.left = rect.left + 20 + "px";
  popup.style.top = rect.top + 30 + "px";
  popup.innerHTML = \`
    <iframe src="https://www.tradingview.com/chart/?symbol=\${symbol}" 
      width="100%" height="100%" frameborder="0"></iframe>
  \`;
  popup.style.display = "block";
}

function hideChart() {
  const popup = document.getElementById("chart-popup");
  if (popup) popup.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  fetchReplayList();
  fetchAndRenderRace();

  setInterval(() => {
    if (currentMode === "live") fetchAndRenderRace();
  }, 5000);

  const selector = document.getElementById("replay-selector");
  selector.addEventListener("change", () => {
    currentMode = selector.value;
    if (currentMode === "live") {
      clearInterval(replayInterval);
      fetchAndRenderRace();
    } else {
      replayIndex = replayList.indexOf(currentMode);
      replayInterval = setInterval(autoStepReplay, 5000);
    }
  });
});
