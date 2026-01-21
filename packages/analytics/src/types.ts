/**
 * Chart Types and Interfaces for PivotHead Analytics
 * Provides type definitions for chart visualization functionality
 */

/**
 * Supported chart types
 */
export type ChartType =
  | 'column'
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'doughnut'
  | 'stackedColumn'
  | 'stackedBar'
  | 'stackedArea'
  | 'comboBarLine'
  | 'comboAreaLine'
  | 'scatter'
  | 'histogram'
  | 'heatmap'
  | 'funnel'
  | 'sankey';

/**
 * Chart filter configuration
 */
export interface ChartFilterConfig {
  /** Selected measure field name */
  selectedMeasure?: string;
  /** Selected row values to display */
  selectedRows?: string[];
  /** Selected column values to display */
  selectedColumns?: string[];
  /** Limit number of items (0 = no limit) */
  limit?: number;
}

/**
 * Chart configuration options
 */
export interface ChartConfig {
  /** Type of chart to render */
  type: ChartType;
  /** Filter configuration */
  filters?: ChartFilterConfig;
  /** Chart title (auto-generated if not provided) */
  title?: string;
  /** Show legend */
  showLegend?: boolean;
  /** Legend position */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Enable animations */
  animated?: boolean;
  /** Custom color palette */
  colors?: string[];
  /** Chart height in pixels */
  height?: number;
  /** Chart width in pixels (or 'auto' for responsive) */
  width?: number | 'auto';
}

/**
 * Dataset for chart rendering
 */
export interface ChartDataset {
  /** Dataset label */
  label: string;
  /** Data values */
  data: number[];
  /** Background color(s) */
  backgroundColor?: string | string[];
  /** Border color(s) */
  borderColor?: string | string[];
  /** Border width */
  borderWidth?: number;
  /** Fill area under line */
  fill?: boolean;
  /** Line tension (for line/area charts) */
  tension?: number;
  /** Chart type for mixed charts */
  type?: string;
  /** Rendering order */
  order?: number;
}

/**
 * Scatter plot point
 */
export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
}

/**
 * Scatter dataset
 */
export interface ScatterDataset {
  label: string;
  data: ScatterPoint[];
  backgroundColor?: string;
  borderColor?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
}

/**
 * Heatmap cell data
 */
export interface HeatmapCell {
  x: number | string;
  y: number | string;
  value: number;
}

/**
 * Sankey flow data
 */
export interface SankeyFlow {
  from: string;
  to: string;
  flow: number;
}

/**
 * Chart data structure returned by ChartService
 */
export interface ChartData {
  /** Labels for x-axis (categories) */
  labels: string[];
  /** Datasets for rendering */
  datasets: ChartDataset[];
  /** Row field name */
  rowFieldName: string;
  /** Column field name */
  columnFieldName: string;
  /** Available measures */
  measures: Array<{ uniqueName: string; caption: string }>;
  /** Selected measure */
  selectedMeasure: { uniqueName: string; caption: string };
  /** All available row values (for filter UI) */
  allRowValues: string[];
  /** All available column values (for filter UI) */
  allColumnValues: string[];
  /** Filtered row values being displayed */
  filteredRowValues: string[];
  /** Filtered column values being displayed */
  filteredColumnValues: string[];
}

/**
 * Heatmap specific chart data
 */
export interface HeatmapChartData extends Omit<ChartData, 'datasets'> {
  /** Heatmap cells */
  cells: HeatmapCell[];
  /** Minimum value */
  minValue: number;
  /** Maximum value */
  maxValue: number;
}

/**
 * Scatter plot specific chart data
 */
export interface ScatterChartData extends Omit<
  ChartData,
  'datasets' | 'labels'
> {
  /** Scatter datasets */
  datasets: ScatterDataset[];
  /** X-axis measure */
  xMeasure: { uniqueName: string; caption: string };
  /** Y-axis measure */
  yMeasure: { uniqueName: string; caption: string };
}

/**
 * Sankey diagram specific chart data
 */
export interface SankeyChartData extends Omit<
  ChartData,
  'datasets' | 'labels'
> {
  /** Sankey flows */
  flows: SankeyFlow[];
}

/**
 * Histogram specific chart data
 */
export interface HistogramChartData extends Omit<ChartData, 'datasets'> {
  /** Bin labels (ranges) */
  binLabels: string[];
  /** Bin counts */
  binCounts: number[];
  /** Number of bins */
  numBins: number;
}

/**
 * Chart event data
 */
export interface ChartEventData {
  /** Chart type */
  type: ChartType;
  /** Selected data point info */
  dataPoint?: {
    rowValue: string;
    columnValue: string;
    value: number;
    measure: string;
  };
}

/**
 * Chart render event
 */
export interface ChartRenderEvent {
  /** Chart type */
  type: ChartType;
  /** Chart data */
  data: ChartData;
  /** Filter config used */
  filters: ChartFilterConfig;
}

/**
 * Default chart colors
 */
export const DEFAULT_CHART_COLORS = [
  'rgba(54, 162, 235, 0.8)', // Blue
  'rgba(255, 99, 132, 0.8)', // Red
  'rgba(75, 192, 192, 0.8)', // Teal
  'rgba(255, 206, 86, 0.8)', // Yellow
  'rgba(153, 102, 255, 0.8)', // Purple
  'rgba(255, 159, 64, 0.8)', // Orange
  'rgba(46, 204, 113, 0.8)', // Green
  'rgba(231, 76, 60, 0.8)', // Dark Red
  'rgba(52, 73, 94, 0.8)', // Dark Blue
  'rgba(241, 196, 15, 0.8)', // Gold
];

/**
 * Default chart border colors
 */
export const DEFAULT_CHART_BORDER_COLORS = DEFAULT_CHART_COLORS.map(c =>
  c.replace('0.8)', '1)')
);
