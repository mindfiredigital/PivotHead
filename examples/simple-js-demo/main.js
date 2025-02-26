// Use PivotEngine directly from the global scope
import { PivotEngine } from '@mindfiredigital/pivot-head-core';

const sampleData = [
  {
    date: '2024-01-01',
    product: 'Widget A',
    region: 'North',
    sales: 1000,
    quantity: 50,
  },
  {
    date: '2024-01-01',
    product: 'Widget B',
    region: 'South',
    sales: 1500,
    quantity: 75,
  },
  {
    date: '2024-01-01',
    product: 'Widget D',
    region: 'North',
    sales: 1300,
    quantity: 70,
  },
  {
    date: '2024-01-02',
    product: 'Widget A',
    region: 'East',
    sales: 1200,
    quantity: 60,
  },
  {
    date: '2024-01-02',
    product: 'Widget A',
    region: 'East',
    sales: 100,
    quantity: 44,
  },
  {
    date: '2024-01-02',
    product: 'Widget C',
    region: 'West',
    sales: 800,
    quantity: 40,
  },
  {
    date: '2024-01-03',
    product: 'Widget B',
    region: 'North',
    sales: 1800,
    quantity: 90,
  },
  {
    date: '2024-01-03',
    product: 'Widget C',
    region: 'South',
    sales: 1100,
    quantity: 55,
  },
  {
    date: '2024-01-04',
    product: 'Widget A',
    region: 'West',
    sales: 1300,
    quantity: 65,
  },
  {
    date: '2024-01-04',
    product: 'Widget B',
    region: 'East',
    sales: 1600,
    quantity: 80,
  },
];

const config = {
  data: sampleData,
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      sortable: true,
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: {
        type: 'number',
        decimals: 0,
        locale: 'en-US',
      },
      sortable: false,
    },
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale',
      aggregation: 'avg',
      format: {
        type: 'currency',
        currency: 'USD',
        locale: 'en-US',
        decimals: 2,
      },
      formula: item => item.sales / item.quantity,
      sortable: true,
    },
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string', sortable: true },
    { field: 'region', label: 'Region', type: 'string', sortable: false },
    { field: 'date', label: 'Date', type: 'date', sortable: true },
    { field: 'sales', label: 'Sales', type: 'number', sortable: true },
    { field: 'quantity', label: 'Quantity', type: 'number', sortable: false },
  ],
  defaultAggregation: 'sum',
  isResponsive: true,
  toolbar: true,
  // Add initial sort configuration
  initialSort: [
    {
      field: 'sales',
      direction: 'desc',
      type: 'measure',
      aggregation: 'sum',
    },
  ],
  groupConfig: {
    rowFields: ['product'],
    columnFields: ['region'],
    grouper: (item, fields) => fields.map(field => item[field]).join(' - '),
  },
  formatting: {
    sales: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
    quantity: {
      type: 'number',
      decimals: 0,
      locale: 'en-US',
    },
    averageSale: {
      type: 'currency',
      currency: 'USD',
      locale: 'en-US',
      decimals: 2,
    },
  },
  conditionalFormatting: [
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '1000',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#4CAF50',
      },
    },
    {
      value: {
        type: 'Number',
        operator: 'Less than',
        value1: '500',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#F44336',
      },
    },
  ],
  onRowDragEnd: (fromIndex, toIndex, newData) => {
    console.log('Row dragged:', { fromIndex, toIndex, newData });
    renderTable();
  },
  onColumnDragEnd: (fromIndex, toIndex, newColumns) => {
    console.log('Column dragged:', { fromIndex, toIndex, newColumns });
    renderTable();
  },
};

// Create a single instance of PivotEngine
let pivotEngine;
// Store filtered data
let filteredData = [...sampleData];

// Initialize filter fields
function initializeFilters() {
  const filterField = document.getElementById('filterField');
  filterField.innerHTML = `
        <option value="product">Product</option>
        <option value="region">Region</option>
        <option value="sales">Sales</option>
        <option value="quantity">Quantity</option>
        <option value="date">Date</option>
    `;

  const filterOperator = document.getElementById('filterOperator');
  filterOperator.innerHTML = `
        <option value="equals">Equals</option>
        <option value="contains">Contains</option>
        <option value="greaterThan">Greater Than</option>
        <option value="lessThan">Less Than</option>
    `;
}

// Apply filter to data
function applyFilter(data, filter) {
  const filteredData = data.filter(item => {
    const fieldValue = item[filter.field];

    switch (filter.operator) {
      case 'equals':
        return fieldValue === filter.value;
      case 'contains':
        return String(fieldValue)
          .toLowerCase()
          .includes(String(filter.value).toLowerCase());
      case 'greaterThan':
        return parseFloat(fieldValue) > parseFloat(filter.value);
      case 'lessThan':
        return parseFloat(fieldValue) < parseFloat(filter.value);
      default:
        return true;
    }
  });

  // Create a new PivotEngine instance with the filtered data
  // This is a workaround since updateData is not available
  pivotEngine = new PivotEngine({
    ...config,
    data: filteredData,
  });

  return filteredData;
}

// Get paginated data
function getPaginatedData(data) {
  const paginationState = pivotEngine.getPaginationState();
  const start = (paginationState.currentPage - 1) * paginationState.pageSize;
  const end = start + paginationState.pageSize;
  return data.slice(start, end);
}

// Improved renderTable function
function renderTable() {
  try {
    const state = pivotEngine.getState();
    console.log('Current Engine State:', state);

    if (!state.processedData) {
      console.error('No processed data available');
      return;
    }

    console.log('Processed Data Headers:', state.processedData.headers);
    console.log('Processed Data Rows:', state.processedData.rows);

    const tableContainer = document.getElementById('pivotTable');

    // Clear previous content
    tableContainer.innerHTML = '';

    // Create table element
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    table.style.border = '1px solid #dee2e6';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Add headers from processed data
    state.processedData.headers.forEach((header, index) => {
      const th = document.createElement('th');
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';
      th.style.textAlign = 'center';

      // Use the header text directly without trying to format it
      th.textContent = header;

      th.dataset.index = index;

      // Make headers draggable (except the first one which is usually a label)
      if (index > 0) {
        th.setAttribute('draggable', 'true');
        th.style.cursor = 'move';
      }

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    // Add rows from processed data
    if (state.processedData.rows.length === 0) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = state.processedData.headers.length;
      emptyCell.style.textAlign = 'center';
      emptyCell.style.padding = '12px';
      emptyCell.textContent = 'No data found';
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
    } else {
      // Get paginated data if needed
      const rowsToRender = getPaginatedData(state.processedData.rows);

      rowsToRender.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        tr.dataset.rowIndex = rowIndex;
        tr.setAttribute('draggable', 'true');
        tr.style.cursor = 'move';

        row.forEach((cell, cellIndex) => {
          const td = document.createElement('td');

          // Style based on cell position
          if (cellIndex === 0) {
            // First column (row header)
            td.style.fontWeight = 'bold';
            td.style.padding = '8px';
            td.style.borderBottom = '1px solid #dee2e6';
            td.textContent = cell; // Display row header as is
          } else {
            // Data cells
            td.style.padding = '8px';
            td.style.borderBottom = '1px solid #dee2e6';
            td.style.borderRight = '1px solid #dee2e6';
            td.style.textAlign = 'right';

            // Format the cell value if it's a measure
            let formattedValue = cell;
            const rawValue = parseFloat(cell);

            // Only format if it's a number
            if (!isNaN(rawValue)) {
              const measureIndex = (cellIndex - 1) % state.measures.length;
              const measure = state.measures[measureIndex];

              if (measure) {
                // Apply formatting
                formattedValue = pivotEngine.formatValue(
                  rawValue,
                  measure.uniqueName
                );

                // Apply conditional formatting
                if (
                  config.conditionalFormatting &&
                  Array.isArray(config.conditionalFormatting)
                ) {
                  config.conditionalFormatting.forEach(rule => {
                    if (rule.value.type === 'Number' && !isNaN(rawValue)) {
                      let applyFormat = false;

                      switch (rule.value.operator) {
                        case 'Greater than':
                          applyFormat =
                            rawValue > parseFloat(rule.value.value1);
                          break;
                        case 'Less than':
                          applyFormat =
                            rawValue < parseFloat(rule.value.value1);
                          break;
                        case 'Equal to':
                          applyFormat =
                            rawValue === parseFloat(rule.value.value1);
                          break;
                        case 'Between':
                          applyFormat =
                            rawValue >= parseFloat(rule.value.value1) &&
                            rawValue <= parseFloat(rule.value.value2);
                          break;
                      }

                      if (applyFormat) {
                        if (rule.format.font)
                          td.style.fontFamily = rule.format.font;
                        if (rule.format.size)
                          td.style.fontSize = rule.format.size;
                        if (rule.format.color)
                          td.style.color = rule.format.color;
                        if (rule.format.backgroundColor)
                          td.style.backgroundColor =
                            rule.format.backgroundColor;
                      }
                    }
                  });
                }
              }
            }

            td.textContent = formattedValue;
          }

          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Update pagination info
    const paginationState = pivotEngine.getPaginationState();
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
      pageInfo.textContent = `Page ${paginationState.currentPage} of ${paginationState.totalPages}`;

      // Update button states
      document.getElementById('prevPage').disabled =
        paginationState.currentPage <= 1;
      document.getElementById('nextPage').disabled =
        paginationState.currentPage >= paginationState.totalPages;
    }

    // Set up drag and drop after rendering
    setupDragAndDrop();
  } catch (error) {
    console.error('Error rendering table:', error);

    // Display error message to user
    const tableContainer = document.getElementById('pivotTable');
    tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error rendering table: ${error.message}</div>`;
  }
}

// Reset filters
function resetFilters() {
  // Reset data to original
  filteredData = [...sampleData];

  // Update pagination
  updatePagination(filteredData.length);

  // Reset filter inputs
  document.getElementById('filterField').selectedIndex = 0;
  document.getElementById('filterOperator').selectedIndex = 0;
  document.getElementById('filterValue').value = '';

  // Re-render table
  renderTable();
}

// Update pagination based on data size
function updatePagination(dataLength) {
  const pageSize = Number(document.getElementById('pageSize').value);
  const totalPages = Math.ceil(dataLength / pageSize) || 1;

  pivotEngine.setPagination({
    pageSize,
    currentPage: 1,
    totalPages,
  });
}

// Event Listeners
function setupEventListeners() {
  // Filter button
  document.getElementById('applyFilter').addEventListener('click', () => {
    const field = document.getElementById('filterField').value;
    const operator = document.getElementById('filterOperator').value;
    const value = document.getElementById('filterValue').value;

    if (!value) {
      alert('Please enter a filter value');
      return;
    }

    // Apply filter
    const filter = { field, operator, value };
    filteredData = applyFilter(sampleData, filter);

    console.log('Filtered data:', filteredData);

    // Update pagination
    updatePagination(filteredData.length);

    // Render table with the updated data
    renderTable();
  });

  // Reset button
  document.getElementById('resetFilter').addEventListener('click', () => {
    // Reset data to original
    filteredData = [...sampleData];

    // Create a new PivotEngine instance with the original data
    pivotEngine = new PivotEngine({
      ...config,
      data: sampleData,
    });

    // Update pagination
    updatePagination(filteredData.length);

    // Reset filter inputs
    document.getElementById('filterField').selectedIndex = 0;
    document.getElementById('filterOperator').selectedIndex = 0;
    document.getElementById('filterValue').value = '';

    // Re-render table
    renderTable();
  });

  // Page size change
  document.getElementById('pageSize').addEventListener('change', e => {
    const pageSize = Number(e.target.value);
    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

    pivotEngine.setPagination({
      pageSize,
      currentPage: 1,
      totalPages,
    });

    renderTable();
  });

  // Previous page
  document.getElementById('prevPage').addEventListener('click', () => {
    const current = pivotEngine.getPaginationState();
    if (current.currentPage > 1) {
      pivotEngine.setPagination({
        ...current,
        currentPage: current.currentPage - 1,
      });
      renderTable();
    }
  });

  // Next page
  document.getElementById('nextPage').addEventListener('click', () => {
    const current = pivotEngine.getPaginationState();
    if (current.currentPage < current.totalPages) {
      pivotEngine.setPagination({
        ...current,
        currentPage: current.currentPage + 1,
      });
      renderTable();
    }
  });
}

// Update the addDraggableStyles function to include drag and drop styles
function addDraggableStyles() {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
        .dragging {
            opacity: 0.5;
            background-color: #f0f0f0;
        }
        
        .drag-over {
            border: 2px dashed #666 !important;
            background-color: #e9ecef !important;
        }
        
        th[draggable="true"], tr[draggable="true"] {
            cursor: move;
        }
        
        .controls-container {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .filter-container, .pagination-container {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        /* Make sure table is responsive */
        #pivotTable {
            overflow-x: auto;
            width: 100%;
        }
        
        /* Button styling */
        button {
            padding: 5px 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        
        /* Select and input styling */
        select, input {
            padding: 5px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
    `;
  document.head.appendChild(styleEl);
}

// Add HTML for filter and pagination controls
function addControlsHTML() {
  const container = document.createElement('div');
  container.className = 'controls-container';
  container.innerHTML = `
        <div class="filter-container">
            <select id="filterField"></select>
            <select id="filterOperator"></select>
            <input type="text" id="filterValue" placeholder="Filter value">
            <button id="applyFilter">Apply Filter</button>
            <button id="resetFilter">Reset</button>
        </div>
        <div class="pagination-container">
            <label>Items per page:</label>
            <select id="pageSize">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="25">25</option>
                <option value="50">50</option>
            </select>
            <button id="prevPage">Previous</button>
            <span id="pageInfo">Page 1 of 1</span>
            <button id="nextPage">Next</button>
        </div>
    `;

  // Insert before the table
  const pivotTable = document.getElementById('pivotTable');
  pivotTable.parentNode.insertBefore(container, pivotTable);
}

// Add this function to set up drag and drop functionality
function setupDragAndDrop() {
  // Set up column drag and drop
  const headers = document.querySelectorAll('th');
  let draggedColumnIndex = null;

  headers.forEach((header, index) => {
    if (index === 0) return; // Skip the first header (Product / Region)

    header.setAttribute('draggable', 'true');
    header.style.cursor = 'move';

    header.addEventListener('dragstart', e => {
      draggedColumnIndex = index;
      e.dataTransfer.setData('text/plain', index);
      setTimeout(() => header.classList.add('dragging'), 0);
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
    });

    header.addEventListener('dragover', e => {
      e.preventDefault();
    });

    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (
        draggedColumnIndex !== null &&
        draggedColumnIndex !== index &&
        index > 0
      ) {
        header.classList.add('drag-over');
      }
    });

    header.addEventListener('dragleave', () => {
      header.classList.remove('drag-over');
    });

    header.addEventListener('drop', e => {
      e.preventDefault();
      header.classList.remove('drag-over');

      if (
        draggedColumnIndex !== null &&
        draggedColumnIndex !== index &&
        index > 0
      ) {
        console.log(`Moving column from ${draggedColumnIndex} to ${index}`);

        // Adjust indices to account for the first column (Product / Region)
        const fromIndex = draggedColumnIndex - 1;
        const toIndex = index - 1;

        // Call the PivotEngine's column drag method
        pivotEngine.dragColumn(fromIndex, toIndex);

        // Re-render the table
        renderTable();
      }
      draggedColumnIndex = null;
    });
  });

  // Set up row drag and drop
  const rows = document.querySelectorAll('tbody tr');
  let draggedRowIndex = null;

  rows.forEach((row, index) => {
    if (index === rows.length - 1) return; // Skip the last row (Grand Total)

    row.setAttribute('draggable', 'true');
    row.style.cursor = 'move';

    row.addEventListener('dragstart', e => {
      draggedRowIndex = index;
      e.dataTransfer.setData('text/plain', index);
      setTimeout(() => row.classList.add('dragging'), 0);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
    });

    row.addEventListener('dragover', e => {
      e.preventDefault();
    });

    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (
        draggedRowIndex !== null &&
        draggedRowIndex !== index &&
        index < rows.length - 1
      ) {
        row.classList.add('drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });

    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');

      if (
        draggedRowIndex !== null &&
        draggedRowIndex !== index &&
        index < rows.length - 1
      ) {
        console.log(`Moving row from ${draggedRowIndex} to ${index}`);

        // Call the PivotEngine's row drag method
        pivotEngine.dragRow(draggedRowIndex, index);

        // Re-render the table
        renderTable();
      }
      draggedRowIndex = null;
    });
  });
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create PivotEngine instance
  pivotEngine = new PivotEngine(config);

  // Add draggable styles
  addDraggableStyles();

  // Add controls HTML
  addControlsHTML();

  // Initialize UI
  initializeFilters();
  setupEventListeners();

  // Set initial pagination
  updatePagination(sampleData.length);

  // Initial render
  renderTable();
});
