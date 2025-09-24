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

    // CRITICAL FIX: Re-render after applying filters
    console.log('🔥 Filter: Re-rendering after filter application...');
    host._renderSwitch();
  }

  host._filters = value || [];
  host.setAttribute('filters', JSON.stringify(value));
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

  // CRITICAL FIX: Only clear filters, don't reset the entire engine
  console.log('🔥 Refresh: Clearing filters only, preserving imported data...');
  host.engine.applyFilters([]); // Clear filters but keep data

  // CRITICAL FIX: Re-render after refresh
  console.log('🔥 Refresh: Re-rendering after refresh...');
  host._renderSwitch();

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

  // CRITICAL FIX: For imported data, don't call engine.reset() as it wipes imported data
  // Instead, just clear filters and refresh the view
  console.log(
    '🔥 Reset: Clearing filters and pagination, preserving imported data...'
  );

  const currentState = host.engine.getState();
  if (currentState.rawData && currentState.rawData.length > 0) {
    // We have imported data, just clear filters but keep the data
    host.engine.applyFilters([]); // Clear filters but keep data

    // Reset any custom sorting
    host.engine.sort('', 'asc'); // Clear sorting
  } else {
    // No imported data, safe to do full reset
    host.engine.reset();
  }

  // CRITICAL FIX: Re-render after reset
  console.log('🔥 Reset: Re-rendering after reset...');
  host._renderSwitch();

  clearFilterUI(host);
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
