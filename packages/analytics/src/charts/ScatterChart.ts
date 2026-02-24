/**
 * ScatterChart - Scatter plot and Bubble chart configuration
 */

import { BaseChart, BaseChartOptions } from './BaseChart';
import type { ChartType } from '../types';

/**
 * Options specific to scatter charts
 */
export interface ScatterChartOptions extends BaseChartOptions {
  /** Point size in pixels */
  pointSize?: number;
  /** Show trend line */
  showTrendLine?: boolean;
  /** Enable bubble mode (size varies by value) */
  bubble?: boolean;
}

/**
 * Scatter/Bubble chart configuration class
 */
export class ScatterChart extends BaseChart {
  private pointSizeValue: number;
  private trendLine: boolean;
  private bubbleMode: boolean;

  constructor(options: ScatterChartOptions = {}) {
    super(options);
    this.pointSizeValue = options.pointSize ?? 6;
    this.trendLine = options.showTrendLine ?? false;
    this.bubbleMode = options.bubble ?? false;
  }

  /**
   * Get the chart type
   */
  getType(): ChartType {
    return 'scatter';
  }

  /**
   * Set the point size
   */
  pointSize(size: number): this {
    this.pointSizeValue = Math.max(1, size);
    return this;
  }

  /**
   * Show or hide trend line
   */
  trendline(show: boolean = true): this {
    this.trendLine = show;
    return this;
  }

  /**
   * Show trend line
   */
  showTrendLine(): this {
    this.trendLine = true;
    return this;
  }

  /**
   * Hide trend line
   */
  hideTrendLine(): this {
    this.trendLine = false;
    return this;
  }

  /**
   * Enable bubble mode (point size varies by value)
   */
  asBubble(): this {
    this.bubbleMode = true;
    return this;
  }

  /**
   * Use fixed point size (disable bubble mode)
   */
  asScatter(): this {
    this.bubbleMode = false;
    return this;
  }

  /**
   * Get the point size
   */
  getPointSize(): number {
    return this.pointSizeValue;
  }

  /**
   * Check if trend line is enabled
   */
  hasTrendLine(): boolean {
    return this.trendLine;
  }

  /**
   * Check if bubble mode is enabled
   */
  isBubble(): boolean {
    return this.bubbleMode;
  }
}

/**
 * Create a new scatter chart configuration
 */
export function scatterChart(options?: ScatterChartOptions): ScatterChart {
  return new ScatterChart(options);
}

/**
 * Create a bubble chart
 */
export function bubbleChart(
  options?: Omit<ScatterChartOptions, 'bubble'>
): ScatterChart {
  return new ScatterChart({ ...options, bubble: true });
}
