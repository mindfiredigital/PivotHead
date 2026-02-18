/**
 * HeatmapChart - Heatmap chart configuration
 */

import { BaseChart, BaseChartOptions } from './BaseChart';
import type { ChartType } from '../types';

/**
 * Color scale types for heatmaps
 */
export type ColorScaleType = 'sequential' | 'diverging';

/**
 * Options specific to heatmap charts
 */
export interface HeatmapChartOptions extends BaseChartOptions {
  /** Color scale type */
  colorScale?: ColorScaleType;
  /** Show values in cells */
  showCellValues?: boolean;
  /** Minimum color (for sequential scale) */
  minColor?: string;
  /** Maximum color (for sequential scale) */
  maxColor?: string;
}

/**
 * Heatmap chart configuration class
 */
export class HeatmapChart extends BaseChart {
  private colorScaleType: ColorScaleType;
  private cellValues: boolean;
  private minColorValue: string;
  private maxColorValue: string;

  constructor(options: HeatmapChartOptions = {}) {
    super(options);
    this.colorScaleType = options.colorScale ?? 'sequential';
    this.cellValues = options.showCellValues ?? true;
    this.minColorValue = options.minColor ?? '#f7fbff';
    this.maxColorValue = options.maxColor ?? '#08306b';
  }

  /**
   * Get the chart type
   */
  getType(): ChartType {
    return 'heatmap';
  }

  /**
   * Use sequential color scale (low to high)
   */
  sequential(): this {
    this.colorScaleType = 'sequential';
    return this;
  }

  /**
   * Use diverging color scale (low - mid - high)
   */
  diverging(): this {
    this.colorScaleType = 'diverging';
    return this;
  }

  /**
   * Set the color scale type
   */
  colorScale(type: ColorScaleType): this {
    this.colorScaleType = type;
    return this;
  }

  /**
   * Show or hide cell values
   */
  showCellValues(show: boolean = true): this {
    this.cellValues = show;
    this.styleConfig.showValues = show;
    return this;
  }

  /**
   * Hide cell values
   */
  hideCellValues(): this {
    this.cellValues = false;
    this.styleConfig.showValues = false;
    return this;
  }

  /**
   * Set the color range for sequential scale
   */
  colorRange(minColor: string, maxColor: string): this {
    this.minColorValue = minColor;
    this.maxColorValue = maxColor;
    return this;
  }

  /**
   * Use a blue color scale
   */
  blueScale(): this {
    this.minColorValue = '#f7fbff';
    this.maxColorValue = '#08306b';
    return this;
  }

  /**
   * Use a red color scale
   */
  redScale(): this {
    this.minColorValue = '#fff5f0';
    this.maxColorValue = '#67000d';
    return this;
  }

  /**
   * Use a green color scale
   */
  greenScale(): this {
    this.minColorValue = '#f7fcf5';
    this.maxColorValue = '#00441b';
    return this;
  }

  /**
   * Use a purple color scale
   */
  purpleScale(): this {
    this.minColorValue = '#fcfbfd';
    this.maxColorValue = '#3f007d';
    return this;
  }

  /**
   * Get the color scale type
   */
  getColorScale(): ColorScaleType {
    return this.colorScaleType;
  }

  /**
   * Check if cell values are shown
   */
  hasCellValues(): boolean {
    return this.cellValues;
  }

  /**
   * Get the min color
   */
  getMinColor(): string {
    return this.minColorValue;
  }

  /**
   * Get the max color
   */
  getMaxColor(): string {
    return this.maxColorValue;
  }
}

/**
 * Create a new heatmap chart configuration
 */
export function heatmapChart(options?: HeatmapChartOptions): HeatmapChart {
  return new HeatmapChart(options);
}
