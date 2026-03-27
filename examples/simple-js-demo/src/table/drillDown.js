'use strict';
import { appState } from '../../state.js';
import { logger } from '../../logger.js';

// Helper to capitalise a field name for display
function getFieldDisplayName(fieldName) {
  return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// Create drill-down modal for any fields
export function createDrillDownModal(
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
export function getDrillDownData(
  rowValue,
  columnValue,
  measure,
  rowFieldName,
  columnFieldName
) {
  if (!appState.pivotEngine) return [];
  const state = appState.pivotEngine.getState();
  return state.rawData.filter(
    item =>
      item[rowFieldName] === rowValue && item[columnFieldName] === columnValue
  );
}

// Generic addDrillDownToDataCell function
export function addDrillDownToDataCell(
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
