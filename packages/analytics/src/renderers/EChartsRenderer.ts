/**
 * ECharts Renderer
 * Implements ChartRenderer interface for Apache ECharts library
 */

import { BaseChartRenderer } from './BaseChartRenderer';
import type {
  ChartInstance,
  ChartRenderOptions,
} from '../types/renderer-types';
import type { FormatConfig, ChartClickData } from '../types/config-types';
import { ColorManager } from '../utils/ColorPalettes';
import type { ColorPaletteName } from '../utils/ColorPalettes';

// Type definitions for ECharts (minimal, to avoid hard dependency)
interface EChartsInstance {
  setOption(option: Record<string, unknown>, notMerge?: boolean): void;
  resize(): void;
  dispose(): void;
  getDataURL(opts?: { type?: string; pixelRatio?: number }): string;
  on(eventName: string, handler: (params: unknown) => void): void;
  off(eventName: string, handler?: (params: unknown) => void): void;
  getDom(): HTMLElement;
}

interface EChartsStatic {
  init(
    container: HTMLElement,
    theme?: string | null,
    opts?: { renderer?: 'canvas' | 'svg' }
  ): EChartsInstance;
  getInstanceByDom(container: HTMLElement): EChartsInstance | undefined;
}

// Dynamically get ECharts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getECharts(injected?: any): EChartsStatic {
  // Injected instance (from ChartEngine options) — highest priority
  if (injected) return injected as EChartsStatic;

  // Check for global echarts
  const globalECharts = (globalThis as Record<string, unknown>).echarts as
    | EChartsStatic
    | undefined;
  if (globalECharts) {
    return globalECharts;
  }

  // Try to require echarts (for Node.js/bundler environments)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('echarts') as EChartsStatic;
  } catch {
    throw new Error(
      'ECharts library not found. Please install echarts: npm install echarts'
    );
  }
}

/**
 * ECharts specific instance wrapper
 */
class EChartsInstanceWrapper implements ChartInstance {
  constructor(
    private chart: EChartsInstance,
    private container: HTMLElement
  ) {}

  update(data?: unknown): void {
    if (data && typeof data === 'object') {
      this.chart.setOption(data as Record<string, unknown>, false);
    }
  }

  destroy(): void {
    this.chart.dispose();
  }

  resize(): void {
    this.chart.resize();
  }

  getCanvas(): HTMLCanvasElement | null {
    const canvas = this.container.querySelector('canvas');
    return canvas as HTMLCanvasElement | null;
  }

  getEChartsInstance(): EChartsInstance {
    return this.chart;
  }
}

/**
 * ECharts renderer implementation
 */
export class EChartsRenderer extends BaseChartRenderer {
  private colorManager: ColorManager;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private injectedECharts?: any) {
    super();
    this.colorManager = new ColorManager('tableau10');
  }

  /**
   * Render a chart using ECharts
   */
  render(
    container: HTMLElement | string,
    data: unknown,
    options: ChartRenderOptions
  ): ChartInstance {
    const echarts = getECharts(this.injectedECharts);
    const containerEl = this.getContainer(container);

    // Check for existing instance and dispose
    const existingChart = echarts.getInstanceByDom(containerEl);
    if (existingChart) {
      existingChart.dispose();
    }

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

    // Initialize ECharts instance
    const chart = echarts.init(containerEl, null, { renderer: 'canvas' });

    // Build ECharts option
    const echartsOption = this.buildEChartsOption(data, options);

    // Apply any custom ECharts options (escape hatch)
    if (options.echartsOptions) {
      Object.assign(echartsOption, options.echartsOptions);
    }

    // Set the option
    chart.setOption(echartsOption);

    // Add click handler if specified
    if (options.interactions?.click) {
      chart.on('click', (params: unknown) => {
        const p = params as {
          seriesName?: string;
          name?: string;
          value?: number | number[];
          seriesIndex?: number;
          dataIndex?: number;
          event?: { event: Event };
        };

        const clickData: ChartClickData = {
          rowValue: p.name,
          columnValue: p.seriesName,
          value: Array.isArray(p.value) ? p.value[1] : p.value,
          measure: p.seriesName,
          datasetIndex: p.seriesIndex,
          index: p.dataIndex,
          event: p.event?.event,
        };

        options.interactions!.click!(clickData);
      });
    }

    return new EChartsInstanceWrapper(chart, containerEl);
  }

  /**
   * Update an existing chart with new data
   */
  update(
    chart: ChartInstance,
    data: unknown,
    _options?: import('../types/renderer-types').ChartRenderOptions
  ): void {
    const echartsInstance = (
      chart as EChartsInstanceWrapper
    ).getEChartsInstance?.();
    if (echartsInstance && data && typeof data === 'object') {
      const chartData = data as {
        labels?: string[];
        datasets?: Array<{
          label?: string;
          data?: number[];
        }>;
      };

      // Convert to ECharts series format
      if (chartData.datasets) {
        const series = chartData.datasets.map((ds, index) => ({
          name: ds.label,
          data: ds.data,
          itemStyle: {
            color: this.colorManager.getColor(index),
          },
        }));

        echartsInstance.setOption(
          {
            xAxis: chartData.labels ? { data: chartData.labels } : undefined,
            series,
          },
          false
        );
      }
    }
  }

  /**
   * Destroy a chart and clean up resources
   */
  destroy(chart: ChartInstance): void {
    chart.destroy();
  }

  /**
   * Map PivotHead chart types to ECharts types
   */
  private mapChartType(type: string): string {
    const typeMapping: Record<string, string> = {
      column: 'bar',
      bar: 'bar',
      line: 'line',
      area: 'line',
      pie: 'pie',
      doughnut: 'pie',
      scatter: 'scatter',
      stackedColumn: 'bar',
      stackedBar: 'bar',
      stackedArea: 'line',
      comboBarLine: 'bar',
      comboAreaLine: 'line',
      histogram: 'bar',
      heatmap: 'heatmap',
      funnel: 'funnel',
      sankey: 'sankey',
      treemap: 'treemap',
    };

    return typeMapping[type] || 'bar';
  }

  /**
   * Build ECharts option object from data and options
   */
  private buildEChartsOption(
    data: unknown,
    options: ChartRenderOptions
  ): Record<string, unknown> {
    const { type, style, format } = options;
    const chartType = this.mapChartType(type);

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
      tree?: Array<{ name: string; value: number; children?: unknown[] }>;
    };

    // Base option
    const echartsOption: Record<string, unknown> = {
      title: {
        text: style?.title || '',
        subtext: style?.subtitle || '',
        left: 'center',
      },
      tooltip: {
        trigger: this.getTooltipTrigger(chartType),
        formatter: (params: unknown) => this.formatTooltip(params, format),
      },
      legend: {
        show: style?.showLegend !== false,
        bottom: style?.legendPosition === 'bottom' ? 0 : undefined,
        top: style?.legendPosition === 'top' ? 'auto' : undefined,
        left: style?.legendPosition === 'left' ? 0 : undefined,
        right: style?.legendPosition === 'right' ? 0 : undefined,
        orient:
          style?.legendPosition === 'left' || style?.legendPosition === 'right'
            ? 'vertical'
            : 'horizontal',
      },
      color: this.colorManager.getAllColors(),
      animation: style?.animated !== false,
      animationDuration: style?.animated === false ? 0 : 750,
    };

    // Handle different chart types
    switch (chartType) {
      case 'pie':
        return this.buildPieOption(
          echartsOption,
          chartData as {
            labels?: string[];
            datasets?: Array<{ data?: number[] }>;
          },
          options
        );
      case 'heatmap':
        return this.buildHeatmapOption(
          echartsOption,
          chartData as {
            labels?: string[];
            datasets?: Array<{ label?: string }>;
            cells?: Array<{
              x: number | string;
              y: number | string;
              value: number;
            }>;
          },
          options
        );
      case 'scatter':
        return this.buildScatterOption(
          echartsOption,
          chartData as {
            datasets?: Array<{
              label?: string;
              data?: Array<{ x: number; y: number; label?: string }>;
            }>;
          },
          options
        );
      case 'funnel':
        return this.buildFunnelOption(
          echartsOption,
          chartData as {
            labels?: string[];
            datasets?: Array<{ data?: number[] }>;
          },
          options
        );
      case 'sankey':
        return this.buildSankeyOption(
          echartsOption,
          chartData as {
            flows?: Array<{ from: string; to: string; flow: number }>;
            labels?: string[];
            datasets?: Array<{ label?: string }>;
          },
          options
        );
      case 'treemap':
        return this.buildTreemapOption(
          echartsOption,
          chartData as {
            tree?: Array<{ name: string; value: number; children?: unknown[] }>;
            labels?: string[];
            datasets?: Array<{ data?: number[] }>;
          },
          options
        );
      default:
        return this.buildCartesianOption(
          echartsOption,
          chartData as {
            labels?: string[];
            datasets?: Array<{
              label?: string;
              data?: number[];
              type?: string;
            }>;
          },
          options
        );
    }
  }

  /**
   * Build option for Cartesian (bar, line, area) charts
   */
  private buildCartesianOption(
    baseOption: Record<string, unknown>,
    chartData: {
      labels?: string[];
      datasets?: Array<{
        label?: string;
        data?: number[];
        type?: string;
      }>;
    },
    options: ChartRenderOptions
  ): Record<string, unknown> {
    const { type, style, format } = options;
    const isStacked = type.includes('stacked') || type.startsWith('stacked');
    const isArea = type === 'area' || type === 'stackedArea';
    const isHorizontal =
      type === 'bar' ||
      type === 'stackedBar' ||
      style?.orientation === 'horizontal';

    const series = (chartData.datasets || []).map((ds, index) => {
      const seriesType =
        ds.type || (type.includes('line') || type === 'area' ? 'line' : 'bar');

      return {
        name: ds.label || `Series ${index + 1}`,
        type: seriesType === 'area' ? 'line' : seriesType,
        data: ds.data || [],
        stack: isStacked ? 'total' : undefined,
        areaStyle: isArea || ds.type === 'area' ? {} : undefined,
        itemStyle: {
          color: this.colorManager.getColor(index),
        },
        emphasis: {
          focus: 'series',
        },
        smooth: type.includes('area') ? true : false,
      };
    });

    const axisConfig = {
      type: 'category' as const,
      data: chartData.labels || [],
      axisLine: { show: true },
      axisTick: { show: true },
    };

    const valueAxisConfig = {
      type: 'value' as const,
      axisLabel: {
        formatter: (value: number) => this.formatValue(value, format),
      },
      splitLine: {
        show: style?.showGrid !== false,
      },
    };

    return {
      ...baseOption,
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: isHorizontal ? valueAxisConfig : axisConfig,
      yAxis: isHorizontal ? axisConfig : valueAxisConfig,
      series,
    };
  }

  /**
   * Build option for pie/doughnut charts
   */
  private buildPieOption(
    baseOption: Record<string, unknown>,
    chartData: {
      labels?: string[];
      datasets?: Array<{ data?: number[] }>;
    },
    options: ChartRenderOptions
  ): Record<string, unknown> {
    const isDoughnut = options.type === 'doughnut';
    const data = (chartData.labels || []).map((label, idx) => ({
      name: label,
      value: chartData.datasets?.[0]?.data?.[idx] || 0,
    }));

    return {
      ...baseOption,
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      series: [
        {
          name: 'Data',
          type: 'pie',
          radius: isDoughnut ? ['40%', '70%'] : '70%',
          center: ['50%', '50%'],
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
          },
        },
      ],
    };
  }

  /**
   * Build option for heatmap charts
   */
  private buildHeatmapOption(
    baseOption: Record<string, unknown>,
    chartData: {
      labels?: string[];
      datasets?: Array<{ label?: string }>;
      cells?: Array<{ x: number | string; y: number | string; value: number }>;
    },
    options: ChartRenderOptions
  ): Record<string, unknown> {
    const xLabels = chartData.datasets?.map(ds => ds.label || '') || [];
    const yLabels = chartData.labels || [];

    // Transform cells to ECharts format [x, y, value]
    const data = (chartData.cells || []).map(cell => [
      cell.x,
      cell.y,
      cell.value,
    ]);

    // Calculate min/max for visual map
    const values = data.map(d => d[2] as number);
    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values, 1);

    return {
      ...baseOption,
      tooltip: {
        position: 'top',
      },
      grid: {
        height: '70%',
        top: '10%',
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        splitArea: { show: true },
      },
      yAxis: {
        type: 'category',
        data: yLabels,
        splitArea: { show: true },
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026',
          ],
        },
      },
      series: [
        {
          name: 'Value',
          type: 'heatmap',
          data,
          label: {
            show: options.style?.showValues !== false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }

  /**
   * Build option for scatter charts
   */
  private buildScatterOption(
    baseOption: Record<string, unknown>,
    chartData: {
      datasets?: Array<{
        label?: string;
        data?: Array<{ x: number; y: number; label?: string }>;
      }>;
    },
    options: ChartRenderOptions
  ): Record<string, unknown> {
    const series = (chartData.datasets || []).map((ds, index) => ({
      name: ds.label || `Series ${index + 1}`,
      type: 'scatter',
      data: (ds.data || []).map(point => [point.x, point.y]),
      itemStyle: {
        color: this.colorManager.getColor(index),
      },
      symbolSize: 10,
    }));

    return {
      ...baseOption,
      xAxis: {
        type: 'value',
        splitLine: { show: options.style?.showGrid !== false },
      },
      yAxis: {
        type: 'value',
        splitLine: { show: options.style?.showGrid !== false },
      },
      series,
    };
  }

  /**
   * Build option for funnel charts
   */
  private buildFunnelOption(
    baseOption: Record<string, unknown>,
    chartData: {
      labels?: string[];
      datasets?: Array<{ data?: number[] }>;
    },
    _options: ChartRenderOptions
  ): Record<string, unknown> {
    const data = (chartData.labels || []).map((label, idx) => ({
      name: label,
      value: chartData.datasets?.[0]?.data?.[idx] || 0,
    }));

    // Sort by value descending for funnel effect
    data.sort((a, b) => b.value - a.value);

    return {
      ...baseOption,
      series: [
        {
          name: 'Funnel',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: Math.max(...data.map(d => d.value), 100),
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid',
            },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
          emphasis: {
            label: {
              fontSize: 20,
            },
          },
          data,
        },
      ],
    };
  }

  /**
   * Build option for sankey charts
   */
  private buildSankeyOption(
    baseOption: Record<string, unknown>,
    chartData: {
      flows?: Array<{ from: string; to: string; flow: number }>;
      labels?: string[];
      datasets?: Array<{ label?: string }>;
    },
    _options: ChartRenderOptions
  ): Record<string, unknown> {
    // Build nodes and links from flows
    const nodeSet = new Set<string>();
    const links: Array<{ source: string; target: string; value: number }> = [];

    if (chartData.flows) {
      chartData.flows.forEach(flow => {
        nodeSet.add(flow.from);
        nodeSet.add(flow.to);
        links.push({
          source: flow.from,
          target: flow.to,
          value: flow.flow,
        });
      });
    } else if (chartData.labels && chartData.datasets) {
      // Build from standard chart data
      chartData.labels.forEach(label => nodeSet.add(label));
      chartData.datasets.forEach(ds => {
        if (ds.label) nodeSet.add(ds.label);
      });

      chartData.labels.forEach((label, idx) => {
        chartData.datasets?.forEach(ds => {
          const value = (ds as { data?: number[] }).data?.[idx];
          if (value && value > 0 && ds.label) {
            links.push({
              source: label,
              target: ds.label,
              value,
            });
          }
        });
      });
    }

    const nodes = Array.from(nodeSet).map(name => ({ name }));

    return {
      ...baseOption,
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: {
            focus: 'adjacency',
          },
          data: nodes,
          links,
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
          },
        },
      ],
    };
  }

  /**
   * Build option for treemap charts
   */
  private buildTreemapOption(
    baseOption: Record<string, unknown>,
    chartData: {
      tree?: Array<{ name: string; value: number; children?: unknown[] }>;
      labels?: string[];
      datasets?: Array<{ data?: number[] }>;
    },
    _options: ChartRenderOptions
  ): Record<string, unknown> {
    let data: Array<{ name: string; value: number; children?: unknown[] }>;

    if (chartData.tree) {
      data = chartData.tree;
    } else {
      // Build from standard chart data
      data = (chartData.labels || []).map((label, idx) => ({
        name: label,
        value: chartData.datasets?.[0]?.data?.[idx] || 0,
      }));
    }

    return {
      ...baseOption,
      series: [
        {
          type: 'treemap',
          data,
          visibleMin: 300,
          label: {
            show: true,
            formatter: '{b}',
          },
          itemStyle: {
            borderColor: '#fff',
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 5,
              },
            },
            {
              itemStyle: {
                gapWidth: 1,
              },
            },
            {
              colorSaturation: [0.35, 0.5],
              itemStyle: {
                gapWidth: 1,
                borderColorSaturation: 0.6,
              },
            },
          ],
        },
      ],
    };
  }

  /**
   * Get tooltip trigger type based on chart type
   */
  private getTooltipTrigger(chartType: string): 'axis' | 'item' {
    const itemTriggerTypes = ['pie', 'scatter', 'funnel', 'treemap', 'sankey'];
    return itemTriggerTypes.includes(chartType) ? 'item' : 'axis';
  }

  /**
   * Format tooltip content
   */
  private formatTooltip(params: unknown, format?: FormatConfig): string {
    const p = params as {
      seriesName?: string;
      name?: string;
      value?: number | number[];
      percent?: number;
      marker?: string;
    };

    if (Array.isArray(params)) {
      return (params as (typeof p)[])
        .map(
          item =>
            `${item.marker || ''} ${item.seriesName}: ${this.formatValue(
              Array.isArray(item.value) ? item.value[1] : item.value || 0,
              format
            )}`
        )
        .join('<br/>');
    }

    const value = Array.isArray(p.value) ? p.value[1] : p.value || 0;
    return `${p.marker || ''} ${p.seriesName || p.name}: ${this.formatValue(
      value,
      format
    )}`;
  }

  /**
   * Format a numeric value based on format configuration
   */
  private formatValue(value: number, format?: FormatConfig): string {
    if (value === undefined || value === null) return '';

    const locale = format?.locale || 'en-US';
    const decimals = format?.decimals ?? 0;
    const prefix = format?.prefix || '';
    const suffix = format?.suffix || '';

    let formattedValue: string;

    switch (format?.valueFormat) {
      case 'currency':
        formattedValue = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: format.currency || 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
        break;

      case 'percent':
        formattedValue = new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value / 100);
        break;

      case 'compact':
        formattedValue = new Intl.NumberFormat(locale, {
          notation: 'compact',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
        break;

      default:
        formattedValue = new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
    }

    return `${prefix}${formattedValue}${suffix}`;
  }
}
