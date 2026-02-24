/**
 * PieChart - Pie and Doughnut chart configuration
 */

import { BaseChart, BaseChartOptions } from './BaseChart';
import type { ChartType } from '../types';

/**
 * Options specific to pie charts
 */
export interface PieChartOptions extends BaseChartOptions {
  /** Create a doughnut chart with a hole in the center */
  doughnut?: boolean;
  /** Inner radius for doughnut charts (0-1, percentage of outer radius) */
  innerRadius?: number;
  /** Show percentage labels */
  showPercentages?: boolean;
}

/**
 * Pie/Doughnut chart configuration class
 */
export class PieChart extends BaseChart {
  private isDoughnut: boolean;
  private innerRadiusRatio: number;
  private showPercent: boolean;

  constructor(options: PieChartOptions = {}) {
    super(options);
    this.isDoughnut = options.doughnut ?? false;
    this.innerRadiusRatio = options.innerRadius ?? 0.5;
    this.showPercent = options.showPercentages ?? true;
  }

  /**
   * Get the chart type based on configuration
   */
  getType(): ChartType {
    return this.isDoughnut ? 'doughnut' : 'pie';
  }

  /**
   * Convert to doughnut chart
   * @param innerRadius - Inner radius ratio (0-1)
   */
  asDoughnut(innerRadius: number = 0.5): this {
    this.isDoughnut = true;
    this.innerRadiusRatio = Math.max(0, Math.min(0.9, innerRadius));
    return this;
  }

  /**
   * Convert to pie chart (no hole)
   */
  asPie(): this {
    this.isDoughnut = false;
    this.innerRadiusRatio = 0;
    return this;
  }

  /**
   * Set the inner radius for doughnut charts
   * @param ratio - Inner radius as ratio of outer radius (0-0.9)
   */
  setInnerRadius(ratio: number): this {
    this.innerRadiusRatio = Math.max(0, Math.min(0.9, ratio));
    if (ratio > 0) {
      this.isDoughnut = true;
    }
    return this;
  }

  /**
   * Show or hide percentage labels
   */
  showPercentages(show: boolean = true): this {
    this.showPercent = show;
    return this;
  }

  /**
   * Hide percentage labels
   */
  hidePercentages(): this {
    this.showPercent = false;
    return this;
  }

  /**
   * Check if chart is a doughnut
   */
  getIsDoughnut(): boolean {
    return this.isDoughnut;
  }

  /**
   * Get the inner radius ratio
   */
  getInnerRadius(): number {
    return this.innerRadiusRatio;
  }

  /**
   * Check if percentages are shown
   */
  hasPercentages(): boolean {
    return this.showPercent;
  }
}

/**
 * Create a new pie chart configuration
 */
export function pieChart(options?: PieChartOptions): PieChart {
  return new PieChart(options);
}

/**
 * Create a doughnut chart
 */
export function doughnutChart(
  options?: Omit<PieChartOptions, 'doughnut'>
): PieChart {
  return new PieChart({ ...options, doughnut: true });
}
