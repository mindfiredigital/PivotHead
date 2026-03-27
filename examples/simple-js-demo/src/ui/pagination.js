'use strict';
import { appState } from '../../state.js';
import { logger } from '../../logger.js';

// Get paginated data
export function getPaginatedData(data, paginationState) {
  if (!data || !Array.isArray(data)) {
    logger.warn('Invalid data provided to getPaginatedData');
    return [];
  }

  const start = (paginationState.currentPage - 1) * paginationState.pageSize;
  const end = start + paginationState.pageSize;
  return data.slice(start, end);
}

// Generic updatePagination function
export function updatePagination(data, resetPage = false) {
  const pageSizeElement = document.getElementById('pageSize');
  const pageSize = pageSizeElement ? Number(pageSizeElement.value) : 10;
  const totalPages = Math.ceil(data.length / pageSize) || 1;

  if (resetPage) {
    appState.pagination.currentPage = 1;
  } else if (appState.pagination.currentPage > totalPages) {
    appState.pagination.currentPage = totalPages;
  }

  appState.pagination.pageSize = pageSize;
  appState.pagination.totalPages = totalPages;
}

// Update pagination info display
export function updatePaginationInfo(viewType = 'Processed Data') {
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `${viewType} - Page ${appState.pagination.currentPage} of ${appState.pagination.totalPages}`;
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    if (prevButton) prevButton.disabled = appState.pagination.currentPage <= 1;
    if (nextButton)
      nextButton.disabled =
        appState.pagination.currentPage >= appState.pagination.totalPages;
  }
}

// Update raw-data pagination state
export function updateRawDataPagination(rawData) {
  if (!rawData || !Array.isArray(rawData)) {
    logger.warn('Invalid raw data for pagination');
    return;
  }

  // Get pageSize from the select element, with fallback
  const pageSizeElement = document.getElementById('pageSize');
  const pageSize = pageSizeElement ? Number(pageSizeElement.value) : 10;
  const totalPages = Math.ceil(rawData.length / pageSize) || 1;

  // Check if current page is valid for new pagination
  if (appState.pagination.currentPage > totalPages) {
    appState.pagination.currentPage = Math.max(1, totalPages);
  }

  appState.pagination.pageSize = pageSize;
  appState.pagination.totalPages = totalPages;
}
