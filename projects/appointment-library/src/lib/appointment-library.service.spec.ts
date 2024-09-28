import { TestBed } from '@angular/core/testing';

import { AppointmentLibraryService } from './appointment-library.service';

describe('AppointmentLibraryService', () => {
  let service: AppointmentLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
