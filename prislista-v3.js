// Prisdata
const priceData = [
    { users: 10, price: 75, startup: 10000, maxDiscount: 10 },
    { users: 15, price: 75, startup: 10000, maxDiscount: 10 },
    { users: 20, price: 75, startup: 10000, maxDiscount: 10 },
    { users: 25, price: 75, startup: 10000, maxDiscount: 10 },
    { users: 30, price: 75, startup: 10000, maxDiscount: 10 },
    { users: 40, price: 75, startup: 10000, maxDiscount: 10 },
    { users: 50, price: 70, startup: 10000, maxDiscount: 15 },
    { users: 75, price: 70, startup: 10000, maxDiscount: 15 },
    { users: 100, price: 70, startup: 10000, maxDiscount: 15 },
    { users: 200, price: 65, startup: 25000, maxDiscount: 20 },
    { users: 400, price: 60, startup: 25000, maxDiscount: 20 },
    { users: 600, price: 55, startup: 25000, maxDiscount: 20 }
];

// Formatera nummer som valuta
function formatCurrency(number) {
    return new Intl.NumberFormat('sv-SE', { 
        style: 'currency', 
        currency: 'SEK',
        maximumFractionDigits: 0 
    }).format(number).replace('SEK', 'kr');
}

// Uppdatera prismatris
function updatePriceTable() {
    const tbody = document.querySelector('.price-table tbody');
    tbody.innerHTML = '';

    priceData.forEach(data => {
        const monthly = data.price * data.users;
        const yearly = monthly * 12;
        const total = yearly + data.startup;
        const firstYear = total * (1 - data.maxDiscount / 100);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.users}</td>
            <td>${data.price}</td>
            <td>${formatCurrency(monthly).replace(' kr', '')}</td>
            <td>${formatCurrency(yearly).replace(' kr', '')}</td>
            <td class="red-text">${formatCurrency(data.startup).replace(' kr', '')}</td>
            <td>${formatCurrency(total).replace(' kr', '')}</td>
            <td class="red-text">${data.maxDiscount}%</td>
            <td>${formatCurrency(firstYear).replace(' kr', '')}</td>
        `;
        tbody.appendChild(row);
    });
}

// Beräkna och uppdatera priser
function calculatePrices() {
    const userCount = parseInt(document.getElementById('userCount').value);
    const startupFee = parseInt(document.getElementById('startupFee').value);
    const discount = parseInt(document.getElementById('discount').value);
    const consultingHours = parseInt(document.getElementById('consultingHours').value) || 0;
    const consultingRate = parseInt(document.getElementById('consultingRate').value) || 1200;

    // Hitta rätt prisnivå
    const priceLevel = priceData.find(data => data.users === userCount);
    if (!priceLevel) return;

    // Beräkna grundkostnader
    const monthlyFee = priceLevel.price * userCount;
    const yearlyFee = monthlyFee * 12;
    const consultingFee = consultingHours * consultingRate;

    // Beräkna rabatter
    const appliedDiscount = Math.min(discount, priceLevel.maxDiscount);
    const monthlyDiscount = monthlyFee * (appliedDiscount / 100);
    const yearlyDiscount = monthlyDiscount * 12;

    // Beräkna kostnader per användare
    const costPerUserBefore = monthlyFee / userCount;
    const costPerUserAfter = (monthlyFee - monthlyDiscount) / userCount;

    // Beräkna totaler
    const totalFirstYear = yearlyFee - yearlyDiscount + startupFee + consultingFee;
    const totalFollowingYears = yearlyFee - yearlyDiscount;

    // Uppdatera gränssnittet
    document.getElementById('monthlyFee').textContent = formatCurrency(monthlyFee);
    document.getElementById('yearlyFee').textContent = formatCurrency(yearlyFee);
    document.getElementById('startupFeeSummary').textContent = formatCurrency(startupFee);
    document.getElementById('consultingFee').textContent = formatCurrency(consultingFee);
    document.getElementById('costPerUserBefore').textContent = formatCurrency(costPerUserBefore);
    document.getElementById('costPerUserAfter').textContent = formatCurrency(costPerUserAfter);
    document.getElementById('monthlyDiscount').textContent = formatCurrency(monthlyDiscount);
    document.getElementById('yearlyDiscount').textContent = formatCurrency(yearlyDiscount);
    document.getElementById('totalFirstYear').textContent = formatCurrency(totalFirstYear);
    document.getElementById('totalFollowingYears').textContent = formatCurrency(totalFollowingYears);

    // Uppdatera värdevisning för reglage
    document.getElementById('startupFeeValue').textContent = formatCurrency(startupFee);
    document.getElementById('discountValue').textContent = appliedDiscount + '%';
}

// Lägg till händelselyssnare
document.addEventListener('DOMContentLoaded', () => {
    // Initialisera prismatris
    updatePriceTable();

    // Lägg till händelselyssnare för alla inputs
    const inputs = ['userCount', 'startupFee', 'discount', 'consultingHours', 'consultingRate'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculatePrices);
    });

    // Beräkna initiala priser
    calculatePrices();
}); 