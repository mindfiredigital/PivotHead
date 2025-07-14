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
let currentViewMode = 'processed'; // 'raw' or 'processed'

// Manage pagination state locally
let paginationState = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
};

// Initialize filter fields
// function initializeFilters() {
//   const filterField = document.getElementById('filterField');
//   filterField.innerHTML = `
//         <option value="product">Product</option>
//         <option value="region">Region</option>
//         <option value="sales">Sales</option>
//         <option value="quantity">Quantity</option>
//         <option value="date">Date</option>
//     `;

//   const filterOperator = document.getElementById('filterOperator');
//   filterOperator.innerHTML = `
//         <option value="equals">Equals</option>
//         <option value="contains">Contains</option>
//         <option value="greaterThan">Greater Than</option>
//         <option value="lessThan">Less Than</option>
//     `;
// }

function initializeFilters() {
  const filterField = document.getElementById('filterField');
  filterField.innerHTML = `
    <option value="country">Country</option>
    <option value="category">Category</option>
    <option value="price">Price</option>
    <option value="discount">Discount</option>
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
function sortRawDataByColumn(columnName, rawData) {
  console.log(`Sorting raw data by column: ${columnName}`);

  // Get current sort state
  const currentSort = window.rawDataSort || {};
  const direction =
    currentSort.column === columnName && currentSort.direction === 'asc'
      ? 'desc'
      : 'asc';

  // Sort the data
  rawData.sort((a, b) => {
    let aVal = a[columnName];
    let bVal = b[columnName];

    // Handle different data types
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Store sort state
  window.rawDataSort = { column: columnName, direction };

  // Update the global data arrays to maintain sort
  if (filteredData === rawData) {
    filteredData = [...rawData];
  }

  console.log(`Sorted raw data by ${columnName} (${direction})`);
  renderRawDataTable();
}

function swapRawDataRows(fromIndex, toIndex, rawData) {
  console.log('Swapping raw data rows:', fromIndex, '->', toIndex);

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= rawData.length ||
    toIndex >= rawData.length
  ) {
    console.error('Invalid row indices for raw data swap');
    return;
  }

  // Swap the rows in the raw data array
  const temp = rawData[fromIndex];
  rawData[fromIndex] = rawData[toIndex];
  rawData[toIndex] = temp;

  // Update filteredData if it's the same reference
  if (
    filteredData === rawData ||
    (filteredData && filteredData.length === rawData.length)
  ) {
    filteredData = [...rawData];
  }

  console.log('Raw data rows swapped successfully');
}

// Keep existing swapRawDataColumns function or add this if missing:
function swapRawDataColumns(fromIndex, toIndex) {
  // Store the column order preference for raw data
  if (!window.rawDataColumnOrder) {
    const rawData = filteredData.length > 0 ? filteredData : sampleData;
    const headers = rawData.length > 0 ? Object.keys(rawData[0]) : [];
    window.rawDataColumnOrder = [...headers];
  }

  // Swap in the column order array
  const temp = window.rawDataColumnOrder[fromIndex];
  window.rawDataColumnOrder[fromIndex] = window.rawDataColumnOrder[toIndex];
  window.rawDataColumnOrder[toIndex] = temp;

  console.log('Raw data column order updated:', window.rawDataColumnOrder);
}

function renderRawDataTable() {
  try {
    console.log('Rendering raw data table');

    // Get data source
    let rawDataToUse;
    if (filteredData && filteredData.length > 0) {
      rawDataToUse = filteredData;
      console.log(
        'Using filteredData for raw view:',
        filteredData.length,
        'items'
      );
    } else if (sampleData && sampleData.length > 0) {
      rawDataToUse = sampleData;
      console.log('Using sampleData for raw view:', sampleData.length, 'items');
    } else {
      const state = pivotEngine.getState();
      rawDataToUse = state.data || state.rawData || [];
      console.log(
        'Using engine data for raw view:',
        rawDataToUse.length,
        'items'
      );
    }

    if (!rawDataToUse || rawDataToUse.length === 0) {
      console.error('No raw data available');
      const tableContainer = document.getElementById('myTable');
      tableContainer.innerHTML =
        '<div style="padding: 20px;">No data available to display.</div>';
      return;
    }

    console.log(
      'Rendering raw data table with',
      rawDataToUse.length,
      'total items'
    );

    const tableContainer = document.getElementById('myTable');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    table.style.border = '1px solid #dee2e6';

    // Get headers
    const headers = rawDataToUse.length > 0 ? Object.keys(rawDataToUse[0]) : [];
    console.log('Raw data headers:', headers);

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headers.forEach((headerText, index) => {
      const th = document.createElement('th');
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';
      th.style.cursor = 'pointer';
      th.style.position = 'relative';

      th.setAttribute('draggable', 'true');
      th.dataset.columnIndex = index;
      th.dataset.columnName = headerText;
      th.className = 'raw-data-header';

      const headerContent = document.createElement('div');
      headerContent.style.display = 'flex';
      headerContent.style.alignItems = 'center';
      headerContent.style.justifyContent = 'space-between';

      const headerSpan = document.createElement('span');
      headerSpan.textContent = getFieldDisplayName(headerText);
      headerContent.appendChild(headerSpan);

      const sortIcon = document.createElement('span');
      sortIcon.innerHTML = '↕️';
      sortIcon.style.marginLeft = '5px';
      sortIcon.style.fontSize = '12px';
      headerContent.appendChild(sortIcon);

      th.appendChild(headerContent);

      th.addEventListener('click', () => {
        sortRawDataByColumn(headerText, rawDataToUse);
      });

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // FIXED: Only update pagination once, here
    updateRawDataPagination(rawDataToUse);

    // Get paginated data
    const paginatedData = getPaginatedData(rawDataToUse, paginationState);
    console.log(
      'Paginated raw data:',
      paginatedData.length,
      'items out of',
      rawDataToUse.length,
      'total'
    );

    // Create table body
    const tbody = document.createElement('tbody');

    paginatedData.forEach((rowData, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIndex;
      tr.dataset.globalIndex = rawDataToUse.indexOf(rowData);
      tr.setAttribute('draggable', 'true');
      tr.style.cursor = 'move';
      tr.className = 'raw-data-row';

      headers.forEach(header => {
        const td = document.createElement('td');
        td.style.padding = '8px';
        td.style.borderBottom = '1px solid #dee2e6';
        td.style.borderRight = '1px solid #dee2e6';

        let cellValue = rowData[header];
        if (cellValue === null || cellValue === undefined) {
          cellValue = '';
        } else if (typeof cellValue === 'number') {
          if (
            header === 'price' ||
            header === 'sales' ||
            header === 'revenue' ||
            header === 'discount'
          ) {
            cellValue = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(cellValue);
          } else if (typeof cellValue === 'number' && cellValue % 1 !== 0) {
            cellValue = cellValue.toFixed(2);
          }
        }

        td.textContent = cellValue;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Update pagination info
    updatePaginationInfo('Raw Data');

    // Set up drag and drop
    setupRawDataDragAndDrop(rawDataToUse);
  } catch (error) {
    console.error('Error rendering raw data table:', error);
    const tableContainer = document.getElementById('myTable');
    tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error rendering raw data table: ${error.message}</div>`;
  }
}

function updateRawDataPagination(rawData) {
  // Get pageSize from the select element, with fallback
  const pageSizeElement = document.getElementById('pageSize');
  const pageSize = pageSizeElement ? Number(pageSizeElement.value) : 10;
  const totalPages = Math.ceil(rawData.length / pageSize) || 1;

  console.log(
    'updateRawDataPagination - Total raw data items:',
    rawData.length
  );
  console.log('updateRawDataPagination - Page size:', pageSize);
  console.log('updateRawDataPagination - Total pages:', totalPages);

  // FIXED: Only reset to first page when explicitly needed, not on every call
  // Check if current page is valid for new pagination
  if (paginationState.currentPage > totalPages) {
    paginationState.currentPage = Math.max(1, totalPages);
  }

  paginationState.pageSize = pageSize;
  paginationState.totalPages = totalPages;

  console.log('Updated pagination state for raw data:', paginationState);
}

// Add this new function to ensure data consistency:
function ensureDataConsistency() {
  const state = pivotEngine.getState();
  console.log('Checking data consistency:');
  console.log('- sampleData length:', sampleData.length);
  console.log('- filteredData length:', filteredData.length);
  console.log('- state.data length:', state.data.length);
  console.log('- state.rawData length:', state.rawData.length);

  // FIXED: Only reinitialize if there's a significant data loss
  const hasSignificantInconsistency =
    Math.abs(state.rawData.length - filteredData.length) > 50;

  if (hasSignificantInconsistency) {
    console.log(
      'Significant data inconsistency detected, preserving custom orders during reinit...'
    );

    // FIXED: Preserve both row and column custom orders
    const customColumnOrder =
      pivotEngine.getOrderedColumnValues &&
      pivotEngine.getOrderedColumnValues();
    const customRowOrder =
      pivotEngine.getOrderedRowValues && pivotEngine.getOrderedRowValues();
    const preservedColumnOrder = customColumnOrder || window.swappedColumnOrder;
    const preservedRowOrder = customRowOrder || window.swappedRowOrder;

    console.log('Preserving column order:', preservedColumnOrder);
    console.log('Preserving row order:', preservedRowOrder);

    // Reinitialize the engine with full data
    pivotEngine = new PivotEngine({
      ...config,
      data: filteredData,
    });

    // FIXED: Restore custom orders using the core engine methods
    if (preservedColumnOrder && preservedColumnOrder.length > 0) {
      console.log('Restoring preserved column order:', preservedColumnOrder);
      const columnFieldName = pivotEngine.getColumnFieldName();
      pivotEngine.setCustomFieldOrder(
        columnFieldName,
        preservedColumnOrder,
        false
      );
      window.swappedColumnOrder = preservedColumnOrder;
    }

    if (preservedRowOrder && preservedRowOrder.length > 0) {
      console.log('Restoring preserved row order:', preservedRowOrder);
      const rowFieldName = pivotEngine.getRowFieldName();
      pivotEngine.setCustomFieldOrder(rowFieldName, preservedRowOrder, true);
      window.swappedRowOrder = preservedRowOrder;
    }
  } else {
    console.log('Data consistency acceptable, no reinit needed');
  }
}

// function getOrderedRegions(state) {
//   // First try to get custom region order from the pivot engine
//   if (pivotEngine.getCustomRegionOrder) {
//     const customOrder = pivotEngine.getCustomRegionOrder();
//     if (customOrder && customOrder.length > 0) {
//       console.log('Using custom region order from engine:', customOrder);
//       return customOrder;
//     }
//   }

//   // Check if the state has custom region order
//   if (state.customRegionOrder && state.customRegionOrder.length > 0) {
//     console.log(
//       'Using custom region order from state:',
//       state.customRegionOrder
//     );
//     return state.customRegionOrder;
//   }

//   // Fall back to swapped region order if available
//   if (window.swappedRegionOrder && window.swappedRegionOrder.length > 0) {
//     console.log('Using swapped region order:', window.swappedRegionOrder);
//     return window.swappedRegionOrder;
//   }

//   const uniqueRegions = [...new Set(state.rawData.map(item => item.region))];
//   console.log('Using natural region order:', uniqueRegions);
//   return uniqueRegions;
// }

// Add drag and drop functionality for raw data:
// FIXED: Add the getOrderedCategories function (similar to getOrderedRegions)
// function getOrderedCategories(state) {
//   // First try to get custom category order from the pivot engine
//   if (pivotEngine.getCustomRegionOrder) {
//     const customOrder = pivotEngine.getCustomRegionOrder();
//     if (customOrder && customOrder.length > 0) {
//       console.log('Using custom category order from engine:', customOrder);
//       return customOrder;
//     }
//   }

//   // Check if the state has custom category order
//   if ((state).customRegionOrder && (state).customRegionOrder.length > 0) {
//     console.log('Using custom category order from state:', (state).customRegionOrder);
//     return (state).customRegionOrder;
//   }

//   // Fall back to swapped category order if available
//   if (window.swappedRegionOrder && window.swappedRegionOrder.length > 0) {
//     console.log('Using swapped category order:', window.swappedRegionOrder);
//     return window.swappedRegionOrder;
//   }

//   const uniqueCategories = [...new Set(state.rawData.map(item => item.category).filter(category => category))];
//   console.log('Using natural category order:', uniqueCategories);
//   return uniqueCategories;
// }

// Generic function to get ordered column values (replaces getOrderedCategories)
function getOrderedColumnValues(state) {
  const columnFieldName = pivotEngine.getColumnFieldName();
  if (!columnFieldName) {
    console.warn('No column field configured');
    return [];
  }

  // Check for custom order from engine
  const customOrder =
    pivotEngine.getOrderedColumnValues && pivotEngine.getOrderedColumnValues();
  if (customOrder && customOrder.length > 0) {
    console.log(
      `Using custom ${columnFieldName} order from engine:`,
      customOrder
    );
    return customOrder;
  }

  // Check engine state for custom order
  if (
    state.customColumnOrder &&
    state.customColumnOrder.fieldName === columnFieldName
  ) {
    console.log(
      `Using custom ${columnFieldName} order from state:`,
      state.customColumnOrder.order
    );
    return state.customColumnOrder.order;
  }

  // Check window storage
  if (window.swappedColumnOrder && window.swappedColumnOrder.length > 0) {
    console.log(
      `Using swapped ${columnFieldName} order:`,
      window.swappedColumnOrder
    );
    return window.swappedColumnOrder;
  }

  // Use natural order
  const uniqueValues = pivotEngine.getUniqueFieldValues(columnFieldName);
  console.log(`Using natural ${columnFieldName} order:`, uniqueValues);
  return uniqueValues;
}

// Generic function to get ordered row values
function getOrderedRowValues(state) {
  // Get the row field name from configuration
  const rowFieldName = pivotEngine.getRowFieldName();
  if (!rowFieldName) {
    console.warn('No row field configured');
    return [];
  }

  // First try to get custom row order from the pivot engine
  const customOrder = pivotEngine.getOrderedRowValues();
  if (customOrder && customOrder.length > 0) {
    console.log(`Using custom ${rowFieldName} order from engine:`, customOrder);
    return customOrder;
  }

  // Fall back to swapped order if available
  if (window.swappedRowOrder && window.swappedRowOrder.length > 0) {
    console.log(`Using swapped ${rowFieldName} order:`, window.swappedRowOrder);
    return window.swappedRowOrder;
  }

  // Use natural order from data
  const uniqueValues = pivotEngine.getUniqueFieldValues(rowFieldName);
  console.log(`Using natural ${rowFieldName} order:`, uniqueValues);
  return uniqueValues;
}

function setupRawDataDragAndDrop(rawData) {
  console.log(
    'Setting up raw data drag and drop with',
    rawData.length,
    'items'
  );

  // Column drag and drop for raw data
  const headers = document.querySelectorAll(
    '.raw-data-header[draggable="true"]'
  );
  let draggedColumnIndex = null;

  headers.forEach(header => {
    const columnIndex = parseInt(header.dataset.columnIndex);
    const columnName = header.dataset.columnName;

    header.addEventListener('dragstart', e => {
      draggedColumnIndex = columnIndex;
      e.dataTransfer.setData('text/plain', columnName);
      setTimeout(() => header.classList.add('dragging'), 0);
      console.log(
        'Raw data column drag started:',
        columnName,
        'Index:',
        columnIndex
      );
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
      draggedColumnIndex = null;
    });

    header.addEventListener('dragover', e => {
      e.preventDefault();
    });

    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedColumnIndex !== null && draggedColumnIndex !== columnIndex) {
        header.classList.add('drag-over');
      }
    });

    header.addEventListener('dragleave', () => {
      header.classList.remove('drag-over');
    });

    header.addEventListener('drop', e => {
      e.preventDefault();
      header.classList.remove('drag-over');

      const targetColumnIndex = columnIndex;

      if (
        draggedColumnIndex !== null &&
        draggedColumnIndex !== targetColumnIndex
      ) {
        console.log(
          `Swapping raw data columns ${draggedColumnIndex} with ${targetColumnIndex}`
        );
        swapRawDataColumns(draggedColumnIndex, targetColumnIndex);
        renderRawDataTable();
      }
    });
  });

  // Row drag and drop for raw data
  const rows = document.querySelectorAll('.raw-data-row[draggable="true"]');
  let draggedRowIndex = null;

  rows.forEach(row => {
    const rowIndex = parseInt(row.dataset.rowIndex);
    const globalIndex = parseInt(row.dataset.globalIndex);

    row.addEventListener('dragstart', e => {
      draggedRowIndex = globalIndex;
      e.dataTransfer.setData('text/plain', rowIndex.toString());
      setTimeout(() => row.classList.add('dragging'), 0);
      console.log('Raw data row drag started. Global index:', globalIndex);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      draggedRowIndex = null;
    });

    row.addEventListener('dragover', e => {
      e.preventDefault();
    });

    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedRowIndex !== null && draggedRowIndex !== globalIndex) {
        row.classList.add('drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });

    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');

      const targetRowIndex = globalIndex;

      if (draggedRowIndex !== null && draggedRowIndex !== targetRowIndex) {
        console.log(
          `Swapping raw data rows ${draggedRowIndex} with ${targetRowIndex}`
        );
        swapRawDataRows(draggedRowIndex, targetRowIndex, rawData);
        renderRawDataTable();
      }
    });
  });
}

// Update your renderTable function with data consistency check:
// function renderTable() {

//   // Check current view mode
//   if (!showProcessedData || currentViewMode === 'raw') {
//     renderRawDataTable();
//     return;
//   }

//   try {
//     // CRITICAL: Ensure data consistency before rendering
//     ensureDataConsistency();

//     const state = pivotEngine.getState();
//     console.log('Current Engine State:', state);

//     if (!state.processedData) {
//       console.error('No processed data available');
//       return;
//     }

//     const tableContainer = document.getElementById('myTable');

//     // Clear previous content
//     tableContainer.innerHTML = '';

//     // Create table element
//     const table = document.createElement('table');
//     table.style.width = '100%';
//     table.style.borderCollapse = 'collapse';
//     table.style.marginTop = '20px';
//     table.style.border = '1px solid #dee2e6';

//     // Create table header
//     const thead = document.createElement('thead');

//     // First header row for regions
//     const regionHeaderRow = document.createElement('tr');

//     // Add empty cell for top-left corner (Product/Region)
//     const cornerCell = document.createElement('th');
//     cornerCell.style.padding = '12px';
//     cornerCell.style.backgroundColor = '#f8f9fa';
//     cornerCell.style.borderBottom = '2px solid #dee2e6';
//     cornerCell.style.borderRight = '1px solid #dee2e6';
//     cornerCell.textContent = 'Product / Region';
//     regionHeaderRow.appendChild(cornerCell);

//     // Get unique regions from current state data
//     // const uniqueRegions = [...new Set(state.rawData.map(item => item.region))];
//     const uniqueRegions = getOrderedRegions(state);

//     // Add region headers with colspan for measures
//     uniqueRegions.forEach((region, index) => {
//       const th = document.createElement('th');
//       th.textContent = region;
//       th.colSpan = state.measures.length;
//       th.style.padding = '12px';
//       th.style.backgroundColor = '#f8f9fa';
//       th.style.borderBottom = '2px solid #dee2e6';
//       th.style.borderRight = '1px solid #dee2e6';
//       th.style.textAlign = 'center';
//       th.dataset.index = index + 1;

//       // Make headers draggable
//       th.setAttribute('draggable', 'true');
//       th.style.cursor = 'move';

//       regionHeaderRow.appendChild(th);
//     });

//     thead.appendChild(regionHeaderRow);

//     // Second header row for measures
//     const measureHeaderRow = document.createElement('tr');

//     // Get current sort configuration
//     const currentSortConfig = state.sortConfig?.[0];

//     // Add product header with sort icon
//     const productHeader = document.createElement('th');
//     productHeader.style.padding = '12px';
//     productHeader.style.backgroundColor = '#f8f9fa';
//     productHeader.style.borderBottom = '2px solid #dee2e6';
//     productHeader.style.borderRight = '1px solid #dee2e6';
//     productHeader.style.cursor = 'pointer';

//     // Create a container for the header content to align text and icon
//     const productHeaderContent = document.createElement('div');
//     productHeaderContent.style.display = 'flex';
//     productHeaderContent.style.alignItems = 'center';

//     const productText = document.createElement('span');
//     productText.textContent = 'Product';
//     productHeaderContent.appendChild(productText);

//     // Add sort icon for product
//     const productSortIcon = createSortIcon('product', currentSortConfig);
//     productHeaderContent.appendChild(productSortIcon);

//     productHeader.appendChild(productHeaderContent);

//     // Add sort functionality to product header
//     productHeader.addEventListener('click', () => {
//       const direction =
//         currentSortConfig?.field === 'product' &&
//         currentSortConfig?.direction === 'asc'
//           ? 'desc'
//           : 'asc';
//       pivotEngine.sort('product', direction);
//       renderTable();
//     });

//     measureHeaderRow.appendChild(productHeader);

//     // Add measure headers for each region
//     uniqueRegions.forEach(region => {
//       state.measures.forEach(measure => {
//         const th = document.createElement('th');
//         th.style.padding = '12px';
//         th.style.backgroundColor = '#f8f9fa';
//         th.style.borderBottom = '2px solid #dee2e6';
//         th.style.borderRight = '1px solid #dee2e6';
//         th.style.cursor = 'pointer';

//         // Create a container for the header content to align text and icon
//         const headerContent = document.createElement('div');
//         headerContent.style.display = 'flex';
//         headerContent.style.alignItems = 'center';
//         headerContent.style.justifyContent = 'space-between';

//         const measureText = document.createElement('span');
//         measureText.textContent = measure.caption;
//         headerContent.appendChild(measureText);

//         // Add sort icon for measure
//         const sortIcon = createSortIcon(measure.uniqueName, currentSortConfig);
//         headerContent.appendChild(sortIcon);

//         th.appendChild(headerContent);

//         // Add sort functionality
//         th.addEventListener('click', () => {
//           const direction =
//             currentSortConfig?.field === measure.uniqueName &&
//             currentSortConfig?.direction === 'asc'
//               ? 'desc'
//               : 'asc';
//           pivotEngine.sort(measure.uniqueName, direction);
//           renderTable();
//         });

//         measureHeaderRow.appendChild(th);
//       });
//     });

//     thead.appendChild(measureHeaderRow);
//     table.appendChild(thead);

//     // Create table body
//     const tbody = document.createElement('tbody');

//     // CRITICAL: Get all unique products in their current order from the engine's data
//     const allUniqueProducts = [
//       ...new Set(state.rawData.map(item => item.product)),
//     ];

//     // Update pagination to ensure it's based on current data
//     updatePagination(state.rawData, false);

//     // Get paginated products for CURRENT PAGE ONLY
//     const paginatedProducts = getPaginatedData(
//       allUniqueProducts,
//       paginationState
//     );

//     console.log('All unique products:', allUniqueProducts);
//     console.log('Products for current page:', paginatedProducts);
//     console.log('Current pagination state:', paginationState);

//     // Add rows for ONLY the paginated products
//     paginatedProducts.forEach((product, rowIndex) => {
//       const tr = document.createElement('tr');
//       tr.dataset.rowIndex = rowIndex; // This is the row index within the current page
//       tr.dataset.product = product; // Store the product name
//       tr.dataset.globalIndex = allUniqueProducts.indexOf(product); // Store global index
//       tr.setAttribute('draggable', 'true');
//       tr.style.cursor = 'move';

//       // Add product cell
//       const productCell = document.createElement('td');
//       productCell.textContent = product;
//       productCell.style.fontWeight = 'bold';
//       productCell.style.padding = '8px';
//       productCell.style.borderBottom = '1px solid #dee2e6';
//       productCell.style.borderRight = '1px solid #dee2e6';
//       productCell.className = 'product-cell'; // Add class for easy identification
//       tr.appendChild(productCell);

//       // Add data cells for each region and measure
//       uniqueRegions.forEach(region => {
//         // Filter data from state.rawData for this product and region
//         const filteredDataForProduct = state.rawData.filter(
//           item => item.product === product && item.region === region
//         );

//         // Add cells for each measure
//         state.measures.forEach(measure => {
//           const td = document.createElement('td');
//           td.style.padding = '8px';
//           td.style.borderBottom = '1px solid #dee2e6';
//           td.style.borderRight = '1px solid #dee2e6';
//           td.style.textAlign = 'right';

//           // Calculate the value based on aggregation
//           let value = 0;
//           if (filteredDataForProduct.length > 0) {
//             switch (measure.aggregation) {
//               case 'sum':
//                 value = filteredDataForProduct.reduce(
//                   (sum, item) => sum + (item[measure.uniqueName] || 0),
//                   0
//                 );
//                 break;
//               case 'avg':
//                 if (measure.formula) {
//                   value =
//                     filteredDataForProduct.reduce(
//                       (sum, item) => sum + measure.formula(item),
//                       0
//                     ) / filteredDataForProduct.length;
//                 } else {
//                   value =
//                     filteredDataForProduct.reduce(
//                       (sum, item) => sum + (item[measure.uniqueName] || 0),
//                       0
//                     ) / filteredDataForProduct.length;
//                 }
//                 break;
//               case 'max':
//                 value = Math.max(
//                   ...filteredDataForProduct.map(
//                     item => item[measure.uniqueName] || 0
//                   )
//                 );
//                 break;
//               case 'min':
//                 value = Math.min(
//                   ...filteredDataForProduct.map(
//                     item => item[measure.uniqueName] || 0
//                   )
//                 );
//                 break;
//               default:
//                 value = 0;
//             }
//           }

//           // Format the value
//           let formattedValue = value;
//           if (measure.format) {
//             if (measure.format.type === 'currency') {
//               formattedValue = new Intl.NumberFormat(measure.format.locale, {
//                 style: 'currency',
//                 currency: measure.format.currency,
//                 minimumFractionDigits: measure.format.decimals,
//                 maximumFractionDigits: measure.format.decimals,
//               }).format(value);
//             } else if (measure.format.type === 'number') {
//               formattedValue = new Intl.NumberFormat(measure.format.locale, {
//                 minimumFractionDigits: measure.format.decimals,
//                 maximumFractionDigits: measure.format.decimals,
//               }).format(value);
//             }
//           }

//           // td.textContent = formattedValue;
//           // addDrillDownToDataCell(td, product, region, measure, value, formattedValue);
//           let cellValue = addDrillDownToDataCell(td, product, region, measure, value, formattedValue);
//           console.log('Cell value :', cellValue);

//           // Apply conditional formatting
//           if (
//             config.conditionalFormatting &&
//             Array.isArray(config.conditionalFormatting)
//           ) {
//             config.conditionalFormatting.forEach(rule => {
//               if (rule.value.type === 'Number' && !isNaN(value)) {
//                 let applyFormat = false;

//                 switch (rule.value.operator) {
//                   case 'Greater than':
//                     applyFormat = value > parseFloat(rule.value.value1);
//                     break;
//                   case 'Less than':
//                     applyFormat = value < parseFloat(rule.value.value1);
//                     break;
//                   case 'Equal to':
//                     applyFormat = value === parseFloat(rule.value.value1);
//                     break;
//                   case 'Between':
//                     applyFormat =
//                       value >= parseFloat(rule.value.value1) &&
//                       value <= parseFloat(rule.value.value2);
//                     break;
//                 }

//                 if (applyFormat) {
//                   if (rule.format.font) td.style.fontFamily = rule.format.font;
//                   if (rule.format.size) td.style.fontSize = rule.format.size;
//                   if (rule.format.color) td.style.color = rule.format.color;
//                   if (rule.format.backgroundColor)
//                     td.style.backgroundColor = rule.format.backgroundColor;
//                 }
//               }
//             });
//           }

//           tr.appendChild(td);
//         });
//       });

//       tbody.appendChild(tr);
//     });

//     table.appendChild(tbody);
//     tableContainer.appendChild(table);

//     // Update pagination info
//     const pageInfo = document.getElementById('pageInfo');
//     if (pageInfo) {
//       pageInfo.textContent = `Page ${paginationState.currentPage} of ${paginationState.totalPages}`;

//       // Update button states
//       const prevButton = document.getElementById('prevPage');
//       const nextButton = document.getElementById('nextPage');
//       if (prevButton) prevButton.disabled = paginationState.currentPage <= 1;
//       if (nextButton)
//         nextButton.disabled =
//           paginationState.currentPage >= paginationState.totalPages;
//     }

//     // Set up drag and drop after rendering
//     setupDragAndDrop();
//   } catch (error) {
//     console.error('Error rendering table:', error);

//     // Display error message to user
//     const tableContainer = document.getElementById('myTable');
//     tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error rendering table: ${error.message}</div>`;
//   }
// }

// Generic renderTable function that works with any field names
function renderTable() {
  // Check current view mode
  if (!showProcessedData || currentViewMode === 'raw') {
    console.log('Rendering raw data view');
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

    // Get field names from configuration
    const rowFieldName = pivotEngine.getRowFieldName();
    const columnFieldName = pivotEngine.getColumnFieldName();

    if (!rowFieldName || !columnFieldName) {
      console.error('Row or column field not configured');
      return;
    }

    console.log(
      `Rendering table with row field: ${rowFieldName}, column field: ${columnFieldName}`
    );

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

    // First header row for column values
    const columnHeaderRow = document.createElement('tr');

    // Add empty cell for top-left corner
    const cornerCell = document.createElement('th');
    cornerCell.style.padding = '12px';
    cornerCell.style.backgroundColor = '#f8f9fa';
    cornerCell.style.borderBottom = '2px solid #dee2e6';
    cornerCell.style.borderRight = '1px solid #dee2e6';
    cornerCell.textContent = `${getFieldDisplayName(rowFieldName)} / ${getFieldDisplayName(columnFieldName)}`;
    columnHeaderRow.appendChild(cornerCell);

    // Get unique column values
    const uniqueColumnValues = getOrderedColumnValues(state);
    console.log('Setting up column headers for values:', uniqueColumnValues);

    // Add column headers with colspan for measures
    uniqueColumnValues.forEach((columnValue, index) => {
      const th = document.createElement('th');
      th.textContent = columnValue;
      th.colSpan = state.measures.length;
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';
      th.style.textAlign = 'center';
      th.dataset.index = index + 1;
      th.dataset.fieldName = columnFieldName;
      th.dataset.fieldValue = columnValue;
      th.dataset.columnIndex = index;

      // Make headers draggable
      th.setAttribute('draggable', 'true');
      th.style.cursor = 'move';
      th.className = 'column-header';

      console.log(
        `Created column header: ${columnValue}, index: ${index}, fieldName: ${columnFieldName}`
      );

      columnHeaderRow.appendChild(th);
    });

    thead.appendChild(columnHeaderRow);

    // Second header row for measures
    const measureHeaderRow = document.createElement('tr');

    // Get current sort configuration
    const currentSortConfig = state.sortConfig?.[0];

    // Add row field header with sort icon
    const rowHeader = document.createElement('th');
    rowHeader.style.padding = '12px';
    rowHeader.style.backgroundColor = '#f8f9fa';
    rowHeader.style.borderBottom = '2px solid #dee2e6';
    rowHeader.style.borderRight = '1px solid #dee2e6';
    rowHeader.style.cursor = 'pointer';

    // Create a container for the header content to align text and icon
    const rowHeaderContent = document.createElement('div');
    rowHeaderContent.style.display = 'flex';
    rowHeaderContent.style.alignItems = 'center';

    const rowText = document.createElement('span');
    rowText.textContent = getFieldDisplayName(rowFieldName);
    rowHeaderContent.appendChild(rowText);

    // Add sort icon for row field
    const rowSortIcon = createSortIcon(rowFieldName, currentSortConfig);
    rowHeaderContent.appendChild(rowSortIcon);

    rowHeader.appendChild(rowHeaderContent);

    // Add sort functionality to row header
    rowHeader.addEventListener('click', () => {
      const direction =
        currentSortConfig?.field === rowFieldName &&
        currentSortConfig?.direction === 'asc'
          ? 'desc'
          : 'asc';
      pivotEngine.sort(rowFieldName, direction);
      renderTable();
    });

    measureHeaderRow.appendChild(rowHeader);

    // Add measure headers for each column value
    uniqueColumnValues.forEach(columnValue => {
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

    // Get all unique row values in their current order
    const allUniqueRowValues = getOrderedRowValues(state);

    console.log(`All unique ${rowFieldName} values:`, allUniqueRowValues);

    // Update pagination to ensure it's based on current data
    updatePagination(state.rawData, false);

    // Get paginated row values for CURRENT PAGE ONLY
    const paginatedRowValues = getPaginatedData(
      allUniqueRowValues,
      paginationState
    );

    console.log(
      `${getFieldDisplayName(rowFieldName)} for current page:`,
      paginatedRowValues
    );
    console.log('Current pagination state:', paginationState);

    // Add rows for ONLY the paginated row values
    paginatedRowValues.forEach((rowValue, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIndex;
      tr.dataset.fieldName = rowFieldName;
      tr.dataset.fieldValue = rowValue;
      tr.dataset.globalIndex = allUniqueRowValues.indexOf(rowValue);
      tr.setAttribute('draggable', 'true');
      tr.style.cursor = 'move';

      // Add row value cell
      const rowCell = document.createElement('td');
      rowCell.textContent = rowValue;
      rowCell.style.fontWeight = 'bold';
      rowCell.style.padding = '8px';
      rowCell.style.borderBottom = '1px solid #dee2e6';
      rowCell.style.borderRight = '1px solid #dee2e6';
      rowCell.className = 'row-cell';
      tr.appendChild(rowCell);

      // Add data cells for each column value and measure
      uniqueColumnValues.forEach(columnValue => {
        // Filter data for this row value and column value
        const filteredDataForCell = state.rawData.filter(
          item =>
            item[rowFieldName] === rowValue &&
            item[columnFieldName] === columnValue
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
          if (filteredDataForCell.length > 0) {
            switch (measure.aggregation) {
              case 'sum':
                value = filteredDataForCell.reduce(
                  (sum, item) => sum + (item[measure.uniqueName] || 0),
                  0
                );
                break;
              case 'avg':
                if (measure.formula) {
                  value =
                    filteredDataForCell.reduce(
                      (sum, item) => sum + measure.formula(item),
                      0
                    ) / filteredDataForCell.length;
                } else {
                  value =
                    filteredDataForCell.reduce(
                      (sum, item) => sum + (item[measure.uniqueName] || 0),
                      0
                    ) / filteredDataForCell.length;
                }
                break;
              case 'max':
                value = Math.max(
                  ...filteredDataForCell.map(
                    item => item[measure.uniqueName] || 0
                  )
                );
                break;
              case 'min':
                value = Math.min(
                  ...filteredDataForCell.map(
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

          // Add drill-down functionality with generic parameters
          addDrillDownToDataCell(
            td,
            rowValue,
            columnValue,
            measure,
            value,
            formattedValue,
            rowFieldName,
            columnFieldName
          );

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
function setupColumnDragAndDropFixed(columnFieldName) {
  // Select only column headers with proper class
  const columnHeaders = document.querySelectorAll(
    '.column-header[draggable="true"]'
  );
  let draggedColumnIndex = null;
  let draggedColumnValue = null;

  console.log(
    'Setting up column drag, found column headers:',
    columnHeaders.length
  );

  const state = pivotEngine.getState();
  const uniqueColumnValues = getOrderedColumnValues(state);

  console.log(
    `Current ${columnFieldName} values for drag setup:`,
    uniqueColumnValues
  );

  columnHeaders.forEach((header, headerIdx) => {
    const fieldName = header.dataset.fieldName;
    const fieldValue = header.dataset.fieldValue;
    const columnIndex = parseInt(header.dataset.columnIndex);

    console.log(
      `Setting up column header ${headerIdx}: field=${fieldName}, value=${fieldValue}, columnIndex=${columnIndex}`
    );

    // Validate this is our column field
    if (fieldName !== columnFieldName || !fieldValue) {
      console.warn(
        'Skipping header - field mismatch or missing value:',
        fieldName,
        fieldValue
      );
      return;
    }

    header.addEventListener('dragstart', e => {
      draggedColumnIndex = columnIndex;
      draggedColumnValue = fieldValue;
      e.dataTransfer.setData('text/plain', fieldValue);
      setTimeout(() => header.classList.add('dragging'), 0);
      console.log(
        `Column drag started for ${columnFieldName}: ${fieldValue}, Index: ${columnIndex}`
      );
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
      draggedColumnIndex = null;
      draggedColumnValue = null;
      console.log('Column drag ended');
    });

    header.addEventListener('dragover', e => {
      e.preventDefault();
    });

    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedColumnValue && draggedColumnValue !== fieldValue) {
        header.classList.add('drag-over');
      }
    });

    header.addEventListener('dragleave', () => {
      header.classList.remove('drag-over');
    });

    header.addEventListener('drop', e => {
      e.preventDefault();
      header.classList.remove('drag-over');

      const targetColumnValue = fieldValue;
      const targetColumnIndex = parseInt(header.dataset.columnIndex);

      if (
        draggedColumnValue &&
        targetColumnValue &&
        draggedColumnValue !== targetColumnValue
      ) {
        console.log(
          `Swapping ${columnFieldName}: ${draggedColumnValue} (index: ${draggedColumnIndex}) with ${targetColumnValue} (index: ${targetColumnIndex})`
        );

        try {
          // Try core engine method first
          pivotEngine.swapDataColumns(draggedColumnIndex, targetColumnIndex);
          console.log('Core column swap completed');

          // FIXED: Immediately store the new order to prevent loss
          const newOrder = pivotEngine.getOrderedColumnValues();
          if (newOrder) {
            window.swappedColumnOrder = newOrder;
            console.log('Stored new column order:', newOrder);
          }

          renderTable();
        } catch (error) {
          console.error('Core column swap failed:', error);
          // Fallback to manual swap
          console.log('Falling back to manual column swap');
          manualColumnSwap(
            draggedColumnIndex,
            targetColumnIndex,
            columnFieldName,
            uniqueColumnValues
          );
          renderTable();
        }
      } else {
        console.log('Invalid column swap - same values or missing data');
      }
    });
  });
}
function setupRowDragAndDrop(rowFieldName) {
  const rows = document.querySelectorAll('tbody tr[draggable="true"]');
  let draggedRowIndex = null;
  let draggedRowValue = null;

  console.log('Setting up row drag, found rows:', rows.length);

  rows.forEach((row, rowIdx) => {
    const fieldName = row.dataset.fieldName;
    const fieldValue = row.dataset.fieldValue;
    const globalIndex = parseInt(row.dataset.globalIndex);

    console.log(
      `Setting up row ${rowIdx}: field=${fieldName}, value=${fieldValue}, globalIndex=${globalIndex}`
    );

    // Validate this is our row field
    if (fieldName !== rowFieldName || !fieldValue) {
      console.warn(
        'Skipping row - field mismatch or missing value:',
        fieldName,
        fieldValue
      );
      return;
    }

    row.addEventListener('dragstart', e => {
      draggedRowValue = fieldValue;
      draggedRowIndex = globalIndex;
      e.dataTransfer.setData('text/plain', fieldValue);
      setTimeout(() => row.classList.add('dragging'), 0);
      console.log(
        `Row drag started for ${rowFieldName}: ${fieldValue}, Global index: ${globalIndex}`
      );
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      draggedRowValue = null;
      draggedRowIndex = null;
    });

    row.addEventListener('dragover', e => {
      e.preventDefault();
    });

    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedRowValue && draggedRowValue !== fieldValue) {
        row.classList.add('drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });

    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');

      const targetRowValue = fieldValue;
      const targetRowIndex = globalIndex;

      if (
        draggedRowValue &&
        targetRowValue &&
        draggedRowValue !== targetRowValue
      ) {
        console.log(
          `Swapping ${rowFieldName}: ${draggedRowValue} (global: ${draggedRowIndex}) with ${targetRowValue} (global: ${targetRowIndex})`
        );

        try {
          // Try core engine method first
          pivotEngine.swapDataRows(draggedRowIndex, targetRowIndex);
          console.log('Core row swap completed');
          renderTable();
        } catch (error) {
          console.error('Core row swap failed:', error);
          // Fallback to manual swap
          console.log('Falling back to manual row swap');
          manualRowSwap(draggedRowIndex, targetRowIndex, rowFieldName);
          renderTable();
        }
      }
    });
  });
}

// FIXED: Manual column swap function
function manualColumnSwap(
  fromIndex,
  toIndex,
  columnFieldName,
  uniqueColumnValues
) {
  console.log(
    `Manual column swap: ${columnFieldName} from ${fromIndex} to ${toIndex}`
  );
  console.log('Available column values:', uniqueColumnValues);

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= uniqueColumnValues.length ||
    toIndex >= uniqueColumnValues.length
  ) {
    console.error(
      'Invalid column indices:',
      fromIndex,
      toIndex,
      'Available:',
      uniqueColumnValues.length
    );
    return;
  }

  // Create swapped order
  const swappedValues = [...uniqueColumnValues];
  const temp = swappedValues[fromIndex];
  swappedValues[fromIndex] = swappedValues[toIndex];
  swappedValues[toIndex] = temp;

  console.log('New column order:', swappedValues);

  // FIXED: Store in multiple locations to ensure persistence
  window.swappedColumnOrder = swappedValues;

  // Store in engine state using the core method
  if (pivotEngine.setCustomFieldOrder) {
    pivotEngine.setCustomFieldOrder(columnFieldName, swappedValues, false);
  }

  // Also store directly in state as backup
  if (pivotEngine.state) {
    pivotEngine.state.customColumnOrder = {
      fieldName: columnFieldName,
      order: swappedValues,
    };
  }

  console.log('Manual column swap completed and stored');
}

// FIXED: Manual row swap function
function manualRowSwap(fromIndex, toIndex, rowFieldName) {
  const state = pivotEngine.getState();
  const uniqueRowValues = pivotEngine.getUniqueFieldValues(rowFieldName);

  console.log(
    `Manual row swap: ${rowFieldName} from ${fromIndex} to ${toIndex}`
  );
  console.log('Available row values:', uniqueRowValues);

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= uniqueRowValues.length ||
    toIndex >= uniqueRowValues.length
  ) {
    console.error(
      'Invalid row indices:',
      fromIndex,
      toIndex,
      'Available:',
      uniqueRowValues.length
    );
    return;
  }

  // Get the values to swap
  const fromValue = uniqueRowValues[fromIndex];
  const toValue = uniqueRowValues[toIndex];

  // Create swapped order
  const swappedValues = [...uniqueRowValues];
  swappedValues[fromIndex] = toValue;
  swappedValues[toIndex] = fromValue;

  console.log('New row order:', swappedValues);

  // Reorder the actual data
  const dataToUse = state.data || state.rawData || filteredData;
  const newData = [...dataToUse];

  newData.sort((a, b) => {
    const aIndex = swappedValues.indexOf(a[rowFieldName]);
    const bIndex = swappedValues.indexOf(b[rowFieldName]);
    return aIndex - bIndex;
  });

  // Update filteredData
  if (filteredData) {
    filteredData.sort((a, b) => {
      const aIndex = swappedValues.indexOf(a[rowFieldName]);
      const bIndex = swappedValues.indexOf(b[rowFieldName]);
      return aIndex - bIndex;
    });
  }

  // Create new engine
  pivotEngine = new PivotEngine({
    ...config,
    data: newData,
  });

  console.log('Manual row swap completed');
}

function getFieldDisplayName(fieldName) {
  // Convert field name to display name (capitalize first letter)
  return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
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
function updatePaginationInfo(viewType = null) {
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    let viewMode;
    if (viewType) {
      viewMode = viewType;
    } else {
      viewMode = currentViewMode === 'raw' ? 'Raw Data' : 'Processed Data';
    }

    pageInfo.textContent = `${viewMode} - Page ${paginationState.currentPage} of ${paginationState.totalPages}`;

    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    if (prevButton) prevButton.disabled = paginationState.currentPage <= 1;
    if (nextButton)
      nextButton.disabled =
        paginationState.currentPage >= paginationState.totalPages;
  }
}

// Generic updatePagination function
function updatePagination(data, resetPage = false) {
  const state = pivotEngine.getState();
  const rowFieldName = pivotEngine.getRowFieldName();

  if (!rowFieldName) {
    console.warn('No row field configured for pagination');
    return;
  }

  // Get unique row values
  const uniqueRowValues = pivotEngine.getUniqueFieldValues(rowFieldName);

  // Get pageSize from the select element, with fallback
  const pageSizeElement = document.getElementById('pageSize');
  const pageSize = pageSizeElement ? Number(pageSizeElement.value) : 10;
  const totalPages = Math.ceil(uniqueRowValues.length / pageSize) || 1;

  console.log(
    `updatePagination - Total unique ${rowFieldName}:`,
    uniqueRowValues.length
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
  // FIXED: Enhanced switch view functionality
  document.getElementById('switchView').addEventListener('click', () => {
    // Toggle the view mode
    currentViewMode = currentViewMode === 'processed' ? 'raw' : 'processed';
    showProcessedData = currentViewMode === 'processed';

    console.log('Switching to view mode:', currentViewMode);

    // Update button text
    const switchButton = document.getElementById('switchView');
    switchButton.textContent =
      currentViewMode === 'processed'
        ? 'Switch to Raw Data'
        : 'Switch to Processed Data';

    // FIXED: Proper pagination reset when switching views
    if (currentViewMode === 'raw') {
      const dataToUse = filteredData.length > 0 ? filteredData : sampleData;
      // Reset to first page when switching to raw data
      paginationState.currentPage = 1;
      updateRawDataPagination(dataToUse);
      console.log(
        'Switched to raw data view with',
        dataToUse.length,
        'total items'
      );
    } else {
      // Reset to first page when switching to processed data
      paginationState.currentPage = 1;
      updatePagination(filteredData, true);
      console.log('Switched to processed data view');
    }

    // Re-render table
    renderTable();
  });

  // FIXED: Page size change handler
  document.getElementById('pageSize').addEventListener('change', e => {
    const newPageSize = Number(e.target.value);

    // Calculate what page we should be on with the new page size
    // to keep roughly the same position
    const currentFirstItem =
      (paginationState.currentPage - 1) * paginationState.pageSize;
    const newPage = Math.floor(currentFirstItem / newPageSize) + 1;

    paginationState.currentPage = newPage;

    if (currentViewMode === 'raw') {
      const dataToUse = filteredData.length > 0 ? filteredData : sampleData;
      updateRawDataPagination(dataToUse);
    } else {
      updatePagination(filteredData, false); // Don't reset page, we calculated it above
      // But ensure we don't exceed total pages
      if (paginationState.currentPage > paginationState.totalPages) {
        paginationState.currentPage = paginationState.totalPages;
      }
    }

    console.log(
      'Page size changed to:',
      newPageSize,
      'New page:',
      paginationState.currentPage
    );
    renderTable();
  });

  // FIXED: Previous page handler
  document.getElementById('prevPage').addEventListener('click', () => {
    if (paginationState.currentPage > 1) {
      paginationState.currentPage--;
      if (currentViewMode === 'processed') {
        pivotEngine.setPagination(paginationState);
      }
      console.log(
        'Previous page clicked, now on page:',
        paginationState.currentPage
      );
      renderTable();
    }
  });

  // FIXED: Next page handler
  document.getElementById('nextPage').addEventListener('click', () => {
    if (paginationState.currentPage < paginationState.totalPages) {
      paginationState.currentPage++;
      if (currentViewMode === 'processed') {
        pivotEngine.setPagination(paginationState);
      }
      console.log(
        'Next page clicked, now on page:',
        paginationState.currentPage
      );
      renderTable();
    }
  });

  // Keep your existing filter event listeners...
  document.getElementById('applyFilter').addEventListener('click', () => {
    const field = document.getElementById('filterField').value;
    const operator = document.getElementById('filterOperator').value;
    const value = document.getElementById('filterValue').value;

    if (!value) {
      alert('Please enter a filter value');
      return;
    }

    const filter = { field, operator, value };
    filteredData = applyFilter(sampleData, filter);

    console.log('Filtered data:', filteredData);

    // Reset to first page when applying filter
    paginationState.currentPage = 1;

    if (currentViewMode === 'raw') {
      updateRawDataPagination(filteredData);
    } else {
      updatePagination(filteredData, true);
    }

    renderTable();
  });

  document.getElementById('resetFilter').addEventListener('click', () => {
    filteredData = [...sampleData];

    pivotEngine = new PivotEngine({
      ...config,
      data: sampleData,
    });

    // Reset to first page
    paginationState.currentPage = 1;

    if (currentViewMode === 'raw') {
      updateRawDataPagination(sampleData);
    } else {
      updatePagination(filteredData, true);
    }

    document.getElementById('filterField').selectedIndex = 0;
    document.getElementById('filterOperator').selectedIndex = 0;
    document.getElementById('filterValue').value = '';

    renderTable();
  });
}

// Update the addDraggableStyles function to include styles for sort icons
// function addDraggableStyles() {
//   const styleEl = document.createElement('style');
//   styleEl.innerHTML = `
//         .dragging {
//             opacity: 0.5;
//             background-color: #f0f0f0;
//         }

//         .drag-over {
//             border: 2px dashed #666 !important;
//             background-color: #e9ecef !important;
//         }

//         th[draggable="true"], tr[draggable="true"] {
//             cursor: move;
//         }

//         /* Sort icon styles */
//         .sort-icon {
//             margin-left: 5px;
//             display: inline-block;
//             transition: transform 0.2s;
//         }

//         th:hover .sort-icon {
//             opacity: 1 !important;
//         }

//         /* Header hover effect */
//         th[data-sortable="true"]:hover {
//             background-color: #e9ecef !important;
//         }

//         .controls-container {
//             margin-bottom: 20px;
//             display: flex;
//             flex-direction: column;
//             gap: 10px;
//         }

//         .filter-container, .pagination-container {
//             display: flex;
//             gap: 10px;
//             align-items: center;
//             flex-wrap: wrap;
//         }

//         /* Make sure table is responsive */
//         #myTable {
//             overflow-x: auto;
//             width: 100%;
//         }

//         /* Button styling */
//         button {
//             padding: 5px 10px;
//             background-color: #4CAF50;
//             color: white;
//             border: none;
//             border-radius: 4px;
//             cursor: pointer;
//         }

//         button:disabled {
//             background-color: #cccccc;
//             cursor: not-allowed;
//         }

//         /* Select and input styling */
//         select, input {
//             padding: 5px;
//             border-radius: 4px;
//             border: 1px solid #ddd;
//         }
//     `;
//   document.head.appendChild(styleEl);
// }

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
        
        /* ENHANCED: Column header specific styles */
        .column-header[draggable="true"] {
            cursor: move;
            transition: background-color 0.2s;
        }
        
        .column-header[draggable="true"]:hover {
            background-color: #e3f2fd !important;
            border: 1px solid #2196f3 !important;
        }
        
        .column-header.dragging {
            opacity: 0.6;
            background-color: #ffecb3 !important;
        }
        
        .column-header.drag-over {
            border: 3px dashed #4caf50 !important;
            background-color: #e8f5e8 !important;
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

        /* Drill-down cell styling */
        .drill-down-cell {
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .drill-down-cell:hover {
            background-color: #e3f2fd !important;
            border: 2px solid #2196f3 !important;
        }

        /* Modal styles for drill-down details */
        .drill-down-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .drill-down-content {
            background: white;
            border-radius: 8px;
            padding: 20px;
            width: 90%;
            max-width: 800px;
            max-height: 80%;
            overflow: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .drill-down-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }

        .drill-down-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }

        .drill-down-close {
            background: #f44336;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .drill-down-close:hover {
            background: #d32f2f;
        }

        .drill-down-summary {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 14px;
        }

        .drill-down-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .drill-down-table th {
            background: #f8f9fa;
            padding: 8px;
            border: 1px solid #dee2e6;
            font-weight: bold;
            text-align: left;
        }

        .drill-down-table td {
            padding: 6px 8px;
            border: 1px solid #dee2e6;
        }

        .drill-down-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .drill-down-table tr:hover {
            background-color: #e3f2fd;
        }
    `;
  document.head.appendChild(styleEl);
}

// Add this function to create the drill-down modal:
// Generic function to update drill-down modal for any fields
function createDrillDownModal(
  rowValue,
  columnValue,
  measure,
  rawDetails,
  aggregatedValue,
  rowFieldName,
  columnFieldName
) {
  // Remove existing modal if any
  const existingModal = document.querySelector('.drill-down-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal elements
  const modal = document.createElement('div');
  modal.className = 'drill-down-modal';

  const content = document.createElement('div');
  content.className = 'drill-down-content';

  // Header
  const header = document.createElement('div');
  header.className = 'drill-down-header';

  const title = document.createElement('div');
  title.className = 'drill-down-title';
  title.textContent = 'Details';

  const closeButton = document.createElement('button');
  closeButton.className = 'drill-down-close';
  closeButton.innerHTML = '×';
  closeButton.addEventListener('click', () => modal.remove());

  header.appendChild(title);
  header.appendChild(closeButton);

  // Summary
  const summary = document.createElement('div');
  summary.className = 'drill-down-summary';
  summary.innerHTML = `
    <strong>${getFieldDisplayName(rowFieldName)}:</strong> ${rowValue} &nbsp;&nbsp;
    <strong>${getFieldDisplayName(columnFieldName)}:</strong> ${columnValue} &nbsp;&nbsp;
    <strong>${measure.caption}:</strong> ${aggregatedValue}
  `;

  // Table
  const table = document.createElement('table');
  table.className = 'drill-down-table';

  // Table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Get all columns from the raw data
  const columns = rawDetails.length > 0 ? Object.keys(rawDetails[0]) : [];
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = getFieldDisplayName(col);
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement('tbody');
  rawDetails.forEach((row, index) => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      let value = row[col];

      // Format values appropriately based on measure format
      if (
        measure.format &&
        (col === measure.uniqueName ||
          col.includes('price') ||
          col.includes('sales') ||
          col.includes('revenue'))
      ) {
        if (typeof value === 'number') {
          if (measure.format.type === 'currency') {
            value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value);
          }
        }
      } else if (col.includes('date')) {
        value = new Date(value).toLocaleDateString();
      }

      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  // Assemble modal
  content.appendChild(header);
  content.appendChild(summary);
  content.appendChild(table);
  modal.appendChild(content);

  // Add to document
  document.body.appendChild(modal);

  // Close modal when clicking outside
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Close modal with Escape key
  const handleEscape = e => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Add this function to get drill-down data for a specific cell:
// Generic getDrillDownData function
function getDrillDownData(
  rowValue,
  columnValue,
  measure,
  rowFieldName,
  columnFieldName
) {
  const state = pivotEngine.getState();

  // Create filter object dynamically
  const filter = {};
  filter[rowFieldName] = rowValue;
  filter[columnFieldName] = columnValue;

  // Filter raw data for this specific row and column combination
  const filteredData = state.rawData.filter(item => {
    return Object.keys(filter).every(key => item[key] === filter[key]);
  });

  console.log(
    `Drill-down for ${rowFieldName}:${rowValue} - ${columnFieldName}:${columnValue} - ${measure.caption}:`,
    filteredData
  );

  return filteredData;
}

// Generic addDrillDownToDataCell function
function addDrillDownToDataCell(
  td,
  rowValue,
  columnValue,
  measure,
  value,
  formattedValue,
  rowFieldName,
  columnFieldName
) {
  td.textContent = formattedValue;

  // Add drill-down functionality
  td.className = 'drill-down-cell';
  td.title = `Double-click to see details for ${rowFieldName}: ${rowValue} - ${columnFieldName}: ${columnValue}`;

  // Add double-click event listener
  td.addEventListener('dblclick', e => {
    e.preventDefault();
    e.stopPropagation();

    console.log(
      `Double-clicked on ${rowFieldName}: ${rowValue} - ${columnFieldName}: ${columnValue} - ${measure.caption}`
    );

    // Get the raw data for this cell
    const rawDetails = getDrillDownData(
      rowValue,
      columnValue,
      measure,
      rowFieldName,
      columnFieldName
    );

    if (rawDetails.length === 0) {
      alert(
        `No detailed data found for ${rowFieldName}: ${rowValue} in ${columnFieldName}: ${columnValue}`
      );
      return;
    }

    // Show the drill-down modal
    createDrillDownModal(
      rowValue,
      columnValue,
      measure,
      rawDetails,
      formattedValue,
      rowFieldName,
      columnFieldName
    );
  });
}

// Add HTML for filter and pagination controls
function addControlsHTML() {
  if (document.querySelector('.controls-container')) {
    return;
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
      <button id="switchView">Switch to Raw Data</button>
    </div>
    <div class="pagination-container">
      <label>Items per page:</label>
      <select id="pageSize">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="10" selected>10</option>
        <option value="25">25</option>
        <option value="50">50</option>
      </select>
      <button id="prevPage">Previous</button>
      <span id="pageInfo">Processed Data - Page 1 of 1</span>
      <button id="nextPage">Next</button>
    </div>
  `;

  const myTable = document.getElementById('myTable');
  myTable.parentNode.insertBefore(container, myTable);
}

// Add this function to set up drag and drop functionality
// Replace your setupDragAndDrop function with this version that includes column swapping:

// Update your setupDragAndDrop function column section:
// function setupDragAndDrop() {
//   console.log('Setting up generic drag and drop');

//   // Get field names from configuration
//   const rowFieldName = pivotEngine.getRowFieldName();
//   const columnFieldName = pivotEngine.getColumnFieldName();

//   if (!rowFieldName || !columnFieldName) {
//     console.warn('Row or column field not configured for drag and drop');
//     return;
//   }

//   console.log(`Setting up drag and drop for row field: ${rowFieldName}, column field: ${columnFieldName}`);

//   // ENHANCED: Column drag and drop with SWAPPING (generic for any column field)
//   const headers = document.querySelectorAll('th[draggable="true"]');
//   let draggedColumnIndex = null;
//   let draggedColumnValue = null;

//   console.log('Setting up drag and drop, found headers:', headers.length);

//   const state = pivotEngine.getState();
//   const uniqueColumnValues = getOrderedColumnValues(state);

//   console.log(`Current ${columnFieldName} values for drag setup:`, uniqueColumnValues);

//   headers.forEach((header, headerIdx) => {
//     const headerIndex = header.dataset.index ? parseInt(header.dataset.index) : null;
//     const fieldName = header.dataset.fieldName;
//     const fieldValue = header.dataset.fieldValue;

//     console.log(`Setting up header ${headerIdx}: index=${headerIndex}, field=${fieldName}, value=${fieldValue}`);

//     // Skip if this is not a column header or missing data
//     if (headerIndex === null || fieldName !== columnFieldName || !fieldValue) {
//       console.log('Skipping header - not a column header or missing data');
//       return;
//     }

//     // Find the actual index in the column values array
//     const actualColumnIndex = uniqueColumnValues.indexOf(fieldValue);
//     const indexToUse = actualColumnIndex !== -1 ? actualColumnIndex : headerIndex - 1;

//     console.log(`Using ${columnFieldName} index ${indexToUse} for ${fieldValue}`);

//     header.addEventListener('dragstart', e => {
//       draggedColumnIndex = indexToUse;
//       draggedColumnValue = fieldValue;
//       e.dataTransfer.setData('text/plain', fieldValue);
//       setTimeout(() => header.classList.add('dragging'), 0);
//       console.log(`Column drag started for ${columnFieldName}:`, fieldValue, 'Index:', indexToUse);
//     });

//     header.addEventListener('dragend', () => {
//       header.classList.remove('dragging');
//       draggedColumnIndex = null;
//       draggedColumnValue = null;
//     });

//     header.addEventListener('dragover', e => {
//       e.preventDefault();
//     });

//     header.addEventListener('dragenter', e => {
//       e.preventDefault();
//       if (draggedColumnValue && draggedColumnValue !== fieldValue) {
//         header.classList.add('drag-over');
//       }
//     });

//     header.addEventListener('dragleave', () => {
//       header.classList.remove('drag-over');
//     });

//     header.addEventListener('drop', e => {
//       e.preventDefault();
//       header.classList.remove('drag-over');

//       const targetColumnValue = fieldValue;
//       const targetColumnIndex = uniqueColumnValues.indexOf(targetColumnValue);
//       const targetIndexToUse = targetColumnIndex !== -1 ? targetColumnIndex : indexToUse;

//       if (draggedColumnValue && targetColumnValue && draggedColumnValue !== targetColumnValue) {
//         console.log(`Attempting to swap ${columnFieldName} ${draggedColumnValue} (index: ${draggedColumnIndex}) with ${targetColumnValue} (index: ${targetIndexToUse})`);

//         try {
//           // Use core engine method
//           pivotEngine.swapDataColumns(draggedColumnIndex, targetIndexToUse);
//           renderTable();
//         } catch (error) {
//           console.error('Error during column swap operation:', error);
//           // Fallback to manual swap
//           swapGenericFieldValues(draggedColumnIndex, targetIndexToUse, columnFieldName, false);
//           renderTable();
//         }
//       }
//     });
//   });

//   // ENHANCED: Row drag and drop with SWAPPING (generic for any row field)
//   const rows = document.querySelectorAll('tbody tr[draggable="true"]');
//   let draggedRowIndex = null;
//   let draggedRowValue = null;

//   console.log('Setting up row drag, found rows:', rows.length);

//   rows.forEach((row) => {
//     const rowCell = row.querySelector('.row-cell');
//     const fieldName = row.dataset.fieldName;
//     const fieldValue = row.dataset.fieldValue;
//     const globalIndex = parseInt(row.dataset.globalIndex);

//     // Validate this is a row for our configured row field
//     if (fieldName !== rowFieldName || !fieldValue) {
//       console.warn('Row field mismatch or missing data');
//       return;
//     }

//     console.log(`Setting up row drag for ${rowFieldName}: ${fieldValue} (global index: ${globalIndex})`);

//     row.addEventListener('dragstart', e => {
//       draggedRowValue = fieldValue;
//       draggedRowIndex = globalIndex;
//       e.dataTransfer.setData('text/plain', fieldValue);
//       setTimeout(() => row.classList.add('dragging'), 0);
//       console.log(`Drag started for ${rowFieldName}:`, fieldValue, 'Global index:', globalIndex);
//     });

//     row.addEventListener('dragend', () => {
//       row.classList.remove('dragging');
//       draggedRowValue = null;
//       draggedRowIndex = null;
//     });

//     row.addEventListener('dragover', e => {
//       e.preventDefault();
//     });

//     row.addEventListener('dragenter', e => {
//       e.preventDefault();
//       if (draggedRowValue && draggedRowValue !== fieldValue) {
//         row.classList.add('drag-over');
//       }
//     });

//     row.addEventListener('dragleave', () => {
//       row.classList.remove('drag-over');
//     });

//     row.addEventListener('drop', e => {
//       e.preventDefault();
//       row.classList.remove('drag-over');

//       const targetRowValue = fieldValue;
//       const targetRowIndex = globalIndex;

//       if (draggedRowValue && targetRowValue && draggedRowValue !== targetRowValue) {
//         console.log(`Swapping ${rowFieldName} ${draggedRowValue} (global: ${draggedRowIndex}) with ${targetRowValue} (global: ${targetRowIndex})`);

//         try {
//           // Use core engine method
//           pivotEngine.swapDataRows(draggedRowIndex, targetRowIndex);
//           renderTable();
//         } catch (error) {
//           console.error('Error during row swap operation:', error);
//           // Fallback to manual swap
//           swapGenericFieldValues(draggedRowIndex, targetRowIndex, rowFieldName, true);
//           renderTable();
//         }
//       }
//     });
//   });
// }

function setupDragAndDrop() {
  console.log('Setting up generic drag and drop');

  // Get field names from configuration
  const rowFieldName = pivotEngine.getRowFieldName();
  const columnFieldName = pivotEngine.getColumnFieldName();

  if (!rowFieldName || !columnFieldName) {
    console.warn('Row or column field not configured for drag and drop');
    return;
  }

  console.log(
    `Setting up drag and drop for row field: ${rowFieldName}, column field: ${columnFieldName}`
  );

  // FIXED: Use the improved column drag setup
  setupColumnDragAndDropFixed(columnFieldName);

  // Row drag setup (keep existing)
  setupRowDragAndDrop(rowFieldName);
}

// Add this new function to handle region/column swapping:
// Keep the manual swap function as fallback:
// function swapRegionsInEngine(fromIndex, toIndex) {
//   const state = pivotEngine.getState();
//   const currentRegions = getOrderedRegions(state);

//   console.log(
//     'Manual column swap - From index:',
//     fromIndex,
//     'To index:',
//     toIndex
//   );
//   console.log('Current regions:', currentRegions);

//   // Validate indices
//   if (
//     fromIndex < 0 ||
//     toIndex < 0 ||
//     fromIndex >= currentRegions.length ||
//     toIndex >= currentRegions.length
//   ) {
//     console.error('Invalid indices for column swap:', fromIndex, toIndex);
//     return;
//   }

//   if (fromIndex === toIndex) {
//     console.log('Same column, no swap needed');
//     return;
//   }

//   // Get the region names to swap
//   const fromRegion = currentRegions[fromIndex];
//   const toRegion = currentRegions[toIndex];

//   if (!fromRegion || !toRegion) {
//     console.error('Invalid regions for swap:', fromRegion, toRegion);
//     return;
//   }

//   // Create swapped region order
//   const swappedRegions = [...currentRegions];
//   swappedRegions[fromIndex] = toRegion;
//   swappedRegions[toIndex] = fromRegion;

//   console.log('After manual swap - Regions:', swappedRegions);

//   // Store the swapped region order in multiple places for persistence
//   window.swappedRegionOrder = swappedRegions;

//   // Also store in the engine state if possible
//   if (pivotEngine.state) {
//     pivotEngine.state.customRegionOrder = swappedRegions;
//   }

//   console.log(
//     'Manual column swap completed. New region order:',
//     swappedRegions
//   );
// }

// // Keep the existing swapProductsInEngine function for rows:
// function swapProductsInEngine(fromIndex, toIndex) {
//   const state = pivotEngine.getState();
//   const allUniqueProducts = [
//     ...new Set(state.rawData.map(item => item.product)),
//   ];

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

//   console.log('Swap completed. New product order:', [
//     ...new Set(pivotEngine.getState().rawData.map(item => item.product)),
//   ]);
// }

// Add this function for manual category swapping:
// function swapCategoriesInEngine(fromIndex, toIndex) {
//   const state = pivotEngine.getState();
//   const currentCategories = getOrderedCategories(state);

//   console.log('Manual column swap - From index:', fromIndex, 'To index:', toIndex);
//   console.log('Current categories:', currentCategories);

//   // Validate indices
//   if (fromIndex < 0 || toIndex < 0 || fromIndex >= currentCategories.length || toIndex >= currentCategories.length) {
//     console.error('Invalid indices for column swap:', fromIndex, toIndex);
//     return;
//   }

//   if (fromIndex === toIndex) {
//     console.log('Same column, no swap needed');
//     return;
//   }

//   // Get the category names to swap
//   const fromCategory = currentCategories[fromIndex];
//   const toCategory = currentCategories[toIndex];

//   if (!fromCategory || !toCategory) {
//     console.error('Invalid categories for swap:', fromCategory, toCategory);
//     return;
//   }

//   // Create swapped category order
//   const swappedCategories = [...currentCategories];
//   swappedCategories[fromIndex] = toCategory;
//   swappedCategories[toIndex] = fromCategory;

//   console.log('After manual swap - Categories:', swappedCategories);

//   // Store the swapped category order in multiple places for persistence
//   window.swappedRegionOrder = swappedCategories;

//   // Also store in the engine state if possible
//   if (pivotEngine.state) {
//     (pivotEngine.state).customRegionOrder = swappedCategories;
//   }

//   console.log('Manual column swap completed. New category order:', swappedCategories);
// }

// // Add this function for manual country swapping:
// function swapCountriesInEngine(fromIndex, toIndex) {
//   const state = pivotEngine.getState();
//   const allUniqueCountries = [...new Set(state.rawData.map(item => item.country).filter(country => country))];

//   console.log('Manual swap - From index:', fromIndex, 'To index:', toIndex);
//   console.log('Before swap - Countries:', allUniqueCountries);

//   // Get the country names to swap
//   const fromCountry = allUniqueCountries[fromIndex];
//   const toCountry = allUniqueCountries[toIndex];

//   if (!fromCountry || !toCountry) {
//     console.error('Invalid countries for swap:', fromCountry, toCountry);
//     return;
//   }

//   // Create new data array with swapped country order
//   const newData = [...state.rawData];

//   // Create swapped country order
//   const swappedCountries = [...allUniqueCountries];
//   swappedCountries[fromIndex] = toCountry;
//   swappedCountries[toIndex] = fromCountry;

//   console.log('After swap - Countries:', swappedCountries);

//   // Sort data according to the new country order
//   newData.sort((a, b) => {
//     const aIndex = swappedCountries.indexOf(a.country);
//     const bIndex = swappedCountries.indexOf(b.country);
//     return aIndex - bIndex;
//   });

//   // Update filteredData to maintain consistency
//   if (filteredData) {
//     filteredData.sort((a, b) => {
//       const aIndex = swappedCountries.indexOf(a.country);
//       const bIndex = swappedCountries.indexOf(b.country);
//       return aIndex - bIndex;
//     });
//   }

//   // Create new engine with swapped data
//   pivotEngine = new PivotEngine({
//     ...config,
//     data: newData,
//   });

//   console.log('Swap completed. New country order:', [...new Set(pivotEngine.getState().rawData.map(item => item.country))]);
// }

// Generic function to manually swap field values (fallback)
function swapGenericFieldValues(fromIndex, toIndex, fieldName, isRowField) {
  const state = pivotEngine.getState();
  const uniqueValues = pivotEngine.getUniqueFieldValues(fieldName);

  console.log(
    `Manual ${fieldName} swap - From index:`,
    fromIndex,
    'To index:',
    toIndex
  );
  console.log(`Current ${fieldName} values:`, uniqueValues);

  // Validate indices
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= uniqueValues.length ||
    toIndex >= uniqueValues.length
  ) {
    console.error(
      `Invalid indices for ${fieldName} swap:`,
      fromIndex,
      toIndex,
      'Available values:',
      uniqueValues.length
    );
    return;
  }

  if (fromIndex === toIndex) {
    console.log('Same index, no swap needed');
    return;
  }

  // Get the values to swap
  const fromValue = uniqueValues[fromIndex];
  const toValue = uniqueValues[toIndex];

  if (!fromValue || !toValue) {
    console.error(`Invalid ${fieldName} values for swap:`, fromValue, toValue);
    return;
  }

  console.log(`Swapping ${fieldName}: ${fromValue} <-> ${toValue}`);

  // Create swapped value order
  const swappedValues = [...uniqueValues];
  swappedValues[fromIndex] = toValue;
  swappedValues[toIndex] = fromValue;

  console.log(`After manual swap - ${fieldName} values:`, swappedValues);

  // Store the swapped order
  const storageKey = isRowField ? 'swappedRowOrder' : 'swappedColumnOrder';
  window[storageKey] = swappedValues;

  // Also store in the engine state
  if (pivotEngine.state) {
    const stateKey = isRowField ? 'customRowOrder' : 'customColumnOrder';
    pivotEngine.state[stateKey] = {
      fieldName: fieldName,
      order: swappedValues,
    };
  }

  // For row fields, we need to reorder the actual data
  if (isRowField) {
    const dataToUse = state.data || state.rawData || filteredData;
    const newData = [...dataToUse];

    // Sort data according to the new value order
    newData.sort((a, b) => {
      const aIndex = swappedValues.indexOf(a[fieldName]);
      const bIndex = swappedValues.indexOf(b[fieldName]);
      return aIndex - bIndex;
    });

    // Update filteredData to maintain consistency
    if (filteredData) {
      filteredData.sort((a, b) => {
        const aIndex = swappedValues.indexOf(a[fieldName]);
        const bIndex = swappedValues.indexOf(b[fieldName]);
        return aIndex - bIndex;
      });
    }

    // Create new engine with swapped data
    pivotEngine = new PivotEngine({
      ...config,
      data: newData,
    });
  }

  console.log(`Manual ${fieldName} swap completed. New order:`, swappedValues);
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
