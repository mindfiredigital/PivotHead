/**
 * BaseChart - Abstract base class for chart configurations
 * Provides common functionality and fluent API for all chart types
 */

import type { ChartRenderOptions } from '../types/renderer-types';
import type {
  StyleConfig,
  FormatConfig,
  InteractionConfig,
  ChartClickData,
} from '../types/config-types';
import type { ChartType } from '../types';

/**
 * Options for chart configuration
 */
export interface BaseChartOptions {
  style?: StyleConfig;
  format?: FormatConfig;
  interactions?: InteractionConfig;
}

/**
 * Abstract base class for all chart configurations
 * Provides a fluent API for building chart options
 */
export abstract class BaseChart {
  protected styleConfig: StyleConfig = {};
  protected formatConfig: FormatConfig = {};
  protected interactionConfig: InteractionConfig = {};

  constructor(options: BaseChartOptions = {}) {
    if (options.style) {
      this.styleConfig = { ...options.style };
    }
    if (options.format) {
      this.formatConfig = { ...options.format };
    }
    if (options.interactions) {
      this.interactionConfig = { ...options.interactions };
    }
  }

  /**
   * Get the chart type - must be implemented by subclasses
   */
  abstract getType(): ChartType;

  /**
   * Get the render options for this chart configuration
   */
  getRenderOptions(): ChartRenderOptions {
    return {
      type: this.getType(),
      style: { ...this.styleConfig },
      format: { ...this.formatConfig },
      interactions: { ...this.interactionConfig },
    };
  }

  /**
   * Set the chart title
   */
  title(title: string): this {
    this.styleConfig.title = title;
    return this;
  }

  /**
   * Set the chart subtitle
   */
  subtitle(subtitle: string): this {
    this.styleConfig.subtitle = subtitle;
    return this;
  }

  /**
   * Set the color scheme
   */
  colorScheme(scheme: string): this {
    this.styleConfig.colorScheme = scheme;
    return this;
  }

  /**
   * Set custom colors
   */
  colors(colors: string[]): this {
    this.styleConfig.colors = colors;
    return this;
  }

  /**
   * Configure the legend
   */
  legend(show: boolean, position?: 'top' | 'bottom' | 'left' | 'right'): this {
    this.styleConfig.showLegend = show;
    if (position) {
      this.styleConfig.legendPosition = position;
    }
    return this;
  }

  /**
   * Show or hide the legend
   */
  showLegend(show: boolean = true): this {
    this.styleConfig.showLegend = show;
    return this;
  }

  /**
   * Set the legend position
   */
  legendPosition(position: 'top' | 'bottom' | 'left' | 'right'): this {
    this.styleConfig.legendPosition = position;
    return this;
  }

  /**
   * Show or hide grid lines
   */
  grid(show: boolean = true): this {
    this.styleConfig.showGrid = show;
    return this;
  }

  /**
   * Show or hide values on the chart
   */
  showValues(show: boolean = true): this {
    this.styleConfig.showValues = show;
    return this;
  }

  /**
   * Enable or disable animations
   */
  animate(enabled: boolean = true): this {
    this.styleConfig.animated = enabled;
    return this;
  }

  /**
   * Set the chart dimensions
   */
  size(width: number | 'auto', height: number): this {
    this.styleConfig.width = width;
    this.styleConfig.height = height;
    return this;
  }

  /**
   * Set the chart width
   */
  width(width: number | 'auto'): this {
    this.styleConfig.width = width;
    return this;
  }

  /**
   * Set the chart height
   */
  height(height: number): this {
    this.styleConfig.height = height;
    return this;
  }

  /**
   * Set value format to number
   */
  formatAsNumber(decimals: number = 0, locale?: string): this {
    this.formatConfig.valueFormat = 'number';
    this.formatConfig.decimals = decimals;
    if (locale) {
      this.formatConfig.locale = locale;
    }
    return this;
  }

  /**
   * Set value format to currency
   */
  formatAsCurrency(
    currency: string = 'USD',
    decimals: number = 0,
    locale?: string
  ): this {
    this.formatConfig.valueFormat = 'currency';
    this.formatConfig.currency = currency;
    this.formatConfig.decimals = decimals;
    if (locale) {
      this.formatConfig.locale = locale;
    }
    return this;
  }

  /**
   * Set value format to percent
   */
  formatAsPercent(decimals: number = 0, locale?: string): this {
    this.formatConfig.valueFormat = 'percent';
    this.formatConfig.decimals = decimals;
    if (locale) {
      this.formatConfig.locale = locale;
    }
    return this;
  }

  /**
   * Set value format to compact notation
   */
  formatAsCompact(decimals: number = 1, locale?: string): this {
    this.formatConfig.valueFormat = 'compact';
    this.formatConfig.decimals = decimals;
    if (locale) {
      this.formatConfig.locale = locale;
    }
    return this;
  }

  /**
   * Add prefix to values
   */
  prefix(prefix: string): this {
    this.formatConfig.prefix = prefix;
    return this;
  }

  /**
   * Add suffix to values
   */
  suffix(suffix: string): this {
    this.formatConfig.suffix = suffix;
    return this;
  }

  /**
   * Set click handler
   */
  onClick(handler: (data: ChartClickData) => void): this {
    this.interactionConfig.click = handler;
    return this;
  }

  /**
   * Enable or disable hover effects
   */
  hover(enabled: boolean = true): this {
    this.interactionConfig.hover = enabled;
    return this;
  }

  /**
   * Configure drill-down
   */
  drillDown(
    levels: string[],
    onDrill?: (
      level: { field: string; value: unknown },
      path: Array<{ field: string; value: unknown }>
    ) => void,
    onDrillUp?: (path: Array<{ field: string; value: unknown }>) => void
  ): this {
    this.interactionConfig.drillDown = {
      enabled: true,
      levels,
      onDrill,
      onDrillUp,
    };
    return this;
  }

  /**
   * Clone this chart configuration
   */
  clone(): this {
    const Constructor = this.constructor as new (
      options: BaseChartOptions
    ) => this;
    return new Constructor({
      style: { ...this.styleConfig },
      format: { ...this.formatConfig },
      interactions: { ...this.interactionConfig },
    });
  }
}
