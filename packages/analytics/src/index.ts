/**
 * @mindfiredigital/pivothead-analytics
 *
 * Data visualization and analytics module for PivotHead
 * Provides chart rendering capabilities with Chart.js integration
 *
 * @example
 * ```typescript
 * import { ChartService, ChartType } from '@mindfiredigital/pivothead-analytics';
 * import { PivotEngine } from '@mindfiredigital/pivothead';
 *
 * // Initialize with PivotEngine
 * const chartService = new ChartService(engine);
 *
 * // Get chart data
 * const chartData = chartService.getChartData();
 *
 * // Render with Chart.js
 * new Chart(ctx, {
 *   type: 'bar',
 *   data: chartData,
 *   options: { ... }
 * });
 * ```
 */

// Export ChartService
export { ChartService } from './ChartService';

// Export all types
export type {
  ChartType,
  ChartFilterConfig,
  ChartConfig,
  ChartDataset,
  ScatterPoint,
  ScatterDataset,
  HeatmapCell,
  SankeyFlow,
  ChartData,
  HeatmapChartData,
  ScatterChartData,
  SankeyChartData,
  HistogramChartData,
  ChartEventData,
  ChartRenderEvent,
} from './types';

// Export constants
export { DEFAULT_CHART_COLORS, DEFAULT_CHART_BORDER_COLORS } from './types';
