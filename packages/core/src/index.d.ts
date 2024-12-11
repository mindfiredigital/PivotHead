export * from './types/interfaces'

export declare class PivotEngine<T extends Record<string, any>> {
  constructor(config: import('./types/interfaces').PivotTableConfig<T>)
  getState(): import('./types/interfaces').PivotTableState<T>
  sort(field: string, direction: 'asc' | 'desc'): void
  reset(): void
  resizeRow(index: number, height: number): void
  setGroupConfig(groupConfig: import('./types/interfaces').GroupConfig | null): void;
  getGroupedData(): import('./types/interfaces').Group[];
  toggleRowExpansion(rowId: string): void;
  isRowExpanded(rowId: string): boolean;
}

// Declare the applySort function
export declare function applySort<T extends Record<string, any>>(
  data: T[],
  sortConfig: import('./types/interfaces').SortConfig
): T[]


