import { PivotEngine } from '@mindfiredigital/pivothead';
import type {
  PivotTableConfig,
  FilterConfig,
  PaginationConfig,
  PivotTableState,
  Measure,
  Dimension,
  GroupConfig,
  MeasureConfig,
  AggregationType,
  Group,
} from '@mindfiredigital/pivothead';

interface EnhancedPivotEngine<T extends Record<string, any>>
  extends PivotEngine<T> {
  applyFilters(filters: FilterConfig[]): void;
  setPagination(config: PaginationConfig): void;
  setMeasures(measures: MeasureConfig[]): void;
  setDimensions(dimensions: Dimension[]): void;
  getFilterState(): FilterConfig[];
  getPaginationState(): PaginationConfig;
  reset(): void;
  sort(field: string, direction: 'asc' | 'desc'): void;
  setGroupConfig(config: GroupConfig | null): void;
  setAggregation(type: AggregationType): void;
  formatValue(value: any, field: string): string;
  resizeRow(index: number, height: number): void;
  toggleRowExpansion(rowId: string): void;
  isRowExpanded(rowId: string): boolean;
  dragRow(fromIndex: number, toIndex: number): void;
  dragColumn(fromIndex: number, toIndex: number): void;
  getGroupedData(): Group[];
  exportToHTML(fileName: string): void;
  exportToPDF(fileName: string): void;
  exportToExcel(fileName: string): void;
  openPrintDialog(): void;
}

export class PivotHeadElement extends HTMLElement {
  private engine!: EnhancedPivotEngine<any>;
  private initialized = false;
  private _filters: FilterConfig[] = [];
  private _showToolbar = true;
  private _isResponsive = true;
  private _columnWidths: Record<string, number> = {};
  private _expandedRows: Record<string, boolean> = {};

  static get observedAttributes() {
    return [
      'data',
      'options',
      'filters',
      'pagination',
      'show-toolbar',
      'responsive',
      'column-widths',
      'expanded-rows',
    ];
  }

  constructor() {
    super();
  }

  private initializeWhenReady() {
    const dataAttr = this.getAttribute('data');
    const optionsAttr = this.getAttribute('options');

    if (dataAttr && optionsAttr) {
      this.initialize();
      this.initialized = true;
    }
  }

  private _data: any[] = [];
  private _options: any = {};

  set data(value: any[]) {
    this._data = value;
    this.reinitialize();
  }

  get data(): any[] {
    return this._data;
  }

  set options(value: any) {
    this._options = value;
    this.reinitialize();
  }

  get options(): any {
    return this._options;
  }

  set showToolbar(value: boolean) {
    this._showToolbar = value;
    this.setAttribute('show-toolbar', String(value));
  }

  get showToolbar(): boolean {
    return this._showToolbar;
  }

  set responsive(value: boolean) {
    this._isResponsive = value;
    this.setAttribute('responsive', String(value));
  }

  get responsive(): boolean {
    return this._isResponsive;
  }

  private reinitialize() {
    if (this._data && this._options) {
      const config: PivotTableConfig<any> = {
        data: this._data,
        filters: this._filters,
        isResponsive: this._isResponsive,
        ...this._options,
      };

      this.engine = new PivotEngine(config) as EnhancedPivotEngine<any>;
      this.notifyStateChange();
    }
  }

  private initialize() {
    const rawData = this.getAttribute('data');
    if (rawData && !this._data.length) {
      this._data = JSON.parse(rawData);
    }

    const rawOptions = this.getAttribute('options');
    if (rawOptions && Object.keys(this._options).length === 0) {
      this._options = JSON.parse(rawOptions);
    }

    // Initialize toolbar visibility
    const showToolbarAttr = this.getAttribute('show-toolbar');
    if (showToolbarAttr !== null) {
      this._showToolbar = showToolbarAttr === 'true';
    }

    // Initialize responsive setting
    const responsiveAttr = this.getAttribute('responsive');
    if (responsiveAttr !== null) {
      this._isResponsive = responsiveAttr === 'true';
    }

    this.reinitialize();
  }

  connectedCallback() {
    this.initializeWhenReady();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log('Old Value', oldValue);
    console.log('New Value', newValue);

    if (oldValue !== newValue) {
      switch (name) {
        case 'data':
        case 'options':
          if (!this.initialized) {
            this.initializeWhenReady();
          } else {
            this.updateConfig();
          }
          break;
        case 'filters':
          this.updateFilters(newValue);
          break;
        case 'pagination':
          this.updatePagination(newValue);
          break;
        case 'show-toolbar':
          this._showToolbar = newValue === 'true';
          this.notifyStateChange();
          break;
        case 'responsive':
          this._isResponsive = newValue === 'true';
          if (this.engine) {
            this.reinitialize();
          }
          break;
        case 'column-widths':
          this.updateColumnWidths(newValue);
          break;
        case 'expanded-rows':
          this.updateExpandedRows(newValue);
          break;
      }
    }
  }

  private updateConfig() {
    const rawData = this.getAttribute('data');
    if (rawData && !this._data.length) {
      this._data = JSON.parse(rawData);
    }

    const rawOptions = this.getAttribute('options');
    if (rawOptions && Object.keys(this._options).length === 0) {
      this._options = JSON.parse(rawOptions);
    }

    this.reinitialize();
  }

  private updateFilters(filtersJson: string) {
    try {
      this._filters = JSON.parse(filtersJson);
      if (this.engine) {
        this.engine.applyFilters(this._filters);
        this.notifyStateChange();
      }
    } catch (error) {
      console.error('Error updating filters:', error);
    }
    console.log('Update Filters', this._filters);
  }

  private updatePagination(paginationJson: string) {
    try {
      const pagination: PaginationConfig = JSON.parse(paginationJson);
      if (this.engine) {
        this.engine.setPagination(pagination);
        this.notifyStateChange();
      }
    } catch (error) {
      console.error('Error updating pagination:', error);
    }
  }

  private updateColumnWidths(columnWidthsJson: string) {
    try {
      this._columnWidths = JSON.parse(columnWidthsJson);
      this.notifyStateChange();
    } catch (error) {
      console.error('Error updating column widths:', error);
    }
  }

  private updateExpandedRows(expandedRowsJson: string) {
    try {
      this._expandedRows = JSON.parse(expandedRowsJson);
      this.notifyStateChange();
    } catch (error) {
      console.error('Error updating expanded rows:', error);
    }
  }

  private notifyStateChange() {
    if (!this.engine) return;

    const state = this.engine.getState();
    const enhancedState = {
      ...state,
      showToolbar: this._showToolbar,
      columnWidths: this._columnWidths,
      expandedRows: this._expandedRows,
    };

    this.dispatchEvent(
      new CustomEvent('stateChange', {
        detail: enhancedState,
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API methods
  public getState(): PivotTableState<any> {
    if (!this.engine) {
      throw new Error('Engine not initialized');
    }
    return this.engine.getState();
  }

  public refresh(): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this._filters = [];
    this.engine.applyFilters([]);
    this.engine.reset();
    this.removeAttribute('filters');
    console.log('Refresh Filters', this._filters);
    this.notifyStateChange();
  }

  public sort(field: string, direction: 'asc' | 'desc'): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    console.log('Sort is getting called', field, direction);
    this.engine.sort(field, direction);
    this.notifyStateChange();
  }

  public setMeasures(measures: MeasureConfig[]): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setMeasures(measures);
    this.notifyStateChange();
  }

  public setDimensions(dimensions: Dimension[]): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setDimensions(dimensions);
    this.notifyStateChange();
  }

  public setGroupConfig(groupConfig: GroupConfig | null): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setGroupConfig(groupConfig);
    this.notifyStateChange();
  }

  public setAggregation(type: AggregationType): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.setAggregation(type);
    this.notifyStateChange();
  }

  public formatValue(value: any, field: string): string {
    if (!this.engine) {
      console.error('Engine not initialized');
      return String(value);
    }

    return this.engine.formatValue(value, field);
  }

  public resizeRow(index: number, height: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.resizeRow(index, height);
    this.notifyStateChange();
  }

  public toggleRowExpansion(rowId: string): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.toggleRowExpansion(rowId);
    this._expandedRows[rowId] = this.engine.isRowExpanded(rowId);
    this.setAttribute('expanded-rows', JSON.stringify(this._expandedRows));
    this.notifyStateChange();
  }

  public isRowExpanded(rowId: string): boolean {
    if (!this.engine) {
      console.error('Engine not initialized');
      return false;
    }

    return this.engine.isRowExpanded(rowId);
  }

  public dragRow(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.dragRow(fromIndex, toIndex);
    this.notifyStateChange();
  }

  public dragColumn(fromIndex: number, toIndex: number): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    this.engine.dragColumn(fromIndex, toIndex);
    this.notifyStateChange();
  }

  public getGroupedData(): Group[] {
    if (!this.engine) {
      console.error('Engine not initialized');
      return [];
    }

    return this.engine.getGroupedData();
  }

  public getFilters(): FilterConfig[] {
    if (!this.engine) {
      console.error('Engine not initialized');
      return [];
    }

    return this.engine.getFilterState();
  }

  public getPagination(): PaginationConfig {
    if (!this.engine) {
      console.error('Engine not initialized');
      throw new Error('Engine not initialized');
    }

    return this.engine.getPaginationState();
  }

  public getData(): any[] {
    if (!this.engine) {
      console.error('Engine not initialized');
      return [];
    }

    return this.engine.getState().data;
  }

  public getProcessedData(): any {
    if (!this.engine) {
      console.error('Engine not initialized');
      return null;
    }

    return this.engine.getState().processedData;
  }

  // File handling methods
  public loadFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const data = JSON.parse(event.target?.result as string);
          this.data = data;
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  }

  public loadFromUrl(url: string): Promise<void> {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${url}`);
        }
        return response.json();
      })
      .then(data => {
        this.data = data;
      });
  }

  // Export methods
  public exportToHTML(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to HTML.');
      return;
    }
    this.engine.exportToHTML(fileName);
  }

  public exportToPDF(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to PDF.');
      return;
    }
    this.engine.exportToPDF(fileName);
  }

  public exportToExcel(fileName = 'pivot-table'): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot export to Excel.');
      return;
    }
    this.engine.exportToExcel(fileName);
  }

  public openPrintDialog(): void {
    if (!this.engine) {
      console.error('Engine not initialized. Cannot open print dialog.');
      return;
    }
    this.engine.openPrintDialog();
  }

  // Utility methods
  public toggleToolbar(): void {
    this.showToolbar = !this.showToolbar;
  }

  public setColumnWidth(columnName: string, width: number): void {
    this._columnWidths[columnName] = width;
    this.setAttribute('column-widths', JSON.stringify(this._columnWidths));
    this.notifyStateChange();
  }

  public getColumnWidth(columnName: string): number | undefined {
    return this._columnWidths[columnName];
  }

  public expandAllRows(): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    const state = this.engine.getState();
    state.processedData.rows.forEach((_, index) => {
      const rowId = `row-${index}`;
      if (!this.engine.isRowExpanded(rowId)) {
        this.engine.toggleRowExpansion(rowId);
        this._expandedRows[rowId] = true;
      }
    });

    this.setAttribute('expanded-rows', JSON.stringify(this._expandedRows));
    this.notifyStateChange();
  }

  public collapseAllRows(): void {
    if (!this.engine) {
      console.error('Engine not initialized');
      return;
    }

    Object.keys(this._expandedRows).forEach(rowId => {
      if (this.engine.isRowExpanded(rowId)) {
        this.engine.toggleRowExpansion(rowId);
      }
    });

    this._expandedRows = {};
    this.setAttribute('expanded-rows', JSON.stringify(this._expandedRows));
    this.notifyStateChange();
  }

  // Event dispatchers for better integration
  private dispatchSortEvent(field: string, direction: 'asc' | 'desc') {
    this.dispatchEvent(
      new CustomEvent('sort', {
        detail: { field, direction },
        bubbles: true,
        composed: true,
      })
    );
  }

  private dispatchFilterEvent(filters: FilterConfig[]) {
    this.dispatchEvent(
      new CustomEvent('filter', {
        detail: { filters },
        bubbles: true,
        composed: true,
      })
    );
  }

  private dispatchRowDragEvent(fromIndex: number, toIndex: number) {
    this.dispatchEvent(
      new CustomEvent('rowDrag', {
        detail: { fromIndex, toIndex },
        bubbles: true,
        composed: true,
      })
    );
  }

  private dispatchColumnDragEvent(fromIndex: number, toIndex: number) {
    this.dispatchEvent(
      new CustomEvent('columnDrag', {
        detail: { fromIndex, toIndex },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Enhanced public methods with event dispatching
  public sortWithEvent(field: string, direction: 'asc' | 'desc'): void {
    this.sort(field, direction);
    this.dispatchSortEvent(field, direction);
  }

  public applyFiltersWithEvent(filters: FilterConfig[]): void {
    this._filters = filters;
    if (this.engine) {
      this.engine.applyFilters(filters);
      this.notifyStateChange();
      this.dispatchFilterEvent(filters);
    }
  }

  public dragRowWithEvent(fromIndex: number, toIndex: number): void {
    this.dragRow(fromIndex, toIndex);
    this.dispatchRowDragEvent(fromIndex, toIndex);
  }

  public dragColumnWithEvent(fromIndex: number, toIndex: number): void {
    this.dragColumn(fromIndex, toIndex);
    this.dispatchColumnDragEvent(fromIndex, toIndex);
  }
}

// Register the web component
customElements.define('pivot-head', PivotHeadElement);
