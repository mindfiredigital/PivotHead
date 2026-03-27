'use strict';
import { appState } from '../../state.js';
import { logger } from '../../logger.js';
import { addDrillDownToDataCell } from './drillDown.js';
import {
  getPaginatedData,
  updatePagination,
  updatePaginationInfo,
} from '../ui/pagination.js';
import { setupDragAndDrop } from './dragAndDrop.js';
import { renderRawDataTable } from './renderRaw.js';
import { createSortIcon } from './renderRaw.js';

// Helper to capitalise a field name for display
function getFieldDisplayName(fieldName) {
  return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// Generic function to get ordered column values
export function getOrderedColumnValues() {
  if (!appState.pivotEngine) {
    logger.warn('PivotEngine not initialized');
    return [];
  }

  const state = appState.pivotEngine.getState();
  const columnFieldName = appState.pivotEngine.getColumnFieldName();
  if (!columnFieldName) return [];

  // Prefer engine-provided custom order if available
  try {
    const customOrdered =
      appState.pivotEngine.getOrderedColumnValues &&
      appState.pivotEngine.getOrderedColumnValues();
    if (Array.isArray(customOrdered) && customOrdered.length > 0) {
      return customOrdered;
    }
  } catch (error) {
    logger.warn('Could not get ordered column values from engine:', error);
  }

  // Fallback: compute unique values from current filtered data
  const filteredRawData = state.rawData || [];
  const uniqueColumnValues = [
    ...new Set(filteredRawData.map(item => item[columnFieldName])),
  ];
  return uniqueColumnValues;
}

// Generic function to get ordered row values
export function getOrderedRowValues() {
  if (!appState.pivotEngine) {
    logger.warn('PivotEngine not initialized');
    return [];
  }

  const state = appState.pivotEngine.getState();
  const rowFieldName = appState.pivotEngine.getRowFieldName();
  if (!rowFieldName) return [];

  // Prefer engine-provided custom order if available
  try {
    const customOrdered =
      appState.pivotEngine.getOrderedRowValues &&
      appState.pivotEngine.getOrderedRowValues();
    if (Array.isArray(customOrdered) && customOrdered.length > 0) {
      return customOrdered;
    }
  } catch (error) {
    logger.warn('Could not get ordered row values from engine:', error);
  }

  // Fallback: compute unique values from current filtered data
  const filteredRawData = state.rawData || [];
  const uniqueRowValues = [
    ...new Set(filteredRawData.map(item => item[rowFieldName])),
  ];
  return uniqueRowValues;
}

export function getSortedRowValuesByMeasure(
  rowFieldName,
  columnFieldName,
  sortConfig
) {
  const state = appState.pivotEngine.getState();
  const uniqueRowValues =
    appState.pivotEngine.getUniqueFieldValues(rowFieldName);
  const uniqueColumnValues =
    appState.pivotEngine.getUniqueFieldValues(columnFieldName);

  logger.info(
    'Sorting rows by measure:',
    sortConfig.field,
    'direction:',
    sortConfig.direction
  );

  // Find the measure configuration
  const measure = state.measures.find(m => m.uniqueName === sortConfig.field);
  if (!measure) {
    logger.error('Measure not found:', sortConfig.field);
    return uniqueRowValues;
  }

  // Calculate total aggregated value for each row across all columns
  const rowTotals = uniqueRowValues.map(rowValue => {
    let total = 0;

    uniqueColumnValues.forEach(columnValue => {
      const cellValue = appState.pivotEngine.calculateCellValue(
        rowValue,
        columnValue,
        measure,
        rowFieldName,
        columnFieldName
      );
      total += cellValue || 0;
    });

    return { rowValue, total };
  });

  logger.info('Row totals before sorting:', rowTotals.slice(0, 3));

  // Sort by total
  rowTotals.sort((a, b) => {
    const result = a.total - b.total;
    return sortConfig.direction === 'asc' ? result : -result;
  });

  logger.info('Row totals after sorting:', rowTotals.slice(0, 3));

  return rowTotals.map(item => item.rowValue);
}

export function createColumnHeaders(
  uniqueColumnValues,
  columnFieldName,
  state,
  columnHeaderRow
) {
  logger.info('Creating column headers for values:', uniqueColumnValues);

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
    logger.info('Created header for:', columnValue, 'at index:', index);
  });
}

// FIXED: Main table rendering function with proper pivot engine sorting
export function renderTable() {
  // Check current view mode
  if (appState.currentViewMode === 'raw') {
    logger.info('Rendering raw data view');
    renderRawDataTable();
    return;
  }

  if (!appState.pivotEngine) {
    logger.error('PivotEngine not initialized');
    const tableContainer = document.getElementById('myTable');
    if (tableContainer) {
      tableContainer.innerHTML =
        '<div style="padding: 20px; color: red;">Error: Pivot engine not initialized. Please refresh the page.</div>';
    }
    return;
  }

  try {
    logger.info('Starting renderTable for processed mode...');
    const state = appState.pivotEngine.getState();
    logger.info('Current Engine State:', {
      hasProcessedData: !!state.processedData,
      hasRawData: !!state.rawData,
      dataHandlingMode: state.dataHandlingMode,
      rowsCount: state.rows?.length || 0,
      columnsCount: state.columns?.length || 0,
      measuresCount: state.measures?.length || 0,
    });

    if (!state.processedData) {
      logger.error('No processed data available in engine state');
      const tableContainer = document.getElementById('myTable');
      if (tableContainer) {
        tableContainer.innerHTML =
          '<div style="padding: 20px; color: red;">Error: No processed data available. Please upload a file.</div>';
      }
      return;
    }

    // Get field names from configuration
    const rowFieldName = appState.pivotEngine.getRowFieldName();
    const columnFieldName = appState.pivotEngine.getColumnFieldName();

    if (!rowFieldName || !columnFieldName) {
      logger.error('Row or column field not configured');
      return;
    }

    const tableContainer = document.getElementById('myTable');
    if (!tableContainer) {
      logger.error('Table container not found');
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

    const rowSortIcon = createSortIcon(rowFieldName, currentSortConfig);
    rowHeaderContent.appendChild(rowSortIcon);
    rowHeader.appendChild(rowHeaderContent);

    rowHeader.addEventListener('click', e => {
      e.stopPropagation();

      const stateNow = appState.pivotEngine.getState();
      const current =
        stateNow.sortConfig && stateNow.sortConfig.length > 0
          ? stateNow.sortConfig[0]
          : null;
      const nextDir =
        current && current.field === rowFieldName && current.direction === 'asc'
          ? 'desc'
          : 'asc';

      // In processed mode, set custom alphabetical order for row values
      if (appState.currentViewMode !== 'raw') {
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
            appState.pivotEngine.setCustomFieldOrder(
              rowFieldName,
              sortedRows,
              true
            );
          }
        } catch (err) {
          logger.error(
            'Failed to set custom row order for dimension sort:',
            err
          );
        }
      }

      appState.pivotEngine.sort(rowFieldName, nextDir);
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

        const sortIcon = createSortIcon(measure.uniqueName, currentSortConfig);
        headerContent.appendChild(sortIcon);
        th.appendChild(headerContent);

        th.dataset.columnValue = String(columnValue);
        th.dataset.measureIndex = String(measureIndex);

        th.addEventListener('click', e => {
          const stateNow = appState.pivotEngine.getState();
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

          if (appState.currentViewMode !== 'raw') {
            try {
              // Determine aggregation key for the selected measure
              const measureCfg = stateNow.measures.find(
                m => m.uniqueName === measure.uniqueName
              );
              const aggregation =
                (measureCfg && measureCfg.aggregation) || 'sum';
              const aggKey = `${aggregation}_${measure.uniqueName}`;

              const groups = appState.pivotEngine.getGroupedData();

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

              const rowFieldNameNow = appState.pivotEngine.getRowFieldName();
              if (rowFieldNameNow && orderedRows.length > 0) {
                appState.pivotEngine.setCustomFieldOrder(
                  rowFieldNameNow,
                  orderedRows,
                  true
                );
              }
            } catch (err) {
              logger.error(
                'Failed to compute/set custom row order for processed sort:',
                err
              );
            }
          }

          appState.pivotEngine.sort(measure.uniqueName, nextDir);
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
      logger.info('No data matches the current filters');
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
      appState.pagination
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
      rowCell.setAttribute('draggable', 'true');
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
          const value = appState.pivotEngine.calculateCellValue(
            rowValue,
            columnValue,
            measure,
            rowFieldName,
            columnFieldName
          );

          // Use engine's formatValue method
          const formattedValue = appState.pivotEngine.formatValue(
            value,
            measure.uniqueName
          );

          // Apply text alignment from engine
          td.style.textAlign = appState.pivotEngine.getFieldAlignment(
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
    logger.error('Error rendering table:', error);
    const tableContainer = document.getElementById('myTable');
    if (tableContainer) {
      const errDiv = document.createElement('div');
      errDiv.style.cssText = 'color:red;padding:20px';
      errDiv.textContent = `Error rendering table: ${error.message}`;
      tableContainer.replaceChildren(errDiv);
    }
  }
}
