import { Injectable } from '@angular/core';
import { PivotEngineService } from './pivot-engine.service';
import { PivotTableState } from '@mindfiredigital/pivot-head-core';

@Injectable({
  providedIn: 'root',
})
export class NgHeadlessPivotService {
  constructor(private pivotEngineService: PivotEngineService<any>) {}

  getState(): PivotTableState<any> {
    return this.pivotEngineService.getState();
  }

  setGroupConfig(groupConfig: any): void {
    this.pivotEngineService.setGroupConfig(groupConfig);
  }

  getGroupedData(): any[] {
    return this.pivotEngineService.getGroupedData();
  }

  reset(): void {
    this.pivotEngineService.reset();
  }

  dragRow(fromIndex: number, toIndex: number): void {
    this.pivotEngineService.dragRow(fromIndex, toIndex);
  }

  dragColumn(fromIndex: number, toIndex: number): void {
    this.pivotEngineService.dragColumn(fromIndex, toIndex);
  }
}
