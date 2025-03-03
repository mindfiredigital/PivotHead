/* PivotHead Demo
 *
 * This file demonstrates the usage of the PivotheadCore library to create an interactive pivot table.
 * Features include:
 * - Sorting
 * - Grouping
 * - Column resizing
 * - Column reordering (drag and drop)
 * - Row reordering (drag and drop)
 */
import { createHeader } from './header/header.js';
// Use PivotEngine directly from the global scope
import { PivotEngine } from '@mindfiredigital/pivothead';
import { sampleData } from './config/config.js';
import { config } from './config/config.js';

// Create a single instance of PivotEngine
export let pivotEngine;
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

// Helper function to create sort icons
function createSortIcon(field, currentSortConfig) {
  const sortIcon = document.createElement('span');
  sortIcon.style.marginLeft = '5px';
  sortIcon.style.display = 'inline-block';

  // Check if this field is currently being sorted
  const isCurrentlySorted =
    currentSortConfig && currentSortConfig.field === field;

  if (isCurrentlySorted) {
    // Show the appropriate icon based on sort direction
    if (currentSortConfig.direction === 'asc') {
      sortIcon.innerHTML = '&#9650;'; // Up arrow
      sortIcon.title = 'Sorted ascending';
    } else {
      sortIcon.innerHTML = '&#9660;'; // Down arrow
      sortIcon.title = 'Sorted descending';
    }
    sortIcon.style.color = '#007bff'; // Highlight the active sort
  } else {
    // Show a neutral icon for unsorted fields
    sortIcon.innerHTML = '&#8693;'; // Up/down arrow
    sortIcon.title = 'Click to sort';
    sortIcon.style.color = '#6c757d';
    sortIcon.style.opacity = '0.5';
  }

  return sortIcon;
}

// Update the renderTable function to include sort icons
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

    const tableContainer = document.getElementById('myTable');

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

    // First header row for regions
    const regionHeaderRow = document.createElement('tr');

    // Add empty cell for top-left corner (Product/Region)
    const cornerCell = document.createElement('th');
    cornerCell.style.padding = '12px';
    cornerCell.style.backgroundColor = '#f8f9fa';
    cornerCell.style.borderBottom = '2px solid #dee2e6';
    cornerCell.style.borderRight = '1px solid #dee2e6';
    cornerCell.textContent = 'Product / Region';
    regionHeaderRow.appendChild(cornerCell);

    // Get unique regions
    const uniqueRegions = [...new Set(state.data.map(item => item.region))];

    // Add region headers with colspan for measures
    uniqueRegions.forEach((region, index) => {
      const th = document.createElement('th');
      th.textContent = region;
      th.colSpan = state.measures.length; // Span across all measures
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';
      th.style.textAlign = 'center';
      th.dataset.index = index + 1; // +1 because first cell is corner

      // Make headers draggable
      th.setAttribute('draggable', 'true');
      th.style.cursor = 'move';

      regionHeaderRow.appendChild(th);
    });

    thead.appendChild(regionHeaderRow);

    // Second header row for measures
    const measureHeaderRow = document.createElement('tr');

    // Get current sort configuration
    const currentSortConfig = state.sortConfig?.[0];

    // Add product header with sort icon
    const productHeader = document.createElement('th');
    productHeader.style.padding = '12px';
    productHeader.style.backgroundColor = '#f8f9fa';
    productHeader.style.borderBottom = '2px solid #dee2e6';
    productHeader.style.borderRight = '1px solid #dee2e6';
    productHeader.style.cursor = 'pointer';

    // Create a container for the header content to align text and icon
    const productHeaderContent = document.createElement('div');
    productHeaderContent.style.display = 'flex';
    productHeaderContent.style.alignItems = 'center';

    const productText = document.createElement('span');
    productText.textContent = 'Product';
    productHeaderContent.appendChild(productText);

    // Add sort icon for product
    const productSortIcon = createSortIcon('product', currentSortConfig);
    productHeaderContent.appendChild(productSortIcon);

    productHeader.appendChild(productHeaderContent);

    // Add sort functionality to product header
    productHeader.addEventListener('click', () => {
      const direction =
        currentSortConfig?.field === 'product' &&
        currentSortConfig?.direction === 'asc'
          ? 'desc'
          : 'asc';
      pivotEngine.sort('product', direction);
      renderTable();
    });

    measureHeaderRow.appendChild(productHeader);

    // Add measure headers for each region
    uniqueRegions.forEach(region => {
      state.measures.forEach(measure => {
        const th = document.createElement('th');
        th.style.padding = '12px';
        th.style.backgroundColor = '#f8f9fa';
        th.style.borderBottom = '2px solid #dee2e6';
        th.style.borderRight = '1px solid #dee2e6';
        th.style.cursor = 'pointer';

        // Create a container for the header content to align text and icon
        const headerContent = document.createElement('div');
        headerContent.style.display = 'flex';
        headerContent.style.alignItems = 'center';
        headerContent.style.justifyContent = 'space-between';

        const measureText = document.createElement('span');
        measureText.textContent = measure.caption;
        headerContent.appendChild(measureText);

        // Add sort icon for measure
        const sortIcon = createSortIcon(measure.uniqueName, currentSortConfig);
        headerContent.appendChild(sortIcon);

        th.appendChild(headerContent);

        // Add sort functionality
        th.addEventListener('click', () => {
          const direction =
            currentSortConfig?.field === measure.uniqueName &&
            currentSortConfig?.direction === 'asc'
              ? 'desc'
              : 'asc';
          pivotEngine.sort(measure.uniqueName, direction);
          renderTable();
        });

        measureHeaderRow.appendChild(th);
      });
    });

    thead.appendChild(measureHeaderRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    // Get unique products
    const uniqueProducts = [...new Set(state.data.map(item => item.product))];

    // Add rows for each product
    uniqueProducts.forEach((product, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIndex;
      tr.setAttribute('draggable', 'true');
      tr.style.cursor = 'move';

      // Add product cell
      const productCell = document.createElement('td');
      productCell.textContent = product;
      productCell.style.fontWeight = 'bold';
      productCell.style.padding = '8px';
      productCell.style.borderBottom = '1px solid #dee2e6';
      tr.appendChild(productCell);

      // Add data cells for each region and measure
      uniqueRegions.forEach(region => {
        // Filter data for this product and region
        const filteredData = state.data.filter(
          item => item.product === product && item.region === region
        );

        // Add cells for each measure
        state.measures.forEach(measure => {
          const td = document.createElement('td');
          td.style.padding = '8px';
          td.style.borderBottom = '1px solid #dee2e6';
          td.style.borderRight = '1px solid #dee2e6';
          td.style.textAlign = 'right';

          // Calculate the value based on aggregation
          let value = 0;
          if (filteredData.length > 0) {
            switch (measure.aggregation) {
              case 'sum':
                value = filteredData.reduce(
                  (sum, item) => sum + (item[measure.uniqueName] || 0),
                  0
                );
                break;
              case 'avg':
                if (measure.formula) {
                  // Use formula if provided
                  value =
                    filteredData.reduce(
                      (sum, item) => sum + measure.formula(item),
                      0
                    ) / filteredData.length;
                } else {
                  value =
                    filteredData.reduce(
                      (sum, item) => sum + (item[measure.uniqueName] || 0),
                      0
                    ) / filteredData.length;
                }
                break;
              case 'max':
                value = Math.max(
                  ...filteredData.map(item => item[measure.uniqueName] || 0)
                );
                break;
              case 'min':
                value = Math.min(
                  ...filteredData.map(item => item[measure.uniqueName] || 0)
                );
                break;
              default:
                value = 0;
            }
          }

          // Format the value
          let formattedValue = value;
          if (measure.format) {
            if (measure.format.type === 'currency') {
              formattedValue = new Intl.NumberFormat(measure.format.locale, {
                style: 'currency',
                currency: measure.format.currency,
                minimumFractionDigits: measure.format.decimals,
                maximumFractionDigits: measure.format.decimals,
              }).format(value);
            } else if (measure.format.type === 'number') {
              formattedValue = new Intl.NumberFormat(measure.format.locale, {
                minimumFractionDigits: measure.format.decimals,
                maximumFractionDigits: measure.format.decimals,
              }).format(value);
            }
          }

          td.textContent = formattedValue;

          // Apply conditional formatting
          if (
            config.conditionalFormatting &&
            Array.isArray(config.conditionalFormatting)
          ) {
            config.conditionalFormatting.forEach(rule => {
              if (rule.value.type === 'Number' && !isNaN(value)) {
                let applyFormat = false;

                switch (rule.value.operator) {
                  case 'Greater than':
                    applyFormat = value > parseFloat(rule.value.value1);
                    break;
                  case 'Less than':
                    applyFormat = value < parseFloat(rule.value.value1);
                    break;
                  case 'Equal to':
                    applyFormat = value === parseFloat(rule.value.value1);
                    break;
                  case 'Between':
                    applyFormat =
                      value >= parseFloat(rule.value.value1) &&
                      value <= parseFloat(rule.value.value2);
                    break;
                }

                if (applyFormat) {
                  if (rule.format.font) td.style.fontFamily = rule.format.font;
                  if (rule.format.size) td.style.fontSize = rule.format.size;
                  if (rule.format.color) td.style.color = rule.format.color;
                  if (rule.format.backgroundColor)
                    td.style.backgroundColor = rule.format.backgroundColor;
                }
              }
            });
          }

          tr.appendChild(td);
        });
      });

      tbody.appendChild(tr);
    });

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
    const tableContainer = document.getElementById('myTable');
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

export function formatTable(config) {
  pivotEngine = new PivotEngine(config);
  renderTable();
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

// Update the addDraggableStyles function to include styles for sort icons
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
        
        /* Sort icon styles */
        .sort-icon {
            margin-left: 5px;
            display: inline-block;
            transition: transform 0.2s;
        }
        
        th:hover .sort-icon {
            opacity: 1 !important;
        }
        
        /* Header hover effect */
        th[data-sortable="true"]:hover {
            background-color: #e9ecef !important;
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
        #myTable {
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
  // Check if controls already exist
  if (document.querySelector('.controls-container')) {
    return; // Controls already added, don't add again
  }
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
                <option value="1">1</option>
                <option value="2" selected>2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>
            <button id="prevPage">Previous</button>
            <span id="pageInfo">Page 1 of 1</span>
            <button id="nextPage">Next</button>
        </div>
    `;

  // Insert before the table
  const myTable = document.getElementById('myTable');
  myTable.parentNode.insertBefore(container, myTable);
}

// Add this function to set up drag and drop functionality
function setupDragAndDrop() {
  // Set up column drag and drop
  const headers = document.querySelectorAll('th[draggable="true"]');
  let draggedColumnIndex = null;

  // Get the state to understand column structure
  const state = pivotEngine.getState();
  const uniqueRegions = [...new Set(state.data.map(item => item.region))];
  const measuresPerRegion = state.measures.length;

  headers.forEach(header => {
    // Use dataset.index if available, otherwise fallback to calculating index
    const headerIndex = header.dataset.index
      ? parseInt(header.dataset.index)
      : null;

    header.addEventListener('dragstart', e => {
      draggedColumnIndex = headerIndex;
      e.dataTransfer.setData('text/plain', headerIndex);
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
        draggedColumnIndex !== headerIndex &&
        headerIndex !== null
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
        draggedColumnIndex !== headerIndex &&
        headerIndex !== null
      ) {
        console.log(
          `Moving column from ${draggedColumnIndex} to ${headerIndex}`
        );

        // Adjust indices for the pivot engine's internal column structure
        // Convert UI header index to pivot engine column index (0-based)
        const fromIndex = draggedColumnIndex;
        const toIndex = headerIndex;

        // Validate indices are within range
        if (fromIndex >= 0 && toIndex >= 0) {
          try {
            // Call the PivotEngine's column drag method
            pivotEngine.dragColumn(fromIndex, toIndex);

            // Re-render the table
            renderTable();
          } catch (error) {
            console.error('Error during drag operation:', error);
          }
        } else {
          console.warn(
            'Invalid column indices for drag operation:',
            fromIndex,
            toIndex
          );
        }
      }
      draggedColumnIndex = null;
    });
  });

  // Set up row drag and drop
  const rows = document.querySelectorAll('tbody tr');
  let draggedRowIndex = null;

  rows.forEach((row, index) => {
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
        index < rows.length
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
        index < rows.length
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
export function onSectionItemDrop(droppedFields) {
  let droppedFieldsInSections = JSON.stringify({
    rows: Array.from(droppedFields.rows),
    columns: Array.from(droppedFields.columns),
    values: Array.from(droppedFields.values),
    filters: Array.from(droppedFields.filters),
  });
  const parsedDroppedFieldsInSections = JSON.parse(droppedFieldsInSections);

  const transformedRows = parsedDroppedFieldsInSections.rows.map(rowField => {
    return { uniqueName: rowField.toLowerCase(), caption: rowField };
  });
  const transformedColumns = parsedDroppedFieldsInSections.columns.map(
    columnField => {
      return { uniqueName: columnField.toLowerCase(), caption: columnField };
    }
  );
  // const transformedValues=parsedDroppedFieldsInSections.values.map((valueField)=>{ return { uniqueName:valueField.toLowerCase(), caption:valueField}})
  // const transformedFilters=parsedDroppedFieldsInSections.filters.map((filterField)=>{ return { uniqueName:filterField.toLowerCase(), caption:filterField}})

  //TODO: for now only-applicable to rows and columns, will do the same for values and global filters in next iteration
  pivotEngine.state.rows = transformedRows;
  pivotEngine.state.columns = transformedColumns;

  renderTable();
}
// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create PivotEngine instance
  pivotEngine = new PivotEngine(config);

  if (config.toolbar) {
    createHeader(config);
  }
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
