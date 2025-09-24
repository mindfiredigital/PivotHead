import { describe, it, expect } from 'vitest';
import { FieldService, type LayoutSelection } from '../engine/fieldService';
import type {
  PivotTableState,
  MeasureConfig,
  AxisConfig,
} from '../types/interfaces';
import type { PivotEngine } from '../engine/pivotEngine';

// Define a safer row type for tests
type DataRow = Record<string, string | number | Date | null | undefined>;

// Minimal mock engine with only methods used by FieldService
class MockEngine<TRow extends Record<string, unknown>> {
  private state: PivotTableState<TRow>;
  public lastSetMeasuresArgs: MeasureConfig[] | null = null;

  constructor(initial: Partial<PivotTableState<TRow>>) {
    // Build a minimal-but-complete state object
    this.state = {
      data: [],
      dataHandlingMode: 'processed',
      rawData: [],
      processedData: { headers: [], rows: [], totals: {} },
      sortConfig: [],
      rows: [],
      columns: [],
      measures: [],
      rowSizes: [],
      expandedRows: {},
      groupConfig: null,
      groups: [],
      selectedMeasures: [],
      selectedDimensions: [],
      selectedAggregation: 'sum',
      formatting: {},
      columnWidths: {},
      isResponsive: true,
      rowGroups: [],
      columnGroups: [],
      filterConfig: [],
      paginationConfig: { currentPage: 1, pageSize: 10, totalPages: 1 },
      cellFormats: undefined,
      selectedCells: undefined,
      ...initial,
    } as PivotTableState<TRow>;
  }

  getState(): PivotTableState<TRow> {
    return this.state;
  }

  // Simulate engine.setMeasures: update both measures and selectedMeasures
  setMeasures(measures: MeasureConfig[]): void {
    this.lastSetMeasuresArgs = measures;
    this.state.measures = measures;
    this.state.selectedMeasures = measures;
  }
}

// Helper to coerce MockEngine into PivotEngine shape for FieldService
const asPivotEngine = (e: MockEngine<DataRow>) =>
  e as unknown as PivotEngine<DataRow>;

// Helper to create captions for AxisConfig built by FieldService
const captions = (axes: AxisConfig[]) => axes.map(a => a.caption);

describe('FieldService.getAvailableFields', () => {
  it('returns [] when no rawData', () => {
    const engine = new MockEngine<DataRow>({ rawData: [] });
    expect(FieldService.getAvailableFields(asPivotEngine(engine))).toEqual([]);
  });

  it('infers field types and sorts by name', () => {
    const rawData: DataRow[] = [
      { amount: 10, date: '2025-09-19', name: 'Alice' },
      { amount: '20', date: '2024-01-01', name: 'Bob' },
      { amount: null, date: '2023-12-31', name: 'Carol' },
    ];
    const engine = new MockEngine<DataRow>({ rawData });

    const fields = FieldService.getAvailableFields(asPivotEngine(engine));

    // Sorted alphabetically by name
    expect(fields.map(f => f.name)).toEqual(['amount', 'date', 'name']);

    const types = Object.fromEntries(fields.map(f => [f.name, f.type]));
    expect(types.amount).toBe('number');
    expect(types.date).toBe('date');
    expect(types.name).toBe('string');
  });
});

describe('FieldService.getSupportedAggregations', () => {
  it('returns supported aggregations list', () => {
    expect(FieldService.getSupportedAggregations()).toEqual([
      'sum',
      'avg',
      'min',
      'max',
      'count',
    ]);
  });
});

describe('FieldService.buildMeasure', () => {
  it('builds a measure with default sum aggregation and caption', () => {
    const m = FieldService.buildMeasure('amount');
    expect(m).toMatchObject<Partial<MeasureConfig>>({
      uniqueName: 'amount',
      aggregation: 'sum',
      caption: 'Sum of Amount',
    });
  });

  it('builds a measure with provided aggregation', () => {
    const m = FieldService.buildMeasure('amount', 'avg');
    expect(m).toMatchObject<Partial<MeasureConfig>>({
      uniqueName: 'amount',
      aggregation: 'avg',
      caption: 'Avg of Amount',
    });
  });
});

describe('FieldService.buildLayout', () => {
  it('builds rows, columns, and measures from selection', () => {
    const selection: LayoutSelection = {
      rows: ['region'],
      columns: ['product'],
      values: [{ field: 'amount', aggregation: 'sum' }],
    };

    const { rows, columns, measures } = FieldService.buildLayout(selection);

    expect(rows).toEqual<AxisConfig[]>([
      { uniqueName: 'region', caption: 'Region' },
    ]);
    expect(columns).toEqual<AxisConfig[]>([
      { uniqueName: 'product', caption: 'Product' },
    ]);
    expect(measures.length).toBe(1);
    expect(measures[0]).toMatchObject<Partial<MeasureConfig>>({
      uniqueName: 'amount',
      aggregation: 'sum',
      caption: 'Sum of Amount',
    });

    expect(captions(rows)).toEqual(['Region']);
    expect(captions(columns)).toEqual(['Product']);
  });
});

describe('FieldService.setMeasureAggregation', () => {
  it('updates aggregation of existing measure', () => {
    const engine = new MockEngine<DataRow>({
      rawData: [],
      measures: [
        { uniqueName: 'amount', aggregation: 'sum', caption: 'Sum of Amount' },
      ],
    });

    FieldService.setMeasureAggregation(asPivotEngine(engine), 'amount', 'avg');

    const state = engine.getState();
    expect(state.measures).toHaveLength(1);
    expect(state.measures[0].aggregation).toBe('avg');
    expect(engine.lastSetMeasuresArgs).toBeTruthy();
    if (engine.lastSetMeasuresArgs) {
      expect(engine.lastSetMeasuresArgs[0].aggregation).toBe('avg');
    }
  });

  it('adds new measure when missing', () => {
    const engine = new MockEngine<DataRow>({ rawData: [], measures: [] });

    FieldService.setMeasureAggregation(asPivotEngine(engine), 'amount', 'sum');

    const state = engine.getState();
    expect(state.measures).toHaveLength(1);
    expect(state.measures[0]).toMatchObject<Partial<MeasureConfig>>({
      uniqueName: 'amount',
      aggregation: 'sum',
      caption: 'Sum of Amount',
    });
  });
});
