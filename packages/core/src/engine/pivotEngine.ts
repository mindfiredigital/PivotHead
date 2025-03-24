/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
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
} from '../types/interfaces';
import { calculateAggregates } from './aggregator';
import { processData } from './dataProcessor';
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
        this.state.data = await this.fetchRemoteData(url);
      } else if (type === 'file' && file) {
        this.state.data = await this.readFileData(file);
      } else {
        console.error('Invalid data source configuration');
      }
    } else if (this.config.data) {
      this.state.data = this.config.data;
    }

    // Initialize row sizes
    this.state.rowSizes = this.initializeRowSizes(this.state.data);

    // Process data after loading
    this.state.processedData = this.processData(this.state.data);

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
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
  private processData(data: T[]): ProcessedData {
    return {
      headers: this.generateHeaders(),
      rows: this.generateRows(data),
      totals: this.calculateTotals(data),
    };
  }

  /**
   * Generates headers for the pivot table.
   * @returns {string[]} An array of header strings.
   * @private
   */
  private generateHeaders(): string[] {
    const rowHeaders = this.state.rows
      ? this.state.rows.map(r => r.caption || r.uniqueName)
      : [];
    const columnHeaders = this.state.columns
      ? this.state.columns.map(c => c.caption || c.uniqueName)
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
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  /**
   * Sets the dimensions for the pivot table.
   * @param {Dimension[]} dimensionFields - The dimension configurations to set.
   * @public
   */
  public setDimensions(dimensionFields: Dimension[]) {
    this.state.selectedDimensions = dimensionFields;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  /**
   * Sets the aggregation type for the pivot table.
   * @param {AggregationType} type - The aggregation type to set.
   * @public
   */
  public setAggregation(type: AggregationType) {
    this.state.selectedAggregation = type;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
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
    const sortedData = this.sortData(this.state.data, this.state.sortConfig[0]);
    this.state.data = sortedData;

    if (this.state.groups.length > 0) {
      this.state.groups = this.sortGroups(
        this.state.groups,
        this.state.sortConfig[0]
      );
    }

    this.state.processedData = this.processData(this.state.data);
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
  private applyGrouping() {
    if (!this.state.groupConfig) return;

    const { rowFields, columnFields, grouper } = this.state.groupConfig;

    if (!rowFields || !columnFields || !grouper) {
      console.error('Invalid groupConfig:', this.state.groupConfig);
      return;
    }

    const { data, groups } = processData(
      this.config,
      this.state.sortConfig[0] || null,
      this.state.groupConfig
    );

    this.state.data = data;
    this.state.groups = groups;
    this.updateAggregates();
    this.state.processedData = this.processData(this.state.data);
  }

  /**
   * Creates groups based on the specified fields and grouper function.
   * @param {T[]} data - The data to group.
   * @param {string[]} fields - The fields to group by.
   * @param {(item: T, fields: string[]) => string} grouper - The grouping function.
   * @returns {Group[]} An array of grouped data.
   * @private
   */
  private createGroups(
    data: T[],
    fields: string[],
    grouper: (item: T, fields: string[]) => string
  ): Group[] {
    if (!fields || fields.length === 0 || !data) {
      return [
        {
          key: 'All',
          items: data || [],
          aggregates: {},
        },
      ];
    }

    const groups: { [key: string]: Group } = {};

    data.forEach(item => {
      if (item && grouper) {
        const key = grouper(item, fields);
        if (!groups[key]) {
          groups[key] = { key, items: [], subgroups: [], aggregates: {} };
        }
        groups[key].items.push(item);
      }
    });

    if (fields.length > 1) {
      Object.values(groups).forEach(group => {
        if (group && group.items) {
          group.subgroups = this.createGroups(
            group.items,
            fields.slice(1),
            grouper
          );
        }
      });
    }

    // Calculate aggregates for each group
    Object.values(groups).forEach(group => {
      if (group && group.items && this.state.measures) {
        this.state.measures.forEach(measure => {
          if (measure && measure.uniqueName) {
            const aggregateKey = `${this.state.selectedAggregation}_${measure.uniqueName}`;
            group.aggregates[aggregateKey] = calculateAggregates(
              group.items,
              measure.uniqueName as keyof T,
              this.state.selectedAggregation as AggregationType
            );
          }
        });
      }
    });

    return Object.values(groups);
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
      this.state.processedData = this.processData(this.state.data);
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
      data: this.config.data || [],
      processedData: this.processData(this.config.data || []),
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
   * @param {number} fromIndex - The original index of the row.
   * @param {number} toIndex - The new index for the row.
   * @public
   */
  public dragRow(fromIndex: number, toIndex: number) {
    // Prevent invalid indices
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.state.data.length ||
      toIndex >= this.state.data.length
    ) {
      console.warn('Invalid drag indices');
      return;
    }

    // Create new data array with reordered items
    const newData = [...this.state.data];
    const [removed] = newData.splice(fromIndex, 1);
    newData.splice(toIndex, 0, removed);

    // Update state
    this.state.data = newData;

    // Update row sizes while maintaining references
    const newRowSizes = [...this.state.rowSizes];
    const [removedSize] = newRowSizes.splice(fromIndex, 1);
    newRowSizes.splice(toIndex, 0, removedSize);

    // Update indices
    this.state.rowSizes = newRowSizes.map((size, index) => ({
      ...size,
      index,
    }));

    // If groups exist, update group order
    if (this.state.groups.length > 0) {
      const newGroups = [...this.state.groups];
      const [removedGroup] = newGroups.splice(fromIndex, 1);
      newGroups.splice(toIndex, 0, removedGroup);
      this.state.groups = newGroups;
    }

    // Refresh processed data and aggregates
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();

    // Emit change event if needed
    if (typeof this.config.onRowDragEnd === 'function') {
      this.config.onRowDragEnd(fromIndex, toIndex, this.state.data);
    }
  }
  /**
   * Handles dragging a column to a new position.
   * @param {number} fromIndex - The original index of the column.
   * @param {number} toIndex - The new index for the column.
   * @public
   */
  public dragColumn(fromIndex: number, toIndex: number): void {
    // Validate indices
    if (
      !this.validateDragOperation(fromIndex, toIndex, this.state.columns.length)
    ) {
      console.error(
        `Invalid column drag operation: from ${fromIndex} to ${toIndex}`
      );
      return;
    }

    try {
      // Create new columns array with reordered items
      const newColumns = [...this.state.columns];
      const [removed] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, removed);

      // Update column state
      this.state.columns = newColumns;

      // Update column widths if they exist
      if (Object.keys(this.state.columnWidths).length > 0) {
        const newColumnWidths: Record<string, number> = {};
        Object.keys(this.state.columnWidths).forEach((key, index) => {
          if (index === fromIndex) {
            newColumnWidths[newColumns[toIndex].uniqueName] =
              this.state.columnWidths[key];
          } else if (index === toIndex) {
            newColumnWidths[newColumns[fromIndex].uniqueName] =
              this.state.columnWidths[key];
          } else {
            newColumnWidths[key] = this.state.columnWidths[key];
          }
        });
        this.state.columnWidths = newColumnWidths;
      }

      // Update column groups if they exist
      if (this.state.columnGroups.length > 0) {
        const newColumnGroups = [...this.state.columnGroups];
        const [removedGroup] = newColumnGroups.splice(fromIndex, 1);
        newColumnGroups.splice(toIndex, 0, removedGroup);
        this.state.columnGroups = newColumnGroups;
      }

      // Refresh processed data and aggregates
      this.state.processedData = this.processData(this.state.data);
      this.updateAggregates();

      // Emit change event if needed
      if (typeof this.config.onColumnDragEnd === 'function') {
        const columnsWithCaptions = this.state.columns.map(column => ({
          ...column,
          caption: column.caption || column.uniqueName,
        }));
        this.config.onColumnDragEnd(fromIndex, toIndex, columnsWithCaptions);
      }
    } catch (error) {
      console.error('Error during column drag operation:', error);
    }
  }

  private validateDragOperation(
    fromIndex: number,
    toIndex: number,
    length: number
  ): boolean {
    return (
      fromIndex >= 0 &&
      toIndex >= 0 &&
      fromIndex < length &&
      toIndex < length &&
      fromIndex !== toIndex
    );
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
   * Refreshes data with current filters and pagination
   * @private
   */
  private refreshData() {
    // Store original data
    const originalData = [...this.state.data];

    // Apply filters first
    let filteredData = this.filterData(originalData);

    // Update total pages based on filtered data
    this.paginationConfig.totalPages = Math.ceil(
      filteredData.length / this.paginationConfig.pageSize
    );

    // Apply pagination
    filteredData = this.paginateData(filteredData);

    // Update state with filtered and paginated data
    this.state.processedData = this.processData(filteredData);

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
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
   * Converts the pivot table data to HTML.
   * @private
   * @returns {string} HTML string representation of the pivot table.
   */
  private convertToHtml(): string {
    const { rows, columns, selectedMeasures, formatting, groups, data } =
      this.state;

    if (!rows.length || !columns.length) {
      return '<div>No data to display</div>';
    }

    // Get unique column values
    const uniqueColumns = [
      ...new Set(data.map(item => item[columns[0].uniqueName])),
    ];

    // Get unique row values
    const uniqueRows = [...new Set(data.map(item => item[rows[0].uniqueName]))];

    const formatValue = (value: any, formatConfig: any): string => {
      if (value === 0) return '$0.00';
      if (!value && value !== 0) return '';

      if (formatConfig.type === 'currency') {
        return new Intl.NumberFormat(formatConfig.locale, {
          style: 'currency',
          currency: formatConfig.currency,
          minimumFractionDigits: formatConfig.decimals,
          maximumFractionDigits: formatConfig.decimals,
        }).format(value);
      } else if (formatConfig.type === 'number') {
        return new Intl.NumberFormat(formatConfig.locale, {
          minimumFractionDigits: formatConfig.decimals,
          maximumFractionDigits: formatConfig.decimals,
        }).format(value);
      }

      return String(value);
    };

    // Determine cell background based on conditional formatting (placeholder function)
    const getCellStyle = (value: any, measureName: string): string => {
      return '';
    };

    // Create HTML string
    let html = `
  <div class="pivot-export">
    <style>
      .pivot-table {
        border-collapse: collapse;
        width: 100%;
        font-family: Arial, sans-serif;
      }
      .pivot-table th, .pivot-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: right;
      }
      .pivot-table th {
        background-color: #f2f2f2;
        font-weight: bold;
        text-align: center;
        position: relative;
      }
      .pivot-table .sort-icon::after {
        content: "↕";
        position: absolute;
        right: 4px;
        opacity: 0.5;
      }
      .pivot-table th.region-header {
        border-bottom: none;
      }
      .pivot-table th.measure-header {
        border-top: none;
      }
      .pivot-table .row-header {
        text-align: left;
        font-weight: bold;
        background-color: #f9f9f9;
      }
      .pivot-table .corner-header {
        background-color: #f2f2f2;
        border-bottom: 1px solid #ddd;
      }
      .pagination {
        margin-top: 15px;
        font-family: Arial, sans-serif;
      }
      .export-info {
        margin-top: 15px;
        font-size: 0.8em;
        color: #666;
        font-family: Arial, sans-serif;
      }
    </style>
    
    <table class="pivot-table">
      <thead>
        <tr>
          <th rowspan="2" class="corner-header">${rows[0]?.caption || rows[0]?.uniqueName || ''} /<br>Region</th>`;

    // Add region headers
    uniqueColumns.forEach(column => {
      html += `<th colspan="${selectedMeasures.length}" class="region-header">${column}</th>`;
    });

    html += `
        </tr>
        <tr>`;

    // Add measure headers under each region
    uniqueColumns.forEach(column => {
      selectedMeasures.forEach(measure => {
        html += `<th class="measure-header sort-icon">${measure.caption || measure.uniqueName}</th>`;
      });
    });

    html += `
        </tr>
      </thead>
      <tbody>`;

    // Add data rows
    uniqueRows.forEach(row => {
      html += `<tr>
      <td class="row-header">${row}</td>`;

      // Add cells for each column (region)
      uniqueColumns.forEach(column => {
        // Find the group that matches this row and column
        const group = groups.find(g => g.key === `${row} - ${column}`);

        selectedMeasures.forEach(measure => {
          const measureKey = `sum_${measure.uniqueName}`;
          let value = group ? group.aggregates[measureKey] : 0;

          // Apply conditional formatting
          const cellStyle = getCellStyle(value, measure.uniqueName);

          // Format value according to measure settings
          const formattedValue = formatValue(
            value,
            formatting[measure.uniqueName]
          );

          html += `<td${cellStyle}>${formattedValue}</td>`;
        });
      });

      html += `</tr>`;
    });

    html += `
      </tbody>
    </table>
    
    <div class="pagination">
      Page ${this.paginationConfig.currentPage} of ${this.paginationConfig.totalPages}
    </div>
    
    <div class="export-info">
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>`;

    return html;
  }

  /**
   * Exports the pivot table data to HTML and downloads the file.
   * @param {string} fileName - The name of the downloaded file (without extension).
   * @public
   */

  public exportToHTML(fileName = 'pivot-table'): void {
    const htmlContent = this.convertToHtml();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Exports the pivot table data to PDF and downloads the file.
   * @param {string} fileName - The name of the downloaded file (without extension).
   * @public
   */
  public exportToPDF(fileName = 'pivot-table'): void {
    // Convert pivot data to an HTML table
    const htmlContent = this.convertToHtml();

    // Create a temporary container for the HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // Hide off-screen
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Extract the table from the container
    const tableElement = container.querySelector('table');

    if (!tableElement) {
      console.error('No table found in the generated HTML');
      document.body.removeChild(container);
      return;
    }

    try {
      // Create a new PDF document
      const pdf = new jsPDF();

      // Add title
      pdf.setFontSize(16);
      pdf.text(fileName, pdf.internal.pageSize.getWidth() / 2, 15, {
        align: 'center',
      });

      // Use autoTable to convert the HTML table to PDF
      autoTable(pdf, {
        html: tableElement,
        startY: 25,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {},
        margin: { top: 25, right: 15, bottom: 25, left: 15 },
        didDrawPage: (data: { pageNumber: number }) => {
          pdf.setFontSize(10);
          pdf.text(
            `Page ${data.pageNumber}`,
            pdf.internal.pageSize.getWidth() - 20,
            pdf.internal.pageSize.getHeight() - 10
          );
        },
      });

      // Save the PDF
      pdf.save(`${fileName}.pdf`);

      // Clean up
      document.body.removeChild(container);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      document.body.removeChild(container);
    }
  }

  /**
   * Exports the pivot table data to Excel and downloads the file.
   * @param {string} fileName - The name of the downloaded file (without extension).
   * @public
   */
  public exportToExcel(fileName = 'pivot-table'): void {
    try {
      this.generateExcel(fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  }

  /**
   * Generates an Excel file from the pivot table data.
   * @private
   * @param {string} fileName - The name of the downloaded file (without extension).
   */
  private generateExcel(fileName: string): void {
    const state = this.getState();

    if (!state.data || state.data.length === 0) {
      console.log('No data to export!');
      return;
    }

    // Get dimension and measure configurations
    const rows = state.rows || [];
    const columns = state.columns || [];
    const measures = state.measures || [];

    // Extract unique dimension values
    const rowDimension = rows[0]?.uniqueName;
    const colDimension = columns[0]?.uniqueName;

    if (!rowDimension || !colDimension) {
      console.log('Missing row or column dimension');
      return;
    }

    const uniqueRowValues = [
      ...new Set(state.data.map(item => item[rowDimension])),
    ];
    const uniqueColValues = [
      ...new Set(state.data.map(item => item[colDimension])),
    ];

    // Create header rows
    const headerRow = [
      rows[0]?.caption || 'Dimension',
      ...uniqueColValues.flatMap(colValue =>
        measures.map(
          measure => `${colValue} - ${measure.caption || measure.uniqueName}`
        )
      ),
    ];

    // Create data rows
    const dataRows = uniqueRowValues.map(rowValue => {
      const row = [rowValue];

      uniqueColValues.forEach(colValue => {
        measures.forEach(measure => {
          // Filter data for this row and column intersection
          const filteredData = state.data.filter(
            item =>
              item[rowDimension] === rowValue && item[colDimension] === colValue
          );

          // Calculate the aggregated value
          let value = 0;
          if (filteredData.length > 0) {
            switch (measure.aggregation) {
              case 'sum':
                value = filteredData.reduce(
                  (sum, item) => sum + (item[measure.uniqueName] || 0),
                  0
                );
                break;
              case 'avg':
                if (
                  measure?.formula &&
                  typeof measure.formula === 'function' &&
                  filteredData.length > 0
                ) {
                  value =
                    filteredData.reduce(
                      (sum, item) => sum + (measure.formula?.(item) || 0),
                      0
                    ) / filteredData.length;
                } else {
                  value =
                    filteredData.reduce(
                      (sum, item) => sum + (item[measure.uniqueName] || 0),
                      0
                    ) / filteredData.length;
                }
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
          }

          // For Excel, we keep the raw numeric value
          row.push(value);
        });
      });

      return row;
    });

    // Add a totals row if available
    if (state.processedData && state.processedData.totals) {
      const totalsRow = ['Total'];

      uniqueColValues.forEach(colValue => {
        measures.forEach(measure => {
          // Get total for this measure across all data
          const totalValue =
            state.processedData.totals[measure.uniqueName] || 0;
          totalsRow.push(totalValue?.toString());
        });
      });

      dataRows.push(totalsRow);
    }

    // Combine header and data rows
    const allRows = [headerRow, ...dataRows];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Apply some basic styling
    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1:A1');

    // Set column widths
    const colWidths = [];
    for (let i = 0; i <= range.e.c; i++) {
      colWidths[i] = { wch: i === 0 ? 15 : 12 }; // First column wider, data columns standard
    }
    ws['!cols'] = colWidths;

    // Apply number formatting for data cells
    for (let row = 1; row <= dataRows.length; row++) {
      for (
        let col = 1;
        col <= uniqueColValues.length * measures.length;
        col++
      ) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

        // Find the measure for this column
        const measureIndex = (col - 1) % measures.length;
        const measure = measures[measureIndex];

        if (measure && measure.format && ws[cellAddress]) {
          if (measure.format.type === 'currency') {
            // Apply currency format
            ws[cellAddress].z =
              measure.format.currency === 'USD'
                ? '"$"#,##0.00'
                : `"${measure.format.currency}"#,##0.00`;
          } else if (
            measure.format.type === 'number' &&
            measure.format.decimals !== undefined
          ) {
            // Apply decimal format
            const format =
              '#,##0' +
              (measure.format.decimals > 0
                ? '.' + '0'.repeat(measure.format.decimals)
                : '');
            ws[cellAddress].z = format;
          } else if (measure.format.type === 'percentage') {
            ws[cellAddress].z = '0.00%';
            // Convert decimal to percentage for display
            if (typeof ws[cellAddress].v === 'number') {
              ws[cellAddress].v = ws[cellAddress].v / 100;
            }
          }
        }
      }
    }

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pivot Table');

    // Generate Excel file and download
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  public openPrintDialog(): void {
    const htmlContent = this.convertToHtml();

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print dialog');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}
