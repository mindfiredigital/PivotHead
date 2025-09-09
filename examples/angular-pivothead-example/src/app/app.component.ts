import { Component } from '@angular/core';
import { PivotHeadModule } from '@mindfiredigital/pivothead-angular';
import { demoData } from './data';
import { baseOptions } from './options';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PivotHeadModule],
  template: `
    <pivot-head-angular
      [data]="data"
      [options]="options"
      (stateChange)="onStateChange($event)"
    ></pivot-head-angular>
  `,
})
export class AppComponent {
  title = 'angular-pivothead-example';
  data = demoData;
  options = baseOptions;

  onStateChange(state: any) {
    console.log('State changed:', state);
  }
}
