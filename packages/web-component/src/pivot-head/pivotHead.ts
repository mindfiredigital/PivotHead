import { PivotEngine } from '@mindfiredigital/pivothead';
import type {
  PivotTableConfig,
  FilterConfig,
  PivotTableState,
  Dimension,
  GroupConfig,
  MeasureConfig,
  AggregationType,
  Group,
  PaginationConfig,
  AxisConfig,
} from '@mindfiredigital/pivothead';
/**
 * Enhanced interface extending PivotEngine with additional methods
 * This ensures type safety when casting the engine instance
 */
interface EnhancedPivotEngine<T extends Record<string, unknown>>
  extends PivotEngine<T> {
  state: PivotTableState<T>;
  getPagination(): PaginationConfig;
  applyFilters(filters: FilterConfig[]): void;
  setMeasures(measures: MeasureConfig[]): void;
  setDimensions(dimensions: Dimension[]): void;
  getFilterState(): FilterConfig[];
  reset(): void;
  sort(field: string, direction: 'asc' | 'desc'): void;
  setGroupConfig(config: GroupConfig | null): void;
  setAggregation(type: AggregationType): void;
  formatValue(value: unknown, field: string): string;
  getGroupedData(): Group[];
  exportToHTML(fileName: string): void;
  exportToPDF(fileName: string): void;
  exportToExcel(fileName: string): void;
  openPrintDialog(): void;
  // Drag methods from core
  dragRow(fromIndex: number, toIndex: number): void;
  dragColumn(fromIndex: number, toIndex: number): void;
  swapDataRows(fromIndex: number, toIndex: number): void;
  swapRawDataRows(fromIndex: number, toIndex: number): void;
  swapDataColumns(fromIndex: number, toIndex: number): void;
  setRowGroups(rowGroups: Group[]): void;
  setColumnGroups(columnGroups: Group[]): void;
  toggleRowExpansion(rowId: string): void;
  isRowExpanded(rowId: string): boolean;
  setPagination(config: PaginationConfig): void;
  getPaginationState(): PaginationConfig;
  getOrderedColumnValues(): string[] | null;
  getOrderedRowValues(): string[] | null;
  subscribe(fn: (state: PivotTableState<T>) => void): () => void;
  setDataHandlingMode(mode: 'raw' | 'processed'): void;
  getDataHandlingMode(): 'raw' | 'processed';
  updateDataSource(newData: T[]): void;
}

// Define a type for pivot data records
type PivotDataRecord = Record<string, unknown>;

// Define a type for pivot options
interface PivotOptions {
  rows?: AxisConfig[];
  columns?: AxisConfig[];
  measures?: MeasureConfig[];
  groupConfig?: GroupConfig;
  [key: string]: unknown;
}

export class PivotHeadElement extends HTMLElement {
  private engine!: EnhancedPivotEngine<PivotDataRecord>;
  private _engineUnsubscribe: (() => void) | null = null;
  private _data: PivotDataRecord[] = [];
  private _originalData: PivotDataRecord[] = []; // Store original data copy for raw data filtering
  private _options: PivotOptions = {};
  private _filters: FilterConfig[] = [];
  private _rawFilters: FilterConfig[] = []; // Separate filters for raw data
  private _processedFilters: FilterConfig[] = []; // Separate filters for processed data
  private _rowGroups: Group[] = [];
  private _columnGroups: Group[] = [];
  private _pagination: PaginationConfig = {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  };
  private _showRawData = false; // Track which view to show
  private _rawDataColumnOrder: string[] = []; // Track column order for raw data
  private _processedColumnOrder: string[] = []; // Track column order for processed data (independent of engine)

  // --- Restore advanced interface and mode switch ---
  static get observedAttributes(): string[] {
    return ['data', 'options', 'filters', 'pagination', 'mode'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  /**
   * Data setter - automatically initializes/reinitializes when set
   */
  set data(value: PivotDataRecord[]) {
    this._data = value || [];
    this._originalData = [...(value || [])]; // Store a copy of original data
    this.tryInitializeEngine();
  }

  get data(): PivotDataRecord[] {
    return this._data;
  }

  /**
   * Options setter - automatically initializes/reinitializes when set
   */
  set options(value: PivotOptions) {
    this._options = value || {};
    this.tryInitializeEngine();
  }

  get options(): PivotOptions {
    return this._options;
  }

  /**
   * Getter and setter for filters property
   */
  set filters(value: FilterConfig[]) {
    console.log(
      'Setting filters, current view mode:',
      this._showRawData ? 'RAW' : 'PROCESSED'
    );
    console.log('New filter value:', value);

    // Store filters based on current view mode
    if (this._showRawData) {
      this._rawFilters = value || [];
      console.log('Applied RAW filters:', this._rawFilters);
    } else {
      this._processedFilters = value || [];
      console.log('Applied PROCESSED filters:', this._processedFilters);
    }

    // Apply filters using the core engine
    if (this.engine) {
      // Set the appropriate data handling mode
      this.engine.setDataHandlingMode(this._showRawData ? 'raw' : 'processed');
      // Apply the filters using the core engine
      this.engine.applyFilters(value || []);
    }

    // Keep backward compatibility
    this._filters = value || [];
    this.setAttribute('filters', JSON.stringify(value));
  }

  get filters(): FilterConfig[] {
    // Return filters based on current view mode
    if (this._showRawData) {
      return this._rawFilters;
    } else {
      return this._processedFilters;
    }
  }

  /**
   * Getter and setter for pagination property
   */
  set pagination(value: PaginationConfig) {
    this._pagination = { ...this._pagination, ...value };
    this.setAttribute('pagination', JSON.stringify(this._pagination));
    // Only trigger re-render, don't affect engine calculations
    this._renderSwitch();
  }

  get pagination(): PaginationConfig {
    return this._pagination;
  }

  private handleEngineStateChange(
    state: PivotTableState<PivotDataRecord>
  ): void {
    this.dispatchEvent(
      new CustomEvent('stateChange', {
        detail: state,
        bubbles: true,
        composed: true,
      })
    );

    // Keep pagination in sync for all modes, including minimal and default
    this.calculatePaginationForCurrentView();

    // Render based on mode
    const mode = this.getAttribute('mode');
    if (mode === 'none') {
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `<style>:host { display:block; }</style>`;
      }
    } else if (mode === 'minimal') {
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
        <style>
        :host { display: block; font-family: inherit; }
        [data-pivot-root] {
          display: grid;
          border: 1px solid #d8dde2; border-radius: 6px; background: #fcfdff;
        }
        [data-pivot-header], [data-pivot-body] {
          padding: 0.3em 0.5em;
        }
        [data-pivot-header] {
          background: #f4f7fa;
          border-bottom: 1px solid #e2e7ed;
          font-weight: bold;
        }
        </style>
        <div role="grid" data-pivot-root>
          <div role="rowgroup" data-pivot-header><slot name="header"></slot></div>
          <div role="rowgroup" data-pivot-body><slot name="body"></slot></div>
        </div>
      `;
      }
    } else {
      this._showRawData ? this.renderRawTable() : this.renderFullUI();
    }
  }

  /**
   * Single method to handle engine initialization
   * Only creates engine when BOTH data and options are available
   */
  private tryInitializeEngine(): void {
    // Check if we have the minimum required data
    const hasData = this._data && this._data.length > 0;
    const hasOptions = this._options && Object.keys(this._options).length > 0;
    if (!hasData || !hasOptions) {
      return;
    }

    try {
      // Fallback: If rows/columns/measures are missing, infer from data
      const options = { ...this._options };
      if (
        !options.rows ||
        !Array.isArray(options.rows) ||
        options.rows.length === 0
      ) {
        // Use first string field as row
        const firstRowField =
          this._data.length > 0 ? Object.keys(this._data[0])[0] : null;
        if (firstRowField) {
          options.rows = [
            { uniqueName: firstRowField, caption: firstRowField },
          ];
        }
      }
      if (
        !options.columns ||
        !Array.isArray(options.columns) ||
        options.columns.length === 0
      ) {
        // Use second string field as column if available
        const keys = this._data.length > 0 ? Object.keys(this._data[0]) : [];
        const colField = keys.length > 1 ? keys[1] : null;
        if (colField) {
          options.columns = [{ uniqueName: colField, caption: colField }];
        }
      }
      if (
        !options.measures ||
        !Array.isArray(options.measures) ||
        options.measures.length === 0
      ) {
        // Use first numeric field as measure
        const keys = this._data.length > 0 ? Object.keys(this._data[0]) : [];
        const measureField = keys.find(
          k => typeof this._data[0][k] === 'number'
        );
        if (measureField) {
          options.measures = [
            {
              uniqueName: measureField,
              caption: `Sum of ${measureField}`,
              aggregation: 'sum',
            },
          ];
        }
      }
      // Set a default groupConfig if not provided
      if (!options.groupConfig && options.rows && options.columns) {
        options.groupConfig = {
          rowFields: options.rows.map(r => r.uniqueName),
          columnFields: options.columns.map(c => c.uniqueName),
          grouper: (item: PivotDataRecord) => {
            // Group by row and column field values
            return [
              ...(options.rows?.map(r => item[r.uniqueName]) ?? []),
              ...(options.columns?.map(c => item[c.uniqueName]) ?? []),
            ].join('|');
          },
        };
      }
      // Create the engine configuration
      const config: PivotTableConfig<PivotDataRecord> = {
        data: this._data,
        rawData: this._data,
        dimensions: [],
        defaultAggregation: 'sum' as AggregationType,
        rows: options.rows || [],
        columns: options.columns || [],
        measures: options.measures || [],
        groupConfig: options.groupConfig,
        // Don't pass pageSize to engine - pagination is only for display
      };
      // Create or recreate the engine
      this.engine = new PivotEngine(
        config
      ) as EnhancedPivotEngine<PivotDataRecord>;

      // Set the appropriate data handling mode
      this.engine.setDataHandlingMode(this._showRawData ? 'raw' : 'processed');

      // Unsubscribe previous if exists
      if (this._engineUnsubscribe) this._engineUnsubscribe();
      // Subscribe to engine state changes
      this._engineUnsubscribe = this.engine.subscribe(
        this.handleEngineStateChange.bind(this)
      );

      // Reset local states when engine is recreated
      this._processedColumnOrder = [];
      // Clear filters when switching views

      // Don't set pagination on engine - keep it local for display only

      // Apply existing filters if any using core engine
      const currentFilters = this._showRawData
        ? this._rawFilters
        : this._processedFilters;
      if (currentFilters.length > 0) {
        this.engine.applyFilters(currentFilters);
        return; // Don't continue since applyFilters will recreate the engine
      }

      // No need to call notifyStateChange here; subscription will trigger initial render
    } catch (error) {
      console.error('Error initializing PivotEngine:', error);
    }
  }

  /**
   * Called when element is added to the DOM
   */
  connectedCallback(): void {
    // Only parse attributes if properties haven't been set yet
    if (!this._data.length && !Object.keys(this._options).length) {
      this.parseAttributesIfNeeded();
    }
    this._renderSwitch();
  }

  private parseAttributesIfNeeded(): void {
    // Parse data attribute
    const rawData = this.getAttribute('data');
    if (rawData && !this._data.length) {
      try {
        this.data = JSON.parse(rawData); // Use setter
      } catch (error) {
        console.error('Error parsing data attribute:', error);
      }
    }

    // Parse options attribute
    const rawOptions = this.getAttribute('options');
    if (rawOptions && !Object.keys(this._options).length) {
      try {
        this.options = JSON.parse(rawOptions); // Use setter
      } catch (error) {
        console.error('Error parsing options attribute:', error);
      }
    }

    // Parse other attributes
    this.parseOtherAttributes();
  }

  private parseOtherAttributes(): void {
    // Parse filters
    const rawFilters = this.getAttribute('filters');
    if (rawFilters) {
      try {
        this.filters = JSON.parse(rawFilters);
      } catch (error) {
        console.error('Error parsing filters attribute:', error);
      }
    }

    // Parse pagination
    const rawPagination = this.getAttribute('pagination');
    if (rawPagination) {
      try {
        this.pagination = { ...this._pagination, ...JSON.parse(rawPagination) };
      } catch (error) {
        console.error('Error parsing pagination attribute:', error);
      }
    }
  }

  /**
   * Called when observed attributes change
   */
  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;
    if (name === 'mode') {
      this._renderSwitch();
      return;
    }
    switch (name) {
      case 'data':
        if (newValue) {
          try {
            this.data = JSON.parse(newValue); // Use setter
          } catch (error) {
            console.error('Error parsing data attribute:', error);
          }
        }
        break;

      case 'options':
        if (newValue) {
          try {
            this.options = JSON.parse(newValue); // Use setter
          } catch (error) {
            console.error('Error parsing options attribute:', error);
          }
        }
        break;

      case 'filters':
        if (newValue) {
          try {
            this.filters = JSON.parse(newValue);
          } catch (error) {
            console.error('Error parsing filters attribute:', error);
          }
        } else {
          this.filters = [];
        }
        break;

      case 'pagination':
        if (newValue) {
          try {
            this.pagination = { ...this._pagination, ...JSON.parse(newValue) };
          } catch (error) {
            console.error('Error parsing pagination attribute:', error);
          }
        } else {
          this.pagination = { currentPage: 1, pageSize: 30, totalPages: 1 };
        }
        break;
    }
  }

  private _renderSwitch() {
    const mode = this.getAttribute('mode') || 'default';
    if (mode === 'none') {
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `<style>:host { display:block; }</style>`;
      }
    } else if (mode === 'minimal') {
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
        <style>
        :host { display: block; font-family: inherit; }
        [data-pivot-root] {
          display: grid;
          border: 1px solid #d8dde2; border-radius: 6px; background: #fcfdff;
        }
        [data-pivot-header], [data-pivot-body] {
          padding: 0.3em 0.5em;
        }
        [data-pivot-header] {
          background: #f4f7fa;
          border-bottom: 1px solid #e2e7ed;
          font-weight: bold;
        }
        </style>
        <div role="grid" data-pivot-root>
          <div role="rowgroup" data-pivot-header><slot name="header"></slot></div>
          <div role="rowgroup" data-pivot-body><slot name="body"></slot></div>
        </div>
      `;
      }
    } else {
      this._showRawData ? this.renderRawTable() : this.renderFullUI();
    }
  }

  private renderFullUI(): void {
    if (!this.engine) {
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = '';
      }
      return;
    }
    const state = this.engine.getState();

    if (!state.processedData) {
      console.error('No processed data available');
      return;
    }

    // Get field names from options
    const rowField = this._options.rows?.[0];
    const columnField = this._options.columns?.[0];
    const measures = this._options.measures || [];

    if (!rowField || !columnField || !measures.length) {
      console.error('Missing row, column, or measures configuration');
      return;
    }

    // Calculate pagination for processed view (display only)
    this.calculatePaginationForCurrentView();

    let html = `
      <style>
        :host { display: block; font-family: inherit; }
        .controls-container { margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .filter-container, .pagination-container { display: flex; gap: 10px; align-items: center; }
        table { width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #dee2e6; margin-top: 20px; }
        th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; cursor: grab; font-weight: 600; }
        .sortable-header { cursor: pointer; position: relative; }
        .sort-icon { margin-left: 5px; font-size: 12px; color: #6c757d; opacity: 0.5; }
        .sort-icon.active { color: #007bff; opacity: 1; }
        .corner-cell { background-color: #f8f9fa !important; border-bottom: 2px solid #dee2e6; border-right: 1px solid #dee2e6; }
        .column-header { background-color: #f8f9fa !important; border-bottom: 2px solid #dee2e6; text-align: center; cursor: move; }
        .measure-header { background-color: #f8f9fa !important; border-bottom: 2px solid #dee2e6; cursor: pointer; }
        .row-cell { font-weight: bold; background-color: #f8f9fa; }
        tr[draggable="true"] { cursor: grab; }
        .dragging { opacity: 0.5; }
        .drag-over { outline: 2px dashed #2672dd; background: #f3f8fd !important; }
        tbody tr:nth-child(even) td { background: #f8fafc; }
        button { padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:disabled { background-color: #cccccc; cursor: not-allowed; }
        select, input { padding: 5px; border-radius: 4px; border: 1px solid #ddd; }
        
        /* Drill-down styles */
        .drill-down-cell { cursor: pointer; }
        .drill-down-cell:hover { background-color: #e3f2fd !important; }
        
        /* Modal styles for drill-down details */
        .drill-down-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .drill-down-content {
            background: white;
            border-radius: 8px;
            padding: 20px;
            width: 90%;
            max-width: 800px;
            max-height: 80%;
            overflow: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .drill-down-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }

        .drill-down-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }

        .drill-down-close {
            background: #f44336;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .drill-down-close:hover {
            background: #d32f2f;
        }

        .drill-down-summary {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 14px;
            line-height: 1.4;
        }

        .drill-down-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 14px;
        }

        .drill-down-table th {
            background: #f8f9fa;
            padding: 8px;
            border: 1px solid #dee2e6;
            font-weight: bold;
            text-align: left;
        }

        .drill-down-table td {
            padding: 6px 8px;
            border: 1px solid #dee2e6;
        }

        .drill-down-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .drill-down-table tr:hover {
            background-color: #e3f2fd;
        }
      </style>
      <div class="controls-container">
        <div class="filter-container">
          <label>Filter:</label>
          <select id="filterField"></select>
          <select id="filterOperator">
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="greaterThan">Greater Than</option>
            <option value="lessThan">Less Than</option>
          </select>
          <input type="text" id="filterValue" placeholder="Value">
          <button id="applyFilter">Apply</button>
          <button id="resetFilter">Reset</button>
        </div>
        <div class="pagination-container">
          <label>Items per page:</label>
          <select id="pageSize">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <button id="prevPage">Previous</button>
          <span id="pageInfo">Page ${this._pagination.currentPage} of ${this._pagination.totalPages}</span>
          <button id="nextPage">Next</button>
        </div>
        <button id="switchView">Switch to Raw Data</button>
        <button id="exportHTML">Export HTML</button>
        <button id="exportPDF">Export PDF</button>
        <button id="exportExcel">Export Excel</button>
        <button id="printTable">Print</button>
      </div>
    `;

    // Build the pivot table structure
    html += '<table role="grid">';
    html += '<thead>';

    // Get unique column values from the processed data
    const groupedData = this.engine.getGroupedData();

    // Always use natural order from grouped data to prevent category switching during sorting
    // This ensures categories (Cars, Accessories) don't swap when sorting by measures
    let uniqueColumnValues = [
      ...new Set(
        groupedData.map(g => {
          const keys = g.key ? g.key.split('|') : [];
          return keys[1] || keys[0]; // Column field value
        })
      ),
    ].filter(Boolean);

    // Initialize local column order if not set
    if (this._processedColumnOrder.length === 0) {
      this._processedColumnOrder = [...uniqueColumnValues];
    }

    // Apply local column order (for column swapping via drag & drop)
    if (this._processedColumnOrder.length > 0) {
      uniqueColumnValues = this._processedColumnOrder.filter(col =>
        uniqueColumnValues.includes(col)
      );
    }

    // First header row - Column values with colspan for measures
    html += '<tr>';
    html += `<th class="corner-cell">${rowField.caption} / ${columnField.caption}</th>`;
    uniqueColumnValues.forEach((colValue, index) => {
      html += `<th class="column-header" draggable="true" data-column-index="${index}" colspan="${measures.length}">${colValue}</th>`;
    });
    html += '</tr>';

    // Second header row - Measure headers
    html += '<tr>';
    // Make the row field header sortable too
    const rowSortIcon = this.createProcessedSortIcon(rowField.uniqueName);
    html += `<th class="row-cell sortable-header" data-field="${rowField.uniqueName}">
      ${rowField.caption}${rowSortIcon}
    </th>`;
    uniqueColumnValues.forEach(() => {
      measures.forEach((measure: MeasureConfig, measureIndex: number) => {
        const sortIcon = this.createProcessedSortIcon(measure.uniqueName);
        html += `<th class="measure-header sortable-header" data-measure-index="${measureIndex}" data-field="${measure.uniqueName}">
          ${measure.caption}${sortIcon}
        </th>`;
      });
    });
    html += '</tr>';

    html += '</thead>';
    html += '<tbody>';

    // Use the sorted processed data directly instead of extracting from grouped data
    const engineState = this.engine.getState();
    const processedRows = engineState.processedData.rows || [];

    // Extract unique row values from the sorted processed data, preserving the sorted order
    const uniqueRowValues: string[] = [];
    const seenRowValues = new Set<string>();

    processedRows.forEach(row => {
      const rowValue = row[0]; // First column is the row field
      if (!seenRowValues.has(rowValue)) {
        uniqueRowValues.push(rowValue);
        seenRowValues.add(rowValue);
      }
    });

    // Note: Sorting is now handled by the core engine via this.engine.sort()
    // The core engine subscription will automatically update the display

    const paginatedRowValues = this.getPaginatedData(uniqueRowValues);

    // Render data rows
    paginatedRowValues.forEach((rowValue, rowIndex) => {
      html += `<tr draggable="true" data-row-index="${rowIndex}" data-row-value="${rowValue}">`;
      html += `<td class="row-cell">${rowValue}</td>`;

      // For each column value, render the measures
      uniqueColumnValues.forEach(colValue => {
        measures.forEach((measure: MeasureConfig) => {
          // Find the group that matches this row and column combination
          const matchingGroup = groupedData.find(g => {
            const keys = g.key ? g.key.split('|') : [];
            return keys[0] === rowValue && keys[1] === colValue;
          });

          const aggKey = measure.aggregation + '_' + measure.uniqueName;
          const value = matchingGroup?.aggregates?.[aggKey];
          let formattedValue = '0'; // Default to '0' if no data
          if (value !== undefined && value !== null) {
            if (typeof value === 'number') {
              formattedValue = value.toLocaleString();
            } else if (String(value).trim() !== '') {
              formattedValue = String(value);
            }
          }

          // Add drill-down functionality to data cells with values > 0
          const hasData =
            value !== undefined && value !== null && Number(value) > 0;
          const cellClass = hasData ? 'data-cell drill-down-cell' : 'data-cell';
          const cellTitle = hasData
            ? `Double-click to see details for ${rowField.caption}: ${rowValue} - ${columnField.caption}: ${colValue}`
            : '';

          html += `<td class="${cellClass}" 
                      title="${cellTitle}"
                      data-row-value="${rowValue}" 
                      data-column-value="${colValue}" 
                      data-measure-name="${measure.uniqueName}"
                      data-measure-caption="${measure.caption}"
                      data-row-field="${rowField.uniqueName}"
                      data-column-field="${columnField.uniqueName}"
                      data-aggregate-value="${value || 0}">
                      ${formattedValue}
                   </td>`;
        });
      });

      html += '</tr>';
    });

    html += '</tbody>';
    html += '</table>';
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = html;
    }
    this.addDragListeners();
    this.setupControls();
  }

  private setupControls(): void {
    const filterField = this.shadowRoot?.getElementById('filterField');
    if (filterField) {
      if (this._showRawData) {
        // For raw data, show all available fields
        if (this._data.length > 0) {
          filterField.innerHTML = Object.keys(this._data[0])
            .map(f => `<option value="${f}">${f}</option>`)
            .join('');
        }
      } else {
        // For processed data, show row/column fields plus aggregated measures
        let options = '';

        // Add row and column fields (these can still be filtered normally)
        if (this._options.rows) {
          this._options.rows.forEach((row: AxisConfig) => {
            options += `<option value="${row.uniqueName}">${row.caption}</option>`;
          });
        }
        if (this._options.columns) {
          this._options.columns.forEach((col: AxisConfig) => {
            options += `<option value="${col.uniqueName}">${col.caption}</option>`;
          });
        }

        // Add aggregated measures with special keys
        if (this._options.measures) {
          this._options.measures.forEach((measure: MeasureConfig) => {
            const aggregatedKey = `${measure.aggregation}_${measure.uniqueName}`;
            options += `<option value="${aggregatedKey}">${measure.caption}</option>`;
          });
        }

        filterField.innerHTML = options;
      }
    }

    // Restore filter values if they exist
    const filterValueInput = this.shadowRoot?.getElementById(
      'filterValue'
    ) as HTMLInputElement;
    if (filterValueInput && this._filters.length > 0) {
      const currentFilter = this._filters[0];
      if (currentFilter) {
        const filterFieldElement = this.shadowRoot?.getElementById(
          'filterField'
        ) as HTMLSelectElement;
        const filterOperatorElement = this.shadowRoot?.getElementById(
          'filterOperator'
        ) as HTMLSelectElement;
        if (filterFieldElement) {
          filterFieldElement.value = currentFilter.field;
        }
        if (filterOperatorElement) {
          filterOperatorElement.value = currentFilter.operator;
        }
        filterValueInput.value = currentFilter.value;
      }
    }

    // Set current page size in dropdown - ensure all options are unselected first
    const pageSizeSelect = this.shadowRoot?.getElementById(
      'pageSize'
    ) as HTMLSelectElement;
    if (pageSizeSelect) {
      // First, remove all selected attributes from options
      Array.from(pageSizeSelect.options).forEach(option => {
        option.removeAttribute('selected');
        option.selected = false;
      });
      // Then set the correct value
      pageSizeSelect.value = this._pagination.pageSize.toString();
      // Ensure the selected option is properly marked
      const selectedOption = pageSizeSelect.querySelector(
        `option[value="${this._pagination.pageSize}"]`
      ) as HTMLOptionElement;
      if (selectedOption) {
        selectedOption.selected = true;
        selectedOption.setAttribute('selected', 'selected');
      }
    }

    // Apply filter button
    const applyBtn = this.shadowRoot?.getElementById('applyFilter');
    if (applyBtn) {
      // Remove any existing listeners by cloning the node
      const newApplyBtn = applyBtn.cloneNode(true);
      applyBtn.parentNode?.replaceChild(newApplyBtn, applyBtn);

      newApplyBtn.addEventListener('click', () => {
        const fieldElement = this.shadowRoot?.getElementById(
          'filterField'
        ) as HTMLSelectElement;
        const operatorElement = this.shadowRoot?.getElementById(
          'filterOperator'
        ) as HTMLSelectElement;
        const valueElement = this.shadowRoot?.getElementById(
          'filterValue'
        ) as HTMLInputElement;

        if (!fieldElement || !operatorElement || !valueElement) return;

        const field = fieldElement.value;
        const operator = operatorElement.value;
        const value = valueElement.value;
        if (!field || !operator || !value) return;
        const filter: FilterConfig = {
          field,
          operator: operator as FilterConfig['operator'],
          value,
        };
        this.filters = [filter];
      });
    }

    // Reset filter button
    const resetBtn = this.shadowRoot?.getElementById('resetFilter');
    if (resetBtn) {
      // Remove any existing listeners by cloning the node
      const newResetBtn = resetBtn.cloneNode(true);
      resetBtn.parentNode?.replaceChild(newResetBtn, resetBtn);

      newResetBtn.addEventListener('click', () => {
        console.log('Reset button clicked - calling reset method');
        this.reset(); // Call the public reset method
      });
    }

    // Page size selector
    const pageSizeSel = this.shadowRoot?.getElementById('pageSize');
    if (pageSizeSel) {
      const newPageSizeSel = pageSizeSel.cloneNode(true);
      pageSizeSel.parentNode?.replaceChild(newPageSizeSel, pageSizeSel);

      newPageSizeSel.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        this.setPageSize(Number(target.value));
      });
    }

    // Previous page button
    const prevBtn = this.shadowRoot?.getElementById('prevPage');
    if (prevBtn) {
      const newPrevBtn = prevBtn.cloneNode(true);
      prevBtn.parentNode?.replaceChild(newPrevBtn, prevBtn);
      newPrevBtn.addEventListener('click', () => this.previousPage());
    }

    // Next page button
    const nextBtn = this.shadowRoot?.getElementById('nextPage');
    if (nextBtn) {
      const newNextBtn = nextBtn.cloneNode(true);
      nextBtn.parentNode?.replaceChild(newNextBtn, nextBtn);
      newNextBtn.addEventListener('click', () => this.nextPage());
    }

    // Update pagination info and button states
    this.updatePaginationInfo();

    // Switch view button
    const switchBtn = this.shadowRoot?.getElementById('switchView');
    if (switchBtn) {
      const newSwitchBtn = switchBtn.cloneNode(true);
      switchBtn.parentNode?.replaceChild(newSwitchBtn, switchBtn);

      newSwitchBtn.textContent = this._showRawData
        ? 'Switch to Processed Data'
        : 'Switch to Raw Data';
      newSwitchBtn.addEventListener('click', () => {
        this._showRawData = !this._showRawData;
        console.log(
          'Switching to view mode:',
          this._showRawData ? 'RAW' : 'PROCESSED'
        );

        try {
          if (this.engine) {
            // Update engine data handling mode
            this.engine.setDataHandlingMode(
              this._showRawData ? 'raw' : 'processed'
            );

            // Apply the correct filters for the new view using core engine
            const currentFilters = this._showRawData
              ? this._rawFilters
              : this._processedFilters;
            console.log('Applying filters for new view mode:', currentFilters);
            this.engine.applyFilters(currentFilters);

            // Notify listeners of view mode change
            this.dispatchEvent(
              new CustomEvent('viewModeChange', {
                detail: { mode: this._showRawData ? 'raw' : 'processed' },
                bubbles: true,
                composed: true,
              })
            );
          }
        } catch (error) {
          console.error('Error during view switch:', error);
        }

        // The engine subscription will trigger the correct view render
      });
    }

    // Export HTML button
    const exportHTML = this.shadowRoot?.getElementById('exportHTML');
    if (exportHTML) {
      const newExportHTML = exportHTML.cloneNode(true);
      exportHTML.parentNode?.replaceChild(newExportHTML, exportHTML);
      newExportHTML.addEventListener('click', () => this.exportToHTML());
    }

    // Export PDF button
    const exportPDF = this.shadowRoot?.getElementById('exportPDF');
    if (exportPDF) {
      const newExportPDF = exportPDF.cloneNode(true);
      exportPDF.parentNode?.replaceChild(newExportPDF, exportPDF);
      newExportPDF.addEventListener('click', () => this.exportToPDF());
    }

    // Export Excel button
    const exportExcel = this.shadowRoot?.getElementById('exportExcel');
    if (exportExcel) {
      const newExportExcel = exportExcel.cloneNode(true);
      exportExcel.parentNode?.replaceChild(newExportExcel, exportExcel);
      newExportExcel.addEventListener('click', () => this.exportToExcel());
    }

    // Print button
    const printBtn = this.shadowRoot?.getElementById('printTable');
    if (printBtn) {
      const newPrintBtn = printBtn.cloneNode(true);
      printBtn.parentNode?.replaceChild(newPrintBtn, printBtn);
      newPrintBtn.addEventListener('click', () => this.openPrintDialog());
    }
  }

  /**
   * Update pagination info display and button states
   */
  private updatePaginationInfo(): void {
    const pageInfo = this.shadowRoot?.getElementById('pageInfo');
    if (pageInfo) {
      const viewMode = this._showRawData ? 'Raw Data' : 'Processed Data';
      pageInfo.textContent = `${viewMode} - Page ${this._pagination.currentPage} of ${this._pagination.totalPages}`;
    }

    // Update button states
    const prevButton = this.shadowRoot?.getElementById(
      'prevPage'
    ) as HTMLButtonElement;
    const nextButton = this.shadowRoot?.getElementById(
      'nextPage'
    ) as HTMLButtonElement;

    if (prevButton) {
      prevButton.disabled = this._pagination.currentPage <= 1;
    }
    if (nextButton) {
      nextButton.disabled =
        this._pagination.currentPage >= this._pagination.totalPages;
    }
  }

  /**
   * Calculate pagination for current view (display only)
   */
  private calculatePaginationForCurrentView(): void {
    if (this._showRawData) {
      // For raw data view
      if (!this.engine) return;
      const state = this.engine.getState();
      const allRawData = state.data || state.rawData || [];
      this.updatePaginationForData(allRawData);
    } else {
      // For processed data view - count unique row values
      if (!this.engine) return;
      const groupedData = this.engine.getGroupedData();
      let uniqueRowValues = this.engine.getOrderedRowValues();

      if (!uniqueRowValues) {
        // Fallback to extracting from grouped data
        uniqueRowValues = [
          ...new Set(
            groupedData.map(g => {
              const keys = g.key ? g.key.split('|') : [];
              return keys[0]; // Row field value
            })
          ),
        ].filter(Boolean);
      }

      this.updatePaginationForData(uniqueRowValues);
    }
  }

  /**
   * Update pagination based on data array length
   */
  private updatePaginationForData(data: unknown[]): void {
    const pageSize = this._pagination.pageSize;
    const totalPages = Math.ceil(data.length / pageSize) || 1;

    // Check if current page is valid for new pagination
    if (this._pagination.currentPage > totalPages) {
      this._pagination.currentPage = Math.max(1, totalPages);
    }

    this._pagination.totalPages = totalPages;
  }

  /**
   * Get paginated data slice
   */
  private getPaginatedData<T>(data: T[]): T[] {
    const start =
      (this._pagination.currentPage - 1) * this._pagination.pageSize;
    const end = start + this._pagination.pageSize;
    return data.slice(start, end);
  }

  private renderRawTable(): void {
    if (!this.engine) return;
    const state = this.engine.getState();

    // Get the filtered data from state (not paginated yet)
    const allRawData = state.data || state.rawData || [];
    if (!allRawData.length) return;

    // Update pagination for raw data (display only)
    this.updatePaginationForData(allRawData);

    // Get paginated slice of the data
    const displayData = this.getPaginatedData(allRawData);

    // Get headers in the correct order
    const originalHeaders = Object.keys(displayData[0] || allRawData[0]);

    // Use custom column order if it exists, otherwise use original order
    let headers: string[];
    if (this._rawDataColumnOrder && this._rawDataColumnOrder.length > 0) {
      // Ensure all original headers are included
      const missingHeaders = originalHeaders.filter(
        h => !this._rawDataColumnOrder.includes(h)
      );
      headers = [...this._rawDataColumnOrder, ...missingHeaders];
    } else {
      headers = originalHeaders;
      this._rawDataColumnOrder = [...headers]; // Initialize the order
    }

    let html = `
      <style>
        :host { display: block; font-family: inherit; }
        .controls-container { margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .filter-container, .pagination-container { display: flex; gap: 10px; align-items: center; }
        table { width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e7ed; }
        th, td { border: 1px solid #dde1e7; padding: 8px; text-align: left; }
        th { background-color: #eaf2fa; cursor: grab; font-weight: 600; }
        .sortable-header { cursor: pointer !important; position: relative; }
        .sort-icon { margin-left: 5px; font-size: 12px; color: #6c757d; opacity: 0.5; }
        .sort-icon.active { color: #007bff; opacity: 1; }
        tr[draggable="true"] { cursor: grab; }
        .dragging { opacity: 0.5; }
        .drag-over { outline: 2px dashed #2672dd; background: #f3f8fd !important; }
        tbody tr:nth-child(even) td { background: #f8fafc; }
        button { padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:disabled { background-color: #cccccc; cursor: not-allowed; }
        select, input { padding: 5px; border-radius: 4px; border: 1px solid #ddd; }
      </style>
      <div class="controls-container">
        <div class="filter-container">
          <label>Filter:</label>
          <select id="filterField"></select>
          <select id="filterOperator">
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="greaterThan">Greater Than</option>
            <option value="lessThan">Less Than</option>
          </select>
          <input type="text" id="filterValue" placeholder="Value">
          <button id="applyFilter">Apply</button>
          <button id="resetFilter">Reset</button>
        </div>
        <div class="pagination-container">
          <label>Items per page:</label>
          <select id="pageSize">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <button id="prevPage">Previous</button>
          <span id="pageInfo">Page ${this._pagination.currentPage} of ${this._pagination.totalPages}</span>
          <button id="nextPage">Next</button>
        </div>
        <button id="switchView">Switch to Processed Data</button>
        <button id="exportHTML">Export HTML</button>
        <button id="exportPDF">Export PDF</button>
        <button id="exportExcel">Export Excel</button>
        <button id="printTable">Print</button>
      </div>
    `;
    html += '<table data-raw="true">';
    html += '<thead><tr>';
    headers.forEach((header, index) => {
      const sortIcon = this.createSortIcon(header);
      html += `<th class="sortable-header" draggable="true" data-column-index="${index}" data-field="${header}">
        ${header}${sortIcon}
      </th>`;
    });
    html += '</tr></thead>';
    html += '<tbody>';
    displayData.forEach((row, rowIndex: number) => {
      const pivotRow = row as PivotDataRecord;
      html += `<tr draggable="true" data-row-index="${rowIndex}">`;
      headers.forEach(header => {
        html += `<td>${pivotRow[header]}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = html;
    }
    this.addDragListeners();
    this.setupControls();
  }

  /**
   * Add modal styles to document head for proper styling outside shadow DOM
   */
  private addModalStylesToDocument(): void {
    // Check if styles already exist
    if (document.getElementById('pivot-head-modal-styles')) {
      return;
    }

    const styleEl = document.createElement('style');
    styleEl.id = 'pivot-head-modal-styles';
    styleEl.textContent = `
      /* Modal styles for PivotHead drill-down details */
      .drill-down-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .drill-down-content {
          background: white;
          border-radius: 8px;
          padding: 20px;
          width: 90%;
          max-width: 800px;
          max-height: 80%;
          overflow: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }

      .drill-down-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
      }

      .drill-down-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
      }

      .drill-down-close {
          background: #f44336;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
      }

      .drill-down-close:hover {
          background: #d32f2f;
      }

      .drill-down-summary {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.4;
      }

      .drill-down-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 14px;
      }

      .drill-down-table th {
          background: #f8f9fa;
          padding: 8px;
          border: 1px solid #dee2e6;
          font-weight: bold;
          text-align: left;
      }

      .drill-down-table td {
          padding: 6px 8px;
          border: 1px solid #dee2e6;
      }

      .drill-down-table tr:nth-child(even) {
          background-color: #f9f9f9;
      }

      .drill-down-table tr:hover {
          background-color: #e3f2fd;
      }
    `;

    document.head.appendChild(styleEl);
  }

  /**
   * Creates a sort icon for table headers based on current sort state
   */
  private createSortIcon(field: string): string {
    // Use engine's sort state for accurate display
    if (!this.engine) {
      return '<span class="sort-icon" title="Click to sort">&#8693;</span>';
    }

    const state = this.engine.getState();
    const sortConfig =
      state.sortConfig && state.sortConfig.length > 0
        ? state.sortConfig[0]
        : null;
    const isCurrentlySorted = sortConfig && sortConfig.field === field;

    if (isCurrentlySorted) {
      if (sortConfig && sortConfig.direction === 'asc') {
        return '<span class="sort-icon active" title="Sorted ascending">&#9650;</span>'; // Up arrow
      } else {
        return '<span class="sort-icon active" title="Sorted descending">&#9660;</span>'; // Down arrow
      }
    } else {
      return '<span class="sort-icon" title="Click to sort">&#8693;</span>'; // Up/down arrow
    }
  }

  /**
   * Creates a sort icon for processed data measure headers
   */
  private createProcessedSortIcon(field: string): string {
    // Use engine's sort state for accurate display
    if (!this.engine) {
      return '<span class="sort-icon" title="Click to sort">&#8693;</span>';
    }

    const state = this.engine.getState();
    const sortConfig =
      state.sortConfig && state.sortConfig.length > 0
        ? state.sortConfig[0]
        : null;
    const isCurrentlySorted = sortConfig && sortConfig.field === field;

    if (isCurrentlySorted) {
      if (sortConfig && sortConfig.direction === 'asc') {
        return '<span class="sort-icon active" title="Sorted ascending">&#9650;</span>'; // Up arrow
      } else {
        return '<span class="sort-icon active" title="Sorted descending">&#9660;</span>'; // Down arrow
      }
    } else {
      return '<span class="sort-icon" title="Click to sort">&#8693;</span>'; // Up/down arrow
    }
  }

  /**
   * Dispatches a custom event with the current state (legacy, now unused)
   */
  private notifyStateChange(): void {
    // No-op: handled by engine subscription now
  }

  private renderTable(): void {
    if (!this.engine) return;

    const state = this.engine.getState();
    const { headers, rows } = state.processedData;
    const measureCaptions = (this._options.measures || []).map(
      (m: MeasureConfig) => m.caption
    );
    const allHeaders = [...headers, ...measureCaptions];

    let html =
      '<style>\n' +
      '  table { width: 100%; border-collapse: collapse; }\n' +
      '  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n' +
      '  th { background-color: #f2f2f2; cursor: grab; }\n' +
      '  tr[draggable="true"] { cursor: grab; }\n' +
      '  .dragging { opacity: 0.5; }\n' +
      '</style>';

    html += '<table>';
    html += '<thead><tr>';
    allHeaders.forEach((header, index) => {
      html += `<th draggable="true" data-column-index="${index}">${header}</th>`;
    });
    html += '</tr></thead>';

    html += '<tbody>';
    rows.forEach((row, rowIndex) => {
      html += `<tr draggable="true" data-row-index="${rowIndex}">`;
      row.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = html;
    }
    this.addDragListeners();
  }

  private addDragListeners(): void {
    // Add drag listeners for column headers
    const headers = this.shadowRoot?.querySelectorAll('th[draggable="true"]');
    headers?.forEach(header => {
      header.addEventListener(
        'dragstart',
        this.handleColumnDragStart.bind(this) as EventListener
      );
      header.addEventListener(
        'dragover',
        this.handleColumnDragOver.bind(this) as EventListener
      );
      header.addEventListener(
        'dragleave',
        this.handleColumnDragLeave.bind(this) as EventListener
      );
      header.addEventListener(
        'drop',
        this.handleColumnDrop.bind(this) as EventListener
      );
      header.addEventListener(
        'dragend',
        this.handleColumnDragEnd.bind(this) as EventListener
      );
    });

    // Add drag listeners for rows
    const rows = this.shadowRoot?.querySelectorAll('tr[draggable="true"]');
    rows?.forEach(row => {
      row.addEventListener(
        'dragstart',
        this.handleRowDragStart.bind(this) as EventListener
      );
      row.addEventListener(
        'dragover',
        this.handleRowDragOver.bind(this) as EventListener
      );
      row.addEventListener(
        'dragleave',
        this.handleRowDragLeave.bind(this) as EventListener
      );
      row.addEventListener(
        'drop',
        this.handleRowDrop.bind(this) as EventListener
      );
      row.addEventListener(
        'dragend',
        this.handleRowDragEnd.bind(this) as EventListener
      );
    });

    // Add click listeners for sortable headers
    const sortableHeaders =
      this.shadowRoot?.querySelectorAll('.sortable-header');
    sortableHeaders?.forEach(header => {
      header.addEventListener(
        'click',
        this.handleSortClick.bind(this) as EventListener
      );
    });

    // Add double-click listeners for drill-down cells
    const drillDownCells =
      this.shadowRoot?.querySelectorAll('.drill-down-cell');
    drillDownCells?.forEach(cell => {
      cell.addEventListener(
        'dblclick',
        this.handleDrillDownClick.bind(this) as EventListener
      );
    });
  }

  // Handle click on sortable headers to toggle sort via engine
  private handleSortClick(e: Event): void {
    if (!this.engine) return;
    const target = e.target as HTMLElement;
    const header = target.closest('.sortable-header') as HTMLElement | null;
    if (!header) return;

    const field = header.dataset.field;
    if (!field) return;

    const state = this.engine.getState();
    const current =
      state.sortConfig && state.sortConfig.length > 0
        ? state.sortConfig[0]
        : null;
    const nextDir: 'asc' | 'desc' =
      current && current.field === field && current.direction === 'asc'
        ? 'desc'
        : 'asc';

    this.sort(field, nextDir);
  }

  // Handle double-click on data cell to show drill-down details from raw records
  private handleDrillDownClick(e: Event): void {
    if (!this.engine) return;
    const cell = (e.target as HTMLElement).closest(
      '.drill-down-cell'
    ) as HTMLElement | null;
    if (!cell) return;

    const rowValue = cell.getAttribute('data-row-value') || '';
    const columnValue = cell.getAttribute('data-column-value') || '';
    const measureName = cell.getAttribute('data-measure-name') || '';
    const measureCaption =
      cell.getAttribute('data-measure-caption') || measureName;
    const rowField = cell.getAttribute('data-row-field') || '';
    const columnField = cell.getAttribute('data-column-field') || '';

    const state = this.engine.getState();
    const rawData = (state.rawData || state.data || []) as Array<
      Record<string, unknown>
    >;

    // Filter records matching the clicked intersection
    const subset = rawData.filter((r: Record<string, unknown>) => {
      const rowOk = rowField
        ? String(r[rowField] ?? '') === String(rowValue)
        : true;
      const colOk = columnField
        ? String(r[columnField] ?? '') === String(columnValue)
        : true;
      return rowOk && colOk;
    });

    // Ensure modal styles are available
    this.addModalStylesToDocument();

    // Build modal content
    const overlay = document.createElement('div');
    overlay.className = 'drill-down-modal';

    const content = document.createElement('div');
    content.className = 'drill-down-content';
    content.innerHTML = `
      <div class="drill-down-header">
        <div class="drill-down-title">Details: ${rowField}: ${rowValue}${columnField ? `, ${columnField}: ${columnValue}` : ''}</div>
        <button class="drill-down-close" aria-label="Close">&times;</button>
      </div>
      <div class="drill-down-summary">
        Records: ${subset.length}. Measure: ${measureCaption} (${measureName}).
      </div>
      <div class="drill-down-body"></div>
    `;

    const bodyDiv = content.querySelector('.drill-down-body') as HTMLElement;
    if (subset.length > 0) {
      const headers = Object.keys(subset[0] as Record<string, unknown>);
      const table = document.createElement('table');
      table.className = 'drill-down-table';

      const thead = document.createElement('thead');
      const trh = document.createElement('tr');
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      subset.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
          const td = document.createElement('td');
          const val = (row as Record<string, unknown>)[h];
          td.textContent = val != null ? String(val) : '';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      bodyDiv.appendChild(table);
    } else {
      bodyDiv.textContent = 'No matching records.';
    }

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.addEventListener('click', evt => {
      if (evt.target === overlay) close();
    });
    const closeBtn = content.querySelector(
      '.drill-down-close'
    ) as HTMLButtonElement | null;
    closeBtn?.addEventListener('click', close);
  }

  // Drag and interaction state
  private draggedColumn: HTMLElement | null = null;
  private draggedRow: HTMLElement | null = null;

  private handleColumnDragStart(e: DragEvent): void {
    this.draggedColumn = e.target as HTMLElement;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'text/plain',
        this.draggedColumn.dataset.columnIndex || ''
      );
    }
    setTimeout(() => {
      this.draggedColumn?.classList.add('dragging');
    }, 0);
  }

  private handleColumnDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer?.types.includes('text/plain')) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TH' && target !== this.draggedColumn) {
        target.classList.add('drag-over');
      }
    }
  }

  private handleColumnDragLeave(e: DragEvent): void {
    (e.target as HTMLElement).classList.remove('drag-over');
  }

  private handleColumnDrop(e: DragEvent): void {
    e.preventDefault();
    const target = e.target as HTMLElement;
    target.classList.remove('drag-over');

    if (this.draggedColumn && target.tagName === 'TH') {
      const fromIndex = parseInt(this.draggedColumn.dataset.columnIndex || '0');
      const toIndex = parseInt(target.dataset.columnIndex || '0');

      if (fromIndex !== toIndex) {
        this.swapColumns(fromIndex, toIndex);
      }
    }
  }

  private handleColumnDragEnd(): void {
    this.draggedColumn?.classList.remove('dragging');
    this.draggedColumn = null;
    this.shadowRoot
      ?.querySelectorAll('.drag-over')
      .forEach(el => el.classList.remove('drag-over'));
  }

  private handleRowDragStart(e: DragEvent): void {
    this.draggedRow = e.target as HTMLElement;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'text/plain',
        this.draggedRow.dataset.rowIndex || ''
      );
    }
    setTimeout(() => {
      this.draggedRow?.classList.add('dragging');
    }, 0);
  }

  private handleRowDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer?.types.includes('text/plain')) {
      const target = e.target as HTMLElement;
      const targetRow = target.closest('tr') as HTMLElement;

      if (
        targetRow &&
        targetRow.tagName === 'TR' &&
        targetRow !== this.draggedRow
      ) {
        targetRow.classList.add('drag-over');
      }
    }
  }

  private handleRowDragLeave(e: DragEvent): void {
    const target = e.target as HTMLElement;
    const targetRow = target.closest('tr') as HTMLElement;

    if (targetRow) {
      targetRow.classList.remove('drag-over');
    }
  }

  private handleRowDrop(e: DragEvent): void {
    e.preventDefault();
    const target = e.target as HTMLElement;

    const targetRow = target.closest('tr') as HTMLElement;

    if (targetRow) {
      targetRow.classList.remove('drag-over');
    }

    if (this.draggedRow && targetRow && targetRow.tagName === 'TR') {
      const fromIndex = parseInt(this.draggedRow.dataset.rowIndex || '0');
      const toIndex = parseInt(targetRow.dataset.rowIndex || '0');

      if (fromIndex !== toIndex) {
        this.swapRows(fromIndex, toIndex);
      }
    }
  }

  private handleRowDragEnd(): void {
    this.draggedRow?.classList.remove('dragging');
    this.draggedRow = null;
    this.shadowRoot
      ?.querySelectorAll('.drag-over')
      .forEach(el => el.classList.remove('drag-over'));
  }

  // Public API methods for programmatic control

  /**
   * @preserve
   * Returns the raw data array currently loaded into the component.
   * @public
   * @returns {Record<string, unknown>[]} Raw data records as provided to the component.
   */
  public getRawData(): PivotDataRecord[] {
    return this._data;
  }

  /**
   * @preserve
   * Returns pagination information managed by the web component. In minimal mode and default mode,
   * the component owns pagination for display and emits paginationChange on updates.
   * @public
   * @returns {PaginationConfig} The current pagination state.
   */
  public getPagination(): PaginationConfig {
    return this._pagination;
  }

  /**
   * @preserve
   * Gets the current engine state (dimensions, measures, processed data, sort, etc.).
   * @public
   * @throws {Error} If the engine has not been initialized yet.
   * @returns {PivotTableState<Record<string, unknown>>} The current pivot state.
   */
  public getState(): PivotTableState<PivotDataRecord> {
    if (!this.engine) {
      throw new Error('Engine not initialized');
    }
    return this.engine.getState();
  }

  /**
   * @preserve
   * Refreshes the component by clearing the current filter UI state and calling the engine reset.
   * This retains configuration but clears applied filters.
   * @public
   */
  public refresh(): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this._filters = [];
    this.removeAttribute('filters');
    this.engine.reset();

    const filterValueInput = this.shadowRoot?.getElementById(
      'filterValue'
    ) as HTMLInputElement;
    if (filterValueInput) {
      filterValueInput.value = '';
    }
  }

  /**
   * @preserve
   * Resets the component and engine: clears processed/raw filters, resets pagination and filter UI,
   * and invokes the engine reset.
   * @public
   */
  public reset(): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this._rawFilters = [];
    this._processedFilters = [];
    this._filters = [];
    this.removeAttribute('filters');

    this._pagination.currentPage = 1;

    this.engine.reset();

    this.clearFilterUI();
  }

  /**
   * Clears the filter UI controls (field/operator/value).
   * @private
   */
  private clearFilterUI(): void {
    const filterValueInput = this.shadowRoot?.getElementById(
      'filterValue'
    ) as HTMLInputElement;
    if (filterValueInput) {
      filterValueInput.value = '';
    }

    const filterFieldSelect = this.shadowRoot?.getElementById(
      'filterField'
    ) as HTMLSelectElement;
    const filterOperatorSelect = this.shadowRoot?.getElementById(
      'filterOperator'
    ) as HTMLSelectElement;
    if (filterFieldSelect) filterFieldSelect.selectedIndex = 0;
    if (filterOperatorSelect) filterOperatorSelect.selectedIndex = 0;
  }

  /**
   * @preserve
   * Sorts the pivot data by a field using the core engine. Triggers a state update via subscription.
   * @public
   * @param {string} field - Field name (dimension or measure uniqueName) to sort by.
   * @param {'asc'|'desc'} direction - Sort direction.
   */
  public sort(field: string, direction: 'asc' | 'desc'): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    this.engine.sort(field, direction);
  }

  /**
   * @preserve
   * Updates measures in the engine.
   * @public
   * @param {MeasureConfig[]} measures - The new measures configuration.
   */
  public setMeasures(measures: MeasureConfig[]): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    this.engine.setMeasures(measures);
  }

  /**
   * @preserve
   * Updates dimensions in the engine.
   * @public
   * @param {Dimension[]} dimensions - The new dimensions configuration.
   */
  public setDimensions(dimensions: Dimension[]): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    this.engine.setDimensions(dimensions);
  }

  /**
   * @preserve
   * Sets the grouping configuration used by the engine.
   * @public
   * @param {GroupConfig|null} groupConfig - Grouping configuration or null to clear.
   */
  public setGroupConfig(groupConfig: GroupConfig | null): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    this.engine.setGroupConfig(groupConfig);
  }

  /**
   * @preserve
   * Sets the default aggregation type used by the engine (e.g., sum, avg).
   * @public
   * @param {AggregationType} type - Aggregation type.
   */
  public setAggregation(type: AggregationType): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    this.engine.setAggregation(type);
  }

  /**
   * @preserve
   * Formats a value using the engine's formatting for a given field.
   * @public
   * @param {unknown} value - The raw value.
   * @param {string} field - The field name for formatting context.
   * @returns {string} The formatted value.
   */
  public formatValue(value: unknown, field: string): string {
    if (!this.engine) {
      console.error('Engine not initialized');
      return String(value);
    }
    return this.engine.formatValue(value, field);
  }

  /**
   * @preserve
   * Returns the grouped data produced by the engine, useful for custom rendering in minimal mode.
   * @public
   * @returns {Group[]} The list of groups with aggregates.
   */
  public getGroupedData(): Group[] {
    if (!this.engine) {
      console.error('Engine not initialized');
      return [];
    }
    return this.engine.getGroupedData();
  }

  /**
   * @preserve
   * Returns the last filters set via the component API. In processed/raw modes, this reflects the
   * filters applied in that respective mode.
   * @public
   * @returns {FilterConfig[]} The current filter array.
   */
  public getFilters(): FilterConfig[] {
    return this._filters;
  }

  /**
   * @preserve
   * Returns the raw data from the engine state (post-load, pre-aggregation).
   * @public
   * @returns {Record<string, unknown>[]} Raw rows.
   */
  public getData(): PivotDataRecord[] {
    if (!this.engine) {
      console.error('Engine not initialized');
      return [];
    }
    return this.engine.getState().rawData;
  }

  /**
   * @preserve
   * Returns the processed pivot data structure from the engine state.
   * @public
   * @returns {unknown} The processed data payload (headers, rows, aggregates).
   */
  public getProcessedData(): unknown {
    if (!this.engine) {
      console.error('Engine not initialized');
      return null;
    }
    return this.engine.getState().processedData;
  }

  /**
   * @preserve
   * Exports the current table to HTML via the engine.
   * @public
   * @param {string} [fileName='pivot-table'] - Base filename (without extension).
   */
  public exportToHTML(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to HTML.');
      return;
    }
    this.engine.exportToHTML(fileName);
  }

  /**
   * @preserve
   * Exports the current table to PDF via the engine.
   * @public
   * @param {string} [fileName='pivot-table'] - Base filename (without extension).
   */
  public exportToPDF(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to PDF.');
      return;
    }
    this.engine.exportToPDF(fileName);
  }

  /**
   * @preserve
   * Exports the current table to Excel via the engine.
   * @public
   * @param {string} [fileName='pivot-table'] - Base filename (without extension).
   */
  public exportToExcel(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to Excel.');
      return;
    }
    this.engine.exportToExcel(fileName);
  }

  /**
   * @preserve
   * Opens the browser print dialog for the current table via the engine.
   * @public
   */
  public openPrintDialog(): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot open print dialog.');
      return;
    }
    this.engine.openPrintDialog();
  }

  /**
   * @preserve
   * Loads JSON data from a File object and assigns it to the component.
   * @public
   * @param {File} file - A file containing JSON array data.
   * @returns {Promise<void>} Resolves when the data has been loaded and set.
   * @example
   * const file = new File([JSON.stringify(data)], 'data.json', { type: 'application/json' });
   * await pivotEl.loadFromFile(file);
   */
  public loadFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const data = JSON.parse(result);
            this.data = data;
            resolve();
          } else {
            reject(new Error('Failed to read file as text'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * @preserve
   * Loads JSON data from a URL and assigns it to the component.
   * @public
   * @param {string} url - The endpoint returning a JSON array.
   * @returns {Promise<void>} Resolves when the data has been fetched and set.
   */
  public loadFromUrl(url: string): Promise<void> {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch data from ${url}: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then(data => {
        this.data = data;
      });
  }

  /**
   * @preserve
   * Drags/moves a row within the current ordering using the core engine implementation.
   * @public
   * @param {number} fromIndex - Source visual index.
   * @param {number} toIndex - Target visual index.
   */
  public dragRow(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    this.engine.dragRow(fromIndex, toIndex);
  }

  /**
   * @preserve
   * Drags/moves a column within the current ordering using the core engine implementation.
   * @public
   * @param {number} fromIndex - Source visual index.
   * @param {number} toIndex - Target visual index.
   */
  public dragColumn(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    this.engine.dragColumn(fromIndex, toIndex);
  }

  /**
   * @preserve
   * Swaps two rows. Uses raw-data swap in raw mode, or processed-data swap in processed mode.
   * @public
   * @param {number} fromIndex - Source index.
   * @param {number} toIndex - Target index.
   */
  public swapRows(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    try {
      if (this._showRawData) {
        this.engine.swapRawDataRows(fromIndex, toIndex);
      } else {
        this.engine.swapDataRows(fromIndex, toIndex);
      }
    } catch (error) {
      console.error('Row swap failed:', error);
    }
  }

  /**
   * @preserve
   * Swaps two columns. In raw mode, it updates internal raw column order and re-renders; in
   * processed mode, it delegates to the engine and stores the returned order.
   * @public
   * @param {number} fromIndex - Source index.
   * @param {number} toIndex - Target index.
   */
  public swapColumns(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    try {
      if (this._showRawData) {
        const headers = this._data.length > 0 ? Object.keys(this._data[0]) : [];
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= headers.length ||
          toIndex >= headers.length
        ) {
          console.error(
            `Invalid column indices for raw data swap: ${fromIndex}, ${toIndex}, total: ${headers.length}`
          );
          return;
        }
        if (
          !this._rawDataColumnOrder ||
          this._rawDataColumnOrder.length === 0
        ) {
          this._rawDataColumnOrder = [...headers];
        }
        const temp = this._rawDataColumnOrder[fromIndex];
        this._rawDataColumnOrder[fromIndex] = this._rawDataColumnOrder[toIndex];
        this._rawDataColumnOrder[toIndex] = temp;
        this.renderRawTable();
      } else {
        this.engine.swapDataColumns(fromIndex, toIndex);
        const newOrder = this.engine.getOrderedColumnValues();
        if (newOrder) this._processedColumnOrder = [...newOrder];
      }
    } catch (error) {
      console.error('Column swap failed:', error);
    }
  }

  /**
   * Swaps two raw-data columns by visual index.
   * @private
   */
  private swapRawDataColumns(fromIndex: number, toIndex: number): void {
    if (!this._data || this._data.length === 0) {
      console.error('No raw data available for column swap');
      return;
    }
    const headers = Object.keys(this._data[0]);
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= headers.length ||
      toIndex >= headers.length
    ) {
      console.error(
        `Invalid column indices for raw data swap: ${fromIndex}, ${toIndex}, total: ${headers.length}`
      );
      return;
    }
    if (fromIndex === toIndex) return;
    if (!this._rawDataColumnOrder) this._rawDataColumnOrder = [...headers];
    const temp = this._rawDataColumnOrder[fromIndex];
    this._rawDataColumnOrder[fromIndex] = this._rawDataColumnOrder[toIndex];
    this._rawDataColumnOrder[toIndex] = temp;
    this.renderRawTable();
  }

  /**
   * @preserve
   * Enables or disables drag-and-drop for rows/columns in the rendered table.
   * @public
   * @param {boolean} enabled - True to enable, false to disable.
   */
  public setDragAndDropEnabled(enabled: boolean): void {
    const table = this.shadowRoot?.querySelector('table');
    if (table) {
      if (enabled) {
        this.addDragListeners();
      } else {
        const draggableElements = table.querySelectorAll('[draggable="true"]');
        draggableElements.forEach(element => {
          element.setAttribute('draggable', 'false');
        });
      }
    }
  }

  /**
   * @preserve
   * Indicates whether drag-and-drop is currently enabled based on presence of draggable elements.
   * @public
   * @returns {boolean} True if enabled, false otherwise.
   */
  public isDragAndDropEnabled(): boolean {
    const firstDraggableElement =
      this.shadowRoot?.querySelector('[draggable="true"]');
    return !!firstDraggableElement;
  }

  /**
   * @preserve
   * Alias for swapRows(fromIndex, toIndex).
   * @public
   */
  public swapDataRowsByIndex(fromIndex: number, toIndex: number): void {
    this.swapRows(fromIndex, toIndex);
  }

  /**
   * @preserve
   * Alias for swapColumns(fromIndex, toIndex).
   * @public
   */
  public swapDataColumnsByIndex(fromIndex: number, toIndex: number): void {
    this.swapColumns(fromIndex, toIndex);
  }

  /**
   * @preserve
   * Moves to the previous page (display-only pagination) and emits a `paginationChange` event.
   * @public
   */
  public previousPage(): void {
    if (this._pagination.currentPage > 1) {
      this._pagination.currentPage--;
      this._renderSwitch();
      this.dispatchEvent(
        new CustomEvent('paginationChange', {
          detail: { ...this._pagination },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * @preserve
   * Moves to the next page (display-only pagination) and emits a `paginationChange` event.
   * @public
   */
  public nextPage(): void {
    if (this._pagination.currentPage < this._pagination.totalPages) {
      this._pagination.currentPage++;
      this._renderSwitch();
      this.dispatchEvent(
        new CustomEvent('paginationChange', {
          detail: { ...this._pagination },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * @preserve
   * Sets the page size (display-only), recalculates pagination, re-renders, and emits a `paginationChange` event.
   * @public
   * @param {number} pageSize - Items per page, must be > 0.
   */
  public setPageSize(pageSize: number): void {
    if (pageSize > 0) {
      this._pagination.pageSize = pageSize;
      this._pagination.currentPage = 1;
      this.calculatePaginationForCurrentView();
      this._renderSwitch();
      this.dispatchEvent(
        new CustomEvent('paginationChange', {
          detail: { ...this._pagination },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * @preserve
   * Navigates to a specific page number (display-only) and emits a `paginationChange` event.
   * @public
   * @param {number} page - 1-based page index.
   */
  public goToPage(page: number): void {
    if (page >= 1 && page <= this._pagination.totalPages) {
      this._pagination.currentPage = page;
      this._renderSwitch();
      this.dispatchEvent(
        new CustomEvent('paginationChange', {
          detail: { ...this._pagination },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * @preserve
   * Sets the data handling mode for rendering (raw or processed), updates the engine, reapplies
   * the current filters for that mode, and emits a `viewModeChange` event.
   * @public
   * @param {'raw'|'processed'} mode - Desired view mode.
   */
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

  /**
   * @preserve
   * Gets the current view mode.
   * @public
   * @returns {'raw'|'processed'} The view mode string.
   */
  public getViewMode(): 'raw' | 'processed' {
    return this._showRawData ? 'raw' : 'processed';
  }
}

// Register the web component
customElements.define('pivot-head', PivotHeadElement);
