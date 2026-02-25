/**
 * Configuration Types for PivotHead Analytics
 * Defines interfaces for chart configuration and options
 */

import type { ChartType } from '../types';
import type { ChartLibrary } from './renderer-types';

/**
 * Style configuration for charts
 */
export interface StyleConfig {
  /**
   * Chart title
   */
  title?: string;

  /**
   * Chart subtitle
   */
  subtitle?: string;

  /**
   * Color scheme name (e.g., 'tableau10', 'colorBlind', 'categorical')
   */
  colorScheme?: string;

  /**
   * Custom colors array (overrides colorScheme)
   */
  colors?: string[];

  /**
   * Chart orientation for bar/column charts
   */
  orientation?: 'vertical' | 'horizontal';

  /**
   * Whether to show the legend
   */
  showLegend?: boolean;

  /**
   * Legend position
   */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Whether to show grid lines
   */
  showGrid?: boolean;

  /**
   * Whether to show data values on the chart
   */
  showValues?: boolean;

  /**
   * Whether to enable animations
   */
  animated?: boolean;

  /**
   * Chart height in pixels
   */
  height?: number;

  /**
   * Chart width in pixels (or 'auto' for responsive)
   */
  width?: number | 'auto';
}

/**
 * Interaction configuration for charts
 */
export interface InteractionConfig {
  /**
   * Enable hover effects
   */
  hover?: boolean;

  /**
   * Click event handler
   */
  click?: (data: ChartClickData) => void;

  /**
   * Drill-down configuration
   */
  drillDown?: DrillDownConfig;
}

/**
 * Data passed to click event handler
 */
export interface ChartClickData {
  /**
   * The row value that was clicked
   */
  rowValue?: string;

  /**
   * The column value that was clicked
   */
  columnValue?: string;

  /**
   * The numeric value at the clicked point
   */
  value?: number;

  /**
   * The measure name
   */
  measure?: string;

  /**
   * The dataset index
   */
  datasetIndex?: number;

  /**
   * The data point index within the dataset
   */
  index?: number;

  /**
   * Original event
   */
  event?: Event;
}

/**
 * Drill-down configuration
 */
export interface DrillDownConfig {
  /**
   * Whether drill-down is enabled
   */
  enabled: boolean;

  /**
   * Field names in drill order (e.g., ['region', 'country', 'city'])
   */
  levels: string[];

  /**
   * Callback when drilling down
   */
  onDrill?: (level: DrillDownLevel, path: DrillDownLevel[]) => void;

  /**
   * Callback when drilling up
   */
  onDrillUp?: (path: DrillDownLevel[]) => void;
}

/**
 * Represents a single level in the drill-down path
 */
export interface DrillDownLevel {
  /**
   * The field name at this level
   */
  field: string;

  /**
   * The value selected at this level
   */
  value: unknown;
}

/**
 * Format configuration for chart values
 */
export interface FormatConfig {
  /**
   * Value format type
   */
  valueFormat?: 'number' | 'currency' | 'percent' | 'compact';

  /**
   * Locale for number formatting (e.g., 'en-US', 'de-DE')
   */
  locale?: string;

  /**
   * Number of decimal places
   */
  decimals?: number;

  /**
   * Currency code (when valueFormat is 'currency')
   */
  currency?: string;

  /**
   * Prefix to add before values
   */
  prefix?: string;

  /**
   * Suffix to add after values
   */
  suffix?: string;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  /**
   * Whether export is enabled
   */
  enabled?: boolean;

  /**
   * Supported export formats
   */
  formats?: ('png' | 'svg' | 'pdf' | 'csv' | 'json')[];
}

/**
 * Data configuration for chart
 */
export interface DataConfig {
  /**
   * Which measure to visualize
   */
  measure?: string;

  /**
   * Primary grouping field
   */
  groupBy?: string;

  /**
   * Secondary grouping field (for stacked charts)
   */
  stackBy?: string;

  /**
   * X-axis field (for line/time series charts)
   */
  xAxis?: string;

  /**
   * Series grouping field
   */
  seriesBy?: string;
}

/**
 * Main ChartEngine configuration
 */
export interface ChartEngineConfig {
  /**
   * Container element or CSS selector
   */
  container: string | HTMLElement;

  /**
   * Chart type to render
   */
  type?: ChartType;

  /**
   * Chart rendering library to use
   */
  library?: ChartLibrary;

  /**
   * Data configuration
   */
  data?: DataConfig;

  /**
   * Style configuration
   */
  style?: StyleConfig;

  /**
   * Interaction configuration
   */
  interactions?: InteractionConfig;

  /**
   * Format configuration
   */
  format?: FormatConfig;

  /**
   * Export configuration
   */
  export?: ExportConfig;

  /**
   * Raw Chart.js options override (escape hatch)
   */
  chartJsOptions?: Record<string, unknown>;
}

/**
 * Chart recommendation returned by ChartDetector
 */
export interface ChartRecommendation {
  /**
   * Recommended chart type
   */
  type: ChartType;

  /**
   * Confidence score (0-1)
   */
  score: number;

  /**
   * Human-readable reason for this recommendation
   */
  reason: string;

  /**
   * Short description of what the chart preview would look like
   */
  preview: string;

  /**
   * Pre-configured options for this recommendation.
   * Can be passed directly to chartEngine.renderRecommendation()
   * or spread into chartEngine.render() with a container.
   */
  config: Partial<ChartEngineConfig>;
}

/**
 * Options for ChartEngine constructor
 */
export interface ChartEngineOptions {
  /**
   * Default chart rendering library.
   * If omitted, ChartEngine auto-detects from injected instances,
   * then from installed packages.
   */
  library?: ChartLibrary;

  /**
   * Pre-loaded library instances.
   * Pass these when using a bundler (Vite, webpack, etc.) where require()
   * is unavailable at runtime. The matching library is auto-detected from
   * whichever instance you provide, so you don't need to set `library` too.
   *
   * @example
   * import { Chart, registerables } from 'chart.js';
   * Chart.register(...registerables);
   * new ChartEngine(pivotEngine, { chartInstance: Chart });
   *
   * @example
   * import * as echarts from 'echarts';
   * new ChartEngine(pivotEngine, { echartsInstance: echarts });
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartInstance?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  echartsInstance?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plotlyInstance?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  d3Instance?: any;

  /**
   * Default style configuration
   */
  defaultStyle?: StyleConfig;

  /**
   * Default format configuration
   */
  defaultFormat?: FormatConfig;

  /**
   * Performance configuration
   */
  performance?: PerformanceConfig;
}

/**
 * Performance configuration for handling large datasets
 */
export interface PerformanceConfig {
  /**
   * Maximum data points before sampling kicks in
   */
  maxDataPoints?: number;

  /**
   * Sampling method to use
   */
  samplingMethod?: 'random' | 'stratified' | 'systematic' | 'lttb';

  /**
   * Enable progressive rendering
   */
  progressiveRendering?: boolean;

  /**
   * Debounce time in ms for updates
   */
  debounceMs?: number;
}
