interface Column {
    field: string;
    label: string;
}
interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}
interface PivotTableState<T> {
    data: T[];
    sortConfig: SortConfig | null;
}
interface PivotTableConfig<T> {
    data: T[];
    columns: Column[];
}

// Declare the TableEngine class
declare class PivotEngine<T extends Record<string, any>> {
  constructor(config: PivotTableConfig<T>)
  getState(): PivotTableState<T>
  sort(field: string, direction: 'asc' | 'desc'): void
  reset(): void
}

// Declare the applySort function
declare function applySort<T extends Record<string, any>>(
  data: T[],
  sortConfig: SortConfig
): T[]

export { Column, PivotEngine, PivotTableConfig, PivotTableState, SortConfig, applySort };
