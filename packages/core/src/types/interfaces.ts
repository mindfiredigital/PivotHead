export interface Column {
  field: string
  label: string
}

export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

export interface PivotTableState<T> {
  data: T[]
  sortConfig: SortConfig | null
}

export interface PivotTableConfig<T> {
  data: T[]
  columns: Column[]
}

