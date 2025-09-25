import type {
  FilterConfig,
  PaginationConfig,
  Measure,
  Dimension,
  GroupConfig,
  AggregationType,
  Group,
  MeasureConfig,
  PivotEngine,
  PivotTableState,
  AxisConfig,
} from '@mindfiredigital/pivothead';

// Define a type for pivot data records
export type PivotDataRecord = Record<string, unknown>;

// FormatOptions interface for field formatting
export interface FormatOptions {
  type?: 'currency' | 'number' | 'percentage' | 'date';
  currency?: string;
  locale?: string;
  decimals?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;
  align?: 'left' | 'right' | 'center';
  currencyAlign?: 'left' | 'right';
  nullValue?: string | null;
  percent?: boolean;
}

// Enhanced interface extending PivotEngine with additional methods (superset)
// Supports both legacy and current method signatures used across the web-component
export interface EnhancedPivotEngine<T extends Record<string, unknown>>
  extends PivotEngine<T> {
  // state helpers
  state: PivotTableState<T>;
  subscribe(fn: (state: PivotTableState<T>) => void): () => void;

  // filtering
  applyFilters(filters: FilterConfig[]): void;
  getFilterState(): FilterConfig[];

  // measures/dimensions (overloads to support Measure and MeasureConfig)
  setMeasures(measures: Measure[]): void;
  setMeasures(measures: MeasureConfig[]): void;
  setDimensions(dimensions: Dimension[]): void;

  // grouping/aggregation
  setGroupConfig(config: GroupConfig | null): void;
  setAggregation(type: AggregationType): void;

  // sorting
  sort(field: string, direction: 'asc' | 'desc'): void;

  // formatting & data access
  formatValue(value: unknown, field: string): string;
  updateFieldFormatting(field: string, format: FormatOptions): void;
  getFieldAlignment(field: string): string;
  getGroupedData(): Group[];
  getOrderedColumnValues(): string[] | null;
  getOrderedRowValues(): string[] | null;
  // Allow UI to set a custom row/column order based on user sorting in processed mode
  setCustomFieldOrder(
    fieldName: string,
    order: string[],
    isRowField?: boolean
  ): void;

  // exporting/printing
  exportToHTML(fileName: string): void;
  exportToPDF(fileName: string): void;
  exportToExcel(fileName: string): void;
  openPrintDialog(): void;

  // dnd / structure
  dragRow(fromIndex: number, toIndex: number): void;
  dragColumn(fromIndex: number, toIndex: number): void;
  swapDataRows(fromIndex: number, toIndex: number): void;
  swapRawDataRows(fromIndex: number, toIndex: number): void;
  swapDataColumns(fromIndex: number, toIndex: number): void;
  setRowGroups(rowGroups: Group[]): void;
  setColumnGroups(columnGroups: Group[]): void;
  toggleRowExpansion(rowId: string): void;
  isRowExpanded(rowId: string): boolean;

  // pagination
  setPagination(config: PaginationConfig): void;
  getPagination(): PaginationConfig;
  getPaginationState(): PaginationConfig;

  // data handling modes & updates
  setDataHandlingMode(mode: 'raw' | 'processed'): void;
  getDataHandlingMode(): 'raw' | 'processed';
  updateDataSource(newData: T[]): void;

  // reset
  reset(): void;
}

// Define a type for pivot options used by the component
export interface PivotOptions {
  rows?: AxisConfig[];
  columns?: AxisConfig[];
  measures?: MeasureConfig[];
  groupConfig?: GroupConfig;
  [key: string]: unknown;
}

// File import interfaces
export interface FileImportResult {
  success: boolean;
  data?: PivotDataRecord[];
  fileName?: string;
  recordCount?: number;
  error?: string;
}

export interface ImportOptions {
  maxFileSize?: number;
  maxRecords?: number;
}
