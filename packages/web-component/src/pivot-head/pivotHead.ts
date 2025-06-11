// import { PivotEngine } from '@mindfiredigital/pivothead';
// import type {
//   PivotTableConfig,
//   FilterConfig,
//   PivotTableState,
//   Dimension,
//   GroupConfig,
//   MeasureConfig,
//   AggregationType,
//   Group,
// } from '@mindfiredigital/pivothead';

// /**
//  * Enhanced interface extending PivotEngine with additional methods
//  * This ensures type safety when casting the engine instance
//  */
// interface EnhancedPivotEngine<T extends Record<string, any>>
//   extends PivotEngine<T> {
//   applyFilters(filters: FilterConfig[]): void;
//   setMeasures(measures: MeasureConfig[]): void;
//   setDimensions(dimensions: Dimension[]): void;
//   getFilterState(): FilterConfig[];
//   reset(): void;
//   sort(field: string, direction: 'asc' | 'desc'): void;
//   setGroupConfig(config: GroupConfig | null): void;
//   setAggregation(type: AggregationType): void;
//   formatValue(value: any, field: string): string;
//   getGroupedData(): Group[];
//   exportToHTML(fileName: string): void;
//   exportToPDF(fileName: string): void;
//   exportToExcel(fileName: string): void;
//   openPrintDialog(): void;
//   // Drag methods from core
//   dragRow(fromIndex: number, toIndex: number): void;
//   dragColumn(fromIndex: number, toIndex: number): void;
//   // New methods for group order
//   setRowGroupOrder(order: string[]): void;
//   setColumnGroupOrder(order: string[]): void;
// }

// /**
//  * PivotHead Web Component
//  * ... (omitting comment for brevity)
//  */
// export class PivotHeadElement extends HTMLElement {
//   engine: any;
//   _filters: never[] | undefined;
//   private _data: any;
//   private _options: any;
//   // ... (properties remain the same)

//   // ... (constructor, getters/setters, reinitialize, initialize, initializeWhenReady, connectedCallback, attributeChangedCallback, updateConfig, updateFilters remain the same)

//   /**
//    * Reinitializes the engine with current data and options
//    */
//   private reinitialize() {
//     if (this._data && this._options && this._data.length > 0) { // Ensure data is present
//       const config: PivotTableConfig<any> = {
//         data: this._data,
//         ...this._options,
//       };

//       // Cast to the enhanced interface to access all methods
//       this.engine = new PivotEngine(config) as EnhancedPivotEngine<any>;

//       // Apply any existing filters after engine initialization
//       if (this._filters && this._filters.length > 0) {
//         this.engine.applyFilters(this._filters);
//       }

//       // THIS IS THE KEY CHANGE:
//       // Always fire a stateChange event after a successful reinitialization.
//       // This ensures the initial render will always happen.
//       this.notifyStateChange();
//     }
//   }

//   // ... (initialize, initializeWhenReady, connectedCallback, etc. are the same)

//   /**
//    * Dispatches a custom event with the current state
//    */
//   private notifyStateChange() {
//     // Check if the engine is actually ready before notifying.
//     if (!this.engine) return;

//     const state = this.engine.getState();

//     this.dispatchEvent(
//       new CustomEvent('stateChange', {
//         detail: state,
//         bubbles: true,
//         composed: true,
//       })
//     );
//   }

//   // Public API methods for programmatic control

//   /**
//    * Get the current state of the pivot table
//    */
//   public getState(): PivotTableState<any> {
//     if (!this.engine) {
//       throw new Error('Engine not initialized');
//     }
//     return this.engine.getState();
//   }

//   /**
//    * Reset the pivot table to its initial state
//    */
//   public refresh(): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }

//     this._filters = [];
//     this.engine.applyFilters([]);
//     this.engine.reset();
//     this.removeAttribute('filters');
//     this.notifyStateChange();
//   }

//   /**
//    * Sort the pivot table by a specific field
//    */
//   public sort(field: string, direction: 'asc' | 'desc'): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }

//     this.engine.sort(field, direction);
//     this.notifyStateChange();
//   }

//   /**
//    * Set measures for the pivot table
//    */
//   public setMeasures(measures: MeasureConfig[]): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }

//     this.engine.setMeasures(measures);
//     this.notifyStateChange();
//   }

//   /**
//    * Set dimensions for the pivot table
//    */
//   public setDimensions(dimensions: Dimension[]): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }

//     this.engine.setDimensions(dimensions);
//     this.notifyStateChange();
//   }

//   /**
//    * Set grouping configuration
//    */
//   public setGroupConfig(groupConfig: GroupConfig | null): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }

//     this.engine.setGroupConfig(groupConfig);
//     this.notifyStateChange();
//   }

//   /**
//    * Set aggregation type for measures
//    */
//   public setAggregation(type: AggregationType): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }

//     this.engine.setAggregation(type);
//     this.notifyStateChange();
//   }

//   /**
//    * Format a value according to field formatting rules
//    */
//   public formatValue(value: any, field: string): string {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return String(value);
//     }

//     return this.engine.formatValue(value, field);
//   }

//   /**
//    * Get grouped data from the pivot table
//    */
//   public getGroupedData(): Group[] {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return [];
//     }

//     return this.engine.getGroupedData();
//   }

//   // ... (getFilters, getData, getProcessedData, export methods, and file loading methods remain the same)

//   /**
//    * Programmatically sets the display order of row groups.
//    */
//   public setRowGroupOrder(order: string[]): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }
//     this.engine.setRowGroupOrder(order);
//     this.notifyStateChange();
//   }

//   /**
//    * Programmatically sets the display order of column groups.
//    */
//   public setColumnGroupOrder(order: string[]): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }
//     this.engine.setColumnGroupOrder(order);
//     this.notifyStateChange();
//   }

//   // Public drag API methods

//   /**
//    * Programmatically drag a row from one position to another
//    */
//   public dragRow(fromIndex: number, toIndex: number): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }
//     console.log('Dragging row from UI index', fromIndex, 'to', toIndex);
//     this.engine.dragRow(fromIndex, toIndex);
//     this.notifyStateChange();
//   }

//   /**
//    * Programmatically drag a column from one position to another
//    */
//   public dragColumn(fromIndex: number, toIndex: number): void {
//     if (!this.engine) {
//       console.error('Engine not initialized');
//       return;
//     }

//     // The UI provides 1-based indices for columns, convert to 0-based for the engine.
//     console.log('Dragging column from UI index', fromIndex, 'to', toIndex);
//     this.engine.dragColumn(fromIndex - 1, toIndex - 1);
//     this.notifyStateChange();
//   }
// }

// // Register the web component
// customElements.define('pivot-head', PivotHeadElement);

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
} from '@mindfiredigital/pivothead';

/**
 * Enhanced interface extending PivotEngine with additional methods
 * This ensures type safety when casting the engine instance
 */
interface EnhancedPivotEngine<T extends Record<string, any>>
  extends PivotEngine<T> {
  getPagination(): PaginationConfig;
  applyFilters(filters: FilterConfig[]): void;
  setMeasures(measures: MeasureConfig[]): void;
  setDimensions(dimensions: Dimension[]): void;
  getFilterState(): FilterConfig[];
  reset(): void;
  sort(field: string, direction: 'asc' | 'desc'): void;
  setGroupConfig(config: GroupConfig | null): void;
  setAggregation(type: AggregationType): void;
  formatValue(value: any, field: string): string;
  getGroupedData(): Group[];
  exportToHTML(fileName: string): void;
  exportToPDF(fileName: string): void;
  exportToExcel(fileName: string): void;
  openPrintDialog(): void;
  // Drag methods from core
  dragRow(fromIndex: number, toIndex: number): void;
  dragColumn(fromIndex: number, toIndex: number): void;
  setRowGroups(rowGroups: Group[]): void;
  setColumnGroups(columnGroups: Group[]): void;
  toggleRowExpansion(rowId: string): void;
  isRowExpanded(rowId: string): boolean;
  setPagination(config: PaginationConfig): void;
  getPaginationState(): PaginationConfig;
}

export class PivotHeadElement extends HTMLElement {
  private engine!: EnhancedPivotEngine<any>;
  private _data: any[] = [];
  private _options: any = {};
  private _filters: FilterConfig[] = [];
  private _rowGroups: Group[] = [];
  private _columnGroups: Group[] = [];
  private _pagination: PaginationConfig = {
    currentPage: 1,
    pageSize: 30,
    totalPages: 1,
  };

  // Define observed attributes for the custom element
  static get observedAttributes(): string[] {
    return ['data', 'options', 'filters', 'pagination'];
  }

  constructor() {
    super();
  }

  /**
   * Data setter - automatically initializes/reinitializes when set
   */
  set data(value: any[]) {
    this._data = value || [];
    this.tryInitializeEngine();
  }

  get data(): any[] {
    return this._data;
  }

  /**
   * Options setter - automatically initializes/reinitializes when set
   */
  set options(value: any) {
    this._options = value || {};
    this.tryInitializeEngine();
  }

  get options(): any {
    return this._options;
  }

  /**
   * Getter and setter for filters property
   */
  set filters(value: FilterConfig[]) {
    this._filters = value || [];
    this.setAttribute('filters', JSON.stringify(value));
    if (this.engine) {
      this.engine.applyFilters(value);
      this.notifyStateChange();
    }
  }

  get filters(): FilterConfig[] {
    return this._filters;
  }

  /**
   * Getter and setter for pagination property
   */
  set pagination(value: PaginationConfig) {
    this._pagination = { ...this._pagination, ...value };
    this.setAttribute('pagination', JSON.stringify(this._pagination));
    if (this.engine) {
      this.engine.setPagination(this._pagination);
      this.notifyStateChange();
    }
  }

  get pagination(): PaginationConfig {
    return this._pagination;
  }

  /**
   * Single method to handle engine initialization
   * Only creates engine when BOTH data and options are available
   */
  private tryInitializeEngine(): void {
    // Check if we have the minimum required data
    const hasData = this._data && this._data.length > 0;
    const hasOptions = this._options && Object.keys(this._options).length > 0;
    console.log('has Data', hasData, 'hasOptions', hasOptions);
    if (!hasData || !hasOptions) {
      return;
    }

    try {
      // Create the engine configuration
      const config: PivotTableConfig<any> = {
        data: this._data,
        pageSize: this._pagination.pageSize,
        ...this._options,
      };

      console.log('config', config);
      // Create or recreate the engine
      this.engine = new PivotEngine(config) as EnhancedPivotEngine<any>;

      // Apply existing configurations
      if (this._filters.length > 0) {
        this.engine.applyFilters(this._filters);
      }

      this.engine.setPagination(this._pagination);
      this.notifyStateChange();
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
  }

  private parseAttributesIfNeeded(): void {
    // Parse data attribute
    const rawData = this.getAttribute('data');
    console.log('rawData', rawData);
    if (rawData && !this._data.length) {
      try {
        this.data = JSON.parse(rawData); // Use setter
      } catch (error) {
        console.error('Error parsing data attribute:', error);
      }
    }

    // Parse options attribute
    const rawOptions = this.getAttribute('options');
    console.log('rawOptions', rawOptions);
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
    console.log('rawPagination', rawPagination);
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

  /**
   * Dispatches a custom event with the current state
   */
  private notifyStateChange(): void {
    if (!this.engine) return;

    try {
      const state = this.engine.getState();
      this.dispatchEvent(
        new CustomEvent('stateChange', {
          detail: state,
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      console.error('Error getting engine state:', error);
    }
  }

  // Public API methods for programmatic control

  /**
   * Returns the raw data from the pivot table
   */

  public getRawData(): any[] {
    return this._data;
  }

  /**
   * Returns the pagination from the engine or local fallback
   */
  public getPagination(): PaginationConfig {
    return this.engine?.getPagination?.() ?? this._pagination;
  }

  /**
   * Get the current state of the pivot table
   */
  public getState(): PivotTableState<any> {
    if (!this.engine) {
      throw new Error('Engine not initialized');
    }
    return this.engine.getState();
  }

  /**
   * Reset the pivot table to its initial state
   */
  public refresh(): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this._filters = [];
    this.engine.applyFilters([]);
    this.engine.reset();
    this.removeAttribute('filters');
    this.notifyStateChange();
  }

  /**
   * Sort the pivot table by a specific field
   */
  public sort(field: string, direction: 'asc' | 'desc'): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.sort(field, direction);
    this.notifyStateChange();
  }

  /**
   * Set measures for the pivot table
   */
  public setMeasures(measures: MeasureConfig[]): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setMeasures(measures);
    this.notifyStateChange();
  }

  /**
   * Set dimensions for the pivot table
   */
  public setDimensions(dimensions: Dimension[]): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setDimensions(dimensions);
    this.notifyStateChange();
  }

  /**
   * Set grouping configuration
   */
  public setGroupConfig(groupConfig: GroupConfig | null): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setGroupConfig(groupConfig);
    this.notifyStateChange();
  }

  /**
   * Set aggregation type for measures
   */
  public setAggregation(type: AggregationType): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setAggregation(type);
    this.notifyStateChange();
  }

  /**
   * Format a value according to field formatting rules
   */
  public formatValue(value: any, field: string): string {
    if (!this.engine) {
      console.error('Engine not initialized');
      return String(value);
    }

    return this.engine.formatValue(value, field);
  }

  /**
   * Get grouped data from the pivot table
   */
  public getGroupedData(): Group[] {
    if (!this.engine) {
      console.error('Engine not initialized');
      return [];
    }

    return this.engine.getGroupedData();
  }

  /**
   * Get current filter state
   */
  public getFilters(): FilterConfig[] {
    return this._filters;
  }

  /**
   * Get the raw data from the pivot table
   */
  public getData(): any[] {
    if (!this.engine) {
      console.error('Engine not initialized');
      return [];
    }

    return this.engine.getState().data;
  }

  /**
   * Get the processed data (headers, rows, totals)
   */
  public getProcessedData(): any {
    if (!this.engine) {
      console.error('Engine not initialized');
      return null;
    }

    return this.engine.getState().processedData;
  }

  // Export methods

  /**
   * Export pivot table to HTML format
   */
  public exportToHTML(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to HTML.');
      return;
    }
    this.engine.exportToHTML(fileName);
  }

  /**
   * Export pivot table to PDF format
   */
  public exportToPDF(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to PDF.');
      return;
    }
    this.engine.exportToPDF(fileName);
  }

  /**
   * Export pivot table to Excel format
   */
  public exportToExcel(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to Excel.');
      return;
    }
    this.engine.exportToExcel(fileName);
  }

  /**
   * Open print dialog for the pivot table
   */
  public openPrintDialog(): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot open print dialog.');
      return;
    }
    this.engine.openPrintDialog();
  }

  // File loading methods

  /**
   * Load data from a file
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
   * Load data from a URL
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

  // Public drag API methods

  /**
   * Programmatically drag a row from one position to another
   */
  public dragRow(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }
    console.log('from Index', fromIndex, 'to Index', toIndex);
    this.engine.dragRow(fromIndex, toIndex);
    this.notifyStateChange();
  }

  /**
   * Programmatically drag a column from one position to another
   */
  public dragColumn(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.dragColumn(fromIndex, toIndex);
    this.notifyStateChange();
  }

  /**
   * Set row groups for the pivot table
   */
  public setRowGroups(rowGroups: Group[]): void {
    this._rowGroups = rowGroups || [];

    // Also update the engine if it's initialized
    if (this.engine && typeof this.engine.setRowGroups === 'function') {
      this.engine.setRowGroups(rowGroups);
      this.notifyStateChange();
    } else {
      // If engine not ready, reinitialize with new row groups
      this.reinitialize();
    }
  }

  /**
   * Set column groups for the pivot table
   */
  public setColumnGroups(columnGroups: Group[]): void {
    this._columnGroups = columnGroups || [];

    // Also update the engine if it's initialized
    if (this.engine && typeof this.engine.setColumnGroups === 'function') {
      this.engine.setColumnGroups(columnGroups);
      this.notifyStateChange();
    } else {
      // If engine not ready, reinitialize with new column groups
      this.reinitialize();
    }
  }

  /**
   * Toggles the expansion state of a row via the engine.
   * @param rowId - The unique ID of the row to toggle.
   */
  public toggleRowExpansion(rowId: string): void {
    if (!this.engine || typeof this.engine.toggleRowExpansion !== 'function') {
      console.error('Engine not initialized or method not available');
      return;
    }
    this.engine.toggleRowExpansion(rowId);
    this.notifyStateChange();
  }

  /**
   * Checks if a row is expanded via the engine.
   * @param rowId - The unique ID of the row.
   * @returns boolean indicating whether the row is expanded.
   */
  public isRowExpanded(rowId: string): boolean {
    if (!this.engine || typeof this.engine.isRowExpanded !== 'function') {
      console.error('Engine not initialized or method not available');
      return false;
    }
    return this.engine.isRowExpanded(rowId);
  }

  /**
   * Set pagination configuration
   */
  public setPagination(config: PaginationConfig): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this._pagination = { ...this._pagination, ...config };
    this.engine.setPagination(this._pagination);
    this.setAttribute('pagination', JSON.stringify(this._pagination));
    this.notifyStateChange();
  }

  /**
   * Get current pagination state
   */
  public getPaginationState(): PaginationConfig {
    if (!this.engine || typeof this.engine.getPaginationState !== 'function') {
      console.error('Engine not initialized or method not available');
      return this._pagination;
    }

    // Always return engine state, update local cache
    const engineState = this.engine.getPaginationState();
    this._pagination = engineState;
    return engineState;
  }

  /**
   * Navigate to a specific page
   */
  public goToPage(page: number): void {
    const paginationState = this.getPaginationState();
    if (page >= 1 && page <= paginationState.totalPages) {
      this.setPagination({ ...paginationState, currentPage: page });
    }
  }

  /**
   * Navigate to the next page
   */
  public nextPage(): void {
    const paginationState = this.getPaginationState();
    if (paginationState.currentPage < paginationState.totalPages) {
      this.goToPage(paginationState.currentPage + 1);
    }
  }

  /**
   * Navigate to the previous page
   */
  public previousPage(): void {
    const paginationState = this.getPaginationState();
    if (paginationState.currentPage > 1) {
      this.goToPage(paginationState.currentPage - 1);
    }
  }

  /**
   * Change the page size
   */
  public setPageSize(pageSize: number): void {
    if (pageSize <= 0) {
      console.error('Page size must be greater than 0');
      return;
    }

    this.setPagination({
      ...this.getPaginationState(),
      pageSize,
      currentPage: 1, // Reset to first page when changing page size
    });
  }

  /**
   * Method to reinitialize the engine
   */
  private reinitialize(): void {
    this.tryInitializeEngine();
  }
}

// Register the web component
customElements.define('pivot-head', PivotHeadElement);
