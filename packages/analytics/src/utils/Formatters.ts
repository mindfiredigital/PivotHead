/**
 * Value Formatters for PivotHead Analytics
 * Provides utilities for formatting numbers, dates, and other values
 */

import type { FormatConfig } from '../types/config-types';

/**
 * Format type options
 */
export type FormatType =
  | 'number'
  | 'currency'
  | 'percent'
  | 'compact'
  | 'date'
  | 'time'
  | 'datetime';

/**
 * Extended format configuration
 */
export interface ExtendedFormatConfig extends FormatConfig {
  /**
   * Notation for number formatting
   */
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';

  /**
   * Minimum integer digits
   */
  minimumIntegerDigits?: number;

  /**
   * Minimum fraction digits
   */
  minimumFractionDigits?: number;

  /**
   * Maximum fraction digits
   */
  maximumFractionDigits?: number;

  /**
   * Use grouping separators (e.g., 1,000)
   */
  useGrouping?: boolean;

  /**
   * Sign display option
   */
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';

  /**
   * Date/time style
   */
  dateStyle?: 'full' | 'long' | 'medium' | 'short';

  /**
   * Time style
   */
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

/**
 * ValueFormatter class for formatting values
 */
export class ValueFormatter {
  private locale: string;
  private defaultConfig: ExtendedFormatConfig;

  /**
   * Create a new ValueFormatter
   * @param locale - Default locale (e.g., 'en-US')
   * @param defaultConfig - Default format configuration
   */
  constructor(locale: string = 'en-US', defaultConfig?: ExtendedFormatConfig) {
    this.locale = locale;
    this.defaultConfig = defaultConfig || {};
  }

  /**
   * Format a numeric value
   * @param value - The value to format
   * @param config - Format configuration (overrides defaults)
   * @returns Formatted string
   */
  format(
    value: number | null | undefined,
    config?: ExtendedFormatConfig
  ): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    const mergedConfig = { ...this.defaultConfig, ...config };
    const locale = mergedConfig.locale || this.locale;
    const prefix = mergedConfig.prefix || '';
    const suffix = mergedConfig.suffix || '';

    let formattedValue: string;

    switch (mergedConfig.valueFormat) {
      case 'currency':
        formattedValue = this.formatCurrency(value, locale, mergedConfig);
        break;

      case 'percent':
        formattedValue = this.formatPercent(value, locale, mergedConfig);
        break;

      case 'compact':
        formattedValue = this.formatCompact(value, locale, mergedConfig);
        break;

      default:
        formattedValue = this.formatNumber(value, locale, mergedConfig);
    }

    return `${prefix}${formattedValue}${suffix}`;
  }

  /**
   * Format as a plain number
   */
  formatNumber(
    value: number,
    locale?: string,
    config?: ExtendedFormatConfig
  ): string {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits:
        config?.decimals ?? config?.minimumFractionDigits ?? 0,
      maximumFractionDigits:
        config?.decimals ?? config?.maximumFractionDigits ?? 2,
      useGrouping: config?.useGrouping !== false,
    };

    if (config?.signDisplay) {
      options.signDisplay = config.signDisplay;
    }

    if (config?.notation) {
      options.notation = config.notation;
    }

    return new Intl.NumberFormat(locale || this.locale, options).format(value);
  }

  /**
   * Format as currency
   */
  formatCurrency(
    value: number,
    locale?: string,
    config?: ExtendedFormatConfig
  ): string {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: config?.currency || 'USD',
      minimumFractionDigits: config?.decimals ?? 2,
      maximumFractionDigits: config?.decimals ?? 2,
    };

    if (config?.notation) {
      options.notation = config.notation;
    }

    return new Intl.NumberFormat(locale || this.locale, options).format(value);
  }

  /**
   * Format as percentage
   */
  formatPercent(
    value: number,
    locale?: string,
    config?: ExtendedFormatConfig
  ): string {
    // Note: Intl.NumberFormat with style: 'percent' multiplies by 100
    // If value is already a percentage (e.g., 75 for 75%), divide by 100 first
    const normalizedValue = Math.abs(value) > 1 ? value / 100 : value;

    const options: Intl.NumberFormatOptions = {
      style: 'percent',
      minimumFractionDigits: config?.decimals ?? 0,
      maximumFractionDigits: config?.decimals ?? 2,
    };

    return new Intl.NumberFormat(locale || this.locale, options).format(
      normalizedValue
    );
  }

  /**
   * Format with compact notation (e.g., 1.2K, 3.4M)
   */
  formatCompact(
    value: number,
    locale?: string,
    config?: ExtendedFormatConfig
  ): string {
    const options: Intl.NumberFormatOptions = {
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: config?.decimals ?? 0,
      maximumFractionDigits: config?.decimals ?? 1,
    };

    return new Intl.NumberFormat(locale || this.locale, options).format(value);
  }

  /**
   * Format a date value
   */
  formatDate(
    value: Date | string | number,
    locale?: string,
    config?: ExtendedFormatConfig
  ): string {
    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return '';
    }

    const options: Intl.DateTimeFormatOptions = {
      dateStyle: config?.dateStyle || 'medium',
    };

    if (config?.timeStyle) {
      options.timeStyle = config.timeStyle;
    }

    return new Intl.DateTimeFormat(locale || this.locale, options).format(date);
  }

  /**
   * Format a time value
   */
  formatTime(
    value: Date | string | number,
    locale?: string,
    config?: ExtendedFormatConfig
  ): string {
    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return '';
    }

    const options: Intl.DateTimeFormatOptions = {
      timeStyle: config?.timeStyle || 'short',
    };

    return new Intl.DateTimeFormat(locale || this.locale, options).format(date);
  }

  /**
   * Format bytes to human-readable size
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }

  /**
   * Format duration in milliseconds to human-readable string
   */
  formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Set the default locale
   */
  setLocale(locale: string): void {
    this.locale = locale;
  }

  /**
   * Get the current locale
   */
  getLocale(): string {
    return this.locale;
  }

  /**
   * Set default configuration
   */
  setDefaultConfig(config: ExtendedFormatConfig): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}

/**
 * Create a formatter function with preset configuration
 */
export function createFormatter(
  config: ExtendedFormatConfig
): (value: number) => string {
  const formatter = new ValueFormatter(config.locale);
  return (value: number) => formatter.format(value, config);
}

/**
 * Quick format functions
 */
export const formatNumber = (
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string => {
  return new ValueFormatter(locale).formatNumber(value, locale, { decimals });
};

export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new ValueFormatter(locale).formatCurrency(value, locale, { currency });
};

export const formatPercent = (
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string => {
  return new ValueFormatter(locale).formatPercent(value, locale, { decimals });
};

export const formatCompact = (
  value: number,
  locale: string = 'en-US'
): string => {
  return new ValueFormatter(locale).formatCompact(value, locale);
};

/**
 * Default formatter instance
 */
export const defaultFormatter = new ValueFormatter('en-US');
