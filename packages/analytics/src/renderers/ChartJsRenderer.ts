/**
 * Chart.js Renderer
 * Implements ChartRenderer interface for Chart.js library
 */

import {
  Chart,
  registerables,
  type ChartConfiguration,
  type ChartType as ChartJsType,
} from 'chart.js';
import { BaseChartRenderer } from './BaseChartRenderer';
import type {
  ChartInstance,
  ChartRenderOptions,
} from '../types/renderer-types';
import type { FormatConfig } from '../types/config-types';
import type { HeatmapChartData, HistogramChartData, ChartData } from '../types';
import { ColorManager } from '../utils/ColorPalettes';
import type { ColorPaletteName } from '../utils/ColorPalettes';

// Register all Chart.js components
Chart.register(...registerables);

/**
 * Chart.js specific instance wrapper
 */
class ChartJsInstance implements ChartInstance {
  constructor(private chart: Chart) {}

  update(data?: unknown): void {
    if (data && typeof data === 'object' && data !== null) {
      this.chart.data = data as Chart['data'];
    }
    this.chart.update();
  }

  destroy(): void {
    this.chart.destroy();
  }

  resize(): void {
    this.chart.resize();
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.chart.canvas;
  }

  getChartJsInstance(): Chart {
    return this.chart;
  }
}

/**
 * Canvas-based heatmap instance wrapper (Chart.js lacks native heatmap support)
 */
class CanvasHeatmapInstance implements ChartInstance {
  private canvas: HTMLCanvasElement;
  private data: HeatmapChartData;
  private options: ChartRenderOptions;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    data: HeatmapChartData,
    options: ChartRenderOptions
  ) {
    this.canvas = canvas;
    this.data = data;
    this.options = options;
    this.draw();
    this.setupResizeObserver();
  }

  update(data?: unknown): void {
    if (data && typeof data === 'object' && data !== null) {
      this.data = data as HeatmapChartData;
    }
    this.draw();
  }

  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  resize(): void {
    this.draw();
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.draw());
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  private draw(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight || 400;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const {
      cells,
      minValue,
      maxValue,
      filteredRowValues,
      filteredColumnValues,
    } = this.data;
    const rows = filteredRowValues || [];
    const cols = filteredColumnValues || [];

    if (rows.length === 0 || cols.length === 0 || cells.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        'No data available for heatmap',
        displayWidth / 2,
        displayHeight / 2
      );
      return;
    }

    const title = this.options.style?.title || '';
    const titleHeight = title ? 36 : 10;
    const legendHeight = 40;

    // Calculate label dimensions
    ctx.font = '12px sans-serif';
    let maxRowLabelWidth = 0;
    for (const label of rows) {
      maxRowLabelWidth = Math.max(
        maxRowLabelWidth,
        ctx.measureText(label).width
      );
    }
    const yLabelWidth = Math.min(maxRowLabelWidth + 16, displayWidth * 0.25);
    const xLabelHeight = 60;

    const gridLeft = yLabelWidth;
    const gridTop = titleHeight;
    const gridWidth = displayWidth - gridLeft - 20;
    const gridHeight =
      displayHeight - gridTop - xLabelHeight - legendHeight - 10;

    const cellWidth = gridWidth / cols.length;
    const cellHeight = gridHeight / rows.length;

    // Draw title
    if (title) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, displayWidth / 2, 24);
    }

    // Build cell lookup
    const cellMap = new Map<string, number>();
    for (const cell of cells) {
      cellMap.set(`${cell.y}-${cell.x}`, cell.value);
    }

    const range = maxValue - minValue || 1;

    // Build color interpolation from palette if available
    const paletteColors = this.options.style?.colors;
    const interpolateColorFn =
      paletteColors && paletteColors.length >= 2
        ? (t: number) =>
            CanvasHeatmapInstance.interpolateFromPalette(t, paletteColors)
        : (t: number) => CanvasHeatmapInstance.interpolateColor(t);

    // Draw cells
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      for (let colIdx = 0; colIdx < cols.length; colIdx++) {
        const value = cellMap.get(`${rowIdx}-${colIdx}`) ?? 0;
        const t = (value - minValue) / range;
        const color = interpolateColorFn(t);

        const x = gridLeft + colIdx * cellWidth;
        const y = gridTop + rowIdx * cellHeight;

        // Cell fill
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellWidth, cellHeight);

        // Cell border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellWidth, cellHeight);

        // Cell value text
        if (cellWidth > 30 && cellHeight > 18) {
          const parsedColor = CanvasHeatmapInstance.parseColor(color);
          const luminance = parsedColor
            ? (0.299 * parsedColor.r +
                0.587 * parsedColor.g +
                0.114 * parsedColor.b) /
              255
            : CanvasHeatmapInstance.getLuminance(t);
          ctx.fillStyle = luminance < 0.5 ? '#fff' : '#333';
          ctx.font = `${Math.min(12, cellHeight * 0.45)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const displayVal =
            value >= 1000
              ? `${(value / 1000).toFixed(1)}k`
              : Number.isInteger(value)
                ? String(value)
                : value.toFixed(1);
          ctx.fillText(displayVal, x + cellWidth / 2, y + cellHeight / 2);
        }
      }
    }

    // Draw row labels (y-axis)
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < rows.length; i++) {
      const y = gridTop + i * cellHeight + cellHeight / 2;
      const label =
        rows[i].length > 15 ? rows[i].substring(0, 13) + '...' : rows[i];
      ctx.fillText(label, gridLeft - 6, y);
    }

    // Draw column labels (x-axis)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < cols.length; i++) {
      const x = gridLeft + i * cellWidth + cellWidth / 2;
      const y = gridTop + gridHeight + 6;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      const label =
        cols[i].length > 12 ? cols[i].substring(0, 10) + '...' : cols[i];
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    // Draw color gradient legend
    const legendY = displayHeight - legendHeight;
    const legendWidth = Math.min(200, gridWidth * 0.5);
    const legendX = gridLeft + (gridWidth - legendWidth) / 2;
    const legendBarHeight = 12;

    const gradient = ctx.createLinearGradient(
      legendX,
      0,
      legendX + legendWidth,
      0
    );
    gradient.addColorStop(0, interpolateColorFn(0));
    gradient.addColorStop(0.5, interpolateColorFn(0.5));
    gradient.addColorStop(1, interpolateColorFn(1));

    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendBarHeight);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, legendWidth, legendBarHeight);

    // Legend labels
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const formatNum = (v: number) =>
      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v));
    ctx.fillText(formatNum(minValue), legendX, legendY + legendBarHeight + 4);
    ctx.fillText(
      formatNum((minValue + maxValue) / 2),
      legendX + legendWidth / 2,
      legendY + legendBarHeight + 4
    );
    ctx.fillText(
      formatNum(maxValue),
      legendX + legendWidth,
      legendY + legendBarHeight + 4
    );
  }

  /**
   * Interpolate between light blue and dark blue based on value 0-1
   */
  private static interpolateColor(t: number): string {
    // Blue scale: #f7fbff (light) -> #2171b5 (mid) -> #08306b (dark)
    const clamp = Math.max(0, Math.min(1, t));
    let r: number, g: number, b: number;

    if (clamp < 0.5) {
      const s = clamp * 2;
      r = Math.round(247 + (33 - 247) * s);
      g = Math.round(251 + (113 - 251) * s);
      b = Math.round(255 + (181 - 255) * s);
    } else {
      const s = (clamp - 0.5) * 2;
      r = Math.round(33 + (8 - 33) * s);
      g = Math.round(113 + (48 - 113) * s);
      b = Math.round(181 + (107 - 181) * s);
    }

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Interpolate color from a palette array based on value 0-1
   * Uses the palette as gradient stops distributed evenly
   */
  private static interpolateFromPalette(t: number, palette: string[]): string {
    const clamp = Math.max(0, Math.min(1, t));
    if (palette.length === 1) return palette[0];

    const segmentCount = palette.length - 1;
    const segment = Math.min(
      Math.floor(clamp * segmentCount),
      segmentCount - 1
    );
    const segmentT = clamp * segmentCount - segment;

    const startColor = CanvasHeatmapInstance.parseColor(palette[segment]);
    const endColor = CanvasHeatmapInstance.parseColor(palette[segment + 1]);

    if (!startColor || !endColor) return palette[segment];

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * segmentT);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * segmentT);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * segmentT);

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Parse a hex or rgba color string into RGB components
   */
  private static parseColor(
    color: string
  ): { r: number; g: number; b: number } | null {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
      };
    }
    return null;
  }

  /**
   * Get perceived luminance for text contrast (0 = dark, 1 = light)
   */
  private static getLuminance(t: number): number {
    return 1 - t;
  }
}

/**
 * Canvas-based funnel instance wrapper (Chart.js lacks native funnel support)
 */
class CanvasFunnelInstance implements ChartInstance {
  private canvas: HTMLCanvasElement;
  private data: ChartData;
  private options: ChartRenderOptions;
  private resizeObserver: ResizeObserver | null = null;

  private static DEFAULT_COLORS = [
    '#4e79a7',
    '#f28e2b',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc948',
    '#b07aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ac',
  ];

  constructor(
    canvas: HTMLCanvasElement,
    data: ChartData,
    options: ChartRenderOptions
  ) {
    this.canvas = canvas;
    this.data = data;
    this.options = options;
    this.draw();
    this.setupResizeObserver();
  }

  update(data?: unknown): void {
    if (data && typeof data === 'object' && data !== null) {
      this.data = data as ChartData;
    }
    this.draw();
  }

  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  resize(): void {
    this.draw();
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.draw());
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  private draw(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight || 400;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Extract labels and values from the aggregated data (single dataset)
    const labels = this.data.labels || [];
    const values = this.data.datasets?.[0]?.data || [];

    if (labels.length === 0 || values.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        'No data available for funnel',
        displayWidth / 2,
        displayHeight / 2
      );
      return;
    }

    // Get palette colors from options or use defaults
    const paletteColors =
      this.options.style?.colors || CanvasFunnelInstance.DEFAULT_COLORS;

    // Build items and sort descending by value
    const items = labels.map((label, i) => ({
      label,
      value: values[i] || 0,
      color: paletteColors[i % paletteColors.length],
    }));
    items.sort((a, b) => b.value - a.value);

    const title = this.options.style?.title || '';
    const titleHeight = title ? 40 : 10;
    const bottomPadding = 10;
    const sidePadding = 40;

    // Draw title
    if (title) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, displayWidth / 2, 26);
    }

    const funnelTop = titleHeight;
    const funnelHeight = displayHeight - titleHeight - bottomPadding;
    const stageHeight = funnelHeight / items.length;
    const maxWidth = displayWidth - sidePadding * 2;
    const minWidth = maxWidth * 0.15;
    const maxValue = items[0].value || 1;
    const centerX = displayWidth / 2;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const nextItem = items[i + 1];

      // Current stage width proportional to value
      const topWidth = Math.max(minWidth, (item.value / maxValue) * maxWidth);
      // Next stage width (or minimum for the last stage)
      const bottomWidth = nextItem
        ? Math.max(minWidth, (nextItem.value / maxValue) * maxWidth)
        : minWidth;

      const y = funnelTop + i * stageHeight;

      // Draw trapezoid
      ctx.beginPath();
      ctx.moveTo(centerX - topWidth / 2, y);
      ctx.lineTo(centerX + topWidth / 2, y);
      ctx.lineTo(centerX + bottomWidth / 2, y + stageHeight);
      ctx.lineTo(centerX - bottomWidth / 2, y + stageHeight);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label and value text
      const textY = y + stageHeight / 2;
      const formatVal = (v: number) =>
        v >= 1000000
          ? `${(v / 1000000).toFixed(1)}M`
          : v >= 1000
            ? `${(v / 1000).toFixed(1)}k`
            : String(Math.round(v));

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const displayLabel =
        item.label.length > 20
          ? item.label.substring(0, 18) + '...'
          : item.label;
      ctx.fillText(displayLabel, centerX, textY - 8);

      ctx.font = '12px sans-serif';
      ctx.fillText(formatVal(item.value), centerX, textY + 10);
    }
  }
}

/**
 * Canvas-based histogram instance wrapper
 * Renders a proper frequency distribution with binLabels/binCounts
 */
class CanvasHistogramInstance implements ChartInstance {
  private canvas: HTMLCanvasElement;
  private data: HistogramChartData;
  private options: ChartRenderOptions;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    data: HistogramChartData,
    options: ChartRenderOptions
  ) {
    this.canvas = canvas;
    this.data = data;
    this.options = options;
    this.draw();
    this.setupResizeObserver();
  }

  update(data?: unknown): void {
    if (data && typeof data === 'object' && data !== null) {
      this.data = data as HistogramChartData;
    }
    this.draw();
  }

  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  resize(): void {
    this.draw();
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.draw());
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  private draw(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight || 400;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const { binLabels, binCounts } = this.data;

    if (
      !binLabels ||
      binLabels.length === 0 ||
      !binCounts ||
      binCounts.length === 0
    ) {
      ctx.fillStyle = '#666';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        'No data available for histogram',
        displayWidth / 2,
        displayHeight / 2
      );
      return;
    }

    const title = this.options.style?.title || '';
    const titleHeight = title ? 40 : 10;
    const bottomPadding = 60;
    const leftPadding = 55;
    const rightPadding = 20;
    const topPadding = titleHeight;

    // Draw title
    if (title) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, displayWidth / 2, 26);
    }

    const chartLeft = leftPadding;
    const chartTop = topPadding;
    const chartWidth = displayWidth - leftPadding - rightPadding;
    const chartHeight = displayHeight - topPadding - bottomPadding;

    const maxCount = Math.max(...binCounts, 1);
    const barWidth = chartWidth / binLabels.length;

    // Draw gridlines and y-axis ticks
    const yTickCount = 5;
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= yTickCount; i++) {
      const value = Math.round((maxCount / yTickCount) * i);
      const y = chartTop + chartHeight - (value / maxCount) * chartHeight;

      // Gridline
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartLeft + chartWidth, y);
      ctx.stroke();

      // Tick label
      ctx.fillText(String(value), chartLeft - 8, y);
    }

    // Draw bars (no gap between them for a true histogram)
    // Use first palette color if available, otherwise default blue
    const paletteColors = this.options.style?.colors;
    const baseColor =
      paletteColors && paletteColors.length > 0
        ? paletteColors[0]
        : 'rgba(54, 162, 235, 0.8)';
    // Generate bar color with alpha and a solid border color
    const barColor = CanvasHistogramInstance.toRgba(baseColor, 0.8);
    const borderColor = CanvasHistogramInstance.toRgba(baseColor, 1);

    for (let i = 0; i < binCounts.length; i++) {
      const count = binCounts[i];
      const barHeight = (count / maxCount) * chartHeight;
      const x = chartLeft + i * barWidth;
      const y = chartTop + chartHeight - barHeight;

      // Bar fill
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Bar border (only left, top, right to avoid double-drawing between adjacent bars)
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, chartTop + chartHeight);
      ctx.lineTo(x, y);
      ctx.lineTo(x + barWidth, y);
      ctx.lineTo(x + barWidth, chartTop + chartHeight);
      ctx.stroke();

      // Count label above bar (if bar is tall enough)
      if (count > 0) {
        ctx.fillStyle = '#333';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(count), x + barWidth / 2, y - 4);
      }
    }

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Y-axis
    ctx.moveTo(chartLeft, chartTop);
    ctx.lineTo(chartLeft, chartTop + chartHeight);
    // X-axis
    ctx.lineTo(chartLeft + chartWidth, chartTop + chartHeight);
    ctx.stroke();

    // Draw x-axis labels (rotated)
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    for (let i = 0; i < binLabels.length; i++) {
      const x = chartLeft + i * barWidth + barWidth / 2;
      const y = chartTop + chartHeight + 8;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(binLabels[i], 0, 0);
      ctx.restore();
    }

    // Y-axis label
    ctx.save();
    ctx.translate(14, chartTop + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Frequency', 0, 0);
    ctx.restore();
  }

  /**
   * Convert a hex or rgba color string to rgba with the given alpha
   */
  private static toRgba(color: string, alpha: number): string {
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, `${alpha})`);
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }
}

/**
 * Chart.js renderer implementation
 */
export class ChartJsRenderer extends BaseChartRenderer {
  private colorManager: ColorManager;

  constructor() {
    super();
    this.colorManager = new ColorManager('tableau10');
  }

  /**
   * Render a chart using Chart.js
   */
  render(
    container: HTMLElement | string,
    data: unknown,
    options: ChartRenderOptions
  ): ChartInstance {
    const containerEl = this.getContainer(container);
    const canvas = this.getOrCreateCanvas(containerEl);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Resolve palette colors early so custom canvas charts can use them
    if (options.style?.colorScheme) {
      this.colorManager.setPalette(
        options.style.colorScheme as ColorPaletteName
      );
    }
    // If no explicit colors array was provided, populate from the palette
    if (!options.style?.colors) {
      const resolvedColors = this.colorManager.getColors(10);
      options = {
        ...options,
        style: { ...options.style, colors: resolvedColors },
      };
    }

    // Handle chart types that Chart.js doesn't support natively
    if (options.type === 'heatmap') {
      return new CanvasHeatmapInstance(
        canvas,
        data as HeatmapChartData,
        options
      );
    }

    if (options.type === 'funnel') {
      return new CanvasFunnelInstance(canvas, data as ChartData, options);
    }

    if (options.type === 'histogram') {
      return new CanvasHistogramInstance(
        canvas,
        data as HistogramChartData,
        options
      );
    }

    // Determine if we should force-apply colors (when palette or custom colors are specified)
    const shouldForceColors = !!(
      options.style?.colorScheme || options.style?.colors
    );

    // Apply colors to datasets
    const chartData = this.applyColorsToData(
      data,
      shouldForceColors,
      options.style?.colors,
      options.type
    );

    // For area charts, set fill: true and use semi-transparent backgroundColor
    const isAreaChart =
      options.type === 'area' || options.type === 'stackedArea';
    if (isAreaChart && chartData && typeof chartData === 'object') {
      const areaData = chartData as {
        datasets?: Array<Record<string, unknown>>;
      };
      if (areaData.datasets) {
        areaData.datasets.forEach(dataset => {
          dataset.fill = true;
          // Save the solid color for the border line before making bg transparent
          const solidColor =
            typeof dataset.backgroundColor === 'string'
              ? dataset.backgroundColor
              : typeof dataset.borderColor === 'string'
                ? dataset.borderColor
                : null;
          // Use solid color for the line border
          if (solidColor) {
            dataset.borderColor = ChartJsRenderer.toFillColor(solidColor, 1);
          }
          // Make backgroundColor semi-transparent for the filled area
          if (solidColor) {
            dataset.backgroundColor = ChartJsRenderer.toFillColor(
              solidColor,
              0.3
            );
          }
        });
      }
    }

    // Build Chart.js configuration
    const chartConfig: ChartConfiguration = {
      type: this.mapChartType(options.type) as ChartJsType,
      data: chartData as ChartConfiguration['data'],
      options: this.buildChartOptions(options),
    };

    // Apply any custom Chart.js options (escape hatch)
    if (options.chartJsOptions) {
      chartConfig.options = {
        ...chartConfig.options,
        ...options.chartJsOptions,
      };
    }

    const chart = new Chart(ctx, chartConfig);
    return new ChartJsInstance(chart);
  }

  /**
   * Update an existing chart with new data
   */
  update(
    chart: ChartInstance,
    data: unknown,
    options?: ChartRenderOptions
  ): void {
    // Update color palette if specified
    if (options?.style?.colorScheme) {
      this.colorManager.setPalette(
        options.style.colorScheme as ColorPaletteName
      );
    }

    const shouldForceColors = !!(
      options?.style?.colorScheme || options?.style?.colors
    );
    const coloredData = this.applyColorsToData(
      data,
      shouldForceColors,
      options?.style?.colors,
      options?.type
    );
    chart.update(coloredData);
  }

  /**
   * Destroy a chart and clean up resources
   */
  destroy(chart: ChartInstance): void {
    chart.destroy();
  }

  /**
   * Map PivotHead chart types to Chart.js types
   */
  private mapChartType(type: string): string {
    const typeMapping: Record<string, string> = {
      column: 'bar',
      bar: 'bar',
      line: 'line',
      area: 'line',
      pie: 'pie',
      doughnut: 'doughnut',
      scatter: 'scatter',
      stackedColumn: 'bar',
      stackedBar: 'bar',
      stackedArea: 'line',
      comboBarLine: 'bar',
      comboAreaLine: 'line',
      histogram: 'bar',
      heatmap: 'bar', // Chart.js doesn't have native heatmap, use bar as fallback
      funnel: 'bar',
      sankey: 'bar', // Chart.js doesn't have native sankey, use bar as fallback
      treemap: 'bar', // Requires chartjs-chart-treemap plugin
    };

    return typeMapping[type] || type;
  }

  /**
   * Build Chart.js options from PivotHead configuration
   */
  private buildChartOptions(
    options: ChartRenderOptions
  ): ChartConfiguration['options'] {
    const { style, format, interactions } = options;

    const scales = this.buildScales(options);
    const isHorizontal = this.isHorizontalChart(options);

    const chartOptions: Record<string, unknown> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!style?.title,
          text: style?.title || '',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        subtitle: {
          display: !!style?.subtitle,
          text: style?.subtitle || '',
          font: {
            size: 12,
          },
        },
        legend: {
          display: style?.showLegend !== false,
          position: style?.legendPosition || 'top',
        },
        tooltip: {
          callbacks: {
            label: (context: {
              parsed: { y?: number };
              raw?: unknown;
              dataset: { label?: string };
            }) => {
              const value = context.parsed.y ?? context.raw;
              const formattedValue = this.formatValue(value as number, format);
              return `${context.dataset.label || ''}: ${formattedValue}`;
            },
          },
        },
      },
      animation: {
        duration: style?.animated === false ? 0 : 750,
      },
    };

    // Add scales if defined
    if (scales) {
      chartOptions.scales = scales;
    }

    // Add indexAxis for horizontal charts
    if (isHorizontal) {
      chartOptions.indexAxis = 'y';
    }

    // Add click handler if specified
    if (interactions?.click) {
      chartOptions.onClick = (
        _event: unknown,
        elements: Array<{ datasetIndex: number; index: number }>,
        chart: {
          data: {
            datasets: Array<{ label?: string; data: unknown[] }>;
            labels?: unknown[];
          };
        }
      ) => {
        if (elements.length > 0) {
          const element = elements[0];
          const datasetIndex = element.datasetIndex;
          const index = element.index;
          const dataset = chart.data.datasets[datasetIndex];
          const label = chart.data.labels?.[index];
          const value = dataset.data[index];

          interactions.click!({
            rowValue: String(label || ''),
            columnValue: dataset.label || '',
            value:
              typeof value === 'number' ? value : (value as { y?: number })?.y,
            measure: dataset.label || '',
            datasetIndex,
            index,
          });
        }
      };
    }

    return chartOptions as ChartConfiguration['options'];
  }

  /**
   * Build scale configuration based on chart type and options
   */
  private buildScales(
    options: ChartRenderOptions
  ): Record<string, unknown> | undefined {
    const { type, style, format } = options;

    // Check if this is a radial chart (pie, doughnut)
    const isRadialChart = ['pie', 'doughnut'].includes(type);
    if (isRadialChart) {
      return undefined; // No scales for radial charts
    }

    // Check if stacked
    const isStacked = type.includes('stacked') || type.startsWith('stacked');

    // X-axis configuration
    const xScale = {
      display: true,
      grid: {
        display: style?.showGrid !== false,
      },
      stacked: isStacked,
    };

    // Y-axis configuration
    const yScale = {
      display: true,
      beginAtZero: true,
      grid: {
        display: style?.showGrid !== false,
      },
      stacked: isStacked,
      ticks: {
        callback: (value: string | number) => {
          if (typeof value === 'number') {
            return this.formatValue(value, format);
          }
          return value;
        },
      },
    };

    return { x: xScale, y: yScale };
  }

  /**
   * Check if chart should use horizontal orientation
   */
  private isHorizontalChart(options: ChartRenderOptions): boolean {
    const { type, style } = options;
    return (
      type === 'bar' ||
      type === 'stackedBar' ||
      style?.orientation === 'horizontal'
    );
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

  /**
   * Apply colors to datasets
   * @param data - Chart data object
   * @param forceColors - If true, always apply colors even if datasets already have colors
   * @param customColors - Optional array of custom colors to use instead of palette colors
   */
  private applyColorsToData(
    data: unknown,
    forceColors: boolean = false,
    customColors?: string[],
    chartType?: string
  ): unknown {
    if (!data || typeof data !== 'object') return data;

    const chartData = data as {
      datasets?: Array<{
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        [key: string]: unknown;
      }>;
      labels?: unknown[];
    };

    if (!chartData.datasets) return data;

    const datasetCount = chartData.datasets.length;

    // Chart types where each bar/segment should get a distinct color when
    // there is only a single bar-type dataset (one measure, no real column split).
    const perPointChartTypes = new Set([
      'bar',
      'column',
      'stackedColumn',
      'stackedBar',
      'comboBarLine',
      'comboAreaLine',
    ]);
    const isPerPointType = perPointChartTypes.has(chartType || '');
    const isCombo =
      chartType === 'comboBarLine' || chartType === 'comboAreaLine';

    // For combo charts, count only bar-type datasets (exclude line overlay)
    const barDatasetCount = isCombo
      ? chartData.datasets.filter(
          ds => (ds as Record<string, unknown>).type !== 'line'
        ).length
      : datasetCount;

    const needsPerPointColors = isPerPointType && barDatasetCount === 1;

    const updatedDatasets = chartData.datasets.map((dataset, index) => {
      const newDataset = { ...dataset };

      // Determine which color to use
      const getColor = (idx: number): string => {
        if (customColors && customColors.length > 0) {
          return customColors[idx % customColors.length];
        }
        return this.colorManager.getColor(idx);
      };

      const getBorderColor = (idx: number): string => {
        if (customColors && customColors.length > 0) {
          const color = customColors[idx % customColors.length];
          // Convert rgba to solid or return as-is
          if (color.startsWith('rgba')) {
            return color.replace(/[\d.]+\)$/, '1)');
          }
          return color;
        }
        return this.colorManager.getBorderColor(idx);
      };

      // In combo charts, preserve the line overlay dataset's existing colors
      const dsType = (dataset as Record<string, unknown>).type;
      if (isCombo && dsType === 'line') {
        return newDataset;
      }

      // Check if this dataset already uses per-data-point colors (e.g. pie/doughnut)
      const hasArrayColors = Array.isArray(dataset.backgroundColor);
      const dataLength = Array.isArray(dataset.data) ? dataset.data.length : 0;

      // Should this dataset get a distinct color per data point?
      const usePerPointColors =
        hasArrayColors || (needsPerPointColors && dataLength > 1);

      // Apply background color if not set OR if forceColors is true
      if (!newDataset.backgroundColor || forceColors) {
        if (usePerPointColors && dataLength > 0) {
          // Per-data-point colors — assign one color per bar/segment
          newDataset.backgroundColor = Array.from(
            { length: dataLength },
            (_, i) => getColor(i)
          );
        } else {
          newDataset.backgroundColor = getColor(index);
        }
      }

      // Apply border color if not set OR if forceColors is true
      if (!newDataset.borderColor || forceColors) {
        if (usePerPointColors && dataLength > 0) {
          newDataset.borderColor = Array.from({ length: dataLength }, (_, i) =>
            getBorderColor(i)
          );
        } else {
          newDataset.borderColor = getBorderColor(index);
        }
      }

      return newDataset;
    });

    return {
      ...chartData,
      datasets: updatedDatasets,
    };
  }

  /**
   * Convert a color string to rgba with the given alpha (for area chart fill)
   */
  private static toFillColor(color: string, alpha: number): string {
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, `${alpha})`);
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }
}
