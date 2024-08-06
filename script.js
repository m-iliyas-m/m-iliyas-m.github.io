const data = [
    ["GOLD", "05AUG2024", 68318.00, 68380.00, 68336.00, 68.00, 0.10, 68500.00, 68153.00, 68273.00, 68268.00],
    ["SILVER", "05SEP2024", 81497.00, 81514.00, 81516.00, 229.00, 0.28, 81920.00, 81290.00, 81421.00, 81327.00],
    ["SILVERM", "30AUG2024", 81577.00, 81585.00, 81586.00, 209.00, 0.26, 81880.00, 81407.00, 81441.00, 81377.00],
    ["NATURALGAS", "27AUG2024", 168.80, 168.90, 168.90, -4.00, -2.31, 174.80, 167.50, 172.90, null],
    ["COPPER", "30AUG2024", 784.30, 784.40, 784.40, -6.80, -0.86, 790.90, 784.00, 788.00, 791.20],
    ["CRUDEOIL", "19AUG2024", 6327.00, 6329.00, 6328.00, -23.00, -0.36, 6373.00, 6306.00, 6343.00, 6351.00],
    ["GOLD", "04OCT2024", 68747.00, 68761.00, 68759.00, 133.00, 0.19, 68855.00, 68622.00, 68660.00, null],
    ["SILVER", "05DEC2024", 83663.00, 83688.00, 83598.00, 143.00, 0.17, 83980.00, 83550.00, 83565.00, null],
    ["SILVERM", "29NOV2024", 83780.00, 83784.00, 83774.00, 218.00, 0.26, 84068.00, 83462.00, 83560.00, null],
    ["LEAD", "30AUG2024", 185.30, 185.55, 185.40, -1.60, -0.86, 187.00, 185.55, 186.05, null],
    ["ZINC", "30AUG2024", 248.25, 248.30, 248.30, -0.45, -0.18, 249.80, 247.75, 248.20, null],
    ["ALUMINIUM", "30AUG2024", 207.30, 207.45, 207.40, -1.85, -0.89, 208.50, 206.50, 207.90, null],
    ["GUARSEED10", "20AUG2024", 5474.00, 5479.00, 5479.00, 43.00, 0.79, 5513.00, 5440.00, 5436.00, null],
    ["DHANIYA", "", 7190.00, 5485.00, 7200.00, -26.00, -0.36, 7112.00, 7112.00, 7216.00, null],
    ["TMCFGRNZM", "", 15500.00, 15560.00, 15540.00, -60.00, -0.38, 14970.00, 15562.00, 14970.00, null],
    ["JEERAUNJHA", "30AUG2024", 26650.00, 26670.00, 26670.00, -80.00, -0.32, 27150.00, 26310.00, 26700.00, null]
];

let previousData = JSON.parse(JSON.stringify(data));  // Deep copy to store previous values

function getRandomChange() {
    return (Math.random() * 20 - 10).toFixed(2);  // Random change between -10 and 10
}

function getRandomChange(drift, volatility) {
    // Generate a random percentage change based on drift and volatility
    const randomShock = (Math.random() * volatility) * (Math.random() < 0.5 ? -1 : 1);
    return drift + randomShock;
}

function updatePrices(data) {
    const drift = 0.0001; // Adjust the drift value as needed (small percentage)
    const volatility = 0.01; // Adjust the volatility value as needed (small percentage)

    return data.map((row) => {
        const randomChangePercentage = getRandomChange(drift, volatility);
        const lastTrade = parseFloat((row[4] * (1 + randomChangePercentage)).toFixed(2));
        const netChange = parseFloat((lastTrade - row[4]).toFixed(2));
        const percentageChange = parseFloat(((netChange / row[4]) * 100).toFixed(2));
        const high = parseFloat(Math.max(row[7], lastTrade).toFixed(2));
        const low = parseFloat(Math.min(row[8], lastTrade).toFixed(2));
        return [row[0], row[1], parseFloat((row[2] * (1 + randomChangePercentage)).toFixed(2)), parseFloat((row[3] * (1 + randomChangePercentage)).toFixed(2)), lastTrade, netChange, percentageChange, high, low, row[9], row[10]];
    });
}


function createTable(data) {
    const tableBody = document.querySelector("#commoditiesTable tbody");
    tableBody.innerHTML = '';  // Clear existing rows

    data.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");

        row.forEach((cell, cellIndex) => {
            const td = document.createElement("td");
            if (typeof cell === 'number') {
                td.textContent = cell.toFixed(2);
            } else {
                td.textContent = cell !== null ? cell : "N/A";
            }

            td.setAttribute('data-label', document.querySelector(`#commoditiesTable thead th:nth-child(${cellIndex + 1})`).textContent);

            if (cellIndex === 0) {  // Apply trend color to commodity name
                const overallTrend = data[rowIndex][6];  // Percentage change
                if (overallTrend > 0) {
                    td.classList.add("positive");
                } else if (overallTrend < 0) {
                    td.classList.add("negative");
                }
            }

            if (cellIndex === 5 || cellIndex === 6) {  // Apply color to 'Net Change' and '% Change' columns
                if (cell > 0) {
                    td.classList.add("positive");
                } else if (cell < 0) {
                    td.classList.add("negative");
                }
            }

            if (cellIndex === 2 || cellIndex === 3) {  // Apply color to 'Buy Price' and 'Sell Price' based on previous values
                const previousValue = previousData[rowIndex][cellIndex];
                if (cell > previousValue) {
                    td.classList.add("positive");
                } else if (cell < previousValue) {
                    td.classList.add("negative");
                }
            }

            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });

    previousData = JSON.parse(JSON.stringify(data));  // Update previous data for the next comparison
}

document.addEventListener("DOMContentLoaded", () => {
    createTable(data);

    setInterval(() => {
        const updatedData = updatePrices(data);
        createTable(updatedData);
    }, 1000);  // Update every 5 seconds
});
