import { describe, it, expect } from 'vitest';
import {
  DataTransformer,
  matrixToDatasets,
  aggregateChartData,
} from '../core/DataTransformer.js';
import type { DataMatrix } from '../core/DataTransformer.js';
import type { ChartData } from '../types.js';
import { DEFAULT_CHART_COLORS } from '../types.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeMatrix(
  rowValues: string[],
  columnValues: string[],
  fillValue = 10
): DataMatrix {
  const values: Record<string, Record<string, number>> = {};
  for (const row of rowValues) {
    values[row] = {};
    for (const col of columnValues) {
      values[row][col] = fillValue;
    }
  }
  return { rowValues, columnValues, values };
}

function makeChartData(
  labels: string[],
  datasets: Array<{ label: string; data: number[] }>
): ChartData {
  return {
    labels,
    datasets: datasets.map(ds => ({ ...ds, borderWidth: 1 })),
    rowFieldName: 'category',
    columnFieldName: 'region',
    measures: [{ uniqueName: 'sales', caption: 'Sales' }],
    selectedMeasure: { uniqueName: 'sales', caption: 'Sales' },
    allRowValues: labels,
    allColumnValues: datasets.map(d => d.label),
    filteredRowValues: labels,
    filteredColumnValues: datasets.map(d => d.label),
  };
}

// ─── toDatasets ───────────────────────────────────────────────────────────────

describe('DataTransformer.toDatasets()', () => {
  it('returns one dataset per column value', () => {
    const matrix = makeMatrix(['Electronics', 'Clothing'], ['North', 'South']);
    const { labels, datasets } = DataTransformer.toDatasets(matrix);
    expect(labels).toEqual(['Electronics', 'Clothing']);
    expect(datasets).toHaveLength(2);
    expect(datasets[0].label).toBe('North');
    expect(datasets[1].label).toBe('South');
  });

  it('assigns values correctly from the matrix', () => {
    const matrix: DataMatrix = {
      rowValues: ['A', 'B'],
      columnValues: ['X'],
      values: { A: { X: 100 }, B: { X: 200 } },
    };
    const { datasets } = DataTransformer.toDatasets(matrix);
    expect(datasets[0].data).toEqual([100, 200]);
  });

  it('defaults missing matrix values to 0', () => {
    const matrix: DataMatrix = {
      rowValues: ['A', 'B'],
      columnValues: ['X'],
      values: { A: { X: 50 } }, // B has no X
    };
    const { datasets } = DataTransformer.toDatasets(matrix);
    expect(datasets[0].data[1]).toBe(0);
  });

  it('applies default color palette from DEFAULT_CHART_COLORS', () => {
    const matrix = makeMatrix(['A'], ['X', 'Y']);
    const { datasets } = DataTransformer.toDatasets(matrix);
    expect(datasets[0].backgroundColor).toBe(DEFAULT_CHART_COLORS[0]);
    expect(datasets[1].backgroundColor).toBe(DEFAULT_CHART_COLORS[1]);
  });

  it('uses custom colors when provided', () => {
    const matrix = makeMatrix(['A'], ['X']);
    const { datasets } = DataTransformer.toDatasets(matrix, ['#ff0000']);
    expect(datasets[0].backgroundColor).toBe('#ff0000');
  });

  it('returns empty datasets for empty matrix', () => {
    const matrix: DataMatrix = { rowValues: [], columnValues: [], values: {} };
    const { labels, datasets } = DataTransformer.toDatasets(matrix);
    expect(labels).toEqual([]);
    expect(datasets).toHaveLength(0);
  });
});

// ─── matrixToDatasets (convenience fn) ────────────────────────────────────────

describe('matrixToDatasets()', () => {
  it('delegates to DataTransformer.toDatasets', () => {
    const matrix = makeMatrix(['A'], ['X']);
    const result = matrixToDatasets(matrix);
    expect(result.labels).toEqual(['A']);
    expect(result.datasets).toHaveLength(1);
  });
});

// ─── aggregate ────────────────────────────────────────────────────────────────

describe('DataTransformer.aggregate()', () => {
  it('returns a single aggregated dataset using sum by default', () => {
    const data = makeChartData(
      ['A', 'B'],
      [
        { label: 'X', data: [10, 20] },
        { label: 'Y', data: [30, 40] },
      ]
    );
    const result = DataTransformer.aggregate(data);
    expect(result.datasets).toHaveLength(1);
    expect(result.datasets[0].data).toEqual([40, 60]); // 10+30, 20+40
  });

  it('computes average when aggregation is "avg"', () => {
    const data = makeChartData(
      ['A'],
      [
        { label: 'X', data: [10] },
        { label: 'Y', data: [20] },
      ]
    );
    const result = DataTransformer.aggregate(data, 'avg');
    expect(result.datasets[0].data[0]).toBe(15); // (10+20)/2
  });

  it('preserves labels', () => {
    const data = makeChartData(
      ['Electronics', 'Clothing'],
      [{ label: 'Q1', data: [100, 200] }]
    );
    const result = DataTransformer.aggregate(data);
    expect(result.labels).toEqual(['Electronics', 'Clothing']);
  });

  it('uses selectedMeasure caption as dataset label', () => {
    const data = makeChartData(['A'], [{ label: 'Q1', data: [1] }]);
    const result = DataTransformer.aggregate(data);
    expect(result.datasets[0].label).toBe('Sales');
  });
});

// ─── aggregateChartData (convenience fn) ──────────────────────────────────────

describe('aggregateChartData()', () => {
  it('delegates to DataTransformer.aggregate', () => {
    const data = makeChartData(['A'], [{ label: 'X', data: [5] }]);
    const result = aggregateChartData(data);
    expect(result.datasets).toHaveLength(1);
  });
});

// ─── applyLimit ───────────────────────────────────────────────────────────────

describe('DataTransformer.applyLimit()', () => {
  it('returns data unchanged when limit is 0', () => {
    const data = makeChartData(
      ['A', 'B', 'C'],
      [{ label: 'X', data: [1, 2, 3] }]
    );
    const result = DataTransformer.applyLimit(data, 0);
    expect(result.labels).toHaveLength(3);
  });

  it('returns data unchanged when labels count is within limit', () => {
    const data = makeChartData(['A', 'B'], [{ label: 'X', data: [1, 2] }]);
    const result = DataTransformer.applyLimit(data, 5);
    expect(result.labels).toHaveLength(2);
  });

  it('limits to top N by value (desc)', () => {
    const data = makeChartData(
      ['A', 'B', 'C'],
      [{ label: 'X', data: [10, 50, 30] }]
    );
    const result = DataTransformer.applyLimit(data, 2);
    expect(result.labels).toHaveLength(2);
    expect(result.labels[0]).toBe('B'); // highest
    expect(result.labels[1]).toBe('C');
  });

  it('limits by ascending value when sortOrder is "asc"', () => {
    const data = makeChartData(
      ['A', 'B', 'C'],
      [{ label: 'X', data: [10, 50, 30] }]
    );
    const result = DataTransformer.applyLimit(data, 2, 'value', 'asc');
    expect(result.labels[0]).toBe('A'); // lowest
  });

  it('limits by label in descending order', () => {
    const data = makeChartData(
      ['apple', 'banana', 'cherry'],
      [{ label: 'X', data: [1, 1, 1] }]
    );
    const result = DataTransformer.applyLimit(data, 2, 'label', 'desc');
    expect(result.labels[0]).toBe('cherry');
  });

  it('reorders datasets to match new label order', () => {
    const data = makeChartData(
      ['A', 'B', 'C'],
      [{ label: 'X', data: [10, 50, 30] }]
    );
    const result = DataTransformer.applyLimit(data, 2);
    // labels are [B, C] (sorted desc by value), datasets.data should follow
    expect(result.datasets[0].data[0]).toBe(50); // B's value
    expect(result.datasets[0].data[1]).toBe(30); // C's value
  });
});

// ─── toHeatmap ────────────────────────────────────────────────────────────────

describe('DataTransformer.toHeatmap()', () => {
  it('creates one cell per (row × dataset)', () => {
    const data = makeChartData(
      ['A', 'B'],
      [
        { label: 'X', data: [1, 2] },
        { label: 'Y', data: [3, 4] },
      ]
    );
    const result = DataTransformer.toHeatmap(data);
    expect(result.cells).toHaveLength(4); // 2 rows × 2 datasets
  });

  it('computes minValue and maxValue correctly', () => {
    const data = makeChartData(['A', 'B'], [{ label: 'X', data: [5, 15] }]);
    const result = DataTransformer.toHeatmap(data);
    expect(result.minValue).toBe(5);
    expect(result.maxValue).toBe(15);
  });

  it('returns minValue/maxValue as 0 for empty datasets', () => {
    const data = makeChartData([], []);
    const result = DataTransformer.toHeatmap(data);
    expect(result.minValue).toBe(0);
    expect(result.maxValue).toBe(0);
  });

  it('preserves row and column field names', () => {
    const data = makeChartData(['A'], [{ label: 'X', data: [1] }]);
    const result = DataTransformer.toHeatmap(data);
    expect(result.rowFieldName).toBe('category');
    expect(result.columnFieldName).toBe('region');
  });
});

// ─── toSankey ─────────────────────────────────────────────────────────────────

describe('DataTransformer.toSankey()', () => {
  it('creates flows for positive values only', () => {
    const data = makeChartData(
      ['A', 'B'],
      [
        { label: 'X', data: [10, 0] },
        { label: 'Y', data: [0, 20] },
      ]
    );
    const result = DataTransformer.toSankey(data);
    expect(result.flows).toHaveLength(2); // only positive
    expect(result.flows[0]).toEqual({ from: 'A', to: 'X', flow: 10 });
    expect(result.flows[1]).toEqual({ from: 'B', to: 'Y', flow: 20 });
  });

  it('returns empty flows when all values are 0', () => {
    const data = makeChartData(['A'], [{ label: 'X', data: [0] }]);
    const result = DataTransformer.toSankey(data);
    expect(result.flows).toHaveLength(0);
  });
});

// ─── toHistogram ──────────────────────────────────────────────────────────────

describe('DataTransformer.toHistogram()', () => {
  it('returns empty histogram for empty values', () => {
    const result = DataTransformer.toHistogram([]);
    expect(result.binLabels).toHaveLength(0);
    expect(result.binCounts).toHaveLength(0);
    expect(result.numBins).toBe(0);
  });

  it('creates correct number of bins', () => {
    const values = Array.from({ length: 100 }, (_, i) => i);
    const result = DataTransformer.toHistogram(values, 5);
    expect(result.binCounts).toHaveLength(5);
    expect(result.numBins).toBe(5);
  });

  it('all values fall in some bin (total count equals input length)', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = DataTransformer.toHistogram(values, 5);
    const total = result.binCounts.reduce((s, c) => s + c, 0);
    expect(total).toBe(10);
  });

  it('correctly bins a simple range', () => {
    // values 0–9 with 2 bins: [0-5) and [5-10]
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = DataTransformer.toHistogram(values, 2);
    expect(result.binCounts).toHaveLength(2);
    expect(result.binCounts[0] + result.binCounts[1]).toBe(10);
  });

  it('handles a single unique value without throwing', () => {
    const result = DataTransformer.toHistogram([42, 42, 42], 3);
    expect(result.binCounts.reduce((s, c) => s + c, 0)).toBe(3);
  });

  it('uses default 10 bins', () => {
    const values = Array.from({ length: 50 }, (_, i) => i);
    const result = DataTransformer.toHistogram(values);
    expect(result.numBins).toBe(10);
  });
});

// ─── toTreemap ────────────────────────────────────────────────────────────────

describe('DataTransformer.toTreemap()', () => {
  const flatData = [
    { region: 'North', category: 'Electronics', sales: 100 },
    { region: 'North', category: 'Clothing', sales: 50 },
    { region: 'South', category: 'Electronics', sales: 80 },
  ];

  it('builds correct top-level nodes', () => {
    const result = DataTransformer.toTreemap(
      flatData,
      ['region', 'category'],
      'sales'
    );
    expect(result.tree).toHaveLength(2); // North, South
  });

  it('propagates values to parent nodes', () => {
    const result = DataTransformer.toTreemap(
      flatData,
      ['region', 'category'],
      'sales'
    );
    const north = result.tree.find(n => n.name === 'North');
    expect(north?.value).toBe(150); // 100 + 50
  });

  it('totalValue equals sum of all leaf values', () => {
    const result = DataTransformer.toTreemap(
      flatData,
      ['region', 'category'],
      'sales'
    );
    expect(result.totalValue).toBe(230); // 100 + 50 + 80
  });

  it('returns correct hierarchyFields', () => {
    const result = DataTransformer.toTreemap(
      flatData,
      ['region', 'category'],
      'sales'
    );
    expect(result.hierarchyFields).toEqual(['region', 'category']);
  });

  it('returns maxDepth >= 1', () => {
    const result = DataTransformer.toTreemap(
      flatData,
      ['region', 'category'],
      'sales'
    );
    expect(result.maxDepth).toBeGreaterThanOrEqual(1);
  });
});

// ─── flattenTreemap ───────────────────────────────────────────────────────────

describe('DataTransformer.flattenTreemap()', () => {
  it('flattens leaf nodes into labels and values', () => {
    const treemapData = DataTransformer.toTreemap(
      [
        { region: 'North', category: 'Electronics', sales: 100 },
        { region: 'South', category: 'Clothing', sales: 50 },
      ],
      ['region', 'category'],
      'sales'
    );
    const flat = DataTransformer.flattenTreemap(treemapData);
    expect(flat.labels).toHaveLength(2);
    expect(flat.datasets[0].data).toHaveLength(2);
  });

  it('total of flattened values equals treemap totalValue', () => {
    const treemapData = DataTransformer.toTreemap(
      [
        { region: 'A', cat: 'X', val: 30 },
        { region: 'B', cat: 'Y', val: 70 },
      ],
      ['region', 'cat'],
      'val'
    );
    const flat = DataTransformer.flattenTreemap(treemapData);
    const total = flat.datasets[0].data.reduce((s, v) => s + v, 0);
    expect(total).toBe(treemapData.totalValue);
  });
});

// ─── toCombo ──────────────────────────────────────────────────────────────────

describe('DataTransformer.toCombo()', () => {
  it('returns data unchanged for empty datasets', () => {
    const data = makeChartData(['A'], []);
    const result = DataTransformer.toCombo(data);
    expect(result.datasets).toHaveLength(0);
  });

  it('adds a "Total" secondary dataset', () => {
    const data = makeChartData(
      ['A', 'B'],
      [
        { label: 'X', data: [10, 20] },
        { label: 'Y', data: [5, 15] },
      ]
    );
    const result = DataTransformer.toCombo(data);
    const total = result.datasets.find(ds => ds.label === 'Total');
    expect(total).toBeDefined();
    expect(total?.data).toEqual([15, 35]); // 10+5, 20+15
  });

  it('sets primary datasets type to "bar"', () => {
    const data = makeChartData(['A'], [{ label: 'X', data: [10] }]);
    const result = DataTransformer.toCombo(data);
    const primary = result.datasets.filter(ds => ds.label !== 'Total');
    primary.forEach(ds => expect(ds.type).toBe('bar'));
  });

  it('sets secondary dataset type to "area" when specified', () => {
    const data = makeChartData(['A'], [{ label: 'X', data: [10] }]);
    const result = DataTransformer.toCombo(data, 'area');
    const secondary = result.datasets.find(ds => ds.label === 'Total');
    expect(secondary?.type).toBe('area');
    expect(secondary?.fill).toBe(true);
  });
});

// ─── toStacked ────────────────────────────────────────────────────────────────

describe('DataTransformer.toStacked()', () => {
  it('adds stack property to all datasets', () => {
    const data = makeChartData(
      ['A'],
      [
        { label: 'X', data: [1] },
        { label: 'Y', data: [2] },
      ]
    );
    const result = DataTransformer.toStacked(data);
    result.datasets.forEach(ds =>
      expect((ds as typeof ds & { stack: string }).stack).toBe('stack1')
    );
  });

  it('preserves existing data values', () => {
    const data = makeChartData(['A', 'B'], [{ label: 'X', data: [10, 20] }]);
    const result = DataTransformer.toStacked(data);
    expect(result.datasets[0].data).toEqual([10, 20]);
  });
});

// ─── transpose ────────────────────────────────────────────────────────────────

describe('DataTransformer.transpose()', () => {
  it('swaps labels with dataset labels', () => {
    const data = makeChartData(
      ['Electronics', 'Clothing'],
      [
        { label: 'Q1', data: [100, 200] },
        { label: 'Q2', data: [150, 250] },
      ]
    );
    const result = DataTransformer.transpose(data);
    expect(result.labels).toEqual(['Q1', 'Q2']);
    expect(result.datasets.map(ds => ds.label)).toEqual([
      'Electronics',
      'Clothing',
    ]);
  });

  it('transposes data values correctly', () => {
    const data = makeChartData(
      ['A', 'B'],
      [
        { label: 'X', data: [1, 2] },
        { label: 'Y', data: [3, 4] },
      ]
    );
    const result = DataTransformer.transpose(data);
    // new ds[0] = row A → [ds[0].data[0], ds[1].data[0]] = [1, 3]
    expect(result.datasets[0].data).toEqual([1, 3]);
    expect(result.datasets[1].data).toEqual([2, 4]);
  });

  it('swaps rowFieldName and columnFieldName', () => {
    const data = makeChartData(['A'], [{ label: 'X', data: [1] }]);
    const result = DataTransformer.transpose(data);
    expect(result.rowFieldName).toBe('region');
    expect(result.columnFieldName).toBe('category');
  });
});

// ─── normalize ────────────────────────────────────────────────────────────────

describe('DataTransformer.normalize()', () => {
  it('normalizes each dataset (column) to sum to 100', () => {
    const data = makeChartData(['A', 'B'], [{ label: 'X', data: [25, 75] }]);
    const result = DataTransformer.normalize(data, 'column');
    const total = result.datasets[0].data.reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(100);
  });

  it('normalizes each row to sum to 100', () => {
    const data = makeChartData(
      ['A'],
      [
        { label: 'X', data: [30] },
        { label: 'Y', data: [70] },
      ]
    );
    const result = DataTransformer.normalize(data, 'row');
    // row A total = 30+70 = 100 → X=30%, Y=70%
    expect(result.datasets[0].data[0]).toBeCloseTo(30);
    expect(result.datasets[1].data[0]).toBeCloseTo(70);
  });

  it('defaults to column normalization', () => {
    const data = makeChartData(['A', 'B'], [{ label: 'X', data: [20, 80] }]);
    const result = DataTransformer.normalize(data);
    const total = result.datasets[0].data.reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(100);
  });

  it('handles zero-total columns gracefully (no NaN)', () => {
    const data = makeChartData(['A', 'B'], [{ label: 'X', data: [0, 0] }]);
    const result = DataTransformer.normalize(data, 'column');
    result.datasets[0].data.forEach(v => expect(isNaN(v)).toBe(false));
  });
});
