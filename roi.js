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
    
    // Separata totaler för chefer och medarbetare
    let managerTotalCost = 0;
    let managerTotalTime = 0;
    let managerTimeSaved = 0;
    let managerMoneySaved = 0;
    
    let employeeTotalCost = 0;
    let employeeTotalTime = 0;
    let employeeTimeSaved = 0;
    let employeeMoneySaved = 0;
    
    // Data för funktionsområdesdiagram
    const functionData = {
        labels: [],
        totalTime: [],
        timeSaved: [],
        totalCost: [],
        moneySaved: []
    };

    // Samla data för sammanfattning
    const managerData = [];
    const employeeData = [];

    // Gå igenom alla rader och summera
    document.querySelectorAll('tbody tr').forEach(row => {
        const category = row.querySelector('td:nth-child(1)').textContent;
        const forWhom = row.querySelector('td:nth-child(2)').textContent;
        const timePerPerson = parseFloat(row.querySelector('td:nth-child(4) input').value) || 0;
        const hourlyRate = parseFloat(row.querySelector('td:nth-child(5) input').value) || 0;
        const numberOfPeople = parseFloat(row.querySelector('td:nth-child(6) input').value) || 0;
        const timeSavingsPercent = parseFloat(row.querySelector('td:nth-child(9) input').value) || 0;
        
        const roi = calculateRowROI(timePerPerson, hourlyRate, numberOfPeople, timeSavingsPercent);
        
        // Spara data för sammanfattning baserat på målgrupp
        const summaryItem = {
            category,
            forWhom,
            function: row.querySelector('td:nth-child(3)').textContent,
            timeSaved: roi.timeSaved,
            moneySaved: roi.moneySaved,
            totalTime: roi.totalTime,
            totalCost: roi.totalCost
        };

        if (forWhom.includes('chef')) {
            managerData.push(summaryItem);
            managerTotalCost += roi.totalCost;
            managerTotalTime += roi.totalTime;
            managerTimeSaved += roi.timeSaved;
            managerMoneySaved += roi.moneySaved;
        } else {
            employeeData.push(summaryItem);
            employeeTotalCost += roi.totalCost;
            employeeTotalTime += roi.totalTime;
            employeeTimeSaved += roi.timeSaved;
            employeeMoneySaved += roi.moneySaved;
        }

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

    // Generera sammanfattningstext
    let summaryText = `Genom att implementera systemet kan ni spara totalt ${formatCurrency(totalMoneySaved)} per år. `;
    summaryText += `Detta uppnås genom en total tidsbesparing på ${totalTimeSaved} timmar.\n\n`;
    
    // Sammanfattning för chefer
    summaryText += `För chefer:\n`;
    summaryText += `Total kostnad: ${formatCurrency(managerTotalCost)}\n`;
    summaryText += `Total tid: ${managerTotalTime} timmar\n`;
    summaryText += `Total tidsbesparing: ${managerTimeSaved} timmar\n`;
    summaryText += `Total kostnadsbesparing: ${formatCurrency(managerMoneySaved)}\n\n`;
    
    managerData.forEach(data => {
        summaryText += `• ${data.category} - ${data.function}: ${data.timeSaved} timmar (${formatCurrency(data.moneySaved)})\n`;
    });

    // Sammanfattning för medarbetare
    summaryText += `\nFör medarbetare:\n`;
    summaryText += `Total kostnad: ${formatCurrency(employeeTotalCost)}\n`;
    summaryText += `Total tid: ${employeeTotalTime} timmar\n`;
    summaryText += `Total tidsbesparing: ${employeeTimeSaved} timmar\n`;
    summaryText += `Total kostnadsbesparing: ${formatCurrency(employeeMoneySaved)}\n\n`;
    
    employeeData.forEach(data => {
        summaryText += `• ${data.category} - ${data.function}: ${data.timeSaved} timmar (${formatCurrency(data.moneySaved)})\n`;
    });

    if (systemCost > 0) {
        const paybackMonths = (systemCost / totalMoneySaved * 12).toFixed(1);
        summaryText += `\nMed en systemkostnad på ${formatCurrency(systemCost)} och en årlig besparing på ${formatCurrency(totalMoneySaved)} `;
        summaryText += `får ni tillbaka investeringen på ${paybackMonths} månader.`;
    }

    document.getElementById('savingsSummary').innerHTML = summaryText.replace(/\n/g, '<br>');

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

// Funktion för att beräkna berättelseflödet
function calculateStorySection(category) {
    const inputs = document.querySelectorAll(`[data-category="${category}"]`);
    let data = {};
    
    inputs.forEach(input => {
        data[input.dataset.field] = parseFloat(input.value) || 0;
    });
    
    let totalTime = 0;
    let totalCost = 0;
    let timeSaved = 0;
    let costSaved = 0;
    
    // Beräkna baserat på kategori
    if (category.includes('onboarding')) {
        totalTime = data.time * data.people;
        totalCost = totalTime * data.cost;
    } else if (category.includes('training')) {
        if (category.includes('manager')) {
            totalTime = data.time * data.sessions;
        } else {
            totalTime = data.time * data.people;
        }
        totalCost = totalTime * data.cost;
    } else if (category.includes('communication')) {
        if (category.includes('manager')) {
            totalTime = data.time * data.weeks;
        } else {
            totalTime = data.time * data.people * 52; // Antar 52 veckor per år
        }
        totalCost = totalTime * data.cost;
    } else if (category.includes('documents')) {
        if (category.includes('manager')) {
            totalTime = data.time * data.weeks;
        } else {
            totalTime = data.time * data.people * 52; // Antar 52 veckor per år
        }
        totalCost = totalTime * data.cost;
    } else if (category.includes('checklists')) {
        totalTime = data.time * data.count;
        totalCost = totalTime * data.cost;
    }
    
    timeSaved = totalTime * (data.savings / 100);
    costSaved = timeSaved * data.cost;
    
    // Uppdatera summering för sektionen
    document.querySelector(`.${category}-total-time`).textContent = totalTime.toFixed(1);
    document.querySelector(`.${category}-total-cost`).textContent = formatCurrency(totalCost);
    document.querySelector(`.${category}-time-saved`).textContent = timeSaved.toFixed(1);
    document.querySelector(`.${category}-cost-saved`).textContent = formatCurrency(costSaved);
    
    return {
        totalTime,
        totalCost,
        timeSaved,
        costSaved,
        savings: data.savings
    };
}

// Funktion för att uppdatera total besparing
function updateTotalSavings() {
    const managerCategories = [
        'onboarding-manager',
        'training-manager',
        'communication-manager',
        'documents-manager',
        'checklists-manager'
    ];
    
    const employeeCategories = [
        'onboarding-employee',
        'training-employee',
        'communication-employee',
        'documents-employee',
        'checklists-employee'
    ];
    
    let managerTotalTimeSaved = 0;
    let managerTotalCostSaved = 0;
    let managerTotalSavingsPercent = 0;
    let validManagerCategories = 0;
    
    let employeeTotalTimeSaved = 0;
    let employeeTotalCostSaved = 0;
    let employeeTotalSavingsPercent = 0;
    let validEmployeeCategories = 0;
    
    // Beräkna för chefer
    managerCategories.forEach(category => {
        const result = calculateStorySection(category);
        if (result.totalTime > 0) {
            managerTotalTimeSaved += result.timeSaved;
            managerTotalCostSaved += result.costSaved;
            managerTotalSavingsPercent += result.savings;
            validManagerCategories++;
        }
    });
    
    // Beräkna för medarbetare
    employeeCategories.forEach(category => {
        const result = calculateStorySection(category);
        if (result.totalTime > 0) {
            employeeTotalTimeSaved += result.timeSaved;
            employeeTotalCostSaved += result.costSaved;
            employeeTotalSavingsPercent += result.savings;
            validEmployeeCategories++;
        }
    });
    
    // Beräkna genomsnitt och totaler
    const totalTimeSaved = managerTotalTimeSaved + employeeTotalTimeSaved;
    const totalCostSaved = managerTotalCostSaved + employeeTotalCostSaved;
    const validCategories = validManagerCategories + validEmployeeCategories;
    const averageSavings = validCategories > 0 ? 
        (managerTotalSavingsPercent + employeeTotalSavingsPercent) / validCategories : 0;
    const paybackTime = systemCost > 0 ? (systemCost / totalCostSaved * 12) : 0;
    
    // Uppdatera för chefer
    document.querySelector('.story-manager-total-time-saved').textContent = managerTotalTimeSaved.toFixed(1);
    document.querySelector('.story-manager-total-cost-saved').textContent = formatCurrency(managerTotalCostSaved);
    
    // Uppdatera för medarbetare
    document.querySelector('.story-employee-total-time-saved').textContent = employeeTotalTimeSaved.toFixed(1);
    document.querySelector('.story-employee-total-cost-saved').textContent = formatCurrency(employeeTotalCostSaved);
    
    // Uppdatera totaler
    document.querySelector('.story-total-time-saved').textContent = totalTimeSaved.toFixed(1);
    document.querySelector('.story-total-cost-saved').textContent = formatCurrency(totalCostSaved);
    document.querySelector('.story-average-time-saved').textContent = averageSavings.toFixed(1);
    document.querySelector('.story-payback-time').textContent = paybackTime.toFixed(1);
}

// Lägg till event listeners för berättelseflödet
document.querySelectorAll('.story-input').forEach(input => {
    input.addEventListener('input', updateTotalSavings);
});

// Kör initial beräkning för berättelseflödet
updateTotalSavings(); 