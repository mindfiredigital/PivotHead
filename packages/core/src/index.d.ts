export * from './types/interfaces'

// Declare the TableEngine class
export declare class PivotEngine<T extends Record<string, any>> {
  constructor(config: import('./types/interfaces').PivotTableConfig<T>)
  getState(): import('./types/interfaces').PivotTableState<T>
  sort(field: string, direction: 'asc' | 'desc'): void
  reset(): void
}

// Declare the applySort function
export declare function applySort<T extends Record<string, any>>(
  data: T[],
  sortConfig: import('./types/interfaces').SortConfig
): T[]


