import type {
  FilterConfig,
  PivotTableState,
  Dimension,
  GroupConfig,
  MeasureConfig,
  AggregationType,
  Group,
  PaginationConfig,
} from '@mindfiredigital/pivothead';
import { ConnectService } from '@mindfiredigital/pivothead';
import type {
  ConnectionOptions,
  FileConnectionResult,
} from '@mindfiredigital/pivothead';
import type {
  EnhancedPivotEngine,
  PivotDataRecord,
  PivotOptions,
  FileImportResult,
  ImportOptions,
} from '../types/types';
import type { PivotHeadHost } from './internal/host';
import {
  renderSwitch as renderSwitchHelper,
  renderFullUI as renderFullUIHelper,
  renderRawTable as renderRawTableHelper,
  handleEngineStateChange as handleEngineStateChangeHelper,
} from './internal/render';
import {
  bindControls as bindControlsHelper,
  updatePaginationInfo as updatePaginationInfoHelper,
  addDragListeners as addDragListenersHelper,
  handleSortClick as handleSortClickHelper,
  handleDrillDownClick as handleDrillDownClickHelper,
  createSortIcon as createSortIconHelper,
  createProcessedSortIcon as createProcessedSortIconHelper,
} from './internal/ui';
import { tryInitializeEngine as tryInitializeEngineHelper } from './internal/engine';
import {
  parseAttributesIfNeeded as parseAttributesIfNeededHelper,
  parseOtherAttributes as parseOtherAttributesHelper,
  attributeChanged as attributeChangedHelper,
} from './internal/attributes';
import {
  calculatePaginationForCurrentView as calculatePaginationForCurrentViewHelper,
  updatePaginationForData as updatePaginationForDataHelper,
  getPaginatedData as getPaginatedDataHelper,
  previousPage as previousPageHelper,
  nextPage as nextPageHelper,
  setPageSize as setPageSizeHelper,
  goToPage as goToPageHelper,
} from './internal/pagination';
import {
  getState as getStateHelper,
  sort as sortHelper,
  setMeasures as setMeasuresHelper,
  setDimensions as setDimensionsHelper,
  setGroupConfig as setGroupConfigHelper,
  setAggregation as setAggregationHelper,
  formatValue as formatValueHelper,
  getGroupedData as getGroupedDataHelper,
  getData as getDataHelper,
  getProcessedData as getProcessedDataHelper,
  updateFieldFormatting as updateFieldFormattingHelper,
  getFieldAlignment as getFieldAlignmentHelper,
} from './internal/api-engine';
import {
  setFilters as setFiltersHelper,
  getFilters as getFiltersHelper,
  refresh as refreshHelper,
  reset as resetHelper,
  clearFilterUI as clearFilterUIHelper,
} from './internal/filters-refresh';
import {
  exportToHTML as exportToHTMLHelper,
  exportToPDF as exportToPDFHelper,
  exportToExcel as exportToExcelHelper,
  openPrintDialog as openPrintDialogHelper,
  loadFromFile as loadFromFileHelper,
  loadFromUrl as loadFromUrlHelper,
} from './internal/io';
import {
  dragRow as dragRowApiHelper,
  dragColumn as dragColumnApiHelper,
  swapRows as swapRowsApiHelper,
  swapColumns as swapColumnsApiHelper,
  swapRawDataColumns as swapRawDataColumnsApiHelper,
  setDragAndDropEnabled as setDragAndDropEnabledHelper,
  isDragAndDropEnabled as isDragAndDropEnabledHelper,
} from './internal/dnd-api';
import { showFormatPopup as showFormatPopupHelper } from './internal/format';

export class PivotHeadElement extends HTMLElement {
  private engine!: EnhancedPivotEngine<PivotDataRecord>;
  private _engineUnsubscribe: (() => void) | null = null;
  private _data: PivotDataRecord[] = [];
  private _originalData: PivotDataRecord[] = [];
  private _options: PivotOptions = {};
  private _filters: FilterConfig[] = [];
  private _rawFilters: FilterConfig[] = [];
  private _processedFilters: FilterConfig[] = [];
  private _rowGroups: Group[] = [];
  private _columnGroups: Group[] = [];
  private _pagination: PaginationConfig = {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  };
  private _showRawData = false;
  private _rawDataColumnOrder: string[] = [];
  private _processedColumnOrder: string[] = [];

  static get observedAttributes(): string[] {
    return ['data', 'options', 'filters', 'pagination', 'mode'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(value: PivotDataRecord[]) {
    this._data = value || [];
    this._originalData = [...(value || [])];
    this.tryInitializeEngine();
  }
  get data(): PivotDataRecord[] {
    return this._data;
  }

  set options(value: PivotOptions) {
    this._options = value || {};
    this.tryInitializeEngine();
  }
  get options(): PivotOptions {
    return this._options;
  }

  set filters(value: FilterConfig[]) {
    setFiltersHelper(this as unknown as PivotHeadHost, value);
  }
  get filters(): FilterConfig[] {
    return getFiltersHelper(this as unknown as PivotHeadHost);
  }

  set pagination(value: PaginationConfig) {
    this._pagination = { ...this._pagination, ...value };
    this.setAttribute('pagination', JSON.stringify(this._pagination));
    this._renderSwitch();
  }
  get pagination(): PaginationConfig {
    return this._pagination;
  }

  private handleEngineStateChange(
    state: PivotTableState<PivotDataRecord>
  ): void {
    handleEngineStateChangeHelper(this as unknown as PivotHeadHost, state);
  }

  private tryInitializeEngine(): void {
    tryInitializeEngineHelper(this as unknown as PivotHeadHost);
  }

  connectedCallback(): void {
    if (!this._data.length && !Object.keys(this._options).length) {
      parseAttributesIfNeededHelper(this as unknown as PivotHeadHost);
    }
    this._renderSwitch();
  }

  private parseAttributesIfNeeded(): void {
    parseAttributesIfNeededHelper(this as unknown as PivotHeadHost);
  }
  private parseOtherAttributes(): void {
    parseOtherAttributesHelper(this as unknown as PivotHeadHost);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    attributeChangedHelper(
      this as unknown as PivotHeadHost,
      name,
      oldValue,
      newValue
    );
  }

  private _renderSwitch() {
    renderSwitchHelper(this as unknown as PivotHeadHost);
  }
  private renderFullUI(): void {
    renderFullUIHelper(this as unknown as PivotHeadHost);
  }
  private setupControls(): void {
    bindControlsHelper(this as unknown as PivotHeadHost);
  }
  private updatePaginationInfo(): void {
    updatePaginationInfoHelper(this as unknown as PivotHeadHost);
  }
  private calculatePaginationForCurrentView(): void {
    calculatePaginationForCurrentViewHelper(this as unknown as PivotHeadHost);
  }
  private updatePaginationForData(data: unknown[]): void {
    updatePaginationForDataHelper(this as unknown as PivotHeadHost, data);
  }
  private getPaginatedData<T>(data: T[]): T[] {
    return getPaginatedDataHelper(this as unknown as PivotHeadHost, data);
  }
  private renderRawTable(): void {
    renderRawTableHelper(this as unknown as PivotHeadHost);
  }
  private createSortIcon(field: string): string {
    return createSortIconHelper(this as unknown as PivotHeadHost, field);
  }
  private createProcessedSortIcon(field: string): string {
    return createProcessedSortIconHelper(
      this as unknown as PivotHeadHost,
      field
    );
  }
  private addDragListeners(): void {
    addDragListenersHelper(this as unknown as PivotHeadHost);
  }
  private handleSortClick(e: Event): void {
    handleSortClickHelper(this as unknown as PivotHeadHost, e);
  }
  private handleDrillDownClick(e: Event): void {
    handleDrillDownClickHelper(this as unknown as PivotHeadHost, e);
  }

  private draggedColumn: HTMLElement | null = null;
  private draggedRow: HTMLElement | null = null;

  public getRawData(): PivotDataRecord[] {
    return this._data;
  }
  public getPagination(): PaginationConfig {
    return this._pagination;
  }
  public getState(): PivotTableState<PivotDataRecord> {
    return getStateHelper(this as unknown as PivotHeadHost);
  }
  public refresh(): void {
    refreshHelper(this as unknown as PivotHeadHost);
  }
  public reset(): void {
    resetHelper(this as unknown as PivotHeadHost);
  }
  private clearFilterUI(): void {
    clearFilterUIHelper(this as unknown as PivotHeadHost);
  }
  public sort(field: string, direction: 'asc' | 'desc'): void {
    sortHelper(this as unknown as PivotHeadHost, field, direction);
  }
  public setMeasures(measures: MeasureConfig[]): void {
    setMeasuresHelper(this as unknown as PivotHeadHost, measures);
  }
  public setDimensions(dimensions: Dimension[]): void {
    setDimensionsHelper(this as unknown as PivotHeadHost, dimensions);
  }
  public setGroupConfig(groupConfig: GroupConfig | null): void {
    setGroupConfigHelper(this as unknown as PivotHeadHost, groupConfig);
  }
  public setAggregation(type: AggregationType): void {
    setAggregationHelper(this as unknown as PivotHeadHost, type);
  }
  public formatValue(value: unknown, field: string): string {
    return formatValueHelper(this as unknown as PivotHeadHost, value, field);
  }
  public getGroupedData(): Group[] {
    return getGroupedDataHelper(this as unknown as PivotHeadHost);
  }
  public getFilters(): FilterConfig[] {
    return this._filters;
  }
  public getData(): PivotDataRecord[] {
    return getDataHelper(this as unknown as PivotHeadHost);
  }
  public getProcessedData(): unknown {
    return getProcessedDataHelper(this as unknown as PivotHeadHost);
  }
  public exportToHTML(fileName = 'pivot-table'): void {
    exportToHTMLHelper(this as unknown as PivotHeadHost, fileName);
  }
  public exportToPDF(fileName = 'pivot-table'): void {
    exportToPDFHelper(this as unknown as PivotHeadHost, fileName);
  }
  public exportToExcel(fileName = 'pivot-table'): void {
    exportToExcelHelper(this as unknown as PivotHeadHost, fileName);
  }
  public openPrintDialog(): void {
    openPrintDialogHelper(this as unknown as PivotHeadHost);
  }
  public loadFromFile(file: File): Promise<void> {
    return loadFromFileHelper(this as unknown as PivotHeadHost, file);
  }
  public loadFromUrl(url: string): Promise<void> {
    return loadFromUrlHelper(this as unknown as PivotHeadHost, url);
  }
  public dragRow(fromIndex: number, toIndex: number): void {
    dragRowApiHelper(this as unknown as PivotHeadHost, fromIndex, toIndex);
  }
  public dragColumn(fromIndex: number, toIndex: number): void {
    dragColumnApiHelper(this as unknown as PivotHeadHost, fromIndex, toIndex);
  }
  public swapRows(fromIndex: number, toIndex: number): void {
    swapRowsApiHelper(this as unknown as PivotHeadHost, fromIndex, toIndex);
  }
  public swapColumns(fromIndex: number, toIndex: number): void {
    swapColumnsApiHelper(this as unknown as PivotHeadHost, fromIndex, toIndex);
  }
  private swapRawDataColumns(fromIndex: number, toIndex: number): void {
    swapRawDataColumnsApiHelper(
      this as unknown as PivotHeadHost,
      fromIndex,
      toIndex
    );
  }
  public setDragAndDropEnabled(enabled: boolean): void {
    setDragAndDropEnabledHelper(this as unknown as PivotHeadHost, enabled);
  }
  public isDragAndDropEnabled(): boolean {
    return isDragAndDropEnabledHelper(this as unknown as PivotHeadHost);
  }
  public swapDataRowsByIndex(fromIndex: number, toIndex: number): void {
    this.swapRows(fromIndex, toIndex);
  }
  public swapDataColumnsByIndex(fromIndex: number, toIndex: number): void {
    this.swapColumns(fromIndex, toIndex);
  }
  public previousPage(): void {
    previousPageHelper(this as unknown as PivotHeadHost);
  }
  public nextPage(): void {
    nextPageHelper(this as unknown as PivotHeadHost);
  }
  public setPageSize(pageSize: number): void {
    setPageSizeHelper(this as unknown as PivotHeadHost, pageSize);
  }
  public goToPage(page: number): void {
    goToPageHelper(this as unknown as PivotHeadHost, page);
  }
  public setViewMode(mode: 'raw' | 'processed'): void {
    const wantRaw = mode === 'raw';
    if (this._showRawData === wantRaw) return;
    this._showRawData = wantRaw;
    if (!this.engine) return;
    try {
      this.engine.setDataHandlingMode(wantRaw ? 'raw' : 'processed');
      const currentFilters = wantRaw
        ? this._rawFilters
        : this._processedFilters;
      this.engine.applyFilters(currentFilters);
      this.dispatchEvent(
        new CustomEvent('viewModeChange', {
          detail: { mode },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      console.error('Failed to set view mode:', err);
    }
  }
  public getViewMode(): 'raw' | 'processed' {
    return this._showRawData ? 'raw' : 'processed';
  }
  public updateFieldFormatting(
    field: string,
    format: import('../types/types').FormatOptions
  ): void {
    updateFieldFormattingHelper(
      this as unknown as PivotHeadHost,
      field,
      format
    );
  }
  public getFieldAlignment(field: string): string {
    return getFieldAlignmentHelper(this as unknown as PivotHeadHost, field);
  }
  public showFormatPopup(): void {
    showFormatPopupHelper(this as unknown as PivotHeadHost);
  }

  // File import methods using core engine's ConnectService
  public async connectToLocalCSV(
    options: ImportOptions = {}
  ): Promise<FileImportResult> {
    try {
      if (!this.engine) {
        return { success: false, error: 'Engine not initialized' };
      }

      console.log('🔥 CSV Import: Using core ConnectService logic');

      // Convert ImportOptions to ConnectionOptions
      const connectionOptions: ConnectionOptions = {
        csv: {
          delimiter: ',',
          hasHeader: true,
          skipEmptyLines: true,
          trimValues: true,
        },
        maxFileSize: options.maxFileSize,
        maxRecords: options.maxRecords,
      };

      // Use core ConnectService which handles file picker, parsing, and auto-configuration
      const result: FileConnectionResult =
        await ConnectService.connectToLocalCSV(
          this.engine as never, // Type assertion for core compatibility
          connectionOptions
        );

      if (result.success) {
        // Update web component state with the processed data
        this._data = result.data || [];
        this._originalData = [...this._data];

        // The core ConnectService already configured the engine with proper layout
        // We need to sync our options with what the engine configured
        const engineState = this.engine.getState();
        console.log('🔥 CSV Import: Engine state after import:', engineState);
        console.log(
          '🔥 CSV Import: Raw data length:',
          engineState.rawData?.length
        );
        console.log('🔥 CSV Import: Rows config:', engineState.rows);
        console.log('🔥 CSV Import: Columns config:', engineState.columns);
        console.log('🔥 CSV Import: Measures config:', engineState.measures);
        console.log('🔥 CSV Import: Group config:', engineState.groupConfig);
        console.log(
          '🔥 CSV Import: Grouped data length:',
          this.engine.getGroupedData()?.length
        );

        // Completely replace web component options with engine state - THIS IS THE KEY FIX
        this._options = {
          rows: engineState.rows || [],
          columns: engineState.columns || [],
          measures: engineState.measures || [],
          pageSize: this._options.pageSize || 10, // Keep current page size
        };

        // Clear any cached column orders to force fresh extraction
        this._processedColumnOrder = [];
        this._rawDataColumnOrder = [];

        console.log(
          '🔥 CSV Import: Completely replaced web component options:',
          this._options
        );
        console.log('🔥 CSV Import: About to re-render table...');

        // Dispatch event for external listeners
        this.dispatchEvent(
          new CustomEvent('dataImported', {
            detail: {
              type: 'csv',
              result,
              fileName: result.fileName,
              recordCount: result.recordCount,
            },
            bubbles: true,
            composed: true,
          })
        );

        // Force a complete re-render
        this._renderSwitch();

        return {
          success: true,
          data: this._data,
          fileName: result.fileName,
          recordCount: result.recordCount,
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to import CSV file',
      };
    } catch (error) {
      console.error('CSV Import Error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  public async connectToLocalJSON(
    options: ImportOptions = {}
  ): Promise<FileImportResult> {
    try {
      if (!this.engine) {
        return { success: false, error: 'Engine not initialized' };
      }

      console.log('🔥 JSON Import: Using core ConnectService logic');

      // Convert ImportOptions to ConnectionOptions
      const connectionOptions: ConnectionOptions = {
        json: {
          validateSchema: false,
        },
        maxFileSize: options.maxFileSize,
        maxRecords: options.maxRecords,
      };

      // Use core ConnectService which handles file picker, parsing, and auto-configuration
      const result: FileConnectionResult =
        await ConnectService.connectToLocalJSON(
          this.engine as never, // Type assertion for core compatibility
          connectionOptions
        );

      if (result.success) {
        // Update web component state with the processed data
        this._data = result.data || [];
        this._originalData = [...this._data];

        // The core ConnectService already configured the engine with proper layout
        // We need to sync our options with what the engine configured
        const engineState = this.engine.getState();
        console.log('🔥 JSON Import: Engine state after import:', engineState);

        // Sync the web component options with the engine's configuration
        this._options = {
          ...this._options,
          rows: engineState.rows || [],
          columns: engineState.columns || [],
          measures: engineState.measures || [],
        };

        console.log(
          '🔥 JSON Import: Updated web component options:',
          this._options
        );

        // Dispatch event for external listeners
        this.dispatchEvent(
          new CustomEvent('dataImported', {
            detail: {
              type: 'json',
              result,
              fileName: result.fileName,
              recordCount: result.recordCount,
            },
            bubbles: true,
            composed: true,
          })
        );

        // Force a complete re-render
        this._renderSwitch();

        return {
          success: true,
          data: this._data,
          fileName: result.fileName,
          recordCount: result.recordCount,
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to import JSON file',
      };
    } catch (error) {
      console.error('JSON Import Error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  public async connectToLocalFile(
    options: ImportOptions = {}
  ): Promise<FileImportResult> {
    try {
      if (!this.engine) {
        return { success: false, error: 'Engine not initialized' };
      }

      console.log('🔥 File Import: Using core ConnectService logic');

      // Convert ImportOptions to ConnectionOptions
      const connectionOptions: ConnectionOptions = {
        csv: {
          delimiter: ',',
          hasHeader: true,
          skipEmptyLines: true,
          trimValues: true,
        },
        json: {
          validateSchema: false,
        },
        maxFileSize: options.maxFileSize,
        maxRecords: options.maxRecords,
      };

      // Use core ConnectService which handles file picker, parsing, and auto-configuration
      const result: FileConnectionResult =
        await ConnectService.connectToLocalFile(
          this.engine as never, // Type assertion for core compatibility
          connectionOptions
        );

      if (result.success) {
        // Update web component state with the processed data
        this._data = result.data || [];
        this._originalData = [...this._data];

        // The core ConnectService already configured the engine with proper layout
        // We need to sync our options with what the engine configured
        const engineState = this.engine.getState();
        console.log('🔥 File Import: Engine state after import:', engineState);

        // Sync the web component options with the engine's configuration
        this._options = {
          ...this._options,
          rows: engineState.rows || [],
          columns: engineState.columns || [],
          measures: engineState.measures || [],
        };

        console.log(
          '🔥 File Import: Updated web component options:',
          this._options
        );

        // Dispatch event for external listeners
        this.dispatchEvent(
          new CustomEvent('dataImported', {
            detail: {
              type: result.fileName?.toLowerCase().endsWith('.json')
                ? 'json'
                : 'csv',
              result,
              fileName: result.fileName,
              recordCount: result.recordCount,
            },
            bubbles: true,
            composed: true,
          })
        );

        // Force a complete re-render
        this._renderSwitch();

        return {
          success: true,
          data: this._data,
          fileName: result.fileName,
          recordCount: result.recordCount,
        };
      }

      return { success: false, error: result.error || 'Failed to import file' };
    } catch (error) {
      console.error('File Import Error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

customElements.define('pivot-head', PivotHeadElement);
