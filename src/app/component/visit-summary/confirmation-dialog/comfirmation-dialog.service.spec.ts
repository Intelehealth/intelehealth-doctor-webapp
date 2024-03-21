import { TestBed } from '@angular/core/testing';

import { ComfirmationDialogService } from './comfirmation-dialog.service';

describe('ComfirmationDialogService', () => {
  let service: ComfirmationDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComfirmationDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
