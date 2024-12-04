// Re-export all types from the interfaces file
export * from './types/interfaces'

// Declare the PivotEngine class
export declare class PivotEngine<T> {
  constructor(config: import('./types/interfaces').PivotTableConfig<T>)
  getState(): import('./types/interfaces').PivotTableState<T>
  toggleExpand(rowId: string): void
  sort(field: string, direction: 'asc' | 'desc'): void
  filter(field: string, value: any): void
  reset(): void
}

