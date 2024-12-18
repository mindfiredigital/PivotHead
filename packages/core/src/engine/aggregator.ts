// Check if PivotheadCore is available
if (typeof PivotheadCore === 'undefined') {
    console.error('PivotheadCore is not defined. Make sure the library is loaded correctly.');
}

const { PivotEngine } = PivotheadCore;

// Sample Data
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

// Config for PivotEngine
const config = {
    data,
    columns: [
        { field: 'date', label: 'Date',type:"string" },
        { field: 'product', label: 'Product', type:"string" },
        { field: 'region', label: 'Region',type:"string" },
        { field: 'sales', label: 'Sales',type:"number" },
        { field: 'quantity', label: 'Quantity',type:"number" },
        { field: 'result', label: 'Operation Result' ,type:"number"},
    ],
};

// Initialize PivotEngine
let engine = new PivotEngine(config);

// Render Table
function renderTable() {
    const state = engine.getState();
    const tableElement = document.createElement('table');
    tableElement.style.width = '100%';
    tableElement.style.borderCollapse = 'collapse';
    tableElement.style.marginTop = '20px';

    // Create table header
    const headerRow = document.createElement('tr');
    config.columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column.label;
        th.style.border = '1px solid #ddd';
        th.style.padding = '12px';
        th.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(th);
    });
    tableElement.appendChild(headerRow);

    // Create data rows
    state.data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
        config.columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column.field] || '';
            td.style.border = '1px solid #ddd';
            td.style.padding = '12px';
            tr.appendChild(td);
        });
        tableElement.appendChild(tr);
    });

    const container = document.getElementById('pivotTable');
    if (container) {
        container.innerHTML = '';
        container.appendChild(tableElement);
    } else {
        console.error('Table container (#pivotTable) is missing from the DOM.');
    }
}

// Render Dropdown
function renderDropdown() {
    const container = document.getElementById('dropdownContainer');
    if (!container) {
        console.error('Dropdown container (#dropdownContainer) is missing.');
        return;
    }

    const dropdown = document.createElement('select');
    dropdown.style.marginBottom = '20px';
    dropdown.id = 'operationDropdown';

    const operations = ['Sum', 'Avg', 'Count', 'min', 'max'];
    operations.forEach(operation => {
        const option = document.createElement('option');
        option.value = operation;
        option.textContent = operation;
        dropdown.appendChild(option);
    });

    container.innerHTML = '';
    container.appendChild(dropdown);
}

// Render Multi-Select Dropdown with Checkboxes
function renderMultiSelectWithCheckboxes() {
    const container = document.getElementById('multiSelectContainer');
    if (!container) {
        console.error('Multi-select container (#multiSelectContainer) is missing.');
        return;
    }

    container.innerHTML = '';

    const inputBox = document.createElement('div');
    inputBox.className = 'multi-select-input';
    inputBox.tabIndex = 0;
    inputBox.style.padding = '10px';
    inputBox.style.border = '1px solid #ccc';
    inputBox.style.borderRadius = '5px';
    inputBox.style.cursor = 'pointer';
    inputBox.textContent = 'Select Columns';
    inputBox.onclick = () => dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

    const dropdown = document.createElement('div');
    dropdown.className = 'multi-select-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.background = '#fff';
    dropdown.style.border = '1px solid #ccc';
    dropdown.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    dropdown.style.width = '200px';
    dropdown.style.maxHeight = '150px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.display = 'none';

    config.columns.forEach(column => {
        const optionContainer = document.createElement('div');
        optionContainer.style.padding = '5px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = column.field;
        checkbox.style.marginRight = '10px';

        const label = document.createElement('label');
        label.textContent = column.label;

        optionContainer.appendChild(checkbox);
        optionContainer.appendChild(label);
        dropdown.appendChild(optionContainer);
    });

    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply';
    applyButton.style.margin = '10px';
    applyButton.style.padding = '5px 10px';
    applyButton.style.border = 'none';
    applyButton.style.backgroundColor = '#007BFF';
    applyButton.style.color = '#fff';
    applyButton.style.borderRadius = '5px';
    applyButton.style.cursor = 'pointer';

    applyButton.onclick = () => {
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
        const selectedColumns = Array.from(checkboxes).map(checkbox => checkbox.value);
        const selectedOperation = document.getElementById('operationDropdown').value;

        if (selectedColumns.length !== 2) {
            alert('Please select exactly two columns to perform the operation.');
            return;
        }

        const processedData = data.map(row => {
            const [col1, col2] = selectedColumns;
            let result;
            switch (selectedOperation) {
                case 'Sum':
                    result = (row[col1] || 0) + (row[col2] || 0);
                    break;
                case 'Avg':
                    result = ((row[col1] || 0) + (row[col2] || 0)) / 2;
                    break;
                case 'Count':
                    result = [col1, col2].reduce(
                        (count, col) => count + (row[col] !== undefined ? 1 : 0),
                        0
                    );
                    break;
                case 'min':
                    result = Math.min(row[col1] || Infinity, row[col2] || Infinity);
                    break;
                case 'max':
                    result = Math.max(row[col1] || -Infinity, item[col2] || -Infinity);
                    break;
                default:
                    result = 'Invalid Operation';
            }
            return { ...row, result };
        });

        const updatedColumns = [
            ...config.columns.filter(col => col.field !== 'result'),
            { field: 'result', label: `${selectedOperation} of ${selectedColumns.join(' & ')}` },
        ];
        console.log(processedData)
        engine = new PivotEngine({ data: processedData, columns: updatedColumns });
        renderTable();
        dropdown.style.display = 'none';
    };

    dropdown.appendChild(applyButton);

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    container.appendChild(inputBox);
    container.appendChild(dropdown);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    renderDropdown();
    renderMultiSelectWithCheckboxes();
});
