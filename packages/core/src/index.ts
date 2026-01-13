export { PivotEngine } from './engine/pivotEngine';
export * from './types/interfaces';
export { FieldService } from './engine/fieldService';
export type { FieldInfo, FieldType } from './engine/fieldService';
export { ConnectService } from './engine/connectService';
export type {
  ConnectionOptions,
  FileConnectionResult,
  CSVParseOptions,
  JSONParseOptions,
} from './engine/connectService';
export { PerformanceConfig } from './engine/PerformanceConfig';
export { VirtualScrollManager } from './engine/VirtualScrollManager';
export type {
  VirtualScrollConfig,
  VisibleRange,
} from './engine/VirtualScrollManager';

// Export WASM utilities for server-side usage
export { WasmLoader, getWasmLoader } from './wasm/WasmLoader';
export type { WasmCSVResult, WasmModule } from './wasm/WasmLoader';

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
