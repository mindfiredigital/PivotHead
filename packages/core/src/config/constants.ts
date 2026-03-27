export const ERROR_MESSAGES = {
  INVALID_PIVOT_DATA: 'Invalid pivot data provided',
  CHART_RENDERER_ERROR: 'Chart rendering failed',
  INVALID_CONTAINER: 'A valid container is required to render the chart',
};

export const ERROR_CODES = {
  INVALID_PIVOT_DATA: '1001',
  CHART_RENDER_ERROR: '1002',
  INVALID_CONTAINER: '1003',
};

// Logger label
export const LOGGER_LABEL = '@mindfiredigital/pivothead';

// File size thresholds (in bytes)
export const WORKERS_THRESHOLD = 1 * 1024 * 1024; // 1MB — use Web Workers above this
export const WASM_THRESHOLD = 5 * 1024 * 1024; // 5MB — use WASM above this
export const WASM_SAFETY_LIMIT = 8 * 1024 * 1024; // 8MB — WASM in-memory upper bound
export const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB — "large file" record limit

// Chunk sizes for streaming (in bytes)
export const CHUNK_SIZE_256KB = 256 * 1024;
export const CHUNK_SIZE_1MB = 1 * 1024 * 1024;
export const CHUNK_SIZE_2MB = 2 * 1024 * 1024;
export const CHUNK_SIZE_4MB = 4 * 1024 * 1024;
export const CHUNK_SIZE_5MB = 5 * 1024 * 1024;
export const CHUNK_MEDIUM_UPPER = 10 * 1024 * 1024; // upper bound for medium chunk selection
export const CHUNK_LARGE_UPPER = 100 * 1024 * 1024; // upper bound for large chunk selection

// Dimension cardinality limit for auto-layout detection
export const MAX_CARDINALITY_FOR_DIMENSIONS = 100;

// Common field name patterns for auto-layout dimension detection
export const COMMON_ROW_FIELDS = [
  'region',
  'country',
  'state',
  'city',
  'category',
  'department',
];

export const COMMON_COLUMN_FIELDS = [
  'product',
  'item',
  'month',
  'quarter',
  'year',
  'type',
];

// Virtual scroll defaults
export const VIRTUAL_SCROLL_DEFAULT_ROW_HEIGHT = 40; // px
export const VIRTUAL_SCROLL_DEFAULT_BUFFER_SIZE = 10; // extra rows for smooth scrolling
export const VIRTUAL_SCROLL_HEADER_OFFSET = 50; // px added to spacer height for header
export const VIRTUAL_SCROLL_STICKY_Z_INDEX = 10;
export const VIRTUAL_SCROLL_HEADER_BG = '#f8f9fa';
