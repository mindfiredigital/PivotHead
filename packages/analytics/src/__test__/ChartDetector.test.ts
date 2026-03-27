import { describe, it, expect } from 'vitest';
import { ChartDetector } from '../core/ChartDetector.js';
import type { PivotEngine } from '@mindfiredigital/pivothead';

// ─── Mock PivotEngine ─────────────────────────────────────────────────────────

type AxisField = { uniqueName: string; caption?: string };

interface MockState {
  rows: AxisField[];
  columns: AxisField[];
  measures: AxisField[];
  rawData: Record<string, unknown>[];
}

function mockEngine(
  state: Partial<MockState>
): PivotEngine<Record<string, unknown>> {
  return {
    getState: () => ({
      rows: [],
      columns: [],
      measures: [],
      rawData: [],
      ...state,
    }),
  } as unknown as PivotEngine<Record<string, unknown>>;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function detect(state: Partial<MockState>) {
  return new ChartDetector(mockEngine(state)).detect();
}

function topType(state: Partial<MockState>): string {
  return detect(state)[0]?.type ?? '';
}

function isRecommended(state: Partial<MockState>, chartType: string): boolean {
  return new ChartDetector(mockEngine(state)).isRecommended(
    chartType as Parameters<ChartDetector['isRecommended']>[0]
  );
}

// ─── Structural helpers ───────────────────────────────────────────────────────

function categoricalData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    category: `Cat${i}`,
    sales: 100 + i * 10,
  }));
}

function timeSeriesData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    date: `2024-0${(i % 9) + 1}-01`,
    sales: 100 + i * 10,
  }));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ChartDetector', () => {
  describe('detect() — return structure', () => {
    it('always returns at least one recommendation', () => {
      const recs = detect({
        rows: [{ uniqueName: 'category' }],
        measures: [{ uniqueName: 'sales' }],
        rawData: categoricalData(3),
      });
      expect(recs.length).toBeGreaterThan(0);
    });

    it('sorts recommendations by score descending', () => {
      const recs = detect({
        rows: [{ uniqueName: 'category' }],
        measures: [{ uniqueName: 'sales' }],
        rawData: categoricalData(3),
      });
      for (let i = 1; i < recs.length; i++) {
        expect(recs[i - 1].score).toBeGreaterThanOrEqual(recs[i].score);
      }
    });

    it('every recommendation has a type, score, reason, and preview', () => {
      const recs = detect({
        rows: [{ uniqueName: 'category' }],
        measures: [{ uniqueName: 'sales' }],
        rawData: categoricalData(3),
      });
      for (const rec of recs) {
        expect(typeof rec.type).toBe('string');
        expect(typeof rec.score).toBe('number');
        expect(typeof rec.reason).toBe('string');
        expect(typeof rec.preview).toBe('string');
      }
    });

    it('scores are between 0 and 1', () => {
      const recs = detect({
        rows: [{ uniqueName: 'category' }],
        measures: [{ uniqueName: 'sales' }],
        rawData: categoricalData(5),
      });
      for (const rec of recs) {
        expect(rec.score).toBeGreaterThan(0);
        expect(rec.score).toBeLessThanOrEqual(1);
      }
    });

    it('no duplicate chart types in results', () => {
      const recs = detect({
        rows: [{ uniqueName: 'category' }],
        measures: [{ uniqueName: 'sales' }],
        rawData: categoricalData(5),
      });
      const types = recs.map(r => r.type);
      expect(new Set(types).size).toBe(types.length);
    });
  });

  describe('Rule 1: single dimension, no real columns', () => {
    it('recommends pie for ≤7 positive-value categories', () => {
      const recs = detect({
        rows: [{ uniqueName: 'category' }],
        columns: [],
        measures: [{ uniqueName: 'sales' }],
        rawData: categoricalData(4),
      });
      expect(recs.some(r => r.type === 'pie')).toBe(true);
    });

    it('includes column chart for single dimension', () => {
      expect(
        isRecommended(
          {
            rows: [{ uniqueName: 'category' }],
            columns: [],
            measures: [{ uniqueName: 'sales' }],
            rawData: categoricalData(4),
          },
          'column'
        )
      ).toBe(true);
    });
  });

  describe('Rule 2: 1 row × 1 column dimension', () => {
    const state: Partial<MockState> = {
      rows: [{ uniqueName: 'category' }],
      columns: [{ uniqueName: 'region' }],
      measures: [{ uniqueName: 'sales' }],
      rawData: Array.from({ length: 12 }, (_, i) => ({
        category: `Cat${i % 3}`,
        region: `R${i % 4}`,
        sales: 10 + i,
      })),
    };

    it('recommends grouped column chart', () => {
      expect(isRecommended(state, 'column')).toBe(true);
    });
  });

  describe('Rule 3: time series data', () => {
    const timeState: Partial<MockState> = {
      rows: [{ uniqueName: 'date' }],
      columns: [],
      measures: [{ uniqueName: 'sales' }],
      rawData: timeSeriesData(12),
    };

    it('recommends line chart when row field is named "date"', () => {
      expect(isRecommended(timeState, 'line')).toBe(true);
    });

    it('recommends area chart as alternative for time series', () => {
      const recs = detect(timeState);
      expect(recs.some(r => r.type === 'area')).toBe(true);
    });

    it('detects time series even from field values (ISO dates)', () => {
      const state: Partial<MockState> = {
        rows: [{ uniqueName: 'period' }], // "period" is a time pattern word
        columns: [],
        measures: [{ uniqueName: 'revenue' }],
        rawData: timeSeriesData(10),
      };
      const recs = detect(state);
      expect(recs.some(r => r.type === 'line')).toBe(true);
    });
  });

  describe('Rule 4: multiple measures → combo / scatter', () => {
    const multiMeasureState: Partial<MockState> = {
      rows: [{ uniqueName: 'category' }],
      columns: [],
      measures: [{ uniqueName: 'sales' }, { uniqueName: 'profit' }],
      rawData: categoricalData(5),
    };

    it('recommends comboBarLine for multiple measures', () => {
      expect(isRecommended(multiMeasureState, 'comboBarLine')).toBe(true);
    });

    it('recommends scatter for 2+ measures', () => {
      const recs = detect(multiMeasureState);
      expect(recs.some(r => r.type === 'scatter')).toBe(true);
    });
  });

  describe('Rule 5: hierarchical rows → treemap', () => {
    const hierarchyState: Partial<MockState> = {
      rows: [{ uniqueName: 'region' }, { uniqueName: 'category' }],
      columns: [],
      measures: [{ uniqueName: 'sales' }],
      rawData: Array.from({ length: 20 }, (_, i) => ({
        region: `R${i % 2}`,
        category: `C${i % 5}`,
        sales: 10 + i,
      })),
    };

    it('recommends treemap for 2+ row dimensions', () => {
      expect(isRecommended(hierarchyState, 'treemap')).toBe(true);
    });
  });

  describe('Rule 6: large row count → horizontal bar', () => {
    it('recommends bar chart for >10 categories', () => {
      const state: Partial<MockState> = {
        rows: [{ uniqueName: 'category' }],
        columns: [],
        measures: [{ uniqueName: 'sales' }],
        rawData: categoricalData(15),
      };
      expect(isRecommended(state, 'bar')).toBe(true);
    });
  });

  describe('Rule 7: very large data → heatmap', () => {
    it('recommends heatmap for >20 rows', () => {
      const state: Partial<MockState> = {
        rows: [{ uniqueName: 'category' }],
        columns: [],
        measures: [{ uniqueName: 'sales' }],
        rawData: categoricalData(25),
      };
      expect(isRecommended(state, 'heatmap')).toBe(true);
    });
  });

  describe('getBestRecommendation()', () => {
    it('returns the highest-scored recommendation', () => {
      const detector = new ChartDetector(
        mockEngine({
          rows: [{ uniqueName: 'category' }],
          measures: [{ uniqueName: 'sales' }],
          rawData: categoricalData(3),
        })
      );
      const best = detector.getBestRecommendation();
      const all = detector.detect();
      expect(best.score).toBe(all[0].score);
    });
  });

  describe('isRecommended()', () => {
    it('returns true for a chart type with score ≥ 0.7', () => {
      const detector = new ChartDetector(
        mockEngine({
          rows: [{ uniqueName: 'category' }],
          columns: [],
          measures: [{ uniqueName: 'sales' }],
          rawData: categoricalData(4),
        })
      );
      expect(detector.isRecommended('column')).toBe(true);
    });

    it('returns false for a chart type not in recommendations', () => {
      const detector = new ChartDetector(
        mockEngine({
          rows: [{ uniqueName: 'category' }],
          columns: [],
          measures: [{ uniqueName: 'sales' }],
          rawData: categoricalData(4),
        })
      );
      // sankey is not recommended for simple categorical data
      expect(detector.isRecommended('sankey')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles empty data without throwing', () => {
      expect(() =>
        detect({ rows: [], columns: [], measures: [], rawData: [] })
      ).not.toThrow();
    });

    it('always provides at least a fallback column chart', () => {
      const recs = detect({ rows: [], columns: [], measures: [], rawData: [] });
      expect(recs.some(r => r.type === 'column')).toBe(true);
    });

    it('filters out __all__ synthetic columns', () => {
      const recs = detect({
        rows: [{ uniqueName: 'category' }],
        columns: [{ uniqueName: '__all__' }],
        measures: [{ uniqueName: 'sales' }],
        rawData: categoricalData(4),
      });
      // With __all__ filtered, it behaves like single-dimension (no real column)
      expect(recs.some(r => r.type === 'pie')).toBe(true);
    });
  });
});
