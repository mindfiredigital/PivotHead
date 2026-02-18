/**
 * TreemapChart - Treemap chart configuration
 */

import { BaseChart, BaseChartOptions } from './BaseChart';
import type { ChartType } from '../types';

/**
 * Options specific to treemap charts
 */
export interface TreemapChartOptions extends BaseChartOptions {
  /** Maximum depth to display */
  maxDepth?: number;
  /** Show labels on nodes */
  showLabels?: boolean;
  /** Show values on nodes */
  showNodeValues?: boolean;
  /** Padding between nodes */
  padding?: number;
}

/**
 * Treemap chart configuration class
 */
export class TreemapChart extends BaseChart {
  private maxDepthValue: number;
  private labels: boolean;
  private nodeValues: boolean;
  private paddingValue: number;

  constructor(options: TreemapChartOptions = {}) {
    super(options);
    this.maxDepthValue = options.maxDepth ?? Infinity;
    this.labels = options.showLabels ?? true;
    this.nodeValues = options.showNodeValues ?? false;
    this.paddingValue = options.padding ?? 2;
  }

  /**
   * Get the chart type
   */
  getType(): ChartType {
    return 'treemap';
  }

  /**
   * Set the maximum depth to display
   */
  maxDepth(depth: number): this {
    this.maxDepthValue = Math.max(1, depth);
    return this;
  }

  /**
   * Set depth to show only top level
   */
  topLevelOnly(): this {
    this.maxDepthValue = 1;
    return this;
  }

  /**
   * Show all depth levels
   */
  showAllLevels(): this {
    this.maxDepthValue = Infinity;
    return this;
  }

  /**
   * Show or hide node labels
   */
  showLabels(show: boolean = true): this {
    this.labels = show;
    return this;
  }

  /**
   * Hide node labels
   */
  hideLabels(): this {
    this.labels = false;
    return this;
  }

  /**
   * Show or hide values on nodes
   */
  showNodeValues(show: boolean = true): this {
    this.nodeValues = show;
    this.styleConfig.showValues = show;
    return this;
  }

  /**
   * Hide values on nodes
   */
  hideNodeValues(): this {
    this.nodeValues = false;
    this.styleConfig.showValues = false;
    return this;
  }

  /**
   * Set padding between nodes
   */
  padding(padding: number): this {
    this.paddingValue = Math.max(0, padding);
    return this;
  }

  /**
   * Get the max depth value
   */
  getMaxDepth(): number {
    return this.maxDepthValue;
  }

  /**
   * Check if labels are shown
   */
  hasLabels(): boolean {
    return this.labels;
  }

  /**
   * Check if node values are shown
   */
  hasNodeValues(): boolean {
    return this.nodeValues;
  }

  /**
   * Get the padding value
   */
  getPadding(): number {
    return this.paddingValue;
  }
}

/**
 * Create a new treemap chart configuration
 */
export function treemapChart(options?: TreemapChartOptions): TreemapChart {
  return new TreemapChart(options);
}
