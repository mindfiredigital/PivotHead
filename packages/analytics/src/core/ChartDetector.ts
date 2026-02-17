/**
 * ChartDetector - Smart chart type detection and recommendations
 * Analyzes pivot table structure AND actual data values to recommend
 * optimal chart visualizations
 */

import type { PivotEngine } from '@mindfiredigital/pivothead';
import type { ChartType } from '../types';
import type { ChartRecommendation } from '../types/config-types';

/** Internal data analysis result for dynamic scoring */
interface DataAnalysis {
  rowCount: number;
  colCount: number;
  measureCount: number;
  totalDataPoints: number;
  allPositive: boolean;
  hasContinuousNumericField: boolean;
  measureVariance: number;
}

/** Regex patterns for detecting date/time values in data */
const TIME_VALUE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}/, // ISO date: 2024-01-15
  /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // US date: 1/15/2024
  /^\d{1,2}-\d{1,2}-\d{2,4}/, // Alt date: 15-01-2024
  /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i, // Month names
  /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  /^Q[1-4]\s*\d{4}/i, // Quarter: Q1 2024
  /^(fy|h[12])\s*\d{4}/i, // FY2024, H1 2024
  /^\d{4}$/, // Plain year: 2024
  /^(spring|summer|fall|autumn|winter)\s*\d{4}/i,
];

/**
 * ChartDetector analyzes pivot table configuration and data
 * to recommend the most suitable chart types
 */
export class ChartDetector<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  constructor(private engine: PivotEngine<T>) {}

  /**
   * Analyze the pivot structure and return chart recommendations
   * sorted by confidence score (highest first)
   */
  detect(): ChartRecommendation[] {
    const state = this.engine.getState();
    const rows = state.rows || [];
    const columns = state.columns || [];
    const measures = state.measures || [];
    const rawData = state.rawData || [];

    // Filter out synthetic __all__ columns so they don't skew recommendations
    const effectiveColumns = columns.filter(
      col => col.uniqueName !== '__all__'
    );

    const recommendations: ChartRecommendation[] = [];

    // Calculate data characteristics
    const rowCount = this.getUniqueValueCount(rows[0]?.uniqueName, rawData);
    const colCount =
      effectiveColumns.length > 0
        ? this.getUniqueValueCount(effectiveColumns[0]?.uniqueName, rawData)
        : 0;
    const hasTimeField =
      this.hasTimeDimension(rows) ||
      this.hasTimeDimension(effectiveColumns) ||
      rows.some(r => this.hasTimeLikeValues(r.uniqueName, rawData)) ||
      effectiveColumns.some(c => this.hasTimeLikeValues(c.uniqueName, rawData));
    const measureCount = measures.length;

    // Data profile for dynamic scoring
    const profile = this.analyzeDataProfile(
      rawData,
      rows,
      effectiveColumns,
      measures
    );

    // Build measure/dimension labels for config titles
    const measureLabel =
      measures[0]?.caption || measures[0]?.uniqueName || 'Value';
    const rowLabel = rows[0]?.caption || rows[0]?.uniqueName || 'Category';
    const colLabel =
      effectiveColumns[0]?.caption || effectiveColumns[0]?.uniqueName || '';

    // Rule 1: Single dimension, no (real) columns → Pie/Doughnut chart
    if (rows.length === 1 && effectiveColumns.length === 0) {
      if (rowCount <= 7 && profile.allPositive) {
        // Pie score scales inversely with category count (fewer = cleaner pie)
        const pieScore = 0.85 + (7 - rowCount) * 0.02;
        recommendations.push({
          type: 'pie',
          score: Math.min(pieScore, 0.97),
          reason: `Single categorical dimension with ${rowCount} values - ideal for showing part-to-whole relationships`,
          preview: `Pie chart showing ${measureLabel} distribution across ${rowCount} ${rowLabel} segments`,
          config: {
            type: 'pie',
            style: {
              title: `${measureLabel} by ${rowLabel}`,
              showLegend: true,
              legendPosition: 'right',
            },
          },
        });
        recommendations.push({
          type: 'doughnut',
          score: Math.min(pieScore - 0.04, 0.93),
          reason:
            'Doughnut chart provides similar insights with space for center annotations',
          preview: `Doughnut chart showing ${measureLabel} proportion across ${rowCount} ${rowLabel} segments`,
          config: {
            type: 'doughnut',
            style: {
              title: `${measureLabel} by ${rowLabel}`,
              showLegend: true,
              legendPosition: 'right',
            },
          },
        });
      }
      // Column score scales with category count
      const columnScore = rowCount <= 7 ? 0.8 + rowCount * 0.01 : 0.88;
      recommendations.push({
        type: 'column',
        score: columnScore,
        reason: `Column chart effectively compares ${rowCount} categories`,
        preview: `Vertical bars comparing ${measureLabel} across ${rowCount} ${rowLabel} categories`,
        config: {
          type: 'column',
          style: {
            title: `${measureLabel} by ${rowLabel}`,
            showLegend: false,
            showGrid: true,
          },
        },
      });
      // Bar preferred for many categories
      const barScore =
        rowCount > 5 ? 0.84 + Math.min(rowCount, 20) * 0.005 : 0.75;
      recommendations.push({
        type: 'bar',
        score: barScore,
        reason: 'Horizontal bars work well for longer category labels',
        preview: `Horizontal bars comparing ${measureLabel} across ${rowCount} ${rowLabel} categories`,
        config: {
          type: 'bar',
          style: {
            title: `${measureLabel} by ${rowLabel}`,
            orientation: 'horizontal',
            showLegend: false,
            showGrid: true,
          },
        },
      });
    }

    // Rule 2: 1 row × 1 real column → Grouped Bar or Heatmap
    if (rows.length === 1 && effectiveColumns.length === 1) {
      const matrixSize = rowCount * colCount;

      if (matrixSize <= 50) {
        // Score drops as matrix gets bigger (harder to read grouped)
        const groupedScore = 0.9 + Math.max(0, 25 - matrixSize) * 0.002;
        recommendations.push({
          type: 'column',
          score: Math.min(groupedScore, 0.95),
          reason: `Grouped column chart clearly compares ${rowCount} rows across ${colCount} columns`,
          preview: `Grouped vertical bars with ${rowCount} ${rowLabel} groups and ${colCount} ${colLabel} series`,
          config: {
            type: 'column',
            style: {
              title: `${measureLabel} by ${rowLabel} and ${colLabel}`,
              showLegend: true,
              showGrid: true,
            },
          },
        });
        recommendations.push({
          type: 'stackedColumn',
          score: Math.min(groupedScore - 0.07, 0.88),
          reason: 'Stacked columns show both individual and total values',
          preview: `Stacked vertical bars with ${rowCount} ${rowLabel} groups, segments by ${colLabel}`,
          config: {
            type: 'stackedColumn',
            style: {
              title: `${measureLabel} by ${rowLabel} (stacked by ${colLabel})`,
              showLegend: true,
              showGrid: true,
            },
          },
        });
      }

      if (matrixSize >= 20) {
        // Heatmap score rises with matrix size
        const heatmapScore = 0.78 + Math.min(matrixSize, 200) * 0.001;
        recommendations.push({
          type: 'heatmap',
          score: Math.min(heatmapScore, 0.94),
          reason: `Heatmap reveals patterns in ${rowCount}×${colCount} matrix data`,
          preview: `Color-coded grid with ${rowCount} ${rowLabel} rows and ${colCount} ${colLabel} columns`,
          config: {
            type: 'heatmap',
            style: {
              title: `${measureLabel}: ${rowLabel} vs ${colLabel}`,
              showLegend: true,
            },
          },
        });
      }

      recommendations.push({
        type: 'bar',
        score: 0.78 + Math.min(rowCount, 15) * 0.005,
        reason: 'Horizontal grouped bars for easier label reading',
        preview: `Horizontal grouped bars with ${rowCount} ${rowLabel} groups`,
        config: {
          type: 'bar',
          style: {
            title: `${measureLabel} by ${rowLabel} and ${colLabel}`,
            orientation: 'horizontal',
            showLegend: true,
            showGrid: true,
          },
        },
      });
    }

    // Rule 3: Time series detected → Line/Area chart
    if (hasTimeField) {
      // Line score higher when row count suggests enough points for trend
      const lineScore = rowCount >= 5 ? 0.93 : 0.85 + rowCount * 0.015;
      recommendations.push({
        type: 'line',
        score: Math.min(lineScore, 0.96),
        reason: 'Time dimension detected - line chart shows trends over time',
        preview: `Line trend showing ${measureLabel} over ${rowCount} time points`,
        config: {
          type: 'line',
          style: {
            title: `${measureLabel} over ${rowLabel}`,
            showLegend: effectiveColumns.length > 0,
            showGrid: true,
          },
        },
      });
      recommendations.push({
        type: 'area',
        score: Math.min(lineScore - 0.06, 0.9),
        reason: 'Area chart emphasizes volume changes over time',
        preview: `Filled area showing ${measureLabel} magnitude over ${rowCount} time points`,
        config: {
          type: 'area',
          style: {
            title: `${measureLabel} over ${rowLabel}`,
            showLegend: effectiveColumns.length > 0,
            showGrid: true,
          },
        },
      });
      if (effectiveColumns.length > 0) {
        recommendations.push({
          type: 'stackedArea',
          score: Math.min(lineScore - 0.09, 0.87),
          reason: 'Stacked area shows composition changes over time',
          preview: `Stacked area showing ${measureLabel} composition by ${colLabel} over time`,
          config: {
            type: 'stackedArea',
            style: {
              title: `${measureLabel} by ${colLabel} over ${rowLabel}`,
              showLegend: true,
              showGrid: true,
            },
          },
        });
      }
    }

    // Rule 4: Multiple measures → Combo chart
    if (measureCount > 1) {
      const comboScore = 0.8 + Math.min(measureCount, 5) * 0.03;
      const measureNames = measures
        .slice(0, 3)
        .map(m => m.caption || m.uniqueName)
        .join(', ');
      recommendations.push({
        type: 'comboBarLine',
        score: Math.min(comboScore, 0.92),
        reason: `${measureCount} measures available - combo chart compares different metrics on dual axes`,
        preview: `Bar + line overlay comparing ${measureNames}`,
        config: {
          type: 'comboBarLine',
          style: {
            title: `${measureNames} Comparison`,
            showLegend: true,
            showGrid: true,
          },
        },
      });
      recommendations.push({
        type: 'scatter',
        score: measureCount >= 2 ? 0.78 + (measureCount - 2) * 0.02 : 0.75,
        reason: 'Scatter plot reveals correlation between two measures',
        preview: `Scatter plot of ${measures[0]?.caption || measures[0]?.uniqueName} vs ${measures[1]?.caption || measures[1]?.uniqueName}`,
        config: {
          type: 'scatter',
          style: {
            title: `${measures[0]?.caption || measures[0]?.uniqueName} vs ${measures[1]?.caption || measures[1]?.uniqueName}`,
            showLegend: true,
            showGrid: true,
          },
        },
      });
    }

    // Rule 5: Hierarchical structure (2+ row dimensions) → Treemap
    if (rows.length >= 2) {
      const treemapScore = 0.75 + Math.min(rows.length, 4) * 0.04;
      const hierarchyLabels = rows
        .map(r => r.caption || r.uniqueName)
        .join(' > ');
      recommendations.push({
        type: 'treemap',
        score: Math.min(treemapScore, 0.9),
        reason: `${rows.length}-level hierarchy - treemap visualizes nested proportions`,
        preview: `Treemap with nested rectangles: ${hierarchyLabels}`,
        config: {
          type: 'treemap',
          style: {
            title: `${measureLabel} by ${hierarchyLabels}`,
            showLegend: true,
          },
        },
      });
      recommendations.push({
        type: 'stackedColumn',
        score: Math.min(treemapScore - 0.05, 0.8),
        reason: 'Stacked columns can represent hierarchical groupings',
        preview: `Stacked columns grouped by ${hierarchyLabels}`,
        config: {
          type: 'stackedColumn',
          style: {
            title: `${measureLabel} by ${hierarchyLabels}`,
            showLegend: true,
            showGrid: true,
          },
        },
      });
    }

    // Rule 6: Large row count → Horizontal bar
    if (rowCount > 10) {
      const barScore = 0.82 + Math.min(rowCount, 50) * 0.002;
      recommendations.push({
        type: 'bar',
        score: Math.min(barScore, 0.92),
        reason: `${rowCount} categories - horizontal bars prevent label overlap`,
        preview: `Horizontal bars for ${rowCount} ${rowLabel} categories`,
        config: {
          type: 'bar',
          style: {
            title: `${measureLabel} by ${rowLabel}`,
            orientation: 'horizontal',
            showLegend: false,
            showGrid: true,
          },
        },
      });
    }

    // Rule 7: Very large data → Heatmap
    if (rowCount > 20 || colCount > 10) {
      const size = rowCount * Math.max(colCount, 1);
      const heatmapScore = 0.84 + Math.min(size, 500) * 0.0002;
      recommendations.push({
        type: 'heatmap',
        score: Math.min(heatmapScore, 0.94),
        reason: `Large dataset (${rowCount}×${colCount || 1}) - heatmap scales well`,
        preview: `Dense color-coded heatmap for ${rowCount}×${colCount || 1} data points`,
        config: {
          type: 'heatmap',
          style: {
            title: `${measureLabel}: ${rowLabel} vs ${colLabel || 'Value'}`,
            showLegend: true,
          },
        },
      });
    }

    // Rule 8: Funnel analysis (checks both field names AND value distribution)
    if (this.looksLikeFunnel(rows, rawData, measures)) {
      const stageCount = this.getUniqueValueCount(rows[0]?.uniqueName, rawData);
      const funnelScore = stageCount >= 3 && stageCount <= 8 ? 0.91 : 0.82;
      recommendations.push({
        type: 'funnel',
        score: funnelScore,
        reason:
          'Data appears to represent sequential stages - funnel chart shows progression',
        preview: `Funnel with ${stageCount} descending stages by ${rowLabel}`,
        config: {
          type: 'funnel',
          style: {
            title: `${measureLabel} Funnel by ${rowLabel}`,
            showLegend: true,
          },
        },
      });
    }

    // Rule 9: Dense continuous numeric data → Histogram
    if (profile.hasContinuousNumericField && rawData.length >= 20) {
      const histScore = 0.8 + Math.min(rawData.length, 1000) * 0.0001;
      recommendations.push({
        type: 'histogram',
        score: Math.min(histScore, 0.88),
        reason:
          'Continuous numeric data detected - histogram shows frequency distribution',
        preview: `Frequency distribution bars for ${measureLabel} values`,
        config: {
          type: 'histogram',
          style: {
            title: `${measureLabel} Distribution`,
            showLegend: false,
            showGrid: true,
          },
        },
      });
    }

    // Default fallback - always include basic column chart
    if (!recommendations.some(r => r.type === 'column')) {
      recommendations.push({
        type: 'column',
        score: 0.7,
        reason: 'Column chart is a versatile default for most data',
        preview: `Vertical bars comparing ${measureLabel} across categories`,
        config: {
          type: 'column',
          style: {
            title: `${measureLabel} by ${rowLabel}`,
            showLegend: false,
            showGrid: true,
          },
        },
      });
    }

    // Sort by score (descending) and remove duplicates
    return this.deduplicateAndSort(recommendations);
  }

  /**
   * Get the single best recommendation
   */
  getBestRecommendation(): ChartRecommendation {
    const recommendations = this.detect();
    return recommendations[0];
  }

  /**
   * Check if a specific chart type is recommended
   */
  isRecommended(chartType: ChartType): boolean {
    const recommendations = this.detect();
    return recommendations.some(r => r.type === chartType && r.score >= 0.7);
  }

  /**
   * Get count of unique values for a field
   */
  private getUniqueValueCount(
    fieldName: string | undefined,
    data: unknown[]
  ): number {
    if (!fieldName || data.length === 0) return 0;

    const values = new Set<unknown>();
    data.forEach(item => {
      const record = item as Record<string, unknown>;
      if (record[fieldName] !== undefined && record[fieldName] !== null) {
        values.add(record[fieldName]);
      }
    });

    return values.size;
  }

  /**
   * Check if any axis contains a time-related dimension (by field name)
   */
  private hasTimeDimension(
    axes: Array<{ uniqueName?: string; caption?: string }>
  ): boolean {
    const timePatterns = [
      'date',
      'time',
      'year',
      'month',
      'day',
      'week',
      'quarter',
      'period',
      'timestamp',
    ];

    return axes.some(axis => {
      const name = (axis.uniqueName || '').toLowerCase();
      const caption = (axis.caption || '').toLowerCase();
      return timePatterns.some(
        pattern => name.includes(pattern) || caption.includes(pattern)
      );
    });
  }

  /**
   * Check if actual data values in a field look like dates/times,
   * even if the field name doesn't match time patterns.
   * Samples up to 50 values for performance.
   */
  private hasTimeLikeValues(
    fieldName: string | undefined,
    data: unknown[]
  ): boolean {
    if (!fieldName || data.length === 0) return false;

    const sampleSize = Math.min(50, data.length);
    let timelikeCount = 0;
    let validCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const record = data[i] as Record<string, unknown>;
      const value = record[fieldName];
      if (value === undefined || value === null) continue;

      validCount++;
      const strValue = String(value).trim();

      if (TIME_VALUE_PATTERNS.some(pattern => pattern.test(strValue))) {
        timelikeCount++;
      }
    }

    // If more than 60% of sampled values look time-like, treat as time dimension
    return validCount > 0 && timelikeCount / validCount >= 0.6;
  }

  /**
   * Check if data looks like a funnel.
   * Checks both field name patterns AND whether aggregated values decrease.
   */
  private looksLikeFunnel(
    rows: Array<{ uniqueName?: string; caption?: string }>,
    data: unknown[],
    measures: Array<{ uniqueName: string }>
  ): boolean {
    if (rows.length !== 1 || data.length < 3) return false;

    const fieldName = rows[0]?.uniqueName;
    if (!fieldName) return false;

    // Check 1: Name-based detection
    const stagePatterns = [
      'stage',
      'step',
      'phase',
      'level',
      'status',
      'funnel',
      'pipeline',
    ];

    const hasStageField = stagePatterns.some(
      pattern =>
        fieldName.toLowerCase().includes(pattern) ||
        (rows[0]?.caption || '').toLowerCase().includes(pattern)
    );

    // Check 2: Value-based detection — are aggregated values generally decreasing?
    if (measures.length === 0) return hasStageField;

    const measureField = measures[0].uniqueName;
    const grouped = new Map<string, number>();
    const insertionOrder: string[] = [];

    data.forEach(item => {
      const record = item as Record<string, unknown>;
      const category = String(record[fieldName] ?? '');
      const value = Number(record[measureField]) || 0;
      if (!grouped.has(category)) {
        insertionOrder.push(category);
      }
      grouped.set(category, (grouped.get(category) || 0) + value);
    });

    if (insertionOrder.length < 3 || insertionOrder.length > 12) {
      return hasStageField;
    }

    // Check if values are monotonically decreasing (allow 1 out-of-order step)
    const values = insertionOrder.map(k => grouped.get(k) || 0);
    let decreases = 0;
    let increases = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] < values[i - 1]) decreases++;
      else if (values[i] > values[i - 1]) increases++;
    }

    const isDecreasing =
      decreases >= (values.length - 1) * 0.7 && increases <= 1;

    return hasStageField || isDecreasing;
  }

  /**
   * Analyze data to produce a profile for dynamic scoring decisions.
   */
  private analyzeDataProfile(
    rawData: unknown[],
    rows: Array<{ uniqueName?: string }>,
    effectiveColumns: Array<{ uniqueName?: string }>,
    measures: Array<{ uniqueName: string }>
  ): DataAnalysis {
    const rowCount = this.getUniqueValueCount(rows[0]?.uniqueName, rawData);
    const colCount = this.getUniqueValueCount(
      effectiveColumns[0]?.uniqueName,
      rawData
    );

    const sampleSize = Math.min(200, rawData.length);
    const allPositive = this.areAllValuesPositive(
      measures,
      rawData,
      sampleSize
    );
    const hasContinuousNumericField = this.hasDenseNumericField(
      measures,
      rawData,
      sampleSize
    );
    const measureVariance = this.computeVariance(
      measures[0]?.uniqueName,
      rawData,
      sampleSize
    );

    return {
      rowCount,
      colCount,
      measureCount: measures.length,
      totalDataPoints: rawData.length,
      allPositive,
      hasContinuousNumericField,
      measureVariance,
    };
  }

  /**
   * Check if all measure values are positive (affects pie/doughnut suitability)
   */
  private areAllValuesPositive(
    measures: Array<{ uniqueName: string }>,
    data: unknown[],
    sampleSize: number
  ): boolean {
    const limit = Math.min(sampleSize, data.length);
    for (let i = 0; i < limit; i++) {
      const record = data[i] as Record<string, unknown>;
      for (const measure of measures) {
        const val = Number(record[measure.uniqueName]);
        if (!isNaN(val) && val < 0) return false;
      }
    }
    return true;
  }

  /**
   * Check if measure values are continuous (many unique values relative to count),
   * suggesting histogram suitability.
   */
  private hasDenseNumericField(
    measures: Array<{ uniqueName: string }>,
    data: unknown[],
    sampleSize: number
  ): boolean {
    if (measures.length === 0) return false;
    const field = measures[0].uniqueName;
    const values = new Set<number>();
    const limit = Math.min(sampleSize, data.length);

    for (let i = 0; i < limit; i++) {
      const record = data[i] as Record<string, unknown>;
      const val = Number(record[field]);
      if (!isNaN(val)) values.add(val);
    }

    // If unique numeric values exceed 80% of samples, data is continuous
    return limit > 0 && values.size / limit > 0.8;
  }

  /**
   * Compute variance of a numeric field from sampled data.
   */
  private computeVariance(
    fieldName: string | undefined,
    data: unknown[],
    sampleSize: number
  ): number {
    if (!fieldName || data.length === 0) return 0;

    const limit = Math.min(sampleSize, data.length);
    const values: number[] = [];

    for (let i = 0; i < limit; i++) {
      const record = data[i] as Record<string, unknown>;
      const val = Number(record[fieldName]);
      if (!isNaN(val)) values.push(val);
    }

    if (values.length === 0) return 0;

    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  }

  /**
   * Remove duplicate chart types and sort by score
   */
  private deduplicateAndSort(
    recommendations: ChartRecommendation[]
  ): ChartRecommendation[] {
    const seen = new Map<ChartType, ChartRecommendation>();

    recommendations.forEach(rec => {
      const existing = seen.get(rec.type);
      if (!existing || existing.score < rec.score) {
        seen.set(rec.type, rec);
      }
    });

    return Array.from(seen.values()).sort((a, b) => b.score - a.score);
  }
}
