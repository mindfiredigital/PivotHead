/* eslint-disable @typescript-eslint/no-explicit-any */
import { PivotEngine } from './pivotEngine';
import type {
  AggregationType,
  AxisConfig,
  MeasureConfig,
} from '../types/interfaces';

export type FieldType = 'string' | 'number' | 'date';

export interface FieldInfo {
  name: string;
  type: FieldType;
}

export interface LayoutSelection {
  rows: string[]; // field names
  columns: string[]; // field names
  values: Array<{
    field: string;
    aggregation?: AggregationType;
    caption?: string;
  }>;
}

/**
 * FieldService: Helper utilities to drive field selection and aggregations from UI.
 * - Discover fields and their inferred types from engine raw data
 * - Build Axis and Measure configs
 * - Update per-measure aggregation using engine APIs
 */
export class FieldService {
  /** Returns all fields inferred from the engine's raw data */
  public static getAvailableFields<TRow extends Record<string, any>>(
    engine: PivotEngine<TRow>
  ): FieldInfo[] {
    const state = engine.getState();
    const data = state.rawData || [];
    if (!Array.isArray(data) || data.length === 0) return [];

    const sample = data.slice(0, Math.min(200, data.length));
    const fieldNames = new Set<string>();

    sample.forEach(row =>
      Object.keys(row || {}).forEach(k => fieldNames.add(k))
    );

    const fields: FieldInfo[] = [];
    fieldNames.forEach(name => {
      fields.push({ name, type: this.inferFieldType(sample, name) });
    });

    return fields.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Supported aggregations */
  public static getSupportedAggregations(): AggregationType[] {
    return ['sum', 'avg', 'min', 'max', 'count'];
  }

  /** Change aggregation for a specific measure and refresh engine */
  public static setMeasureAggregation<TRow extends Record<string, any>>(
    engine: PivotEngine<TRow>,
    field: string,
    aggregation: AggregationType
  ): void {
    const state = engine.getState();
    const measures = [...state.measures];

    const idx = measures.findIndex(m => m.uniqueName === field);
    if (idx === -1) {
      // If not present, add it as a new measure
      measures.push(this.buildMeasure(field, aggregation));
    } else {
      measures[idx] = { ...measures[idx], aggregation };
    }

    engine.setMeasures(measures);
  }

  /** Build complete layout (rows, columns, measures) from selection */
  public static buildLayout(selection: LayoutSelection): {
    rows: AxisConfig[];
    columns: AxisConfig[];
    measures: MeasureConfig[];
  } {
    const rows: AxisConfig[] = (selection.rows || []).map(f => ({
      uniqueName: f,
      caption: this.toCaption(f),
    }));

    const columns: AxisConfig[] = (selection.columns || []).map(f => ({
      uniqueName: f,
      caption: this.toCaption(f),
    }));

    const measures: MeasureConfig[] = (selection.values || []).map(v =>
      this.buildMeasure(v.field, v.aggregation)
    );

    return { rows, columns, measures };
  }

  /** Build a single MeasureConfig */
  public static buildMeasure(
    field: string,
    aggregation?: AggregationType
  ): MeasureConfig {
    const agg: AggregationType = aggregation || 'sum';
    return {
      uniqueName: field,
      caption: `${this.capitalize(agg)} of ${this.toCaption(field)}`,
      aggregation: agg,
    };
  }

  // --- helpers ---
  private static inferFieldType(sample: any[], field: string): FieldType {
    let numericCount = 0;
    let dateCount = 0;

    sample.forEach(row => {
      const v = row?.[field];
      if (v === undefined || v === null) return;
      const num = typeof v === 'number' || (!isNaN(Number(v)) && v !== '');
      if (num) numericCount++;
      else if (this.looksLikeDate(v)) dateCount++;
    });

    if (numericCount > 0 && numericCount >= dateCount) return 'number';
    if (dateCount > 0) return 'date';
    return 'string';
  }

  private static looksLikeDate(v: any): boolean {
    if (typeof v !== 'string' && !(v instanceof Date)) return false;
    const ts = Date.parse(String(v));
    return !isNaN(ts);
  }

  private static toCaption(name: string): string {
    return name
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/^\w/, c => c.toUpperCase());
  }

  private static capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
