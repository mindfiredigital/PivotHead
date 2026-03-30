import type { FilterConfig } from '@mindfiredigital/pivothead';
import type { PivotHeadHost } from './host';
import { logger } from '../../logger.js';

// Filters
export function setFilters(host: PivotHeadHost, value: FilterConfig[]): void {
  logger.info(
    'Setting filters, current view mode:',
    host._showRawData ? 'RAW' : 'PROCESSED'
  );
  logger.info('New filter value:', value);

  if (host._showRawData) {
    host._rawFilters = value || [];
    logger.info('Applied RAW filters:', host._rawFilters);
  } else {
    host._processedFilters = value || [];
    logger.info('Applied PROCESSED filters:', host._processedFilters);
  }

  if (host.engine) {
    host.engine.setDataHandlingMode(host._showRawData ? 'raw' : 'processed');
    host.engine.applyFilters(value || []);
  }

  host._filters = value || [];
  // Guard against recursive setAttribute → attributeChangedCallback → setFilters loop
  const serialized = JSON.stringify(value);
  if (host.getAttribute('filters') !== serialized) {
    host.setAttribute('filters', serialized);
  }

  // Clear filter UI if no filters are applied
  if (!value || value.length === 0) {
    clearFilterUI(host);
  }

  // CRITICAL: Trigger re-render after applying filters
  host._renderSwitch();
}

export function getFilters(host: PivotHeadHost): FilterConfig[] {
  if (host._showRawData) {
    return host._rawFilters;
  } else {
    return host._processedFilters;
  }
}

// Refresh/reset
export function refresh(host: PivotHeadHost): void {
  if (!host.engine) {
    logger.error('Engine not initialized');
    return;
  }

  host._filters = [];
  host.removeAttribute('filters');
  host.engine.reset();

  const filterValueInput = host.shadowRoot?.getElementById(
    'filterValue'
  ) as HTMLInputElement;
  if (filterValueInput) {
    filterValueInput.value = '';
  }
}

export function reset(host: PivotHeadHost): void {
  if (!host.engine) {
    logger.error('Engine not initialized');
    return;
  }

  host._rawFilters = [];
  host._processedFilters = [];
  host._filters = [];
  host.removeAttribute('filters');

  host._pagination.currentPage = 1;

  host.engine.reset();

  clearFilterUI(host);

  // Trigger re-render after resetting filters
  host._renderSwitch();
}

export function clearFilterUI(host: PivotHeadHost): void {
  const filterValueInput = host.shadowRoot?.getElementById(
    'filterValue'
  ) as HTMLInputElement;
  if (filterValueInput) {
    filterValueInput.value = '';
  }

  const filterFieldSelect = host.shadowRoot?.getElementById(
    'filterField'
  ) as HTMLSelectElement;
  const filterOperatorSelect = host.shadowRoot?.getElementById(
    'filterOperator'
  ) as HTMLSelectElement;
  if (filterFieldSelect) filterFieldSelect.selectedIndex = 0;
  if (filterOperatorSelect) filterOperatorSelect.selectedIndex = 0;
}
