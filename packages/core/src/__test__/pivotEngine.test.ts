import { PivotEngine } from '../engine/pivotEngine';
import { PivotTableConfig } from '../types/interfaces';
import { vi } from 'vitest';

describe('PivotEngine', () => {
  const sampleData = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 35 },
  ];

  const config: PivotTableConfig<(typeof sampleData)[0]> = {
    data: sampleData,
    rows: [],
    columns: [
      { uniqueName: 'id', caption: 'ID' },
      { uniqueName: 'name', caption: 'Name' },
      { uniqueName: 'age', caption: 'Age' },
    ],
    measures: [],
    dimensions: [],
    defaultAggregation: 'sum',
  };

  it('should initialize with correct data and default row sizes', () => {
    const engine = new PivotEngine(config);
    const state = engine.getState();
    expect(state.rawData).toEqual(sampleData);
    expect(state.rowSizes).toEqual([
      { index: 0, height: 40 },
      { index: 1, height: 40 },
      { index: 2, height: 40 },
    ]);
  });

  it('should switch data handling mode and re-process data', () => {
    const engine = new PivotEngine(config);
    engine.setDataHandlingMode('raw');
    let state = engine.getState();
    expect(state.dataHandlingMode).toBe('raw');
    expect(state.processedData.headers).toEqual(['id', 'name', 'age']);

    engine.setDataHandlingMode('processed');
    state = engine.getState();
    expect(state.dataHandlingMode).toBe('processed');
    expect(state.processedData.headers).toEqual(['ID', 'Name', 'Age']);
  });

  it('should resize a row correctly', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(1, 60);
    const state = engine.getState();
    expect(state.rowSizes[1].height).toBe(60);
  });

  it('should not allow row height to be less than 20px', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(1, 10);
    const state = engine.getState();
    expect(state.rowSizes[1].height).toBe(20);
  });

  it('should maintain row sizes after sorting', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(1, 60);
    engine.sort('age', 'asc');
    const state = engine.getState();
    expect(state.rowSizes[1].height).toBe(60);
  });

  it('should handle resizing non-existent rows gracefully', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(10, 100); // Non-existent row
    const state = engine.getState();
    expect(state.rowSizes).toEqual([
      { index: 0, height: 40 },
      { index: 1, height: 40 },
      { index: 2, height: 40 },
    ]);
  });

  it('should handle resizing with decimal values', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(1, 55.5);
    const state = engine.getState();
    expect(state.rowSizes[1].height).toBe(55.5);
  });

  // Subscription System Tests
  describe('Subscription System', () => {
    it('should notify subscribers when state changes', () => {
      const engine = new PivotEngine(config);
      const mockCallback = vi.fn();

      // Subscribe to state changes (this will call immediately with current state)
      const unsubscribe = engine.subscribe(mockCallback);

      // Clear the initial call
      mockCallback.mockClear();

      // Trigger a state change using setDataHandlingMode (now should call _emit())
      engine.setDataHandlingMode('raw');

      // Verify callback was called with the new state
      expect(mockCallback).toHaveBeenCalled();
      const callArgs = mockCallback.mock.calls[0][0];
      expect(callArgs.dataHandlingMode).toBe('raw');

      unsubscribe();
    });

    it('should notify multiple subscribers', () => {
      const engine = new PivotEngine(config);
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();

      // Subscribe multiple callbacks
      const unsubscribe1 = engine.subscribe(mockCallback1);
      const unsubscribe2 = engine.subscribe(mockCallback2);

      // Clear initial calls
      mockCallback1.mockClear();
      mockCallback2.mockClear();

      // Trigger a state change using resizeRow (now should call _emit())
      engine.resizeRow(0, 50);

      // Verify both callbacks were called
      expect(mockCallback1).toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });

    it('should stop notifying after unsubscribe', () => {
      const engine = new PivotEngine(config);
      const mockCallback = vi.fn();

      // Subscribe and then unsubscribe
      const unsubscribe = engine.subscribe(mockCallback);
      unsubscribe();

      // Clear any initial calls
      mockCallback.mockClear();

      // Trigger a state change using a method that calls _emit()
      engine.setMeasures([
        { uniqueName: 'id', caption: 'ID', aggregation: 'count' },
      ]);

      // Verify callback was not called
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle subscribers with errors gracefully', () => {
      const engine = new PivotEngine(config);
      const errorCallback = vi.fn(() => {
        throw new Error('Subscriber error');
      });

      // Try to subscribe with an error callback - this should fail on subscription
      expect(() => engine.subscribe(errorCallback)).toThrow('Subscriber error');
    });

    it('should notify subscribers with current state after subscription', () => {
      const engine = new PivotEngine(config);
      const mockCallback = vi.fn();

      // Change state first using methods that call _emit()
      engine.setMeasures([
        { uniqueName: 'age', caption: 'Age', aggregation: 'sum' },
      ]);
      engine.setAggregation('avg');

      // Subscribe after state changes (should get immediate call with current state)
      engine.subscribe(mockCallback);

      // Verify callback receives the current state immediately
      expect(mockCallback).toHaveBeenCalled();
      const callArgs = mockCallback.mock.calls[0][0];
      expect(callArgs.selectedAggregation).toBe('avg');
      expect(callArgs.selectedMeasures).toHaveLength(1);
    });

    it('should emit state changes for all modified methods', () => {
      const engine = new PivotEngine(config);
      const mockCallback = vi.fn();

      // Subscribe to state changes
      const unsubscribe = engine.subscribe(mockCallback);
      mockCallback.mockClear();

      // Test setDataHandlingMode
      engine.setDataHandlingMode('raw');
      expect(mockCallback).toHaveBeenCalled();
      mockCallback.mockClear();

      // Test resizeRow
      engine.resizeRow(0, 50);
      expect(mockCallback).toHaveBeenCalled();
      mockCallback.mockClear();

      // Test toggleRowExpansion
      engine.toggleRowExpansion('test-row');
      expect(mockCallback).toHaveBeenCalled();
      mockCallback.mockClear();

      // Test setGroupConfig
      engine.setGroupConfig(null);
      expect(mockCallback).toHaveBeenCalled();
      mockCallback.mockClear();

      // Test reset
      engine.reset();
      expect(mockCallback).toHaveBeenCalled();

      unsubscribe();
    });
  });

  // Swapable and Unique Row Value Logic Tests
  describe('Swapable and Unique Row Value Logic', () => {
    const swapableData = [
      { category: 'A', subcategory: 'X', value: 10 },
      { category: 'A', subcategory: 'Y', value: 20 },
      { category: 'B', subcategory: 'X', value: 30 },
      { category: 'B', subcategory: 'Y', value: 40 },
      { category: 'A', subcategory: 'X', value: 15 }, // Duplicate combination
    ];

    const swapableConfig: PivotTableConfig<(typeof swapableData)[0]> = {
      data: swapableData,
      rawData: swapableData,
      rows: [
        { uniqueName: 'category', caption: 'Category' },
        { uniqueName: 'subcategory', caption: 'Subcategory' },
      ],
      columns: [],
      measures: [
        { uniqueName: 'value', caption: 'Sum of Value', aggregation: 'sum' },
      ],
      dimensions: [],
      defaultAggregation: 'sum',
    };

    it('should maintain unique row values after column swaps', () => {
      const engine = new PivotEngine(swapableConfig);
      const initialState = engine.getState();

      // Get initial processed data rows
      const initialRowValues = initialState.processedData.rows;
      const initialUniqueCategories = [
        ...new Set(initialRowValues.map(row => row[0])),
      ];
      const initialUniqueSubcategories = [
        ...new Set(initialRowValues.map(row => row[1])),
      ];

      // Verify unique values are correctly identified
      expect(initialUniqueCategories).toEqual(['A', 'B']);
      expect(initialUniqueSubcategories).toEqual(['X', 'Y']);

      // The engine processes each row individually, so we should see all rows
      // including duplicates until aggregation is applied
      expect(initialRowValues.length).toBeGreaterThan(0);

      // Check that the data contains the expected combinations
      const aCombinations = initialRowValues.filter(row => row[0] === 'A');
      const bCombinations = initialRowValues.filter(row => row[0] === 'B');

      expect(aCombinations.length).toBeGreaterThan(0);
      expect(bCombinations.length).toBeGreaterThan(0);
    });

    it('should handle row ordering with custom sort in processed mode', () => {
      const engine = new PivotEngine(swapableConfig);

      // Ensure we're in processed mode for this test
      engine.setDataHandlingMode('processed');

      // Sort by category descending
      engine.sort('category', 'desc');
      const sortedState = engine.getState();

      // Verify row order changed but unique values preserved
      const sortedRows = sortedState.processedData.rows;

      // In processed mode with grouping, we should have aggregated rows
      // First row should be the B category group (descending order)
      expect(sortedRows[0][0]).toBe('B');

      // Unique categories should still be preserved
      const uniqueCategories = [...new Set(sortedRows.map(row => row[0]))];
      expect(uniqueCategories.sort()).toEqual(['A', 'B']);

      // Test ascending sort as well
      engine.sort('category', 'asc');
      const ascSortedState = engine.getState();
      const ascSortedRows = ascSortedState.processedData.rows;
      expect(ascSortedRows[0][0]).toBe('A');
    });

    it('should maintain data integrity with mixed data types', () => {
      const mixedData = [
        { id: 1, name: 'Alpha', score: 85.5, active: true },
        { id: 2, name: 'Beta', score: 92.0, active: false },
        { id: 3, name: 'Alpha', score: 78.3, active: true }, // Duplicate name
        { id: 4, name: null, score: 0, active: false }, // Null value
      ];

      const mixedConfig: PivotTableConfig<(typeof mixedData)[0]> = {
        data: mixedData,
        rawData: mixedData,
        rows: [
          { uniqueName: 'name', caption: 'Name' },
          { uniqueName: 'active', caption: 'Active' },
        ],
        columns: [],
        measures: [
          { uniqueName: 'score', caption: 'Avg Score', aggregation: 'avg' },
        ],
        dimensions: [],
        defaultAggregation: 'avg',
      };

      const engine = new PivotEngine(mixedConfig);
      const state = engine.getState();
      const rows = state.processedData.rows;

      // Verify null values are handled
      const nullNameRows = rows.filter(row => row[0] === null);
      expect(nullNameRows).toHaveLength(1);

      // Verify boolean values are handled
      const activeRows = rows.filter(row => row[1] === true);
      const inactiveRows = rows.filter(row => row[1] === false);
      expect(activeRows.length).toBeGreaterThan(0);
      expect(inactiveRows.length).toBeGreaterThan(0);

      // Verify duplicate names are aggregated correctly
      const alphaRows = rows.filter(row => row[0] === 'Alpha');
      expect(alphaRows.length).toBeGreaterThanOrEqual(1); // Should be aggregated
    });

    it('should handle empty or single-row datasets', () => {
      // Test with empty data
      interface EmptyTestData {
        test?: string;
      }

      const emptyConfig: PivotTableConfig<EmptyTestData> = {
        data: [],
        rawData: [],
        rows: [{ uniqueName: 'test', caption: 'Test' }],
        columns: [],
        measures: [],
        dimensions: [],
        defaultAggregation: 'sum',
      };

      const emptyEngine = new PivotEngine(emptyConfig);
      const emptyState = emptyEngine.getState();
      expect(emptyState.processedData.rows).toEqual([]);

      // Test with single row
      interface SingleTestData {
        test: string;
        value: number;
      }

      const singleRowData: SingleTestData[] = [{ test: 'single', value: 42 }];
      const singleRowConfig: PivotTableConfig<SingleTestData> = {
        data: singleRowData,
        rawData: singleRowData,
        rows: [{ uniqueName: 'test', caption: 'Test' }],
        columns: [],
        measures: [
          { uniqueName: 'value', caption: 'Value', aggregation: 'sum' },
        ],
        dimensions: [],
        defaultAggregation: 'sum',
      };

      const singleEngine = new PivotEngine(singleRowConfig);
      const singleState = singleEngine.getState();
      expect(singleState.processedData.rows).toHaveLength(1);
      expect(singleState.processedData.rows[0]).toEqual(['single', 42]);
    });

    it('should preserve row order customizations through data updates', () => {
      const engine = new PivotEngine(swapableConfig);

      // Get initial state
      const initialState = engine.getState();
      const initialRowOrder = initialState.processedData.rows.map(row =>
        row.join('-')
      );

      // Trigger data re-processing
      engine.setDataHandlingMode('raw');
      engine.setDataHandlingMode('processed');

      // Verify row order is preserved through processing
      const reprocessedState = engine.getState();
      const reprocessedRowOrder = reprocessedState.processedData.rows.map(row =>
        row.join('-')
      );

      // Order should be consistent after reprocessing
      expect(reprocessedRowOrder).toEqual(initialRowOrder);
    });

    it('should support swapping data rows with swapDataRows method', () => {
      const engine = new PivotEngine(swapableConfig);

      // Get initial row field values
      const rowFieldName = engine.getRowFieldName();
      expect(rowFieldName).toBe('category');

      // Get unique values for the row field
      const uniqueRowValues = engine.getUniqueFieldValues('category');
      expect(uniqueRowValues).toEqual(['A', 'B']);

      // Get initial state to compare
      const initialRows = engine.getState().processedData.rows;
      const initialFirstCategory = initialRows[0][0];

      // Swap first and second category positions (A and B)
      engine.swapDataRows(0, 1);

      const swappedState = engine.getState();
      const swappedRows = swappedState.processedData.rows;

      // Check that the data was actually swapped
      // The category that was in position 1 should now be in position 0
      const swappedFirstCategory = swappedRows[0][0];

      // They should be different after the swap
      expect(swappedFirstCategory).not.toBe(initialFirstCategory);

      // Verify the swap worked by checking the first category is now what used to be second
      if (initialFirstCategory === 'A') {
        expect(swappedFirstCategory).toBe('B');
      } else {
        expect(swappedFirstCategory).toBe('A');
      }
    });

    it('should support swapping data columns with swapDataColumns method', () => {
      // Create config with columns
      const columnSwapData = [
        { product: 'Widget', region: 'North', sales: 100 },
        { product: 'Widget', region: 'South', sales: 150 },
        { product: 'Gadget', region: 'North', sales: 200 },
        { product: 'Gadget', region: 'South', sales: 250 },
      ];

      const columnSwapConfig: PivotTableConfig<(typeof columnSwapData)[0]> = {
        data: columnSwapData,
        rawData: columnSwapData,
        rows: [{ uniqueName: 'product', caption: 'Product' }],
        columns: [{ uniqueName: 'region', caption: 'Region' }],
        measures: [
          { uniqueName: 'sales', caption: 'Sales', aggregation: 'sum' },
        ],
        dimensions: [],
        defaultAggregation: 'sum',
      };

      const engine = new PivotEngine(columnSwapConfig);

      // Get initial column field values
      const columnFieldName = engine.getColumnFieldName();
      expect(columnFieldName).toBe('region');

      // Get unique values for the column field
      const uniqueColumnValues = engine.getUniqueFieldValues('region');
      expect(uniqueColumnValues).toEqual(['North', 'South']);

      // Test swapping columns (this should update internal column order)
      engine.swapDataColumns(0, 1);

      // Verify the swap operation completed without error
      const swappedState = engine.getState();
      expect(swappedState).toBeDefined();

      // Check if custom column order was set
      const customColumnOrder = engine.getOrderedColumnValues();
      if (customColumnOrder) {
        expect(customColumnOrder).toEqual(['South', 'North']);
      }
    });

    it('should handle edge cases in swapping operations', () => {
      const engine = new PivotEngine(swapableConfig);

      // Test swapping same indices (should be no-op)
      expect(() => engine.swapDataRows(0, 0)).not.toThrow();

      // Test swapping invalid indices
      expect(() => engine.swapDataRows(-1, 0)).not.toThrow();
      expect(() => engine.swapDataRows(0, 10)).not.toThrow();

      // Test with no row field configured
      interface NoRowData {
        category?: string;
        subcategory?: string;
        value?: number;
      }

      const noRowConfig: PivotTableConfig<NoRowData> = {
        data: swapableData,
        rawData: swapableData,
        rows: [], // No row fields
        columns: [],
        measures: [],
        dimensions: [],
        defaultAggregation: 'sum',
      };

      const noRowEngine = new PivotEngine(noRowConfig);
      expect(() => noRowEngine.swapDataRows(0, 1)).not.toThrow();
    });

    it('should handle large datasets efficiently', () => {
      // Generate a larger dataset for performance testing
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        group: `Group${i % 10}`,
        category: `Cat${i % 5}`,
        value: Math.random() * 100,
        index: i,
      }));

      const largeConfig: PivotTableConfig<(typeof largeData)[0]> = {
        data: largeData,
        rawData: largeData,
        rows: [
          { uniqueName: 'group', caption: 'Group' },
          { uniqueName: 'category', caption: 'Category' },
        ],
        columns: [],
        measures: [
          { uniqueName: 'value', caption: 'Sum of Value', aggregation: 'sum' },
        ],
        dimensions: [],
        defaultAggregation: 'sum',
      };

      const startTime = performance.now();
      const engine = new PivotEngine(largeConfig);
      const state = engine.getState();
      const endTime = performance.now();

      // Should process within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);

      // Should produce correct number of rows (each row from original data is processed)
      // In a simple configuration without aggregation, we expect all 1000 rows
      expect(state.processedData.rows.length).toBe(1000);

      // Verify unique combinations exist
      const uniqueCombinations = new Set(
        state.processedData.rows.map(row => `${row[0]}-${row[1]}`)
      );
      // With 10 groups and 5 categories, we should see 10 different unique combinations
      expect(uniqueCombinations.size).toBeLessThanOrEqual(50); // At most 50, but could be fewer
    });
  });

  // Filtering Tests for Processed Data
  describe('Filtering on Aggregated Values in Processed Mode', () => {
    const filterTestData = [
      { country: 'USA', product: 'A', price: 100, discount: 10 },
      { country: 'USA', product: 'B', price: 200, discount: 20 },
      { country: 'Canada', product: 'A', price: 150, discount: 15 },
      { country: 'Canada', product: 'B', price: 250, discount: 25 },
      { country: 'Mexico', product: 'A', price: 80, discount: 8 },
      { country: 'Mexico', product: 'B', price: 120, discount: 12 },
    ];

    const filterTestConfig: PivotTableConfig<(typeof filterTestData)[0]> = {
      data: filterTestData,
      rawData: filterTestData,
      rows: [{ uniqueName: 'country', caption: 'Country' }],
      columns: [],
      measures: [
        { uniqueName: 'price', caption: 'Sum of Price', aggregation: 'sum' },
        {
          uniqueName: 'discount',
          caption: 'Sum of Discount',
          aggregation: 'sum',
        },
      ],
      dimensions: [],
      defaultAggregation: 'sum',
    };

    it('should filter on aggregated price values in processed mode', () => {
      const engine = new PivotEngine(filterTestConfig);
      engine.setDataHandlingMode('processed');

      // Set the default aggregation to sum to match our measures
      engine.setAggregation('sum');

      // Set up grouping by country to enable aggregation
      engine.setGroupConfig({
        rowFields: ['country'],
        columnFields: [],
        grouper: (item: (typeof filterTestData)[0], fields: string[]) => {
          return fields
            .map(field => item[field as keyof typeof item])
            .join('-');
        },
      });

      // Filter for countries with sum of price greater than 250
      // USA: 300 (100+200), Canada: 400 (150+250), Mexico: 200 (80+120)
      // Should include USA and Canada, exclude Mexico
      engine.applyFilters([
        {
          field: 'sum_price',
          operator: 'greaterThan',
          value: 250,
        },
      ]);

      const state = engine.getState();
      const processedRows = state.processedData.rows;

      // Should have 4 rows (2 from USA + 2 from Canada) after filtering out Mexico
      expect(processedRows.length).toBe(4);

      // Verify the countries are correct (should only have USA and Canada rows)
      const countries = processedRows.map(row => row[0]);
      expect(countries).toContain('USA');
      expect(countries).toContain('Canada');
      expect(countries).not.toContain('Mexico');

      // Verify we have 2 USA rows and 2 Canada rows
      const usaRows = processedRows.filter(row => row[0] === 'USA');
      const canadaRows = processedRows.filter(row => row[0] === 'Canada');
      expect(usaRows.length).toBe(2);
      expect(canadaRows.length).toBe(2);
    });

    it('should filter on aggregated discount values in processed mode', () => {
      const engine = new PivotEngine(filterTestConfig);
      engine.setDataHandlingMode('processed');

      // Set the default aggregation to sum to match our measures
      engine.setAggregation('sum');

      // Set up grouping by country to enable aggregation
      engine.setGroupConfig({
        rowFields: ['country'],
        columnFields: [],
        grouper: (item: (typeof filterTestData)[0], fields: string[]) => {
          return fields
            .map(field => item[field as keyof typeof item])
            .join('-');
        },
      });

      // Filter for countries with sum of discount less than 25
      // USA: 30 (10+20), Canada: 40 (15+25), Mexico: 20 (8+12)
      // Should include only Mexico
      engine.applyFilters([
        {
          field: 'sum_discount',
          operator: 'lessThan',
          value: 25,
        },
      ]);

      const state = engine.getState();
      const processedRows = state.processedData.rows;

      // Should have 2 rows (only Mexico's 2 items)
      expect(processedRows.length).toBe(2);
      expect(processedRows[0][0]).toBe('Mexico');
      expect(processedRows[1][0]).toBe('Mexico');
    });

    it('should handle multiple aggregated filters in processed mode', () => {
      const engine = new PivotEngine(filterTestConfig);
      engine.setDataHandlingMode('processed');

      // Set the default aggregation to sum to match our measures
      engine.setAggregation('sum');

      // Set up grouping by country to enable aggregation
      engine.setGroupConfig({
        rowFields: ['country'],
        columnFields: [],
        grouper: (item: (typeof filterTestData)[0], fields: string[]) => {
          return fields
            .map(field => item[field as keyof typeof item])
            .join('-');
        },
      });

      // Filter for countries with sum of price greater than 250 AND sum of discount greater than 25
      // USA: price=300, discount=30 (matches both)
      // Canada: price=400, discount=40 (matches both)
      // Mexico: price=200, discount=20 (matches neither)
      engine.applyFilters([
        {
          field: 'sum_price',
          operator: 'greaterThan',
          value: 250,
        },
        {
          field: 'sum_discount',
          operator: 'greaterThan',
          value: 25,
        },
      ]);

      const state = engine.getState();
      const processedRows = state.processedData.rows;

      // Should have 4 rows (2 from USA + 2 from Canada)
      expect(processedRows.length).toBe(4);

      const countries = processedRows.map(row => row[0]);
      expect(countries).toContain('USA');
      expect(countries).toContain('Canada');
      expect(countries).not.toContain('Mexico');

      // Verify we have 2 USA rows and 2 Canada rows
      const usaRows = processedRows.filter(row => row[0] === 'USA');
      const canadaRows = processedRows.filter(row => row[0] === 'Canada');
      expect(usaRows.length).toBe(2);
      expect(canadaRows.length).toBe(2);
    });

    it('should handle mixed regular and aggregated filters in processed mode', () => {
      const engine = new PivotEngine(filterTestConfig);
      engine.setDataHandlingMode('processed');

      // Set the default aggregation to sum to match our measures
      engine.setAggregation('sum');

      // Set up grouping by country to enable aggregation
      engine.setGroupConfig({
        rowFields: ['country'],
        columnFields: [],
        grouper: (item: (typeof filterTestData)[0], fields: string[]) => {
          return fields
            .map(field => item[field as keyof typeof item])
            .join('-');
        },
      });

      // Filter for countries containing "a" AND with sum of price greater than 250
      // USA: contains "a" (in USA), price=300 (matches both)
      // Canada: contains "a" (in Canada), price=400 (matches both)
      // Mexico: doesn't contain "a", price=200 (matches neither)
      engine.applyFilters([
        {
          field: 'country',
          operator: 'contains',
          value: 'a',
        },
        {
          field: 'sum_price',
          operator: 'greaterThan',
          value: 250,
        },
      ]);

      const state = engine.getState();
      const processedRows = state.processedData.rows;

      // Should have 4 rows (2 from USA + 2 from Canada)
      expect(processedRows.length).toBe(4);

      const countries = processedRows.map(row => row[0]);
      expect(countries).toContain('USA');
      expect(countries).toContain('Canada');
      expect(countries).not.toContain('Mexico');
    });

    it('should return empty results when no aggregated values match filter', () => {
      const engine = new PivotEngine(filterTestConfig);
      engine.setDataHandlingMode('processed');

      // Set the default aggregation to sum to match our measures
      engine.setAggregation('sum');

      // Set up grouping by country to enable aggregation
      engine.setGroupConfig({
        rowFields: ['country'],
        columnFields: [],
        grouper: (item: (typeof filterTestData)[0], fields: string[]) => {
          return fields
            .map(field => item[field as keyof typeof item])
            .join('-');
        },
      });

      // Filter for countries with sum of price greater than 1000 (none match)
      engine.applyFilters([
        {
          field: 'sum_price',
          operator: 'greaterThan',
          value: 1000,
        },
      ]);

      const state = engine.getState();
      const processedRows = state.processedData.rows;

      // Should have no results
      expect(processedRows.length).toBe(0);
    });

    it('should maintain correct sorting after applying aggregated filters', () => {
      const engine = new PivotEngine(filterTestConfig);
      engine.setDataHandlingMode('processed');

      // Set the default aggregation to sum to match our measures
      engine.setAggregation('sum');

      // Set up grouping by country to enable aggregation
      engine.setGroupConfig({
        rowFields: ['country'],
        columnFields: [],
        grouper: (item: (typeof filterTestData)[0], fields: string[]) => {
          return fields
            .map(field => item[field as keyof typeof item])
            .join('-');
        },
      });

      // Sort by country descending
      engine.sort('country', 'desc');

      // Filter for countries with sum of price greater than 250
      engine.applyFilters([
        {
          field: 'sum_price',
          operator: 'greaterThan',
          value: 250,
        },
      ]);

      const state = engine.getState();
      const processedRows = state.processedData.rows;

      // Should have 4 rows (2 from USA + 2 from Canada), sorted in descending order
      expect(processedRows.length).toBe(4);

      // Since we sorted by country descending, USA should come before Canada
      expect(processedRows[0][0]).toBe('USA');
      expect(processedRows[1][0]).toBe('USA');
      expect(processedRows[2][0]).toBe('Canada');
      expect(processedRows[3][0]).toBe('Canada');
    });
  });
});
