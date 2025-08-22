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

// Import statements - Make sure these paths are correct
import { createHeader } from './header/header.js';
import { PivotEngine } from '@mindfiredigital/pivothead';
import { sampleData, config } from './config/config.js';

// Create a single instance of PivotEngine that will be used throughout the app's lifecycle
export let pivotEngine;

// Store the current full dataset being used (can be original or filtered)
let currentData = [...sampleData];
let showProcessedData = true;
let currentViewMode = 'processed'; // 'raw' or 'processed'

// Manage pagination state locally
let paginationState = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
};

// Initialize filter fields
function initializeFilters() {
  const filterField = document.getElementById('filterField');
  if (!filterField) {
    console.error('Filter field element not found');
    return;
  }

  filterField.innerHTML = `
    <option value="country">Country</option>
    <option value="category">Category</option>
    <option value="price">Price</option>
    <option value="discount">Discount</option>
  `;

  const filterOperator = document.getElementById('filterOperator');
  if (!filterOperator) {
    console.error('Filter operator element not found');
    return;
  }

  filterOperator.innerHTML = `
    <option value="equals">Equals</option>
    <option value="contains">Contains</option>
    <option value="greaterThan">Greater Than</option>
    <option value="lessThan">Less Than</option>
  `;
}

// Get paginated data
function getPaginatedData(data, paginationState) {
  if (!data || !Array.isArray(data)) {
    console.warn('Invalid data provided to getPaginatedData');
    return [];
  }

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
    if (currentSortConfig.direction === 'asc') {
      sortIcon.innerHTML = '&#9650;'; // Up arrow
      sortIcon.title = 'Sorted ascending';
    } else {
      sortIcon.innerHTML = '&#9660;'; // Down arrow
      sortIcon.title = 'Sorted descending';
    }
    sortIcon.style.color = '#007bff';
  } else {
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

  // Update the global data array to maintain sort
  currentData = [...rawData];

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

  currentData = [...rawData];

  console.log('Raw data rows swapped successfully');
}

function swapRawDataColumns(fromIndex, toIndex) {
  console.log('Swapping raw data columns:', fromIndex, '->', toIndex);

  if (currentData.length === 0) {
    console.error('No raw data available for column swap');
    return;
  }

  // Get current column order
  const headers = Object.keys(currentData[0]);

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= headers.length ||
    toIndex >= headers.length
  ) {
    console.error(
      'Invalid column indices for raw data swap:',
      fromIndex,
      toIndex,
      'Available columns:',
      headers.length
    );
    return;
  }

  // Initialize or update the column order
  if (!window.rawDataColumnOrder) {
    window.rawDataColumnOrder = [...headers];
  }

  // Swap in the column order array
  const temp = window.rawDataColumnOrder[fromIndex];
  window.rawDataColumnOrder[fromIndex] = window.rawDataColumnOrder[toIndex];
  window.rawDataColumnOrder[toIndex] = temp;

  console.log('Raw data column order updated:', window.rawDataColumnOrder);

  // Important: Re-render the table to show the new column order
  renderRawDataTable();
}

function renderRawDataTable() {
  try {
    console.log('Rendering raw data table');

    const rawDataToUse = pivotEngine.getState().rawData;

    if (!rawDataToUse || rawDataToUse.length === 0) {
      console.error('No raw data available');
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        tableContainer.innerHTML =
          '<div style="padding: 20px;">No data available to display.</div>';
      }
      return;
    }

    console.log(
      'Rendering raw data table with',
      rawDataToUse.length,
      'total items'
    );

    const tableContainer = document.getElementById('myTable');
    if (!tableContainer) {
      console.error('Table container not found');
      return;
    }

    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    table.style.border = '1px solid #dee2e6';

    // Get headers - use custom order if available
    let headers;
    if (window.rawDataColumnOrder && window.rawDataColumnOrder.length > 0) {
      headers = window.rawDataColumnOrder;
    } else {
      headers = rawDataToUse.length > 0 ? Object.keys(rawDataToUse[0]) : [];
    }

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

    // Update pagination
    updateRawDataPagination(rawDataToUse);

    // Get paginated data
    const paginatedData = getPaginatedData(rawDataToUse, paginationState);

    // Create table body - use the custom header order for cells too
    const tbody = document.createElement('tbody');

    paginatedData.forEach((rowData, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIndex;
      tr.dataset.globalIndex = rawDataToUse.indexOf(rowData);
      tr.setAttribute('draggable', 'true');
      tr.style.cursor = 'move';
      tr.className = 'raw-data-row';

      // Use the headers array (which respects custom order) for cell creation
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
    if (tableContainer) {
      tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error rendering raw data table: ${error.message}</div>`;
    }
  }
}

function updateRawDataPagination(rawData) {
  if (!rawData || !Array.isArray(rawData)) {
    console.warn('Invalid raw data for pagination');
    return;
  }

  // Get pageSize from the select element, with fallback
  const pageSizeElement = document.getElementById('pageSize');
  const pageSize = pageSizeElement ? Number(pageSizeElement.value) : 10;
  const totalPages = Math.ceil(rawData.length / pageSize) || 1;

  // Check if current page is valid for new pagination
  if (paginationState.currentPage > totalPages) {
    paginationState.currentPage = Math.max(1, totalPages);
  }

  paginationState.pageSize = pageSize;
  paginationState.totalPages = totalPages;
}

// Generic function to get ordered column values
function getOrderedColumnValues() {
  if (!pivotEngine) {
    console.warn('PivotEngine not initialized');
    return [];
  }
  const columnFieldName = pivotEngine.getColumnFieldName();
  if (!columnFieldName) return [];

  return pivotEngine.getOrderedUniqueFieldValues(columnFieldName, false);
}

// Generic function to get ordered row values
function getOrderedRowValues() {
  if (!pivotEngine) {
    console.warn('PivotEngine not initialized');
    return [];
  }
  const rowFieldName = pivotEngine.getRowFieldName();
  if (!rowFieldName) return [];

  return pivotEngine.getOrderedUniqueFieldValues(rowFieldName, true);
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
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
      draggedColumnIndex = null;
    });

    header.addEventListener('dragover', e => e.preventDefault());
    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedColumnIndex !== null && draggedColumnIndex !== columnIndex) {
        header.classList.add('drag-over');
      }
    });
    header.addEventListener('dragleave', () =>
      header.classList.remove('drag-over')
    );
    header.addEventListener('drop', e => {
      e.preventDefault();
      header.classList.remove('drag-over');

      const targetColumnIndex = columnIndex;

      if (
        draggedColumnIndex !== null &&
        draggedColumnIndex !== targetColumnIndex
      ) {
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
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      draggedRowIndex = null;
    });

    row.addEventListener('dragover', e => e.preventDefault());
    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedRowIndex !== null && draggedRowIndex !== globalIndex) {
        row.classList.add('drag-over');
      }
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');

      const targetRowIndex = globalIndex;

      if (draggedRowIndex !== null && draggedRowIndex !== targetRowIndex) {
        swapRawDataRows(draggedRowIndex, targetRowIndex, rawData);
        renderRawDataTable();
      }
    });
  });
}

// Generic renderTable function that works with any field names
function renderTable() {
  // Check current view mode
  if (currentViewMode === 'raw') {
    console.log('Rendering raw data view');
    renderRawDataTable();
    return;
  }

  if (!pivotEngine) {
    console.error('PivotEngine not initialized');
    return;
  }

  try {
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

    const tableContainer = document.getElementById('myTable');
    if (!tableContainer) {
      console.error('Table container not found');
      return;
    }

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
    const columnHeaderRow = document.createElement('tr');

    // Add empty cell for top-left corner
    const cornerCell = document.createElement('th');
    cornerCell.style.padding = '12px';
    cornerCell.style.backgroundColor = '#f8f9fa';
    cornerCell.style.borderBottom = '2px solid #dee2e6';
    cornerCell.style.borderRight = '1px solid #dee2e6';
    cornerCell.textContent = `${getFieldDisplayName(rowFieldName)} / ${getFieldDisplayName(columnFieldName)}`;
    columnHeaderRow.appendChild(cornerCell);

    // Get unique column values in their correct order
    const uniqueColumnValues = getOrderedColumnValues();

    uniqueColumnValues.forEach((columnValue, index) => {
      const th = document.createElement('th');
      th.textContent = columnValue;
      th.colSpan = state.measures.length;
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';
      th.style.textAlign = 'center';
      th.dataset.fieldName = columnFieldName;
      th.dataset.fieldValue = columnValue;
      th.dataset.columnIndex = index; // Store original index
      th.setAttribute('draggable', 'true');
      th.style.cursor = 'move';
      th.className = 'column-header';
      columnHeaderRow.appendChild(th);
    });
    thead.appendChild(columnHeaderRow);

    const measureHeaderRow = document.createElement('tr');
    const currentSortConfig = state.sortConfig?.[0];

    const rowHeader = document.createElement('th');
    rowHeader.style.padding = '12px';
    rowHeader.style.backgroundColor = '#f8f9fa';
    rowHeader.style.borderBottom = '2px solid #dee2e6';
    rowHeader.style.borderRight = '1px solid #dee2e6';
    rowHeader.style.cursor = 'pointer';

    const rowHeaderContent = document.createElement('div');
    rowHeaderContent.style.display = 'flex';
    rowHeaderContent.style.alignItems = 'center';
    const rowText = document.createElement('span');
    rowText.textContent = getFieldDisplayName(rowFieldName);
    rowHeaderContent.appendChild(rowText);

    const rowSortIcon = createSortIcon(rowFieldName, currentSortConfig);
    rowHeaderContent.appendChild(rowSortIcon);
    rowHeader.appendChild(rowHeaderContent);

    rowHeader.addEventListener('click', () => {
      const direction =
        currentSortConfig?.field === rowFieldName &&
        currentSortConfig?.direction === 'asc'
          ? 'desc'
          : 'asc';
      pivotEngine.sort(rowFieldName, direction);
    });
    measureHeaderRow.appendChild(rowHeader);

    uniqueColumnValues.forEach(() => {
      state.measures.forEach(measure => {
        const th = document.createElement('th');
        th.style.padding = '12px';
        th.style.backgroundColor = '#f8f9fa';
        th.style.borderBottom = '2px solid #dee2e6';
        th.style.borderRight = '1px solid #dee2e6';
        th.style.cursor = 'pointer';

        const headerContent = document.createElement('div');
        headerContent.style.display = 'flex';
        headerContent.style.alignItems = 'center';
        headerContent.style.justifyContent = 'space-between';
        const measureText = document.createElement('span');
        measureText.textContent = measure.caption;
        headerContent.appendChild(measureText);

        const sortIcon = createSortIcon(measure.uniqueName, currentSortConfig);
        headerContent.appendChild(sortIcon);
        th.appendChild(headerContent);

        th.addEventListener('click', () => {
          const direction =
            currentSortConfig?.field === measure.uniqueName &&
            currentSortConfig?.direction === 'asc'
              ? 'desc'
              : 'asc';
          pivotEngine.sort(measure.uniqueName, direction);
        });
        measureHeaderRow.appendChild(th);
      });
    });
    thead.appendChild(measureHeaderRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const allUniqueRowValues = getOrderedRowValues();
    updatePagination(allUniqueRowValues, false);
    const paginatedRowValues = getPaginatedData(
      allUniqueRowValues,
      paginationState
    );

    paginatedRowValues.forEach((rowValue, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.fieldName = rowFieldName;
      tr.dataset.fieldValue = rowValue;
      tr.setAttribute('draggable', 'true');
      tr.style.cursor = 'move';

      const rowCell = document.createElement('td');
      rowCell.textContent = rowValue;
      rowCell.style.fontWeight = 'bold';
      rowCell.style.padding = '8px';
      rowCell.style.borderBottom = '1px solid #dee2e6';
      rowCell.style.borderRight = '1px solid #dee2e6';
      rowCell.className = 'row-cell';
      tr.appendChild(rowCell);

      uniqueColumnValues.forEach(columnValue => {
        const filteredDataForCell = state.rawData.filter(
          item =>
            item[rowFieldName] === rowValue &&
            item[columnFieldName] === columnValue
        );

        state.measures.forEach(measure => {
          const td = document.createElement('td');
          td.style.padding = '8px';
          td.style.borderBottom = '1px solid #dee2e6';
          td.style.borderRight = '1px solid #dee2e6';
          td.style.textAlign = 'right';

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
                value =
                  filteredDataForCell.reduce(
                    (sum, item) => sum + (item[measure.uniqueName] || 0),
                    0
                  ) / filteredDataForCell.length;
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

          const formattedValue = pivotEngine.formatValue(
            value,
            measure.uniqueName
          );
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

          tr.appendChild(td);
        });
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    updatePaginationInfo('Processed Data');
    setupDragAndDrop();
  } catch (error) {
    console.error('Error rendering table:', error);
    const tableContainer = document.getElementById('myTable');
    if (tableContainer) {
      tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error rendering table: ${error.message}</div>`;
    }
  }
}

function setupColumnDragAndDropFixed(columnFieldName) {
  const columnHeaders = document.querySelectorAll(
    '.column-header[draggable="true"]'
  );
  let draggedColumnValue = null;

  if (!pivotEngine) return;
  const uniqueColumnValues = pivotEngine.getOrderedUniqueFieldValues(
    columnFieldName,
    false
  );

  columnHeaders.forEach(header => {
    const fieldValue = header.dataset.fieldValue;

    header.addEventListener('dragstart', e => {
      draggedColumnValue = fieldValue;
      e.dataTransfer.setData('text/plain', fieldValue);
      setTimeout(() => header.classList.add('dragging'), 0);
    });

    header.addEventListener('dragend', () => {
      header.classList.remove('dragging');
      draggedColumnValue = null;
    });

    header.addEventListener('dragover', e => e.preventDefault());
    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedColumnValue && draggedColumnValue !== fieldValue) {
        header.classList.add('drag-over');
      }
    });
    header.addEventListener('dragleave', () =>
      header.classList.remove('drag-over')
    );
    header.addEventListener('drop', e => {
      e.preventDefault();
      header.classList.remove('drag-over');

      const targetColumnValue = fieldValue;
      const fromIndex = uniqueColumnValues.indexOf(draggedColumnValue);
      const toIndex = uniqueColumnValues.indexOf(targetColumnValue);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        pivotEngine.swapDataColumns(fromIndex, toIndex);
      }
    });
  });
}

function setupRowDragAndDrop(rowFieldName) {
  const rows = document.querySelectorAll('tbody tr[draggable="true"]');
  let draggedRowValue = null;

  if (!pivotEngine) return;
  const uniqueRowValues = pivotEngine.getOrderedUniqueFieldValues(
    rowFieldName,
    true
  );

  rows.forEach(row => {
    const fieldValue = row.dataset.fieldValue;

    row.addEventListener('dragstart', e => {
      draggedRowValue = fieldValue;
      e.dataTransfer.setData('text/plain', fieldValue);
      setTimeout(() => row.classList.add('dragging'), 0);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      draggedRowValue = null;
    });

    row.addEventListener('dragover', e => e.preventDefault());
    row.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedRowValue && draggedRowValue !== fieldValue) {
        row.classList.add('drag-over');
      }
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');

      const targetRowValue = fieldValue;
      const fromIndex = uniqueRowValues.indexOf(draggedRowValue);
      const toIndex = uniqueRowValues.indexOf(targetRowValue);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        pivotEngine.swapDataRows(fromIndex, toIndex);
      }
    });
  });
}

function getFieldDisplayName(fieldName) {
  return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// Reset filters
function resetFilters() {
  // Use the engine's built-in method to clear filters
  pivotEngine.applyFilters([]);

  // Reset filter inputs
  const filterField = document.getElementById('filterField');
  const filterOperator = document.getElementById('filterOperator');
  const filterValue = document.getElementById('filterValue');

  if (filterField) filterField.selectedIndex = 0;
  if (filterOperator) filterOperator.selectedIndex = 0;
  if (filterValue) filterValue.value = '';
}

// Update pagination based on data size
function updatePaginationInfo(viewType = 'Processed Data') {
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `${viewType} - Page ${paginationState.currentPage} of ${paginationState.totalPages}`;
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
  const pageSizeElement = document.getElementById('pageSize');
  const pageSize = pageSizeElement ? Number(pageSizeElement.value) : 10;
  const totalPages = Math.ceil(data.length / pageSize) || 1;

  if (resetPage) {
    paginationState.currentPage = 1;
  } else if (paginationState.currentPage > totalPages) {
    paginationState.currentPage = totalPages;
  }

  paginationState.pageSize = pageSize;
  paginationState.totalPages = totalPages;
}

export function formatTable(newConfig) {
  try {
    // Re-initialize engine with new config but same data
    pivotEngine = new PivotEngine({
      ...newConfig,
      data: pivotEngine.getState().rawData,
    });
    pivotEngine.subscribe(state => {
      currentData = state.rawData; // Keep track of current data from engine
      renderTable();
    });
    renderTable(); // Initial render with new format
  } catch (error) {
    console.error('Error formatting table:', error);
  }
}

// Event Listeners
function setupEventListeners() {
  const switchButton = document.getElementById('switchView');
  if (switchButton) {
    switchButton.addEventListener('click', () => {
      currentViewMode = currentViewMode === 'processed' ? 'raw' : 'processed';
      switchButton.textContent =
        currentViewMode === 'processed'
          ? 'Switch to Raw Data'
          : 'Switch to Processed Data';
      paginationState.currentPage = 1;
      renderTable();
    });
  }

  const pageSizeElement = document.getElementById('pageSize');
  if (pageSizeElement) {
    pageSizeElement.addEventListener('change', e => {
      const newPageSize = Number(e.target.value);
      const currentFirstItem =
        (paginationState.currentPage - 1) * paginationState.pageSize;
      paginationState.currentPage =
        Math.floor(currentFirstItem / newPageSize) + 1;
      renderTable();
    });
  }

  const prevButton = document.getElementById('prevPage');
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (paginationState.currentPage > 1) {
        paginationState.currentPage--;
        renderTable();
      }
    });
  }

  const nextButton = document.getElementById('nextPage');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (paginationState.currentPage < paginationState.totalPages) {
        paginationState.currentPage++;
        renderTable();
      }
    });
  }

  const applyFilterButton = document.getElementById('applyFilter');
  if (applyFilterButton) {
    applyFilterButton.addEventListener('click', () => {
      const field = document.getElementById('filterField').value;
      const operator = document.getElementById('filterOperator').value;
      const value = document.getElementById('filterValue').value;

      if (!value) {
        alert('Please enter a filter value');
        return;
      }

      const filter = { field, operator, value };

      // Use the engine's built-in filter method
      pivotEngine.applyFilters([filter]);

      // Reset to first page when applying a new filter
      paginationState.currentPage = 1;
    });
  }

  const resetFilterButton = document.getElementById('resetFilter');
  if (resetFilterButton) {
    resetFilterButton.addEventListener('click', resetFilters);
  }
}

function addDraggableStyles() {
  if (document.querySelector('#pivot-table-styles')) return;

  const styleEl = document.createElement('style');
  styleEl.id = 'pivot-table-styles';
  styleEl.innerHTML = `
        .dragging { opacity: 0.5; background-color: #f0f0f0; }
        .drag-over { border: 2px dashed #666 !important; background-color: #e9ecef !important; }
        th[draggable="true"], tr[draggable="true"] { cursor: move; }
        .column-header[draggable="true"] { cursor: move; transition: background-color 0.2s; }
        .column-header[draggable="true"]:hover { background-color: #e3f2fd !important; border: 1px solid #2196f3 !important; }
        .column-header.dragging { opacity: 0.6; background-color: #ffecb3 !important; }
        .column-header.drag-over { border: 3px dashed #4caf50 !important; background-color: #e8f5e8 !important; }
        .controls-container { margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
        .filter-container, .pagination-container { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        #myTable { overflow-x: auto; width: 100%; }
        button { padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:disabled { background-color: #cccccc; cursor: not-allowed; }
        select, input { padding: 5px; border-radius: 4px; border: 1px solid #ddd; }
        .drill-down-cell { cursor: pointer; transition: background-color 0.2s; }
        .drill-down-cell:hover { background-color: #e3f2fd !important; border: 2px solid #2196f3 !important; }
        .drill-down-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .drill-down-content { background: white; border-radius: 8px; padding: 20px; width: 90%; max-width: 800px; max-height: 80%; overflow: auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
        .drill-down-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
        .drill-down-title { font-size: 18px; font-weight: bold; color: #333; }
        .drill-down-close { background: #f44336; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .drill-down-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .drill-down-table th { background: #f8f9fa; padding: 8px; border: 1px solid #dee2e6; font-weight: bold; text-align: left; }
        .drill-down-table td { padding: 6px 8px; border: 1px solid #dee2e6; }
    `;
  document.head.appendChild(styleEl);
}

// Create drill-down modal for any fields
function createDrillDownModal(
  rowValue,
  columnValue,
  measure,
  rawDetails,
  aggregatedValue,
  rowFieldName,
  columnFieldName
) {
  const existingModal = document.querySelector('.drill-down-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'drill-down-modal';

  const content = document.createElement('div');
  content.className = 'drill-down-content';

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

  const table = document.createElement('table');
  table.className = 'drill-down-table';
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const columns = rawDetails.length > 0 ? Object.keys(rawDetails[0]) : [];
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = getFieldDisplayName(col);
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rawDetails.forEach(row => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      td.textContent = row[col];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  content.appendChild(header);
  content.appendChild(table);
  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });
}

// Generic getDrillDownData function
function getDrillDownData(
  rowValue,
  columnValue,
  measure,
  rowFieldName,
  columnFieldName
) {
  if (!pivotEngine) return [];
  const state = pivotEngine.getState();
  return state.rawData.filter(
    item =>
      item[rowFieldName] === rowValue && item[columnFieldName] === columnValue
  );
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
  td.className = 'drill-down-cell';
  td.title = `Double-click to see details for ${rowFieldName}: ${rowValue} - ${columnFieldName}: ${columnValue}`;
  td.addEventListener('dblclick', e => {
    e.preventDefault();
    e.stopPropagation();
    const rawDetails = getDrillDownData(
      rowValue,
      columnValue,
      measure,
      rowFieldName,
      columnFieldName
    );
    if (rawDetails.length === 0) {
      alert(`No detailed data found`);
      return;
    }
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
  if (document.querySelector('.controls-container')) return;

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
  if (myTable?.parentNode) {
    myTable.parentNode.insertBefore(container, myTable);
  }
}

// Set up drag and drop functionality
function setupDragAndDrop() {
  if (!pivotEngine) return;
  const rowFieldName = pivotEngine.getRowFieldName();
  const columnFieldName = pivotEngine.getColumnFieldName();
  if (rowFieldName) setupRowDragAndDrop(rowFieldName);
  if (columnFieldName) setupColumnDragAndDropFixed(columnFieldName);
}

export function onSectionItemDrop(droppedFields) {
  let droppedFieldsInSections = JSON.stringify({
    rows: Array.from(droppedFields.rows),
    columns: Array.from(droppedFields.columns),
    values: Array.from(droppedFields.values),
    filters: Array.from(droppedFields.filters),
  });
  const parsedDroppedFieldsInSections = JSON.parse(droppedFieldsInSections);

  const transformedRows = parsedDroppedFieldsInSections.rows.map(rowField => ({
    uniqueName: rowField.toLowerCase(),
    caption: rowField,
  }));
  const transformedColumns = parsedDroppedFieldsInSections.columns.map(
    columnField => ({
      uniqueName: columnField.toLowerCase(),
      caption: columnField,
    })
  );

  if (pivotEngine) {
    const newConfig = {
      ...config,
      rows: transformedRows,
      columns: transformedColumns,
    };
    formatTable(newConfig);
  }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (!sampleData || !Array.isArray(sampleData) || sampleData.length === 0) {
      console.error('Sample data is not available or empty');
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        tableContainer.innerHTML =
          '<div style="color: red; padding: 20px;">Error: Sample data not available.</div>';
      }
      return;
    }

    // Create a single PivotEngine instance
    pivotEngine = new PivotEngine({
      ...config,
      data: sampleData, // Initialize with the full dataset
    });

    // Subscribe to state changes to re-render the UI automatically
    pivotEngine.subscribe(state => {
      // The engine's state reflects the latest data after any operation (filtering, sorting, etc.)
      currentData = state.rawData; // Keep track of the engine's current data view
      renderTable();
    });

    // Initialize header if configured
    if (config.toolbar && typeof createHeader === 'function') {
      createHeader(config);
    }

    // Add UI elements
    addDraggableStyles();
    addControlsHTML();
    initializeFilters();
    setupEventListeners();

    // Initial render
    renderTable();

    console.log('Initialization completed successfully');
  } catch (error) {
    console.error('Error during initialization:', error);
    const tableContainer = document.getElementById('myTable');
    if (tableContainer) {
      tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error during initialization: ${error.message}</div>`;
    }
  }
});
