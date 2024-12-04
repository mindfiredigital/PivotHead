import { PivotTableConfig, PivotTableState, ProcessedRow } from '../types/interfaces'
import { processData } from './dataProcessor'
import { applySort } from './sorter'

export class PivotEngine<T> {
  private config: PivotTableConfig<T>
  private state: PivotTableState<T>

  constructor(config: PivotTableConfig<T>) {
    this.config = config
    this.state = {
      rows: [],
      columns: [],
      expandedNodes: new Set(),
      sortConfig: null,
      filterConfig: null
    }
    this.processData()
  }

  private processData() {
    this.state.rows = processData(this.config.data, this.config.dimensions, this.config.measures)
    this.applyStateChanges()
  }

  private applyStateChanges() {
    if (this.state.sortConfig) {
      this.state.rows = applySort(this.state.rows, this.state.sortConfig)
    }

  }

  public sort(field: string, direction: 'asc' | 'desc') {
    this.state.sortConfig = { field, direction }
    this.applyStateChanges()
  }

  public getState(): PivotTableState<T> {
    return { ...this.state }
  }
  
  public reset() {
    this.state.sortConfig = null
    this.processData()
  }
}

