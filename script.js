
let userInteracted = false;
document.addEventListener("click", () => { userInteracted = true; });

function playSound() {
  if (!userInteracted) return;
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  audio.play().catch(err => console.log("Sound error:", err));
}

function fetchAndRenderRace() {
  fetch("https://sever-cyc3.onrender.com/race-feed")
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        console.log("No race data received.");
        return;
      }
      renderRace(data);
    })
    .catch(err => {
      console.error("Race fetch error:", err);
    });
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

    const label = document.createElement("div");
    label.className = "race-label";
    const tvSymbol = `NASDAQ:${stock.ticker.toUpperCase()}`;
    label.innerHTML = `<a href="https://www.tradingview.com/chart/?symbol=${tvSymbol}" 
      target="_blank" rel="noopener noreferrer">${stock.ticker}</a> | ${stock.gain.toFixed(1)}% | $${pl}`;

    const bar = document.createElement("div");
    bar.className = "race-bar";
    bar.style.width = stock.gain + "%";

    if (index === 0) {
      label.style.animation = "glow 1.2s ease-in-out infinite alternate";
    }

    row.appendChild(label);
    row.appendChild(bar);
    raceTrack.appendChild(row);
  });

  const summary = document.createElement("div");
  summary.className = "total-gain";
  summary.innerText = `📈 Total Realized P/L: $${totalPL.toFixed(2)}`;
  raceTrack.appendChild(summary);

  playSound();
}

// Auto-refresh every 5 seconds
setInterval(fetchAndRenderRace, 5000);
document.addEventListener("DOMContentLoaded", fetchAndRenderRace);
