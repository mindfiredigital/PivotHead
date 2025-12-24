import type { PivotHeadHost } from './host';
import { renderSwitch as renderSwitchHelper } from './render';

export function parseAttributesIfNeeded(host: PivotHeadHost): void {
  // Parse data attribute
  const rawData = host.getAttribute('data');
  if (rawData && !host._data.length) {
    try {
      host.data = JSON.parse(rawData);
    } catch (error) {
      console.error('Error parsing data attribute:', error);
    }
  }

  // Parse options attribute
  const rawOptions = host.getAttribute('options');
  if (rawOptions && !Object.keys(host._options).length) {
    try {
      host.options = JSON.parse(rawOptions);
    } catch (error) {
      console.error('Error parsing options attribute:', error);
    }
  }

  // Parse other attributes
  parseOtherAttributes(host);
}

export function parseOtherAttributes(host: PivotHeadHost): void {
  // Parse filters
  const rawFilters = host.getAttribute('filters');
  if (rawFilters) {
    try {
      host.filters = JSON.parse(rawFilters);
    } catch (error) {
      console.error('Error parsing filters attribute:', error);
    }
  }

  // Parse pagination
  const rawPagination = host.getAttribute('pagination');
  if (rawPagination) {
    try {
      host.pagination = {
        ...host._pagination,
        ...JSON.parse(rawPagination),
      } as typeof host._pagination;
    } catch (error) {
      console.error('Error parsing pagination attribute:', error);
    }
  }
}

export function attributeChanged(
  host: PivotHeadHost,
  name: string,
  oldValue: string | null,
  newValue: string | null
): void {
  if (oldValue === newValue) return;
  if (name === 'mode') {
    // Only render if engine is initialized
    if (host.engine) {
      renderSwitchHelper(host);
    }
    return;
  }
  switch (name) {
    case 'data':
      if (newValue) {
        try {
          host.data = JSON.parse(newValue);
        } catch (error) {
          console.error('Error parsing data attribute:', error);
        }
      }
      break;

    case 'options':
      if (newValue) {
        try {
          host.options = JSON.parse(newValue);
        } catch (error) {
          console.error('Error parsing options attribute:', error);
        }
      }
      break;

    case 'filters':
      if (newValue) {
        try {
          host.filters = JSON.parse(newValue);
        } catch (error) {
          console.error('Error parsing filters attribute:', error);
        }
      } else {
        host.filters = [];
      }
      break;

    case 'pagination':
      if (newValue) {
        try {
          host.pagination = {
            ...host._pagination,
            ...JSON.parse(newValue),
          } as typeof host._pagination;
        } catch (error) {
          console.error('Error parsing pagination attribute:', error);
        }
      } else {
        host.pagination = {
          currentPage: 1,
          pageSize: 30,
          totalPages: 1,
        } as typeof host._pagination;
      }
      break;
  }
}
