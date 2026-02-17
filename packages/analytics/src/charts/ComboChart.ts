/**
 * ComboChart - Combined chart configuration (e.g., bar + line)
 */

import { BaseChart, BaseChartOptions } from './BaseChart';
import type { ChartType } from '../types';

/**
 * Primary chart type for combo charts
 */
export type ComboPrimaryType = 'bar' | 'column' | 'area';

/**
 * Secondary chart type for combo charts
 */
export type ComboSecondaryType = 'line' | 'area';

/**
 * Options specific to combo charts
 */
export interface ComboChartOptions extends BaseChartOptions {
  /** Primary chart type (bar/column/area) */
  primaryType?: ComboPrimaryType;
  /** Secondary chart type (line/area) */
  secondaryType?: ComboSecondaryType;
  /** Use secondary Y axis for secondary series */
  dualAxis?: boolean;
}

/**
 * Combo chart configuration class
 */
export class ComboChart extends BaseChart {
  private primary: ComboPrimaryType;
  private secondary: ComboSecondaryType;
  private dualAxisEnabled: boolean;

  constructor(options: ComboChartOptions = {}) {
    super(options);
    this.primary = options.primaryType ?? 'column';
    this.secondary = options.secondaryType ?? 'line';
    this.dualAxisEnabled = options.dualAxis ?? false;
  }

  /**
   * Get the chart type based on configuration
   */
  getType(): ChartType {
    if (this.primary === 'area') {
      return 'comboAreaLine';
    }
    return 'comboBarLine';
  }

  /**
   * Set the primary chart type to bars/columns
   */
  primaryBar(): this {
    this.primary = 'column';
    return this;
  }

  /**
   * Set the primary chart type to horizontal bars
   */
  primaryHorizontalBar(): this {
    this.primary = 'bar';
    this.styleConfig.orientation = 'horizontal';
    return this;
  }

  /**
   * Set the primary chart type to area
   */
  primaryArea(): this {
    this.primary = 'area';
    return this;
  }

  /**
   * Set the secondary chart type to line
   */
  secondaryLine(): this {
    this.secondary = 'line';
    return this;
  }

  /**
   * Set the secondary chart type to area
   */
  secondaryArea(): this {
    this.secondary = 'area';
    return this;
  }

  /**
   * Enable dual Y axis
   */
  useDualAxis(): this {
    this.dualAxisEnabled = true;
    return this;
  }

  /**
   * Disable dual Y axis (use single axis)
   */
  useSingleAxis(): this {
    this.dualAxisEnabled = false;
    return this;
  }

  /**
   * Get the primary type
   */
  getPrimaryType(): ComboPrimaryType {
    return this.primary;
  }

  /**
   * Get the secondary type
   */
  getSecondaryType(): ComboSecondaryType {
    return this.secondary;
  }

  /**
   * Check if dual axis is enabled
   */
  hasDualAxis(): boolean {
    return this.dualAxisEnabled;
  }
}

/**
 * Create a new combo chart configuration
 */
export function comboChart(options?: ComboChartOptions): ComboChart {
  return new ComboChart(options);
}

/**
 * Create a bar + line combo chart
 */
export function barLineChart(
  options?: Omit<ComboChartOptions, 'primaryType' | 'secondaryType'>
): ComboChart {
  return new ComboChart({
    ...options,
    primaryType: 'column',
    secondaryType: 'line',
  });
}

/**
 * Create an area + line combo chart
 */
export function areaLineChart(
  options?: Omit<ComboChartOptions, 'primaryType' | 'secondaryType'>
): ComboChart {
  return new ComboChart({
    ...options,
    primaryType: 'area',
    secondaryType: 'line',
  });
}
