import { PivotEngine } from '@mindfiredigital/pivothead';
import type {
  PivotTableConfig,
  FilterConfig,
  PaginationConfig,
  PivotTableState,
  Measure,
  Dimension,
  GroupConfig,
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
}

export class PivotHeadElement extends HTMLElement {
  private engine!: EnhancedPivotEngine<any>;
  private initialized = false;

  static get observedAttributes() {
    return ['data', 'options', 'filters', 'pagination'];
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
    if (oldValue !== newValue) {
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
      }
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

  private notifyStateChange() {
    const state = this.engine.getState();
    this.dispatchEvent(
      new CustomEvent('stateChange', {
        detail: state,
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
}

// Register the web component
customElements.define('pivot-head', PivotHeadElement);
