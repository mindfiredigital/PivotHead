/**
 * LineChart - Line and Area chart configuration
 */

import { BaseChart, BaseChartOptions } from './BaseChart';
import type { ChartType } from '../types';

/**
 * Options specific to line charts
 */
export interface LineChartOptions extends BaseChartOptions {
  /** Fill area under the line */
  fill?: boolean;
  /** Enable stacking for area charts */
  stacked?: boolean;
  /** Line smoothing tension (0 = straight, 1 = very smooth) */
  tension?: number;
  /** Show data points on the line */
  showPoints?: boolean;
}

/**
 * Line/Area chart configuration class
 */
export class LineChart extends BaseChart {
  private fill: boolean;
  private stacked: boolean;
  private tension: number;
  private points: boolean;

  constructor(options: LineChartOptions = {}) {
    super(options);
    this.fill = options.fill ?? false;
    this.stacked = options.stacked ?? false;
    this.tension = options.tension ?? 0;
    this.points = options.showPoints ?? true;
  }

  /**
   * Get the chart type based on configuration
   */
  getType(): ChartType {
    if (this.fill) {
      return this.stacked ? 'stackedArea' : 'area';
    }
    return 'line';
  }

  /**
   * Convert to area chart (fill under line)
   */
  asArea(): this {
    this.fill = true;
    return this;
  }

  /**
   * Keep as line chart (no fill)
   */
  asLine(): this {
    this.fill = false;
    return this;
  }

  /**
   * Enable stacking for area charts
   */
  asStacked(): this {
    this.stacked = true;
    this.fill = true; // Stacking requires area
    return this;
  }

  /**
   * Set line smoothing
   * @param tension - 0 for straight lines, higher values for smoother curves
   */
  smooth(tension: number = 0.4): this {
    this.tension = Math.max(0, Math.min(1, tension));
    return this;
  }

  /**
   * Use straight lines (no smoothing)
   */
  straight(): this {
    this.tension = 0;
    return this;
  }

  /**
   * Show or hide data points
   */
  showDataPoints(show: boolean = true): this {
    this.points = show;
    return this;
  }

  /**
   * Hide data points
   */
  hideDataPoints(): this {
    this.points = false;
    return this;
  }

  /**
   * Check if chart is an area chart
   */
  isArea(): boolean {
    return this.fill;
  }

  /**
   * Check if chart is stacked
   */
  isStacked(): boolean {
    return this.stacked;
  }

  /**
   * Get the tension value
   */
  getTension(): number {
    return this.tension;
  }

  /**
   * Check if data points are shown
   */
  hasDataPoints(): boolean {
    return this.points;
  }
}

/**
 * Create a new line chart configuration
 */
export function lineChart(options?: LineChartOptions): LineChart {
  return new LineChart(options);
}

/**
 * Create an area chart
 */
export function areaChart(options?: Omit<LineChartOptions, 'fill'>): LineChart {
  return new LineChart({ ...options, fill: true });
}

/**
 * Create a stacked area chart
 */
export function stackedAreaChart(
  options?: Omit<LineChartOptions, 'fill' | 'stacked'>
): LineChart {
  return new LineChart({ ...options, fill: true, stacked: true });
}
