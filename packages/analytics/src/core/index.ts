/**
 * Core module exports for PivotHead Analytics
 */

export { ChartEngine } from './ChartEngine';
export { ChartDetector } from './ChartDetector';
export {
  DataTransformer,
  matrixToDatasets,
  aggregateChartData,
} from './DataTransformer';
export type { TransformOptions, DataMatrix } from './DataTransformer';
export {
  ChartRecommender,
  recommendCharts,
  getBestChartType,
} from './ChartRecommender';
export type { DataProfile, FieldInfo } from './ChartRecommender';
export { DrillDownManager, createDrillDownManager } from './DrillDownManager';
export type {
  DrillDownEvent,
  DrillDownEventListener,
} from './DrillDownManager';
