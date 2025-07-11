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
let showProcessedData = true;

// Manage pagination state locally
let paginationState = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
};

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

// Replace your applyFilter function with this fixed version:
function applyFilter(data, filter) {
  const newFilteredData = data.filter(item => {
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

  // Update the global filteredData variable
  filteredData = newFilteredData;

  // Create a new PivotEngine instance with the filtered data
  pivotEngine = new PivotEngine({
    ...config,
    data: newFilteredData,
  });

  return newFilteredData;
}

// Get paginated data
function getPaginatedData(data, paginationState) {
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

function renderRawDataTable() {
  const rawData = pivotEngine.getState().rawData;
  const tableContainer = document.getElementById('myTable');
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '20px';
  table.style.border = '1px solid #dee2e6';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = Object.keys(rawData[0]);
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.style.padding = '12px';
    th.style.backgroundColor = '#f8f9fa';
    th.style.borderBottom = '2px solid #dee2e6';
    th.style.borderRight = '1px solid #dee2e6';
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rawData.forEach(rowData => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.style.padding = '8px';
      td.style.borderBottom = '1px solid #dee2e6';
      td.style.borderRight = '1px solid #dee2e6';
      td.textContent = rowData[header];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableContainer.appendChild(table);
}

// Add this new function to ensure data consistency:
function ensureDataConsistency() {
  const state = pivotEngine.getState();
  console.log('Checking data consistency:');
  console.log('- sampleData length:', sampleData.length);
  console.log('- filteredData length:', filteredData.length);
  console.log('- state.data length:', state.data.length);
  console.log('- state.rawData length:', state.rawData.length);

  // Check for inconsistency
  const hasInconsistency = state.rawData.length !== filteredData.length;

  if (hasInconsistency) {
    console.log(
      'Data inconsistency detected, preserving custom orders during reinit...'
    );

    // Preserve custom orders before reinitializing
    const customRegionOrder =
      pivotEngine.getCustomRegionOrder && pivotEngine.getCustomRegionOrder();
    const preservedRegionOrder = customRegionOrder || window.swappedRegionOrder;

    console.log('Preserving region order:', preservedRegionOrder);

    // Reinitialize the engine
    pivotEngine = new PivotEngine({
      ...config,
      data: filteredData,
    });

    // Restore custom region order if it existed
    if (preservedRegionOrder && preservedRegionOrder.length > 0) {
      console.log('Restoring preserved region order:', preservedRegionOrder);

      // Store it in the engine state
      if (pivotEngine.state) {
        pivotEngine.state.customRegionOrder = preservedRegionOrder;
      }

      // Also store in window as backup
      window.swappedRegionOrder = preservedRegionOrder;
    }
  }
}

function getOrderedRegions(state) {
  // First try to get custom region order from the pivot engine
  if (pivotEngine.getCustomRegionOrder) {
    const customOrder = pivotEngine.getCustomRegionOrder();
    if (customOrder && customOrder.length > 0) {
      console.log('Using custom region order from engine:', customOrder);
      return customOrder;
    }
  }

  // Check if the state has custom region order
  if (state.customRegionOrder && state.customRegionOrder.length > 0) {
    console.log(
      'Using custom region order from state:',
      state.customRegionOrder
    );
    return state.customRegionOrder;
  }

  // Fall back to swapped region order if available
  if (window.swappedRegionOrder && window.swappedRegionOrder.length > 0) {
    console.log('Using swapped region order:', window.swappedRegionOrder);
    return window.swappedRegionOrder;
  }

  const uniqueRegions = [...new Set(state.rawData.map(item => item.region))];
  console.log('Using natural region order:', uniqueRegions);
  return uniqueRegions;
}
// Update your renderTable function with data consistency check:
function renderTable() {
  if (!showProcessedData) {
    renderRawDataTable();
    return;
  }

  try {
    // CRITICAL: Ensure data consistency before rendering
    ensureDataConsistency();

    const state = pivotEngine.getState();
    console.log('Current Engine State:', state);

    if (!state.processedData) {
      console.error('No processed data available');
      return;
    }

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

    // Get unique regions from current state data
    // const uniqueRegions = [...new Set(state.rawData.map(item => item.region))];
    const uniqueRegions = getOrderedRegions(state);

    // Add region headers with colspan for measures
    uniqueRegions.forEach((region, index) => {
      const th = document.createElement('th');
      th.textContent = region;
      th.colSpan = state.measures.length;
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';
      th.style.textAlign = 'center';
      th.dataset.index = index + 1;

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

    // CRITICAL: Get all unique products in their current order from the engine's data
    const allUniqueProducts = [
      ...new Set(state.rawData.map(item => item.product)),
    ];

    // Update pagination to ensure it's based on current data
    updatePagination(state.rawData, false);

    // Get paginated products for CURRENT PAGE ONLY
    const paginatedProducts = getPaginatedData(
      allUniqueProducts,
      paginationState
    );

    console.log('All unique products:', allUniqueProducts);
    console.log('Products for current page:', paginatedProducts);
    console.log('Current pagination state:', paginationState);

    // Add rows for ONLY the paginated products
    paginatedProducts.forEach((product, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIndex; // This is the row index within the current page
      tr.dataset.product = product; // Store the product name
      tr.dataset.globalIndex = allUniqueProducts.indexOf(product); // Store global index
      tr.setAttribute('draggable', 'true');
      tr.style.cursor = 'move';

      // Add product cell
      const productCell = document.createElement('td');
      productCell.textContent = product;
      productCell.style.fontWeight = 'bold';
      productCell.style.padding = '8px';
      productCell.style.borderBottom = '1px solid #dee2e6';
      productCell.style.borderRight = '1px solid #dee2e6';
      productCell.className = 'product-cell'; // Add class for easy identification
      tr.appendChild(productCell);

      // Add data cells for each region and measure
      uniqueRegions.forEach(region => {
        // Filter data from state.rawData for this product and region
        const filteredDataForProduct = state.rawData.filter(
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
          if (filteredDataForProduct.length > 0) {
            switch (measure.aggregation) {
              case 'sum':
                value = filteredDataForProduct.reduce(
                  (sum, item) => sum + (item[measure.uniqueName] || 0),
                  0
                );
                break;
              case 'avg':
                if (measure.formula) {
                  value =
                    filteredDataForProduct.reduce(
                      (sum, item) => sum + measure.formula(item),
                      0
                    ) / filteredDataForProduct.length;
                } else {
                  value =
                    filteredDataForProduct.reduce(
                      (sum, item) => sum + (item[measure.uniqueName] || 0),
                      0
                    ) / filteredDataForProduct.length;
                }
                break;
              case 'max':
                value = Math.max(
                  ...filteredDataForProduct.map(
                    item => item[measure.uniqueName] || 0
                  )
                );
                break;
              case 'min':
                value = Math.min(
                  ...filteredDataForProduct.map(
                    item => item[measure.uniqueName] || 0
                  )
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
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
      pageInfo.textContent = `Page ${paginationState.currentPage} of ${paginationState.totalPages}`;

      // Update button states
      const prevButton = document.getElementById('prevPage');
      const nextButton = document.getElementById('nextPage');
      if (prevButton) prevButton.disabled = paginationState.currentPage <= 1;
      if (nextButton)
        nextButton.disabled =
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
// Replace your resetFilters function with this:
function resetFilters() {
  // Reset data to original
  filteredData = [...sampleData];

  // Create a new PivotEngine instance with the original data
  pivotEngine = new PivotEngine({
    ...config,
    data: sampleData, // Use original sample data
  });

  // Update pagination
  updatePagination(sampleData, true);

  // Reset filter inputs
  document.getElementById('filterField').selectedIndex = 0;
  document.getElementById('filterOperator').selectedIndex = 0;
  document.getElementById('filterValue').value = '';

  // Re-render table
  renderTable();
}

// Update pagination based on data size
function updatePagination(data, resetPage = false) {
  // Always get unique products from the current engine state
  const state = pivotEngine.getState();
  const uniqueProducts = [...new Set(state.rawData.map(item => item.product))];

  // Get pageSize from the select element, with fallback
  const pageSizeElement = document.getElementById('pageSize');
  const pageSize = pageSizeElement ? Number(pageSizeElement.value) : 10;
  const totalPages = Math.ceil(uniqueProducts.length / pageSize) || 1;

  console.log(
    'updatePagination - Total unique products:',
    uniqueProducts.length
  );
  console.log('updatePagination - Page size:', pageSize);
  console.log('updatePagination - Total pages:', totalPages);

  if (resetPage) {
    paginationState.currentPage = 1;
  } else {
    // Ensure current page doesn't exceed total pages
    if (paginationState.currentPage > totalPages) {
      paginationState.currentPage = totalPages;
    }
  }

  paginationState.pageSize = pageSize;
  paginationState.totalPages = totalPages;

  // Keep the engine in sync
  pivotEngine.setPagination(paginationState);

  console.log('Updated pagination state:', paginationState);
}

export function formatTable(config) {
  pivotEngine = new PivotEngine(config);
  renderTable();
}

// Event Listeners
function setupEventListeners() {
  document.getElementById('switchView').addEventListener('click', () => {
    showProcessedData = !showProcessedData;
    renderTable();
  });
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
    updatePagination(filteredData, true);

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
    updatePagination(filteredData, true);

    // Reset filter inputs
    document.getElementById('filterField').selectedIndex = 0;
    document.getElementById('filterOperator').selectedIndex = 0;
    document.getElementById('filterValue').value = '';

    // Re-render table
    renderTable();
  });

  // Page size change
  document.getElementById('pageSize').addEventListener('change', e => {
    updatePagination(filteredData, true);
    renderTable();
  });

  // Previous page
  document.getElementById('prevPage').addEventListener('click', () => {
    if (paginationState.currentPage > 1) {
      paginationState.currentPage--;
      pivotEngine.setPagination(paginationState);
      renderTable();
    }
  });

  // Next page
  document.getElementById('nextPage').addEventListener('click', () => {
    if (paginationState.currentPage < paginationState.totalPages) {
      paginationState.currentPage++;
      pivotEngine.setPagination(paginationState);
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
            <button id="switchView">Switch View</button>
        </div>
        <div class="pagination-container">
            <label>Items per page:</label>
            <select id="pageSize">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="10" selected>10</option>
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
// Replace your setupDragAndDrop function with this version that includes column swapping:

// Update your setupDragAndDrop function column section:
function setupDragAndDrop() {
  // ENHANCED: Column drag and drop with SWAPPING
  const headers = document.querySelectorAll('th[draggable="true"]');
  let draggedColumnIndex = null;
  let draggedRegionName = null;

  console.log('Setting up drag and drop, found headers:', headers.length);

  const state = pivotEngine.getState();
  const uniqueRegions = getOrderedRegions(state);

  console.log('Current regions for drag setup:', uniqueRegions);

  headers.forEach((header, headerIdx) => {
    const headerIndex = header.dataset.index
      ? parseInt(header.dataset.index)
      : null;
    const regionName = header.textContent ? header.textContent.trim() : null;

    console.log(
      `Setting up header ${headerIdx}: index=${headerIndex}, region=${regionName}`
    );

    if (headerIndex === null || !regionName) {
      console.warn('Header missing index or region name:', header);
      return;
    }

    // Convert header index to region array index (subtract 1 because of corner cell)
    const regionIndex = headerIndex - 1;

    // Validate that this region exists in our current order
    if (regionIndex < 0 || regionIndex >= uniqueRegions.length) {
      console.warn(
        'Region index out of bounds:',
        regionIndex,
        'for region:',
        regionName
      );
      return;
    }

    header.addEventListener('dragstart', e => {
      draggedColumnIndex = regionIndex;
      draggedRegionName = regionName;
      e.dataTransfer.setData('text/plain', regionName);
      setTimeout(() => header.classList.add('dragging'), 0);
      console.log(
        'Column drag started for region:',
        regionName,
        'Index:',
        regionIndex
      );
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
      draggedColumnIndex = null;
      draggedRegionName = null;
      console.log('Column drag ended');
    });

    header.addEventListener('dragover', e => {
      e.preventDefault();
    });

    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedRegionName && draggedRegionName !== regionName) {
        header.classList.add('drag-over');
      }
    });

    header.addEventListener('dragleave', () => {
      header.classList.remove('drag-over');
    });

    header.addEventListener('drop', e => {
      e.preventDefault();
      header.classList.remove('drag-over');

      const targetRegionName = regionName;
      const targetRegionIndex = regionIndex;

      if (
        draggedRegionName &&
        targetRegionName &&
        draggedRegionName !== targetRegionName
      ) {
        console.log(
          `Attempting to swap column ${draggedRegionName} (index: ${draggedColumnIndex}) with ${targetRegionName} (index: ${targetRegionIndex})`
        );

        try {
          // Use the core swap method
          pivotEngine.swapDataColumns(draggedColumnIndex, targetRegionIndex);

          console.log('Core column swap completed, re-rendering...');

          // Re-render the table
          renderTable();
        } catch (error) {
          console.error('Error during column swap operation:', error);

          // Fallback to manual swap if core method fails
          console.log('Falling back to manual column swap...');
          swapRegionsInEngine(draggedColumnIndex, targetRegionIndex);
          renderTable();
        }
      } else {
        console.log('Invalid column swap attempt:', {
          draggedRegionName,
          targetRegionName,
          draggedColumnIndex,
          targetRegionIndex,
        });
      }
    });
  });

  // Row drag and drop code (keep existing)...
  const rows = document.querySelectorAll('tbody tr[draggable="true"]');
  let draggedProductName = null;
  let draggedGlobalIndex = null;

  rows.forEach(row => {
    const productCell = row.querySelector('.product-cell');
    const productName = productCell ? productCell.textContent.trim() : null;
    const globalIndex = parseInt(row.dataset.globalIndex);

    if (!productName) {
      console.warn('Product name not found for row');
      return;
    }

    row.addEventListener('dragstart', e => {
      draggedProductName = productName;
      draggedGlobalIndex = globalIndex;
      e.dataTransfer.setData('text/plain', productName);
      setTimeout(() => row.classList.add('dragging'), 0);
      console.log(
        'Drag started for product:',
        productName,
        'Global index:',
        globalIndex
      );
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      draggedProductName = null;
      draggedGlobalIndex = null;
    });

    row.addEventListener('dragover', e => {
      e.preventDefault();
    });

    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedProductName && draggedProductName !== productName) {
        row.classList.add('drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });

    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');

      const targetProductCell = row.querySelector('.product-cell');
      const targetProductName = targetProductCell
        ? targetProductCell.textContent.trim()
        : null;
      const targetGlobalIndex = parseInt(row.dataset.globalIndex);

      if (!targetProductName) {
        console.warn('Target product name not found');
        return;
      }

      if (
        draggedProductName &&
        targetProductName &&
        draggedProductName !== targetProductName
      ) {
        console.log(
          `Swapping ${draggedProductName} (global: ${draggedGlobalIndex}) with ${targetProductName} (global: ${targetGlobalIndex})`
        );

        try {
          if (typeof pivotEngine.swapDataRows === 'function') {
            pivotEngine.swapDataRows(draggedGlobalIndex, targetGlobalIndex);
          } else {
            swapProductsInEngine(draggedGlobalIndex, targetGlobalIndex);
          }

          renderTable();
        } catch (error) {
          console.error('Error during row swap operation:', error);
        }
      }
    });
  });
}

// Add this new function to handle region/column swapping:
// Keep the manual swap function as fallback:
function swapRegionsInEngine(fromIndex, toIndex) {
  const state = pivotEngine.getState();
  const currentRegions = getOrderedRegions(state);

  console.log(
    'Manual column swap - From index:',
    fromIndex,
    'To index:',
    toIndex
  );
  console.log('Current regions:', currentRegions);

  // Validate indices
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= currentRegions.length ||
    toIndex >= currentRegions.length
  ) {
    console.error('Invalid indices for column swap:', fromIndex, toIndex);
    return;
  }

  if (fromIndex === toIndex) {
    console.log('Same column, no swap needed');
    return;
  }

  // Get the region names to swap
  const fromRegion = currentRegions[fromIndex];
  const toRegion = currentRegions[toIndex];

  if (!fromRegion || !toRegion) {
    console.error('Invalid regions for swap:', fromRegion, toRegion);
    return;
  }

  // Create swapped region order
  const swappedRegions = [...currentRegions];
  swappedRegions[fromIndex] = toRegion;
  swappedRegions[toIndex] = fromRegion;

  console.log('After manual swap - Regions:', swappedRegions);

  // Store the swapped region order in multiple places for persistence
  window.swappedRegionOrder = swappedRegions;

  // Also store in the engine state if possible
  if (pivotEngine.state) {
    pivotEngine.state.customRegionOrder = swappedRegions;
  }

  console.log(
    'Manual column swap completed. New region order:',
    swappedRegions
  );
}

// Keep the existing swapProductsInEngine function for rows:
function swapProductsInEngine(fromIndex, toIndex) {
  const state = pivotEngine.getState();
  const allUniqueProducts = [
    ...new Set(state.rawData.map(item => item.product)),
  ];

  console.log('Manual swap - From index:', fromIndex, 'To index:', toIndex);
  console.log('Before swap - Products:', allUniqueProducts);

  // Get the product names to swap
  const fromProduct = allUniqueProducts[fromIndex];
  const toProduct = allUniqueProducts[toIndex];

  if (!fromProduct || !toProduct) {
    console.error('Invalid products for swap:', fromProduct, toProduct);
    return;
  }

  // Create new data array with swapped product order
  const newData = [...state.rawData];

  // Create swapped product order
  const swappedProducts = [...allUniqueProducts];
  swappedProducts[fromIndex] = toProduct;
  swappedProducts[toIndex] = fromProduct;

  console.log('After swap - Products:', swappedProducts);

  // Sort data according to the new product order
  newData.sort((a, b) => {
    const aIndex = swappedProducts.indexOf(a.product);
    const bIndex = swappedProducts.indexOf(b.product);
    return aIndex - bIndex;
  });

  // Update filteredData to maintain consistency
  if (filteredData) {
    filteredData.sort((a, b) => {
      const aIndex = swappedProducts.indexOf(a.product);
      const bIndex = swappedProducts.indexOf(b.product);
      return aIndex - bIndex;
    });
  }

  // Create new engine with swapped data
  pivotEngine = new PivotEngine({
    ...config,
    data: newData,
  });

  console.log('Swap completed. New product order:', [
    ...new Set(pivotEngine.getState().rawData.map(item => item.product)),
  ]);
}

// Update the renderTable function to use swapped region order if available:
// Add this to the region header generation part of your renderTable function:

// In your renderTable function, replace the region header generation with this:
// function getOrderedRegions(state) {
//   // Use swapped region order if available, otherwise use natural order
//   if (window.swappedRegionOrder && window.swappedRegionOrder.length > 0) {
//     console.log('Using swapped region order:', window.swappedRegionOrder);
//     return window.swappedRegionOrder;
//   }

//   const uniqueRegions = [...new Set(state.rawData.map(item => item.region))];
//   console.log('Using natural region order:', uniqueRegions);
//   return uniqueRegions;
// }

// Add this new function to handle swapping when the core engine doesn't have a swap method:
// function swapProductsInEngine(fromIndex, toIndex) {
//   const state = pivotEngine.getState();
//   const allUniqueProducts = [...new Set(state.rawData.map(item => item.product))];

//   console.log('Manual swap - From index:', fromIndex, 'To index:', toIndex);
//   console.log('Before swap - Products:', allUniqueProducts);

//   // Get the product names to swap
//   const fromProduct = allUniqueProducts[fromIndex];
//   const toProduct = allUniqueProducts[toIndex];

//   if (!fromProduct || !toProduct) {
//     console.error('Invalid products for swap:', fromProduct, toProduct);
//     return;
//   }

//   // Create new data array with swapped product order
//   const newData = [...state.rawData];

//   // Create swapped product order
//   const swappedProducts = [...allUniqueProducts];
//   swappedProducts[fromIndex] = toProduct;
//   swappedProducts[toIndex] = fromProduct;

//   console.log('After swap - Products:', swappedProducts);

//   // Sort data according to the new product order
//   newData.sort((a, b) => {
//     const aIndex = swappedProducts.indexOf(a.product);
//     const bIndex = swappedProducts.indexOf(b.product);
//     return aIndex - bIndex;
//   });

//   // Update filteredData to maintain consistency
//   if (filteredData) {
//     filteredData.sort((a, b) => {
//       const aIndex = swappedProducts.indexOf(a.product);
//       const bIndex = swappedProducts.indexOf(b.product);
//       return aIndex - bIndex;
//     });
//   }

//   // Create new engine with swapped data
//   pivotEngine = new PivotEngine({
//     ...config,
//     data: newData,
//   });

//   console.log('Swap completed. New product order:', [...new Set(pivotEngine.getState().rawData.map(item => item.product))]);
// }

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
// Replace your initialization section at the bottom with this:
document.addEventListener('DOMContentLoaded', () => {
  // CRITICAL: Ensure we start with all the original data
  console.log('Initializing with sampleData:', sampleData.length, 'items');

  // Reset filteredData to ensure we have all data
  filteredData = [...sampleData];

  // Create PivotEngine instance with all data
  pivotEngine = new PivotEngine({
    ...config,
    data: sampleData, // Use original sample data, not filtered
  });

  console.log('Initial pivot engine state:', pivotEngine.getState());

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

  // CRITICAL: Set initial pagination with all sample data
  updatePagination(sampleData, true);

  // Initial render
  renderTable();
});
