import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  OnChanges,
} from '@angular/core';
// Removed eager import of the web component to avoid SSR evaluation
// import '@mindfiredigital/pivothead-web-component';
import type {
  PivotHeadEl,
  PivotHeadRef,
  PaginationConfig,
  PivotTableState,
  PivotDataRecord,
  PivotHeadMode,
  FilterConfig,
  PivotOptions,
  MeasureConfig,
  Dimension,
  GroupConfig,
  FormatOptions,
} from './types';
import { toJsonAttr } from './utils';

@Directive({
  selector:
    'pivot-head[pivotHeadDirective], pivot-head-angular[pivotHeadDirective]',
})
export class PivotHeadDirective
  implements OnInit, OnDestroy, OnChanges, PivotHeadRef
{
  // Inputs matching React props
  @Input() mode: PivotHeadMode = 'default';
  @Input() data?: PivotDataRecord[];
  @Input() options?: PivotOptions;
  @Input() filters?: FilterConfig[];
  @Input() pagination?: Partial<PaginationConfig>;

  // Event outputs
  @Output() stateChange = new EventEmitter<PivotTableState<PivotDataRecord>>();
  @Output() viewModeChange = new EventEmitter<{ mode: 'raw' | 'processed' }>();
  @Output() paginationChange = new EventEmitter<PaginationConfig>();

  // Track last known pagination to emit changes when state changes
  private lastPagination?: PaginationConfig;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  // Resolve the underlying web component element irrespective of host
  get el(): PivotHeadEl | null {
    const host = this.elementRef?.nativeElement;
    if (!host) return null;
    if (host.tagName === 'PIVOT-HEAD') return host as unknown as PivotHeadEl;
    const child = host.querySelector?.('pivot-head');
    return (child as PivotHeadEl) || null;
  }

  // Expose methods from the web component
  get methods(): PivotHeadRef['methods'] {
    const el = this.el;
    return {
      getState: () => el?.getState?.(),
      refresh: () => el?.refresh?.(),
      sort: (f, d) => el?.sort?.(f, d),
      setMeasures: m => el?.setMeasures?.(m as MeasureConfig[]),
      setDimensions: d => el?.setDimensions?.(d as Dimension[]),
      setGroupConfig: c => el?.setGroupConfig?.(c as GroupConfig | null),
      getFilters: () => el?.getFilters?.(),
      getPagination: () => el?.getPagination?.(),
      getData: () => el?.getData?.(),
      getProcessedData: () => el?.getProcessedData?.(),
      // Format-related methods
      formatValue: (value: unknown, field: string) =>
        el?.formatValue?.(value, field),
      updateFieldFormatting: (field: string, format) =>
        el?.updateFieldFormatting?.(field, format as FormatOptions),
      getFieldAlignment: (field: string) => el?.getFieldAlignment?.(field),
      showFormatPopup: () => el?.showFormatPopup?.(),
      getGroupedData: () => el?.getGroupedData?.(),
      swapRows: (from, to) => el?.swapRows?.(from, to),
      swapColumns: (from, to) => el?.swapColumns?.(from, to),
      previousPage: () => el?.previousPage?.(),
      nextPage: () => el?.nextPage?.(),
      setPageSize: s => el?.setPageSize?.(s),
      goToPage: p => el?.goToPage?.(p),
      setViewMode: m => el?.setViewMode?.(m),
      getViewMode: () => el?.getViewMode?.(),
      exportToHTML: (n?: string) => el?.exportToHTML?.(n),
      exportToPDF: (n?: string) => el?.exportToPDF?.(n),
      exportToExcel: (n?: string) => el?.exportToExcel?.(n),
      openPrintDialog: () => el?.openPrintDialog?.(),
    };
  }

  // Convenience direct wrappers
  getState() {
    return this.el?.getState?.();
  }
  refresh() {
    this.el?.refresh?.();
  }
  sort(field: string, direction: 'asc' | 'desc') {
    this.el?.sort?.(field, direction);
  }
  setMeasures(measures: MeasureConfig[]) {
    this.el?.setMeasures?.(measures);
  }
  setDimensions(dimensions: Dimension[]) {
    this.el?.setDimensions?.(dimensions);
  }
  setGroupConfig(config: GroupConfig | null) {
    this.el?.setGroupConfig?.(config);
  }
  getFilters() {
    return this.el?.getFilters?.();
  }
  getPagination() {
    return this.el?.getPagination?.();
  }
  getData() {
    return this.el?.getData?.();
  }
  getProcessedData() {
    return this.el?.getProcessedData?.();
  }
  formatValue(value: unknown, field: string) {
    return this.el?.formatValue?.(value, field);
  }
  updateFieldFormatting(field: string, format: FormatOptions) {
    this.el?.updateFieldFormatting?.(field, format);
  }
  getFieldAlignment(field: string) {
    return this.el?.getFieldAlignment?.(field);
  }
  showFormatPopup() {
    this.el?.showFormatPopup?.();
  }
  getGroupedData() {
    return this.el?.getGroupedData?.();
  }
  swapRows(fromIndex: number, toIndex: number) {
    this.el?.swapRows?.(fromIndex, toIndex);
  }
  swapColumns(fromIndex: number, toIndex: number) {
    this.el?.swapColumns?.(fromIndex, toIndex);
  }
  previousPage() {
    this.el?.previousPage?.();
  }
  nextPage() {
    this.el?.nextPage?.();
  }
  setPageSize(size: number) {
    this.el?.setPageSize?.(size);
  }
  goToPage(page: number) {
    this.el?.goToPage?.(page);
  }
  setViewMode(mode: 'raw' | 'processed') {
    this.el?.setViewMode?.(mode);
  }
  getViewMode() {
    return this.el?.getViewMode?.();
  }
  exportToHTML(fileName?: string) {
    this.el?.exportToHTML?.(fileName);
  }
  exportToPDF(fileName?: string) {
    this.el?.exportToPDF?.(fileName);
  }
  exportToExcel(fileName?: string) {
    this.el?.exportToExcel?.(fileName);
  }
  openPrintDialog() {
    this.el?.openPrintDialog?.();
  }

  private async ensureElementDefined(): Promise<void> {
    try {
      if (typeof window === 'undefined') return; // SSR guard
      if (typeof customElements === 'undefined') return;
      if (customElements.get('pivot-head')) return;
      await import('@mindfiredigital/pivothead-web-component');
    } catch {
      // ignore on SSR
    }
  }

  async ngOnInit(): Promise<void> {
    await this.ensureElementDefined();
    this.setupEventListeners();
    this.syncPropsToElement();
    this.emitInitialPagination();
  }

  ngOnChanges(): void {
    if (this.el) {
      this.syncPropsToElement();
      this.schedulePaginationSync();
    }
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  private setupEventListeners(): void {
    const el = this.el;
    if (!el) return;

    el.addEventListener('stateChange', this.handleStateChange);
    el.addEventListener('viewModeChange', this.handleViewModeChange);
    el.addEventListener('paginationChange', this.handlePaginationChange);
  }

  private removeEventListeners(): void {
    const el = this.el;
    if (!el) return;

    el.removeEventListener('stateChange', this.handleStateChange);
    el.removeEventListener('viewModeChange', this.handleViewModeChange);
    el.removeEventListener('paginationChange', this.handlePaginationChange);
  }

  private handleStateChange = (event: Event): void => {
    const customEvent = event as CustomEvent<PivotTableState<PivotDataRecord>>;
    this.stateChange.emit(customEvent.detail);
    // Schedule pagination sync to run after internal state settles
    this.schedulePaginationSync();
  };

  private handleViewModeChange = (event: Event): void => {
    const customEvent = event as CustomEvent<{ mode: 'raw' | 'processed' }>;
    this.viewModeChange.emit(customEvent.detail);
  };

  private handlePaginationChange = (event: Event): void => {
    const customEvent = event as CustomEvent<PaginationConfig>;
    if (customEvent?.detail) {
      this.lastPagination = customEvent.detail;
    }
    this.paginationChange.emit(customEvent.detail);
  };

  private syncPropsToElement(): void {
    const el = this.el;
    if (!el) return;

    // Set attributes for proper serialization
    if (this.mode !== undefined) {
      el.setAttribute('mode', this.mode);
    }

    if (this.data !== undefined) {
      const dataAttr = toJsonAttr(this.data);
      if (dataAttr) el.setAttribute('data', dataAttr);
      if (
        typeof customElements !== 'undefined' &&
        customElements.get('pivot-head')
      ) {
        el.data = this.data;
      }
    } else {
      el.removeAttribute('data');
    }

    if (this.options !== undefined) {
      const optionsAttr = toJsonAttr(this.options);
      if (optionsAttr) el.setAttribute('options', optionsAttr);
      if (
        typeof customElements !== 'undefined' &&
        customElements.get('pivot-head')
      ) {
        el.options = this.options;
      }
    } else {
      el.removeAttribute('options');
    }

    if (this.filters !== undefined) {
      const filtersAttr = toJsonAttr(this.filters);
      if (filtersAttr) el.setAttribute('filters', filtersAttr);
      if (
        typeof customElements !== 'undefined' &&
        customElements.get('pivot-head')
      ) {
        el.filters = this.filters;
      }
    } else {
      el.removeAttribute('filters');
    }

    if (this.pagination !== undefined) {
      const paginationAttr = toJsonAttr(this.pagination);
      if (paginationAttr) el.setAttribute('pagination', paginationAttr);
      if (
        typeof customElements !== 'undefined' &&
        customElements.get('pivot-head')
      ) {
        el.pagination = {
          ...(el.pagination || { currentPage: 1, pageSize: 10, totalPages: 1 }),
          ...this.pagination,
        } as PaginationConfig;
      }
    } else {
      el.removeAttribute('pagination');
    }
  }

  private emitInitialPagination(): void {
    try {
      const current = this.el?.getPagination?.();
      if (current) {
        this.lastPagination = current;
        this.paginationChange.emit(current);
      }
    } catch {
      // no-op
    }
  }

  private emitPaginationIfChanged(): void {
    const el = this.el;
    if (!el) return;

    try {
      const pag = el.getPagination?.();
      if (!pag) return;

      const last = this.lastPagination;
      if (
        !last ||
        last.currentPage !== pag.currentPage ||
        last.pageSize !== pag.pageSize ||
        last.totalPages !== pag.totalPages
      ) {
        this.lastPagination = pag;
        this.paginationChange.emit(pag);
      }
    } catch {
      // no-op
    }
  }

  private schedulePaginationSync(): void {
    // Use microtask; fallback to macrotask if necessary
    Promise.resolve().then(() => this.emitPaginationIfChanged());
  }
}
