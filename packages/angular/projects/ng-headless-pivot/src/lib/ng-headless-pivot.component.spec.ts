import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgHeadlessPivotComponent } from './ng-headless-pivot.component';

describe('NgHeadlessPivotComponent', () => {
  let component: NgHeadlessPivotComponent;
  let fixture: ComponentFixture<NgHeadlessPivotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgHeadlessPivotComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgHeadlessPivotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
