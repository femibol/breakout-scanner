document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#scanner-table tbody");

  const sampleData = [
    { ticker: "FRGT", price: 0.98, gain: 35, volume: 32000000, avgVol: 8000000, float: "4M", sector: "Logistics" },
    { ticker: "KIDZ", price: 2.9, gain: 45, volume: 5000000, avgVol: 2000000, float: "5M", sector: "Education" },
    { ticker: "VRAX", price: 1.7, gain: 12, volume: 1500000, avgVol: 900000, float: "8M", sector: "Biotech" },
  ];

  sampleData.forEach(stock => {
    const relVol = (stock.volume / stock.avgVol).toFixed(2);
    const entry = (stock.price * 0.98).toFixed(2);
    const target1 = (entry * 1.05).toFixed(2);
    const target2 = (entry * 1.10).toFixed(2);
    const stop = (entry * 0.97).toFixed(2);

    let status = "Watching";
    if (stock.gain > 10 && relVol > 2) status = "Pre-Breakout";
    if (stock.gain > 20 && relVol > 3) status = "Breakout";

    const row = `
      <tr>
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
        <td>${stock.float}</td>
        <td>${stock.sector}</td>
        <td>${status}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
});
