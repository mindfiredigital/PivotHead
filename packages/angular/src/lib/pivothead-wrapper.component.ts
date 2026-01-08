import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
} from '@angular/core';

// This import registers the web component for the user automatically.
import '@mindfiredigital/pivothead-web-component';

// Import the full set of types for a great developer experience
import type {
  PivotHeadElement,
  PivotOptions,
  PivotDataRecord,
  FormatOptions,
  FilterConfig,
  PaginationConfig,
  PivotTableState,
  MeasureConfig,
  Dimension,
  GroupConfig,
  AggregationType,
  Group,
  ConnectionOptions,
  FileConnectionResult,
  FieldInfo,
  LayoutSelection,
} from '@mindfiredigital/pivothead-web-component';

@Component({
  selector: 'pivot-head-wrapper',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Allows the <pivot-head> tag in the template
  template: `
    <pivot-head #pivotHeadRef>
      <!-- Slot for header content in minimal mode -->
      <ng-content select="[slot=header]"></ng-content>
      <!-- Slot for body content in minimal mode -->
      <ng-content select="[slot=body]"></ng-content>
    </pivot-head>
  `,
})
export class PivotHeadWrapperComponent implements OnChanges, AfterViewInit {
  @ViewChild('pivotHeadRef')
  private pivotHeadRef!: ElementRef<PivotHeadElement>;

  // --- Inputs (Properties) ---
  @Input() data?: PivotDataRecord[];
  @Input() options?: PivotOptions;
  @Input() filters?: FilterConfig[];
  @Input() pagination?: PaginationConfig;
  @Input() mode: 'default' | 'minimal' | 'none' = 'default';

  // --- Outputs (Events) ---
  @Output() stateChange = new EventEmitter<PivotTableState<PivotDataRecord>>();
  @Output() viewModeChange = new EventEmitter<{ mode: 'raw' | 'processed' }>();
  @Output() paginationChange = new EventEmitter<PaginationConfig>();
  @Output() dataLoaded = new EventEmitter<{
    recordCount: number;
    fileSize?: number;
  }>();
  @Output() error = new EventEmitter<{ message: string; code?: string }>();

  ngAfterViewInit(): void {
    const el = this.pivotHeadRef.nativeElement;

    // Set mode first (before data/options) to avoid premature render
    if (this.mode) el.setAttribute('mode', this.mode);

    // Set initial values after view is initialized
    if (this.data) el.data = this.data;
    if (this.options) el.options = this.options;
    if (this.filters) el.filters = this.filters;
    if (this.pagination) el.pagination = this.pagination;

    el.addEventListener('stateChange', (event: Event) => {
      this.stateChange.emit((event as CustomEvent).detail);
    });
    el.addEventListener('viewModeChange', (event: Event) => {
      this.viewModeChange.emit((event as CustomEvent).detail);
    });
    el.addEventListener('paginationChange', (event: Event) => {
      this.paginationChange.emit((event as CustomEvent).detail);
    });
    el.addEventListener('dataLoaded', (event: Event) => {
      this.dataLoaded.emit((event as CustomEvent).detail);
    });
    el.addEventListener('error', (event: Event) => {
      this.error.emit((event as CustomEvent).detail);
    });
  }

  // Syncs Angular inputs with the web component's properties/attributes
  ngOnChanges(changes: SimpleChanges): void {
    const el = this.pivotHeadRef?.nativeElement;
    if (!el) return;

    // Use direct property assignment for complex data
    if (changes['data'] && this.data) el.data = this.data;
    if (changes['options'] && this.options) el.options = this.options;
    if (changes['filters'] && this.filters) el.filters = this.filters;
    if (changes['pagination'] && this.pagination)
      el.pagination = this.pagination;

    // Use setAttribute for simple string values like 'mode'
    if (changes['mode']) el.setAttribute('mode', this.mode);
  }

  // --- Public API Methods ---
  // Expose the web component's methods for users to call on the wrapper instance

  public getState = (): PivotTableState<PivotDataRecord> | undefined =>
    this.pivotHeadRef?.nativeElement.getState();
  public refresh = (): void => this.pivotHeadRef?.nativeElement.refresh();
  public reset = (): void => this.pivotHeadRef?.nativeElement.reset();
  public sort = (field: string, direction: 'asc' | 'desc'): void =>
    this.pivotHeadRef?.nativeElement.sort(field, direction);
  public setMeasures = (measures: MeasureConfig[]): void =>
    this.pivotHeadRef?.nativeElement.setMeasures(measures);
  public setDimensions = (dimensions: Dimension[]): void =>
    this.pivotHeadRef?.nativeElement.setDimensions(dimensions);
  public setGroupConfig = (config: GroupConfig | null): void =>
    this.pivotHeadRef?.nativeElement.setGroupConfig(config);
  public getFilters = (): FilterConfig[] | undefined =>
    this.pivotHeadRef?.nativeElement.getFilters();
  public getPagination = (): PaginationConfig | undefined =>
    this.pivotHeadRef?.nativeElement.getPagination();
  public getData = (): PivotDataRecord[] | undefined =>
    this.pivotHeadRef?.nativeElement.getData();
  public getProcessedData = (): unknown | undefined =>
    this.pivotHeadRef?.nativeElement.getProcessedData();
  public formatValue = (value: unknown, field: string): string | undefined =>
    this.pivotHeadRef?.nativeElement.formatValue(value, field);
  public updateFieldFormatting = (field: string, format: FormatOptions): void =>
    this.pivotHeadRef?.nativeElement.updateFieldFormatting(field, format);
  public getFieldAlignment = (field: string): string | undefined =>
    this.pivotHeadRef?.nativeElement.getFieldAlignment(field);
  public showFormatPopup = (): void =>
    this.pivotHeadRef?.nativeElement.showFormatPopup();
  public getGroupedData = (): Group[] | undefined =>
    this.pivotHeadRef?.nativeElement.getGroupedData();
  public swapRows = (from: number, to: number): void =>
    this.pivotHeadRef?.nativeElement.swapRows(from, to);
  public swapColumns = (from: number, to: number): void =>
    this.pivotHeadRef?.nativeElement.swapColumns(from, to);
  public previousPage = (): void =>
    this.pivotHeadRef?.nativeElement.previousPage();
  public nextPage = (): void => this.pivotHeadRef?.nativeElement.nextPage();
  public setPageSize = (size: number): void =>
    this.pivotHeadRef?.nativeElement.setPageSize(size);
  public goToPage = (page: number): void =>
    this.pivotHeadRef?.nativeElement.goToPage(page);
  public setViewMode = (mode: 'raw' | 'processed'): void =>
    this.pivotHeadRef?.nativeElement.setViewMode(mode);
  public getViewMode = (): 'raw' | 'processed' | undefined =>
    this.pivotHeadRef?.nativeElement.getViewMode();
  public exportToHTML = (fileName?: string): void =>
    this.pivotHeadRef?.nativeElement.exportToHTML(fileName);
  public exportToPDF = (fileName?: string): void =>
    this.pivotHeadRef?.nativeElement.exportToPDF(fileName);
  public exportToExcel = (fileName?: string): void =>
    this.pivotHeadRef?.nativeElement.exportToExcel(fileName);
  public openPrintDialog = (): void =>
    this.pivotHeadRef?.nativeElement.openPrintDialog();

  // --- Data Access Methods ---
  public getRawData = (): PivotDataRecord[] | undefined =>
    this.pivotHeadRef?.nativeElement.getRawData();

  // --- ConnectService Methods (File Import) ---
  public loadFromFile = async (file: File): Promise<void> =>
    this.pivotHeadRef?.nativeElement.loadFromFile(file);
  public loadFromUrl = async (url: string): Promise<void> =>
    this.pivotHeadRef?.nativeElement.loadFromUrl(url);
  public connectToLocalCSV = async (
    options?: ConnectionOptions
  ): Promise<FileConnectionResult | undefined> =>
    this.pivotHeadRef?.nativeElement.connectToLocalCSV(options);
  public connectToLocalJSON = async (
    options?: ConnectionOptions
  ): Promise<FileConnectionResult | undefined> =>
    this.pivotHeadRef?.nativeElement.connectToLocalJSON(options);
  public connectToLocalFile = async (
    options?: ConnectionOptions
  ): Promise<FileConnectionResult | undefined> =>
    this.pivotHeadRef?.nativeElement.connectToLocalFile(options);

  // --- Field Introspection Methods ---
  public getAvailableFields = (): FieldInfo[] | undefined =>
    this.pivotHeadRef?.nativeElement.getAvailableFields();
  public getSupportedAggregations = (): AggregationType[] | undefined =>
    this.pivotHeadRef?.nativeElement.getSupportedAggregations();
  public setMeasureAggregation = (
    field: string,
    aggregation: AggregationType
  ): void =>
    this.pivotHeadRef?.nativeElement.setMeasureAggregation(field, aggregation);
  public buildLayout = (selection: LayoutSelection): void =>
    this.pivotHeadRef?.nativeElement.buildLayout(selection);

  // --- Drag & Drop API Methods ---
  public dragRow = (fromIndex: number, toIndex: number): void =>
    this.pivotHeadRef?.nativeElement.dragRow(fromIndex, toIndex);
  public dragColumn = (fromIndex: number, toIndex: number): void =>
    this.pivotHeadRef?.nativeElement.dragColumn(fromIndex, toIndex);
  public setDragAndDropEnabled = (enabled: boolean): void =>
    this.pivotHeadRef?.nativeElement.setDragAndDropEnabled(enabled);
  public isDragAndDropEnabled = (): boolean | undefined =>
    this.pivotHeadRef?.nativeElement.isDragAndDropEnabled();
}
