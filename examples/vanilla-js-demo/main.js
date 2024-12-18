/**
 * PivotHead Demo
 * 
 * This file demonstrates the usage of the PivotheadCore library to create an interactive pivot table.
 * Features include:
 * - Sorting
 * - Grouping
 * - Column resizing
 * - Column reordering (drag and drop)
 * - Row reordering (drag and drop)
 */
if (typeof PivotheadCore === 'undefined') {
    console.error('PivotheadCore is not defined. Make sure the library is loaded correctly.');
}

// Importing the Package
const { PivotEngine } = PivotheadCore;

// Dummy data.
const data = [
    { date: '2024-01-01', product: 'Widget A', region: 'North', sales: 1000, quantity: 50 },
    { date: '2024-01-01', product: 'Widget B', region: 'South', sales: 1500, quantity: 75 },
    { date: '2024-01-01', product: 'Widget D', region: 'North', sales: 1300, quantity: 70 },
    { date: '2024-01-02', product: 'Widget A', region: 'East', sales: 1200, quantity: 60 },
    { date: '2024-01-02', product: 'Widget A', region: 'East', sales: 100, quantity: 44 },
    { date: '2024-01-02', product: 'Widget C', region: 'West', sales: 800, quantity: 40 },
    { date: '2024-01-03', product: 'Widget B', region: 'North', sales: 1800, quantity: 90 },
    { date: '2024-01-03', product: 'Widget C', region: 'South', sales: 1100, quantity: 55 },
    { date: '2024-01-04', product: 'Widget A', region: 'West', sales: 1300, quantity: 65 },
    { date: '2024-01-04', product: 'Widget B', region: 'East', sales: 1600, quantity: 80 },
];

// Setting column 
const columns = [
    { field: 'date', label: 'Date', type: "string" },
    { field: 'product', label: 'Product', type: "string" },
    { field: 'region', label: 'Region', type: "string" },
    { field: 'sales', label: 'Sales', type: "number" },
    { field: 'quantity', label: 'Quantity', type: "number" },
    { field: 'result', label: 'Operation Result', type: "number" },
];

// Config the pivot table
const config = {
    data,
    columns: columns,
    groupConfig: null
};

// Initialize PivotEngine
let engine = new PivotEngine(config);

function createControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.style.display = 'flex';
    controlPanel.style.alignItems = 'center';
    controlPanel.style.gap = '20px';
    controlPanel.style.marginBottom = '20px';
    controlPanel.style.padding = '10px';
    controlPanel.style.backgroundColor = '#f8f9fa';
    controlPanel.style.border = '1px solid #dee2e6';
    controlPanel.style.borderRadius = '4px';

    // Create Reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.style.padding = '6px 12px';
    resetButton.style.border = '1px solid #ced4da';
    resetButton.style.borderRadius = '4px';
    resetButton.style.backgroundColor = '#fff';
    resetButton.style.cursor = 'pointer';
    resetButton.onclick = () => {
        engine.reset();
        renderTable();
    };

    // Create Group by control
    const groupByContainer = document.createElement('div');
    groupByContainer.style.display = 'flex';
    groupByContainer.style.alignItems = 'center';
    groupByContainer.style.gap = '8px';

    const groupByLabel = document.createElement('label');
    groupByLabel.textContent = 'Group by:';
    groupByLabel.style.fontWeight = '500';

    const select = document.createElement('select');
    select.multiple = true;
    select.style.minWidth = '200px';
    select.style.padding = '6px';
    select.style.border = '1px solid #ced4da';
    select.style.borderRadius = '4px';
    select.style.backgroundColor = '#fff';

    config.columns.forEach(column => {
        const option = document.createElement('option');
        option.value = column.field;
        option.textContent = column.label;
        select.appendChild(option);
    });

    // Set initial selected options based on current groupConfig
    const currentGroupFields = engine.getState().groupConfig?.fields || [];
    Array.from(select.options).forEach(option => {
        option.selected = currentGroupFields.includes(option.value);
    });

    select.addEventListener('change', (event) => {
        const selectedFields = Array.from(event.target.selectedOptions, option => option.value);
        if (selectedFields.length > 0) {
            const groupConfig = {
                fields: selectedFields,
                grouper: (item, fields) => fields.map(field => item[field]).join(' - ')
            };
            engine.setGroupConfig(groupConfig);
        } else {
            engine.setGroupConfig(null);
        }
        renderTable();

        // Update selected options
        Array.from(select.options).forEach(option => {
            option.selected = selectedFields.includes(option.value);
        });
    });

    groupByContainer.appendChild(groupByLabel);
    groupByContainer.appendChild(select);

    controlPanel.appendChild(resetButton);
    controlPanel.appendChild(groupByContainer);

    return controlPanel;
}

function renderTable() {
    let state = engine.getState();
    const container = document.getElementById('pivotTable');
    if (!container) {
        console.error('Container element with id "pivotTable" not found');
        return;
    }

    // Clear the container
    container.innerHTML = '';

    // Add the control panel
    const controlPanel = createControlPanel();
    container.appendChild(controlPanel);

    // Update grouping dropdown to reflect current state
    updateGroupingDropdown();

    // Create and add the table
    const tableElement = document.createElement('table');
    tableElement.style.width = '100%';
    tableElement.style.borderCollapse = 'collapse';
    tableElement.style.backgroundColor = '#fff';
    tableElement.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

    // Create header
    const headerRow = document.createElement('tr');
    config.columns.forEach((column, columnIndex) => {
        const th = document.createElement('th');
        //th.textContent = column.label;
        th.style.border = '1px solid #dee2e6';
        th.style.padding = '12px';
        th.style.backgroundColor = '#f8f9fa';
        th.style.cursor = 'pointer';
        th.style.position = 'relative';
        th.style.minWidth = '100px';
        th.style.userSelect = 'none';

        const headerContent = document.createElement('div');
        headerContent.style.display = 'flex';
        headerContent.style.justifyContent = 'space-between';
        headerContent.style.alignItems = 'center';

        const labelSpan = document.createElement('span');
        labelSpan.textContent = column.label;

        const sortIcon = document.createElement('span');
        sortIcon.className = 'sort-icon';
        sortIcon.style.marginLeft = '5px';
        sortIcon.style.fontSize = '0.8em';
        sortIcon.style.opacity = '0.5';

        headerContent.appendChild(labelSpan);
        headerContent.appendChild(sortIcon);
        th.appendChild(headerContent);

        th.onclick = () => {
            const state = engine.getState();
            const newDirection = state.sortConfig?.field === column.field && state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
            engine.sort(column.field, newDirection);
            renderTable();
        };

        // Add drag and drop functionality for columns
        th.draggable = true;
        th.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', columnIndex.toString());
        };
        th.ondragover = (e) => {
            e.preventDefault();
        };
        th.ondrop = (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = columnIndex;
            if (fromIndex !== toIndex) {
                engine.dragColumn(fromIndex, toIndex);
                renderTable();
            }
        };

        // Add resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.right = '0';
        resizeHandle.style.top = '0';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.width = '4px';
        resizeHandle.style.cursor = 'col-resize';
        resizeHandle.style.backgroundColor = 'rgba(0,0,0,0.1)';

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = th.offsetWidth;

            function onMouseMove(e) {
                const width = Math.max(100, startWidth + (e.clientX - startX));
                th.style.width = `${width}px`;
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                engine.resizeColumn(column.field, th.offsetWidth);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        th.appendChild(resizeHandle);
        headerRow.appendChild(th);
    });
    tableElement.appendChild(headerRow);

    // Get current state
    state = engine.getState();

    // Create data rows
    if (state.groups.length > 0) {
        renderGroups(state.groups, tableElement);
    } else {
        renderRows(state.data, tableElement);
    }

    container.appendChild(tableElement);
    updateSortIcons(tableElement, state);
}

function renderGroups(groups, tableElement, level = 0) {
    groups.forEach(group => {
        const groupRow = document.createElement('tr');
        const groupCell = document.createElement('td');
        groupCell.colSpan = engine.getState().columns.length;
        groupCell.style.fontWeight = 'bold';
        groupCell.style.backgroundColor = '#e6e6e6';
        groupCell.style.padding = '8px';
        groupCell.style.paddingLeft = `${level * 20 + 8}px`;
        groupCell.textContent = `${group.key} (${group.items.length} items)`;
        groupRow.appendChild(groupCell);
        tableElement.appendChild(groupRow);

        if (group.subgroups && group.subgroups.length > 0) {
            renderGroups(group.subgroups, tableElement, level + 1);
        } else {
            renderRows(group.items, tableElement);
        }
    });
}

function renderRows(rows, tableElement) {
    rows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9';
        tr.draggable = true;
        tr.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', rowIndex.toString());
        };
        tr.ondragover = (e) => {
            e.preventDefault();
        };
        tr.ondrop = (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = rowIndex;
            if (fromIndex !== toIndex) {
                engine.dragRow(fromIndex, toIndex);
                renderTable();
            }
        };


        config.columns.forEach((column) => {
            const td = document.createElement('td');
            td.textContent =  row[column.field]?.toString() || '';
            td.style.border = '1px solid #ddd';
            td.style.padding = '12px';
            td.style.fontSize = '12px';
            tr.appendChild(td);
        });

        tableElement.appendChild(tr);
    });
}


function updateSortIcons(tableElement, state) {
    const headers = tableElement.querySelectorAll('th');
    headers.forEach((th, index) => {
        const sortIcon = th.querySelector('.sort-icon');
        if (state.sortConfig && state.sortConfig.field === state.columns[index].field) {
            sortIcon.textContent = state.sortConfig.direction === 'asc' ? '▲' : '▼';
        } else {
            sortIcon.textContent = '▲▼';
        }
    });
}

function updateResultField(operation) {
    const numericColumns = config.columns.filter(col => col.type === 'number' && col.field !== 'result');
    // Update each row's "result" field based on the selected operation
    const processedData = data.map(row => {
        const values = numericColumns.map(col => row[col.field] || 0);
        let temp;
        switch (operation) {
            case 'sum':
                temp = values.reduce((sum, val) => sum + val, 0);
                break;
            case 'avg':
                temp = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
                break;
            case 'count':
                temp = values.length;
                break;
            case 'min':
                temp = values.length > 0 ? Math.min(...values) : 0;
                break;
            case 'max':
                temp = values.length > 0 ? Math.max(...values) : 0;
                break;
            default:
                temp = 0; // Default to 0 for unsupported operations
        }
        return { ...row, result: temp };
    });
    
    // Initialize PivotEngine
     engine = new PivotEngine({
        data:processedData,
        columns: columns,
        groupConfig: null
    });
 renderTable()
   
}

// Update dropdown event listener
function renderDropdown() {
    const container = document.getElementById('dropdownContainer');
    if (!container) {
        console.error('Dropdown container (#dropdownContainer) is missing.');
        return;
    }

    const dropdown = document.createElement('select');
    dropdown.style.marginBottom = '20px';
    dropdown.id = 'operationDropdown';

    const operations = ['Sum', 'Avg', 'Count', 'Min', 'Max'];
    operations.forEach(operation => {
        const option = document.createElement('option');
        option.value = operation.toLowerCase(); // Use lowercase for consistent handling
        option.textContent = operation;
        dropdown.appendChild(option);
    });

    // Add event listener to update result field on change
    dropdown.addEventListener('change', () => {
        const selectedOperation = dropdown.value;
        updateResultField(selectedOperation); // Update the result field
      
    });

    container.innerHTML = '';
    container.appendChild(dropdown);
}


function initializeTable() {
    const defaultOperation = 'sum';
    updateResultField(defaultOperation);
    renderDropdown();
    renderTable();
}

function updateGroupingDropdown() {
    const select = document.querySelector('select[multiple]');
    if (select) {
        const currentGroupFields = engine.getState().groupConfig?.fields || [];
        Array.from(select.options).forEach(option => {
            option.selected = currentGroupFields.includes(option.value);
        });
    }
}

// Initialize the table when the DOM is fully loaded
// document.addEventListener('DOMContentLoaded', initializeTable);
document.addEventListener('DOMContentLoaded', () => {
    const pivotTableContainer = document.getElementById('pivotTable');
    const dropdownContainer = document.getElementById('dropdownContainer');
    const multiSelectContainer = document.getElementById('multiSelectContainer');

    if (!pivotTableContainer || !dropdownContainer || !multiSelectContainer) {
        console.error('Required containers are missing. Ensure the HTML structure is correct.');
        return;
    }

    // Initialize the pivot table
    initializeTable();
});
