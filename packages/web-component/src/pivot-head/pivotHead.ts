import { PivotEngine, applySort } from '@mindfiredigital/pivothead';
import type {
  PivotTableConfig,
  FilterConfig,
  PaginationConfig,
  PivotTableState,
  Measure,
  Dimension,
  GroupConfig,
  RowSize,
  SortConfig,
  Group,
  ExpandedState,
  AggregationType,
} from '@mindfiredigital/pivothead';

interface EnhancedPivotEngine<T extends Record<string, any>>
  extends PivotEngine<T> {
  applyFilters(filters: FilterConfig[]): void;
  setPagination(config: PaginationConfig): void;
  setMeasures(measures: Measure[]): void;
  setDimensions(dimensions: Dimension[]): void;
  getFilterState(): FilterConfig[];
  getPaginationState(): PaginationConfig;
  reset(): void;
  sort(field: string, direction: 'asc' | 'desc'): void;
  setGroupConfig(config: GroupConfig | null): void;
  resizeRow(index: number, height: number): void;
  toggleRowExpansion(rowId: string): void;
  isRowExpanded(rowId: string): boolean;
  getGroupedData(): Group[];
}

export class PivotHeadElement extends HTMLElement {
  private engine!: EnhancedPivotEngine<any>;

  static get observedAttributes() {
    return ['data', 'options'];
  }

  constructor() {
    super();
    this.initialize();
  }

  private initialize() {
    const data = this.getAttribute('data')
      ? JSON.parse(this.getAttribute('data')!)
      : [];
    const options = this.getAttribute('options')
      ? JSON.parse(this.getAttribute('options')!)
      : {};

    const config: PivotTableConfig<any> = {
      data,
      defaultAggregation: 'sum',
      rows: [],
      columns: [],
      measures: [],
      dimensions: [],
      ...options,
    };

    this.engine = new PivotEngine(config) as EnhancedPivotEngine<any>;
    this.notifyStateChange();
  }

  connectedCallback() {
    this.notifyStateChange();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    try {
      switch (name) {
        case 'data':
        case 'options':
          this.updateConfig();
          break;
      }
    } catch (error) {
      console.error(`Error processing attribute ${name}:`, error);
    }
  }

  private updateConfig() {
    const data = this.getAttribute('data')
      ? JSON.parse(this.getAttribute('data')!)
      : [];
    const options = this.getAttribute('options')
      ? JSON.parse(this.getAttribute('options')!)
      : {};

    const config: PivotTableConfig<any> = {
      data,
      defaultAggregation: 'sum',
      rows: [],
      columns: [],
      measures: [],
      dimensions: [],
      ...options,
    };

    this.engine = new PivotEngine(config) as EnhancedPivotEngine<any>;
    this.notifyStateChange();
  }

  private notifyStateChange() {
    const state = this.engine.getState();
    this.dispatchEvent(
      new CustomEvent('stateChange', {
        detail: state,
        bubbles: true,
        composed: true,
      })
    );

    this.dispatchEvent(
      new CustomEvent('dataChange', {
        detail: { data: state.data, processedData: state.processedData },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API methods
  public getState(): PivotTableState<any> {
    return this.engine.getState();
  }

  public refresh(): void {
    this.engine.reset();
    this.notifyStateChange();
  }

  public sort(field: string, direction: 'asc' | 'desc'): void {
    this.engine.sort(field, direction);
    this.notifyStateChange();
  }

  public applyFilters(filters: FilterConfig[]): void {
    this.updateOptionAndRefresh('filterConfig', filters);
  }

  public setPagination(config: PaginationConfig): void {
    this.updateOptionAndRefresh('paginationConfig', config);
  }

  public setMeasures(measures: Measure[]): void {
    this.updateOptionAndRefresh('measures', measures);
  }

  public setDimensions(dimensions: Dimension[]): void {
    this.updateOptionAndRefresh('dimensions', dimensions);
  }

  public setGroupConfig(groupConfig: GroupConfig | null): void {
    this.updateOptionAndRefresh('groupConfig', groupConfig);
  }

  private updateOptionAndRefresh(optionName: string, value: any): void {
    const options = this.getAttribute('options')
      ? JSON.parse(this.getAttribute('options')!)
      : {};

    options[optionName] = value;
    this.setAttribute('options', JSON.stringify(options));
  }

  // Utility method to get a specific option
  public getOption<T>(optionName: string, defaultValue?: T): T {
    const options = this.getAttribute('options')
      ? JSON.parse(this.getAttribute('options')!)
      : {};

    return options[optionName] !== undefined
      ? options[optionName]
      : defaultValue;
  }

  // Method to update multiple options at once
  public updateOptions(newOptions: Partial<PivotTableConfig<any>>): void {
    const options = this.getAttribute('options')
      ? JSON.parse(this.getAttribute('options')!)
      : {};

    const updatedOptions = {
      ...options,
      ...newOptions,
    };

    this.setAttribute('options', JSON.stringify(updatedOptions));
  }

  public getFilters(): FilterConfig[] {
    return this.getOption<FilterConfig[]>('filterConfig', []);
  }

  public getPagination(): PaginationConfig {
    return this.getOption<PaginationConfig>('paginationConfig', {
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
    });
  }

  public getData(): any[] {
    return this.engine.getState().data;
  }

  public getProcessedData(): any {
    return this.engine.getState().processedData;
  }

  public getGroupedData(): Group[] {
    return this.engine.getGroupedData();
  }

  public resizeRow(index: number, height: number): void {
    this.engine.resizeRow(index, height);
    this.notifyStateChange();
  }

  public toggleRowExpansion(rowId: string): void {
    this.engine.toggleRowExpansion(rowId);
    this.notifyStateChange();
  }

  public isRowExpanded(rowId: string): boolean {
    return this.engine.isRowExpanded(rowId);
  }

  public getExpandedState(): ExpandedState {
    return this.engine.getState().expandedRows;
  }

  // Add a method to apply a full sort configuration
  public applySortConfig(sortConfig: SortConfig): void {
    this.engine.sort(sortConfig.field, sortConfig.direction);
    this.notifyStateChange();
  }

  // Add a method to export the current state as JSON
  public exportStateAsJson(): string {
    return JSON.stringify(this.engine.getState());
  }

  // Add methods to specifically get measures and dimensions from options
  public getMeasures(): Measure[] {
    return this.getOption<Measure[]>('measures', []);
  }

  public getDimensions(): Dimension[] {
    return this.getOption<Dimension[]>('dimensions', []);
  }

  // Get default aggregation type
  public getDefaultAggregationType(): AggregationType {
    return this.getOption<AggregationType>('defaultAggregation', 'sum');
  }

  // Set default aggregation type
  public setDefaultAggregationType(aggregationType: AggregationType): void {
    this.updateOptionAndRefresh('defaultAggregation', aggregationType);
  }
}

// Register the web component
customElements.define('pivot-head', PivotHeadElement);
