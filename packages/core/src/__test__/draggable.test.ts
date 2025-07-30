import { PivotEngine } from '../engine/pivotEngine';
import type { PivotTableConfig } from '../types/interfaces';

describe('PivotEngine Draggable Feature', () => {
  let engine: PivotEngine<any>;
  let config: PivotTableConfig<any>;

  beforeEach(() => {
    config = {
      data: [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 },
        { id: 3, name: 'Bob', age: 35 },
        { id: 4, name: 'Alice', age: 28 },
      ],
      columns: [
        { uniqueName: 'id', caption: 'ID' },
        { uniqueName: 'name', caption: 'Name' },
        { uniqueName: 'age', caption: 'Age' },
      ],
      rows: [],
      measures: [],
      dimensions: [],
      defaultAggregation: 'sum',
    };
    engine = new PivotEngine(config);

    // Manually set up row and column groups for testing this specific feature
    const rowGroups = config.data.map((item, index) => ({
      key: `row-${index}`,
      items: [item],
      aggregates: {},
      level: 0,
    }));
    engine.setRowGroups(rowGroups);

    const columnGroups = config.columns.map((column, index) => ({
      key: `col-${index}`,
      items: [column],
      aggregates: {},
      level: 0,
    }));
    engine.setColumnGroups(columnGroups);
  });

  describe('dragRow', () => {
    it('should move a row group from one index to another', () => {
      // initial order of keys: row-0, row-1, row-2, row-3
      engine.dragRow(1, 3); // move row-1 to the end
      const state = engine.getState();

      // expected order of keys: row-0, row-2, row-3, row-1
      expect(state.rowGroups.map(g => g.key)).toEqual([
        'row-0',
        'row-2',
        'row-3',
        'row-1',
      ]);

      // For more robust testing, check the content
      expect(state.rowGroups).toEqual([
        {
          key: 'row-0',
          items: [{ id: 1, name: 'John', age: 30 }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'row-2',
          items: [{ id: 3, name: 'Bob', age: 35 }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'row-3',
          items: [{ id: 4, name: 'Alice', age: 28 }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'row-1',
          items: [{ id: 2, name: 'Jane', age: 25 }],
          aggregates: {},
          level: 0,
        },
      ]);
    });

    it('should not change row groups when dragging to the same index', () => {
      const initialRowGroups = [...engine.getState().rowGroups];
      engine.dragRow(1, 1);
      const newRowGroups = engine.getState().rowGroups;
      expect(newRowGroups).toEqual(initialRowGroups);
    });

    it('should handle invalid indices gracefully', () => {
      const initialRowGroups = [...engine.getState().rowGroups];
      engine.dragRow(-1, 5);
      const newRowGroups = engine.getState().rowGroups;
      expect(newRowGroups).toEqual(initialRowGroups);
    });
  });

  describe('dragColumn', () => {
    it('should move a column group from one index to another', () => {
      // initial order of keys: col-0, col-1, col-2
      engine.dragColumn(0, 2); // move col-0 to the end
      const state = engine.getState();

      // expected order of keys: col-1, col-2, col-0
      expect(state.columnGroups.map(g => g.key)).toEqual([
        'col-1',
        'col-2',
        'col-0',
      ]);

      expect(state.columnGroups).toEqual([
        {
          key: 'col-1',
          items: [{ uniqueName: 'name', caption: 'Name' }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'col-2',
          items: [{ uniqueName: 'age', caption: 'Age' }],
          aggregates: {},
          level: 0,
        },
        {
          key: 'col-0',
          items: [{ uniqueName: 'id', caption: 'ID' }],
          aggregates: {},
          level: 0,
        },
      ]);
    });

    it('should not change column groups when dragging to the same index', () => {
      const initialColumnGroups = [...engine.getState().columnGroups];
      engine.dragColumn(1, 1);
      const newColumnGroups = engine.getState().columnGroups;
      expect(newColumnGroups).toEqual(initialColumnGroups);
    });

    it('should handle invalid indices gracefully', () => {
      const initialColumnGroups = [...engine.getState().columnGroups];
      engine.dragColumn(-1, 5);
      const newColumnGroups = engine.getState().columnGroups;
      expect(newColumnGroups).toEqual(initialColumnGroups);
    });
  });

  describe('dragRow and dragColumn interaction', () => {
    it('should maintain correct row and column group order after multiple drags', () => {
      engine.dragRow(0, 3); // move row-0 to the end -> [1, 2, 3, 0]
      engine.dragColumn(1, 0); // move col-1 to the start -> [1, 0, 2]
      const state = engine.getState();

      expect(state.rowGroups.map(g => g.key)).toEqual([
        'row-1',
        'row-2',
        'row-3',
        'row-0',
      ]);
      expect(state.columnGroups.map(g => g.key)).toEqual([
        'col-1',
        'col-0',
        'col-2',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle dragging row to start of the list', () => {
      // initial order of keys: row-0, row-1, row-2, row-3
      engine.dragRow(3, 0); // move row-3 to the start
      const state = engine.getState();

      // expected order of keys: row-3, row-0, row-1, row-2
      expect(state.rowGroups[0].key).toBe('row-3');
      expect(state.rowGroups[0].items[0].id).toBe(4);
    });

    it('should handle dragging column group to end of the list', () => {
      // initial order of keys: col-0, col-1, col-2
      engine.dragColumn(0, 2); // move col-0 to the end
      const state = engine.getState();

      // expected order of keys: col-1, col-2, col-0
      expect(state.columnGroups[2].key).toBe('col-0');
      expect(state.columnGroups[2].items[0].uniqueName).toBe('id');
    });
  });
});
