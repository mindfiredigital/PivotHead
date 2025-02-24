import { TestBed } from '@angular/core/testing';

import { NgHeadlessPivotService } from './ng-headless-pivot.service';

describe('NgHeadlessPivotService', () => {
  let service: NgHeadlessPivotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgHeadlessPivotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
