/**
 * Chart Configuration Classes
 * Provides fluent API for building chart configurations
 */

// Base chart class
export { BaseChart } from './BaseChart';
export type { BaseChartOptions } from './BaseChart';

// Bar/Column chart
export {
  BarChart,
  barChart,
  horizontalBarChart,
  columnChart,
  stackedBarChart,
} from './BarChart';
export type { BarChartOptions } from './BarChart';

// Line/Area chart
export { LineChart, lineChart, areaChart, stackedAreaChart } from './LineChart';
export type { LineChartOptions } from './LineChart';

// Pie/Doughnut chart
export { PieChart, pieChart, doughnutChart } from './PieChart';
export type { PieChartOptions } from './PieChart';

// Scatter/Bubble chart
export { ScatterChart, scatterChart, bubbleChart } from './ScatterChart';
export type { ScatterChartOptions } from './ScatterChart';

// Heatmap chart
export { HeatmapChart, heatmapChart } from './HeatmapChart';
export type { HeatmapChartOptions, ColorScaleType } from './HeatmapChart';

// Treemap chart
export { TreemapChart, treemapChart } from './TreemapChart';
export type { TreemapChartOptions } from './TreemapChart';

// Combo chart
export {
  ComboChart,
  comboChart,
  barLineChart,
  areaLineChart,
} from './ComboChart';
export type {
  ComboChartOptions,
  ComboPrimaryType,
  ComboSecondaryType,
} from './ComboChart';
