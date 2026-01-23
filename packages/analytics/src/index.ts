/**
 * @mindfiredigital/pivothead-analytics
 *
 * Data visualization and analytics module for PivotHead
 * Provides chart rendering capabilities with Chart.js integration
 *
 * This package includes Chart.js - no need to install it separately!
 *
 * @example
 * ```typescript
 * import {
 *   ChartService,
 *   Chart,
 *   registerables
 * } from '@mindfiredigital/pivothead-analytics';
 * import { PivotEngine } from '@mindfiredigital/pivothead';
 *
 * // Register Chart.js components
 * Chart.register(...registerables);
 *
 * // Initialize with PivotEngine
 * const chartService = new ChartService(engine);
 *
 * // Get chart data
 * const chartData = chartService.getChartData();
 *
 * // Render chart
 * new Chart(ctx, {
 *   type: 'bar',
 *   data: chartData,
 *   options: { responsive: true }
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

// Re-export Chart.js for convenience
// Users can import Chart directly from this package
export { Chart, registerables } from 'chart.js';
export type { ChartConfiguration, ChartOptions } from 'chart.js';
