/**
 * BarChart - Bar/Column chart configuration
 */

import { BaseChart, BaseChartOptions } from './BaseChart';
import type { ChartType } from '../types';

/**
 * Options specific to bar charts
 */
export interface BarChartOptions extends BaseChartOptions {
  /** Use horizontal orientation (bar) instead of vertical (column) */
  horizontal?: boolean;
  /** Stack bars instead of grouping */
  stacked?: boolean;
}

/**
 * Bar/Column chart configuration class
 */
export class BarChart extends BaseChart {
  private horizontal: boolean;
  private stacked: boolean;

  constructor(options: BarChartOptions = {}) {
    super(options);
    this.horizontal = options.horizontal ?? false;
    this.stacked = options.stacked ?? false;
  }

  /**
   * Get the chart type based on configuration
   */
  getType(): ChartType {
    if (this.stacked) {
      return this.horizontal ? 'stackedBar' : 'stackedColumn';
    }
    return this.horizontal ? 'bar' : 'column';
  }

  /**
   * Set horizontal orientation (bar chart)
   */
  asHorizontal(): this {
    this.horizontal = true;
    this.styleConfig.orientation = 'horizontal';
    return this;
  }

  /**
   * Set vertical orientation (column chart)
   */
  asVertical(): this {
    this.horizontal = false;
    this.styleConfig.orientation = 'vertical';
    return this;
  }

  /**
   * Enable stacked mode
   */
  asStacked(): this {
    this.stacked = true;
    return this;
  }

  /**
   * Enable grouped mode (disable stacking)
   */
  asGrouped(): this {
    this.stacked = false;
    return this;
  }

  /**
   * Check if chart is horizontal
   */
  isHorizontal(): boolean {
    return this.horizontal;
  }

  /**
   * Check if chart is stacked
   */
  isStacked(): boolean {
    return this.stacked;
  }
}

/**
 * Create a new bar chart configuration
 */
export function barChart(options?: BarChartOptions): BarChart {
  return new BarChart(options);
}

/**
 * Create a horizontal bar chart
 */
export function horizontalBarChart(
  options?: Omit<BarChartOptions, 'horizontal'>
): BarChart {
  return new BarChart({ ...options, horizontal: true });
}

/**
 * Create a column chart (vertical bar)
 */
export function columnChart(
  options?: Omit<BarChartOptions, 'horizontal'>
): BarChart {
  return new BarChart({ ...options, horizontal: false });
}

/**
 * Create a stacked bar chart
 */
export function stackedBarChart(
  options?: Omit<BarChartOptions, 'stacked'>
): BarChart {
  return new BarChart({ ...options, stacked: true });
}
