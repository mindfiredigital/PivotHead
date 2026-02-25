/**
 * @mindfiredigital/pivothead-analytics
 *
 * Data visualization and analytics module for PivotHead
 * Provides chart rendering capabilities with multiple library support
 *
 * No charting library is bundled. Install the one you want to use:
 *
 *   npm install chart.js          # Chart.js  (default)
 *   npm install echarts            # Apache ECharts
 *   npm install plotly.js-dist     # Plotly.js
 *   npm install d3                 # D3.js
 *
 * ChartEngine auto-detects the installed library. You can also set the
 * PIVOTHEAD_LIBRARY env var (chartjs | echarts | plotly | d3).
 *
 * @example Basic Usage (Legacy ChartService — Chart.js must be installed)
 * ```typescript
 * import { ChartService } from '@mindfiredigital/pivothead-analytics';
 * import { Chart, registerables } from 'chart.js';         // install chart.js separately
 * import { PivotEngine } from '@mindfiredigital/pivothead';
 *
 * Chart.register(...registerables);
 * const chartService = new ChartService(engine);
 * const chartData    = chartService.getChartData();
 *
 * new Chart(ctx, { type: 'bar', data: chartData, options: { responsive: true } });
 * ```
 *
 * @example New ChartEngine API (Recommended)
 * ```typescript
 * import { ChartEngine } from '@mindfiredigital/pivothead-analytics';
 * import { PivotEngine } from '@mindfiredigital/pivothead';
 *
 * // Create chart engine
 * const chartEngine = new ChartEngine(engine);
 *
 * // Auto-detect best chart type and render
 * const chart = chartEngine.auto({
 *   container: '#chart-container',
 *   style: { title: 'Sales Analysis' }
 * });
 *
 * // Or get recommendations first
 * const recommendations = chartEngine.recommend();
 * console.log(recommendations[0]); // { type: 'bar', score: 0.95, reason: '...' }
 *
 * // Or use convenience methods
 * chartEngine.bar({ container: '#bar-chart' });
 * chartEngine.pie({ container: '#pie-chart' });
 * chartEngine.line({ container: '#line-chart' });
 *
 * // Export chart
 * await chartEngine.exportAsPng('#chart-container', 'my-chart');
 * await chartEngine.exportAsCsv('#chart-container', 'chart-data');
 * ```
 */

// ==================== Core Engine ====================
export { ChartEngine } from './core/ChartEngine';
export { ChartDetector } from './core/ChartDetector';
export {
  DataTransformer,
  matrixToDatasets,
  aggregateChartData,
} from './core/DataTransformer';
export type { TransformOptions, DataMatrix } from './core/DataTransformer';
export {
  ChartRecommender,
  recommendCharts,
  getBestChartType,
} from './core/ChartRecommender';
export type { DataProfile, FieldInfo } from './core/ChartRecommender';
export {
  DrillDownManager,
  createDrillDownManager,
} from './core/DrillDownManager';
export type {
  DrillDownEvent,
  DrillDownEventListener,
} from './core/DrillDownManager';

// ==================== Renderers ====================
export { ChartJsRenderer } from './renderers/ChartJsRenderer';
export { BaseChartRenderer } from './renderers/BaseChartRenderer';
export { EChartsRenderer } from './renderers/EChartsRenderer';
export { PlotlyRenderer } from './renderers/PlotlyRenderer';
export { D3Renderer } from './renderers/D3Renderer';

// ==================== Utilities ====================
// Color Palettes
export {
  ColorPalettes,
  ColorManager,
  getColorsFromPalette,
  getAvailablePalettes,
} from './utils/ColorPalettes';
export type { ColorPaletteName } from './utils/ColorPalettes';

// Exporters
export { ChartExporter, exportChart, getChartBlob } from './utils/Exporters';
export type { ExportFormat, ExportOptions } from './utils/Exporters';

// Formatters
export {
  ValueFormatter,
  createFormatter,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatCompact,
  defaultFormatter,
} from './utils/Formatters';
export type { FormatType, ExtendedFormatConfig } from './utils/Formatters';

// Data Sampler
export {
  DataSampler,
  createDataSampler,
  sampleData,
} from './utils/DataSampler';
export type { SamplingMethod } from './utils/DataSampler';

// Progressive Renderer
export {
  ProgressiveRenderer,
  createProgressiveRenderer,
  renderProgressively,
} from './utils/ProgressiveRenderer';
export type { ProgressiveRenderOptions } from './utils/ProgressiveRenderer';

// ==================== Chart Classes (Fluent API) ====================
export {
  // Base
  BaseChart,
  // Bar/Column
  BarChart,
  barChart,
  horizontalBarChart,
  columnChart,
  stackedBarChart,
  // Line/Area
  LineChart,
  lineChart,
  areaChart,
  stackedAreaChart,
  // Pie/Doughnut
  PieChart,
  pieChart,
  doughnutChart,
  // Scatter/Bubble
  ScatterChart,
  scatterChart,
  bubbleChart,
  // Heatmap
  HeatmapChart,
  heatmapChart,
  // Treemap
  TreemapChart,
  treemapChart,
  // Combo
  ComboChart,
  comboChart,
  barLineChart,
  areaLineChart,
} from './charts';

export type {
  BaseChartOptions,
  BarChartOptions,
  LineChartOptions,
  PieChartOptions,
  ScatterChartOptions,
  HeatmapChartOptions,
  ColorScaleType,
  TreemapChartOptions,
  ComboChartOptions,
  ComboPrimaryType,
  ComboSecondaryType,
} from './charts';

// ==================== Legacy API (Backward Compatible) ====================
export { ChartService } from './ChartService';

// ==================== Types - Original (Backward Compatible) ====================
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
  TreemapNode,
  TreemapChartData,
  ChartEventData,
  ChartRenderEvent,
} from './types';

export { DEFAULT_CHART_COLORS, DEFAULT_CHART_BORDER_COLORS } from './types';

// ==================== Types - New ====================
export type {
  // Renderer types
  ChartLibrary,
  ChartInstance,
  ChartRenderer,
  ChartRenderOptions,
  // Config types
  StyleConfig,
  InteractionConfig,
  ChartClickData,
  DrillDownConfig,
  DrillDownLevel,
  FormatConfig,
  ExportConfig,
  DataConfig,
  ChartEngineConfig,
  ChartRecommendation,
  ChartEngineOptions,
  PerformanceConfig,
} from './types/index';

// NOTE: Chart.js re-exports removed — chart.js is now an optional peer dependency.
// Import directly from 'chart.js' if you need Chart or registerables:
//   import { Chart, registerables } from 'chart.js';
