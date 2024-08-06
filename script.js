// Function to parse CSV data
function parseCSV(data) {
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        return values.map((value, index) => {
            if (index === 0 || index === 1) return value;
            return parseFloat(value) || null;
        });
    });
    return rows;
}

// Function to fetch and parse CSV data
async function fetchCSVData(url) {
    const response = await fetch(url);
    const data = await response.text();
    return parseCSV(data);
}

// Function to generate random changes for updates
function getRandomChange(drift, volatility) {
    const randomShock = (Math.random() * volatility) * (Math.random() < 0.5 ? -1 : 1);
    return drift + randomShock;
}

// Function to update prices
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

// Function to create the table
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

// Main function to initialize the table and start updates
async function init() {
    const data = await fetchCSVData('data.csv');
    previousData = JSON.parse(JSON.stringify(data));  // Deep copy to store previous values
    createTable(data);

    setInterval(() => {
        const updatedData = updatePrices(data);
        createTable(updatedData);
    }, 5000);  // Update every 5 seconds
}

document.addEventListener("DOMContentLoaded", init);
