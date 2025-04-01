// Konstanter för priser och rabatter
const PRISLISTA = {
    nivaer: [
        { antalMin: 1, antalMax: 55, heltid: 83, rabatt: 0 },
        { antalMin: 56, antalMax: 75, heltid: 70, rabatt: 13 },
        { antalMin: 76, antalMax: 100, heltid: 69, rabatt: 14 },
        { antalMin: 101, antalMax: 150, heltid: 68, rabatt: 15 },
        { antalMin: 151, antalMax: 200, heltid: 67, rabatt: 16 },
        { antalMin: 201, antalMax: 450, heltid: 66, rabatt: 17 },
        { antalMin: 451, antalMax: 550, heltid: 65, rabatt: 18 },
        { antalMin: 551, antalMax: 750, heltid: 64, rabatt: 19 },
        { antalMin: 751, antalMax: 950, heltid: 62, rabatt: 21 },
        { antalMin: 951, antalMax: 1250, heltid: 60, rabatt: 23 },
        { antalMin: 1251, antalMax: 1500, heltid: 58, rabatt: 25 },
        { antalMin: 1501, antalMax: 4000, heltid: 45, rabatt: 38 },
        { antalMin: 4001, antalMax: 8000, heltid: 37, rabatt: 46 }
    ]
};

// Hitta pris baserat på antal användare
function getPrisNiva(antal) {
    for (const niva of PRISLISTA.nivaer) {
        if (antal >= niva.antalMin && antal <= niva.antalMax) {
            return niva;
        }
    }
    return PRISLISTA.nivaer[0]; // Default till första nivån om inget annat matchar
}

// Formatera nummer med tusentalsavgränsare
function formatNumber(number) {
    return new Intl.NumberFormat('sv-SE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

// Hämta alla input-element
const antalHeltid = document.getElementById('antalHeltid');
const antalDeltid = document.getElementById('antalDeltid');
const antalSasongare = document.getElementById('antalSasongare');
const sasongManader = document.getElementById('sasongManader');
const uppstartsTypRadios = document.querySelectorAll('input[name="uppstartsTyp"]');
const konsultTimmarSelect = document.getElementById('konsultTimmar');
const resetButton = document.getElementById('resetButton');

// Hämta alla output-element
const licensKostnadManad = document.getElementById('licensKostnadManad');
const licensKostnadAr = document.getElementById('licensKostnadAr');
const uppstartsavgift = document.getElementById('uppstartsavgift');
const totalkostnad = document.getElementById('totalkostnad');
const rabattTotal = document.getElementById('rabattTotal');
const konsultTimmarKostnadDisplay = document.getElementById('konsultTimmarKostnad');
const snittkostnadAnvandare = document.getElementById('snittkostnadAnvandare');
const snittkostnadManad = document.getElementById('snittkostnadManad');
const rabattPerManad = document.getElementById('rabattPerManad');

// Initiera diagram
let monthlyChart;

// Uppdatera priser i labels
function updatePriceLabels() {
    const heltidAntal = parseInt(antalHeltid.value || 0);
    const deltidAntal = parseInt(antalDeltid.value || 0);
    const sasongareAntal = parseInt(antalSasongare.value || 0);
    
    const heltidNiva = getPrisNiva(heltidAntal);
    const deltidPris = heltidNiva.heltid * 0.25; // Deltid är alltid 25% av heltidspriset
    
    document.querySelector('label[for="antalHeltid"]').textContent = 
        `Antal heltid (${heltidNiva.heltid} kr/st)`;
    document.querySelector('label[for="antalDeltid"]').textContent = 
        `Antal deltid (${deltidPris.toFixed(2)} kr/st)`;
    document.querySelector('label[for="antalSasongare"]').textContent = 
        `Antal säsongare (${heltidNiva.heltid} kr/st)`;
}

// Beräkna kostnader
function calculateCosts() {
    // Hämta antal från inputs
    const heltidAntal = parseInt(antalHeltid.value || 0);
    const deltidAntal = parseInt(antalDeltid.value || 0);
    const sasongareAntal = parseInt(antalSasongare.value || 0);
    const antalManader = parseInt(sasongManader.value || 4);
    
    // Hämta prisnivåer baserat på respektive antal
    const heltidNiva = getPrisNiva(heltidAntal);
    const deltidPris = heltidNiva.heltid * 0.25; // Deltid är alltid 25% av heltidspriset
    
    // Beräkna månadskostnader
    const heltidKostnad = heltidAntal * heltidNiva.heltid;
    const deltidKostnad = deltidAntal * deltidPris;
    const sasongareKostnadPerManad = sasongareAntal * heltidNiva.heltid; // Använder heltidspris

    // Beräkna rabatter
    const heltidRabatt = heltidAntal * heltidNiva.rabatt;
    const deltidRabatt = deltidAntal * (heltidNiva.heltid - deltidPris);
    const sasongareRabatt = sasongareAntal * heltidNiva.rabatt;

    // Totala månadskostnader (utan uppstartsavgift och konsulttimmar)
    const manadskostnad = heltidKostnad + deltidKostnad + sasongareKostnadPerManad;
    const arskostnad = (manadskostnad * 12) - (sasongareKostnadPerManad * (12 - antalManader));
    const totalRabatt = ((heltidRabatt + deltidRabatt) * 12) + (sasongareRabatt * antalManader);
    
    // Hämta vald uppstartsavgift och konsulttimmar
    const selectedUppstart = document.querySelector('input[name="uppstartsTyp"]:checked');
    const uppstartsvarde = parseInt(selectedUppstart.value);
    const konsultTimmarKostnad = parseInt(konsultTimmarSelect.value);
    
    // Beräkna totalkostnad (inklusive uppstartsavgift och konsulttimmar)
    const totalKostnadVarde = arskostnad + uppstartsvarde + konsultTimmarKostnad;
    
    // Beräkna snittkostnad per användare (ENDAST baserat på årskostnad, utan uppstartsavgift och konsulttimmar)
    const totalAntal = heltidAntal + deltidAntal + sasongareAntal;
    const snittkostnadAnvandareVarde = totalAntal > 0 ? arskostnad / totalAntal : 0;
    
    // Beräkna snittkostnad per månad (ENDAST licenskostnad)
    const snittkostnadManadVarde = manadskostnad;
    
    // Beräkna rabatt per månad
    const rabattPerManadVarde = totalRabatt / 12;
    
    // Uppdatera UI med formaterade nummer
    licensKostnadManad.textContent = formatNumber(manadskostnad);
    licensKostnadAr.textContent = formatNumber(arskostnad);
    uppstartsavgift.textContent = formatNumber(uppstartsvarde);
    konsultTimmarKostnadDisplay.textContent = formatNumber(konsultTimmarKostnad);
    totalkostnad.textContent = formatNumber(totalKostnadVarde);
    rabattTotal.textContent = formatNumber(totalRabatt);
    snittkostnadAnvandare.textContent = formatNumber(snittkostnadAnvandareVarde);
    snittkostnadManad.textContent = formatNumber(snittkostnadManadVarde);
    rabattPerManad.textContent = formatNumber(rabattPerManadVarde);

    // Uppdatera priser i labels
    updatePriceLabels();

    // Uppdatera diagram och tabell med månadskostnad
    updateChart(manadskostnad, sasongareKostnadPerManad, antalManader);
    updateMonthlyTable(manadskostnad, sasongareKostnadPerManad);
}

// Skapa och uppdatera diagram
function updateChart(baseCost, seasonalCost, seasonMonths) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const monthlyData = Array(12).fill(baseCost);
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    
    // Justera för säsongsarbetare (endast aktiva månader)
    const activeMonths = document.querySelectorAll('#monthButtons button.active');
    activeMonths.forEach(button => {
        const monthIndex = parseInt(button.getAttribute('data-month')) - 1;
        monthlyData[monthIndex] += seasonalCost;
    });

    if (monthlyChart) {
        monthlyChart.destroy();
    }

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Månadskostnad',
                data: monthlyData,
                backgroundColor: '#F0B600',
                borderColor: '#F0B600',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Kostnad (SEK)',
                        color: '#000000'
                    },
                    grid: {
                        color: 'rgba(75, 93, 96, 0.2)',
                        borderColor: '#4B5D60'
                    },
                    ticks: {
                        color: '#000000'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(75, 93, 96, 0.2)',
                        borderColor: '#4B5D60'
                    },
                    ticks: {
                        color: '#000000'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#000000'
                    }
                }
            }
        }
    });
}

// Uppdatera månadstabell
function updateMonthlyTable(baseCost, seasonalCost) {
    const monthlyDataRow = document.getElementById('monthlyDataRow');
    const cells = monthlyDataRow.getElementsByTagName('td');
    const activeMonths = document.querySelectorAll('#monthButtons button.active');
    
    // Återställ alla celler till baskostnad
    for (let i = 0; i < cells.length; i++) {
        let cost = baseCost;
        // Lägg till säsongskostnad om månaden är aktiv
        activeMonths.forEach(button => {
            const monthIndex = parseInt(button.getAttribute('data-month')) - 1;
            if (monthIndex === i) {
                cost += seasonalCost;
            }
        });
        cells[i].textContent = formatNumber(cost);
    }
}

// Lägg till event listeners
[antalHeltid, antalDeltid, antalSasongare, sasongManader, konsultTimmarSelect].forEach(input => {
    input.addEventListener('input', calculateCosts);
});

// Lägg till event listeners för radioknapparna
uppstartsTypRadios.forEach(radio => {
    radio.addEventListener('change', calculateCosts);
});

// Hantera månadsknappar
const monthButtons = document.querySelectorAll('#monthButtons button');
monthButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('active');
        updateSeasonalMonths();
    });
});

function updateSeasonalMonths() {
    const activeMonths = document.querySelectorAll('#monthButtons button.active').length;
    sasongManader.value = activeMonths;
    calculateCosts();
}

// Funktion för att nollställa alla värden
function resetAllValues() {
    antalHeltid.value = '0';
    antalDeltid.value = '0';
    antalSasongare.value = '0';
    sasongManader.value = '0';
    
    // Nollställ uppstartsavgift
    const noStartupRadio = document.querySelector('input[name="uppstartsTyp"][value="0"]');
    if (noStartupRadio) {
        noStartupRadio.checked = true;
    }
    
    // Nollställ konsulttimmar
    konsultTimmarSelect.value = '0';
    
    // Nollställ månadsknapparna
    const monthButtons = document.querySelectorAll('#monthButtons button.active');
    monthButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Uppdatera beräkningar
    calculateCosts();
}

// Sätt initiala värden till 0
window.addEventListener('load', () => {
    resetAllValues();
});

// Lägg till event listener för nollställningsknappen
if (resetButton) {
    resetButton.addEventListener('click', resetAllValues);
}

// Initiell beräkning
calculateCosts(); 