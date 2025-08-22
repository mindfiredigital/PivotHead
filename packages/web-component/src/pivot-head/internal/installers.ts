import type { PivotHeadHost } from './host';
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
} from './api-engine';
import {
  refresh as refreshHelper,
  reset as resetHelper,
  setFilters as setFiltersHelper,
  getFilters as getFiltersHelper,
} from './filters-refresh';
import {
  exportToHTML as exportToHTMLHelper,
  exportToPDF as exportToPDFHelper,
  exportToExcel as exportToExcelHelper,
  openPrintDialog as openPrintDialogHelper,
} from './io';
import {
  dragRow as dragRowApiHelper,
  dragColumn as dragColumnApiHelper,
  swapRows as swapRowsApiHelper,
  swapColumns as swapColumnsApiHelper,
  setDragAndDropEnabled as setDragAndDropEnabledHelper,
  isDragAndDropEnabled as isDragAndDropEnabledHelper,
} from './dnd-api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Proto = Record<string, any>;

// Installs engine-related API methods onto the PivotHeadElement prototype
export function installApiEngine<T extends PivotHeadHost>(
  klass: Constructor<T>
): void {
  const proto = klass.prototype as unknown as Proto;

  /**
   * @preserve
   * Gets the current engine state (dimensions, measures, processed data, sort, etc.).
   * @public
   * @throws {Error} If the engine has not been initialized yet.
   * @returns {import('@mindfiredigital/pivothead').PivotTableState<Record<string, unknown>>} The current pivot state.
   */
  proto.getState = function (this: PivotHeadHost) {
    return getStateHelper(this);
  };

  /**
   * @preserve
   * Refreshes the component by clearing the current filter UI state and calling the engine reset.
   * This retains configuration but clears applied filters.
   * @public
   */
  proto.refresh = function (this: PivotHeadHost) {
    refreshHelper(this);
  };

  /**
   * @preserve
   * Resets the component and engine: clears processed/raw filters, resets pagination and filter UI,
   * and invokes the engine reset.
   * @public
   */
  proto.reset = function (this: PivotHeadHost) {
    resetHelper(this);
  };

  /**
   * @preserve
   * Sorts the pivot data by a field using the core engine. Triggers a state update via subscription.
   * @public
   * @param {string} field - Field name (dimension or measure uniqueName) to sort by.
   * @param {'asc'|'desc'} direction - Sort direction.
   */
  proto.sort = function (
    this: PivotHeadHost,
    field: string,
    direction: 'asc' | 'desc'
  ) {
    sortHelper(this, field, direction);
  };

  /**
   * @preserve
   * Updates measures in the engine.
   * @public
   * @param {import('@mindfiredigital/pivothead').MeasureConfig[]} measures - The new measures configuration.
   */
  proto.setMeasures = function (
    this: PivotHeadHost,
    measures: import('@mindfiredigital/pivothead').MeasureConfig[]
  ) {
    setMeasuresHelper(this, measures);
  };

  /**
   * @preserve
   * Updates dimensions in the engine.
   * @public
   * @param {import('@mindfiredigital/pivothead').Dimension[]} dimensions - The new dimensions configuration.
   */
  proto.setDimensions = function (
    this: PivotHeadHost,
    dimensions: import('@mindfiredigital/pivothead').Dimension[]
  ) {
    setDimensionsHelper(this, dimensions);
  };

  /**
   * @preserve
   * Sets the grouping configuration used by the engine.
   * @public
   * @param {import('@mindfiredigital/pivothead').GroupConfig|null} groupConfig - Grouping configuration or null to clear.
   */
  proto.setGroupConfig = function (
    this: PivotHeadHost,
    groupConfig: import('@mindfiredigital/pivothead').GroupConfig | null
  ) {
    setGroupConfigHelper(this, groupConfig);
  };

  /**
   * @preserve
   * Sets the default aggregation type used by the engine (e.g., sum, avg).
   * @public
   * @param {import('@mindfiredigital/pivothead').AggregationType} type - Aggregation type.
   */
  proto.setAggregation = function (
    this: PivotHeadHost,
    type: import('@mindfiredigital/pivothead').AggregationType
  ) {
    setAggregationHelper(this, type);
  };

  /**
   * @preserve
   * Formats a value using the engine's formatting for a given field.
   * @public
   * @param {unknown} value - The raw value.
   * @param {string} field - The field name for formatting context.
   * @returns {string} The formatted value.
   */
  proto.formatValue = function (
    this: PivotHeadHost,
    value: unknown,
    field: string
  ): string {
    return formatValueHelper(this, value, field);
  };

  /**
   * @preserve
   * Returns the grouped data produced by the engine, useful for custom rendering in minimal mode.
   * @public
   * @returns {import('@mindfiredigital/pivothead').Group[]} The list of groups with aggregates.
   */
  proto.getGroupedData = function (this: PivotHeadHost) {
    return getGroupedDataHelper(this);
  };

  /**
   * @preserve
   * Returns the raw data from the engine state (post-load, pre-aggregation).
   * @public
   * @returns {Record<string, unknown>[]} Raw rows.
   */
  proto.getData = function (this: PivotHeadHost) {
    return getDataHelper(this);
  };

  /**
   * @preserve
   * Returns the processed pivot data structure from the engine state.
   * @public
   * @returns {unknown} The processed data payload (headers, rows, aggregates).
   */
  proto.getProcessedData = function (this: PivotHeadHost) {
    return getProcessedDataHelper(this);
  };
}

// Installs exporting-related API methods
export function installExporting<T extends PivotHeadHost>(
  klass: Constructor<T>
): void {
  const proto = klass.prototype as unknown as Proto;

  proto.exportToHTML = function (
    this: PivotHeadHost,
    fileName = 'pivot-table'
  ): void {
    exportToHTMLHelper(this, fileName);
  };

  proto.exportToPDF = function (
    this: PivotHeadHost,
    fileName = 'pivot-table'
  ): void {
    exportToPDFHelper(this, fileName);
  };

  proto.exportToExcel = function (
    this: PivotHeadHost,
    fileName = 'pivot-table'
  ): void {
    exportToExcelHelper(this, fileName);
  };

  proto.openPrintDialog = function (this: PivotHeadHost): void {
    openPrintDialogHelper(this);
  };
}

// Installs filter accessors onto the prototype
export function installFilters<T extends PivotHeadHost>(
  klass: Constructor<T>
): void {
  const proto = klass.prototype as unknown as Proto;

  Object.defineProperty(proto, 'filters', {
    get(this: PivotHeadHost) {
      return getFiltersHelper(this);
    },
    set(this: PivotHeadHost, value) {
      setFiltersHelper(this, value);
    },
    configurable: true,
    enumerable: true,
  });
}

// Installs drag-and-drop API methods
export function installDnDApi<T extends PivotHeadHost>(
  klass: Constructor<T>
): void {
  const proto = klass.prototype as unknown as Proto;

  proto.dragRow = function (
    this: PivotHeadHost,
    fromIndex: number,
    toIndex: number
  ): void {
    dragRowApiHelper(this, fromIndex, toIndex);
  };

  proto.dragColumn = function (
    this: PivotHeadHost,
    fromIndex: number,
    toIndex: number
  ): void {
    dragColumnApiHelper(this, fromIndex, toIndex);
  };

  proto.swapRows = function (
    this: PivotHeadHost,
    fromIndex: number,
    toIndex: number
  ): void {
    swapRowsApiHelper(this, fromIndex, toIndex);
  };

  proto.swapColumns = function (
    this: PivotHeadHost,
    fromIndex: number,
    toIndex: number
  ): void {
    swapColumnsApiHelper(this, fromIndex, toIndex);
  };

  proto.setDragAndDropEnabled = function (
    this: PivotHeadHost,
    enabled: boolean
  ): void {
    setDragAndDropEnabledHelper(this, enabled);
  };

  proto.isDragAndDropEnabled = function (this: PivotHeadHost): boolean {
    return isDragAndDropEnabledHelper(this);
  };

  proto.swapDataRowsByIndex = function (
    this: PivotHeadHost,
    fromIndex: number,
    toIndex: number
  ): void {
    this.swapRows(fromIndex, toIndex);
  };

  proto.swapDataColumnsByIndex = function (
    this: PivotHeadHost,
    fromIndex: number,
    toIndex: number
  ): void {
    this.swapColumns(fromIndex, toIndex);
  };
}
