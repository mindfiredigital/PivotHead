import { PivotEngine } from '../engine/pivotEngine';
import { AggregationType } from '../types/interfaces';

describe('PivotEngine Filter and Pagination', () => {
  const sampleData = [
    { id: 1, sales: 1500, region: 'North' },
    { id: 2, sales: 800, region: 'South' },
    { id: 3, sales: 2000, region: 'North' },
    // ... more test data
  ];

  const config = {
    data: sampleData,
    rows: [{ uniqueName: 'region' }],
    columns: [{ uniqueName: 'sales' }],
    measures: [{ uniqueName: 'sales', aggregation: 'sum' as AggregationType }],
    dimensions: [
      {
        field: 'region',
        label: 'Region',
        type: 'string' as const,
      },
    ],
    defaultAggregation: 'sum' as AggregationType,
  };

  let pivotEngine: PivotEngine<any>;

  beforeEach(() => {
    pivotEngine = new PivotEngine(config);
  });

  test('Filtering works correctly', () => {
    pivotEngine.applyFilters([
      {
        field: 'sales',
        operator: 'greaterThan',
        value: 1000,
      },
    ]);

    const state = pivotEngine.getState();
    expect(state.processedData.rows.length).toBe(2); // Should only show sales > 1000
  });

  test('Pagination works correctly', () => {
    pivotEngine.setPagination({
      currentPage: 1,
      pageSize: 2,
      totalPages: 2,
    });

    const state = pivotEngine.getState();
    expect(state.processedData.rows.length).toBe(2); // Should show 2 items per page
  });
});
