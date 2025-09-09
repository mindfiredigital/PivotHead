import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotHeadComponent } from './pivot-head.component';
import { PivotHeadDirective } from './pivot-head.directive';
import { PivotHeadService } from './pivot-head.service';

@NgModule({
  declarations: [PivotHeadComponent, PivotHeadDirective],
  imports: [CommonModule],
  exports: [PivotHeadComponent, PivotHeadDirective],
  providers: [PivotHeadService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PivotHeadModule {}
