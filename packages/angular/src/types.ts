// Type definitions for the PivotHead Angular wrapper

export type PivotDataRecord = Record<string, unknown>;

export interface PivotOptions {
  rows?: unknown[];
  columns?: unknown[];
  measures?: unknown[];
  groupConfig?: unknown;
  [key: string]: unknown;
}

export type FilterConfig = unknown;

export interface FormatOptions {
  type?: 'currency' | 'number' | 'percentage' | 'date';
  decimals?: number;
  decimalSeparator?: string;
  thousandSeparator?: string;
  currency?: string;
  currencyAlign?: 'left' | 'right';
  percent?: boolean;
  align?: 'left' | 'right' | 'center';
  nullValue?: string | null;
  [key: string]: unknown;
}

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
export type PivotHeadEl = HTMLElement & {
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
  // Format-related methods
  formatValue(value: unknown, field: string): string;
  updateFieldFormatting(field: string, format: FormatOptions): void;
  getFieldAlignment(field: string): string;
  showFormatPopup(): void;
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

export interface PivotHeadProps {
  mode?: PivotHeadMode;
  className?: string;
  // Attributes/props
  data?: PivotDataRecord[];
  options?: PivotOptions;
  filters?: FilterConfig[];
  pagination?: Partial<PaginationConfig>;
}

export interface PivotHeadRef {
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
    // Format-related methods
    formatValue: (value: unknown, field: string) => string | undefined;
    updateFieldFormatting: (field: string, format: FormatOptions) => void;
    getFieldAlignment: (field: string) => string | undefined;
    showFormatPopup: () => void;
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
}
