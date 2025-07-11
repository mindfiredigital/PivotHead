export interface AxisConfig {
  uniqueName: string;
  caption?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DataSourceConfig {
  type: 'local' | 'remote' | 'file';
  url?: string; // For remote data source
  file?: File; // For file data source
}
export interface Column {
  field: string;
  label: string;
  type?: 'string' | 'number' | 'date';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  type?: 'measure' | 'dimension';
  aggregation?: AggregationType;
}

export interface RowSize {
  index: number;
  height: number;
}

// Define the structure for expanded rows
export interface ExpandedState {
  [key: string]: boolean;
}

// Define the configuration for grouping
export interface GroupConfig {
  rowFields: string[];
  columnFields: string[];
  grouper: (item: any, fields: string[]) => string;
}

// Define the structure for a group
export interface Group {
  key: string;
  items: any[];
  subgroups?: Group[];
  aggregates: { [key: string]: number };
  level?: number;
}

// Data formatting configuration
export interface FormatOptions {
  type: 'currency' | 'number' | 'percentage' | 'date';
  locale?: string;
  currency?: string;
  decimals?: number;
  dateFormat?: string;
}

// Supported aggregation types
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

// Measure definition
export interface Measure {
  field: string;
  label: string;
  type: 'number';
  format?: FormatOptions;
  aggregation?: AggregationType;
}

// Dimension definition
export interface Dimension {
  field: string;
  label: string;
  type: 'string' | 'date';
  format?: FormatOptions;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export type DataHandlingMode = 'raw' | 'processed';

export interface PivotTableState<T> {
  data: any;
  dataHandlingMode: DataHandlingMode;
  rawData: T[];
  processedData: ProcessedData;
  sortConfig: SortConfig[];
  rows: AxisConfig[];
  columns: AxisConfig[];
  measures: MeasureConfig[];
  rowSizes: RowSize[];
  expandedRows: ExpandedState;
  groupConfig: GroupConfig | null;
  groups: Group[];
  selectedMeasures: MeasureConfig[];
  selectedDimensions: Dimension[];
  selectedAggregation: AggregationType;
  formatting: { [key: string]: FormatOptions };
  columnWidths: { [key: string]: number };
  isResponsive: boolean;
  rowGroups: Group[];
  columnGroups: Group[];
  filterConfig: FilterConfig[];
  paginationConfig: PaginationConfig;
}

export interface PivotTableConfig<T> {
  data: any;
  rawData: T[];
  dataSource?: DataSourceConfig;
  rows: AxisConfig[];
  columns: AxisConfig[];
  measures: MeasureConfig[];
  dimensions: Dimension[];
  groupConfig?: GroupConfig | null;
  formatting?: { [key: string]: FormatOptions };
  defaultAggregation: AggregationType;
  isResponsive?: boolean;
  initialSort?: SortConfig[];
  pageSize?: number;
  // onRowDragEnd?: (fromIndex: number, toIndex: number, newData: T[]) => void;
  onRowDragEnd?: (
    fromIndex: number,
    toIndex: number,
    newOrder: Group[]
  ) => void;
  onColumnDragEnd?: (
    fromIndex: number,
    toIndex: number,
    newColumns: { uniqueName: string; caption: string }[]
  ) => void;
}

export interface MeasureConfig {
  uniqueName: string;
  caption?: string;
  aggregation: AggregationType;
  format?: FormatOptions;
  formula?: (item: any) => number;
  sortabled?: boolean;
}

export interface ProcessedData {
  headers: string[];
  rows: any[][];
  totals: Record<string, number>;
}

export interface ProcessedDataResult<T> {
  rawData: T[];
  groups: Group[];
}

// Chart types supported
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

// Pivot data structure
export interface PivotData {
  [key: string]: string | number;
}

export type Row = {
  [key: string]: any;
};

export type Config = {
  columns: Column[];
  data: Row[];
};
