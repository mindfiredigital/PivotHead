import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useCallback } from 'react';
import '@mindfiredigital/pivothead-web-component';

// Minimal local types to keep wrapper independent of build order
export type PivotDataRecord = Record<string, unknown>;
export interface PivotOptions {
  rows?: unknown[];
  columns?: unknown[];
  measures?: unknown[];
  groupConfig?: unknown;
  [key: string]: unknown;
}
export type FilterConfig = unknown;
export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}
export interface PivotTableState<T = unknown> {
  data?: T[];
  rawData?: T[];
  processedData?: unknown;
  [key: string]: unknown;
}
export type Dimension = unknown;
export type GroupConfig = unknown;
export type MeasureConfig = unknown;

// Strongly-typed view of the custom element API
type PivotHeadEl = HTMLElement & {
  data: PivotDataRecord[];
  options: PivotOptions;
  filters: FilterConfig[];
  pagination: PaginationConfig;
  getState(): PivotTableState<PivotDataRecord>;
  refresh(): void;
  sort(field: string, direction: 'asc' | 'desc'): void;
  setMeasures(measures: MeasureConfig[]): void;
  setDimensions(dimensions: Dimension[]): void;
  setGroupConfig(config: GroupConfig | null): void;
  getFilters(): FilterConfig[];
  getPagination(): PaginationConfig;
  getData(): PivotDataRecord[];
  getProcessedData(): unknown;
  // additional APIs used by examples
  getGroupedData?: () => unknown[];
  swapRows?: (fromIndex: number, toIndex: number) => void;
  swapColumns?: (fromIndex: number, toIndex: number) => void;
  previousPage(): void;
  nextPage(): void;
  setPageSize(size: number): void;
  goToPage(page: number): void;
  setViewMode(mode: 'raw' | 'processed'): void;
  getViewMode(): 'raw' | 'processed';
  exportToHTML(fileName?: string): void;
  exportToPDF(fileName?: string): void;
  exportToExcel(fileName?: string): void;
  openPrintDialog(): void;
};

export type PivotHeadMode = 'default' | 'minimal' | 'none';

export type PivotHeadProps = {
  mode?: PivotHeadMode;
  className?: string;
  style?: React.CSSProperties;
  // Attributes/props
  data?: PivotDataRecord[];
  options?: PivotOptions;
  filters?: FilterConfig[];
  pagination?: Partial<PaginationConfig>;
  // Events
  onStateChange?: (e: CustomEvent<PivotTableState<PivotDataRecord>>) => void;
  onViewModeChange?: (e: CustomEvent<{ mode: 'raw' | 'processed' }>) => void;
  onPaginationChange?: (e: CustomEvent<PaginationConfig>) => void;
  // Children for minimal mode slots
  headerSlot?: React.ReactNode;
  bodySlot?: React.ReactNode;
};

export type PivotHeadRef = {
  el: PivotHeadEl | null;
  // Methods from the web-component
  methods: {
    getState: () => PivotTableState<PivotDataRecord> | undefined;
    refresh: () => void;
    sort: (field: string, direction: 'asc' | 'desc') => void;
    setMeasures: (measures: MeasureConfig[]) => void;
    setDimensions: (dimensions: Dimension[]) => void;
    setGroupConfig: (config: GroupConfig | null) => void;
    getFilters: () => FilterConfig[] | undefined;
    getPagination: () => PaginationConfig | undefined;
    getData: () => PivotDataRecord[] | undefined;
    getProcessedData: () => unknown;
    // additional passthroughs used in examples
    getGroupedData: () => unknown[] | undefined;
    swapRows: (fromIndex: number, toIndex: number) => void;
    swapColumns: (fromIndex: number, toIndex: number) => void;
    // Extras available on the element
    previousPage: () => void;
    nextPage: () => void;
    setPageSize: (size: number) => void;
    goToPage: (page: number) => void;
    setViewMode: (mode: 'raw' | 'processed') => void;
    getViewMode: () => 'raw' | 'processed' | undefined;
    exportToHTML: (fileName?: string) => void;
    exportToPDF: (fileName?: string) => void;
    exportToExcel: (fileName?: string) => void;
    openPrintDialog: () => void;
  };
};

function toJsonAttr(value: unknown) {
  try { return JSON.stringify(value); } catch { return undefined; }
}

export const PivotHead = forwardRef<PivotHeadRef, PivotHeadProps>(function PivotHead(
  props, ref
) {
  const {
    className,
    style,
    mode = 'default',
    data,
    options,
    filters,
    pagination,
    onStateChange,
    onViewModeChange,
    onPaginationChange,
    headerSlot,
    bodySlot,
  } = props;

  const elRef = useRef<PivotHeadEl | null>(null);
  // Track last known pagination to emit changes when state changes (e.g., filtering)
  const lastPaginationRef = useRef<PaginationConfig | undefined>(undefined);

  // Helper to read latest pagination from the element and emit change if different
  const emitPaginationIfChanged = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    try {
      const pag = el.getPagination?.();
      if (!pag) return;
      const last = lastPaginationRef.current;
      if (!last || last.currentPage !== pag.currentPage || last.pageSize !== pag.pageSize || last.totalPages !== pag.totalPages) {
        lastPaginationRef.current = pag;
        const ce = new CustomEvent<PaginationConfig>('paginationChange', { detail: pag });
        onPaginationChange?.(ce);
      }
    } catch {
      // no-op
    }
  }, [onPaginationChange]);

  // Schedules a microtask to ensure we read pagination after the component finishes updating (e.g., after filters apply)
  const schedulePaginationSync = useCallback(() => {
    // Use microtask; fallback to macrotask if necessary
    Promise.resolve().then(() => emitPaginationIfChanged());
  }, [emitPaginationIfChanged]);

  // Bridge React props to custom element attributes/properties keeping functionality unchanged
  useEffect(() => {
    const el = elRef.current;
    if (!el || data === undefined) return;
    el.data = data;
    // Data changes may affect totals; sync after update
    schedulePaginationSync();
  }, [data, schedulePaginationSync]);

  useEffect(() => {
    const el = elRef.current;
    if (!el || options === undefined) return;
    el.options = options as PivotOptions;
    // Options might affect pagination depending on implementation; safe to resync
    schedulePaginationSync();
  }, [options, schedulePaginationSync]);

  useEffect(() => {
    const el = elRef.current;
    if (!el || filters === undefined) return;
    el.filters = filters as FilterConfig[];
    // Critical: after filters apply, totals often change. Sync in a microtask so calculations are up to date.
    schedulePaginationSync();
  }, [filters, schedulePaginationSync]);

  useEffect(() => {
    const el = elRef.current;
    if (!el || pagination === undefined) return;
    el.pagination = { ...(el.pagination || { currentPage: 1, pageSize: 10, totalPages: 1 }), ...(pagination as PaginationConfig) };
    // External pagination prop updates should reflect in UI immediately
    schedulePaginationSync();
  }, [pagination, schedulePaginationSync]);

  // Attach/detach event listeners
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Initialize last seen pagination from the element and emit once so UI is in sync on mount
    try {
      const current = el.getPagination?.();
      if (current) {
        lastPaginationRef.current = current;
        const ce = new CustomEvent<PaginationConfig>('paginationChange', { detail: current });
        onPaginationChange?.(ce);
      }
    } catch {
      // no-op
    }

    const handleState: EventListener = (e) => {
      onStateChange?.(e as CustomEvent<PivotTableState<PivotDataRecord>>);
      // Schedule pagination sync to run after internal state settles (filters, sorting, etc.)
      schedulePaginationSync();
    };
    const handleViewMode: EventListener = (e) => {
      onViewModeChange?.(e as CustomEvent<{ mode: 'raw' | 'processed' }>);
    };
    const handlePagination: EventListener = (e) => {
      // Update last seen pagination to prevent duplicate emits from handleState
      const ce = e as CustomEvent<PaginationConfig>;
      if (ce?.detail) {
        lastPaginationRef.current = ce.detail;
      }
      onPaginationChange?.(ce);
    };

    el.addEventListener('stateChange', handleState);
    el.addEventListener('viewModeChange', handleViewMode);
    el.addEventListener('paginationChange', handlePagination);
    return () => {
      el.removeEventListener('stateChange', handleState);
      el.removeEventListener('viewModeChange', handleViewMode);
      el.removeEventListener('paginationChange', handlePagination);
    };
  }, [onStateChange, onViewModeChange, onPaginationChange, schedulePaginationSync]);

  // Expose underlying element and safe method calls
  useImperativeHandle(ref, () => ({
    el: elRef.current,
    methods: {
      getState: () => elRef.current?.getState?.(),
      refresh: () => elRef.current?.refresh?.(),
      sort: (f, d) => elRef.current?.sort?.(f, d),
      setMeasures: (m) => elRef.current?.setMeasures?.(m),
      setDimensions: (d) => elRef.current?.setDimensions?.(d),
      setGroupConfig: (c) => elRef.current?.setGroupConfig?.(c),
      getFilters: () => elRef.current?.getFilters?.(),
      getPagination: () => elRef.current?.getPagination?.(),
      getData: () => elRef.current?.getData?.(),
      getProcessedData: () => elRef.current?.getProcessedData?.(),
      getGroupedData: () => elRef.current?.getGroupedData?.(),
      swapRows: (from, to) => elRef.current?.swapRows?.(from, to),
      swapColumns: (from, to) => elRef.current?.swapColumns?.(from, to),
      previousPage: () => elRef.current?.previousPage?.(),
      nextPage: () => elRef.current?.nextPage?.(),
      setPageSize: (s) => elRef.current?.setPageSize?.(s),
      goToPage: (p) => elRef.current?.goToPage?.(p),
      setViewMode: (m) => elRef.current?.setViewMode?.(m),
      getViewMode: () => elRef.current?.getViewMode?.(),
      exportToHTML: (n?: string) => elRef.current?.exportToHTML?.(n),
      exportToPDF: (n?: string) => elRef.current?.exportToPDF?.(n),
      exportToExcel: (n?: string) => elRef.current?.exportToExcel?.(n),
      openPrintDialog: () => elRef.current?.openPrintDialog?.(),
    },
  }), []);

  const slotNodes = useMemo(() => (
    mode === 'minimal' ? (
      <>
        <div slot="header">{headerSlot}</div>
        <div slot="body">{bodySlot}</div>
      </>
    ) : null
  ), [mode, headerSlot, bodySlot]);

  // Build attributes conditionally to avoid setting "null" strings
  const elementProps: Record<string, unknown> = {
    ref: (node: Element | null) => { elRef.current = node as PivotHeadEl | null; },
    className,
    style,
    mode,
  };
  if (data !== undefined) elementProps.data = toJsonAttr(data);
  if (options !== undefined) elementProps.options = toJsonAttr(options);
  if (filters !== undefined) elementProps.filters = toJsonAttr(filters);
  if (pagination !== undefined) elementProps.pagination = toJsonAttr(pagination);

  return (
    React.createElement('pivot-head', elementProps, slotNodes)
  );
});

export default PivotHead;
