import './pivot-head/pivotHead';
export type {
  EnhancedPivotEngine,
  PivotDataRecord,
  PivotOptions,
  FormatOptions,
} from './types/types';

// Re-export types from the core package for wrapper usage
export type {
  FilterConfig,
  PaginationConfig,
  PivotTableState,
  MeasureConfig,
  Dimension,
  GroupConfig,
  AggregationType,
  Group,
  FieldInfo,
  LayoutSelection,
} from '@mindfiredigital/pivothead';

// Re-export the custom element type for wrapper usage
export { PivotHeadElement } from './pivot-head/pivotHead';
