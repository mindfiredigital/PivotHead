import type {
  FilterConfig,
  Group,
  PaginationConfig,
  PivotTableState,
  ConnectionOptions,
  FileConnectionResult,
} from '@mindfiredigital/pivothead';
import type {
  EnhancedPivotEngine,
  PivotDataRecord,
  PivotOptions,
} from '../../types/types';

export interface PivotHeadHost {
  // core engine and state
  engine: EnhancedPivotEngine<PivotDataRecord>;
  _engineUnsubscribe: (() => void) | null;
  _data: PivotDataRecord[];
  _originalData: PivotDataRecord[];
  _options: PivotOptions;
  _filters: FilterConfig[];
  _rawFilters: FilterConfig[];
  _processedFilters: FilterConfig[];
  _rowGroups: Group[];
  _columnGroups: Group[];
  _pagination: PaginationConfig;
  _showRawData: boolean;
  _rawDataColumnOrder: string[];
  _processedColumnOrder: string[];
  shadowRoot: ShadowRoot | null;

  // methods used across helpers
  renderRawTable(): void;
  renderFullUI(): void;
  _renderSwitch(): void;
  setupControls(): void;
  addDragListeners(): void;
  createProcessedSortIcon(field: string): string;
  createSortIcon(field: string): string;
  calculatePaginationForCurrentView(): void;
  updatePaginationForData(data: unknown[]): void;
  getPaginatedData<T>(data: T[]): T[];
  swapColumns(fromIndex: number, toIndex: number): void;
  swapRows(fromIndex: number, toIndex: number): void;
  dispatchEvent(event: Event): boolean;
  getAttribute(qualifiedName: string): string | null;
  setAttribute(qualifiedName: string, value: string): void;
  removeAttribute(qualifiedName: string): void;
  handleEngineStateChange(state: PivotTableState<PivotDataRecord>): void;
  tryInitializeEngine(): void;

  // API surfaced on the element used by event handlers
  filters: FilterConfig[];
  reset(): void;
  setPageSize(pageSize: number): void;
  previousPage(): void;
  nextPage(): void;
  exportToHTML(fileName?: string): void;
  exportToPDF(fileName?: string): void;
  exportToExcel(fileName?: string): void;
  openPrintDialog(): void;
  showFormatPopup(): void;

  // File import methods
  connectToLocalCSV(options?: ConnectionOptions): Promise<FileConnectionResult>;
  connectToLocalJSON(
    options?: ConnectionOptions
  ): Promise<FileConnectionResult>;
  connectToLocalFile(
    options?: ConnectionOptions
  ): Promise<FileConnectionResult>;

  // data/options setters used by attribute helpers
  data: PivotDataRecord[];
  options: PivotOptions;
  pagination: PaginationConfig;

  // drag state
  draggedColumn: HTMLElement | null;
  draggedRow: HTMLElement | null;
}
