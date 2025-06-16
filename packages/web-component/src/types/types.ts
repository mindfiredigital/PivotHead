import type {
  FilterConfig,
  PaginationConfig,
  Measure,
  Dimension,
  GroupConfig,
  AggregationType,
  Group,
  MeasureConfig,
  ProcessedData,
  RowSize,
  SortConfig,
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
export interface FieldFormat {
  type: 'currency' | 'number' | 'percentage' | 'date';
  decimals?: number;
  locale?: string;
  currency?: string;
}


/* eslint-disable @typescript-eslint/no-explicit-any */

// // export type AggregationType = "sum" | "avg" | "count" | "min" | "max"

// // export interface Dimension {
// //   uniqueName: string
// //   caption?: string
// //   dataType?: "string" | "number" | "date" | "boolean"
// //   hierarchyName?: string
// //   levelName?: string
// // }

// // export interface MeasureConfig {
// //   uniqueName: string
// //   caption?: string
// //   aggregation?: AggregationType
// //   formula?: (item: any) => number
// //   format?: FormatConfig
// // }

// // export interface FormatConfig {
// //   type: "currency" | "number" | "percentage" | "date"
// //   locale?: string
// //   currency?: string
// //   decimals?: number
// // }

// // export interface SortConfig {
// //   field: string
// //   direction: "asc" | "desc"
// //   type: "measure" | "dimension"
// //   aggregation?: AggregationType
// // }

// // export interface FilterConfig {
// //   field: string
// //   operator: "equals" | "contains" | "greaterThan" | "lessThan" | "between"
// //   value: any
// // }

// // export interface PaginationConfig {
// //   currentPage: number
// //   pageSize: number
// //   totalPages: number
// // }

// // export interface GroupConfig {
// //   rowFields: string[]
// //   columnFields: string[]
// //   grouper: (item: any, fields: string[]) => string
// // }

// // export interface Group {
// //   key: string
// //   items: any[]
// //   subgroups?: Group[]
// //   aggregates: Record<string, number>
// // }

// // export interface RowSize {
// //   index: number
// //   height: number
// // }

// // export interface ProcessedData {
// //   headers: string[]
// //   rows: any[][]
// //   totals: Record<string, number>
// // }

// export interface DataSource {
//   type: "remote" | "file"
//   url?: string
//   file?: File
// }

// export interface PivotTableConfig<T extends Record<string, any>> {
//   data?: T[]
//   dataSource?: DataSource
//   rows?: Dimension[]
//   columns?: Dimension[]
//   setMeasures(measures: Measure[]): void;
//   dimensions?: Dimension[]
//   defaultAggregation?: AggregationType
//   formatting?: Record<string, SortConfig>
//   groupConfig?: GroupConfig | null
//   initialSort?: SortConfig[]
//   pageSize?: number
//   isResponsive?: boolean
//   onRowDragEnd?: (fromIndex: number, toIndex: number, data: T[]) => void
//   onColumnDragEnd?: (fromIndex: number, toIndex: number, columns: Dimension[]) => void
// }

// export interface PivotTableState<T extends Record<string, any>> {
//   data: T[]
//   processedData: ProcessedData
//   rows: Dimension[]
//   columns: Dimension[]
//   measures: MeasureConfig[]
//   sortConfig: SortConfig[]
//   rowSizes: RowSize[]
//   expandedRows: Record<string, boolean>
//   groupConfig: GroupConfig | null
//   groups: Group[]
//   selectedMeasures: MeasureConfig[]
//   selectedDimensions: Dimension[]
//   selectedAggregation: AggregationType
//   formatting: Record<string, SortConfig>
//   columnWidths: Record<string, number>
//   isResponsive: boolean
//   rowGroups: Group[]
//   columnGroups: Group[]
//   filterConfig: FilterConfig[]
//   paginationConfig: PaginationConfig
// }
