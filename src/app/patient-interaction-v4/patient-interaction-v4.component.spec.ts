import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInteractionV4Component } from './patient-interaction-v4.component';

describe('PatientInteractionV4Component', () => {
  let component: PatientInteractionV4Component;
  let fixture: ComponentFixture<PatientInteractionV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientInteractionV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInteractionV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
