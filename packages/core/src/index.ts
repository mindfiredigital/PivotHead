export { PivotEngine } from './engine/pivotEngine';
export * from './types/interfaces';
export { FieldService } from './engine/fieldService';

export type { FieldInfo, FieldType } from './engine/fieldService';

export type { LayoutSelection } from './types/interfaces';

// Ensure all necessary types are exported
export type {
  PivotTableConfig,
  PivotTableState,
  Column,
  SortConfig,
  GroupConfig,
  Group,
  RowSize,
  Measure,
  Dimension,
  AggregationType,
  FormatOptions,
} from './types/interfaces';
