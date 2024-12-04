export interface DimensionConfig {
  field: string
  type: 'string' | 'number' | 'date'
}

export interface MeasureConfig {
  field: string
  aggregationType: AggregationType
  formatter?: (value: number) => string
}

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max'

export interface PivotTableConfig<T> {
  data: T[]
  dimensions: DimensionConfig[]
  measures: MeasureConfig[]
  plugins?: any[] // You can define specific plugin types if needed
}

export interface ProcessedRow<T> {
  id: string
  level: number
  isExpanded: boolean
  parentId?: string
  dimensions: { [key: string]: any }
  measures: { [key: string]: number }
  originalData: T[]
}

export interface PivotTableState<T> {
  rows: ProcessedRow<T>[]
  columns: string[]
  expandedNodes: Set<string>
  sortConfig: { field: string; direction: 'asc' | 'desc' } | null
  filterConfig: { field: string; value: any } | null
}

