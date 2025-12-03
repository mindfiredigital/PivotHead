/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AggregationType,
  Dimension,
  Group,
  GroupConfig,
  MeasureConfig,
  PivotTableConfig,
  PivotTableState,
  ProcessedData,
  RowSize,
  SortConfig,
  FilterConfig,
  PaginationConfig,
  DataHandlingMode,
  FormatOptions,
  AxisConfig,
} from '../types/interfaces';
import { calculateAggregates } from './aggregator';
import { processData } from './dataProcessor';
import { PivotExportService } from './exportService';
// import { applySort, sortGroups } from './sorter';

/**
 * Creates an instance of PivotEngine.
 * @param {PivotTableConfig<T>} config - The configuration for the pivot table.
 */
export class PivotEngine<T extends Record<string, any>> {
  private config: PivotTableConfig<T>;
  private state: PivotTableState<T>;
  private filterConfig: FilterConfig[] = [];
  private paginationConfig: PaginationConfig = {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  };

  // Controls whether the engine should automatically synthesize a single
  // column axis and augment data with __all__ when columns are empty.
  // Disabled by default to preserve backward-compatible behavior and tests.
  private autoAllColumnEnabled = false;

  // Add cache for expensive calculations
  private cache: Map<string, any> = new Map();

  constructor(config: PivotTableConfig<T>) {
    // Validate required config properties
    if (!this.validateConfig(config)) {
      throw new Error('Invalid pivot table configuration');
    }

    this.config = {
      ...config,
      defaultAggregation: config.defaultAggregation || 'sum',
      isResponsive: config.isResponsive ?? true,
    };

    this.state = this.initializeState(config);
    this.loadData();
  }

  private validateConfig(config: PivotTableConfig<T>): boolean {
    // Add validation logic
    if (!config) return false;
    if (config.dataSource) {
      const { type, url, file } = config.dataSource;
      if (type === 'remote' && !url) return false;
      if (type === 'file' && !file) return false;
    }
    return true;
  }

  private initializeState(config: PivotTableConfig<T>): PivotTableState<T> {
    return {
      data: config.data || [],
      dataHandlingMode: 'processed',
      rawData: config.data || [],
      processedData: { headers: [], rows: [], totals: {} },
      rows: config.rows || [],
      columns: config.columns || [],
      measures: this.normalizeMeasures(config.measures || []),
      sortConfig: [],
      rowSizes: this.initializeRowSizes(config.data || []),
      expandedRows: {},
      groupConfig: config.groupConfig || null,
      groups: [],
      selectedMeasures: this.normalizeMeasures(config.measures || []),
      selectedDimensions: config.dimensions || [],
      selectedAggregation: config.defaultAggregation || 'sum',
      formatting: config.formatting || {},
      columnWidths: {},
      isResponsive: config.isResponsive ?? true,
      rowGroups: [],

      columnGroups: [],
      filterConfig: [],
      paginationConfig: {
        currentPage: 1,
        pageSize: config.pageSize || 10,
        totalPages: 1,
      },
    };
  }
  /**
   * Loads data from a file or URL.
   **/
  private async loadData() {
    if (this.config.dataSource) {
      const { type, url, file } = this.config.dataSource;
      if (type === 'remote' && url) {
        this.state.rawData = await this.fetchRemoteData(url);
      } else if (type === 'file' && file) {
        this.state.rawData = await this.readFileData(file);
      } else {
        console.error('Invalid data source configuration');
      }
    } else if (this.config.data) {
      this.state.rawData = this.config.data;
    }

    // Initialize row sizes
    this.state.rowSizes = this.initializeRowSizes(this.state.rawData);

    // Ensure column axis is never empty and data has '__all__' when needed (only if enabled)
    this.ensureSyntheticAllColumn();

    // Process data after loading
    this.state.processedData = this.generateProcessedDataForDisplay();

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
  }

  // Ensure we always have a non-empty column axis and data augmented for '__all__' when needed
  private ensureSyntheticAllColumn(): void {
    // Only apply when explicitly enabled (e.g. by ConnectService after CSV/JSON import)
    if (!this.autoAllColumnEnabled) return;

    const needsAllColumn =
      !this.state.columns || this.state.columns.length === 0;
    const hasAllColumn = !!this.state.columns?.some(
      c => c.uniqueName === '__all__'
    );

    if (needsAllColumn) {
      this.state.columns = [
        { uniqueName: '__all__', caption: 'All' } as AxisConfig,
      ];
    }

    if (needsAllColumn || hasAllColumn) {
      const augment = (arr: T[] | undefined): T[] => {
        const source = Array.isArray(arr) ? arr : [];
        let changed = false;
        const out = source.map(row => {
          if (row && (row as any).__all__ === undefined) {
            changed = true;
            return { ...(row as any), __all__: 'All' } as T;
          }
          return row;
        });
        return changed ? out : source;
      };

      // Augment all data sources consistently
      this.config.data = augment(this.config.data as T[]);
      this.state.rawData = augment(this.state.rawData as T[]);
      this.state.data = augment(this.state.data as T[]);
    }
  }

  public setDataHandlingMode(mode: DataHandlingMode) {
    this.state.dataHandlingMode = mode;
    this.refreshData();
    this._emit(); // Notify subscribers after state change
  }

  public getDataHandlingMode(): DataHandlingMode {
    return this.state.dataHandlingMode;
  }

  // Allow external callers (e.g., ConnectService) to enable/disable synthetic column mode
  public setAutoAllColumn(enabled: boolean): void {
    this.autoAllColumnEnabled = enabled;
    // Re-ensure consistency if turning on after data is already present
    if (enabled) {
      this.ensureSyntheticAllColumn();
      // Regenerate processed data to reflect any augmentation
      this.state.processedData = this.generateProcessedDataForDisplay();
      this._emit();
    }
  }

  /**
   * Updates the engine's data source and applies current filters
   * This method allows external components to update the data while preserving filtering
   * @param {T[]} newData - The new data to use as the source
   * @public
   */
  public updateDataSource(newData: T[]) {
    // Update the config data (original source)
    this.config.data = [...newData];

    // Update the state data
    this.state.data = [...newData];
    this.state.rawData = [...newData];

    // Ensure column axis/data consistency before refresh (only if enabled)
    this.ensureSyntheticAllColumn();

    // Refresh with current filters applied
    this.refreshData();
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Loads data from a file or URL.
   * @param {File | string} source - The file or URL to load data from.
   * @public
   * @returns {Promise<void>} A promise that resolves when the data is loaded.
   **/
  private async fetchRemoteData(url: string): Promise<T[]> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching remote data:', error);
      return [];
    }
  }

  /**
   *  Process the data to be displayed in the table.
   * @param {T[]} data - The data to process.
   * @returns {ProcessedData} The processed data including headers, rows, and totals.
   * @private
   **/
  private async readFileData(file: File): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const data = JSON.parse(event.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  }

  /**
   * Initializes row sizes for the pivot table.
   * @param {T[]} data - The data to initialize row sizes for.
   * @returns {RowSize[]} An array of row sizes.
   * @private
   */
  private initializeRowSizes(data: T[]): RowSize[] {
    return data.map((_, index) => ({ index, height: 40 }));
  }

  /**
   * Processes the data for the pivot table.
   * @param {T[]} data - The data to process.
   * @returns {ProcessedData} The processed data including headers, rows, and totals.
   * @private
   */
  private generateProcessedDataForDisplay(): ProcessedData {
    // For processed data mode, use sorted data if available
    let dataToUse = this.state.rawData;

    // If we're in processed mode and have a sort config, ensure data is sorted
    if (
      this.state.dataHandlingMode === 'processed' &&
      this.state.sortConfig.length > 0
    ) {
      const sortConfig = this.state.sortConfig[0];

      // If we have groups (which is common in processed mode),
      // extract data from sorted groups to respect the sorted order
      if (this.state.groups.length > 0) {
        // Extract data from sorted groups in the correct order
        dataToUse = this.state.groups.flatMap(group => group.items);
      } else {
        // If no groups, sort the raw data directly
        dataToUse = this.sortData(this.state.rawData, sortConfig);
      }
    }

    return {
      headers: this.generateHeaders(),
      rows: this.generateRows(dataToUse),
      totals: this.calculateTotals(dataToUse),
    };
  }

  /**
   * Generates headers for the pivot table.
   * @returns {string[]} An array of header strings.
   * @private
   */
  private generateHeaders(): string[] {
    const useUniqueName = this.state.dataHandlingMode === 'raw';

    const rowHeaders = this.state.rows
      ? this.state.rows.map(r =>
          useUniqueName ? r.uniqueName : r.caption || r.uniqueName
        )
      : [];
    const columnHeaders = this.state.columns
      ? this.state.columns.map(c =>
          useUniqueName ? c.uniqueName : c.caption || c.uniqueName
        )
      : [];
    return [...rowHeaders, ...columnHeaders];
  }

  /**
   * Generates rows for the pivot table.
   * @param {T[]} data - The data to generate rows from.
   * @returns {any[][]} A 2D array representing the rows.
   * @private
   */
  /**
   * Generates rows for the pivot table with enhanced formatting.
   * @param {T[]} data - The data to generate rows from.
   * @returns {any[][]} A 2D array representing the rows.
   * @private
   */
  private generateRows(data: T[]): any[][] {
    if (!data || !this.state.rows || !this.state.columns) {
      return [];
    }
    return data.map(item => [
      ...this.state.rows.map(r => item[r.uniqueName]),
      ...this.state.columns.map(c => item[c.uniqueName]),
      ...this.state.measures.map(m => {
        const rawValue = this.calculateMeasureValue(item, m);
        return this.formatValue(rawValue, m.uniqueName);
      }),
    ]);
  }

  /**
   * Calculates the value for a specific measure.
   * @param {T} item - The data item.
   * @param {MeasureConfig} measure - The measure configuration.
   * @returns {number} The calculated measure value.
   * @private
   */
  private calculateMeasureValue(item: T, measure: MeasureConfig): number {
    if (measure.formula && typeof measure.formula === 'function') {
      return measure.formula(item);
    }
    return item[measure.uniqueName] || 0;
  }

  /**
   * Calculates totals for each measure in the pivot table.
   * @param {T[]} data - The data to calculate totals from.
   * @returns {Record<string, number>} An object with measure names as keys and their totals as values.
   * @private
   */
  private calculateTotals(data: T[]): Record<string, number> {
    const totals: Record<string, number> = {};

    this.state.measures.forEach(measure => {
      const { uniqueName, aggregation } = measure;
      let total = 0;

      if (aggregation === 'sum') {
        total = data.reduce((sum, item) => sum + (item[uniqueName] || 0), 0);
      } else if (aggregation === 'avg') {
        total =
          data.reduce((sum, item) => sum + (item[uniqueName] || 0), 0) /
          data.length;
      } else if (aggregation === 'max') {
        total = Math.max(...data.map(item => item[uniqueName] || 0));
      } else if (aggregation === 'min') {
        total = Math.min(...data.map(item => item[uniqueName] || 0));
      } else if (aggregation === 'count') {
        total = data.length;
      }

      totals[uniqueName] = total;
    });

    return totals;
  }

  // --- SUBSCRIPTION SYSTEM ---
  private listeners: Set<(state: PivotTableState<T>) => void> = new Set();
  /**
   * Subscribe to state changes. Returns an unsubscribe function.
   */
  public subscribe(fn: (state: PivotTableState<T>) => void): () => void {
    this.listeners.add(fn);
    fn(this.getState()); // Immediately call with current state
    return () => this.listeners.delete(fn);
  }
  /**
   * Emit state changes to all subscribers.
   */
  private _emit() {
    this.listeners.forEach(fn => fn(this.getState()));
  }

  /**
   * Sets the measures for the pivot table.
   * @param {MeasureConfig[]} measureFields - The measure configurations to set.
   * @public
   */
  public setMeasures(measureFields: MeasureConfig[]) {
    this.state.selectedMeasures = this.normalizeMeasures(measureFields);
    this.state.processedData = this.generateProcessedDataForDisplay();
    this.updateAggregates();
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Sets the dimensions for the pivot table.
   * @param {Dimension[]} dimensionFields - The dimension configurations to set.
   * @public
   */
  public setDimensions(dimensionFields: Dimension[]) {
    this.state.selectedDimensions = dimensionFields;
    this.state.processedData = this.generateProcessedDataForDisplay();
    this.updateAggregates();
    this.refreshData();
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Sets the aggregation type for the pivot table.
   * @param {AggregationType} type - The aggregation type to set.
   * @public
   */
  public setAggregation(type: AggregationType) {
    this.state.selectedAggregation = type;
    this.state.processedData = this.generateProcessedDataForDisplay();
    this.updateAggregates();
    this.refreshData();
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Sets the row groups for the pivot table.
   * @param {Group[]} rowGroups - The row groups to set.
   * @public
   */
  public setRowGroups(rowGroups: Group[]) {
    this.state.rowGroups = rowGroups;
    this.state.processedData = this.generateProcessedDataForDisplay();
    this.updateAggregates();
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Sets the column groups for the pivot table.
   * @param {Group[]} columnGroups - The column groups to set.
   * @public
   */
  public setColumnGroups(columnGroups: Group[]) {
    this.state.columnGroups = columnGroups;
    this.state.processedData = this.generateProcessedDataForDisplay();
    this.updateAggregates();
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Enhanced formatValue method with comprehensive formatting support
   * @param {any} value - The value to format.
   * @param {string} field - The field name to use for formatting.
   * @returns {string} The formatted value as a string.
   * @public
   */
  public formatValue(value: any, field: string): string {
    // Handle null/undefined values first
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'number' && isNaN(value))
    ) {
      const format = this.getFieldFormat(field);
      if (format && format.nullValue !== undefined) {
        return format.nullValue === null ? '' : String(format.nullValue);
      }
      return '';
    }

    const format = this.getFieldFormat(field);
    // Find measure to detect aggregation type
    const measure = this.state.measures.find(m => m.uniqueName === field);

    if (!format) {
      // For avg aggregation without explicit formatting, do not show decimals by default
      if (measure?.aggregation === 'avg') {
        const num = Number(value);
        return Number.isFinite(num) ? String(Math.round(num)) : String(value);
      }
      return String(value);
    }

    try {
      // If aggregation is avg and decimals are not explicitly set, default to 0 decimals
      const effectiveFormat =
        measure?.aggregation === 'avg' && typeof format.decimals !== 'number'
          ? { ...format, decimals: 0 }
          : format;

      return this.applyFormatting(value, effectiveFormat);
    } catch (error) {
      console.error(`Error formatting value for field ${field}:`, error);
      return String(value);
    }
  }

  /**
   * Get formatting configuration for a field
   * @param {string} field - The field name
   * @returns {EnhancedMeasureFormat | null} The format configuration
   * @private
   */
  private getFieldFormat(field: string): FormatOptions | null {
    // First check measure-specific formatting
    const measure = this.state.measures.find(m => m.uniqueName === field);
    if (measure && measure.format) {
      return measure.format as FormatOptions;
    }

    // Then check global formatting
    const globalFormat = this.state.formatting[field];
    if (globalFormat) {
      return globalFormat as FormatOptions;
    }

    return null;
  }

  /**
   * Apply comprehensive formatting to a value
   * @param {any} value - The value to format
   * @param {EnhancedMeasureFormat} format - The format configuration
   * @returns {string} The formatted value
   * @private
   */
  private applyFormatting(value: any, format: FormatOptions): string {
    let num = parseFloat(value);
    if (isNaN(num)) {
      return String(value);
    }

    // Handle percentage formatting (multiply by 100 for display)
    if (format.percent) {
      num = num * 100;
    }

    // Determine decimal places
    const decimals = typeof format.decimals === 'number' ? format.decimals : 2;

    let formattedValue: string;

    // Apply base formatting based on type
    switch (format.type) {
      case 'currency':
        formattedValue = this.formatCurrency(num, format, decimals);
        break;
      case 'percentage':
        formattedValue = this.formatPercentage(num, format, decimals);
        break;
      case 'date':
        formattedValue = this.formatDate(value, format);
        break;
      case 'number':
      default:
        formattedValue = this.formatNumber(num, format, decimals);
        break;
    }

    // Apply custom separators if specified
    formattedValue = this.applyCustomSeparators(formattedValue, format);

    return formattedValue;
  }

  /**
   * Format as currency
   * @param {number} num - The number to format
   * @param {EnhancedMeasureFormat} format - The format configuration
   * @param {number} decimals - Number of decimal places
   * @returns {string} The formatted currency value
   * @private
   */

  private formatCurrency(
    num: number,
    format: FormatOptions,
    decimals: number
  ): string {
    const currency = format.currency || 'USD';
    const locale = format.locale || 'en-US';
    let formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);

    // Custom currency alignment
    if (format.align === 'right' || format.currencyAlign === 'right') {
      // Move symbol to the right if not already
      // Remove symbol from start and append to end
      const symbol = formatted.replace(/[\d.,\s]/g, '');
      formatted = formatted.replace(symbol, '').trim() + ' ' + symbol;
    } else if (format.align === 'left' || format.currencyAlign === 'left') {
      // Default: symbol on left (do nothing)
    }
    return formatted;
  }

  /**
   * Format as percentage
   * @param {number} num - The number to format
   * @param {EnhancedMeasureFormat} format - The format configuration
   * @param {number} decimals - Number of decimal places
   * @returns {string} The formatted percentage value
   * @private
   */
  private formatPercentage(
    num: number,
    format: FormatOptions,
    decimals: number
  ): string {
    const locale = format.locale || 'en-US';

    // For percentage formatting, Intl.NumberFormat expects the decimal value
    // Since we already multiplied by 100, we need to divide by 100
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num / 100);
  }

  /**
   * Format as number
   * @param {number} num - The number to format
   * @param {EnhancedMeasureFormat} format - The format configuration
   * @param {number} decimals - Number of decimal places
   * @returns {string} The formatted number value
   * @private
   */
  private formatNumber(
    num: number,
    format: FormatOptions,
    decimals: number
  ): string {
    const locale = format.locale || 'en-US';

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  /**
   * Format as date
   * @param {any} value - The date value to format
   * @param {EnhancedMeasureFormat} format - The format configuration
   * @returns {string} The formatted date value
   * @private
   */
  private formatDate(value: any, format: FormatOptions): string {
    const locale = format.locale || 'en-US';

    try {
      const date = new Date(value);
      return date.toLocaleDateString(locale, {
        dateStyle: 'medium',
      });
    } catch (error) {
      return String(value);
    }
  }

  /**
   * Apply custom thousand and decimal separators
   * @param {string} formattedValue - The pre-formatted value
   * @param {EnhancedMeasureFormat} format - The format configuration
   * @returns {string} The value with custom separators applied
   * @private
   */
  private applyCustomSeparators(
    formattedValue: string,
    format: FormatOptions
  ): string {
    let result = formattedValue;

    // Apply custom decimal separator
    if (format.decimalSeparator && format.decimalSeparator !== '.') {
      const lastDotIndex = result.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        result =
          result.substring(0, lastDotIndex) +
          format.decimalSeparator +
          result.substring(lastDotIndex + 1);
      }
    }

    // Apply custom thousand separator
    if (format.thousandSeparator !== undefined) {
      if (format.thousandSeparator === '') {
        // Remove thousand separators
        result = result.replace(/,/g, '');
      } else if (format.thousandSeparator !== ',') {
        // Replace default comma with custom separator
        result = result.replace(/,/g, format.thousandSeparator);
      }
    }

    return result;
  }

  /**
   * Calculate aggregated value for a cell intersection
   * @param {string} rowValue - The row value
   * @param {string} columnValue - The column value
   * @param {MeasureConfig} measure - The measure configuration
   * @param {string} rowFieldName - The row field name
   * @param {string} columnFieldName - The column field name
   * @returns {number} The calculated aggregated value
   * @public
   */
  public calculateCellValue(
    rowValue: string,
    columnValue: string,
    measure: MeasureConfig,
    rowFieldName: string,
    columnFieldName: string
  ): number {
    const filteredData = this.state.rawData.filter(
      item =>
        item[rowFieldName] === rowValue && item[columnFieldName] === columnValue
    );

    if (filteredData.length === 0) {
      return 0;
    }

    let value = 0;
    switch (measure.aggregation) {
      case 'sum':
        value = filteredData.reduce(
          (sum, item) => sum + (item[measure.uniqueName] || 0),
          0
        );
        break;
      case 'avg':
        value =
          filteredData.reduce(
            (sum, item) => sum + (item[measure.uniqueName] || 0),
            0
          ) / filteredData.length;
        break;
      case 'max':
        value = Math.max(
          ...filteredData.map(item => item[measure.uniqueName] || 0)
        );
        break;
      case 'min':
        value = Math.min(
          ...filteredData.map(item => item[measure.uniqueName] || 0)
        );
        break;
      case 'count':
        value = filteredData.length;
        break;
      default:
        value = 0;
    }

    return value;
  }

  /**
   * Get text alignment for a field
   * @param {string} field - The field name
   * @returns {string} The text alignment ('left', 'right', 'center')
   * @public
   */
  public getFieldAlignment(field: string): string {
    // Check cache first for performance
    const cacheKey = `alignment:${field}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const format = this.getFieldFormat(field);

    let alignment: string;

    if (format && format.align) {
      alignment = format.align;
    } else if (format && format.type === 'currency' && format.currencyAlign) {
      alignment = format.currencyAlign;
    } else {
      // Default alignment: right for numbers, left for text
      const measure = this.state.measures.find(m => m.uniqueName === field);
      alignment = measure ? 'right' : 'left';
    }

    // Cache the result for future calls
    this.cache.set(cacheKey, alignment);
    return alignment;
  }

  /**
   * Update formatting configuration for a specific field
   * @param {string} field - The field name
   * @param {EnhancedMeasureFormat} format - The format configuration
   * @public
   */
  public updateFieldFormatting(field: string, format: FormatOptions) {
    // Update measure-specific formatting if it's a measure
    const measure = this.state.measures.find(m => m.uniqueName === field);
    if (measure) {
      measure.format = format;
    }

    // Update global formatting
    this.state.formatting[field] = format;

    // Clear alignment cache for this field since formatting changed
    const cacheKey = `alignment:${field}`;
    this.cache.delete(cacheKey);

    // Regenerate processed data with new formatting
    this.state.processedData = this.generateProcessedDataForDisplay();

    this._emit(); // Notify subscribers after state change
  }

  /**
   * Sorts the pivot table data based on the specified field and direction.
   * @param {string} field - The field to sort by.
   * @param {'asc' | 'desc'} direction - The sort direction.
   * @public
   */
  public sort(field: string, direction: 'asc' | 'desc') {
    const measure = this.state.measures.find(m => m.uniqueName === field);

    const newSortConfig: SortConfig = {
      field,
      direction,
      type: measure ? 'measure' : 'dimension',
      aggregation: measure?.aggregation,
    };

    this.state.sortConfig = [newSortConfig];
    this.applySort();
  }

  private applySort() {
    if (this.state.dataHandlingMode === 'raw') {
      // Sort raw data
      const sortedData = this.sortData(
        this.state.rawData,
        this.state.sortConfig[0]
      );

      // Update both data and rawData for consistency
      this.state.data = sortedData;
      this.state.rawData = sortedData;

      this.state.processedData = this.generateProcessedDataForDisplay();
      this.updateAggregates();
    } else {
      // For processed data mode
      if (this.state.groups.length > 0) {
        // If we have groups, sort the grouped data
        this.state.groups = this.sortGroups(
          this.state.groups,
          this.state.sortConfig[0]
        );

        // Regenerate processed data to reflect the sorted groups
        this.state.processedData = this.generateProcessedDataForDisplay();
        this.updateAggregates();
      } else {
        // If we don't have groups, but we're in processed mode,
        // we need to sort the raw data and then regenerate processed data
        const sortedData = this.sortData(
          this.state.rawData,
          this.state.sortConfig[0]
        );
        this.state.data = sortedData;
        this.state.rawData = sortedData;

        // Regenerate processed data to reflect the sorted data
        this.state.processedData = this.generateProcessedDataForDisplay();
        this.updateAggregates();
      }
    }

    this._emit(); // Notify subscribers of state change
  }

  private sortData(data: T[], sortConfig: SortConfig): T[] {
    return [...data].sort((a, b) => {
      let aValue = this.getFieldValue(a, sortConfig);
      let bValue = this.getFieldValue(b, sortConfig);

      // Handle different data types for raw data sorting
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private getFieldValue(item: T, sortConfig: SortConfig): any {
    if (sortConfig.type === 'measure') {
      const measure = this.state.measures.find(
        m => m.uniqueName === sortConfig.field
      );
      if (measure && measure.formula) {
        return measure.formula(item);
      }
    }
    return item[sortConfig.field];
  }

  private sortGroups(groups: Group[], sortConfig: SortConfig): Group[] {
    return [...groups].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.type === 'measure') {
        // Sort by aggregated measure values
        aValue =
          a.aggregates[`${sortConfig.aggregation}_${sortConfig.field}`] || 0;
        bValue =
          b.aggregates[`${sortConfig.aggregation}_${sortConfig.field}`] || 0;
      } else {
        // Sort by dimension values (e.g., row field names like country, product, etc.)
        // Extract the dimension value from the group key
        const keys = a.key ? a.key.split('|') : [];
        const bKeys = b.key ? b.key.split('|') : [];

        // For row field sorting, use the first key (row field value)
        // For column field sorting, use the second key (column field value)
        const rowField = this.state.rows?.[0]?.uniqueName;
        const columnField = this.state.columns?.[0]?.uniqueName;

        if (sortConfig.field === rowField) {
          aValue = keys[0] || '';
          bValue = bKeys[0] || '';
        } else if (sortConfig.field === columnField) {
          aValue = keys[1] || '';
          bValue = bKeys[1] || '';
        } else {
          // Fallback: try to find the field in the first item of each group
          aValue = a.items[0]?.[sortConfig.field] || '';
          bValue = b.items[0]?.[sortConfig.field] || '';
        }

        // Handle string comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Updates aggregates for all groups in the pivot table.
   * @private
   */
  private updateAggregates() {
    const updateGroupAggregates = (group: Group) => {
      this.state.measures.forEach(measure => {
        const aggregateKey = `${this.state.selectedAggregation}_${measure.uniqueName}`;
        if (measure.formula && typeof measure.formula === 'function') {
          // Handle custom measures
          const formulaResults = group.items.map(item =>
            measure.formula ? measure.formula(item) : 0
          );
          group.aggregates[aggregateKey] = calculateAggregates(
            formulaResults.map(value => ({ value })),
            'value' as keyof { value: number },
            measure.aggregation ||
              (this.state.selectedAggregation as AggregationType)
          );
        } else {
          group.aggregates[aggregateKey] = calculateAggregates(
            group.items,
            measure.uniqueName as keyof T,
            (measure.aggregation as AggregationType) ||
              (this.state.selectedAggregation as AggregationType)
          );
        }
      });

      if (group.subgroups) {
        group.subgroups.forEach(updateGroupAggregates);
      }
    };

    this.state.groups.forEach(updateGroupAggregates);
  }

  /**
   * Applies grouping to the pivot table data.
   * @private
   */
  private applyGrouping(dataOverride?: T[]) {
    if (!this.state.groupConfig) return;

    const { rowFields, columnFields, grouper } = this.state.groupConfig;

    if (!rowFields || !columnFields || !grouper) {
      console.error('Invalid groupConfig:', this.state.groupConfig);
      return;
    }

    // Use provided data or fall back to config data
    const dataToUse = dataOverride || this.config.data || [];

    const tempConfig = {
      ...this.config,
      data: dataToUse,
    };

    const { rawData, groups } = processData(
      tempConfig,
      this.state.sortConfig[0] || null,
      this.state.groupConfig
    );

    this.state.rawData = rawData;
    this.state.groups = groups;
    this.updateAggregates();

    this.state.processedData = this.generateProcessedDataForDisplay();
  }

  /**
   * Sets the group configuration for the pivot table.
   * @param {GroupConfig | null} groupConfig - The group configuration to set.
   * @public
   */
  public setGroupConfig(groupConfig: GroupConfig | null) {
    this.state.groupConfig = groupConfig;
    if (groupConfig) {
      this.applyGrouping();
    } else {
      this.state.groups = [];
      this.state.processedData = this.generateProcessedDataForDisplay();
    }
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Returns the grouped data.
   * @returns {Group[]} An array of grouped data.
   * @public
   */
  public getGroupedData(): Group[] {
    return this.state.groups;
  }

  /**
   * Returns the current state of the pivot table.
   * @returns {PivotTableState<T>} The current state of the pivot table.
   * @public
   */
  public getState(): PivotTableState<T> {
    return { ...this.state };
  }

  /**
   * Resets the pivot table to its initial state.
   * @public
   */
  public reset() {
    this.state = {
      ...this.state,
      rawData: this.config.data || [],
      processedData: this.generateProcessedDataForDisplay(),
      sortConfig: [],
      rowSizes: this.initializeRowSizes(this.config.data || []),
      expandedRows: {},
      groupConfig: this.config.groupConfig || null,
      groups: [],
    };

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Resizes a specific row in the pivot table.
   * @param {number} index - The index of the row to resize.
   * @param {number} height - The new height for the row.
   * @public
   */
  public resizeRow(index: number, height: number) {
    const rowIndex = this.state.rowSizes.findIndex(row => row.index === index);
    if (rowIndex !== -1) {
      this.state.rowSizes[rowIndex].height = Math.max(20, height);
      this._emit(); // Notify subscribers after state change
    }
  }

  /**
   * Toggles the expansion state of a row.
   * @param {string} rowId - The ID of the row to toggle.
   * @public
   */
  public toggleRowExpansion(rowId: string) {
    this.state.expandedRows[rowId] = !this.state.expandedRows[rowId];
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Checks if a row is expanded.
   * @param {string} rowId - The ID of the row to check.
   * @returns {boolean} True if the row is expanded, false otherwise.
   * @public
   */
  public isRowExpanded(rowId: string): boolean {
    return !!this.state.expandedRows[rowId];
  }

  /**
   * Handles dragging a row to a new position.
   * This method now correctly operates on state.rowGroups.
   * @param {number} fromIndex - The original index of the row.
   * @param {number} toIndex - The new index for the row.
   * @public
   */
  public dragRow(fromIndex: number, toIndex: number) {
    // Validate indices against the rowGroups array
    if (
      !this.validateDragOperation(
        fromIndex,
        toIndex,
        this.state.rowGroups.length
      )
    ) {
      // The validateDragOperation already logs a warning, so we can just return.
      return;
    }

    // Create a new array from the existing row groups to avoid direct mutation
    const newRowGroups = [...this.state.rowGroups];

    // Remove the item from its original position
    const [movedGroup] = newRowGroups.splice(fromIndex, 1);

    // Insert the removed item into its new position
    newRowGroups.splice(toIndex, 0, movedGroup);

    // Update the state with the newly ordered array
    this.state.rowGroups = newRowGroups;

    // Optional: Call the onRowDragEnd callback if it's defined in the config
    if (typeof this.config.onRowDragEnd === 'function') {
      this.config.onRowDragEnd(fromIndex, toIndex, this.state.rowGroups);
    }

    this._emit(); // Notify subscribers after state change
  }

  /**
   * Handles dragging a column to a new position.
   * This method now correctly operates on state.columnGroups.
   * @param {number} fromIndex - The original index of the column.
   * @param {number} toIndex - The new index for the column.
   * @public
   */
  public dragColumn(fromIndex: number, toIndex: number): void {
    // Validate indices against the columnGroups array
    if (
      !this.validateDragOperation(
        fromIndex,
        toIndex,
        this.state.columnGroups.length
      )
    ) {
      return;
    }

    try {
      // Create a new array from the existing column groups
      const newColumnGroups = [...this.state.columnGroups];

      // Remove the group from its original position
      const [movedColumn] = newColumnGroups.splice(fromIndex, 1);

      // Insert the removed group into its new position
      newColumnGroups.splice(toIndex, 0, movedColumn);

      // Update the state with the newly ordered array
      this.state.columnGroups = newColumnGroups;

      // Call callback if provided
      if (typeof this.config.onColumnDragEnd === 'function') {
        // Map Group[] to { uniqueName, caption }[] before passing to callback
        const mappedColumnGroups = newColumnGroups.map(group => ({
          uniqueName: (group as any).uniqueName ?? group.key ?? '',
          caption: (group as any).caption ?? group.key ?? '',
        }));
        this.config.onColumnDragEnd(fromIndex, toIndex, mappedColumnGroups);
      }

      this._emit(); // Notify subscribers after state change
    } catch (error) {
      console.error('Error during column drag operation:', error);
    }
  }

  // Ensure this validation method also prevents dragging to the same spot
  private validateDragOperation(
    fromIndex: number,
    toIndex: number,
    length: number
  ): boolean {
    if (fromIndex === toIndex) {
      return false; // No operation needed, not an error
    }
    const isValid =
      fromIndex >= 0 && toIndex >= 0 && fromIndex < length && toIndex < length;
    if (!isValid) {
      console.warn(
        `Invalid drag indices: from ${fromIndex} to ${toIndex} with length ${length}`
      );
    }
    return isValid;
  }

  /**
   * Applies filters to the data
   * @param {FilterConfig[]} filters - Array of filter configurations
   * @public
   */
  public applyFilters(filters: FilterConfig[]) {
    this.filterConfig = filters;
    this.refreshData();
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Sets pagination configuration
   * @param {PaginationConfig} config - Pagination configuration
   * @public
   */
  public setPagination(config: PaginationConfig) {
    this.paginationConfig = {
      ...this.paginationConfig,
      ...config,
    };

    this.refreshData();
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Returns the current pagination configuration
   * @returns {PaginationConfig}
   * @public
   */
  public getPagination(): PaginationConfig {
    return this.paginationConfig;
  }

  /**
   * Refreshes data with current filters and pagination
   * @private
   */
  private refreshData() {
    // Get the appropriate data source based on data handling mode
    const originalData = this.getDataForCurrentMode();

    let filteredData: T[];

    // Check if we're filtering on aggregated measures in processed mode
    if (
      this.state.dataHandlingMode === 'processed' &&
      this.hasAggregatedFilters()
    ) {
      // For aggregated filters, we need to filter the grouped data, not raw data
      filteredData = this.filterProcessedData(originalData);
    } else {
      // For regular field filters, apply normal filtering
      filteredData = this.filterData(originalData);
    }

    // Update total pages based on filtered data
    this.paginationConfig.totalPages = Math.ceil(
      filteredData.length / this.paginationConfig.pageSize
    );

    // Apply pagination
    filteredData = this.paginateData(filteredData);

    // Update state based on data handling mode
    if (this.state.dataHandlingMode === 'raw') {
      // For raw mode, update the raw data directly
      this.state.data = filteredData;
      this.state.rawData = filteredData;
      // Still need to regenerate processed data for display (headers depend on mode)
      this.state.processedData = this.generateProcessedDataForDisplay();
    } else {
      // For processed mode, update the data and regenerate processed data
      this.state.data = filteredData;
      this.state.rawData = filteredData;
      if (this.state.groupConfig) {
        // Pass the filtered data to grouping instead of using config
        this.applyGrouping(filteredData);
      }
      this.state.processedData = this.generateProcessedDataForDisplay();
    }
  }

  /**
   * Gets the appropriate data source based on the current data handling mode
   * @private
   */
  private getDataForCurrentMode(): T[] {
    // Always start from the original data stored in config
    return [...(this.config.data || [])];
  }

  /**
   * Filters data based on filter configuration
   * @param {T[]} data - Data to filter
   * @private
   */
  private filterData(data: T[]): T[] {
    if (!this.filterConfig.length) return data;

    return data.filter(item =>
      this.filterConfig.every(filter => {
        const value = item[filter.field];
        const filterValue =
          typeof value === 'number' ? Number(filter.value) : filter.value;

        switch (filter.operator) {
          case 'equals':
            return value === filterValue;
          case 'contains':
            return String(value)
              .toLowerCase()
              .includes(String(filterValue).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filterValue);
          case 'lessThan':
            return Number(value) < Number(filterValue);
          case 'between':
            return value >= filterValue[0] && value <= filterValue[1];
          default:
            return true;
        }
      })
    );
  }

  /**
   * Paginates data based on pagination configuration
   * @param {T[]} data - Data to paginate
   * @private
   */
  private paginateData(data: T[]): T[] {
    const { currentPage, pageSize } = this.paginationConfig;
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }

  /**
   * Gets current pagination state
   * @returns {PaginationConfig} Current pagination configuration
   * @public
   */
  public getPaginationState(): PaginationConfig {
    return { ...this.paginationConfig };
  }

  /**
   * Gets current filter state
   * @returns {FilterConfig[]} Current filter configuration
   * @public
   */
  public getFilterState(): FilterConfig[] {
    return [...this.filterConfig];
  }

  /**
   * Exports the pivot table data to HTML and downloads the file.
   * @param {string} fileName - The name of the downloaded file (without extension).
   * @public
   */
  public exportToHTML(fileName = 'pivot-table'): void {
    console.log('PivotEngine.exportToHTML called with fileName:', fileName);
    console.log(
      'PivotEngine state rawData length:',
      this.state.rawData?.length || 0
    );
    PivotExportService.exportToHTML(this.getState(), fileName);
  }

  /**
   * Exports the pivot table data to PDF and downloads the file.
   * @param {string} fileName - The name of the downloaded file (without extension).
   * @public
   */
  public exportToPDF(fileName = 'pivot-table'): void {
    console.log('PivotEngine.exportToPDF called with fileName:', fileName);
    console.log(
      'PivotEngine state rawData length:',
      this.state.rawData?.length || 0
    );
    PivotExportService.exportToPDF(this.getState(), fileName);
  }

  /**
   * Exports the pivot table data to Excel and downloads the file.
   * @param {string} fileName - The name of the downloaded file (without extension).
   * @public
   */
  public exportToExcel(fileName = 'pivot-table'): void {
    console.log('PivotEngine.exportToExcel called with fileName:', fileName);
    console.log(
      'PivotEngine state rawData length:',
      this.state.rawData?.length || 0
    );
    PivotExportService.exportToExcel(this.getState(), fileName);
  }

  /**
   * Opens a print dialog with the formatted pivot table.
   * @public
   */
  public openPrintDialog(): void {
    PivotExportService.openPrintDialog(this.getState());
  }

  // Add these methods to your PivotEngine class to fix drag functionality

  /**
   * Handles dragging a data row (product) to a new position
   * This method operates on the actual data items, not groups
   * @param {number} fromIndex - The original index of the product in unique products list
   * @param {number} toIndex - The new index for the product in unique products list
   * @public
   */
  public dragDataRow(fromIndex: number, toIndex: number): void {
    // Get unique products with proper type casting
    const uniqueProducts = [
      ...new Set(this.state.data.map((item: { product: any }) => item.product)),
    ].filter((product): product is string => typeof product === 'string');

    if (
      !this.validateDragOperation(fromIndex, toIndex, uniqueProducts.length)
    ) {
      return;
    }

    try {
      // Get the product names being moved
      const fromProduct = uniqueProducts[fromIndex];
      const toProduct = uniqueProducts[toIndex];

      console.log(`Reordering products: ${fromProduct} -> ${toProduct}`);

      // Create a new data array with reordered products
      const newData = [...this.state.data];

      // Create a mapping of desired product order
      const reorderedProducts = [...uniqueProducts];
      const [movedProduct] = reorderedProducts.splice(fromIndex, 1);
      reorderedProducts.splice(toIndex, 0, movedProduct);

      // Sort the data array based on the new product order
      newData.sort((a, b) => {
        const aIndex = reorderedProducts.indexOf(a.product as string);
        const bIndex = reorderedProducts.indexOf(b.product as string);
        return aIndex - bIndex;
      });

      // Update the state
      this.state.data = newData;
      this.state.rawData = newData;

      // Regenerate processed data
      this.state.processedData = this.generateProcessedDataForDisplay();

      // Update aggregates if groups exist
      if (this.state.groups.length > 0) {
        this.updateAggregates();
      }

      // Call callback if provided
      if (typeof this.config.onRowDragEnd === 'function') {
        this.config.onRowDragEnd(fromIndex, toIndex, this.state.rowGroups);
      }
    } catch (error) {
      console.error('Error during data row drag operation:', error);
    }
  }

  /**
   * Handles dragging a data column (region) to a new position
   * This method operates on the actual data structure, not groups
   * @param {number} fromIndex - The original index of the region
   * @param {number} toIndex - The new index for the region
   * @public
   */
  public dragDataColumn(fromIndex: number, toIndex: number): void {
    // Get unique regions with proper type casting
    const uniqueRegions = [
      ...new Set(this.state.data.map((item: { region: any }) => item.region)),
    ].filter((region): region is string => typeof region === 'string');

    if (!this.validateDragOperation(fromIndex, toIndex, uniqueRegions.length)) {
      return;
    }

    try {
      // Get the region names being moved
      // Create a new data array with reordered regions
      const newData = [...this.state.data];

      // Create a mapping of desired region order
      const reorderedRegions = [...uniqueRegions];
      const [movedRegion] = reorderedRegions.splice(fromIndex, 1);
      reorderedRegions.splice(toIndex, 0, movedRegion);

      // Update columns configuration if it exists
      if (this.state.columns && this.state.columns.length > 0) {
        const newColumns = [...this.state.columns];
        // Find and reorder column configurations that match regions
        newColumns.sort((a, b) => {
          const aIndex = reorderedRegions.indexOf(a.uniqueName);
          const bIndex = reorderedRegions.indexOf(b.uniqueName);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
        this.state.columns = newColumns;
      }

      // Update the state
      this.state.data = newData;
      this.state.rawData = newData;

      // Regenerate processed data
      this.state.processedData = this.generateProcessedDataForDisplay();

      // Update aggregates if groups exist
      if (this.state.groups.length > 0) {
        this.updateAggregates();
      }

      // Call callback if provided
      if (typeof this.config.onColumnDragEnd === 'function') {
        const mappedColumns: { uniqueName: string; caption: string }[] =
          reorderedRegions.map(region => ({
            uniqueName: region,
            caption: region,
          }));
        this.config.onColumnDragEnd(fromIndex, toIndex, mappedColumns);
      }
    } catch (error) {
      console.error('Error during data column drag operation:', error);
    }
  }

  /**
   * Alternative method: Reorder products by their names directly
   * This is more direct for your UI implementation
   * @param {string} fromProduct - Name of the product being moved
   * @param {string} toProduct - Name of the product to move before/after
   * @param {'before' | 'after'} position - Whether to place before or after target
   * @public
   */
  public reorderProductsByName(
    fromProduct: string,
    toProduct: string,
    position: 'before' | 'after' = 'before'
  ): void {
    try {
      const uniqueProducts = [
        ...new Set(
          this.state.data.map((item: { product: any }) => item.product)
        ),
      ];
      const fromIndex = uniqueProducts.indexOf(fromProduct);
      const toIndex = uniqueProducts.indexOf(toProduct);

      if (fromIndex === -1 || toIndex === -1) {
        console.warn('Invalid product names for reordering:', {
          fromProduct,
          toProduct,
        });
        return;
      }

      // Calculate the actual target index based on position
      const actualToIndex = position === 'after' ? toIndex + 1 : toIndex;

      // Use the existing dragDataRow method
      this.dragDataRow(fromIndex, actualToIndex);
    } catch (error) {
      console.error('Error reordering products by name:', error);
    }
  }

  //swap logic

  // Also add a method to get the custom region order:
  public getCustomRegionOrder(): string[] | null {
    return (this.state as any).customRegionOrder || null;
  }

  // GENERIC CORE ENGINE METHODS - Works with any field names

  /**
   * Generic method to swap data rows based on the configured row field
   * Works with any field name (product, country, customer, etc.)
   */
  public swapDataRows(fromIndex: number, toIndex: number): void {
    // Get the row field configuration
    const rowField =
      this.state.rows && this.state.rows.length > 0
        ? this.state.rows[0] // Use first row field
        : null;

    if (!rowField) {
      console.warn('No row field configured for swapping');
      return;
    }

    const rowFieldName = rowField.uniqueName;

    // Get unique values for the row field from FULL DATASET - use current custom order if it exists
    const customRowOrder = (this.state as any).customRowOrder;
    let uniqueRowValues: string[];

    if (
      customRowOrder &&
      customRowOrder.fieldName === rowFieldName &&
      customRowOrder.order
    ) {
      // Use the current custom order
      uniqueRowValues = [...customRowOrder.order];
    } else {
      // Use original FULL data order - THIS IS THE KEY FIX
      uniqueRowValues = [
        ...new Set(
          (this.config.data || []).map(
            (item: { [x: string]: any }) => item[rowFieldName]
          )
        ),
      ].filter(
        (value): value is string =>
          typeof value === 'string' && value !== null && value !== undefined
      );
    }

    console.log(
      `Row swap validation: ${rowFieldName} has ${uniqueRowValues.length} unique values:`,
      uniqueRowValues
    );

    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= uniqueRowValues.length ||
      toIndex >= uniqueRowValues.length
    ) {
      console.warn(`Invalid indices for row swap operation:`, {
        fromIndex,
        toIndex,
        totalRows: uniqueRowValues.length,
        fieldName: rowFieldName,
      });
      return;
    }

    if (fromIndex === toIndex) {
      return; // No swap needed
    }

    try {
      // Get the values to swap
      const fromValue = uniqueRowValues[fromIndex];
      const toValue = uniqueRowValues[toIndex];

      // Create new data array with swapped order - use FULL dataset
      const newData = [...(this.config.data || [])];

      // Create swapped value order
      const swappedValues = [...uniqueRowValues];
      swappedValues[fromIndex] = toValue;
      swappedValues[toIndex] = fromValue;

      // Store the custom row order
      (this.state as any).customRowOrder = {
        fieldName: rowFieldName,
        order: swappedValues,
      };

      // Sort data according to the new value order
      newData.sort((a, b) => {
        const aIndex = swappedValues.indexOf(a[rowFieldName] as string);
        const bIndex = swappedValues.indexOf(b[rowFieldName] as string);
        return aIndex - bIndex;
      });

      // Update the config data (source of truth)
      this.config.data = newData;

      // Update the state with full data, then let pagination handle the subset
      this.state.rawData = newData;
      this.state.data = newData; // This will be re-paginated by refreshData

      // Regenerate processed data
      this.state.processedData = this.generateProcessedDataForDisplay();

      // Update aggregates if groups exist
      if (this.state.groups.length > 0) {
        this.updateAggregates();
      }

      // Call callback if provided
      if (typeof this.config.onRowDragEnd === 'function') {
        this.config.onRowDragEnd(fromIndex, toIndex, this.state.rowGroups);
      }

      console.log(`Row swap completed successfully for field: ${rowFieldName}`);

      // Emit state change to notify subscribers
      this._emit();
    } catch (error) {
      console.error('Error during row swap operation:', error);
    }
  }

  /**
   * Generic method to swap data columns based on the configured column field
   * Works with any field name (region, category, department, etc.)
   */
  public swapDataColumns(fromIndex: number, toIndex: number): void {
    // Get the column field configuration
    const columnField =
      this.state.columns && this.state.columns.length > 0
        ? this.state.columns[0] // Use first column field
        : null;

    if (!columnField) {
      console.warn('No column field configured for swapping');
      return;
    }

    const columnFieldName = columnField.uniqueName;

    // Get unique values for the column field from FULL DATASET - use current custom order if it exists
    const customColumnOrder = (this.state as any).customColumnOrder;
    let uniqueColumnValues: string[];

    if (
      customColumnOrder &&
      customColumnOrder.fieldName === columnFieldName &&
      customColumnOrder.order
    ) {
      // Use the current custom order
      uniqueColumnValues = [...customColumnOrder.order];
    } else {
      // Use original FULL data order - THIS IS THE KEY FIX
      uniqueColumnValues = [
        ...new Set(
          (this.config.data || []).map(
            (item: { [x: string]: any }) => item[columnFieldName]
          )
        ),
      ].filter(
        (value): value is string =>
          typeof value === 'string' && value !== null && value !== undefined
      );
    }

    console.log(
      `Column swap validation: ${columnFieldName} has ${uniqueColumnValues.length} unique values:`,
      uniqueColumnValues
    );

    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= uniqueColumnValues.length ||
      toIndex >= uniqueColumnValues.length
    ) {
      console.warn(`Invalid indices for column swap operation:`, {
        fromIndex,
        toIndex,
        totalColumns: uniqueColumnValues.length,
        fieldName: columnFieldName,
      });
      return;
    }

    if (fromIndex === toIndex) {
      return; // No swap needed
    }

    try {
      // Get the values to swap
      const fromValue = uniqueColumnValues[fromIndex];
      const toValue = uniqueColumnValues[toIndex];

      // Create swapped value order
      const swappedValues = [...uniqueColumnValues];
      swappedValues[fromIndex] = toValue;
      swappedValues[toIndex] = fromValue;

      // Update columns configuration if it exists
      if (this.state.columns && this.state.columns.length > 0) {
        const newColumns = [...this.state.columns];

        // Find and swap the column configurations
        const fromColumnIndex = newColumns.findIndex(
          col => col.uniqueName === fromValue
        );
        const toColumnIndex = newColumns.findIndex(
          col => col.uniqueName === toValue
        );

        if (fromColumnIndex !== -1 && toColumnIndex !== -1) {
          // Swap the column configurations
          [newColumns[fromColumnIndex], newColumns[toColumnIndex]] = [
            newColumns[toColumnIndex],
            newColumns[fromColumnIndex],
          ];
          this.state.columns = newColumns;
          console.log('Updated column configurations');
        }
      }

      // Store the custom column order
      (this.state as any).customColumnOrder = {
        fieldName: columnFieldName,
        order: swappedValues,
      };

      // Regenerate processed data with new column order
      this.state.processedData = this.generateProcessedDataForDisplay();

      // Update aggregates if groups exist
      if (this.state.groups.length > 0) {
        this.updateAggregates();
      }

      // Call callback if provided
      if (typeof this.config.onColumnDragEnd === 'function') {
        const mappedColumns: { uniqueName: string; caption: string }[] =
          swappedValues.map(value => ({
            uniqueName: value,
            caption: value,
          }));
        this.config.onColumnDragEnd(fromIndex, toIndex, mappedColumns);
      }

      console.log(
        `Column swap completed successfully for field: ${columnFieldName}`
      );

      // Emit state change to notify subscribers
      this._emit();
    } catch (error) {
      console.error('Error during column swap operation:', error);
    }
  }

  /**
   * Generic method to get unique values for any field
   * Uses the original config data, not the paginated state data
   * Utility method for UI components
   */
  public getUniqueFieldValues(fieldName: string): string[] {
    // Use the original config data, not the paginated state data
    const dataSource = this.config.data || [];

    console.log(
      `Getting unique values for field: ${fieldName} from ${dataSource.length} total items`
    );

    const uniqueValues = [
      ...new Set(
        dataSource.map((item: { [x: string]: any }) => item[fieldName])
      ),
    ].filter(
      (value): value is string =>
        typeof value === 'string' && value !== null && value !== undefined
    );

    console.log(
      `Found ${uniqueValues.length} unique values for ${fieldName}:`,
      uniqueValues
    );

    return uniqueValues;
  }

  // Also add this method to get unique values in their current custom order:
  /**
   * Get unique field values respecting any custom order that has been set
   */
  public getOrderedUniqueFieldValues(
    fieldName: string,
    isRowField = false
  ): string[] {
    // Check if there's a custom order for this field
    const customOrderKey = isRowField ? 'customRowOrder' : 'customColumnOrder';
    const customOrder = (this.state as any)[customOrderKey];

    if (
      customOrder &&
      customOrder.fieldName === fieldName &&
      customOrder.order
    ) {
      console.log(`Using custom order for ${fieldName}:`, customOrder.order);
      return customOrder.order;
    }

    // Fall back to natural order from full dataset
    return this.getUniqueFieldValues(fieldName);
  }

  /**
   * Generic method to get the configured row field name
   */
  public getRowFieldName(): string | null {
    return this.state.rows && this.state.rows.length > 0
      ? this.state.rows[0].uniqueName
      : null;
  }

  /**
   * Generic method to get the configured column field name
   */
  public getColumnFieldName(): string | null {
    return this.state.columns && this.state.columns.length > 0
      ? this.state.columns[0].uniqueName
      : null;
  }

  /**
   * Generic method to set custom field order
   * Can be used by UI to store custom arrangements
   */
  public setCustomFieldOrder(
    fieldName: string,
    order: string[],
    isRowField = true
  ): void {
    const customKey = isRowField ? 'customRowOrder' : 'customColumnOrder';
    (this.state as any)[customKey] = {
      fieldName,
      order,
    };

    // Regenerate processed data
    this.state.processedData = this.generateProcessedDataForDisplay();
    this._emit(); // Notify subscribers after state change
  }

  /**
   * Get ordered column values if custom order exists
   */
  public getOrderedColumnValues(): string[] | null {
    const customColumnOrder = (this.state as any).customColumnOrder;
    if (
      customColumnOrder &&
      customColumnOrder.order &&
      customColumnOrder.order.length > 0
    ) {
      console.log(
        'Engine returning custom column order:',
        customColumnOrder.order
      );
      return customColumnOrder.order;
    }
    console.log('Engine has no custom column order');
    return null;
  }

  /**
   * Get ordered row values if custom order exists
   */
  public getOrderedRowValues(): string[] | null {
    const customRowOrder = (this.state as any).customRowOrder;
    if (
      customRowOrder &&
      customRowOrder.order &&
      customRowOrder.order.length > 0
    ) {
      console.log('Engine returning custom row order:', customRowOrder.order);
      return customRowOrder.order;
    }
    console.log('Engine has no custom row order');
    return null;
  }

  /**
   * Method to swap raw data rows by index
   * This works directly with the raw data array regardless of pivot configuration
   */
  public swapRawDataRows(fromIndex: number, toIndex: number): void {
    if (!this.state.data || this.state.data.length === 0) {
      console.warn('No data available for raw row swap');
      return;
    }

    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.state.data.length ||
      toIndex >= this.state.data.length
    ) {
      console.warn(`Invalid indices for raw row swap operation:`, {
        fromIndex,
        toIndex,
        totalRows: this.state.data.length,
      });
      return;
    }

    if (fromIndex === toIndex) {
      return; // No swap needed
    }

    try {
      // Create a new data array with swapped rows
      const newData = [...this.state.data];
      const temp = newData[fromIndex];
      newData[fromIndex] = newData[toIndex];
      newData[toIndex] = temp;

      // Update the state
      this.state.data = newData;
      this.state.rawData = newData;

      // Regenerate processed data if needed
      if (this.state.dataHandlingMode === 'raw') {
        this.state.processedData = this.generateProcessedDataForDisplay();
      } else {
        // For processed mode, regenerate the pivot table
        this.state.processedData = this.generateProcessedDataForDisplay();
      }

      // Emit state change to notify subscribers
      this._emit();
    } catch (error) {
      console.error('Error during raw row swap operation:', error);
    }
  }

  /**
   * Checks if any of the current filters are for aggregated measures
   * @private
   */
  private hasAggregatedFilters(): boolean {
    return this.filterConfig.some(filter => {
      // Check if the filter field is an aggregated measure (e.g., "sum_price", "avg_sales")
      return (
        filter.field.includes('_') &&
        this.state.measures.some(
          measure =>
            filter.field === `${measure.aggregation}_${measure.uniqueName}`
        )
      );
    });
  }

  /**
   * Filters processed data based on aggregated values
   * @private
   */
  private filterProcessedData(originalData: T[]): T[] {
    // First, ensure we have grouped data for filtering
    if (this.state.groupConfig) {
      this.applyGrouping(originalData);
    }

    // Get all aggregated filters and regular field filters
    const aggregatedFilters = this.filterConfig.filter(
      filter =>
        filter.field.includes('_') &&
        this.state.measures.some(
          measure =>
            filter.field === `${measure.aggregation}_${measure.uniqueName}`
        )
    );

    const regularFilters = this.filterConfig.filter(
      filter =>
        !filter.field.includes('_') ||
        !this.state.measures.some(
          measure =>
            filter.field === `${measure.aggregation}_${measure.uniqueName}`
        )
    );

    // Apply regular field filters to raw data first
    let filteredData = originalData;
    if (regularFilters.length > 0) {
      filteredData = filteredData.filter(item =>
        regularFilters.every(filter => {
          const value = item[filter.field];
          const filterValue =
            typeof value === 'number' ? Number(filter.value) : filter.value;

          switch (filter.operator) {
            case 'equals':
              return value === filterValue;
            case 'contains':
              return String(value)
                .toLowerCase()
                .includes(String(filterValue).toLowerCase());
            case 'greaterThan':
              return Number(value) > Number(filterValue);
            case 'lessThan':
              return Number(value) < Number(filterValue);
            case 'between':
              return value >= filterValue[0] && value <= filterValue[1];
            default:
              return true;
          }
        })
      );
    }

    // If we have aggregated filters, we need to filter based on grouped data
    if (aggregatedFilters.length > 0) {
      // Re-apply grouping to the filtered data
      if (this.state.groupConfig) {
        this.applyGrouping(filteredData);
      }

      // Filter groups based on aggregated values
      const filteredGroups = this.state.groups.filter(group =>
        aggregatedFilters.every(filter => {
          const aggregateValue = group.aggregates[filter.field];
          const filterValue =
            typeof filter.value === 'string'
              ? Number(filter.value)
              : filter.value;

          switch (filter.operator) {
            case 'equals':
              return aggregateValue === filterValue;
            case 'greaterThan':
              return aggregateValue > (filterValue as number);
            case 'lessThan':
              return aggregateValue < (filterValue as number);
            case 'between': {
              const values = Array.isArray(filterValue)
                ? filterValue
                : [filterValue, filterValue];
              return (
                aggregateValue >= Number(values[0]) &&
                aggregateValue <= Number(values[1])
              );
            }
            default:
              return true;
          }
        })
      );

      // Extract the filtered data from the filtered groups
      filteredData = filteredGroups.flatMap(group => group.items);
    }

    return filteredData;
  }

  /**
   * Sets the layout for the pivot table (rows, columns, measures) in one call.
   * @param {AxisConfig[]} rows - Row fields
   * @param {AxisConfig[]} columns - Column fields
   * @param {MeasureConfig[]} measures - Measure fields
   * @public
   */
  public setLayout(
    rows: AxisConfig[],
    columns: AxisConfig[],
    measures: MeasureConfig[]
  ) {
    this.state.rows = rows || [];
    this.state.columns = columns || [];
    this.state.measures = this.normalizeMeasures(measures || []);

    // Keep selections in sync
    this.state.selectedMeasures = [...this.state.measures];
    this.state.selectedDimensions = [
      ...rows.map(
        r =>
          ({
            field: r.uniqueName,
            label: r.caption || r.uniqueName,
            type: 'string',
          }) as any
      ),
      ...columns.map(
        c =>
          ({
            field: c.uniqueName,
            label: c.caption || c.uniqueName,
            type: 'string',
          }) as any
      ),
    ];

    // Guarantee a single synthetic column when none provided (only if enabled)
    this.ensureSyntheticAllColumn();

    // Recompute
    this.state.processedData = this.generateProcessedDataForDisplay();
    this.updateAggregates();
    this._emit();
  }

  /**
   * Set only rows and columns, keeping measures unchanged
   * @param {AxisConfig[]} rows
   * @param {AxisConfig[]} columns
   * @public
   */
  public setRowsAndColumns(rows: AxisConfig[], columns: AxisConfig[]) {
    this.state.rows = rows || [];
    this.state.columns = columns || [];

    // Guarantee a single synthetic column when none provided (only if enabled)
    this.ensureSyntheticAllColumn();

    this.state.processedData = this.generateProcessedDataForDisplay();
    this.updateAggregates();
    this._emit();
  }

  private normalizeMeasures(measures: MeasureConfig[] = []): MeasureConfig[] {
    return (measures || []).map(m => {
      const hasCustomCaption =
        !!m.caption &&
        m.caption.trim().toLowerCase() !== m.uniqueName.toLowerCase();
      if (
        !hasCustomCaption &&
        (m.aggregation || this.config.defaultAggregation) === 'sum'
      ) {
        return { ...m, caption: `sum of ${m.uniqueName}` };
      }
      return m;
    });
  }
}
