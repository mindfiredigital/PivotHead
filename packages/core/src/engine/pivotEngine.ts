import { PivotTableConfig, PivotTableState, RowSize  } from '../types/interfaces'
import { processData } from './dataProcessor'


export class PivotEngine<T extends Record<string, any>> {
  private config: PivotTableConfig<T>
  private state: PivotTableState<T>

  constructor(config: PivotTableConfig<T>) {
    this.config = config
    this.state = {
      data: processData(config),
      sortConfig: null,
      rowSizes: this.initializeRowSizes(config.data)
    }
  }

  private initializeRowSizes(data: T[]): RowSize[] {
    return data.map((_, index) => ({ index, height: 40 })) // Default height of 40px
  }
  
  public sort(field: string, direction: 'asc' | 'desc') {
    this.state.sortConfig = { field, direction }
    this.applySort()
  }

  private applySort() {
   this.state.data = processData(this.config, this.state.sortConfig)
   this.state.rowSizes = this.state.data.map((_, index) => 
    this.state.rowSizes[index] || { index, height: 40 }
  )
  }

  public getState(): PivotTableState<T> {
    return { ...this.state }
  }

  public reset() {
    this.state.sortConfig = null
    this.state.data = processData(this.config)
    this.state.rowSizes = this.initializeRowSizes(this.config.data);
  }
  
  public resizeRow(index: number, height: number) {
    const rowIndex = this.state.rowSizes.findIndex(row => row.index === index)
    if (rowIndex !== -1) {
      this.state.rowSizes[rowIndex].height = Math.max(20, height) // Minimum height of 20px
    }
  }
}


