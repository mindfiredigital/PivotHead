import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgHeadlessPivotComponent } from './ng-headless-pivot.component';

@NgModule({
  imports: [CommonModule, NgHeadlessPivotComponent],
  exports: [NgHeadlessPivotComponent], // Exporting the component for external usage
})
export class NgHeadlessPivotModule {}
