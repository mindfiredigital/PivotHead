import { PivotEngine } from '../engine/pivotEngine'
import { PivotTableConfig } from '../types/interfaces'

describe('PivotEngine Draggable Feature', () => {
  let engine: PivotEngine<any>
  let config: PivotTableConfig<any>

  beforeEach(() => {
    config = {
      data: [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 },
        { id: 3, name: 'Bob', age: 35 },
        { id: 4, name: 'Alice', age: 28 },
      ],
      columns: [
        { field: 'id', label: 'ID' },
        { field: 'name', label: 'Name' },
        { field: 'age', label: 'Age' },
      ],
      groupConfig: null
    }
    engine = new PivotEngine(config)
  })

  describe('dragRow', () => {
    it('should move a row from one index to another', () => {
      engine.dragRow(1, 3)
      const state = engine.getState()
      expect(state.data).toEqual([
        { id: 1, name: 'John', age: 30 },
        { id: 3, name: 'Bob', age: 35 },
        { id: 4, name: 'Alice', age: 28 },
        { id: 2, name: 'Jane', age: 25 },
      ])
    })

    // it('should update rowSizes when dragging rows', () => {
    //   engine.dragRow(0, 2)
    //   const state = engine.getState()
    //   expect(state.rowSizes).toEqual([
    //     { index: 1, height: 40 },
    //     { index: 0, height: 40 },
    //     { index: 2, height: 40 },
    //     { index: 3, height: 40 },
    //   ])
    // })

    it('should not change data when dragging to the same index', () => {
      const initialState = engine.getState()
      engine.dragRow(1, 1)
      const newState = engine.getState()
      expect(newState.data).toEqual(initialState.data)
    })
  })

  describe('dragColumn', () => {
    it('should move a column from one index to another', () => {
      engine.dragColumn(0, 2)
      const state = engine.getState()
      expect(state.columns).toEqual([
        { field: 'name', label: 'Name' },
        { field: 'age', label: 'Age' },
        { field: 'id', label: 'ID' },
      ])
    })

    it('should not change columns when dragging to the same index', () => {
      const initialState = engine.getState()
      engine.dragColumn(1, 1)
      const newState = engine.getState()
      expect(newState.columns).toEqual(initialState.columns)
    })
  })

  describe('dragRow and dragColumn interaction', () => {
    it('should maintain correct data and column order after multiple drags', () => {
      engine.dragRow(0, 3)
      engine.dragColumn(1, 0)
      const state = engine.getState()
      expect(state.data).toEqual([
        { id: 2, name: 'Jane', age: 25 },
        { id: 3, name: 'Bob', age: 35 },
        { id: 4, name: 'Alice', age: 28 },
        { id: 1, name: 'John', age: 30 },
      ])
      expect(state.columns).toEqual([
        { field: 'name', label: 'Name' },
        { field: 'id', label: 'ID' },
        { field: 'age', label: 'Age' },
      ])
    })
  })

  describe('edge cases', () => {
    it('should handle dragging row to start of the list', () => {
      engine.dragRow(3, 0)
      const state = engine.getState()
      expect(state.data[0]).toEqual({ id: 4, name: 'Alice', age: 28 })
    })

    it('should handle dragging column to end of the list', () => {
      engine.dragColumn(0, 2)
      const state = engine.getState()
      expect(state.columns[2]).toEqual({ field: 'id', label: 'ID' })
    })

    // it('should handle dragging with empty data set', () => {
    //   const emptyConfig = { ...config, data: [] }
    //   const emptyEngine = new PivotEngine(emptyConfig)
    //   emptyEngine.dragRow(0, 1)
    //   emptyEngine.dragColumn(0, 1)
    //   const state = emptyEngine.getState()
    //   expect(state.data).toEqual([])
    //   expect(state.columns).toEqual(config.columns)
    // })
  })
})

