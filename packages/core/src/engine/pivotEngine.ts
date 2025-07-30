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

  // Add cache for expensive calculations
  // private cache: Map<string, any> = new Map();

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
      measures: config.measures || [],
      sortConfig: [],
      rowSizes: this.initializeRowSizes(config.data || []),
      expandedRows: {},
      groupConfig: config.groupConfig || null,
      groups: [],
      selectedMeasures: config.measures || [],
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

    // Process data after loading
    this.state.processedData = this.generateProcessedDataForDisplay();

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
  }

  public setDataHandlingMode(mode: DataHandlingMode) {
    this.state.dataHandlingMode = mode;
    this.refreshData();
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
    return {
      headers: this.generateHeaders(),
      rows: this.generateRows(this.state.rawData),
      totals: this.calculateTotals(this.state.rawData),
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
  private generateRows(data: T[]): any[][] {
    if (!data || !this.state.rows || !this.state.columns) {
      return [];
    }
    return data.map(item => [
      ...this.state.rows.map(r => item[r.uniqueName]),
      ...this.state.columns.map(c => item[c.uniqueName]),
      ...this.state.measures.map(m => this.calculateMeasureValue(item, m)),
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

  /**
   * Sets the measures for the pivot table.
   * @param {MeasureConfig[]} measureFields - The measure configurations to set.
   * @public
   */
  public setMeasures(measureFields: MeasureConfig[]) {
    this.state.selectedMeasures = measureFields;
    this.state.processedData = this.generateProcessedDataForDisplay();
    this.updateAggregates();
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
  }

  /**
   * Formats a value based on the specified field's format.
   * @param {any} value - The value to format.
   * @param {string} field - The field name to use for formatting.
   * @returns {string} The formatted value as a string.
   * @public
   */
  public formatValue(value: any, field: string): string {
    const format = this.state.formatting[field];
    if (!format) return String(value);

    try {
      switch (format.type) {
        case 'currency':
          return new Intl.NumberFormat(format.locale || 'en-US', {
            style: 'currency',
            currency: format.currency || 'USD',
            minimumFractionDigits: format.decimals || 0,
            maximumFractionDigits: format.decimals || 0,
          }).format(value);
        case 'number':
          return new Intl.NumberFormat(format.locale || 'en-US', {
            minimumFractionDigits: format.decimals || 0,
            maximumFractionDigits: format.decimals || 0,
          }).format(value);
        case 'percentage':
          return new Intl.NumberFormat(format.locale || 'en-US', {
            style: 'percent',
            minimumFractionDigits: format.decimals || 0,
          }).format(value);
        case 'date':
          return new Date(value).toLocaleDateString(format.locale || 'en-US', {
            dateStyle: 'medium',
          });
        default:
          return String(value);
      }
    } catch (error) {
      console.error(`Error formatting value for field ${field}:`, error);
      return String(value);
    }
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
    const sortedData = this.sortData(
      this.state.rawData,
      this.state.sortConfig[0]
    );
    this.state.rawData = sortedData;

    if (this.state.groups.length > 0) {
      this.state.groups = this.sortGroups(
        this.state.groups,
        this.state.sortConfig[0]
      );
    }

    this.state.processedData = this.generateProcessedDataForDisplay();
    this.updateAggregates();
  }

  private sortData(data: T[], sortConfig: SortConfig): T[] {
    return [...data].sort((a, b) => {
      const aValue = this.getFieldValue(a, sortConfig);
      const bValue = this.getFieldValue(b, sortConfig);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private getFieldValue(item: T, sortConfig: SortConfig): number {
    if (sortConfig.type === 'measure') {
      const measure = this.state.measures.find(
        m => m.uniqueName === sortConfig.field
      );
      if (measure && measure.formula) {
        return measure.formula(item);
      }
    }
    return item[sortConfig.field] as number;
  }

  private sortGroups(groups: Group[], sortConfig: SortConfig): Group[] {
    return [...groups].sort((a, b) => {
      const aValue =
        a.aggregates[`${sortConfig.aggregation}_${sortConfig.field}`] || 0;
      const bValue =
        b.aggregates[`${sortConfig.aggregation}_${sortConfig.field}`] || 0;

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
            measure.formula!(item)
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
    }
  }

  /**
   * Toggles the expansion state of a row.
   * @param {string} rowId - The ID of the row to toggle.
   * @public
   */
  public toggleRowExpansion(rowId: string) {
    this.state.expandedRows[rowId] = !this.state.expandedRows[rowId];
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
    // Store original data
    const originalData = [...this.state.rawData];
    // Apply filters first
    let filteredData = this.filterData(originalData);
    // Update total pages based on filtered data
    this.paginationConfig.totalPages = Math.ceil(
      filteredData.length / this.paginationConfig.pageSize
    );
    // Apply pagination
    filteredData = this.paginateData(filteredData);

    // Update state with filtered and paginated data
    this.state.rawData = filteredData; // Add this line
    if (this.state.groupConfig) {
      // Pass the filtered data to grouping instead of using config
      this.applyGrouping(filteredData);
    }
    this.state.processedData = this.generateProcessedDataForDisplay();
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
    PivotExportService.exportToHTML(this.getState(), fileName);
  }

  /**
   * Exports the pivot table data to PDF and downloads the file.
   * @param {string} fileName - The name of the downloaded file (without extension).
   * @public
   */
  public exportToPDF(fileName = 'pivot-table'): void {
    PivotExportService.exportToPDF(this.getState(), fileName);
  }

  /**
   * Exports the pivot table data to Excel and downloads the file.
   * @param {string} fileName - The name of the downloaded file (without extension).
   * @public
   */
  public exportToExcel(fileName = 'pivot-table'): void {
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
      const fromRegion = uniqueRegions[fromIndex];
      const toRegion = uniqueRegions[toIndex];

      console.log(`Reordering regions: ${fromRegion} -> ${toRegion}`);

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
    console.log(`Swapping rows based on field: ${rowFieldName}`);

    // Get unique values for the row field
    const uniqueRowValues = [
      ...new Set(
        this.state.data.map((item: { [x: string]: any }) => item[rowFieldName])
      ),
    ].filter(
      (value): value is string =>
        typeof value === 'string' && value !== null && value !== undefined
    );

    console.log(`Core swapDataRows called:`, {
      fromIndex,
      toIndex,
      totalRows: uniqueRowValues.length,
      fieldName: rowFieldName,
      availableValues: uniqueRowValues,
    });

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
      console.log(
        `Swapping ${rowFieldName} values at indices ${fromIndex} and ${toIndex}`
      );

      // Get the values to swap
      const fromValue = uniqueRowValues[fromIndex];
      const toValue = uniqueRowValues[toIndex];

      console.log(`Swapping ${rowFieldName}: ${fromValue} <-> ${toValue}`);

      // Create new data array with swapped order
      const newData = [...this.state.data];

      // Create swapped value order
      const swappedValues = [...uniqueRowValues];
      swappedValues[fromIndex] = toValue;
      swappedValues[toIndex] = fromValue;

      // Sort data according to the new value order
      newData.sort((a, b) => {
        const aIndex = swappedValues.indexOf(a[rowFieldName] as string);
        const bIndex = swappedValues.indexOf(b[rowFieldName] as string);
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

      console.log(`Row swap completed successfully for field: ${rowFieldName}`);
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
    console.log(`Swapping columns based on field: ${columnFieldName}`);

    // Get unique values for the column field
    const uniqueColumnValues = [
      ...new Set(
        this.state.data.map(
          (item: { [x: string]: any }) => item[columnFieldName]
        )
      ),
    ].filter(
      (value): value is string =>
        typeof value === 'string' && value !== null && value !== undefined
    );

    console.log(`Core swapDataColumns called:`, {
      fromIndex,
      toIndex,
      totalColumns: uniqueColumnValues.length,
      fieldName: columnFieldName,
      availableValues: uniqueColumnValues,
    });

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
      console.log(
        `Swapping ${columnFieldName} values at indices ${fromIndex} and ${toIndex}`
      );

      // Get the values to swap
      const fromValue = uniqueColumnValues[fromIndex];
      const toValue = uniqueColumnValues[toIndex];

      console.log(`Swapping ${columnFieldName}: ${fromValue} <-> ${toValue}`);

      // Create swapped value order
      const swappedValues = [...uniqueColumnValues];
      swappedValues[fromIndex] = toValue;
      swappedValues[toIndex] = fromValue;

      console.log(`New ${columnFieldName} order:`, swappedValues);

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

      // Store the custom column order (generic key for any field)
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
    } catch (error) {
      console.error('Error during column swap operation:', error);
    }
  }

  /**
   * Generic method to get unique values for any field
   * Utility method for UI components
   */
  public getUniqueFieldValues(fieldName: string): string[] {
    return [
      ...new Set(
        this.state.data.map((item: { [x: string]: any }) => item[fieldName])
      ),
    ].filter(
      (value): value is string =>
        typeof value === 'string' && value !== null && value !== undefined
    );
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
    isRowField: boolean = true
  ): void {
    const customKey = isRowField ? 'customRowOrder' : 'customColumnOrder';
    (this.state as any)[customKey] = {
      fieldName,
      order,
    };

    // Regenerate processed data
    this.state.processedData = this.generateProcessedDataForDisplay();
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
}
