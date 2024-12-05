import { PivotTableConfig, PivotTableState,  } from '../types/interfaces'
import { processData } from './dataProcessor'


export class PivotEngine<T extends Record<string, any>> {
  private config: PivotTableConfig<T>
  private state: PivotTableState<T>

  constructor(config: PivotTableConfig<T>) {
    this.config = config
    this.state = {
      data: processData(config),
      sortConfig: null
    }
  }

  public sort(field: string, direction: 'asc' | 'desc') {
    this.state.sortConfig = { field, direction }
    this.applySort()
  }

  private applySort() {
   this.state.data = processData(this.config, this.state.sortConfig)
  }

  public getState(): PivotTableState<T> {
    return { ...this.state }
  }

  public reset() {
    this.state.sortConfig = null
    this.state.data = processData(this.config)
  }
}


