import type { FilterConfig } from '@mindfiredigital/pivothead';
import type { PivotHeadHost } from './host';

// Filters
export function setFilters(host: PivotHeadHost, value: FilterConfig[]): void {
  console.log(
    'Setting filters, current view mode:',
    host._showRawData ? 'RAW' : 'PROCESSED'
  );
  console.log('New filter value:', value);

  if (host._showRawData) {
    host._rawFilters = value || [];
    console.log('Applied RAW filters:', host._rawFilters);
  } else {
    host._processedFilters = value || [];
    console.log('Applied PROCESSED filters:', host._processedFilters);
  }

  if (host.engine) {
    host.engine.setDataHandlingMode(host._showRawData ? 'raw' : 'processed');
    host.engine.applyFilters(value || []);
  }

  host._filters = value || [];
  host.setAttribute('filters', JSON.stringify(value));

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
    console.error('Engine not initialized');
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
    console.error('Engine not initialized');
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
