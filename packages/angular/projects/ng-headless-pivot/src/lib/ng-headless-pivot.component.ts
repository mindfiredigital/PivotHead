import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GroupConfig, PivotTableState } from '@mindfiredigital/pivot-head-core';
import { PivotEngineService } from './pivot-engine.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ng-headless-pivot',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './ng-headless-pivot.component.html',
  styleUrls: ['./ng-headless-pivot.component.scss'],
})
export class NgHeadlessPivotComponent<T extends Record<string, any>>
  implements OnInit
{
  @Input() data: T[] = [];
  @Input() groupConfig: GroupConfig | null = null;
  @Output() onRowDragEnd = new EventEmitter<any>();
  @Output() onColumnDragEnd = new EventEmitter<any>();

  pivotTableState!: PivotTableState<T>;

  constructor(private pivotEngineService: PivotEngineService<T>) {}

  ngOnInit() {
    this.pivotEngineService.setGroupConfig(this.groupConfig);
    this.pivotTableState = this.pivotEngineService.getState();
  }

  updateGroupConfig(groupConfig: GroupConfig | null): void {
    this.pivotEngineService.setGroupConfig(groupConfig);
    this.pivotTableState = this.pivotEngineService.getState();
  }

  resetTable(): void {
    this.pivotEngineService.reset();
    this.pivotTableState = this.pivotEngineService.getState();
  }

  dragRow(fromIndex: number, toIndex: number): void {
    this.pivotEngineService.dragRow(fromIndex, toIndex);
    this.pivotTableState = this.pivotEngineService.getState();
    this.onRowDragEnd.emit({ fromIndex, toIndex });
  }

  dragColumn(fromIndex: number, toIndex: number): void {
    this.pivotEngineService.dragColumn(fromIndex, toIndex);
    this.pivotTableState = this.pivotEngineService.getState();
    this.onColumnDragEnd.emit({ fromIndex, toIndex });
  }

  getGroupedData(): any[] {
    return this.pivotEngineService.getGroupedData();
  }
}
