export interface Column {
  field: string
  label: string
}

export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}
export interface RowSize {
  index: number
  height: number
}

export interface PivotTableState<T> {
  data: T[]
  sortConfig: SortConfig | null
  rowSizes: RowSize[]
}

export interface PivotTableConfig<T> {
  data: T[]
  columns: Column[]
}

