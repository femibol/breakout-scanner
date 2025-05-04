
const mockData = [
  { ticker: "FRGT", open: 1.23, close: 2.10, gain: 70.7 },
  { ticker: "KIDZ", open: 0.88, close: 1.44, gain: 63.6 },
  { ticker: "BBBYQ", open: 0.23, close: 0.36, gain: 56.5 },
  { ticker: "AMC", open: 3.50, close: 5.10, gain: 45.7 },
  { ticker: "PLTR", open: 10.00, close: 13.50, gain: 35.0 }
];

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

    const row = document.createElement("div");
    row.setAttribute("style", `
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      background-color: #1f1f1f;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0 4px rgba(0,0,0,0.5);
    `);

    const label = document.createElement("div");
    label.innerHTML = \`<a href="https://www.tradingview.com/symbols/\${stock.ticker}/" target="_blank" rel="noopener noreferrer" style="
      color: #4fc3f7;
      text-decoration: none;
      font-weight: bold;
    ">\${stock.ticker}</a> | \${stock.gain}% | \$\${pl}\`;

    label.setAttribute("style", `
      width: 160px;
      padding: 10px;
      font-weight: 600;
      font-family: monospace;
      font-size: 14px;
      color: #cfcfcf;
      background: #2c2c2c;
    `);

    const bar = document.createElement("div");
    bar.textContent = "";
    bar.setAttribute("style", `
      width: 0%;
      height: 32px;
      background: linear-gradient(90deg, #66bb6a, #42a5f5);
      transition: width 1s ease;
    `);

    row.appendChild(label);
    row.appendChild(bar);
    raceTrack.appendChild(row);

    setTimeout(() => {
      bar.style.width = Math.min(stock.gain, 100) + "%";
    }, 100);
  });

  const summary = document.createElement("div");
  summary.setAttribute("style", `
    margin-top: 25px;
    background: #292929;
    padding: 10px 20px;
    font-size: 18px;
    font-family: sans-serif;
    color: #8de88d;
    font-weight: bold;
    border-radius: 6px;
    box-shadow: 0 0 6px #4caf50;
  `);
  summary.innerText = \`📈 Total Realized P/L: \$\${totalPL.toFixed(2)}\`;
  raceTrack.appendChild(summary);

  playSound();
}

document.addEventListener("DOMContentLoaded", () => {
  renderMockRace();
});
