export interface AxisConfig {
  [key: string]: unknown;
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
  grouper: (item: DataRecord, fields: string[]) => string;
}

// Define the structure for a group
export interface Group {
  key: string;
  items: DataRecord[];
  subgroups?: Group[];
  aggregates: { [key: string]: number };
  level?: number;
  uniqueName?: string;
  caption?: string;
}

/** A single cell value in a pivot table row (raw or formatted) */
export type CellValue = string | number | boolean | null | Date;

// Data formatting configuration
export interface FormatOptions {
  type: 'currency' | 'number' | 'percentage' | 'date';
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

/** Scalar or range value used by FilterConfig operators */
export type FilterValue =
  | string
  | number
  | readonly [string | number, string | number];

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: FilterValue;
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export type DataHandlingMode = 'raw' | 'processed';

export interface PivotTableState<T> {
  data: T[];
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
  cellFormats?: Map<string, CellFormatConfig>;
  selectedCells?: Set<string>;
  customRowOrder?: FieldOrder;
  customColumnOrder?: FieldOrder;
  customRegionOrder?: string[];
}

export interface PivotTableConfig<T> {
  data: T[];
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
  formula?: (item: DataRecord) => number;
  sortabled?: boolean;
}

export interface ProcessedData {
  headers: string[];
  rows: CellValue[][];
  totals: Record<string, number>;
}

export interface ProcessedDataResult<T> {
  rawData: T[];
  groups: Group[];
}

// Pivot data structure
export interface PivotData {
  [key: string]: string | number;
}

export type Row = {
  [key: string]: unknown;
};

export type Config = {
  columns: Column[];
  data: Row[];
};

export interface CellFormatConfig {
  // Text formatting
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;

  // Number formatting
  chooseValue?: 'none' | 'currency' | 'number' | 'percentage' | 'text' | 'date';
  thousandSeparator?: string;
  decimalSeparator?: string;
  decimalPlaces?: number;

  // Currency formatting
  currencySymbol?: string;
  currencyAlign?: 'left' | 'right';

  // Special formatting
  nullValue?: string;
  formatAsPercent?: boolean;
}

export interface CellPosition {
  row: number;
  col: number;
  field?: string;
}

export interface LayoutSelection {
  rows: string[]; // field names
  columns: string[]; // field names
  values: Array<{
    field: string;
    aggregation?: AggregationType;
    caption?: string;
  }>;
}

// ── WASM interfaces (from WasmLoader / WasmCSVProcessor) ──

export interface WasmCSVResult {
  rowCount: number;
  colCount: number;
  errorCode: number;
  errorMessage: string;
}

export interface WasmModule {
  parseCSVChunk(
    input: string,
    delimiter?: number,
    hasHeader?: boolean,
    trimValues?: boolean
  ): WasmCSVResult;
  extractField(
    input: string,
    start: number,
    end: number,
    trimValues: boolean
  ): string;
  parseNumber(input: string): number;
  detectFieldType(value: string): number;
  estimateMemory(rowCount: number, colCount: number): number;
  getVersion(): string;
  benchmark(input: string): number;
}

/** Raw pointer-level exports from the instantiated AssemblyScript WASM binary */
export interface WasmExports {
  parseCSVChunk(
    inputPtr: number,
    delimiter: number,
    hasHeader: number,
    trimValues: number
  ): number;
  getLastRowCount(): number;
  getLastColCount(): number;
  getLastErrorMessage(): number;
  extractField(
    inputPtr: number,
    start: number,
    end: number,
    trimValues: number
  ): number;
  parseNumber(inputPtr: number): number;
  detectFieldType(inputPtr: number): number;
  estimateMemory(rowCount: number, colCount: number): number;
  getVersion(): number;
  benchmark(inputPtr: number): number;
  __newString(value: string): number;
  __getString(ptr: number): string;
  __release?: () => void;
}

/** Instantiated AssemblyScript WASM module returned by the loader */
export interface WasmInstance {
  exports: WasmExports;
}

/** Import object required by the AssemblyScript WASM module at instantiation */
export interface WasmImports {
  env: {
    abort: (msg: number, file: number, line: number, column: number) => void;
  };
}

/** The instantiate function provided by \@assemblyscript/loader */
export type WasmInstantiateFunction = (
  source: BufferSource | WebAssembly.Module,
  imports?: WasmImports
) => Promise<WasmInstance>;

export interface WasmProcessOptions {
  delimiter?: string;
  hasHeader?: boolean;
  trimValues?: boolean;
  skipEmptyLines?: boolean;
  /** Pre-detected headers to use when hasHeader is false (e.g. non-first streaming chunks) */
  providedHeaders?: string[];
}

export interface WasmProcessResult {
  success: boolean;
  data: Record<string, unknown>[];
  headers?: string[];
  rowCount: number;
  colCount: number;
  parseTime: number;
  error?: string;
}

// ── Performance interfaces (from PerformanceConfig) ──

export interface PerformanceThresholds {
  // Worker thresholds
  useWorkersAboveSize: number;
  useWorkersAboveRows: number;

  // WASM thresholds
  useWasmAboveSize: number;
  useWasmAboveRows: number;

  // UI interaction thresholds
  maxRowsForDragDrop: number;
  maxRowsForFullRender: number;
  defaultPageSize: number;
  maxPageSize: number;

  // Sampling thresholds
  sampleThreshold: number;
  sampleSize: number;

  // Virtual scrolling configuration
  enableVirtualScroll: boolean;
  virtualScrollThreshold: number;
  virtualScrollRowHeight: number;
  virtualScrollBuffer: number;
}

// ── Field service interfaces (from fieldService) ──

export type FieldType =
  | 'string'
  | 'number'
  | 'date'
  | 'boolean'
  | 'null'
  | 'unknown';

export interface FieldInfo {
  name: string;
  type: FieldType;
}

// ── Virtual scroll interfaces (from VirtualScrollManager) ──

export interface VirtualScrollConfig {
  container: HTMLElement;
  data: Record<string, unknown>[];
  rowHeight?: number;
  bufferSize?: number;
  renderRow: (item: Record<string, unknown>, index: number) => HTMLElement;
  renderHeader?: () => HTMLElement;
  onVisibleRangeChange?: (start: number, end: number) => void;
  onDragDrop?: (fromIndex: number, toIndex: number) => void;
}

export interface VisibleRange {
  start: number;
  end: number;
}

// ── Logger interfaces (from logger) ──

export type LogMethod = (message: string, ...meta: unknown[]) => void;

export interface PivotLogger {
  error: LogMethod;
  warn: LogMethod;
  info: LogMethod;
  debug: LogMethod;
}

// ── Streaming / Worker interfaces (from StreamingFileReader, WorkerPool, csv-parser.worker) ──

export interface ChunkInfo {
  chunkId: number;
  text: string;
  isFirstChunk: boolean;
  isLastChunk: boolean;
  progress: number;
}

export interface StreamingOptions {
  chunkSizeBytes?: number;
  onChunk?: (chunk: ChunkInfo) => void | Promise<void>;
  onProgress?: (progress: number) => void;
  encoding?: string;
  /** AbortSignal to cancel streaming early (e.g. when enough rows collected) */
  signal?: AbortSignal;
}

export interface WorkerTask {
  id: number;
  data: unknown;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

export interface WorkerInstance {
  worker: Worker;
  busy: boolean;
  currentTaskId?: number;
}

export interface ParseChunkMessage {
  type: 'PARSE_CHUNK';
  chunkId: number;
  text: string;
  isFirstChunk: boolean;
  isLastChunk: boolean;
  delimiter: string;
  headers?: string[];
  leftover?: string;
}

export interface ParseResultMessage {
  type: 'CHUNK_PARSED';
  chunkId: number;
  data: Record<string, unknown>[];
  headers?: string[];
  leftover?: string;
  rowCount: number;
  error?: string;
}

export interface ProgressMessage {
  type: 'PROGRESS';
  chunkId: number;
  progress: number;
}

// ── Connect service interfaces (from connectService) ──

/** A single row of parsed data (CSV/JSON), keyed by column name */
export type DataRecord = Record<string, unknown>;

export interface AutoLayoutResult {
  rows: AxisConfig[];
  columns: AxisConfig[];
  measures: MeasureConfig[];
  data: DataRecord[];
  columnsList: string[];
}

export interface FileConnectionResult {
  success: boolean;
  data?: DataRecord[];
  fileName?: string;
  fileSize?: number;
  recordCount?: number;
  columns?: string[];
  error?: string;
  validationErrors?: string[];
  performanceMode?: 'standard' | 'workers' | 'wasm' | 'streaming-wasm';
  allowDragDrop?: boolean;
  requiresPagination?: boolean;
  parseTime?: number;
}

export interface CSVParseOptions {
  delimiter?: string;
  hasHeader?: boolean;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  encoding?: string;
}

export interface JSONParseOptions {
  arrayPath?: string;
  validateSchema?: boolean;
}

/** Stores a custom field ordering created by drag-and-drop or programmatic reorder */
export interface FieldOrder {
  fieldName: string;
  order: string[];
}

export interface ConnectionOptions {
  csv?: CSVParseOptions;
  json?: JSONParseOptions;
  maxFileSize?: number;
  maxRecords?: number;
  onProgress?: (progress: number) => void;
  useWorkers?: boolean;
  workerCount?: number;
  chunkSizeBytes?: number;
}
