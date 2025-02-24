import { Injectable } from '@angular/core';
import {
  GroupConfig,
  PivotEngine,
  PivotTableConfig,
  PivotTableState,
} from '@mindfiredigital/pivot-head-core';

@Injectable({
  providedIn: 'root',
})
export class PivotEngineService<T extends Record<string, any>> {
  // Constrain T to extend Record<string, any>
  private pivotEngine: PivotEngine<T>; // PivotEngine with the generic T

  constructor() {
    // Default values for required properties in PivotTableConfig
    const defaultConfig: PivotTableConfig<T> = {
      data: [],
      groupConfig: null,
      rows: [], // Default empty rows
      columns: [], // Default empty columns
      measures: [], // Default empty measures
      dimensions: [], // Default empty dimensions
      defaultAggregation: 'sum', // Default aggregation, adjust as per your need
      onRowDragEnd: this.onRowDragEnd.bind(this),
      onColumnDragEnd: this.onColumnDragEnd.bind(this),
    };

    this.pivotEngine = new PivotEngine<T>(defaultConfig);
  }

  getState(): PivotTableState<T> {
    return this.pivotEngine.getState();
  }

  setGroupConfig(groupConfig: GroupConfig | null): void {
    this.pivotEngine.setGroupConfig(groupConfig);
  }

  getGroupedData(): any[] {
    return this.pivotEngine.getGroupedData();
  }

  reset(): void {
    this.pivotEngine.reset();
  }

  dragRow(fromIndex: number, toIndex: number): void {
    // this.pivotEngine.dragRow(fromIndex, toIndex);
  }

  dragColumn(fromIndex: number, toIndex: number): void {
    // this.pivotEngine.dragColumn(fromIndex, toIndex);
  }

  private onRowDragEnd(fromIndex: number, toIndex: number, data: T[]): void {
    console.log('Row dragged:', fromIndex, toIndex);
  }

  private onColumnDragEnd(
    fromIndex: number,
    toIndex: number,
    columns: any[]
  ): void {
    console.log('Column dragged:', fromIndex, toIndex);
  }
}
