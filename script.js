
const mockData = [
  { ticker: "FRGT", open: 1.23, close: 2.10, gain: 70.7 },
  { ticker: "KIDZ", open: 0.88, close: 1.44, gain: 63.6 },
  { ticker: "BBBYQ", open: 0.23, close: 0.36, gain: 56.5 },
  { ticker: "AMC", open: 3.50, close: 5.10, gain: 45.7 },
  { ticker: "PLTR", open: 10.00, close: 13.50, gain: 35.0 }
];

const barColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#4CAF50", "#2196F3"];

let userInteracted = false;
document.addEventListener("click", () => { userInteracted = true; });

function playSound() {
  if (!userInteracted) return;
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  audio.play().catch(err => console.log("Blocked by browser:", err));
}

function renderMockRace() {
  const raceTrack = document.getElementById("race-track");
  raceTrack.innerHTML = "";

  mockData.sort((a, b) => b.gain - a.gain);

  let totalPL = 0;

  mockData.forEach((stock, index) => {
    const entryPrice = stock.open;
    const shares = 5000;
    const pl = ((stock.close - entryPrice) * shares).toFixed(2);
    totalPL += parseFloat(pl);

    const bar = document.createElement("div");
    bar.setAttribute("style", `
      width: 0%;
      background-color: ${barColors[index] || "#607d8b"};
      color: #fff;
      padding: 10px;
      margin: 5px 0;
      border-radius: 5px;
      transition: width 1s ease;
      font-weight: bold;
      font-family: monospace;
    `);
    bar.innerText = `${stock.ticker} - Gain: ${stock.gain}% | P/L: $${pl}`;
    raceTrack.appendChild(bar);

    setTimeout(() => {
      bar.style.width = Math.min(stock.gain, 100) + "%";
    }, 100);
  });

  const summary = document.createElement("div");
  summary.setAttribute("style", `
    margin-top: 20px;
    color: #4fc3f7;
    font-weight: bold;
    font-size: 18px;
    font-family: sans-serif;
  `);
  summary.innerText = `📈 Total Gain Across All Positions: $${totalPL.toFixed(2)}`;
  raceTrack.appendChild(summary);

  playSound();
}

document.addEventListener("DOMContentLoaded", () => {
  renderMockRace();
});
