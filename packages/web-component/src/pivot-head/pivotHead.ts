import type {
  FilterConfig,
  PivotTableState,
  Dimension,
  GroupConfig,
  MeasureConfig,
  AggregationType,
  Group,
  PaginationConfig,
  FieldInfo,
  LayoutSelection,
} from '@mindfiredigital/pivothead';
import type {
  EnhancedPivotEngine,
  PivotDataRecord,
  PivotOptions,
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
  getAvailableFields as getAvailableFieldsHelper,
  getSupportedAggregations as getSupportedAggregationsHelper,
  setMeasureAggregation as setMeasureAggregationHelper,
  buildLayout as buildLayoutHelper,
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

  /**
   * Returns all fields inferred from the engine's raw data.
   * Useful for building a UI for field selection.
   */
  public getAvailableFields(): FieldInfo[] {
    return getAvailableFieldsHelper(this as unknown as PivotHeadHost);
  }

  /**
   * Returns the list of supported aggregation types (e.g., 'sum', 'avg').
   */
  public getSupportedAggregations(): AggregationType[] {
    return getSupportedAggregationsHelper();
  }

  /**
   * Changes the aggregation for a specific measure and refreshes the engine.
   * @param field The unique name of the measure field.
   * @param aggregation The new aggregation type.
   */
  public setMeasureAggregation(
    field: string,
    aggregation: AggregationType
  ): void {
    setMeasureAggregationHelper(
      this as unknown as PivotHeadHost,
      field,
      aggregation
    );
  }

  /**
   * Builds and applies a complete layout (rows, columns, measures) from a selection object.
   * This is the primary method for updating the pivot table structure from a UI.
   * @param selection The layout selection object.
   */
  public buildLayout(selection: LayoutSelection): void {
    buildLayoutHelper(this as unknown as PivotHeadHost, selection);
  }
}

customElements.define('pivot-head', PivotHeadElement);
