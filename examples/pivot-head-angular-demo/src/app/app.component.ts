// examples/pivot-head-angular-demo/src/app/app.component.ts

import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import {
  PivotHeadWrapperComponent,
  PivotDataRecord,
  PivotOptions,
  PivotTableState,
} from '@mindfiredigital/pivothead-angular'; // This import will now work
import { sampleData, sampleOptions } from './sample-data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, JsonPipe, PivotHeadWrapperComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('defaultPivotWrapper')
  defaultPivotWrapper!: PivotHeadWrapperComponent;

  pivotData: PivotDataRecord[] = sampleData;
  pivotOptions: PivotOptions = sampleOptions;
  currentState?: PivotTableState<PivotDataRecord>;

  constructor(private cdr: ChangeDetectorRef) {}

  onStateChange(newState: PivotTableState<PivotDataRecord>): void {
    console.log('State changed:', newState);
    this.currentState = newState;
    this.cdr.detectChanges();
  }

  // --- Methods to Demonstrate API Access ---

  exportToExcel(): void {
    this.defaultPivotWrapper.exportToExcel('Angular_Demo_Export');
  }

  refreshPivot(): void {
    this.defaultPivotWrapper.refresh();
  }

  // --- NEW METHOD TO DEMONSTRATE API ---
  resetPivot(): void {
    console.log('Resetting pivot state...');
    this.defaultPivotWrapper.reset();
  }
}
