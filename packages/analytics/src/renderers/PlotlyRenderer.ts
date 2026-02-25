/**
 * Plotly.js Renderer
 * Implements ChartRenderer interface for Plotly.js library
 */

import { BaseChartRenderer } from './BaseChartRenderer';
import type {
  ChartInstance,
  ChartRenderOptions,
} from '../types/renderer-types';
import type { FormatConfig, ChartClickData } from '../types/config-types';
import { ColorManager } from '../utils/ColorPalettes';
import type { ColorPaletteName } from '../utils/ColorPalettes';

// Type definitions for Plotly (minimal, to avoid hard dependency)
interface PlotlyTrace {
  type?: string;
  x?: (string | number)[];
  y?: (string | number)[];
  z?: number[][];
  values?: number[];
  labels?: string[];
  name?: string;
  mode?: string;
  fill?: string;
  marker?: {
    color?: string | string[];
    colors?: string[];
    size?: number | number[];
    line?: { color?: string; width?: number };
  };
  line?: { color?: string; width?: number; shape?: string };
  orientation?: 'v' | 'h';
  text?: string[];
  textposition?: string;
  hoverinfo?: string;
  stackgroup?: string;
  node?: { label?: string[]; color?: string[] };
  link?: { source?: number[]; target?: number[]; value?: number[] };
  parents?: string[];
  ids?: string[];
  branchvalues?: string;
  [key: string]: unknown;
}

interface PlotlyLayout {
  title?: string | { text?: string; font?: { size?: number } };
  showlegend?: boolean;
  legend?: { orientation?: string; x?: number; y?: number };
  xaxis?: {
    title?: string;
    showgrid?: boolean;
    type?: string;
    categoryorder?: string;
  };
  yaxis?: {
    title?: string;
    showgrid?: boolean;
    type?: string;
    tickformat?: string;
  };
  barmode?: string;
  hovermode?: string;
  margin?: { l?: number; r?: number; t?: number; b?: number };
  annotations?: Array<{
    text?: string;
    x?: number;
    y?: number;
    showarrow?: boolean;
  }>;
  [key: string]: unknown;
}

interface PlotlyConfig {
  responsive?: boolean;
  displayModeBar?: boolean;
  displaylogo?: boolean;
  modeBarButtonsToRemove?: string[];
  [key: string]: unknown;
}

interface PlotlyStatic {
  newPlot(
    container: HTMLElement,
    data: PlotlyTrace[],
    layout?: PlotlyLayout,
    config?: PlotlyConfig
  ): Promise<HTMLElement>;
  react(
    container: HTMLElement,
    data: PlotlyTrace[],
    layout?: PlotlyLayout,
    config?: PlotlyConfig
  ): Promise<HTMLElement>;
  purge(container: HTMLElement): void;
  Plots: {
    resize(container: HTMLElement): void;
  };
  toImage(
    container: HTMLElement,
    opts?: { format?: string; width?: number; height?: number }
  ): Promise<string>;
}

// Dynamically get Plotly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPlotly(injected?: any): PlotlyStatic {
  if (injected) return injected as PlotlyStatic;
  // Check for global Plotly
  const globalPlotly = (globalThis as Record<string, unknown>).Plotly as
    | PlotlyStatic
    | undefined;
  if (globalPlotly) {
    return globalPlotly;
  }

  // Try to require plotly.js (for Node.js/bundler environments)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('plotly.js-dist') as PlotlyStatic;
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('plotly.js') as PlotlyStatic;
    } catch {
      throw new Error(
        'Plotly library not found. Please install plotly.js: npm install plotly.js-dist'
      );
    }
  }
}

/**
 * Plotly specific instance wrapper
 */
class PlotlyInstanceWrapper implements ChartInstance {
  private traces: PlotlyTrace[] = [];
  private layout: PlotlyLayout = {};

  constructor(
    private container: HTMLElement,
    private plotly: PlotlyStatic
  ) {}

  setData(traces: PlotlyTrace[], layout: PlotlyLayout): void {
    this.traces = traces;
    this.layout = layout;
  }

  update(data?: unknown): void {
    const Plotly = this.plotly;

    if (data && typeof data === 'object') {
      const chartData = data as {
        labels?: string[];
        datasets?: Array<{
          label?: string;
          data?: number[];
          backgroundColor?: string | string[];
        }>;
      };

      if (chartData.datasets) {
        // Convert to Plotly traces
        const newTraces: PlotlyTrace[] = chartData.datasets.map(
          (ds, index) => ({
            ...this.traces[index],
            x: chartData.labels,
            y: ds.data,
            name: ds.label,
          })
        );

        Plotly.react(this.container, newTraces, this.layout);
      }
    }
  }

  destroy(): void {
    this.plotly.purge(this.container);
  }

  resize(): void {
    this.plotly.Plots.resize(this.container);
  }

  getCanvas(): HTMLCanvasElement | null {
    // Plotly uses SVG by default, try to find canvas if using webgl
    return this.container.querySelector('canvas');
  }

  getPlotlyInstance(): HTMLElement {
    return this.container;
  }
}

/**
 * Plotly.js renderer implementation
 */
export class PlotlyRenderer extends BaseChartRenderer {
  private colorManager: ColorManager;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private injectedPlotly?: any) {
    super();
    this.colorManager = new ColorManager('tableau10');
  }

  /**
   * Render a chart using Plotly
   */
  render(
    container: HTMLElement | string,
    data: unknown,
    options: ChartRenderOptions
  ): ChartInstance {
    const Plotly = getPlotly(this.injectedPlotly);
    const containerEl = this.getContainer(container);

    // Clear container
    this.clearContainer(containerEl);

    // Set container dimensions if specified
    if (options.style?.height) {
      containerEl.style.height = `${options.style.height}px`;
    }
    if (options.style?.width && options.style.width !== 'auto') {
      containerEl.style.width = `${options.style.width}px`;
    }

    // Set color palette if specified
    if (options.style?.colorScheme) {
      this.colorManager.setPalette(
        options.style.colorScheme as ColorPaletteName
      );
    }

    // Build Plotly traces and layout
    const { traces, layout } = this.buildPlotlyConfig(data, options);

    // Build config
    const config: PlotlyConfig = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    // Apply any custom Plotly options (escape hatch)
    if (options.plotlyOptions?.layout) {
      Object.assign(layout, options.plotlyOptions.layout);
    }
    if (options.plotlyOptions?.config) {
      Object.assign(config, options.plotlyOptions.config);
    }

    // Create the plot
    Plotly.newPlot(containerEl, traces, layout, config);

    // Add click handler if specified
    if (options.interactions?.click) {
      (
        containerEl as HTMLElement & {
          on: (event: string, handler: (data: unknown) => void) => void;
        }
      ).on?.('plotly_click', (data: unknown) => {
        const eventData = data as {
          points?: Array<{
            x?: string;
            y?: number;
            curveNumber?: number;
            pointNumber?: number;
          }>;
        };
        if (eventData.points && eventData.points.length > 0) {
          const point = eventData.points[0];
          const clickData: ChartClickData = {
            rowValue: String(point.x || ''),
            value: point.y,
            datasetIndex: point.curveNumber,
            index: point.pointNumber,
          };
          options.interactions!.click!(clickData);
        }
      });
    }

    const instance = new PlotlyInstanceWrapper(containerEl, Plotly);
    instance.setData(traces, layout);
    return instance;
  }

  /**
   * Update an existing chart with new data
   */
  update(
    chart: ChartInstance,
    data: unknown,
    _options?: import('../types/renderer-types').ChartRenderOptions
  ): void {
    chart.update(data);
  }

  /**
   * Destroy a chart and clean up resources
   */
  destroy(chart: ChartInstance): void {
    chart.destroy();
  }

  /**
   * Build Plotly traces and layout from data and options
   */
  private buildPlotlyConfig(
    data: unknown,
    options: ChartRenderOptions
  ): { traces: PlotlyTrace[]; layout: PlotlyLayout } {
    const { type, style } = options;

    const chartData = data as {
      labels?: string[];
      datasets?: Array<{
        label?: string;
        data?: number[] | Array<{ x: number; y: number }>;
        backgroundColor?: string | string[];
        type?: string;
      }>;
      cells?: Array<{ x: number | string; y: number | string; value: number }>;
      flows?: Array<{ from: string; to: string; flow: number }>;
      tree?: Array<{
        name: string;
        value: number;
        children?: unknown[];
        path?: string[];
      }>;
    };

    // Base layout
    const layout: PlotlyLayout = {
      title: style?.title
        ? { text: style.title, font: { size: 16 } }
        : undefined,
      showlegend: style?.showLegend !== false,
      legend: this.getLegendConfig(style?.legendPosition),
      margin: { l: 50, r: 50, t: style?.title ? 50 : 20, b: 50 },
      hovermode: 'closest',
    };

    // Handle different chart types
    switch (type) {
      case 'pie':
      case 'doughnut':
        return this.buildPieConfig(
          chartData as {
            labels?: string[];
            datasets?: Array<{ data?: number[] }>;
          },
          type === 'doughnut',
          layout,
          options
        );
      case 'heatmap':
        return this.buildHeatmapConfig(
          chartData as {
            labels?: string[];
            datasets?: Array<{ label?: string; data?: number[] }>;
            cells?: Array<{
              x: number | string;
              y: number | string;
              value: number;
            }>;
          },
          layout,
          options
        );
      case 'scatter':
        return this.buildScatterConfig(
          chartData as {
            datasets?: Array<{
              label?: string;
              data?: Array<{ x: number; y: number; label?: string }>;
            }>;
          },
          layout,
          options
        );
      case 'funnel':
        return this.buildFunnelConfig(
          chartData as {
            labels?: string[];
            datasets?: Array<{ data?: number[] }>;
          },
          layout,
          options
        );
      case 'sankey':
        return this.buildSankeyConfig(
          chartData as {
            flows?: Array<{ from: string; to: string; flow: number }>;
            labels?: string[];
            datasets?: Array<{ label?: string; data?: number[] }>;
          },
          layout,
          options
        );
      case 'treemap':
        return this.buildTreemapConfig(
          chartData as {
            tree?: Array<{
              name: string;
              value: number;
              children?: unknown[];
              path?: string[];
            }>;
            labels?: string[];
            datasets?: Array<{ data?: number[] }>;
          },
          layout,
          options
        );
      case 'histogram':
        return this.buildHistogramConfig(
          chartData as {
            labels?: string[];
            datasets?: Array<{ label?: string; data?: number[] }>;
          },
          layout,
          options
        );
      default:
        return this.buildCartesianConfig(
          chartData as {
            labels?: string[];
            datasets?: Array<{
              label?: string;
              data?: number[];
              type?: string;
            }>;
          },
          layout,
          options
        );
    }
  }

  /**
   * Build config for Cartesian (bar, line, area) charts
   */
  private buildCartesianConfig(
    chartData: {
      labels?: string[];
      datasets?: Array<{
        label?: string;
        data?: number[];
        type?: string;
      }>;
    },
    layout: PlotlyLayout,
    options: ChartRenderOptions
  ): { traces: PlotlyTrace[]; layout: PlotlyLayout } {
    const { type, style, format } = options;
    const isStacked = type.includes('stacked');
    const isArea = type === 'area' || type === 'stackedArea';
    const isHorizontal =
      type === 'bar' ||
      type === 'stackedBar' ||
      style?.orientation === 'horizontal';
    const isLine = type === 'line' || type.includes('line');

    const traces: PlotlyTrace[] = (chartData.datasets || []).map(
      (ds, index) => {
        const trace: PlotlyTrace = {
          name: ds.label || `Series ${index + 1}`,
          marker: {
            color: this.colorManager.getColor(index),
          },
        };

        if (isHorizontal) {
          trace.type = 'bar';
          trace.x = ds.data;
          trace.y = chartData.labels;
          trace.orientation = 'h';
        } else if (isLine || isArea) {
          trace.type = 'scatter';
          trace.x = chartData.labels;
          trace.y = ds.data;
          trace.mode = 'lines+markers';
          trace.line = {
            color: this.colorManager.getColor(index),
            width: 2,
          };
          if (isArea) {
            trace.fill = isStacked ? 'tonexty' : 'tozeroy';
            trace.stackgroup = isStacked ? 'one' : undefined;
          }
        } else {
          trace.type = 'bar';
          trace.x = chartData.labels;
          trace.y = ds.data;
        }

        return trace;
      }
    );

    // Update layout for bar mode
    if (isStacked && !isArea) {
      layout.barmode = 'stack';
    }

    // Add axis configuration
    layout.xaxis = {
      showgrid: style?.showGrid !== false,
      type: 'category',
    };
    layout.yaxis = {
      showgrid: style?.showGrid !== false,
      tickformat: this.getTickFormat(format),
    };

    return { traces, layout };
  }

  /**
   * Build config for pie/doughnut charts
   */
  private buildPieConfig(
    chartData: {
      labels?: string[];
      datasets?: Array<{ data?: number[] }>;
    },
    isDoughnut: boolean,
    layout: PlotlyLayout,
    _options: ChartRenderOptions
  ): { traces: PlotlyTrace[]; layout: PlotlyLayout } {
    const trace: PlotlyTrace = {
      type: 'pie',
      labels: chartData.labels,
      values: chartData.datasets?.[0]?.data || [],
      marker: {
        colors: this.colorManager.getColors(chartData.labels?.length || 0),
      },
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
    };

    if (isDoughnut) {
      trace.hole = 0.4;
    }

    return { traces: [trace], layout };
  }

  /**
   * Build config for heatmap charts
   */
  private buildHeatmapConfig(
    chartData: {
      labels?: string[];
      datasets?: Array<{ label?: string; data?: number[] }>;
      cells?: Array<{ x: number | string; y: number | string; value: number }>;
    },
    layout: PlotlyLayout,
    options: ChartRenderOptions
  ): { traces: PlotlyTrace[]; layout: PlotlyLayout } {
    const xLabels = chartData.datasets?.map(ds => ds.label || '') || [];
    const yLabels = chartData.labels || [];

    // Build z matrix
    const z: number[][] = [];
    if (chartData.cells) {
      // From cells format
      const matrix: Record<number, Record<number, number>> = {};
      chartData.cells.forEach(cell => {
        const y =
          typeof cell.y === 'number'
            ? cell.y
            : yLabels.indexOf(cell.y as string);
        const x =
          typeof cell.x === 'number'
            ? cell.x
            : xLabels.indexOf(cell.x as string);
        if (!matrix[y]) matrix[y] = {};
        matrix[y][x] = cell.value;
      });

      for (let y = 0; y < yLabels.length; y++) {
        z[y] = [];
        for (let x = 0; x < xLabels.length; x++) {
          z[y][x] = matrix[y]?.[x] ?? 0;
        }
      }
    } else {
      // From datasets format
      chartData.datasets?.forEach((ds, x) => {
        ds.data?.forEach((value, y) => {
          if (!z[y]) z[y] = [];
          z[y][x] = value;
        });
      });
    }

    const trace: PlotlyTrace = {
      type: 'heatmap',
      x: xLabels,
      y: yLabels,
      z,
      colorscale: 'Blues',
      showscale: true,
      hoverinfo: 'x+y+z',
    };

    if (options.style?.showValues !== false) {
      trace.text = z.map(row => row.map(String)) as unknown as string[];
      trace.texttemplate = '%{text}';
    }

    layout.xaxis = { type: 'category' };
    layout.yaxis = { type: 'category' };

    return { traces: [trace], layout };
  }

  /**
   * Build config for scatter charts
   */
  private buildScatterConfig(
    chartData: {
      datasets?: Array<{
        label?: string;
        data?: Array<{ x: number; y: number; label?: string }>;
      }>;
    },
    layout: PlotlyLayout,
    options: ChartRenderOptions
  ): { traces: PlotlyTrace[]; layout: PlotlyLayout } {
    const traces: PlotlyTrace[] = (chartData.datasets || []).map(
      (ds, index) => ({
        type: 'scatter',
        mode: 'markers',
        name: ds.label || `Series ${index + 1}`,
        x: (ds.data || []).map(p => p.x),
        y: (ds.data || []).map(p => p.y),
        text: (ds.data || []).map(p => p.label || ''),
        marker: {
          color: this.colorManager.getColor(index),
          size: 10,
        },
      })
    );

    layout.xaxis = { showgrid: options.style?.showGrid !== false };
    layout.yaxis = { showgrid: options.style?.showGrid !== false };

    return { traces, layout };
  }

  /**
   * Build config for funnel charts
   */
  private buildFunnelConfig(
    chartData: {
      labels?: string[];
      datasets?: Array<{ data?: number[] }>;
    },
    layout: PlotlyLayout,
    _options: ChartRenderOptions
  ): { traces: PlotlyTrace[]; layout: PlotlyLayout } {
    const trace: PlotlyTrace = {
      type: 'funnel',
      y: chartData.labels,
      x: chartData.datasets?.[0]?.data || [],
      textinfo: 'value+percent initial',
      marker: {
        color: this.colorManager.getColors(chartData.labels?.length || 0),
      },
    };

    return { traces: [trace], layout };
  }

  /**
   * Build config for sankey charts
   */
  private buildSankeyConfig(
    chartData: {
      flows?: Array<{ from: string; to: string; flow: number }>;
      labels?: string[];
      datasets?: Array<{ label?: string; data?: number[] }>;
    },
    layout: PlotlyLayout,
    _options: ChartRenderOptions
  ): { traces: PlotlyTrace[]; layout: PlotlyLayout } {
    const nodeLabels: string[] = [];
    const source: number[] = [];
    const target: number[] = [];
    const value: number[] = [];

    const getNodeIndex = (label: string): number => {
      let index = nodeLabels.indexOf(label);
      if (index === -1) {
        index = nodeLabels.length;
        nodeLabels.push(label);
      }
      return index;
    };

    if (chartData.flows) {
      chartData.flows.forEach(flow => {
        source.push(getNodeIndex(flow.from));
        target.push(getNodeIndex(flow.to));
        value.push(flow.flow);
      });
    } else if (chartData.labels && chartData.datasets) {
      chartData.labels.forEach((label, idx) => {
        chartData.datasets?.forEach(ds => {
          const val = ds.data?.[idx];
          if (val && val > 0 && ds.label) {
            source.push(getNodeIndex(label));
            target.push(getNodeIndex(ds.label));
            value.push(val);
          }
        });
      });
    }

    const trace: PlotlyTrace = {
      type: 'sankey',
      orientation: 'h',
      node: {
        label: nodeLabels,
        color: this.colorManager.getColors(nodeLabels.length),
      },
      link: {
        source,
        target,
        value,
      },
    };

    return { traces: [trace], layout };
  }

  /**
   * Build config for treemap charts
   */
  private buildTreemapConfig(
    chartData: {
      tree?: Array<{
        name: string;
        value: number;
        children?: unknown[];
        path?: string[];
      }>;
      labels?: string[];
      datasets?: Array<{ data?: number[] }>;
    },
    layout: PlotlyLayout,
    _options: ChartRenderOptions
  ): { traces: PlotlyTrace[]; layout: PlotlyLayout } {
    const ids: string[] = [];
    const labels: string[] = [];
    const parents: string[] = [];
    const values: number[] = [];

    const processNode = (
      node: {
        name: string;
        value: number;
        children?: unknown[];
        path?: string[];
      },
      parentId: string
    ): void => {
      const nodeId = parentId ? `${parentId}/${node.name}` : node.name;
      ids.push(nodeId);
      labels.push(node.name);
      parents.push(parentId);
      values.push(node.value);

      if (node.children) {
        (node.children as (typeof node)[]).forEach(child => {
          processNode(child, nodeId);
        });
      }
    };

    if (chartData.tree) {
      chartData.tree.forEach(node => processNode(node, ''));
    } else if (chartData.labels) {
      // Flat structure
      chartData.labels.forEach((label, idx) => {
        ids.push(label);
        labels.push(label);
        parents.push('');
        values.push(chartData.datasets?.[0]?.data?.[idx] || 0);
      });
    }

    const trace: PlotlyTrace = {
      type: 'treemap',
      ids,
      labels,
      parents,
      values,
      branchvalues: 'total',
      marker: {
        colors: this.colorManager.getColors(labels.length),
      },
      textinfo: 'label+value',
    };

    return { traces: [trace], layout };
  }

  /**
   * Build config for histogram charts
   */
  private buildHistogramConfig(
    chartData: {
      labels?: string[];
      datasets?: Array<{ label?: string; data?: number[] }>;
    },
    layout: PlotlyLayout,
    options: ChartRenderOptions
  ): { traces: PlotlyTrace[]; layout: PlotlyLayout } {
    // For histogram, use bar chart with bin labels
    const trace: PlotlyTrace = {
      type: 'bar',
      x: chartData.labels,
      y: chartData.datasets?.[0]?.data || [],
      name: chartData.datasets?.[0]?.label || 'Frequency',
      marker: {
        color: this.colorManager.getColor(0),
      },
    };

    layout.xaxis = {
      title: 'Value',
      showgrid: options.style?.showGrid !== false,
    };
    layout.yaxis = {
      title: 'Frequency',
      showgrid: options.style?.showGrid !== false,
    };

    return { traces: [trace], layout };
  }

  /**
   * Get legend configuration based on position
   */
  private getLegendConfig(
    position?: 'top' | 'bottom' | 'left' | 'right'
  ): PlotlyLayout['legend'] {
    switch (position) {
      case 'top':
        return { orientation: 'h', x: 0.5, y: 1.1 };
      case 'bottom':
        return { orientation: 'h', x: 0.5, y: -0.1 };
      case 'left':
        return { orientation: 'v', x: -0.1, y: 0.5 };
      case 'right':
      default:
        return { orientation: 'v', x: 1.02, y: 0.5 };
    }
  }

  /**
   * Get tick format for axis based on format config
   */
  private getTickFormat(format?: FormatConfig): string | undefined {
    if (!format) return undefined;

    switch (format.valueFormat) {
      case 'currency':
        return `$,.${format.decimals ?? 0}f`;
      case 'percent':
        return `,.${format.decimals ?? 0}%`;
      case 'compact':
        return ',.2s';
      default:
        return format.decimals !== undefined
          ? `,.${format.decimals}f`
          : undefined;
    }
  }
}
