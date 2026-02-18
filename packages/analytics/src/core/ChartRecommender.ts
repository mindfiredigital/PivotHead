/**
 * ChartRecommender - Standalone chart recommendation engine
 * Can be used without PivotEngine for general chart recommendation
 */

import type { ChartType } from '../types';
import type { ChartRecommendation } from '../types/config-types';

/**
 * Data profile for recommendation
 */
export interface DataProfile {
  /** Number of unique row values */
  rowCount: number;
  /** Number of unique column values */
  columnCount: number;
  /** Number of measures */
  measureCount: number;
  /** Whether data has a time/date field */
  hasTimeField: boolean;
  /** Whether data has hierarchical structure */
  hasHierarchy: boolean;
  /** Number of hierarchy levels */
  hierarchyDepth: number;
  /** Data cardinality level */
  cardinality: 'low' | 'medium' | 'high';
  /** Total number of data points */
  totalDataPoints: number;
  /** Whether values are mostly positive */
  allPositive: boolean;
  /** Whether data looks like a funnel (decreasing stages) */
  isFunnelLike: boolean;
}

/**
 * Field information for analysis
 */
export interface FieldInfo {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  uniqueValues: number;
  isTime?: boolean;
}

/**
 * Time field patterns for detection
 */
const TIME_FIELD_PATTERNS = [
  /date/i,
  /time/i,
  /year/i,
  /month/i,
  /day/i,
  /week/i,
  /quarter/i,
  /period/i,
  /timestamp/i,
  /_at$/i,
  /_on$/i,
];

/**
 * Funnel field patterns for detection
 */
const FUNNEL_FIELD_PATTERNS = [
  /stage/i,
  /step/i,
  /phase/i,
  /level/i,
  /status/i,
  /funnel/i,
  /pipeline/i,
];

/**
 * ChartRecommender class for standalone chart recommendations
 */
export class ChartRecommender {
  /**
   * Get chart recommendations based on data profile
   */
  static recommend(profile: DataProfile): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = [];

    // Rule 1: Single dimension, no columns → Pie/Doughnut
    if (profile.rowCount > 0 && profile.columnCount === 0) {
      if (profile.rowCount <= 7) {
        recommendations.push({
          type: 'pie',
          score: 0.92,
          reason: `Single categorical dimension with ${profile.rowCount} values - pie chart shows part-to-whole relationships clearly`,
          preview: `Pie chart with ${profile.rowCount} segments`,
          config: {
            type: 'pie',
            style: { showLegend: true, legendPosition: 'right' },
          },
        });
        recommendations.push({
          type: 'doughnut',
          score: 0.88,
          reason: 'Doughnut chart offers similar benefits with a modern look',
          preview: `Doughnut chart with ${profile.rowCount} segments`,
          config: {
            type: 'doughnut',
            style: { showLegend: true, legendPosition: 'right' },
          },
        });
      }
      recommendations.push({
        type: 'column',
        score: profile.rowCount <= 7 ? 0.85 : 0.92,
        reason: `Column chart shows comparison across ${profile.rowCount} categories`,
        preview: `Vertical bars for ${profile.rowCount} categories`,
        config: {
          type: 'column',
          style: { showLegend: false, showGrid: true },
        },
      });
    }

    // Rule 2: 1 row × 1 column → Grouped Bar or Heatmap
    if (profile.rowCount > 0 && profile.columnCount > 0) {
      const matrixSize = profile.rowCount * profile.columnCount;

      if (matrixSize <= 50) {
        recommendations.push({
          type: 'column',
          score: 0.95,
          reason: `Grouped column chart ideal for comparing ${profile.rowCount} categories across ${profile.columnCount} series`,
          preview: `Grouped bars: ${profile.rowCount} groups × ${profile.columnCount} series`,
          config: {
            type: 'column',
            style: { showLegend: true, showGrid: true },
          },
        });
        recommendations.push({
          type: 'stackedColumn',
          score: 0.88,
          reason: 'Stacked column shows both comparison and composition',
          preview: `Stacked bars: ${profile.rowCount} groups × ${profile.columnCount} segments`,
          config: {
            type: 'stackedColumn',
            style: { showLegend: true, showGrid: true },
          },
        });
      }

      if (matrixSize >= 20) {
        const heatmapScore = matrixSize > 100 ? 0.92 : 0.82;
        recommendations.push({
          type: 'heatmap',
          score: heatmapScore,
          reason: `Heatmap reveals patterns across ${profile.rowCount}×${profile.columnCount} matrix efficiently`,
          preview: `Color grid: ${profile.rowCount} rows × ${profile.columnCount} columns`,
          config: { type: 'heatmap', style: { showLegend: true } },
        });
      }
    }

    // Rule 3: Time dimension → Line/Area chart
    if (profile.hasTimeField) {
      recommendations.push({
        type: 'line',
        score: 0.94,
        reason: 'Line chart is ideal for showing trends over time',
        preview: `Line trend over ${profile.rowCount} time points`,
        config: {
          type: 'line',
          style: { showLegend: profile.columnCount > 0, showGrid: true },
        },
      });
      recommendations.push({
        type: 'area',
        score: 0.88,
        reason: 'Area chart emphasizes magnitude over time',
        preview: `Filled area over ${profile.rowCount} time points`,
        config: {
          type: 'area',
          style: { showLegend: profile.columnCount > 0, showGrid: true },
        },
      });
      if (profile.columnCount > 1) {
        recommendations.push({
          type: 'stackedArea',
          score: 0.85,
          reason:
            'Stacked area shows how parts contribute to the whole over time',
          preview: `Stacked area with ${profile.columnCount} series over time`,
          config: {
            type: 'stackedArea',
            style: { showLegend: true, showGrid: true },
          },
        });
      }
    }

    // Rule 4: Multiple measures → Combo/Scatter
    if (profile.measureCount > 1) {
      recommendations.push({
        type: 'comboBarLine',
        score: 0.85,
        reason: `Combo chart compares ${profile.measureCount} different measures effectively`,
        preview: `Bar + line overlay for ${profile.measureCount} measures`,
        config: {
          type: 'comboBarLine',
          style: { showLegend: true, showGrid: true },
        },
      });
      recommendations.push({
        type: 'scatter',
        score: 0.78,
        reason: 'Scatter plot reveals correlation between measures',
        preview: `Scatter plot correlating 2 measures`,
        config: {
          type: 'scatter',
          style: { showLegend: true, showGrid: true },
        },
      });
    }

    // Rule 5: Hierarchical data → Treemap
    if (profile.hasHierarchy && profile.hierarchyDepth >= 2) {
      recommendations.push({
        type: 'treemap',
        score: 0.8,
        reason: `Treemap visualizes ${profile.hierarchyDepth}-level hierarchy with proportional sizing`,
        preview: `Nested rectangles with ${profile.hierarchyDepth} hierarchy levels`,
        config: { type: 'treemap', style: { showLegend: true } },
      });
    }

    // Rule 6: Large row count → Horizontal bar
    if (profile.rowCount > 10 && profile.columnCount <= 3) {
      recommendations.push({
        type: 'bar',
        score: 0.88,
        reason: `Horizontal bar chart handles ${profile.rowCount} categories better with readable labels`,
        preview: `Horizontal bars for ${profile.rowCount} categories`,
        config: {
          type: 'bar',
          style: {
            orientation: 'horizontal',
            showLegend: false,
            showGrid: true,
          },
        },
      });
    }

    // Rule 7: Funnel-like data
    if (profile.isFunnelLike) {
      recommendations.push({
        type: 'funnel',
        score: 0.88,
        reason: 'Funnel chart visualizes stage-based progression',
        preview: `Funnel with descending stages`,
        config: { type: 'funnel', style: { showLegend: true } },
      });
    }

    // Rule 8: Very large data → Heatmap preferred
    if (profile.totalDataPoints > 200) {
      recommendations.push({
        type: 'heatmap',
        score: 0.9,
        reason: `Heatmap efficiently displays ${profile.totalDataPoints} data points`,
        preview: `Dense color-coded heatmap for ${profile.totalDataPoints} data points`,
        config: { type: 'heatmap', style: { showLegend: true } },
      });
    }

    // Fallback: Always include column chart
    if (!recommendations.find(r => r.type === 'column')) {
      recommendations.push({
        type: 'column',
        score: 0.7,
        reason: 'Column chart is a versatile default for categorical data',
        preview: 'Vertical bars for categorical comparison',
        config: {
          type: 'column',
          style: { showLegend: false, showGrid: true },
        },
      });
    }

    // Deduplicate and sort by score
    return this.deduplicateAndSort(recommendations);
  }

  /**
   * Profile data characteristics from raw data
   */
  static profileData(
    data: unknown[],
    fields: { rows: string[]; columns: string[]; measures: string[] }
  ): DataProfile {
    if (!data || data.length === 0) {
      return {
        rowCount: 0,
        columnCount: 0,
        measureCount: fields.measures.length,
        hasTimeField: false,
        hasHierarchy: false,
        hierarchyDepth: 0,
        cardinality: 'low',
        totalDataPoints: 0,
        allPositive: true,
        isFunnelLike: false,
      };
    }

    // Count unique values for each field
    const rowValues = new Set<string>();
    const columnValues = new Set<string>();
    let allPositive = true;

    data.forEach(item => {
      const record = item as Record<string, unknown>;
      fields.rows.forEach(field => {
        if (record[field] !== undefined && record[field] !== null) {
          rowValues.add(String(record[field]));
        }
      });
      fields.columns.forEach(field => {
        if (record[field] !== undefined && record[field] !== null) {
          columnValues.add(String(record[field]));
        }
      });
      fields.measures.forEach(field => {
        const value = record[field];
        if (typeof value === 'number' && value < 0) {
          allPositive = false;
        }
      });
    });

    const rowCount = rowValues.size;
    const columnCount = columnValues.size;
    const totalDataPoints =
      rowCount * Math.max(columnCount, 1) * fields.measures.length;

    // Determine cardinality
    let cardinality: 'low' | 'medium' | 'high' = 'low';
    if (totalDataPoints > 100) cardinality = 'medium';
    if (totalDataPoints > 500) cardinality = 'high';

    // Check for time fields
    const hasTimeField =
      this.detectTimeFields([...fields.rows, ...fields.columns]).length > 0;

    // Check for hierarchy
    const hasHierarchy = fields.rows.length >= 2;
    const hierarchyDepth = fields.rows.length;

    // Check for funnel pattern
    const isFunnelLike = this.detectFunnelPattern(fields.rows, data);

    return {
      rowCount,
      columnCount,
      measureCount: fields.measures.length,
      hasTimeField,
      hasHierarchy,
      hierarchyDepth,
      cardinality,
      totalDataPoints,
      allPositive,
      isFunnelLike,
    };
  }

  /**
   * Detect time fields from field names
   */
  static detectTimeFields(fieldNames: string[]): string[] {
    return fieldNames.filter(name =>
      TIME_FIELD_PATTERNS.some(pattern => pattern.test(name))
    );
  }

  /**
   * Detect hierarchical relationships in data
   */
  static detectHierarchy(
    data: unknown[],
    fields: string[]
  ): Array<{ field: string; levels: number }> {
    const hierarchy: Array<{ field: string; levels: number }> = [];

    fields.forEach(field => {
      const values = new Set<string>();
      data.forEach(item => {
        const record = item as Record<string, unknown>;
        if (record[field] !== undefined && record[field] !== null) {
          values.add(String(record[field]));
        }
      });
      hierarchy.push({ field, levels: values.size });
    });

    return hierarchy;
  }

  /**
   * Detect if data looks like a funnel (stage-based progression)
   */
  private static detectFunnelPattern(
    rowFields: string[],
    _data: unknown[]
  ): boolean {
    // Check if any row field matches funnel patterns
    const hasFunnelField = rowFields.some(field =>
      FUNNEL_FIELD_PATTERNS.some(pattern => pattern.test(field))
    );

    if (!hasFunnelField) return false;

    // Additionally check if values are generally decreasing (funnel characteristic)
    // This is a simplified check
    return true;
  }

  /**
   * Deduplicate recommendations and sort by score
   */
  private static deduplicateAndSort(
    recommendations: ChartRecommendation[]
  ): ChartRecommendation[] {
    // Keep highest score for each chart type
    const typeMap = new Map<ChartType, ChartRecommendation>();

    recommendations.forEach(rec => {
      const existing = typeMap.get(rec.type);
      if (!existing || rec.score > existing.score) {
        typeMap.set(rec.type, rec);
      }
    });

    // Convert to array and sort by score descending
    return Array.from(typeMap.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Get the best recommendation
   */
  static getBestRecommendation(
    profile: DataProfile
  ): ChartRecommendation | null {
    const recommendations = this.recommend(profile);
    return recommendations.length > 0 ? recommendations[0] : null;
  }

  /**
   * Check if a specific chart type is recommended for the given profile
   */
  static isRecommended(profile: DataProfile, chartType: ChartType): boolean {
    const recommendations = this.recommend(profile);
    return recommendations.some(r => r.type === chartType && r.score >= 0.7);
  }
}

/**
 * Convenience function to get chart recommendations
 */
export function recommendCharts(
  data: unknown[],
  fields: { rows: string[]; columns: string[]; measures: string[] }
): ChartRecommendation[] {
  const profile = ChartRecommender.profileData(data, fields);
  return ChartRecommender.recommend(profile);
}

/**
 * Convenience function to get the best chart type
 */
export function getBestChartType(
  data: unknown[],
  fields: { rows: string[]; columns: string[]; measures: string[] }
): ChartType {
  const profile = ChartRecommender.profileData(data, fields);
  const best = ChartRecommender.getBestRecommendation(profile);
  return best?.type ?? 'column';
}
