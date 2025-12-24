// /*
//  * Public API Surface of pivothead-angular
//  */
// export * from './lib/pivothead-wrapper.component';

// // Re-export types for a better developer experience, mirroring the web component's API
// export type {
//   PivotHeadElement,
//   PivotOptions,
//   PivotDataRecord,
//   FormatOptions,
// } from '@mindfiredigital/pivothead-web-component';

// export type {
//   PivotTableState,
//   FilterConfig,
//   PaginationConfig,
//   MeasureConfig,
//   Dimension,
//   GroupConfig,
//   AggregationType,
//   Group,
// } from '@mindfiredigital/pivothead';

// packages/angular/src/public-api.ts

/*
 * Public API Surface of pivothead-angular
 */
export * from './lib/pivothead-wrapper.component';

// Re-export types for a better developer experience, mirroring the web component's API
export type {
  PivotHeadElement,
  PivotOptions,
  PivotDataRecord,
  FormatOptions,
  PivotTableState,
  FilterConfig,
  PaginationConfig,
  MeasureConfig,
  Dimension,
  GroupConfig,
  AggregationType,
  Group,
  ConnectionOptions,
  FileConnectionResult,
  FieldInfo,
  LayoutSelection,
  CSVParseOptions,
  JSONParseOptions,
} from '@mindfiredigital/pivothead-web-component';
