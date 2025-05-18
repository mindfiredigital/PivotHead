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
        case 'filters':
          this.updateFilters(newValue);
          break;
        case 'pagination':
          this.updatePagination(newValue);
          break;
        case 'measures':
          this.updateMeasures(newValue);
          break;
        case 'dimensions':
          this.updateDimensions(newValue);
          break;
        case 'groupconfig':
          this.updateGroupConfig(newValue);
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
      ...options,
    };

    this.engine = new PivotEngine(config) as EnhancedPivotEngine<any>;
    this.notifyStateChange();
  }

  private updateFilters(filtersJson: string) {
    try {
      const filters: FilterConfig[] = JSON.parse(filtersJson);
      this.engine.applyFilters(filters);
      this.notifyStateChange();
    } catch (error) {
      console.error('Error updating filters:', error);
    }
  }

  private updatePagination(paginationJson: string) {
    try {
      const pagination: PaginationConfig = JSON.parse(paginationJson);
      this.engine.setPagination(pagination);
      this.notifyStateChange();
    } catch (error) {
      console.error('Error updating pagination:', error);
    }
  }

  private updateMeasures(measuresJson: string) {
    try {
      const measures: Measure[] = JSON.parse(measuresJson);
      this.engine.setMeasures(measures);
      this.notifyStateChange();
    } catch (error) {
      console.error('Error updating measures:', error);
    }
  }

  private updateDimensions(dimensionsJson: string) {
    try {
      const dimensions: Dimension[] = JSON.parse(dimensionsJson);
      this.engine.setDimensions(dimensions);
      this.notifyStateChange();
    } catch (error) {
      console.error('Error updating dimensions:', error);
    }
  }

  private updateGroupConfig(groupConfigJson: string) {
    try {
      const groupConfig: GroupConfig | null = groupConfigJson
        ? JSON.parse(groupConfigJson)
        : null;
      this.engine.setGroupConfig(groupConfig);
      this.notifyStateChange();
    } catch (error) {
      console.error('Error while updating Group Config:', error);
    }
  }

  private handleRowResize(event: CustomEvent) {
    const { index, height } = event.detail;
    this.engine.resizeRow(index, height);
    this.notifyStateChange();
  }

  private handleRowExpand(event: CustomEvent) {
    const { rowId } = event.detail;
    this.engine.toggleRowExpansion(rowId);
    this.notifyStateChange();
  }

  private handleSortChange(event: CustomEvent) {
    const { field, direction } = event.detail;
    this.engine.sort(field, direction);
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
    this.engine.applyFilters(filters);
    this.notifyStateChange();
  }

  public setPagination(config: PaginationConfig): void {
    this.engine.setPagination(config);
    this.notifyStateChange();
  }

  public setMeasures(measures: Measure[]): void {
    this.engine.setMeasures(measures);
    this.notifyStateChange();
  }

  public setDimensions(dimensions: Dimension[]): void {
    this.engine.setDimensions(dimensions);
    this.notifyStateChange();
  }

  public setGroupConfig(groupConfig: GroupConfig | null): void {
    this.engine.setGroupConfig(groupConfig);
    this.notifyStateChange();
  }

  public getFilters(): FilterConfig[] {
    return this.engine.getFilterState();
  }

  public getPagination(): PaginationConfig {
    return this.engine.getPaginationState();
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
}

// Register the web component
customElements.define('pivot-head', PivotHeadElement);
