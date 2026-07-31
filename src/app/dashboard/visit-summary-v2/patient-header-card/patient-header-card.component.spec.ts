import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHeaderCardComponent } from './patient-header-card.component';

describe('PatientHeaderCardComponent', () => {
  let component: PatientHeaderCardComponent;
  let fixture: ComponentFixture<PatientHeaderCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientHeaderCardComponent]
    });
    fixture = TestBed.createComponent(PatientHeaderCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
