'use strict';
import { appState } from '../../state.js';
import { logger } from '../../logger.js';

// Helper to capitalise a field name for display
function getFieldDisplayName(fieldName) {
  return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// Initialize filter fields
export function initializeFilters() {
  const filterField = document.getElementById('filterField');
  if (!filterField) {
    logger.error('Filter field element not found');
    return;
  }

  // Build field list dynamically from current engine data
  let fields = [];
  try {
    if (appState.pivotEngine) {
      const stateNow = appState.pivotEngine.getState();
      const sample = (stateNow.rawData && stateNow.rawData[0]) || null;
      if (sample) {
        fields = Object.keys(sample).filter(k => k !== '__all__');
      }
    }
  } catch (e) {
    logger.warn('Unable to infer fields for filters from engine:', e);
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
    logger.error('Filter operator element not found');
    return;
  }

  filterOperator.innerHTML = `
    <option value="contains" selected>Contains</option>
    <option value="equals">Equals</option>
    <option value="greaterThan">Greater Than</option>
    <option value="lessThan">Less Than</option>
  `;
}

// Reset filters
export function resetFilters() {
  // Use the engine's built-in method to clear filters
  appState.pivotEngine.applyFilters([]);

  // Reset filter inputs
  const filterField = document.getElementById('filterField');
  const filterOperator = document.getElementById('filterOperator');
  const filterValue = document.getElementById('filterValue');

  if (filterField) filterField.selectedIndex = 0;
  if (filterOperator) filterOperator.selectedIndex = 0;
  if (filterValue) filterValue.value = '';
}
