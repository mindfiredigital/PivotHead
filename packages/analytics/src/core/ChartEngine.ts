/**
 * ChartEngine - Main orchestrator for PivotHead Analytics
 * Provides a high-level API for rendering charts from pivot data
 */

import type { PivotEngine } from '@mindfiredigital/pivothead';
import { ChartService } from '../ChartService';
import { ChartDetector } from './ChartDetector';
import { ChartJsRenderer } from '../renderers/ChartJsRenderer';
import { EChartsRenderer } from '../renderers/EChartsRenderer';
import { PlotlyRenderer } from '../renderers/PlotlyRenderer';
import { D3Renderer } from '../renderers/D3Renderer';
import { ColorManager } from '../utils/ColorPalettes';
import type { ColorPaletteName } from '../utils/ColorPalettes';
import { ChartExporter } from '../utils/Exporters';
import type { ExportOptions, ExportFormat } from '../utils/Exporters';
import type { ChartType, ChartData } from '../types';
import type {
  ChartLibrary,
  ChartInstance,
  ChartRenderer,
} from '../types/renderer-types';
import type {
  ChartEngineConfig,
  ChartEngineOptions,
  ChartRecommendation,
  StyleConfig,
  FormatConfig,
} from '../types/config-types';

/**
 * ChartEngine is the main entry point for creating charts from PivotEngine data.
 * It provides:
 * - Automatic chart type detection and recommendations
 * - Multiple chart rendering libraries support
 * - Easy-to-use API for common chart types
 * - Automatic data synchronization with PivotEngine
 */
export class ChartEngine<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  private chartService: ChartService<T>;
  private detector: ChartDetector<T>;
  private renderer: ChartRenderer;
  private colorManager: ColorManager;
  private activeCharts: Map<string, { chart: ChartInstance; type: ChartType }> =
    new Map();
  private unsubscribe?: () => void;
  private defaultStyle?: StyleConfig;
  private defaultFormat?: FormatConfig;

  /**
   * Create a new ChartEngine instance
   * @param engine - The PivotEngine instance to get data from
   * @param options - Optional configuration options
   */
  constructor(
    private engine: PivotEngine<T>,
    options?: ChartEngineOptions
  ) {
    this.chartService = new ChartService(engine);
    this.detector = new ChartDetector(engine);
    this.renderer = this.createRenderer(options?.library || 'chartjs');
    this.colorManager = new ColorManager(
      (options?.defaultStyle?.colorScheme as ColorPaletteName) || 'tableau10'
    );
    this.defaultStyle = options?.defaultStyle;
    this.defaultFormat = options?.defaultFormat;

    // Subscribe to pivot engine changes for auto-sync
    this.unsubscribe = this.engine.subscribe(() => this.handleEngineUpdate());
  }

  /**
   * Create a renderer instance for the specified library
   */
  private createRenderer(library: ChartLibrary): ChartRenderer {
    switch (library) {
      case 'chartjs':
        return new ChartJsRenderer();
      case 'echarts':
        return new EChartsRenderer();
      case 'd3':
        return new D3Renderer();
      case 'plotly':
        return new PlotlyRenderer();
      default:
        return new ChartJsRenderer();
    }
  }

  /**
   * Auto-detect the best chart type and render it
   * @param config - Chart configuration (without type)
   */
  auto(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    const recommendations = this.recommend();
    const bestType = recommendations[0]?.type || 'column';
    return this.render({ ...config, type: bestType });
  }

  /**
   * Get chart recommendations based on pivot structure
   */
  recommend(): ChartRecommendation[] {
    return this.detector.detect();
  }

  /**
   * Get the single best chart recommendation
   */
  getBestRecommendation(): ChartRecommendation {
    return this.detector.getBestRecommendation();
  }

  /**
   * Render a chart directly from a recommendation.
   * Usage: chartEngine.renderRecommendation(recommendations[0], '#chartContainer')
   * @param recommendation - A recommendation from recommend()
   * @param container - Container element or CSS selector
   * @param overrides - Optional additional config to merge
   */
  renderRecommendation(
    recommendation: ChartRecommendation,
    container: string | HTMLElement,
    overrides?: Partial<ChartEngineConfig>
  ): ChartInstance {
    return this.render({
      ...recommendation.config,
      ...overrides,
      container,
      type: recommendation.type,
    });
  }

  /**
   * Render a chart with the specified configuration
   * @param config - Full chart configuration
   */
  render(config: ChartEngineConfig): ChartInstance {
    const chartType = config.type || 'column';

    // Merge default styles with config styles
    const mergedStyle: StyleConfig = {
      ...this.defaultStyle,
      ...config.style,
    };

    // Update ChartService colors from palette before fetching data
    // This ensures ChartService produces data with correct palette colors
    if (mergedStyle.colors && mergedStyle.colors.length > 0) {
      this.chartService.setColors(mergedStyle.colors);
    } else if (mergedStyle.colorScheme) {
      this.colorManager.setPalette(mergedStyle.colorScheme as ColorPaletteName);
      this.chartService.setColors(this.colorManager.getColors(10));
    }

    // Get chart data from ChartService (now with correct palette colors)
    const chartData = this.chartService.getDataForChartType(chartType);

    // Merge default format with config format
    const mergedFormat: FormatConfig = {
      ...this.defaultFormat,
      ...config.format,
    };

    // Render the chart
    const chart = this.renderer.render(config.container, chartData, {
      type: chartType,
      style: mergedStyle,
      format: mergedFormat,
      interactions: config.interactions,
      chartJsOptions: config.chartJsOptions,
    });

    // Track active chart for updates
    const containerId = this.getContainerId(config.container);
    this.activeCharts.set(containerId, { chart, type: chartType });

    return chart;
  }

  // ==================== Convenience Methods ====================

  /**
   * Render a bar chart (horizontal)
   */
  bar(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({
      ...config,
      type: 'bar',
      style: { ...config.style, orientation: 'horizontal' },
    });
  }

  /**
   * Render a column chart (vertical bars)
   */
  column(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'column' });
  }

  /**
   * Render a line chart
   */
  line(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'line' });
  }

  /**
   * Render an area chart
   */
  area(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'area' });
  }

  /**
   * Render a pie chart
   */
  pie(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'pie' });
  }

  /**
   * Render a doughnut chart
   */
  doughnut(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'doughnut' });
  }

  /**
   * Render a scatter plot
   */
  scatter(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'scatter' });
  }

  /**
   * Render a heatmap
   */
  heatmap(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'heatmap' });
  }

  /**
   * Render a stacked column chart
   */
  stackedColumn(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'stackedColumn' });
  }

  /**
   * Render a stacked bar chart
   */
  stackedBar(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'stackedBar' });
  }

  /**
   * Render a combo chart (bar + line)
   */
  combo(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'comboBarLine' });
  }

  /**
   * Render a histogram
   */
  histogram(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'histogram' });
  }

  /**
   * Render a funnel chart
   */
  funnel(config: Omit<ChartEngineConfig, 'type'>): ChartInstance {
    return this.render({ ...config, type: 'funnel' });
  }

  // ==================== Chart Management ====================

  /**
   * Update a specific chart with fresh data from PivotEngine
   * @param container - Container element or selector
   */
  updateChart(container: string | HTMLElement): void {
    const containerId = this.getContainerId(container);
    const chartInfo = this.activeCharts.get(containerId);

    if (chartInfo) {
      const newData = this.chartService.getDataForChartType(chartInfo.type);
      chartInfo.chart.update(newData);
    }
  }

  /**
   * Update all active charts with fresh data
   */
  updateAllCharts(): void {
    this.activeCharts.forEach(chartInfo => {
      const newData = this.chartService.getDataForChartType(chartInfo.type);
      chartInfo.chart.update(newData);
    });
  }

  /**
   * Destroy a specific chart
   * @param container - Container element or selector
   */
  destroyChart(container: string | HTMLElement): void {
    const containerId = this.getContainerId(container);
    const chartInfo = this.activeCharts.get(containerId);

    if (chartInfo) {
      chartInfo.chart.destroy();
      this.activeCharts.delete(containerId);
    }
  }

  /**
   * Destroy all active charts
   */
  destroyAll(): void {
    this.activeCharts.forEach(chartInfo => {
      chartInfo.chart.destroy();
    });
    this.activeCharts.clear();
  }

  /**
   * Clean up resources when done with ChartEngine
   */
  dispose(): void {
    this.destroyAll();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  // ==================== Export Methods ====================

  /**
   * Export a chart to a file
   * @param container - Container element or selector of the chart to export
   * @param options - Export options
   */
  async exportChart(
    container: string | HTMLElement,
    options: ExportOptions
  ): Promise<void> {
    const containerId = this.getContainerId(container);
    const chartInfo = this.activeCharts.get(containerId);

    if (!chartInfo) {
      throw new Error(`No chart found for container: ${containerId}`);
    }

    const data = this.chartService.getDataForChartType(
      chartInfo.type
    ) as ChartData;
    await ChartExporter.export(chartInfo.chart, data, options);
  }

  /**
   * Export chart as PNG
   * @param container - Container element or selector
   * @param filename - Output filename (without extension)
   */
  async exportAsPng(
    container: string | HTMLElement,
    filename?: string
  ): Promise<void> {
    await this.exportChart(container, {
      format: 'png',
      filename: filename || `chart-${Date.now()}`,
    });
  }

  /**
   * Export chart as SVG
   * @param container - Container element or selector
   * @param filename - Output filename (without extension)
   */
  async exportAsSvg(
    container: string | HTMLElement,
    filename?: string
  ): Promise<void> {
    await this.exportChart(container, {
      format: 'svg',
      filename: filename || `chart-${Date.now()}`,
    });
  }

  /**
   * Export chart as PDF
   * @param container - Container element or selector
   * @param filename - Output filename (without extension)
   */
  async exportAsPdf(
    container: string | HTMLElement,
    filename?: string
  ): Promise<void> {
    await this.exportChart(container, {
      format: 'pdf',
      filename: filename || `chart-${Date.now()}`,
    });
  }

  /**
   * Export chart data as CSV
   * @param container - Container element or selector
   * @param filename - Output filename (without extension)
   */
  async exportAsCsv(
    container: string | HTMLElement,
    filename?: string
  ): Promise<void> {
    await this.exportChart(container, {
      format: 'csv',
      filename: filename || `chart-data-${Date.now()}`,
    });
  }

  /**
   * Export chart data as JSON
   * @param container - Container element or selector
   * @param filename - Output filename (without extension)
   */
  async exportAsJson(
    container: string | HTMLElement,
    filename?: string
  ): Promise<void> {
    await this.exportChart(container, {
      format: 'json',
      filename: filename || `chart-data-${Date.now()}`,
    });
  }

  /**
   * Get chart as blob for custom handling
   * @param container - Container element or selector
   * @param format - Export format
   */
  async getChartBlob(
    container: string | HTMLElement,
    format: ExportFormat
  ): Promise<Blob> {
    const containerId = this.getContainerId(container);
    const chartInfo = this.activeCharts.get(containerId);

    if (!chartInfo) {
      throw new Error(`No chart found for container: ${containerId}`);
    }

    const data = this.chartService.getDataForChartType(
      chartInfo.type
    ) as ChartData;
    return ChartExporter.getBlob(chartInfo.chart, data, { format });
  }

  // ==================== Accessors ====================

  /**
   * Get the underlying ChartService for advanced usage
   */
  getChartService(): ChartService<T> {
    return this.chartService;
  }

  /**
   * Get the underlying ChartDetector for advanced usage
   */
  getChartDetector(): ChartDetector<T> {
    return this.detector;
  }

  /**
   * Get the ColorManager for color customization
   */
  getColorManager(): ColorManager {
    return this.colorManager;
  }

  /**
   * Get a specific chart instance by container
   */
  getChart(container: string | HTMLElement): ChartInstance | undefined {
    const containerId = this.getContainerId(container);
    return this.activeCharts.get(containerId)?.chart;
  }

  /**
   * Get all active chart containers
   */
  getActiveContainers(): string[] {
    return Array.from(this.activeCharts.keys());
  }

  // ==================== Private Methods ====================

  /**
   * Handle updates from the PivotEngine
   */
  private handleEngineUpdate(): void {
    // Optionally auto-update charts when pivot data changes
    // This is controlled by config, disabled by default to avoid
    // unexpected re-renders
  }

  /**
   * Get a unique identifier for a container
   */
  private getContainerId(container: string | HTMLElement): string {
    if (typeof container === 'string') {
      return container;
    }
    return (
      container.id ||
      `chart-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
  }
}
