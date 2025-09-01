import React from 'react';

// Expanded type for the custom element API we use across demos
export type PivotHeadEl = HTMLElement & {
  // data & config
  data: unknown[];
  options: unknown;
  filters?: unknown[];

  // sorting & filtering
  sort: (field: string, dir: 'asc' | 'desc') => void;

  // pagination
  getPagination: () => { currentPage: number; totalPages: number; pageSize: number };
  setPageSize: (size: number) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // view mode (processed | raw)
  getViewMode: () => 'processed' | 'raw';
  setViewMode: (mode: 'processed' | 'raw') => void;

  // exporting & print
  exportToHTML?: (tableIdOrName: string) => void;
  exportToPDF?: (tableIdOrName: string) => void;
  exportToExcel?: (tableIdOrName: string) => void;
  openPrintDialog?: () => void;

  // dnd
  swapRows?: (fromIndex: number, toIndex: number) => void;

  // state accessors
  getState: () => unknown;
  getGroupedData: () => Array<unknown>;
  getData?: () => unknown[];

  // reset
  reset?: () => void;
};

const PivotHead = React.forwardRef<PivotHeadEl, React.HTMLAttributes<PivotHeadEl>>((props, ref) =>
  React.createElement('pivot-head', { ...props, ref } as React.DOMAttributes<PivotHeadEl>)
);
PivotHead.displayName = 'PivotHead';

export default PivotHead;
