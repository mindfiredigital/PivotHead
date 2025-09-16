import { vi } from 'vitest';
import type {
  PivotDataRecord,
  PivotOptions,
  FilterConfig,
  PaginationConfig,
  PivotTableState,
  MeasureConfig,
  Dimension,
  GroupConfig,
  FormatOptions,
} from '../types';

// Mock the web component import
vi.mock('@mindfiredigital/pivothead-web-component', () => ({}));

// Mock PivotHead custom element
class MockPivotHeadElement extends HTMLElement {
  private _data: PivotDataRecord[] = [];
  private _options: PivotOptions = {};
  private _filters: FilterConfig[] = [];
  private _pagination: PaginationConfig = {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  };
  private _viewMode: 'raw' | 'processed' = 'processed';

  constructor() {
    super();
    // Add proper event handling and methods setup
    this._setupMethods();
  }

  private _setupMethods() {
    this.getState = vi.fn().mockReturnValue({
      data: this._data,
      rawData: this._data,
      processedData: this._data,
      options: this._options,
      rows: this._options.rows || [],
      columns: this._options.columns || [],
      measures: this._options.measures || [],
    });

    this.getData = vi.fn().mockReturnValue(this._data);
    this.getProcessedData = vi.fn().mockReturnValue(this._data);
    this.getGroupedData = vi.fn().mockReturnValue([]);
    this.getPagination = vi.fn().mockReturnValue(this._pagination);
    this.getViewMode = vi.fn().mockReturnValue(this._viewMode);
    this.getFilters = vi.fn().mockReturnValue(this._filters);

    this.setViewMode = vi
      .fn()
      .mockImplementation((mode: 'raw' | 'processed') => {
        this._viewMode = mode;
        this.dispatchEvent(
          new CustomEvent('viewModeChange', { detail: { mode } })
        );
      });

    this.nextPage = vi.fn().mockImplementation(() => {
      if (this._pagination.currentPage < this._pagination.totalPages) {
        this._pagination.currentPage++;
        this.dispatchEvent(
          new CustomEvent('paginationChange', { detail: this._pagination })
        );
      }
    });

    this.previousPage = vi.fn().mockImplementation(() => {
      if (this._pagination.currentPage > 1) {
        this._pagination.currentPage--;
        this.dispatchEvent(
          new CustomEvent('paginationChange', { detail: this._pagination })
        );
      }
    });

    this.setPageSize = vi.fn().mockImplementation((size: number) => {
      this._pagination.pageSize = size;
      this.dispatchEvent(
        new CustomEvent('paginationChange', { detail: this._pagination })
      );
    });

    this.goToPage = vi.fn().mockImplementation((page: number) => {
      this._pagination.currentPage = page;
      this.dispatchEvent(
        new CustomEvent('paginationChange', { detail: this._pagination })
      );
    });

    // Add other mock methods
    this.refresh = vi.fn();
    this.sort = vi.fn();
    this.setMeasures = vi.fn();
    this.setDimensions = vi.fn();
    this.setGroupConfig = vi.fn();
    this.formatValue = vi
      .fn()
      .mockImplementation((value: unknown) => String(value));
    this.updateFieldFormatting = vi.fn();
    this.getFieldAlignment = vi.fn().mockReturnValue('left');
    this.showFormatPopup = vi.fn();
    this.swapRows = vi.fn();
    this.swapColumns = vi.fn();
    this.exportToHTML = vi.fn();
    this.exportToPDF = vi.fn();
    this.exportToExcel = vi.fn();
    this.openPrintDialog = vi.fn();
  }
  get data() {
    return this._data;
  }
  set data(value: PivotDataRecord[]) {
    this._data = value;
    this.dispatchEvent(
      new CustomEvent('stateChange', {
        detail: this.getState(),
      })
    );
  }

  get options() {
    return this._options;
  }
  set options(value: PivotOptions) {
    this._options = value;
    this.dispatchEvent(
      new CustomEvent('stateChange', {
        detail: this.getState(),
      })
    );
  }

  get filters() {
    return this._filters;
  }
  set filters(value: FilterConfig[]) {
    this._filters = value;
  }

  get pagination() {
    return this._pagination;
  }
  set pagination(value: PaginationConfig) {
    this._pagination = value;
    this.dispatchEvent(new CustomEvent('paginationChange', { detail: value }));
  }

  // Declare all methods as instance properties
  getState: () => PivotTableState<PivotDataRecord>;
  getData: () => PivotDataRecord[];
  getProcessedData: () => unknown;
  getGroupedData: () => unknown[];
  getPagination: () => PaginationConfig;
  getViewMode: () => 'raw' | 'processed';
  getFilters: () => FilterConfig[];
  setViewMode: (mode: 'raw' | 'processed') => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  goToPage: (page: number) => void;
  refresh: () => void;
  sort: (field: string, direction: 'asc' | 'desc') => void;
  setMeasures: (measures: MeasureConfig[]) => void;
  setDimensions: (dimensions: Dimension[]) => void;
  setGroupConfig: (config: GroupConfig | null) => void;
  formatValue: (value: unknown) => string;
  updateFieldFormatting: (field: string, format: FormatOptions) => void;
  getFieldAlignment: (field: string) => string;
  showFormatPopup: () => void;
  swapRows: (fromIndex: number, toIndex: number) => void;
  swapColumns: (fromIndex: number, toIndex: number) => void;
  exportToHTML: (fileName?: string) => void;
  exportToPDF: (fileName?: string) => void;
  exportToExcel: (fileName?: string) => void;
  openPrintDialog: () => void;
}

// Setup global DOM environment
Object.defineProperty(globalThis, 'customElements', {
  value: {
    define: vi.fn((name: string, constructor: CustomElementConstructor) => {
      // Actually register the custom element
      if (name === 'pivot-head') {
        globalThis.HTMLElement = constructor as typeof HTMLElement;
      }
    }),
    get: vi.fn((name: string) => {
      if (name === 'pivot-head') {
        return MockPivotHeadElement;
      }
      return undefined;
    }),
    whenDefined: vi.fn(() => Promise.resolve()),
  },
  writable: true,
});

// Register the mock custom element globally
if (typeof globalThis.customElements.define === 'function') {
  globalThis.customElements.define('pivot-head', MockPivotHeadElement);
}

// Mock console methods to avoid noise in tests
Object.defineProperty(console, 'warn', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(console, 'error', {
  value: vi.fn(),
  writable: true,
});

// Export the mock class for use in tests
export { MockPivotHeadElement };
