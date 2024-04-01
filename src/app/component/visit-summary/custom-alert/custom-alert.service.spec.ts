import { TestBed } from '@angular/core/testing';

import { CustomAlertService } from './custom-alert.service';

describe('CustomAlertService', () => {
  let service: CustomAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
