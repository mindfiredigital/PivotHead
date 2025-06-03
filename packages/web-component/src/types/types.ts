import type {
  FilterConfig,
  PaginationConfig,
  Measure,
  Dimension,
  GroupConfig,
} from '@mindfiredigital/pivothead';

export interface EnhancedPivotEngine<T extends Record<string, any>> {
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
