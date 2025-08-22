import type { Group } from '@mindfiredigital/pivothead';
import type { PivotHeadHost } from './host';
import { renderSwitch as renderSwitchHelper } from './render';
import { updatePaginationInfo as updatePaginationInfoHelper } from './ui';

export function calculatePaginationForCurrentView(host: PivotHeadHost): void {
  if (host._showRawData) {
    if (!host.engine) return;
    const state = host.engine.getState();
    const allRawData = (state.data || state.rawData || []) as unknown[];
    updatePaginationForData(host, allRawData);
  } else {
    if (!host.engine) return;
    const groupedData = host.engine.getGroupedData();
    let uniqueRowValues = host.engine.getOrderedRowValues();
    if (!uniqueRowValues) {
      uniqueRowValues = [
        ...new Set(
          groupedData.map((g: Group) => {
            const keys = g.key ? g.key.split('|') : [];
            return keys[0];
          })
        ),
      ].filter(Boolean) as string[];
    }
    updatePaginationForData(host, uniqueRowValues as unknown[]);
  }
}

export function updatePaginationForData(
  host: PivotHeadHost,
  data: unknown[]
): void {
  const pageSize = host._pagination.pageSize;
  const totalPages = Math.ceil(data.length / pageSize) || 1;
  if (host._pagination.currentPage > totalPages) {
    host._pagination.currentPage = Math.max(1, totalPages);
  }
  host._pagination.totalPages = totalPages;
}

export function getPaginatedData<T>(host: PivotHeadHost, data: T[]): T[] {
  const start = (host._pagination.currentPage - 1) * host._pagination.pageSize;
  const end = start + host._pagination.pageSize;
  return data.slice(start, end);
}

export function previousPage(host: PivotHeadHost): void {
  if (host._pagination.currentPage > 1) {
    host._pagination.currentPage--;
    renderSwitchHelper(host);
    host.dispatchEvent(
      new CustomEvent('paginationChange', {
        detail: { ...host._pagination },
        bubbles: true,
        composed: true,
      })
    );
  }
  updatePaginationInfoHelper(host);
}

export function nextPage(host: PivotHeadHost): void {
  if (host._pagination.currentPage < host._pagination.totalPages) {
    host._pagination.currentPage++;
    renderSwitchHelper(host);
    host.dispatchEvent(
      new CustomEvent('paginationChange', {
        detail: { ...host._pagination },
        bubbles: true,
        composed: true,
      })
    );
  }
  updatePaginationInfoHelper(host);
}

export function setPageSize(host: PivotHeadHost, pageSize: number): void {
  if (pageSize > 0) {
    host._pagination.pageSize = pageSize;
    host._pagination.currentPage = 1;
    calculatePaginationForCurrentView(host);
    renderSwitchHelper(host);
    host.dispatchEvent(
      new CustomEvent('paginationChange', {
        detail: { ...host._pagination },
        bubbles: true,
        composed: true,
      })
    );
  }
  updatePaginationInfoHelper(host);
}

export function goToPage(host: PivotHeadHost, page: number): void {
  if (page >= 1 && page <= host._pagination.totalPages) {
    host._pagination.currentPage = page;
    renderSwitchHelper(host);
    host.dispatchEvent(
      new CustomEvent('paginationChange', {
        detail: { ...host._pagination },
        bubbles: true,
        composed: true,
      })
    );
  }
  updatePaginationInfoHelper(host);
}
