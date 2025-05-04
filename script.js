
const mockData = [
  { ticker: "FRGT", open: 1.23, close: 2.10, gain: 70.7 },
  { ticker: "KIDZ", open: 0.88, close: 1.44, gain: 63.6 },
  { ticker: "BBBYQ", open: 0.23, close: 0.36, gain: 56.5 },
  { ticker: "AMC", open: 3.50, close: 5.10, gain: 45.7 },
  { ticker: "PLTR", open: 10.00, close: 13.50, gain: 35.0 }
];

const barColors = ["#ffd700", "#c0c0c0", "#cd7f32", "#4caf50", "#2196f3"];

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

  mockData.forEach((stock, index) => {
    const entryPrice = stock.open;
    const shares = 5000;
    const pl = ((stock.close - entryPrice) * shares).toFixed(2);
    const bar = document.createElement("div");
    bar.className = "race-bar";
    bar.style.width = "0%";
    bar.style.background = barColors[index] || "#607d8b";
    bar.style.color = "#fff";
    bar.style.padding = "10px";
    bar.style.margin = "5px 0";
    bar.style.borderRadius = "5px";
    bar.style.transition = "width 1s ease";
    bar.innerText = `${stock.ticker} - Gain: ${stock.gain}% | P/L: $${pl}`;
    raceTrack.appendChild(bar);
    setTimeout(() => {
      bar.style.width = Math.min(stock.gain, 100) + "%";
    }, 200);
  });

  playSound();
}

document.addEventListener("DOMContentLoaded", () => {
  renderMockRace();
});
