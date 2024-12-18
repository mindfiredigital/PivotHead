import { Group, GroupConfig, PivotTableConfig, PivotTableState, RowSize  } from '../types/interfaces'
import { processData } from './dataProcessor'


export class PivotEngine<T extends Record<string, any>> {
  private config: PivotTableConfig<T>
  private state: PivotTableState<T>

  constructor(config: PivotTableConfig<T>) {
    this.config = config
    this.state = {
      data: processData(config),
      sortConfig: null,
      rowSizes: this.initializeRowSizes(config.data),
      expandedRows: {},
      groupConfig: config.groupConfig || null,
      groups: [],
      columns: [...config.columns] 
    }
    if (this.state.groupConfig) {
      this.applyGrouping();
    }
  }

  private initializeRowSizes(data: T[]): RowSize[] {
    return data.map((_, index) => ({ index, height: 40 })) // Default height of 40px
  }
  
  public sort(field: string, direction: 'asc' | 'desc') {
    this.state.sortConfig = { field, direction }
    this.applySort()
    if (this.state.groupConfig) {
      this.applyGrouping();
    }

  }

  private applySort() {
   this.state.data = processData(this.config, this.state.sortConfig)
   this.state.rowSizes = this.state.data.map((_, index) => 
    this.state.rowSizes[index] || { index, height: 40 }
  )
  }

  private applyGrouping() {
    if (!this.state.groupConfig) return;

    const { fields, grouper } = this.state.groupConfig;
    this.state.groups = this.createGroups(this.state.data, fields, grouper);
  }

  private createGroups(data: T[], fields: string[], grouper: (item: any, fields: string[]) => string): Group[] {
    if (fields.length === 0) {
      return [{ key: 'All', items: data }];
    }

    const groups: { [key: string]: Group } = {};

    data.forEach(item => {
      const key = grouper(item, fields);
      if (!groups[key]) {
        groups[key] = { key, items: [], subgroups: [] };
      }
      groups[key].items.push(item);
    });

    if (fields.length > 1) {
      Object.values(groups).forEach(group => {
        group.subgroups = this.createGroups(group.items, fields.slice(1), grouper);
      });
    }

    return Object.values(groups);
  }

  public setGroupConfig(groupConfig: GroupConfig | null) {
    this.state.groupConfig = groupConfig;
    if (groupConfig) {
      this.applyGrouping();
    } else {
      this.state.groups = [];
    }
  }

  public getGroupedData(): Group[] {
    return this.state.groups;
  }

  public getState(): PivotTableState<T> {
    return { ...this.state }
  }

  public reset() {
    this.state.sortConfig = null
    this.state.data = processData(this.config)
    this.state.rowSizes = this.initializeRowSizes(this.config.data);
    this.state.expandedRows = {};
    this.state.groupConfig = this.config.groupConfig || null;
    this.state.groups = [];

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
  }
  
  public resizeRow(index: number, height: number) {
    const rowIndex = this.state.rowSizes.findIndex(row => row.index === index)
    if (rowIndex !== -1) {
      this.state.rowSizes[rowIndex].height = Math.max(20, height) // Minimum height of 20px
    }
  }

  public toggleRowExpansion(rowId: string) {
    this.state.expandedRows[rowId] = !this.state.expandedRows[rowId]
  }

  public isRowExpanded(rowId: string): boolean {
    return !!this.state.expandedRows[rowId]
  }

  public dragRow(fromIndex: number, toIndex: number) {
    const newData = [...this.state.data];
    const [removed] = newData.splice(fromIndex, 1);
    newData.splice(toIndex, 0, removed);
    this.state.data = newData;
    this.state.rowSizes = this.state.rowSizes.map((size, index) => ({
      ...size,
      index: index < fromIndex || index > toIndex ? index : 
             index < toIndex ? index + 1 : index - 1
    }));
    if (this.state.groupConfig) {
      this.applyGrouping();
    }
  }

  public dragColumn(fromIndex: number, toIndex: number) {
    const newColumns = [...this.state.columns];
    const [removed] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, removed);
    this.state.columns = newColumns;
  }
  
}


