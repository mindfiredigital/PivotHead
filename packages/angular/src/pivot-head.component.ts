import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  OnChanges,
  TemplateRef,
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

@Component({
  selector: 'pivot-head-angular',
  template: `
    <pivot-head
      #pivotElement
      [attr.mode]="mode"
      [attr.data]="dataAttr"
      [attr.options]="optionsAttr"
      [attr.filters]="filtersAttr"
      [attr.pagination]="paginationAttr"
      [class]="className || classAttr || ''"
      [ngStyle]="hostStyle || styleAttr || {}"
    >
      <ng-container *ngIf="mode === 'minimal'">
        <div *ngIf="headerTemplate" slot="header">
          <ng-container [ngTemplateOutlet]="headerTemplate"></ng-container>
        </div>
        <ng-content select="[slot='header']"></ng-content>
        <div *ngIf="bodyTemplate" slot="body">
          <ng-container [ngTemplateOutlet]="bodyTemplate"></ng-container>
        </div>
        <ng-content select="[slot='body']"></ng-content>
      </ng-container>
    </pivot-head>
  `,
})
export class PivotHeadComponent
  implements OnInit, OnDestroy, OnChanges, PivotHeadRef
{
  @ViewChild('pivotElement', { static: false, read: ElementRef })
  private elementRef!: ElementRef<PivotHeadEl>;

  // Inputs matching React props
  @Input() mode: PivotHeadMode = 'default';
  @Input() className?: string;
  @Input('class') classAttr?: string;
  @Input() hostStyle?: Record<string, unknown>;
  @Input('style') styleAttr?: Record<string, unknown>;
  @Input() data?: PivotDataRecord[];
  @Input() options?: PivotOptions;
  @Input() filters?: FilterConfig[];
  @Input() pagination?: Partial<PaginationConfig>;

  // Template inputs for minimal mode slots
  @Input() headerTemplate?: TemplateRef<unknown>;
  @Input() bodyTemplate?: TemplateRef<unknown>;

  // Event outputs
  @Output() stateChange = new EventEmitter<PivotTableState<PivotDataRecord>>();
  @Output() viewModeChange = new EventEmitter<{ mode: 'raw' | 'processed' }>();
  @Output() paginationChange = new EventEmitter<PaginationConfig>();

  // Track last known pagination to emit changes when state changes
  private lastPagination?: PaginationConfig;

  // Track when the custom element is defined to avoid setter shadowing
  private elDefined = false;
  private elDefinedPromise: Promise<void> | null = null;
  private upgradePromise?: Promise<void>;

  // Ensure the web component is defined only in the browser
  private async ensureElementDefined(): Promise<void> {
    try {
      if (typeof window === 'undefined') return; // SSR guard
      if (typeof customElements === 'undefined') return;
      if (customElements.get('pivot-head')) return;
      await import('@mindfiredigital/pivothead-web-component');
    } catch {
      // no-op: avoid breaking SSR
    }
  }

  private whenElDefined(): Promise<void> {
    if (this.elDefined) return Promise.resolve();
    if (!this.elDefinedPromise) {
      this.elDefinedPromise = (
        typeof customElements !== 'undefined'
          ? customElements.whenDefined('pivot-head')
          : Promise.resolve()
      ).then(() => {
        this.elDefined = true;
        this.upgradeElementProperties();
        // After upgrade, push latest props
        this.syncPropsToElement();
        this.schedulePaginationSync();
        // this.cdr.markForCheck(); // removed
      });
    }
    return this.elDefinedPromise;
  }

  private upgradeElementProperties(): void {
    const el = this.el as unknown as PivotHeadEl & Record<string, unknown>;
    if (!el) return;
    const props = ['data', 'options', 'filters', 'pagination'] as const;
    for (const prop of props) {
      if (Object.prototype.hasOwnProperty.call(el, prop)) {
        const value = (el as Record<string, unknown>)[prop];
        // delete then re-assign to trigger setter after definition
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (el as Record<string, unknown>)[prop];
        (el as Record<string, unknown>)[prop] = value;
      }
    }
  }

  // Computed attributes for the custom element
  get dataAttr(): string | undefined {
    return this.data !== undefined ? toJsonAttr(this.data) : undefined;
  }

  get optionsAttr(): string | undefined {
    return this.options !== undefined ? toJsonAttr(this.options) : undefined;
  }

  get filtersAttr(): string | undefined {
    return this.filters !== undefined ? toJsonAttr(this.filters) : undefined;
  }

  get paginationAttr(): string | undefined {
    return this.pagination !== undefined
      ? toJsonAttr(this.pagination)
      : undefined;
  }

  // Expose the underlying element
  get el(): PivotHeadEl | null {
    return this.elementRef?.nativeElement || null;
  }

  // Expose methods from the web component via a grouped object (parity with React)
  get methods(): PivotHeadRef['methods'] {
    const el = this.el;
    return {
      getState: () => el?.getState?.(),
      refresh: () => el?.refresh?.(),
      sort: (f, d) => el?.sort?.(f, d),
      setMeasures: m => el?.setMeasures?.(m),
      setDimensions: d => el?.setDimensions?.(d),
      setGroupConfig: c => el?.setGroupConfig?.(c),
      getFilters: () => el?.getFilters?.(),
      getPagination: () => el?.getPagination?.(),
      getData: () => el?.getData?.(),
      getProcessedData: () => el?.getProcessedData?.(),
      // Format-related methods
      formatValue: (value: unknown, field: string) =>
        el?.formatValue?.(value, field),
      updateFieldFormatting: (field: string, format) =>
        el?.updateFieldFormatting?.(field, format),
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

  // Convenience: expose direct method wrappers for Angular consumers
  getState(): PivotTableState<PivotDataRecord> | undefined {
    return this.el?.getState?.();
  }
  refresh(): void {
    this.el?.refresh?.();
  }
  sort(field: string, direction: 'asc' | 'desc'): void {
    this.el?.sort?.(field, direction);
  }
  setMeasures(measures: MeasureConfig[]): void {
    this.el?.setMeasures?.(measures);
  }
  setDimensions(dimensions: Dimension[]): void {
    this.el?.setDimensions?.(dimensions);
  }
  setGroupConfig(config: GroupConfig | null): void {
    this.el?.setGroupConfig?.(config);
  }
  getFilters(): FilterConfig[] | undefined {
    return this.el?.getFilters?.();
  }
  getPagination(): PaginationConfig | undefined {
    return this.el?.getPagination?.();
  }
  getData(): PivotDataRecord[] | undefined {
    return this.el?.getData?.();
  }
  getProcessedData(): unknown {
    return this.el?.getProcessedData?.();
  }
  formatValue(value: unknown, field: string): string | undefined {
    return this.el?.formatValue?.(value, field);
  }
  updateFieldFormatting(field: string, format: FormatOptions): void {
    this.el?.updateFieldFormatting?.(field, format);
  }
  getFieldAlignment(field: string): string | undefined {
    return this.el?.getFieldAlignment?.(field);
  }
  showFormatPopup(): void {
    this.el?.showFormatPopup?.();
  }
  getGroupedData(): unknown[] | undefined {
    return this.el?.getGroupedData?.();
  }
  swapRows(fromIndex: number, toIndex: number): void {
    this.el?.swapRows?.(fromIndex, toIndex);
  }
  swapColumns(fromIndex: number, toIndex: number): void {
    this.el?.swapColumns?.(fromIndex, toIndex);
  }
  previousPage(): void {
    this.el?.previousPage?.();
  }
  nextPage(): void {
    this.el?.nextPage?.();
  }
  setPageSize(size: number): void {
    this.el?.setPageSize?.(size);
  }
  goToPage(page: number): void {
    this.el?.goToPage?.(page);
  }
  setViewMode(mode: 'raw' | 'processed'): void {
    this.el?.setViewMode?.(mode);
  }
  getViewMode(): 'raw' | 'processed' | undefined {
    return this.el?.getViewMode?.();
  }
  exportToHTML(fileName?: string): void {
    this.el?.exportToHTML?.(fileName);
  }
  exportToPDF(fileName?: string): void {
    this.el?.exportToPDF?.(fileName);
  }
  exportToExcel(fileName?: string): void {
    this.el?.exportToExcel?.(fileName);
  }
  openPrintDialog(): void {
    this.el?.openPrintDialog?.();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.ensureElementDefined();
    this.setupEventListeners();
    this.ensureUpgradeAndSync();
    this.emitInitialPagination();
  }

  ngOnInit(): void {
    // No element access/setup here
  }

  ngOnChanges(): void {
    if (this.el) {
      this.ensureUpgradeAndSync();
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
    // this.cdr.markForCheck(); // removed
    // Schedule pagination sync to run after internal state settles
    this.schedulePaginationSync();
  };

  private handleViewModeChange = (event: Event): void => {
    const customEvent = event as CustomEvent<{ mode: 'raw' | 'processed' }>;
    this.viewModeChange.emit(customEvent.detail);
    // this.cdr.markForCheck(); // removed
  };

  private handlePaginationChange = (event: Event): void => {
    const customEvent = event as CustomEvent<PaginationConfig>;
    if (customEvent?.detail) {
      this.lastPagination = customEvent.detail;
    }
    this.paginationChange.emit(customEvent.detail);
    // this.cdr.markForCheck(); // removed
  };

  private syncPropsToElement(): void {
    const el = this.el;
    if (!el) return;

    // Ensure mode attribute is present (web component reads attribute)
    if (this.mode !== undefined) {
      el.setAttribute('mode', this.mode);
    }

    // If element class is not yet upgraded, avoid setting props directly.
    const isDefined =
      typeof customElements !== 'undefined' &&
      !!customElements.get('pivot-head');
    if (!isDefined) return; // attributes from the template will be parsed after upgrade

    // Use setters after upgrade to initialize engine properly
    if (this.data !== undefined) {
      el.data = this.data;
    }
    if (this.options !== undefined) {
      el.options = this.options;
    }
    if (this.filters !== undefined) {
      el.filters = this.filters;
    }
    if (this.pagination !== undefined) {
      el.pagination = {
        ...(el.pagination || { currentPage: 1, pageSize: 10, totalPages: 1 }),
        ...this.pagination,
      } as PaginationConfig;
    }
  }

  private ensureUpgradeAndSync(): void {
    const el = this.el;
    if (!el) return;

    // Always set mode attribute upfront
    if (this.mode !== undefined) {
      el.setAttribute('mode', this.mode);
    }

    const hasCE = typeof customElements !== 'undefined';
    if (!hasCE) {
      // On SSR we only rely on attributes; sync will occur in browser
      return;
    }

    if (customElements.get('pivot-head')) {
      // Element already defined; make sure no pre-upgrade own-props shadow setters
      ['data', 'options', 'filters', 'pagination'].forEach(k => {
        if (Object.prototype.hasOwnProperty.call(el, k)) {
          try {
            delete (el as unknown as Record<string, unknown>)[
              k as keyof Record<string, unknown>
            ];
          } catch (e) {
            // best-effort cleanup to ensure accessors are active
          }
        }
      });
      this.syncPropsToElement();
      return;
    }

    if (!this.upgradePromise) {
      this.upgradePromise = customElements
        .whenDefined('pivot-head')
        .then(() => {
          // Remove any pre-upgrade own-properties so accessors work
          ['data', 'options', 'filters', 'pagination'].forEach(k => {
            if (Object.prototype.hasOwnProperty.call(el, k)) {
              try {
                delete (el as unknown as Record<string, unknown>)[
                  k as keyof Record<string, unknown>
                ];
              } catch (e) {
                // best-effort cleanup to ensure accessors are active
              }
            }
          });
          this.syncPropsToElement();
          // this.cdr.markForCheck(); // removed
        });
    }
  }

  private emitInitialPagination(): void {
    try {
      const current = this.el?.getPagination?.();
      if (current) {
        this.lastPagination = current;
        this.paginationChange.emit(current);
        // this.cdr.markForCheck(); // removed
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
        // this.cdr.markForCheck(); // removed
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
