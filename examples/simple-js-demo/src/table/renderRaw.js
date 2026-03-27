'use strict';
import { appState } from '../../state.js';
import { logger } from '../../logger.js';
import { VirtualScroller } from '../services/VirtualScroller.js';
import { getPaginatedData, updateRawDataPagination } from '../ui/pagination.js';
import { setupRawDataDragAndDrop } from './dragAndDrop.js';
import { updatePaginationInfo } from '../ui/pagination.js';

// Helper to capitalise a field name for display
function getFieldDisplayName(fieldName) {
  return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// FIXED: Helper function to create sort icons with proper state tracking
export function createSortIcon(field, currentSortConfig) {
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
      sortIcon.innerHTML = '▲';
      sortIcon.title = `Sorted by ${field} ascending - click to sort descending`;
      sortIcon.style.color = '#007bff';
    } else {
      sortIcon.innerHTML = '▼';
      sortIcon.title = `Sorted by ${field} descending - click to sort ascending`;
      sortIcon.style.color = '#007bff';
    }
  } else {
    sortIcon.innerHTML = '↕';
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

// ── Shared cell builders (used by both virtual-scroll and traditional paths) ──

/**
 * Build a raw-data header <th> element.
 * @param {string} headerText
 * @param {number} index
 * @param {{ column: string|null, direction: string|null }} currentSort
 * @param {object[]} rawDataToUse  — reference for sort click handler
 * @returns {HTMLTableCellElement}
 */
function buildRawHeaderCell(headerText, index, currentSort, rawDataToUse) {
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

  return th;
}

/**
 * Build a raw-data body <td> element.
 * @param {*} cellValue
 * @param {string} header  — column key
 * @returns {HTMLTableCellElement}
 */
function buildRawDataCell(cellValue, header) {
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
    } else if (cellValue % 1 !== 0) {
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

  return td;
}

// ─────────────────────────────────────────────────────────────────────────────

export function sortRawDataByColumn(columnName, rawData) {
  logger.info(`Sorting raw data by column: ${columnName}`);

  // Get current sort state
  const currentSort = appState.rawDataSort || {};
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
  appState.rawDataSort = { column: columnName, direction };

  // Update the global data array to maintain sort
  appState.currentData = [...rawData];

  logger.info(`Sorted raw data by ${columnName} (${direction})`);
  renderRawDataTable();
}

export function swapRawDataRows(fromIndex, toIndex, rawData) {
  logger.info('Swapping raw data rows:', fromIndex, '->', toIndex);

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= rawData.length ||
    toIndex >= rawData.length
  ) {
    logger.error('Invalid row indices for raw data swap');
    return;
  }

  // Swap the rows in the raw data array
  const temp = rawData[fromIndex];
  rawData[fromIndex] = rawData[toIndex];
  rawData[toIndex] = temp;

  appState.currentData = [...rawData];

  // CRITICAL FIX: Update the pivot engine's data source with the reordered data
  if (appState.pivotEngine) {
    try {
      appState.pivotEngine.updateDataSource(rawData);
      logger.info('Pivot engine data source updated with reordered data');
    } catch (error) {
      logger.error('Error updating pivot engine data source:', error);
    }
  }

  logger.info('Raw data rows swapped successfully');
}

export function swapRawDataColumns(fromIndex, toIndex) {
  logger.info('Swapping raw data columns:', fromIndex, '->', toIndex);

  if (appState.currentData.length === 0) {
    logger.error('No raw data available for column swap');
    return;
  }

  // Get current column order
  const headers = Object.keys(appState.currentData[0]);

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= headers.length ||
    toIndex >= headers.length
  ) {
    logger.error(
      'Invalid column indices for raw data swap:',
      fromIndex,
      toIndex,
      'Available columns:',
      headers.length
    );
    return;
  }

  // Initialize or update the column order
  if (!appState.rawDataColumnOrder) {
    appState.rawDataColumnOrder = [...headers];
  }

  // Swap in the column order array
  const temp = appState.rawDataColumnOrder[fromIndex];
  appState.rawDataColumnOrder[fromIndex] = appState.rawDataColumnOrder[toIndex];
  appState.rawDataColumnOrder[toIndex] = temp;

  logger.info('Raw data column order updated:', appState.rawDataColumnOrder);

  // Re-render the table to show the new column order
  renderRawDataTable();
}

// UPDATED: Raw data table rendering with virtual scrolling for large datasets
export function renderRawDataTable() {
  try {
    const startTime = performance.now();
    logger.info('Starting raw data table render...');

    // Log performance mode if available
    if (appState.lastPerformanceMode) {
      logger.info(
        `Data was processed using: ${appState.lastPerformanceMode.toUpperCase()}`
      );
    }

    // CRITICAL FIX: Get raw data from pivot engine state
    let rawDataToUse = null;

    if (appState.pivotEngine) {
      const state = appState.pivotEngine.getState();
      rawDataToUse = state.rawData || state.data;

      logger.info('Raw data source check:', {
        hasRawData: !!state.rawData,
        hasData: !!state.data,
        rawDataLength: state.rawData?.length || 0,
        dataLength: state.data?.length || 0,
      });
    }

    // Fallback to currentData if engine state is empty
    if (!rawDataToUse || rawDataToUse.length === 0) {
      logger.warn('No raw data in engine state, using currentData fallback');
      rawDataToUse = appState.currentData;
    }

    if (!rawDataToUse || rawDataToUse.length === 0) {
      logger.error('No raw data available from any source');
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        tableContainer.innerHTML =
          '<div style="padding: 20px;">No data available to display. Please upload a file.</div>';
      }
      return;
    }

    logger.info(
      `Rendering raw data table with ${rawDataToUse.length.toLocaleString()} total items`
    );

    const tableContainer = document.getElementById('myTable');
    if (!tableContainer) {
      logger.error('Table container not found');
      return;
    }

    // Get headers - use custom order if available
    let headers;
    if (appState.rawDataColumnOrder && appState.rawDataColumnOrder.length > 0) {
      headers = appState.rawDataColumnOrder;
    } else {
      headers = rawDataToUse.length > 0 ? Object.keys(rawDataToUse[0]) : [];
    }

    // Use virtual scrolling for large datasets (> 1000 rows)
    const VIRTUAL_SCROLL_THRESHOLD = 1000;
    const useVirtualScrolling = rawDataToUse.length > VIRTUAL_SCROLL_THRESHOLD;

    if (useVirtualScrolling) {
      logger.info('Using virtual scrolling for optimal performance');

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
        <strong>Virtual Scrolling Enabled</strong>
        <span>Smoothly handling ${rawDataToUse.length.toLocaleString()} rows with drag & drop support!</span>
      `;

      tableContainer.innerHTML = '';
      tableContainer.appendChild(infoMessage);

      // Destroy existing virtual scroller if any
      if (appState.virtualScroller) {
        appState.virtualScroller.destroy();
      }

      // Create virtual scroller container
      const scrollerContainer = document.createElement('div');
      scrollerContainer.id = 'virtual-scroller-container';
      tableContainer.appendChild(scrollerContainer);

      // Get current sort state
      const currentSort = appState.rawDataSort || {};

      // Header renderer (virtual-scroll path)
      const renderHeader = headersList => {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headersList.forEach((headerText, index) => {
          headerRow.appendChild(
            buildRawHeaderCell(headerText, index, currentSort, rawDataToUse)
          );
        });
        thead.appendChild(headerRow);
        return thead;
      };

      // Row renderer (virtual-scroll path)
      const renderRow = (rowData, rowIndex, headersList) => {
        const tr = document.createElement('tr');
        tr.dataset.rowIndex = rowIndex;
        tr.dataset.globalIndex = rowIndex;
        tr.className = 'raw-data-row';
        tr.style.height = '40px';

        headersList.forEach(header => {
          tr.appendChild(buildRawDataCell(rowData[header], header));
        });

        return tr;
      };

      // Drag and drop handler
      const handleDragDrop = (fromIndex, toIndex) => {
        logger.info(`Swapping rows: ${fromIndex} <-> ${toIndex}`);
        const temp = rawDataToUse[fromIndex];
        rawDataToUse[fromIndex] = rawDataToUse[toIndex];
        rawDataToUse[toIndex] = temp;

        // Update the engine's raw data
        appState.pivotEngine.getState().rawData = rawDataToUse;

        // Refresh the virtual scroller
        appState.virtualScroller.refresh();
      };

      // Initialize virtual scroller
      appState.virtualScroller = new VirtualScroller({
        container: scrollerContainer,
        data: rawDataToUse,
        headers: headers,
        rowHeight: 40,
        bufferSize: 10,
        renderRow: renderRow,
        renderHeader: renderHeader,
        onDragDrop: handleDragDrop,
      });

      appState.virtualScroller.mount(scrollerContainer);

      // Update pagination info
      const paginationInfo = document.getElementById('paginationInfo');
      if (paginationInfo) {
        paginationInfo.textContent = `Showing all ${rawDataToUse.length.toLocaleString()} rows (virtual scrolling)`;
      }
    } else {
      // Use traditional rendering for small datasets (< 1000 rows)
      tableContainer.innerHTML = '';

      // Destroy existing virtual scroller if any
      if (appState.virtualScroller) {
        appState.virtualScroller.destroy();
        appState.virtualScroller = null;
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
      const currentSort = appState.rawDataSort || {};

      headers.forEach((headerText, index) => {
        headerRow.appendChild(
          buildRawHeaderCell(headerText, index, currentSort, rawDataToUse)
        );
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Update pagination
      updateRawDataPagination(rawDataToUse);

      // Get paginated data
      const paginatedData = getPaginatedData(rawDataToUse, appState.pagination);

      // Create table body
      const tbody = document.createElement('tbody');

      const paginationStart =
        (appState.pagination.currentPage - 1) * appState.pagination.pageSize;
      paginatedData.forEach((rowData, rowIndex) => {
        const tr = document.createElement('tr');
        tr.dataset.rowIndex = rowIndex;
        tr.dataset.globalIndex = paginationStart + rowIndex;
        tr.setAttribute('draggable', 'true');
        tr.style.cursor = 'move';
        tr.className = 'raw-data-row';

        headers.forEach(header => {
          tr.appendChild(buildRawDataCell(rowData[header], header));
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
    logger.info(
      `Raw data table rendered in ${((endTime - startTime) / 1000).toFixed(2)}s`
    );
  } catch (error) {
    logger.error('Error rendering raw data table:', error);
    const tableContainer = document.getElementById('myTable');
    if (tableContainer) {
      const errDiv = document.createElement('div');
      errDiv.style.cssText = 'color:red;padding:20px';
      errDiv.textContent = `Error rendering raw data table: ${error.message}`;
      tableContainer.replaceChildren(errDiv);
    }
  }
}
