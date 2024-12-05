// Check if PivotheadCore is available
if (typeof PivotheadCore === 'undefined') {
    console.error('PivotheadCore is not defined. Make sure the library is loaded correctly.');
}

const { PivotEngine } = PivotheadCore;

const data = [
    { date: '2024-01-01', product: 'Widget A', region: 'North', sales: 1000, quantity: 50 },
    { date: '2024-01-01', product: 'Widget B', region: 'South', sales: 1500, quantity: 75 },
    { date: '2024-01-02', product: 'Widget A', region: 'East', sales: 1200, quantity: 60 },
    { date: '2024-01-02', product: 'Widget C', region: 'West', sales: 800, quantity: 40 },
    { date: '2024-01-03', product: 'Widget B', region: 'North', sales: 1800, quantity: 90 },
    { date: '2024-01-03', product: 'Widget C', region: 'South', sales: 1100, quantity: 55 },
    { date: '2024-01-04', product: 'Widget A', region: 'West', sales: 1300, quantity: 65 },
    { date: '2024-01-04', product: 'Widget B', region: 'East', sales: 1600, quantity: 80 },
];

const config = {
    data,
    columns: [
        { field: 'date', label: 'Date' },
        { field: 'product', label: 'Product' },
        { field: 'region', label: 'Region' },
        { field: 'sales', label: 'Sales' },
        { field: 'quantity', label: 'Quantity' }
    ]
};

const engine = new PivotEngine(config);

function renderTable() {
    const state = engine.getState();
    const tableElement = document.createElement('table');
    tableElement.style.width = '100%';
    tableElement.style.borderCollapse = 'collapse';
    tableElement.style.marginTop = '20px';

    // Create header
    const headerRow = document.createElement('tr');
    config.columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column.label;
        th.style.border = '1px solid #ddd';
        th.style.padding = '12px';
        th.style.backgroundColor = '#f2f2f2';
        th.style.cursor = 'pointer';
        th.onclick = () => {
            const newDirection = state.sortConfig?.field === column.field && state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
            engine.sort(column.field, newDirection);
            renderTable();
        };
        headerRow.appendChild(th);
    });
    tableElement.appendChild(headerRow);

    // Create data rows
    state.data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
        config.columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column.field].toString();
            td.style.border = '1px solid #ddd';
            td.style.padding = '12px';
            tr.appendChild(td);
        });
        tableElement.appendChild(tr);
    });

    const container = document.getElementById('pivotTable');
    container.innerHTML = '';
    container.appendChild(tableElement);
}

function initializeTable() {
    renderTable();
    
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.onclick = () => {
            engine.reset();
            renderTable();
        };
    } else {
        console.error('Reset button not found in the DOM');
    }
}

// Initialize the table when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeTable);

