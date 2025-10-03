import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useCallback } from 'react';
import '@mindfiredigital/pivothead-web-component';
import type {
  PivotHeadEl,
  PivotHeadProps,
  PivotHeadRef,
  PaginationConfig,
  PivotTableState,
  PivotDataRecord,
} from './types';
import { toJsonAttr } from './utils';

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
    el.options = options;
    // Options might affect pagination depending on implementation; safe to resync
    schedulePaginationSync();
  }, [options, schedulePaginationSync]);

  useEffect(() => {
    const el = elRef.current;
    if (!el || filters === undefined) return;
    el.filters = filters;
    // Critical: after filters apply, totals often change. Sync in a microtask so calculations are up to date.
    schedulePaginationSync();
  }, [filters, schedulePaginationSync]);

  useEffect(() => {
    const el = elRef.current;
    if (!el || pagination === undefined) return;
    el.pagination = { ...(el.pagination || { currentPage: 1, pageSize: 10, totalPages: 1 }), ...pagination };
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
      // Format-related methods
      formatValue: (value: unknown, field: string) => elRef.current?.formatValue?.(value, field),
      updateFieldFormatting: (field: string, format) => elRef.current?.updateFieldFormatting?.(field, format),
      getFieldAlignment: (field: string) => elRef.current?.getFieldAlignment?.(field),
      showFormatPopup: () => elRef.current?.showFormatPopup?.(),
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

     
      loadFromFile: (file: File) => elRef.current?.loadFromFile?.(file),
      loadFromUrl: (url: string) => elRef.current?.loadFromUrl?.(url),
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
