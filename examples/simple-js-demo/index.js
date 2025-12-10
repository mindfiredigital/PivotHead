/* PivotHead Demo - Fixed Sorting Implementation
 *
 * This file demonstrates the usage of the PivotheadCore library to create an interactive pivot table.
 * Features include:
 * - Sorting (FIXED)
 * - Grouping
 * - Column resizing
 * - Column reordering (drag and drop)
 * - Row reordering (drag and drop)
 */

// Import statements - Make sure these paths are correct
import { createHeader } from './header/header.js';
import {
  PivotEngine,
  ConnectService,
  FieldService,
} from '@mindfiredigital/pivothead';
import { sampleData, config } from './config/config.js';
import { VirtualScroller } from './services/VirtualScroller.js';

// Create a single instance of PivotEngine that will be used throughout the app's lifecycle
export let pivotEngine;

// Virtual Scroller instance for large datasets
let virtualScroller = null;

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

  // Build field list dynamically from current engine data
  let fields = [];
  try {
    if (pivotEngine) {
      const stateNow = pivotEngine.getState();
      const sample = (stateNow.rawData && stateNow.rawData[0]) || null;
      if (sample) {
        fields = Object.keys(sample).filter(k => k !== '__all__');
      }
    }
  } catch (e) {
    console.warn('Unable to infer fields for filters from engine:', e);
  }

  // Fallback to defaults if no fields were detected
  if (!fields || fields.length === 0) {
    fields = ['country', 'category', 'price', 'discount'];
  }

  filterField.innerHTML = fields
    .map(f => `<option value="${f}">${getFieldDisplayName(f)}</option>`)
    .join('');

  const filterOperator = document.getElementById('filterOperator');
  if (!filterOperator) {
    console.error('Filter operator element not found');
    return;
  }

  filterOperator.innerHTML = `
    <option value="contains" selected>Contains</option>
    <option value="equals">Equals</option>
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

// FIXED: Helper function to create sort icons with proper state tracking
function createSortIcon(field, currentSortConfig) {
  const sortIcon = document.createElement('span');
  sortIcon.style.marginLeft = '5px';
  sortIcon.style.display = 'inline-block';
  sortIcon.style.cursor = 'pointer';
  sortIcon.style.fontSize = '12px';
  sortIcon.style.userSelect = 'none';

  // Check if this field is currently being sorted
  const isCurrentlySorted =
    currentSortConfig && currentSortConfig.field === field;

  if (isCurrentlySorted) {
    if (currentSortConfig.direction === 'asc') {
      sortIcon.innerHTML = '▲'; // Up triangle
      sortIcon.title = `Sorted by ${field} ascending - click to sort descending`;
      sortIcon.style.color = '#007bff';
    } else {
      sortIcon.innerHTML = '▼'; // Down triangle
      sortIcon.title = `Sorted by ${field} descending - click to sort ascending`;
      sortIcon.style.color = '#007bff';
    }
  } else {
    sortIcon.innerHTML = '↕'; // Up/down arrow
    sortIcon.title = `Click to sort by ${field}`;
    sortIcon.style.color = '#6c757d';
    sortIcon.style.opacity = '0.7';
  }

  // Add hover effect
  sortIcon.addEventListener('mouseenter', () => {
    if (!isCurrentlySorted) {
      sortIcon.style.opacity = '1';
      sortIcon.style.color = '#007bff';
    }
  });

  sortIcon.addEventListener('mouseleave', () => {
    if (!isCurrentlySorted) {
      sortIcon.style.opacity = '0.7';
      sortIcon.style.color = '#6c757d';
    }
  });

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

  // CRITICAL FIX: Update the pivot engine's data source with the reordered data
  // This ensures that when switching to processed mode, the engine has the correct data
  if (pivotEngine) {
    try {
      pivotEngine.updateDataSource(rawData);
      console.log('Pivot engine data source updated with reordered data');
    } catch (error) {
      console.error('Error updating pivot engine data source:', error);
    }
  }

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

// UPDATED: Raw data table rendering with virtual scrolling for large datasets
function renderRawDataTable() {
  try {
    const startTime = performance.now();
    console.log('⏱️ Starting raw data table render...');

    // Log performance mode if available
    if (window.lastPerformanceMode) {
      console.log(
        `📊 Data was processed using: ${window.lastPerformanceMode.toUpperCase()}`
      );
    }

    // CRITICAL FIX: Get raw data from pivot engine state
    // After file upload, the engine's state should have the uploaded data
    let rawDataToUse = null;

    if (pivotEngine) {
      const state = pivotEngine.getState();
      rawDataToUse = state.rawData || state.data;

      console.log('Raw data source check:', {
        hasRawData: !!state.rawData,
        hasData: !!state.data,
        rawDataLength: state.rawData?.length || 0,
        dataLength: state.data?.length || 0,
      });
    }

    // Fallback to currentData if engine state is empty
    if (!rawDataToUse || rawDataToUse.length === 0) {
      console.warn('No raw data in engine state, using currentData fallback');
      rawDataToUse = currentData;
    }

    if (!rawDataToUse || rawDataToUse.length === 0) {
      console.error('No raw data available from any source');
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        tableContainer.innerHTML =
          '<div style="padding: 20px;">No data available to display. Please upload a file.</div>';
      }
      return;
    }

    console.log(
      `⏱️ Rendering raw data table with ${rawDataToUse.length.toLocaleString()} total items`
    );

    const tableContainer = document.getElementById('myTable');
    if (!tableContainer) {
      console.error('Table container not found');
      return;
    }

    // Get headers - use custom order if available
    let headers;
    if (window.rawDataColumnOrder && window.rawDataColumnOrder.length > 0) {
      headers = window.rawDataColumnOrder;
    } else {
      headers = rawDataToUse.length > 0 ? Object.keys(rawDataToUse[0]) : [];
    }

    // Use virtual scrolling for large datasets (> 1000 rows)
    const VIRTUAL_SCROLL_THRESHOLD = 1000;
    const useVirtualScrolling = rawDataToUse.length > VIRTUAL_SCROLL_THRESHOLD;

    if (useVirtualScrolling) {
      console.log('✨ Using virtual scrolling for optimal performance');

      // Show info message
      const infoMessage = document.createElement('div');
      infoMessage.style.cssText = `
        background: #e3f2fd;
        border: 1px solid #2196f3;
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        color: #1565c0;
        display: flex;
        align-items: center;
        gap: 10px;
      `;
      infoMessage.innerHTML = `
        <strong>✨ Virtual Scrolling Enabled</strong>
        <span>Smoothly handling ${rawDataToUse.length.toLocaleString()} rows with drag & drop support!</span>
      `;

      tableContainer.innerHTML = '';
      tableContainer.appendChild(infoMessage);

      // Destroy existing virtual scroller if any
      if (virtualScroller) {
        virtualScroller.destroy();
      }

      // Create virtual scroller container
      const scrollerContainer = document.createElement('div');
      scrollerContainer.id = 'virtual-scroller-container';
      tableContainer.appendChild(scrollerContainer);

      // Get current sort state
      const currentSort = window.rawDataSort || {};

      // Header renderer
      const renderHeader = headersList => {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        headersList.forEach((headerText, index) => {
          const th = document.createElement('th');
          th.style.cssText = `
            padding: 12px 16px;
            background-color: #f5f7fa;
            border-bottom: 2px solid #dee2e6;
            border-right: 1px solid #e8eaed;
            cursor: pointer;
            position: sticky;
            top: 0;
            z-index: 10;
            user-select: none;
            font-weight: 600;
            font-size: 13px;
            color: #202124;
            min-width: 120px;
            max-width: 300px;
            text-align: left;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          `;

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

          const sortIcon = createSortIcon(headerText, {
            field: currentSort.column,
            direction: currentSort.direction,
          });
          headerContent.appendChild(sortIcon);

          th.appendChild(headerContent);

          // Click handler for sorting
          th.addEventListener('click', e => {
            e.stopPropagation();
            sortRawDataByColumn(headerText, rawDataToUse);
          });

          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        return thead;
      };

      // Row renderer
      const renderRow = (rowData, rowIndex, headersList) => {
        const tr = document.createElement('tr');
        tr.dataset.rowIndex = rowIndex;
        tr.dataset.globalIndex = rowIndex;
        tr.className = 'raw-data-row';
        tr.style.height = '40px';

        headersList.forEach(header => {
          const td = document.createElement('td');
          td.style.cssText = `
            padding: 10px 16px;
            border-bottom: 1px solid #e8eaed;
            border-right: 1px solid #e8eaed;
            min-width: 120px;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
            color: #3c4043;
            line-height: 20px;
            background-color: #fff;
            transition: background-color 0.2s;
          `;

          let cellValue = rowData[header];
          let displayValue = cellValue;

          if (cellValue === null || cellValue === undefined) {
            displayValue = '';
          } else if (typeof cellValue === 'number') {
            if (
              header === 'price' ||
              header === 'sales' ||
              header === 'revenue' ||
              header === 'discount'
            ) {
              displayValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(cellValue);
            } else if (typeof cellValue === 'number' && cellValue % 1 !== 0) {
              displayValue = cellValue.toFixed(2);
            }
          } else {
            displayValue = String(cellValue);
          }

          td.textContent = displayValue;

          // Add tooltip if text is truncated
          if (displayValue && String(displayValue).length > 30) {
            td.title = String(displayValue);
            td.style.cursor = 'help';
          }

          // Hover effect
          td.addEventListener('mouseenter', () => {
            td.style.backgroundColor = '#f8f9fa';
          });
          td.addEventListener('mouseleave', () => {
            td.style.backgroundColor = '#fff';
          });

          tr.appendChild(td);
        });

        return tr;
      };

      // Drag and drop handler
      const handleDragDrop = (fromIndex, toIndex) => {
        console.log(`Swapping rows: ${fromIndex} <-> ${toIndex}`);
        const temp = rawDataToUse[fromIndex];
        rawDataToUse[fromIndex] = rawDataToUse[toIndex];
        rawDataToUse[toIndex] = temp;

        // Update the engine's raw data
        pivotEngine.getState().rawData = rawDataToUse;

        // Refresh the virtual scroller
        virtualScroller.refresh();
      };

      // Initialize virtual scroller
      virtualScroller = new VirtualScroller({
        container: scrollerContainer,
        data: rawDataToUse,
        headers: headers,
        rowHeight: 40,
        bufferSize: 10,
        renderRow: renderRow,
        renderHeader: renderHeader,
        onDragDrop: handleDragDrop,
      });

      virtualScroller.mount(scrollerContainer);

      // Update pagination info
      const paginationInfo = document.getElementById('paginationInfo');
      if (paginationInfo) {
        paginationInfo.textContent = `Showing all ${rawDataToUse.length.toLocaleString()} rows (virtual scrolling)`;
      }
    } else {
      // Use traditional rendering for small datasets (< 1000 rows)
      tableContainer.innerHTML = '';

      // Destroy existing virtual scroller if any
      if (virtualScroller) {
        virtualScroller.destroy();
        virtualScroller = null;
      }

      // Create scrollable wrapper
      const tableWrapper = document.createElement('div');
      tableWrapper.style.cssText = `
        max-height: 600px;
        overflow: auto;
        border: 1px solid #e8eaed;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        margin-top: 10px;
      `;

      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        table-layout: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      `;

      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');

      // Get current sort state for raw data
      const currentSort = window.rawDataSort || {};

      headers.forEach((headerText, index) => {
        const th = document.createElement('th');
        th.style.cssText = `
          padding: 12px 16px;
          background-color: #f5f7fa;
          border-bottom: 2px solid #dee2e6;
          border-right: 1px solid #e8eaed;
          cursor: pointer;
          position: sticky;
          top: 0;
          z-index: 10;
          user-select: none;
          font-weight: 600;
          font-size: 13px;
          color: #202124;
          min-width: 120px;
          max-width: 300px;
          text-align: left;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        `;

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

        const sortIcon = createSortIcon(headerText, {
          field: currentSort.column,
          direction: currentSort.direction,
        });
        headerContent.appendChild(sortIcon);

        th.appendChild(headerContent);

        // Click handler for sorting
        th.addEventListener('click', e => {
          e.stopPropagation();
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
          td.style.cssText = `
            padding: 10px 16px;
            border-bottom: 1px solid #e8eaed;
            border-right: 1px solid #e8eaed;
            min-width: 120px;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
            color: #3c4043;
            line-height: 20px;
            background-color: #fff;
            transition: background-color 0.2s;
          `;

          let cellValue = rowData[header];
          let displayValue = cellValue;

          if (cellValue === null || cellValue === undefined) {
            displayValue = '';
          } else if (typeof cellValue === 'number') {
            if (
              header === 'price' ||
              header === 'sales' ||
              header === 'revenue' ||
              header === 'discount'
            ) {
              displayValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(cellValue);
            } else if (typeof cellValue === 'number' && cellValue % 1 !== 0) {
              displayValue = cellValue.toFixed(2);
            }
          } else {
            displayValue = String(cellValue);
          }

          td.textContent = displayValue;

          // Add tooltip if text is truncated
          if (displayValue && String(displayValue).length > 30) {
            td.title = String(displayValue);
            td.style.cursor = 'help';
          }

          // Hover effect
          td.addEventListener('mouseenter', () => {
            td.style.backgroundColor = '#f8f9fa';
          });
          td.addEventListener('mouseleave', () => {
            td.style.backgroundColor = '#fff';
          });

          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      tableWrapper.appendChild(table);
      tableContainer.appendChild(tableWrapper);

      // Update pagination info
      updatePaginationInfo('Raw Data');

      // Set up drag and drop for small datasets
      setupRawDataDragAndDrop(rawDataToUse);
    }

    const endTime = performance.now();
    console.log(
      `⏱️ Raw data table rendered in ${((endTime - startTime) / 1000).toFixed(2)}s`
    );
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

  const state = pivotEngine.getState();
  const columnFieldName = pivotEngine.getColumnFieldName();
  if (!columnFieldName) return [];

  // Prefer engine-provided custom order if available
  try {
    const customOrdered =
      pivotEngine.getOrderedColumnValues &&
      pivotEngine.getOrderedColumnValues();
    if (Array.isArray(customOrdered) && customOrdered.length > 0) {
      return customOrdered;
    }
  } catch (error) {
    console.warn('Could not get ordered column values from engine:', error);
  }

  // Fallback: compute unique values from current filtered data
  const filteredRawData = state.rawData || [];
  const uniqueColumnValues = [
    ...new Set(filteredRawData.map(item => item[columnFieldName])),
  ];
  return uniqueColumnValues;
}

// Generic function to get ordered row values
function getOrderedRowValues() {
  if (!pivotEngine) {
    console.warn('PivotEngine not initialized');
    return [];
  }

  const state = pivotEngine.getState();
  const rowFieldName = pivotEngine.getRowFieldName();
  if (!rowFieldName) return [];

  // Prefer engine-provided custom order if available
  try {
    const customOrdered =
      pivotEngine.getOrderedRowValues && pivotEngine.getOrderedRowValues();
    if (Array.isArray(customOrdered) && customOrdered.length > 0) {
      return customOrdered;
    }
  } catch (error) {
    console.warn('Could not get ordered row values from engine:', error);
  }

  // Fallback: compute unique values from current filtered data
  const filteredRawData = state.rawData || [];
  const uniqueRowValues = [
    ...new Set(filteredRawData.map(item => item[rowFieldName])),
  ];
  return uniqueRowValues;
}

function getSortedRowValuesByMeasure(
  rowFieldName,
  columnFieldName,
  sortConfig
) {
  const state = pivotEngine.getState();
  const uniqueRowValues = pivotEngine.getUniqueFieldValues(rowFieldName);
  const uniqueColumnValues = pivotEngine.getUniqueFieldValues(columnFieldName);

  console.log(
    'Sorting rows by measure:',
    sortConfig.field,
    'direction:',
    sortConfig.direction
  );

  // Find the measure configuration
  const measure = state.measures.find(m => m.uniqueName === sortConfig.field);
  if (!measure) {
    console.error('Measure not found:', sortConfig.field);
    return uniqueRowValues;
  }

  // Calculate total aggregated value for each row across all columns
  const rowTotals = uniqueRowValues.map(rowValue => {
    let total = 0;

    // Sum the measure values across all columns for this row
    uniqueColumnValues.forEach(columnValue => {
      const cellValue = pivotEngine.calculateCellValue(
        rowValue,
        columnValue,
        measure,
        rowFieldName,
        columnFieldName
      );
      total += cellValue || 0;
    });

    return {
      rowValue,
      total,
    };
  });

  console.log('Row totals before sorting:', rowTotals.slice(0, 3));

  // Sort by total
  rowTotals.sort((a, b) => {
    const result = a.total - b.total;
    return sortConfig.direction === 'asc' ? result : -result;
  });

  console.log('Row totals after sorting:', rowTotals.slice(0, 3));

  // Return just the sorted row values
  return rowTotals.map(item => item.rowValue);
}

function setupRawDataDragAndDrop(rawData) {
  console.log('✨ Setting up drag and drop with', rawData.length, 'items');

  // Note: For large datasets (> 1000 rows), virtual scrolling handles drag/drop
  // This function only sets up drag/drop for traditional rendering (< 1000 rows)

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

// FIXED: Main table rendering function with proper pivot engine sorting
function renderTable() {
  // Check current view mode
  if (currentViewMode === 'raw') {
    console.log('Rendering raw data view');
    renderRawDataTable();
    return;
  }

  if (!pivotEngine) {
    console.error('PivotEngine not initialized');
    const tableContainer = document.getElementById('myTable');
    if (tableContainer) {
      tableContainer.innerHTML =
        '<div style="padding: 20px; color: red;">Error: Pivot engine not initialized. Please refresh the page.</div>';
    }
    return;
  }

  try {
    console.log('🔄 Starting renderTable for processed mode...');
    const state = pivotEngine.getState();
    console.log('📊 Current Engine State:', {
      hasProcessedData: !!state.processedData,
      hasRawData: !!state.rawData,
      dataHandlingMode: state.dataHandlingMode,
      rowsCount: state.rows?.length || 0,
      columnsCount: state.columns?.length || 0,
      measuresCount: state.measures?.length || 0,
    });

    if (!state.processedData) {
      console.error('❌ No processed data available in engine state');
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        tableContainer.innerHTML =
          '<div style="padding: 20px; color: red;">Error: No processed data available. Please upload a file.</div>';
      }
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
    // Hide the column axis label when using synthesized '__all__'
    if (columnFieldName === '__all__') {
      cornerCell.textContent = `${getFieldDisplayName(rowFieldName)}`;
    } else {
      cornerCell.textContent = `${getFieldDisplayName(rowFieldName)} / ${getFieldDisplayName(columnFieldName)}`;
    }
    columnHeaderRow.appendChild(cornerCell);

    // Get unique column values in their correct order
    let uniqueColumnValues = getOrderedColumnValues();

    // Fix: Use custom order from pivotEngine state if available
    if (state.customColumnOrder && state.customColumnOrder.length > 0) {
      uniqueColumnValues = state.customColumnOrder;
    }

    uniqueColumnValues.forEach((columnValue, index) => {
      const th = document.createElement('th');
      // Optionally hide the 'All' header label for synthesized column axis
      th.textContent = columnFieldName === '__all__' ? '' : columnValue;
      th.colSpan = state.measures.length;
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';
      th.style.textAlign = 'center';
      th.dataset.fieldName = columnFieldName;
      th.dataset.fieldValue = columnValue;
      th.dataset.columnIndex = index;
      th.setAttribute('draggable', 'true');
      th.style.cursor = 'move';
      th.className = 'column-header';
      columnHeaderRow.appendChild(th);
    });
    thead.appendChild(columnHeaderRow);

    const measureHeaderRow = document.createElement('tr');

    // FIXED: Get current sort configuration from the engine
    const currentSortConfig =
      state.sortConfig && state.sortConfig.length > 0
        ? state.sortConfig[0]
        : null;

    const rowHeader = document.createElement('th');
    rowHeader.style.padding = '12px';
    rowHeader.style.backgroundColor = '#f8f9fa';
    rowHeader.style.borderBottom = '2px solid #dee2e6';
    rowHeader.style.borderRight = '1px solid #dee2e6';
    rowHeader.style.cursor = 'pointer';
    rowHeader.style.userSelect = 'none';

    const rowHeaderContent = document.createElement('div');
    rowHeaderContent.style.display = 'flex';
    rowHeaderContent.style.alignItems = 'center';
    rowHeaderContent.style.justifyContent = 'space-between';

    const rowText = document.createElement('span');
    rowText.textContent = getFieldDisplayName(rowFieldName);
    rowHeaderContent.appendChild(rowText);

    // FIXED: Use the proper sort icon function
    const rowSortIcon = createSortIcon(rowFieldName, currentSortConfig);
    rowHeaderContent.appendChild(rowSortIcon);
    rowHeader.appendChild(rowHeaderContent);

    // FIXED: Proper sort event handler with drag interference prevention
    rowHeader.addEventListener('click', e => {
      e.stopPropagation(); // Prevent drag event interference

      const stateNow = pivotEngine.getState();
      const current =
        stateNow.sortConfig && stateNow.sortConfig.length > 0
          ? stateNow.sortConfig[0]
          : null;
      const nextDir =
        current && current.field === rowFieldName && current.direction === 'asc'
          ? 'desc'
          : 'asc';

      // In processed mode, set custom alphabetical order for row values
      if (currentViewMode !== 'raw') {
        try {
          const filteredRawData = stateNow.rawData;
          const uniqueRowValues = [
            ...new Set(filteredRawData.map(item => item[rowFieldName])),
          ];
          const sortedRows = [...uniqueRowValues].sort((a, b) => {
            const result = String(a).localeCompare(String(b));
            return nextDir === 'asc' ? result : -result;
          });
          if (sortedRows.length > 0) {
            pivotEngine.setCustomFieldOrder(rowFieldName, sortedRows, true);
          }
        } catch (err) {
          console.error(
            'Failed to set custom row order for dimension sort:',
            err
          );
        }
      }

      pivotEngine.sort(rowFieldName, nextDir);
    });
    measureHeaderRow.appendChild(rowHeader);

    uniqueColumnValues.forEach(columnValue => {
      state.measures.forEach((measure, measureIndex) => {
        const th = document.createElement('th');
        th.style.padding = '12px';
        th.style.backgroundColor = '#f8f9fa';
        th.style.borderBottom = '2px solid #dee2e6';
        th.style.borderRight = '1px solid #dee2e6';
        th.style.cursor = 'pointer';
        th.style.userSelect = 'none';

        const headerContent = document.createElement('div');
        headerContent.style.display = 'flex';
        headerContent.style.alignItems = 'center';
        headerContent.style.justifyContent = 'space-between';

        const measureText = document.createElement('span');
        measureText.textContent = measure.caption;
        headerContent.appendChild(measureText);

        // FIXED: Use the proper sort icon function
        const sortIcon = createSortIcon(measure.uniqueName, currentSortConfig);
        headerContent.appendChild(sortIcon);
        th.appendChild(headerContent);

        th.dataset.columnValue = String(columnValue);
        th.dataset.measureIndex = String(measureIndex);

        // FIXED: Proper sort event handler for measures
        th.addEventListener('click', e => {
          const stateNow = pivotEngine.getState();
          const current =
            stateNow.sortConfig && stateNow.sortConfig.length > 0
              ? stateNow.sortConfig[0]
              : null;
          const nextDir =
            current &&
            current.field === measure.uniqueName &&
            current.direction === 'asc'
              ? 'desc'
              : 'asc';

          // console.log('Applying sort direction:', direction);
          if (currentViewMode !== 'raw') {
            try {
              // Determine aggregation key for the selected measure
              const measureCfg = stateNow.measures.find(
                m => m.uniqueName === measure.uniqueName
              );
              const aggregation =
                (measureCfg && measureCfg.aggregation) || 'sum';
              const aggKey = `${aggregation}_${measure.uniqueName}`;

              const groups = pivotEngine.getGroupedData();

              // Build full set of row values across groups (ensures rows with 0 are included)
              const allRowSet = new Set();
              groups.forEach(g => {
                const keys = g.key ? g.key.split('|') : [];
                if (keys[0]) allRowSet.add(keys[0]);
              });
              const allRowValues = Array.from(allRowSet);

              // Compute values for the selected column
              const pairs = allRowValues.map(rv => {
                const grp = groups.find(gr => {
                  const keys = gr.key ? gr.key.split('|') : [];
                  return keys[0] === rv && keys[1] === columnValue;
                });
                const aggregates = (grp && grp.aggregates) || {};
                const val = Number(aggregates[aggKey] ?? 0);
                return { row: rv, val: isFinite(val) ? val : 0 };
              });

              // Sort rows by the computed values in the chosen direction
              pairs.sort((a, b) =>
                nextDir === 'asc' ? a.val - b.val : b.val - a.val
              );
              const orderedRows = pairs.map(p => p.row);

              const rowFieldNameNow = pivotEngine.getRowFieldName();
              if (rowFieldNameNow && orderedRows.length > 0) {
                pivotEngine.setCustomFieldOrder(
                  rowFieldNameNow,
                  orderedRows,
                  true
                );
              }
            } catch (err) {
              console.error(
                'Failed to compute/set custom row order for processed sort:',
                err
              );
            }
          }

          // Always call engine.sort to update sort state (icons) and internal groups
          pivotEngine.sort(measure.uniqueName, nextDir);
        });
        measureHeaderRow.appendChild(th);
      });
    });
    thead.appendChild(measureHeaderRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const allUniqueRowValues = getOrderedRowValues();

    // Check if no data matches the current filters
    if (!allUniqueRowValues || allUniqueRowValues.length === 0) {
      console.log('No data matches the current filters');
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        tableContainer.innerHTML =
          '<div style="padding: 20px; text-align: center; color: #666;">No data matches the current filters. Try adjusting your filter criteria.</div>';
      }
      return;
    }

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
      // Make the cell itself draggable for better browser compatibility
      rowCell.setAttribute('draggable', 'true');
      // Store dataset on the draggable element as well
      rowCell.dataset.fieldName = rowFieldName;
      rowCell.dataset.fieldValue = rowValue;
      tr.appendChild(rowCell);

      uniqueColumnValues.forEach(columnValue => {
        state.measures.forEach(measure => {
          const td = document.createElement('td');
          td.style.padding = '8px';
          td.style.borderBottom = '1px solid #dee2e6';
          td.style.borderRight = '1px solid #dee2e6';

          // Use engine's calculateCellValue method
          const value = pivotEngine.calculateCellValue(
            rowValue,
            columnValue,
            measure,
            rowFieldName,
            columnFieldName
          );

          // Use engine's formatValue method
          const formattedValue = pivotEngine.formatValue(
            value,
            measure.uniqueName
          );

          // Apply text alignment from engine
          td.style.textAlign = pivotEngine.getFieldAlignment(
            measure.uniqueName
          );

          // Set the formatted value
          td.textContent = formattedValue;

          // Add drilldown functionality
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
  let draggedColumnIndex = null;

  if (!pivotEngine) {
    console.error('PivotEngine not initialized for column drag and drop');
    return;
  }

  console.log('Setting up column drag and drop for field:', columnFieldName);

  columnHeaders.forEach(header => {
    const fieldValue = header.dataset.fieldValue;
    const columnIndex = parseInt(header.dataset.columnIndex);

    console.log(
      'Setting up drag for column:',
      fieldValue,
      'at index:',
      columnIndex
    );

    header.addEventListener('dragstart', e => {
      draggedColumnValue = fieldValue;
      draggedColumnIndex = columnIndex;
      e.dataTransfer.setData('text/plain', fieldValue);
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => header.classList.add('dragging'), 0);
      console.log(
        'Drag started for column:',
        fieldValue,
        'index:',
        columnIndex
      );
    });

    header.addEventListener('dragend', e => {
      header.classList.remove('dragging');
      console.log('Drag ended for column:', fieldValue);
      draggedColumnValue = null;
      draggedColumnIndex = null;
    });

    header.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    header.addEventListener('dragenter', e => {
      e.preventDefault();
      if (draggedColumnValue && draggedColumnValue !== fieldValue) {
        header.classList.add('drag-over');
      }
    });

    header.addEventListener('dragleave', e => {
      header.classList.remove('drag-over');
    });

    header.addEventListener('drop', e => {
      e.preventDefault();
      header.classList.remove('drag-over');

      const targetColumnValue = fieldValue;
      const targetColumnIndex = columnIndex;

      console.log('Drop event:', {
        draggedValue: draggedColumnValue,
        draggedIndex: draggedColumnIndex,
        targetValue: targetColumnValue,
        targetIndex: targetColumnIndex,
      });

      if (
        draggedColumnValue &&
        draggedColumnIndex !== null &&
        draggedColumnValue !== targetColumnValue &&
        draggedColumnIndex !== targetColumnIndex
      ) {
        console.log(
          'Executing column swap:',
          draggedColumnIndex,
          '->',
          targetColumnIndex
        );

        try {
          // Use the PivotEngine's swapDataColumns method
          const result = pivotEngine.swapDataColumns(
            draggedColumnIndex,
            targetColumnIndex
          );
          console.log('Column swap result:', result);

          // Force a re-render after the swap
          setTimeout(() => {
            console.log('Re-rendering after column swap');
            renderTable();
          }, 50);
        } catch (error) {
          console.error('Error during column swap:', error);
          // Fallback: manual re-render
          renderTable();
        }
      }
    });
  });

  console.log(
    'Column drag and drop setup completed for',
    columnHeaders.length,
    'headers'
  );
}

function createColumnHeaders(
  uniqueColumnValues,
  columnFieldName,
  state,
  columnHeaderRow
) {
  console.log('Creating column headers for values:', uniqueColumnValues);

  uniqueColumnValues.forEach((columnValue, index) => {
    const th = document.createElement('th');
    th.textContent = columnValue;
    th.colSpan = state.measures.length;
    th.style.padding = '12px';
    th.style.backgroundColor = '#f8f9fa';
    th.style.borderBottom = '2px solid #dee2e6';
    th.style.borderRight = '1px solid #dee2e6';
    th.style.textAlign = 'center';
    th.style.position = 'relative';
    th.style.userSelect = 'none';

    // Important: Set data attributes for drag and drop
    th.dataset.fieldName = columnFieldName;
    th.dataset.fieldValue = columnValue;
    th.dataset.columnIndex = index.toString();

    // Enable dragging
    th.setAttribute('draggable', 'true');
    th.style.cursor = 'move';
    th.className = 'column-header';

    // Add visual feedback for draggable state
    th.addEventListener('mouseenter', () => {
      th.style.backgroundColor = '#e3f2fd';
    });

    th.addEventListener('mouseleave', () => {
      th.style.backgroundColor = '#f8f9fa';
    });

    columnHeaderRow.appendChild(th);
    console.log('Created header for:', columnValue, 'at index:', index);
  });
}

function addEnhancedDragStyles() {
  const existingStyle = document.querySelector('#enhanced-drag-styles');
  if (existingStyle) return;

  const styleEl = document.createElement('style');
  styleEl.id = 'enhanced-drag-styles';
  styleEl.innerHTML = `
    .column-header[draggable="true"] {
      transition: all 0.2s ease;
    }
    
    .column-header[draggable="true"]:hover {
      background-color: #e3f2fd !important;
      border: 2px solid #2196f3 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .column-header.dragging {
      opacity: 0.6;
      background-color: #ffecb3 !important;
      border: 2px solid #ff9800 !important;
      transform: rotate(3deg);
    }
    
    .column-header.drag-over {
      border: 3px dashed #4caf50 !important;
      background-color: #e8f5e8 !important;
      animation: pulse 0.5s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    /* Drag cursor feedback */
    .column-header[draggable="true"]:active {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(styleEl);
}

function setupRowDragAndDrop(rowFieldName) {
  try {
    console.log('🎯 Setting up row drag and drop for field:', rowFieldName);

    // Prefer attaching drag to the first cell for broader browser support with table rows
    const rowCells = document.querySelectorAll(
      'tbody td.row-cell[draggable="true"]'
    );

    console.log('📍 Found', rowCells.length, 'draggable row cells');

    let draggedRowValue = null;

    if (!pivotEngine) {
      console.error('❌ PivotEngine not available for row drag setup');
      return;
    }

    const uniqueRowValues = pivotEngine.getOrderedUniqueFieldValues(
      rowFieldName,
      true
    );

    console.log('📊 Unique row values for drag:', uniqueRowValues?.length || 0);

    if (!uniqueRowValues || uniqueRowValues.length === 0) {
      console.warn('⚠️ No unique row values available for drag and drop');
      return;
    }

    rowCells.forEach(cell => {
      const fieldValue = cell.dataset.fieldValue;
      const row = cell.parentElement;

      cell.addEventListener('dragstart', e => {
        draggedRowValue = fieldValue;
        try {
          e.dataTransfer.setData('text/plain', fieldValue);
        } catch {}
        setTimeout(() => row && row.classList.add('dragging'), 0);
      });

      cell.addEventListener('dragend', () => {
        if (row) row.classList.remove('dragging');
        draggedRowValue = null;
      });

      cell.addEventListener('dragover', e => e.preventDefault());
      cell.addEventListener('dragenter', e => {
        e.preventDefault();
        if (draggedRowValue && draggedRowValue !== fieldValue && row) {
          row.classList.add('drag-over');
        }
      });
      cell.addEventListener(
        'dragleave',
        () => row && row.classList.remove('drag-over')
      );
      cell.addEventListener('drop', e => {
        e.preventDefault();
        if (row) row.classList.remove('drag-over');

        const targetRowValue = fieldValue;
        const fromIndex = uniqueRowValues.indexOf(draggedRowValue);
        const toIndex = uniqueRowValues.indexOf(targetRowValue);

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          try {
            console.log('🔄 Attempting to swap rows in processed mode:', {
              draggedValue: draggedRowValue,
              targetValue: fieldValue,
              fromIndex,
              toIndex,
            });
            pivotEngine.swapDataRows(fromIndex, toIndex);
            console.log('✓ Row swap completed, re-rendering table');
            // Force re-render to reflect new order
            setTimeout(renderTable, 0);
          } catch (error) {
            console.error('❌ Error during row swap in processed mode:', error);
            alert(
              'Error reordering data. Please refresh the page and try again.\n\nError: ' +
                error.message
            );
          }
        }
      });
    }); // <-- FIX: This is the correctly placed closing brace for rowCells.forEach

    console.log('✓ Row drag and drop setup completed');
  } catch (error) {
    console.error('❌ Error setting up row drag and drop:', error);
  }
} // <-- This is the correctly placed closing brace for function setupRowDragAndDrop

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
    const rowFields = (newConfig.rows || []).map(r => r.uniqueName);
    const columnFields = (newConfig.columns || []).map(c => c.uniqueName);
    const defaultGroupConfig =
      newConfig.groupConfig ||
      (rowFields.length && columnFields.length
        ? {
            rowFields,
            columnFields,
            grouper: (item, fields) => fields.map(f => item[f]).join('|'),
          }
        : null);

    // Re-initialize engine with new config but same data
    pivotEngine = new PivotEngine({
      ...newConfig,
      groupConfig: defaultGroupConfig || undefined,
      data: pivotEngine.getState().rawData,
    });
    pivotEngine.setPagination({
      currentPage: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
      totalPages: 1,
    });
    pivotEngine.setDataHandlingMode(
      currentViewMode === 'processed' ? 'processed' : 'raw'
    );

    pivotEngine.subscribe(state => {
      currentData = state.rawData; // Keep track of current data from engine
      renderTable();
    });
    renderTable(); // Initial render with new format
  } catch (error) {
    console.error('Error formatting table:', error);
  }
}

// FIXED: Event Listeners with proper sorting integration
function setupEventListeners() {
  const switchButton = document.getElementById('switchView');
  if (switchButton) {
    switchButton.addEventListener('click', () => {
      // Show loading indicator for smooth transition
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'view-loading-indicator';
        loadingIndicator.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 30px 50px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        `;
        loadingIndicator.innerHTML = `
          <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #2196f3; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <div style="font-size: 16px; font-weight: 600; color: #333;">
            Switching to ${currentViewMode === 'processed' ? 'Raw' : 'Processed'} Data...
          </div>
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);

        document.body.appendChild(loadingIndicator);

        // Use setTimeout to allow the loading indicator to render
        setTimeout(() => {
          currentViewMode =
            currentViewMode === 'processed' ? 'raw' : 'processed';
          switchButton.textContent =
            currentViewMode === 'processed'
              ? 'Switch to Raw Data'
              : 'Switch to Processed Data';
          paginationState.currentPage = 1;

          if (pivotEngine) {
            try {
              console.log('🔄 Switching to mode:', currentViewMode);

              // CRITICAL FIX: Sync currentData with pivot engine state BEFORE mode switch
              const stateBeforeSwitch = pivotEngine.getState();
              if (
                stateBeforeSwitch.rawData &&
                stateBeforeSwitch.rawData.length > 0
              ) {
                currentData = stateBeforeSwitch.rawData;
                console.log(
                  '✓ Pre-switch sync: currentData updated with',
                  currentData.length,
                  'rows'
                );
              }

              // Now switch the mode
              pivotEngine.setDataHandlingMode(
                currentViewMode === 'processed' ? 'processed' : 'raw'
              );
              console.log('✓ Mode switched successfully');

              // Verify state after switch
              const stateAfterSwitch = pivotEngine.getState();
              console.log('📊 State after mode switch:', {
                mode: stateAfterSwitch.dataHandlingMode,
                hasProcessedData: !!stateAfterSwitch.processedData,
                hasRawData: !!stateAfterSwitch.rawData,
                rawDataLength: stateAfterSwitch.rawData?.length || 0,
              });
            } catch (error) {
              console.error('❌ Error during mode switch:', error);
              alert(
                'Error switching view mode. Please refresh the page and try again.\n\nError: ' +
                  error.message
              );

              // Try to revert to previous mode
              currentViewMode =
                currentViewMode === 'processed' ? 'raw' : 'processed';
              switchButton.textContent =
                currentViewMode === 'processed'
                  ? 'Switch to Raw Data'
                  : 'Switch to Processed Data';
              return;
            }
          }

          // Also update pagination info label immediately for better UX
          updatePaginationInfo(
            currentViewMode === 'processed' ? 'Processed Data' : 'Raw Data'
          );

          // Wrap renderTable in try-catch to handle rendering errors
          try {
            renderTable();
          } catch (renderError) {
            console.error(
              '❌ Error rendering table after mode switch:',
              renderError
            );
            const tableContainer = document.getElementById('myTable');
            if (tableContainer) {
              tableContainer.innerHTML = `<div style="padding: 20px; color: red;">Error rendering table: ${renderError.message}<br><br>Please refresh the page and try again.</div>`;
            }
          }

          // Remove loading indicator after a short delay
          setTimeout(() => {
            const indicator = document.getElementById('view-loading-indicator');
            if (indicator) {
              indicator.remove();
            }
          }, 300);
        }, 50);
      }
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

  const nextPageButton = document.getElementById('nextPage');
  if (nextPageButton) {
    nextPageButton.addEventListener('click', () => {
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

      // Infer type dynamically from current data for robust filtering after import
      let parsedValue = value;
      try {
        const stateNow = pivotEngine.getState();
        const dataNow = stateNow?.rawData || [];
        const sampleVal = (dataNow.find(
          r => r[field] !== null && r[field] !== undefined
        ) || {})[field];
        const isNumberField =
          typeof sampleVal === 'number' && isFinite(sampleVal);
        if (
          isNumberField &&
          (operator === 'equals' ||
            operator === 'greaterThan' ||
            operator === 'lessThan')
        ) {
          const numValue = parseFloat(String(value).trim());
          if (isNaN(numValue)) {
            alert('Please enter a valid number for ' + field);
            return;
          }
          parsedValue = numValue;
        }
      } catch (e) {
        // If inference fails, fall back to string-based filtering
        parsedValue = value;
      }

      const filter = { field, operator, value: parsedValue };

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

// FIXED: Enhanced draggable styles with better sort indicators
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
        
        /* Enhanced sort icon styles */
        th span[title*="sort"], th span[title*="Sort"] {
            transition: all 0.2s ease;
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        th span[title*="sort"]:hover, th span[title*="Sort"]:hover {
            background-color: rgba(0, 123, 255, 0.1);
            transform: scale(1.1);
        }
        
        th[style*="cursor: pointer"]:hover {
            background-color: #e9ecef !important;
        }
        
        /* Visual feedback for sortable headers */
        th[style*="cursor: pointer"] {
            position: relative;
            transition: background-color 0.2s ease;
        }
        
        th[style*="cursor: pointer"]::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background-color: #007bff;
            transition: width 0.3s ease;
            transform: translateX(-50%);
        }
        
        th[style*="cursor: pointer"]:hover::after {
            width: 80%;
        }
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
  title.textContent = `Details: ${getFieldDisplayName(rowFieldName)} = ${rowValue}, ${getFieldDisplayName(columnFieldName)} = ${columnValue}`;
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
      alert(
        `No detailed data found for ${rowFieldName}: ${rowValue}, ${columnFieldName}: ${columnValue}`
      );
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
  try {
    console.log('🎯 Starting drag and drop setup...');

    if (!pivotEngine) {
      console.error(
        '❌ Cannot setup drag and drop: pivotEngine not initialized'
      );
      return;
    }

    const rowFieldName = pivotEngine.getRowFieldName();
    const columnFieldName = pivotEngine.getColumnFieldName();

    console.log('📋 Field names:', {
      rowFieldName,
      columnFieldName,
    });

    if (rowFieldName) {
      setupRowDragAndDrop(rowFieldName);
    } else {
      console.warn('⚠️ No row field name available, skipping row drag setup');
    }

    if (columnFieldName && columnFieldName !== '__all__') {
      setupColumnDragAndDropFixed(columnFieldName);
    } else {
      console.log(
        'ℹ️ Skipping column drag setup (no column field or synthetic __all__ column)'
      );
    }

    console.log('✓ Drag and drop setup completed');
  } catch (error) {
    console.error('❌ Error in setupDragAndDrop:', error);
  }
}

// Add this new function to handle file connections
export async function handleFileConnection(fileType) {
  try {
    let result;

    // Show loading indicator
    showLoadingIndicator('Connecting to file...');

    switch (fileType) {
      case 'CSV':
        result = await ConnectService.connectToLocalCSV(pivotEngine, {
          dimensions: [],
          csv: {
            delimiter: ',',
            hasHeader: true,
            skipEmptyLines: true,
            trimValues: true,
            dynamicTyping: false,
          },
          maxFileSize: 1024 * 1024 * 1024, // 1GB (1024MB) - supports large files up to 800MB+
          onProgress: progress => {
            updateLoadingProgress(progress);
          },
        });
        break;

      case 'JSON':
        result = await ConnectService.connectToLocalJSON(pivotEngine, {
          json: {
            arrayPath: null, // Will auto-detect
            validateSchema: true,
          },
          maxFileSize: 1024 * 1024 * 1024, // 1GB (1024MB) - supports large files up to 800MB+
          onProgress: progress => {
            updateLoadingProgress(progress);
          },
        });
        break;

      default:
        result = await ConnectService.connectToLocalFile(pivotEngine, {
          maxFileSize: 1024 * 1024 * 1024, // 1GB (1024MB) - supports large files up to 800MB+
          onProgress: progress => {
            updateLoadingProgress(progress);
          },
        });
    }

    // Hide loading indicator
    hideLoadingIndicator();

    if (result.success) {
      // Store performance mode for debugging
      window.lastPerformanceMode = result.performanceMode || 'unknown';

      // Log performance information
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 FILE PROCESSING SUMMARY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(
        `🔧 Processing Mode: ${(result.performanceMode || 'standard').toUpperCase()}`
      );
      console.log(
        `📁 File Size: ${(result.fileSize / 1024 / 1024).toFixed(2)} MB`
      );
      console.log(
        `📊 Records: ${result.recordCount?.toLocaleString() || 'N/A'}`
      );
      if (result.parseTime) {
        console.log(`⏱️  Parse Time: ${(result.parseTime / 1000).toFixed(2)}s`);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Update current data reference
      currentData = result.data;

      // Reset pagination and filters
      paginationState.currentPage = 1;
      resetFilters();

      // Update the config with new data structure
      // DISABLED: connectService.ts already does smart field selection with cardinality limits
      // if (result.columns && result.columns.length > 0) {
      //    updateConfigFromImportedData(result);
      // }

      // Rebuild filter UI to reflect newly imported fields
      initializeFilters();

      // Show success notification
      showImportNotification(result, true);

      // Re-render the table
      renderTable();

      console.log(
        'File connection successful:',
        ConnectService.createImportSummary(result)
      );
    } else {
      console.error('File connection failed:', result.error);
      showImportNotification(result, false);
    }
  } catch (error) {
    hideLoadingIndicator();
    console.error('Error during file connection:', error);
    showImportNotification(
      {
        success: false,
        error: error.message || 'Unknown error occurred',
      },
      false
    );
  }
}

// Helper function to update config based on imported data
function updateConfigFromImportedData(result) {
  if (!result.columns || result.columns.length === 0) return;

  // Try to intelligently map columns to pivot fields
  const columns = result.columns;
  const sampleData = result.data.slice(0, 5); // Look at first 5 rows

  // Detect potential measure fields (numeric data)
  const measureFields = columns.filter(col => {
    const sampleValues = sampleData
      .map(row => row[col])
      .filter(val => val != null);
    return (
      sampleValues.length > 0 &&
      sampleValues.every(val => typeof val === 'number' && !isNaN(val))
    );
  });

  // Detect potential dimension fields (text/categorical data only)
  // IMPORTANT: Exclude measure fields to avoid using numeric columns as dimensions
  const measureSet = new Set(measureFields);
  const dimensionFields = columns.filter(col => {
    if (measureSet.has(col)) return false; // never treat numeric as a dimension
    const sampleValues = sampleData
      .map(row => row[col])
      .filter(val => val != null);
    const uniqueValues = [...new Set(sampleValues)];
    // Consider it a dimension if it has text values OR has limited unique values
    return (
      sampleValues.some(val => typeof val === 'string') ||
      uniqueValues.length <= Math.max(10, sampleData.length * 0.5)
    );
  });

  // Respect engine's synthesized single column axis when appropriate
  const engineHasAllColumn =
    pivotEngine &&
    pivotEngine.getColumnFieldName &&
    pivotEngine.getColumnFieldName() === '__all__';

  // Auto-configure pivot table if we have good candidates
  if (dimensionFields.length >= 1 && measureFields.length >= 1) {
    const newConfig = {
      ...config,
      rows: dimensionFields.slice(0, 1).map(field => ({
        uniqueName: field,
        caption: field,
      })),
      // If we only found a single dimension or engine already decided on '__all__',
      // keep a single synthesized column axis
      columns:
        engineHasAllColumn || dimensionFields.length < 2
          ? [{ uniqueName: '__all__', caption: 'All' }]
          : dimensionFields.slice(1, 2).map(field => ({
              uniqueName: field,
              caption: field,
            })),
      measures: measureFields.slice(0, 3).map(field => ({
        uniqueName: field,
        caption: field,
        aggregation: 'sum',
      })),
    };

    // Apply the new configuration
    formatTable(newConfig);

    console.log('Auto-configured pivot table:', {
      rows: newConfig.rows,
      columns: newConfig.columns,
      measures: newConfig.measures,
    });
  }
}

// Loading indicator functions
function showLoadingIndicator(message = 'Loading...') {
  let loader = document.getElementById('file-loader');

  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'file-loader';
    loader.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      text-align: center;
      min-width: 350px;
      max-width: 500px;
    `;

    loader.innerHTML = `
      <div id="loading-message" style="margin-bottom: 20px; font-size: 16px; font-weight: bold;">
        ${message}
      </div>
      <div style="background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
        <div id="progress-bar" style="background: #4CAF50; height: 100%; width: 0%; transition: width 0.3s;"></div>
      </div>
      <div id="progress-text" style="margin-top: 10px; font-size: 14px; color: #666;">
        0%
      </div>
      <div id="progress-status" style="margin-top: 10px; font-size: 12px; color: #999; min-height: 18px;">
      </div>
    `;

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'loader-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(loader);
  }
}

function updateLoadingProgress(progress) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const progressStatus = document.getElementById('progress-status');

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
  if (progressText) {
    progressText.textContent = `${Math.round(progress)}%`;
  }
  if (progressStatus) {
    // Update status message based on progress
    if (progress < 70) {
      progressStatus.textContent = 'Reading and parsing file...';
    } else if (progress < 90) {
      progressStatus.textContent = 'Processing data...';
    } else if (progress < 95) {
      progressStatus.textContent = 'Building pivot layout...';
    } else {
      progressStatus.textContent = 'Finalizing...';
    }
  }
}

function hideLoadingIndicator() {
  const loader = document.getElementById('file-loader');
  const backdrop = document.getElementById('loader-backdrop');

  if (loader) loader.remove();
  if (backdrop) backdrop.remove();
}

// Enhanced notification system
function showImportNotification(result, isSuccess) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10001;
    font-family: Arial, sans-serif;
    ${
      isSuccess
        ? 'background: #d4edda; border-left: 4px solid #28a745; color: #155724;'
        : 'background: #f8d7da; border-left: 4px solid #dc3545; color: #721c24;'
    }
  `;

  const title = document.createElement('div');
  title.style.cssText =
    'font-weight: bold; margin-bottom: 10px; font-size: 16px;';
  title.textContent = isSuccess ? '✅ Import Successful' : '❌ Import Failed';

  const content = document.createElement('div');
  content.style.cssText = 'font-size: 14px; line-height: 1.4;';

  if (isSuccess) {
    content.innerHTML = `
      <div><strong>File:</strong> ${result.fileName}</div>
      <div><strong>Records:</strong> ${result.recordCount?.toLocaleString()}</div>
      <div><strong>Size:</strong> ${formatFileSize(result.fileSize)}</div>
      ${result.columns ? `<div><strong>Columns:</strong> ${result.columns.length}</div>` : ''}
      ${
        result.validationErrors?.length
          ? `<div style="margin-top: 10px; color: #856404;"><strong>Warnings:</strong><br>${result.validationErrors.map(w => `• ${w}`).join('<br>')}</div>`
          : ''
      }
    `;
  } else {
    content.textContent = result.error || 'Unknown error occurred';
  }

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    opacity: 0.7;
  `;

  closeBtn.addEventListener('click', () => notification.remove());

  notification.appendChild(title);
  notification.appendChild(content);
  notification.appendChild(closeBtn);
  document.body.appendChild(notification);

  // Auto-remove after 8 seconds for success, 12 seconds for error
  setTimeout(
    () => {
      if (notification.parentNode) {
        notification.remove();
      }
    },
    isSuccess ? 8000 : 12000
  );
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function onSectionItemDrop(droppedFields) {
  // droppedFields.rows: Set<string>
  // droppedFields.columns: Set<string>
  // droppedFields.values: Map<string, AggregationType>
  const selection = {
    rows: Array.from(droppedFields.rows || []),
    columns: Array.from(droppedFields.columns || []),
    values: Array.from(droppedFields.values || new Map()).map(
      ([field, aggregation]) => ({ field, aggregation })
    ),
  };

  const layout = FieldService.buildLayout(selection);

  if (pivotEngine) {
    const newConfig = {
      ...config,
      rows: layout.rows,
      columns: layout.columns,
      measures: layout.measures,
    };
    formatTable(newConfig);
  }
}

// FIXED: Initialize everything when the DOM is loaded
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

    const rowFields = (config.rows || []).map(r => r.uniqueName);
    const columnFields = (config.columns || []).map(c => c.uniqueName);
    const defaultGroupConfig =
      config.groupConfig ||
      (rowFields.length && columnFields.length
        ? {
            rowFields,
            columnFields,
            // Join row + column values with '|', same as web-component
            grouper: (item, fields) => fields.map(f => item[f]).join('|'),
          }
        : null);

    // Create a single PivotEngine instance
    pivotEngine = new PivotEngine({
      ...config,
      groupConfig: defaultGroupConfig || undefined,

      data: sampleData, // Initialize with the full dataset
    });

    pivotEngine.setPagination({
      currentPage: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
      totalPages: 1,
    });
    // Ensure processed mode on load
    pivotEngine.setDataHandlingMode('processed');

    // FIXED: Subscribe to state changes to re-render the UI automatically with proper sorting
    pivotEngine.subscribe(state => {
      console.log('PivotEngine state changed:', {
        sortConfig: state.sortConfig,
        dataHandlingMode: state.dataHandlingMode,
        processedDataLength: state.processedData?.rows?.length || 0,
      });

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

    addEnhancedDragStyles();

    // Initial render
    renderTable();

    console.log(
      'Initialization completed successfully with sorting functionality'
    );
  } catch (error) {
    console.error('Error during initialization:', error);
    const tableContainer = document.getElementById('myTable');
    if (tableContainer) {
      tableContainer.innerHTML = `<div style="color: red; padding: 20px;">Error during initialization: ${error.message}</div>`;
    }
  }
});

window.debugPivotState = () => {
  if (!pivotEngine) {
    console.warn('pivotEngine not initialized');
    return;
  }
  const state = pivotEngine.getState();
  console.log('Sort config:', state.sortConfig);
  console.log('Groups count:', (state.groups || []).length);
  console.log('Data handling mode:', state.dataHandlingMode);
};
