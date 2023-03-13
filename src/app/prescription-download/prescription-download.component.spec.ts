import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionDownloadComponent } from './prescription-download.component';

describe('PrescriptionDownloadComponent', () => {
  let component: PrescriptionDownloadComponent;
  let fixture: ComponentFixture<PrescriptionDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionDownloadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
