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

// Define the structure for expanded rows
export interface ExpandedState {
  [key: string]: boolean;
}

// Define the configuration for grouping
export interface GroupConfig {
  fields: string[];
  grouper: (item: any, fields: string[]) => string;
}

// Define the structure for a group
export interface Group {
  key: string;
  items: any[];
  subgroups?: Group[];
}

export interface PivotTableState<T> {
  data: T[]
  sortConfig: SortConfig | null
  rowSizes: RowSize[];
  expandedRows: ExpandedState;
  groupConfig: GroupConfig | null;
  groups: Group[];
}

export interface PivotTableConfig<T> {
  data: T[]
  columns: Column[];
  groupConfig: GroupConfig;
}

