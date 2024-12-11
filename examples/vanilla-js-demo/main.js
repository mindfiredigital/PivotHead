if (typeof PivotheadCore === 'undefined') {
    console.error('PivotheadCore is not defined. Make sure the library is loaded correctly.');
}

const { PivotEngine } = PivotheadCore;

const data = [
    { date: '2024-01-01', product: 'Widget A', region: 'North', sales: 1000, quantity: 50 },
    { date: '2024-01-01', product: 'Widget B', region: 'South', sales: 1500, quantity: 75 },
    { date: '2024-01-01', product: 'Widget D', region: 'North', sales: 1300, quantity: 70 },
    { date: '2024-01-02', product: 'Widget A', region: 'East', sales: 1200, quantity: 60 },
    { date: '2024-01-02', product: 'Widget C', region: 'West', sales: 800, quantity: 40 },
    { date: '2024-01-03', product: 'Widget B', region: 'North', sales: 1800, quantity: 90 },
    { date: '2024-01-03', product: 'Widget C', region: 'South', sales: 1100, quantity: 55 },
    { date: '2024-01-04', product: 'Widget A', region: 'West', sales: 1300, quantity: 65 },
    { date: '2024-01-04', product: 'Widget B', region: 'East', sales: 1600, quantity: 80 },
];

const columns = [
  { field: 'date', label: 'Date' },
  { field: 'product', label: 'Product' },
  { field: 'region', label: 'Region' },
  { field: 'sales', label: 'Sales' },
  { field: 'quantity', label: 'Quantity' }
];

const config = {
  data,
  columns: columns,
  groupConfig: null
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
  config.columns.forEach((column, columnIndex) => {
    const th = document.createElement('th');
    th.style.border = '1px solid #ddd';
    th.style.padding = '12px';
    th.style.backgroundColor = '#f2f2f2';
    th.style.cursor = 'pointer';
    th.style.position = 'relative';
    th.style.minWidth = '100px'; // Set a minimum width for columns
    
    const headerContent = document.createElement('div');
    headerContent.style.display = 'flex';
    headerContent.style.justifyContent = 'space-between';
    headerContent.style.alignItems = 'center';
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = column.label;
    
    const sortIcon = document.createElement('span');
    sortIcon.className = 'sort-icon';
    sortIcon.style.marginLeft = '5px';
    
    headerContent.appendChild(labelSpan);
    headerContent.appendChild(sortIcon);
    th.appendChild(headerContent);
    
    th.onclick = () => {
      const newDirection = state.sortConfig?.field === column.field && state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
      engine.sort(column.field, newDirection);
      renderTable();
    };

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.top = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '5px';
    resizeHandle.style.cursor = 'col-resize';
    resizeHandle.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';

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
        engine.resizeRow(column.field, th.offsetWidth);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    th.appendChild(resizeHandle);
    headerRow.appendChild(th);
  });
  tableElement.appendChild(headerRow);

  // Create data rows
  if (state.groups.length > 0) {
    renderGroups(state.groups, tableElement);
  } else {
    renderRows(state.data, tableElement);
  }

  const container = document.getElementById('pivotTable');
  if (container) {
    container.innerHTML = '';
    container.appendChild(tableElement);
  } else {
    console.error('Container element with id "pivotTable" not found');
  }

  updateSortIcons(tableElement, state);
}

function renderGroups(groups, tableElement, level = 0) {
  groups.forEach(group => {
    const groupRow = document.createElement('tr');
    const groupCell = document.createElement('td');
    groupCell.colSpan = config.columns.length;
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

    config.columns.forEach((column) => {
      const td = document.createElement('td');
      td.textContent = row[column.field].toString();
      td.style.border = '1px solid #ddd';
      td.style.padding = '12px';
      tr.appendChild(td);
    });

    tableElement.appendChild(tr);
  });
}

function createDataRow(row, rowIndex) {
  const tr = document.createElement('tr');
  tr.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9';

  config.columns.forEach((column) => {
    const td = document.createElement('td');
    td.textContent = row[column.field].toString();
    td.style.border = '1px solid #ddd';
    td.style.padding = '12px';
    tr.appendChild(td);
  });

  return tr;
}

function updateSortIcons(tableElement, state) {
  const headers = tableElement.querySelectorAll('th');
  headers.forEach((th, index) => {
    const sortIcon = th.querySelector('.sort-icon');
    if (state.sortConfig && state.sortConfig.field === config.columns[index].field) {
      sortIcon.textContent = state.sortConfig.direction === 'asc' ? '▲' : '▼';
    } else {
      sortIcon.textContent = '▲▼';
    }
  });
}

function createGroupingControls() {
  const controlsContainer = document.createElement('div');
  controlsContainer.style.marginBottom = '20px';

  const select = document.createElement('select');
  select.multiple = true;
  select.style.width = '200px';

  config.columns.forEach(column => {
    const option = document.createElement('option');
    option.value = column.field;
    option.textContent = column.label;
    select.appendChild(option);
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
  });

  const label = document.createElement('label');
  label.textContent = 'Group by: ';
  label.appendChild(select);

  controlsContainer.appendChild(label);
  return controlsContainer;
}

function initializeTable() {
  const container = document.getElementById('pivotTable');
  if (container) {
    const controls = createGroupingControls();
    container.parentNode.insertBefore(controls, container);
  }

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
