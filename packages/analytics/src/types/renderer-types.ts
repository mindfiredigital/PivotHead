/**
 * Renderer Types for PivotHead Analytics
 * Defines interfaces for chart rendering abstraction layer
 */

/**
 * Supported chart rendering libraries
 */
export type ChartLibrary = 'chartjs' | 'echarts' | 'plotly' | 'd3';

/**
 * Chart instance interface - provides common operations across all renderers
 */
export interface ChartInstance {
  /**
   * Update the chart with new data
   * @param data - Optional new data to update the chart with
   */
  update(data?: unknown): void;

  /**
   * Destroy the chart and clean up resources
   */
  destroy(): void;

  /**
   * Resize the chart to fit its container
   */
  resize(): void;

  /**
   * Get the underlying canvas element (if available)
   */
  getCanvas(): HTMLCanvasElement | null;

  /**
   * Get the underlying Chart.js instance (escape hatch for advanced usage)
   * Only available when using Chart.js renderer
   */
  getChartJsInstance?(): unknown;

  /**
   * Get the underlying ECharts instance (escape hatch for advanced usage)
   * Only available when using ECharts renderer
   */
  getEChartsInstance?(): unknown;

  /**
   * Get the underlying Plotly container element (escape hatch for advanced usage)
   * Only available when using Plotly renderer
   */
  getPlotlyInstance?(): HTMLElement;

  /**
   * Get the underlying D3 SVG selection (escape hatch for advanced usage)
   * Only available when using D3 renderer
   */
  getD3Selection?(): unknown;
}

/**
 * Chart renderer interface - abstraction layer for different chart libraries
 */
export interface ChartRenderer {
  /**
   * Render a chart in the specified container
   * @param container - DOM element or selector string
   * @param data - Chart data
   * @param options - Chart options
   */
  render(
    container: HTMLElement | string,
    data: unknown,
    options: ChartRenderOptions
  ): ChartInstance;

  /**
   * Update an existing chart with new data
   * @param chart - The chart instance to update
   * @param data - New data
   * @param options - Optional render options (e.g., for color updates)
   */
  update(
    chart: ChartInstance,
    data: unknown,
    options?: ChartRenderOptions
  ): void;

  /**
   * Destroy a chart and clean up resources
   * @param chart - The chart instance to destroy
   */
  destroy(chart: ChartInstance): void;
}

/**
 * Options passed to renderer's render method
 */
export interface ChartRenderOptions {
  /**
   * The type of chart to render
   */
  type: string;

  /**
   * Style configuration
   */
  style?: import('./config-types').StyleConfig;

  /**
   * Format configuration
   */
  format?: import('./config-types').FormatConfig;

  /**
   * Interaction configuration
   */
  interactions?: import('./config-types').InteractionConfig;

  /**
   * Raw Chart.js options override (escape hatch)
   */
  chartJsOptions?: Record<string, unknown>;

  /**
   * Raw ECharts options override (escape hatch)
   * Merged with generated options when using ECharts renderer
   */
  echartsOptions?: Record<string, unknown>;

  /**
   * Raw Plotly layout/config options override (escape hatch)
   * Merged with generated options when using Plotly renderer
   */
  plotlyOptions?: {
    layout?: Record<string, unknown>;
    config?: Record<string, unknown>;
  };

  /**
   * Raw D3 options override (escape hatch)
   * Merged with generated options when using D3 renderer
   */
  d3Options?: {
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    transition?: { duration?: number; ease?: string };
    [key: string]: unknown;
  };
}
