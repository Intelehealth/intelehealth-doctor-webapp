import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVisitPrescriptionComponent } from './view-visit-prescription.component';

describe('ViewVisitPrescriptionComponent', () => {
  let component: ViewVisitPrescriptionComponent;
  let fixture: ComponentFixture<ViewVisitPrescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewVisitPrescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewVisitPrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
