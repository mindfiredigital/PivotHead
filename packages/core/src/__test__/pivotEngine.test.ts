import { PivotEngine } from '../engine/pivotEngine';
import { PivotTableConfig } from '../types/interfaces';

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
});
