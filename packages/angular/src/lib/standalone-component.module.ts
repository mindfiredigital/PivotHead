import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PivotHeadWrapperComponent } from './pivothead-wrapper.component';

@NgModule({
  imports: [PivotHeadWrapperComponent],
  exports: [PivotHeadWrapperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StandaloneComponentModule {}
