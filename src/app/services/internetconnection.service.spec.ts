import { TestBed } from '@angular/core/testing';

import { InternetconnectionService } from './internetconnection.service';

describe('InternetconnectionService', () => {
  let service: InternetconnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternetconnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
