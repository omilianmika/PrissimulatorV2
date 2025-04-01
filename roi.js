// Hämta systemkostnad från localStorage (sparad från prissimulator)
const systemCost = parseFloat(localStorage.getItem('totalSystemCost')) || 0;
document.getElementById('systemCost').textContent = systemCost.toLocaleString('sv-SE');

// Initiera diagram
let roiChart;
let functionChart;

// Funktion för att formatera valuta
function formatCurrency(value) {
    return value.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr';
}

// Funktion för att beräkna ROI för en rad
function calculateRowROI(timePerPerson, hourlyRate, numberOfPeople, timeSavingsPercent) {
    const totalTime = timePerPerson * numberOfPeople;
    const totalCost = totalTime * hourlyRate;
    const timeSaved = totalTime * (timeSavingsPercent / 100);
    const moneySaved = timeSaved * hourlyRate;
    
    return {
        totalTime,
        totalCost,
        timeSaved,
        moneySaved
    };
}

// Funktion för att uppdatera totaler och diagram
function updateTotals() {
    let totalCost = 0;
    let totalTime = 0;
    let totalTimeSaved = 0;
    let totalMoneySaved = 0;
    
    // Data för funktionsområdesdiagram
    const functionData = {
        labels: [],
        totalTime: [],
        timeSaved: [],
        totalCost: [],
        moneySaved: []
    };

    // Gå igenom alla rader och summera
    document.querySelectorAll('tbody tr').forEach(row => {
        const timePerPerson = parseFloat(row.querySelector('td:nth-child(4) input').value) || 0;
        const hourlyRate = parseFloat(row.querySelector('td:nth-child(5) input').value) || 0;
        const numberOfPeople = parseFloat(row.querySelector('td:nth-child(6) input').value) || 0;
        const timeSavingsPercent = parseFloat(row.querySelector('td:nth-child(9) input').value) || 0;
        
        const roi = calculateRowROI(timePerPerson, hourlyRate, numberOfPeople, timeSavingsPercent);
        
        // Uppdatera beräknade värden i raden
        row.querySelector('td:nth-child(7)').textContent = formatCurrency(roi.totalCost);
        row.querySelector('td:nth-child(8)').textContent = roi.totalTime;
        row.querySelector('td:nth-child(10)').textContent = roi.timeSaved;
        row.querySelector('td:nth-child(11)').textContent = formatCurrency(roi.moneySaved);
        
        // Samla data för funktionsområdesdiagram
        const functionName = row.querySelector('td:nth-child(3)').textContent;
        functionData.labels.push(functionName);
        functionData.totalTime.push(roi.totalTime);
        functionData.timeSaved.push(roi.timeSaved);
        functionData.totalCost.push(roi.totalCost);
        functionData.moneySaved.push(roi.moneySaved);
        
        // Lägg till i totaler
        totalCost += roi.totalCost;
        totalTime += roi.totalTime;
        totalTimeSaved += roi.timeSaved;
        totalMoneySaved += roi.moneySaved;
    });

    // Uppdatera totaler i footer
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('totalTime').textContent = totalTime;
    document.getElementById('totalTimeSaved').textContent = totalTimeSaved;
    document.getElementById('totalMoneySaved').textContent = formatCurrency(totalMoneySaved);

    // Uppdatera sammanfattning
    document.getElementById('totalSavings').textContent = formatCurrency(totalMoneySaved);
    const actualCost = systemCost - totalMoneySaved;
    document.getElementById('actualCost').textContent = formatCurrency(actualCost);
    
    // Beräkna och visa ROI
    const roi = systemCost > 0 ? ((totalMoneySaved - systemCost) / systemCost * 100) : Infinity;
    document.getElementById('roiPercentage').textContent = roi === Infinity ? '∞' : roi.toFixed(1);

    // Uppdatera diagram
    updateChart(systemCost, totalMoneySaved);
    updateFunctionChart(functionData);
}

// Funktion för att uppdatera ROI-diagrammet
function updateChart(systemCost, totalSavings) {
    const ctx = document.getElementById('roiChart').getContext('2d');
    
    if (roiChart) {
        roiChart.destroy();
    }

    roiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Systemkostnad', 'Besparing'],
            datasets: [{
                label: 'Kostnad vs Besparing',
                data: [systemCost, totalSavings],
                backgroundColor: [
                    '#4B5D60',
                    '#F0B600'
                ],
                borderColor: [
                    '#4B5D60',
                    '#F0B600'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('sv-SE') + ' kr';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString('sv-SE') + ' kr';
                        }
                    }
                }
            }
        }
    });
}

// Funktion för att uppdatera funktionsområdesdiagrammet
function updateFunctionChart(data) {
    const ctx = document.getElementById('functionChart').getContext('2d');
    
    if (functionChart) {
        functionChart.destroy();
    }

    functionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Total tid (h)',
                    data: data.totalTime,
                    backgroundColor: '#4B5D60',
                    borderColor: '#4B5D60',
                    borderWidth: 1
                },
                {
                    label: 'Tidsbesparing (h)',
                    data: data.timeSaved,
                    backgroundColor: '#F0B600',
                    borderColor: '#F0B600',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Timmar'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Tid och Besparing per Funktionsområde'
                }
            }
        }
    });
}

// Lägg till event listeners för alla input-fält
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', updateTotals);
});

// Kör initial beräkning
updateTotals(); 